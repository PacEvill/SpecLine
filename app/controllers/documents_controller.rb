class DocumentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :set_document, only: %i[ show edit update destroy duplicate export move ]
  layout "app"

  def index
    # Redirect to project show with documents view
    redirect_to workspace_project_path(@workspace, @project, view: "documents")
  end

  def show
    # Nested documents support
    @children = @document.children.ordered

    # We will build a sidebar showing the tree of documents in the project
    @root_documents = @project.documents.roots.ordered

    # Render the editor directly on show
    render :show
  end

  def new
    @document = @project.documents.build(parent_id: params[:parent_id], is_folder: params[:is_folder] == "true")
    @document.icon = "📁" if @document.is_folder?
  end

  def edit
    # Redireciona para o show, já que o show agora é o editor ativo
    redirect_to workspace_project_document_path(@workspace, @project, @document)
  end

  def create
    @document = @project.documents.build(document_params)
    @document.workspace = @workspace
    @document.author = current_user
    @document.icon = "📁" if @document.is_folder? && @document.icon.blank?

    if @document.save
      redirect_to workspace_project_document_path(@workspace, @project, @document)
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @document.update(document_params)
      respond_to do |format|
        format.html { redirect_to workspace_project_document_path(@workspace, @project, @document) }
        format.json { render json: { status: "success", id: @document.id } }
      end
    else
      respond_to do |format|
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
  end

  def move
    parent_id = params[:parent_id].presence
    position = params[:position].to_i

    if parent_id.present?
      if parent_id.to_s == @document.id.to_s || @document.descendant_ids.map(&:to_s).include?(parent_id.to_s)
        return render json: { status: "error", message: "Não é permitido mover um item para dentro de si mesmo ou de suas sub-pastas." }, status: :unprocessable_entity
      end
    end

    if @document.update(parent_id: parent_id, position: position)
      respond_to do |format|
        format.html { redirect_to workspace_project_document_path(@workspace, @project, @document), notice: "Documento movido com sucesso." }
        format.json { render json: { status: "success", id: @document.id, parent_id: @document.parent_id, position: @document.position } }
      end
    else
      respond_to do |format|
        format.html { redirect_to workspace_project_document_path(@workspace, @project, @document), alert: "Erro ao mover documento." }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
  end

  def duplicate
    @copy = @document.duplicate!(author: current_user)
    redirect_to workspace_project_document_path(@workspace, @project, @copy), notice: "Documento duplicado com sucesso."
  end

  def export
    markdown_content = @document.to_markdown
    filename = "#{@document.title.parameterize.presence || 'documento'}.md"
    send_data markdown_content, filename: filename, type: "text/markdown; charset=utf-8", disposition: "attachment"
  end

  def destroy
    parent_id = @document.parent_id
    @document.destroy

    if parent_id
      redirect_to workspace_project_document_path(@workspace, @project, parent_id), notice: "Documento excluído."
    else
      redirect_to workspace_project_path(@workspace, @project, view: "documents"), notice: "Documento excluído."
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
      params.require(:document).permit(:title, :content, :parent_id, :icon, :cover_image, :is_folder, :position)
    end
end
