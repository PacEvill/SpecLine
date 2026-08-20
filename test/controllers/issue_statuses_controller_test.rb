require "test_helper"

class IssueStatusesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @issue_status = issue_statuses(:one)
    sign_in @user
  end

  test "should get new" do
    get new_workspace_project_issue_status_url(@workspace, @project)
    assert_response :success
  end

  test "should create issue status" do
    assert_difference("IssueStatus.count") do
      post workspace_project_issue_statuses_url(@workspace, @project), params: {
        issue_status: { name: "Em Testes", category: "in_progress", color: "#8b5cf6" }
      }
    end
    assert_redirected_to workspace_project_url(@workspace, @project, view: "board", group_by: "board")
  end

  test "should get edit" do
    get edit_workspace_project_issue_status_url(@workspace, @project, @issue_status)
    assert_response :success
  end

  test "should update issue status" do
    patch workspace_project_issue_status_url(@workspace, @project, @issue_status), params: {
      issue_status: { name: "Nome Atualizado" }
    }
    assert_redirected_to workspace_project_url(@workspace, @project, view: "board", group_by: "board")
  end
end
