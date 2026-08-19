class WorkspacesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace, only: %i[ show edit update destroy ]
  layout "app"

  def index
    @workspaces = current_user.workspaces
  end

  def show
    @view = params[:view].presence || "cards"
  end

  def new
    @workspace = current_user.workspaces.build
  end

  def edit
  end

  def create
    @workspace = current_user.workspaces.build(workspace_params)

    if @workspace.save
      redirect_to @workspace, notice: "Workspace criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @workspace.update(workspace_params)
      redirect_to @workspace, notice: "Workspace atualizado com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @workspace.destroy
    redirect_to workspaces_path, notice: "Workspace removido."
  end

  private

    def set_workspace
      @workspace = current_user.workspaces.find(params[:id])
    end

    def workspace_params
      params.require(:workspace).permit(:name, :description, :website, :color, :visibility, :timezone, :industry, :team_size, :company_number, :billing_email, :logo)
    end
end
