require "test_helper"

class LabelsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @label = labels(:one)
    sign_in @user
  end

  test "should get new" do
    get new_workspace_label_url(@workspace)
    assert_response :success
  end

  test "should create label" do
    assert_difference("Label.count") do
      post workspace_labels_url(@workspace), params: { label: { name: "Frontend", color: "#3b82f6" } }
    end
    assert_redirected_to workspace_url(@workspace)
  end

  test "should get edit" do
    get edit_workspace_label_url(@workspace, @label)
    assert_response :success
  end

  test "should update label" do
    patch workspace_label_url(@workspace, @label), params: { label: { name: "Backend" } }
    assert_redirected_to workspace_url(@workspace)
  end

  test "should destroy label" do
    assert_difference("Label.count", -1) do
      delete workspace_label_url(@workspace, @label)
    end
    assert_redirected_to workspace_url(@workspace)
  end
end
