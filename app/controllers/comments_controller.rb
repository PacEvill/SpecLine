class CommentsController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  before_action :set_workspace
  before_action :set_project
  before_action :set_issue

  def create
    @comment = @issue.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @issue,
        action: "commented",
        metadata: { body_preview: @comment.body.truncate(80) }
      )
      redirect_to workspace_project_issue_path(@workspace, @project, @issue),
                  notice: "Comentário adicionado."
    else
      redirect_to workspace_project_issue_path(@workspace, @project, @issue),
                  alert: "Comentário não pode ser vazio."
    end
  end

  def destroy
    @comment = @issue.comments.find(params[:id])
    @comment.destroy
    redirect_to workspace_project_issue_path(@workspace, @project, @issue),
                notice: "Comentário removido."
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def set_issue
    @issue = @project.issues.find(params[:issue_id])
  end

  def comment_params
    params.require(:comment).permit(:body)
  end
end
