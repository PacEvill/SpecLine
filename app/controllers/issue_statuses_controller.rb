class IssueStatusesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :set_issue_status, only: %i[edit update destroy move]

  def new
    @issue_status = @project.issue_statuses.build(position: @project.issue_statuses.count)
  end

  def create
    @issue_status = @project.issue_statuses.build(issue_status_params)
    
    if @issue_status.save
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board"), notice: "Coluna criada com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @issue_status.update(issue_status_params)
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board"), notice: "Coluna atualizada."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    if @issue_status.issues.any?
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board"), alert: "Não é possível excluir uma coluna que contém tarefas. Mova as tarefas primeiro."
    else
      @issue_status.destroy
      redirect_to workspace_project_path(@workspace, @project, view: "board", group_by: "board"), notice: "Coluna excluída com sucesso."
    end
  end

  def move
    new_position = params[:position].to_i
    
    # Obter todas as colunas ordenadas (removendo a que está sendo movida)
    statuses = @project.issue_statuses.where.not(id: @issue_status.id).order(:position).to_a
    
    # Inserir a coluna na nova posição
    statuses.insert(new_position, @issue_status)
    
    # Atualizar todas as posições em sequência
    IssueStatus.transaction do
      statuses.each_with_index do |status, index|
        status.update_column(:position, index)
      end
    end
    
    head :ok
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def set_issue_status
    @issue_status = @project.issue_statuses.find(params[:id])
  end

  def issue_status_params
    params.require(:issue_status).permit(:name, :category, :color, :position)
  end
end
