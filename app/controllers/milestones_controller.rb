class MilestonesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  before_action :set_workspace
  before_action :set_project
  before_action :set_milestone, only: [:edit, :update, :destroy]

  def index
    @milestones = @project.milestones.ordered
  end

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

  def milestone_params
    params.require(:milestone).permit(:title, :description, :status, :start_date, :target_date)
  end
end
