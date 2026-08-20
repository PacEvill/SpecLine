require "test_helper"

class VscodeExplorerTreeSprintTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @doc1 = documents(:one)
    @doc2 = documents(:two)
    sign_in @user
  end

  test "sprint: prevents moving a document into its own descendant to prevent cyclic tree" do
    # Make doc2 a child of doc1
    @doc2.update!(parent_id: @doc1.id)

    # Attempt to make doc1 a child of doc2 (invalid cycle)
    patch move_workspace_project_document_url(@workspace, @project, @doc1),
          params: { parent_id: @doc2.id, position: 0 },
          as: :json

    assert_response :unprocessable_entity
    response_json = JSON.parse(response.body)
    assert_includes response_json["message"], "sub-pastas"
  end

  test "sprint: reorders sibling documents with position" do
    patch move_workspace_project_document_url(@workspace, @project, @doc1),
          params: { parent_id: nil, position: 5 },
          as: :json

    assert_response :success
    @doc1.reload
    assert_equal 5, @doc1.position
  end

  test "sprint: folder document renders successfully and identifies as folder" do
    folder = @project.documents.create!(
      workspace: @workspace,
      author: @user,
      title: "Sprint Docs Folder",
      is_folder: true,
      icon: "📁"
    )

    get workspace_project_document_url(@workspace, @project, folder)
    assert_response :success
    assert_select "h1, textarea, h2", text: /Sprint Docs Folder/
  end

  test "sprint: moves sub-document from one folder/document to another parent" do
    parent_a = @project.documents.create!(workspace: @workspace, author: @user, title: "Parent A", is_folder: true)
    parent_b = @project.documents.create!(workspace: @workspace, author: @user, title: "Parent B", is_folder: false)
    child = @project.documents.create!(workspace: @workspace, author: @user, title: "Child Doc", parent_id: parent_a.id)

    patch move_workspace_project_document_url(@workspace, @project, child),
          params: { parent_id: parent_b.id, position: 2 },
          as: :json

    assert_response :success
    child.reload
    assert_equal parent_b.id, child.parent_id
    assert_equal 2, child.position
  end
end
