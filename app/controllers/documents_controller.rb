class DocumentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :set_document, only: %i[ show edit update destroy ]
  layout "app"

  def index
    # Redirect to project show with documents view
    redirect_to workspace_project_path(@workspace, @project, view: 'documents')
  end

  def show
    # Nested documents support
    @children = @document.children.ordered
    
    # We will build a sidebar showing the tree of documents in the project
    @root_documents = @project.documents.roots.ordered
  end

  def new
    @document = @project.documents.build(parent_id: params[:parent_id])
  end

  def edit
  end

  def create
    @document = @project.documents.build(document_params)
    @document.workspace = @workspace
    @document.author = current_user

    if @document.save
      redirect_to workspace_project_document_path(@workspace, @project, @document), notice: "Documento criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @document.update(document_params)
      redirect_to workspace_project_document_path(@workspace, @project, @document), notice: "Documento atualizado."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    parent_id = @document.parent_id
    @document.destroy
    
    if parent_id
      redirect_to workspace_project_document_path(@workspace, @project, parent_id), notice: "Documento excluído."
    else
      redirect_to workspace_project_path(@workspace, @project, view: 'documents'), notice: "Documento excluído."
    end
  end

  private

    def set_workspace
      @workspace = current_user.workspaces.find(params[:workspace_id])
    end

    def set_project
      @project = @workspace.projects.find(params[:project_id])
    end

    def set_document
      @document = @project.documents.find(params[:id])
    end

    def document_params
      params.require(:document).permit(:title, :content, :parent_id, :icon)
    end
end
