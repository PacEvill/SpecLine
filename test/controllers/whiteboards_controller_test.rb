require "test_helper"

class WhiteboardsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @whiteboard = whiteboards(:one)
    sign_in @user
  end

  test "should get index" do
    get workspace_project_whiteboards_path(@workspace, @project)
    assert_response :success
  end

  test "should get show" do
    get workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    assert_response :success
  end

  test "should get new" do
    get new_workspace_project_whiteboard_path(@workspace, @project)
    assert_response :success
  end

  test "should get edit" do
    get edit_workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    assert_response :success
  end

  test "should export json" do
    get export_json_workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    assert_response :success
  end

  test "should export svg" do
    get export_svg_workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    assert_response :success
  end

  test "should create whiteboard" do
    assert_difference("Whiteboard.count", 1) do
      post workspace_project_whiteboards_path(@workspace, @project), params: {
        whiteboard: {
          title: "Novo Diagrama de Rede",
          mode: "hybrid",
          description: "Teste de criação"
        }
      }
    end
    assert_redirected_to workspace_project_whiteboard_path(@workspace, @project, Whiteboard.last)
  end

  test "should update whiteboard via JSON" do
    patch workspace_project_whiteboard_path(@workspace, @project, @whiteboard),
          params: { whiteboard: { content: '{"elements":[{"id":"test"}]}' } },
          as: :json
    assert_response :success
    assert_equal '{"elements":[{"id":"test"}]}', @whiteboard.reload.content
  end

  test "should duplicate whiteboard" do
    assert_difference("Whiteboard.count", 1) do
      post duplicate_workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    end
    assert_redirected_to workspace_project_whiteboard_path(@workspace, @project, Whiteboard.last)
  end

  test "should destroy whiteboard" do
    assert_difference("Whiteboard.count", -1) do
      delete workspace_project_whiteboard_path(@workspace, @project, @whiteboard)
    end
    assert_redirected_to workspace_project_whiteboards_path(@workspace, @project)
  end
end
