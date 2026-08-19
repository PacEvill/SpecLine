class ProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project, only: %i[ show edit update destroy ]
  layout "app"

  def index
    @projects = @workspace.projects
  end

  def show
    @statuses = @project.issue_statuses.ordered
    @issues = @project.issues.includes(:issue_status, :assignee, :labels, :creator).ordered
    @milestones = @project.milestones.ordered
    @documents = @project.documents.roots.ordered
    @view = params[:view] || @project.default_view || "board"
  end

  def new
    @project = @workspace.projects.build
  end

  def edit
  end

  def create
    @project = @workspace.projects.build(project_params)
    @project.status ||= "Em Andamento"
    @project.progress ||= 0

    if @project.save
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @project,
        action: "project_created",
        metadata: { name: @project.name }
      )
      redirect_to workspace_project_path(@workspace, @project), notice: "Projeto criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @project.update(project_params)
      redirect_to workspace_project_path(@workspace, @project), notice: "Projeto atualizado."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @project.destroy
    redirect_to @workspace, notice: "Projeto removido."
  end

  private

    def set_workspace
      @workspace = current_user.workspaces.find(params[:workspace_id])
    end

    def set_project
      @project = @workspace.projects.find(params[:id])
    end

    def project_params
      params.require(:project).permit(:name, :description, :deadline, :progress, :status, :identifier_prefix, :default_view, :logo)
    end
end
