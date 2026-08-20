require "test_helper"

class DocumentFeaturesSprintTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @document = documents(:one)
    sign_in @user
  end

  test "sprint: should export document as markdown file" do
    get export_workspace_project_document_url(@workspace, @project, @document)
    assert_response :success
    assert_equal "text/markdown; charset=utf-8", response.content_type
    assert_match(/attachment; filename=.+\.md/, response.headers["Content-Disposition"])
  end

  test "sprint: should duplicate document and redirect to new copy" do
    assert_difference("Document.count", 1) do
      post duplicate_workspace_project_document_url(@workspace, @project, @document)
    end
    new_doc = Document.order(:id).last
    assert_redirected_to workspace_project_document_url(@workspace, @project, new_doc)
    assert_includes new_doc.title, "Cópia"
  end
end
