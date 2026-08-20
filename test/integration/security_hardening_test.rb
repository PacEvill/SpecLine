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
end
