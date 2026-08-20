class BoardsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :prepare_project_context, only: [:new, :edit]

  def new
    @board = @project.boards.build
  end

  def create
    @board = @project.boards.build(board_params)
    if @board.save
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @board = @project.boards.find(params[:id])
  end

  def update
    @board = @project.boards.find(params[:id])
    if @board.update(board_params)
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @board = @project.boards.find(params[:id])
    @board.destroy
    redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board")
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def prepare_project_context
    return if turbo_frame_request?
    @statuses = @project.issue_statuses.ordered
    @issues = @project.issues.includes(:issue_status, :assignee, :labels, :creator).ordered
    @milestones = @project.milestones.ordered
    @documents = @project.documents.roots.ordered
    @whiteboards = @project.whiteboards.ordered
    @recent_documents = @project.documents.order(updated_at: :desc).limit(6)
    @recent_whiteboards = @project.whiteboards.order(updated_at: :desc).limit(4)
    @recent_activities = @workspace.activities.order(created_at: :desc).limit(8)
    
    total_issues = @issues.count
    done_issues = @issues.select { |i| i.issue_status&.category == "done" }.count
    @completion_rate = total_issues > 0 ? ((done_issues.to_f / total_issues) * 100).round : 0
    @view = "overview"
  end

  def board_params
    params.require(:board).permit(:name, :description)
  end
end
