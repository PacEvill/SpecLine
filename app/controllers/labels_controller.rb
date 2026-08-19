class LabelsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_label, only: %i[edit update destroy]

  def new
    @label = @workspace.labels.build
  end

  def create
    @label = @workspace.labels.build(label_params)
    if @label.save
      redirect_to workspace_path(@workspace), notice: "Tag cadastrada com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @label.update(label_params)
      redirect_to workspace_path(@workspace), notice: "Tag atualizada com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @label.destroy
    redirect_to workspace_path(@workspace), notice: "Tag excluída com sucesso."
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_label
    @label = @workspace.labels.find(params[:id])
  end

  def label_params
    params.require(:label).permit(:name, :color)
  end
end
