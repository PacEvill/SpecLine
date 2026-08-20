require "test_helper"

class MilestonesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @milestone = milestones(:one)
    sign_in @user
  end

  test "should get new" do
    get new_workspace_project_milestone_url(@workspace, @project)
    assert_response :success
  end

  test "should create milestone" do
    assert_difference("Milestone.count") do
      post workspace_project_milestones_url(@workspace, @project), params: { milestone: { title: "New Milestone", description: "Desc", status: "open", start_date: Date.today, target_date: Date.today + 7 } }
    end

    assert_redirected_to workspace_project_path(@workspace, @project, view: "milestones")
  end

  test "should get edit" do
    get edit_workspace_project_milestone_url(@workspace, @project, @milestone)
    assert_response :success
  end

  test "should update milestone" do
    patch workspace_project_milestone_url(@workspace, @project, @milestone), params: { milestone: { title: "Updated" } }
    assert_redirected_to workspace_project_path(@workspace, @project, view: "milestones")
    @milestone.reload
    assert_equal "Updated", @milestone.title
  end

  test "should destroy milestone" do
    assert_difference("Milestone.count", -1) do
      delete workspace_project_milestone_url(@workspace, @project, @milestone)
    end

    assert_redirected_to workspace_project_path(@workspace, @project, view: "milestones")
  end
end
