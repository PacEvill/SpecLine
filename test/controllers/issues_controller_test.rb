require "test_helper"

class IssuesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @issue = issues(:one)
    @status = issue_statuses(:one)
    sign_in @user
  end

  test "should get new" do
    get new_workspace_project_issue_url(@workspace, @project)
    assert_response :success
  end

  test "should create issue" do
    assert_difference("Issue.count") do
      post workspace_project_issues_url(@workspace, @project), params: { issue: { title: "New Issue", description: "Desc", issue_status_id: @status.id } }
    end

    assert_redirected_to workspace_project_path(@workspace, @project, anchor: "issue-#{Issue.last.id}")
  end

  test "should get show" do
    get workspace_project_issue_url(@workspace, @project, @issue)
    assert_response :success
  end

  test "should get edit" do
    get edit_workspace_project_issue_url(@workspace, @project, @issue)
    assert_response :success
  end

  test "should update issue" do
    patch workspace_project_issue_url(@workspace, @project, @issue), params: { issue: { title: "Updated Title" } }
    assert_redirected_to workspace_project_path(@workspace, @project)
    @issue.reload
    assert_equal "Updated Title", @issue.title
  end

  test "should destroy issue" do
    assert_difference("Issue.count", -1) do
      delete workspace_project_issue_url(@workspace, @project, @issue)
    end

    assert_redirected_to workspace_project_path(@workspace, @project)
  end

  test "should move issue via drag and drop" do
    new_status = issue_statuses(:two)
    patch move_workspace_project_issue_url(@workspace, @project, @issue), params: { status_id: new_status.id, position: 5.5 }
    assert_response :success
    @issue.reload
    assert_equal new_status.id, @issue.issue_status_id
    assert_equal 5.5, @issue.position
  end
end
