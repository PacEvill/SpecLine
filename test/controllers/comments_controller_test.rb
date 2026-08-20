require "test_helper"

class CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @issue = issues(:one)
    @comment = comments(:one)
    sign_in @user
  end

  test "should create comment" do
    assert_difference("Comment.count") do
      post workspace_project_issue_comments_url(@workspace, @project, @issue), params: { comment: { body: "New Comment" } }
    end

    assert_redirected_to workspace_project_issue_path(@workspace, @project, @issue)
    assert_equal "Comentário adicionado.", flash[:notice]
  end

  test "should not create empty comment" do
    assert_no_difference("Comment.count") do
      post workspace_project_issue_comments_url(@workspace, @project, @issue), params: { comment: { body: "" } }
    end

    assert_redirected_to workspace_project_issue_path(@workspace, @project, @issue)
    assert_equal "Comentário não pode ser vazio.", flash[:alert]
  end

  test "should destroy comment" do
    assert_difference("Comment.count", -1) do
      delete workspace_project_issue_comment_url(@workspace, @project, @issue, @comment)
    end

    assert_redirected_to workspace_project_issue_path(@workspace, @project, @issue)
    assert_equal "Comentário removido.", flash[:notice]
  end
end
