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

  test "move não deve transferir tarefa para projeto de outro workspace" do
    patch move_workspace_project_issue_url(@workspace, @project, @issue), params: { status_id: @status.id, position: 0, new_project_id: projects(:two).id }
    assert_response :not_found
    assert_equal projects(:one).id, @issue.reload.project_id
  end

  test "move não deve aceitar quadro de outro projeto" do
    other_board = Board.create!(project: projects(:two), name: "Board alheio")
    patch move_workspace_project_issue_url(@workspace, @project, @issue), params: { status_id: @status.id, position: 0, board_id: other_board.id }
    assert_response :not_found
    assert_nil @issue.reload.board_id
  end

  test "não deve etiquetar tarefa com label de outro workspace" do
    foreign_label = Label.create!(workspace: workspaces(:two), name: "Alheia", color: "#FF0000")
    post workspace_project_issues_url(@workspace, @project), params: { issue: { title: "Com label alheia", issue_status_id: @status.id, label_ids: [foreign_label.id] } }
    created = Issue.find_by!(title: "Com label alheia")
    assert_empty created.labels
  end

  test "não deve atribuir milestone de outro projeto" do
    foreign = milestones(:two)
    put workspace_project_issue_url(@workspace, @project, @issue), params: { issue: { milestone_id: foreign.id } }
    assert_nil @issue.reload.milestone_id
  end
end