class BoardsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project

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

  def board_params
    params.require(:board).permit(:name, :description)
  end
end
