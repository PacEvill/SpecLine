require "test_helper"

class BoardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @board = boards(:one)
    sign_in @user
  end

  test "should get new" do
    get new_workspace_project_board_url(@workspace, @project)
    assert_response :success
  end

  test "should create board" do
    assert_difference("Board.count") do
      post workspace_project_boards_url(@workspace, @project), params: { board: { name: "New Board", description: "Desc" } }
    end

    assert_redirected_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
  end

  test "should get edit" do
    get edit_workspace_project_board_url(@workspace, @project, @board)
    assert_response :success
  end

  test "should update board" do
    patch workspace_project_board_url(@workspace, @project, @board), params: { board: { name: "Updated" } }
    assert_redirected_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
    @board.reload
    assert_equal "Updated", @board.name
  end

  test "should destroy board" do
    assert_difference("Board.count", -1) do
      delete workspace_project_board_url(@workspace, @project, @board)
    end

    assert_redirected_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
  end
end
