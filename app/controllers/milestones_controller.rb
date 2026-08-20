class MilestonesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  before_action :set_workspace
  before_action :set_project
  before_action :set_milestone, only: [:edit, :update, :destroy]
  before_action :prepare_project_context, only: [:new, :edit, :create, :update]

  def new
    @milestone = @project.milestones.build
  end

  def create
    @milestone = @project.milestones.build(milestone_params)
    
    if @milestone.save
      redirect_to workspace_project_path(@workspace, @project, view: "milestones"), notice: "Milestone criada com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @milestone.update(milestone_params)
      redirect_to workspace_project_path(@workspace, @project, view: "milestones"), notice: "Milestone atualizada."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @milestone.destroy
    redirect_to workspace_project_path(@workspace, @project, view: "milestones"), notice: "Milestone excluída."
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def set_milestone
    @milestone = @project.milestones.find(params[:id])
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

  def milestone_params
    params.require(:milestone).permit(:title, :description, :target_date, :status)
  end
end
