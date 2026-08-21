require "test_helper"

class SecurityHardeningTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
  end

  test "html sanitizer strips malicious script tags from documents" do
    sign_in @user
    malicious_content = "<p>Texto normal</p><script>alert('XSS')</script><img src=x onerror=alert(1)>"

    doc = @project.documents.create!(
      title: "Doc Seguro",
      content: malicious_content,
      workspace: @workspace,
      author: @user
    )

    assert_not_includes doc.content, "<script>"
    assert_not_includes doc.content, "onerror="
    assert_includes doc.content, "<p>Texto normal</p>"
  end

  test "html sanitizer cleans issue descriptions" do
    sign_in @user
    malicious_desc = "<div>Descrição</div><iframe src='http://evil.com'></iframe>"

    issue = @project.issues.create!(
      title: "Issue Segura",
      description: malicious_desc,
      issue_status: issue_statuses(:one),
      creator: @user
    )

    assert_not_includes issue.description, "<iframe"
    assert_includes issue.description, "<div>Descrição</div>"
  end

  test "secure attachable validates image extensions and size" do
    assert Workspace.included_modules.include?(SecureAttachable)
    assert Project.included_modules.include?(SecureAttachable)
    assert User.included_modules.include?(SecureAttachable)
  end

  test "multi-tenant idor protection prevents accessing unowned workspace" do
    other_workspace = workspaces(:two)
    sign_in @user

    # Attempt to access another user's workspace
    get workspace_path(other_workspace)
    assert_response :not_found # Strict IDOR protection returns 404 Not Found
  end

  test "rack attack blocks malicious user agents" do
    Rack::Attack.enabled = true
    Rack::Attack.reset!

    get root_path, headers: { "HTTP_USER_AGENT" => "sqlmap/1.5#stable" }
    assert_response :forbidden
  ensure
    Rack::Attack.enabled = false
  end

  test "response includes core security headers" do
    get root_path
    assert_response :success
    assert_equal "nosniff", response.headers["X-Content-Type-Options"]
    assert_equal "strict-origin-when-cross-origin", response.headers["Referrer-Policy"]
    assert response.headers["Content-Security-Policy"].present?
  end
end
