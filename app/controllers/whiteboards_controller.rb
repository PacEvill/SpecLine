class WhiteboardsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :set_whiteboard, only: %i[ show edit update destroy duplicate export_json export_svg ]
  layout "app"

  def index
    @whiteboards = @project.whiteboards.ordered

    if params[:q].present?
      @whiteboards = @whiteboards.where("LOWER(title) LIKE ?", "%#{params[:q].downcase}%")
    end
  end

  def show
    @all_whiteboards = @project.whiteboards.ordered
    render :show
  end

  def new
    @whiteboard = @project.whiteboards.build(mode: "hybrid")
    apply_template(params[:template]) if params[:template].present?
  end

  def create
    @whiteboard = @project.whiteboards.build(whiteboard_params)
    @whiteboard.workspace = @workspace
    @whiteboard.user = current_user

    if @whiteboard.save
      redirect_to workspace_project_whiteboard_path(@workspace, @project, @whiteboard), notice: "Quadro criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    render :edit
  end

  def update
    if @whiteboard.update(whiteboard_params)
      respond_to do |format|
        format.html { redirect_to workspace_project_whiteboard_path(@workspace, @project, @whiteboard), notice: "Quadro atualizado com sucesso." }
        format.json { render json: { status: "success", id: @whiteboard.id, updated_at: @whiteboard.updated_at.iso8601 } }
      end
    else
      respond_to do |format|
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @whiteboard.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @whiteboard.destroy
    redirect_to workspace_project_whiteboards_path(@workspace, @project), notice: "Quadro excluído com sucesso."
  end

  def duplicate
    duplicated = @whiteboard.dup
    duplicated.title = "#{@whiteboard.title} (Cópia)"
    duplicated.user = current_user

    if duplicated.save
      redirect_to workspace_project_whiteboard_path(@workspace, @project, duplicated), notice: "Quadro duplicado com sucesso."
    else
      redirect_to workspace_project_whiteboards_path(@workspace, @project), alert: "Não foi possível duplicar o quadro."
    end
  end

  def export_json
    send_data @whiteboard.content.presence || "{}",
              filename: "#{@whiteboard.title.parameterize}-spec.json",
              type: "application/json"
  end

  def export_svg
    send_data @whiteboard.mermaid_code.presence || "",
              filename: "#{@whiteboard.title.parameterize}-diagram.mmd",
              type: "text/plain"
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find_by(id: params[:workspace_id]) || Workspace.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def set_whiteboard
    @whiteboard = @project.whiteboards.find(params[:id])
  end

  def whiteboard_params
    params.require(:whiteboard).permit(:title, :description, :content, :mermaid_code, :mode, :icon, :cover_image, :position)
  end

  def apply_template(template_name)
    case template_name
    when "architecture"
      @whiteboard.title = "Arquitetura do Sistema"
      @whiteboard.icon = "architecture"
      @whiteboard.mermaid_code = <<~MERMAID
        graph TD
          Client["Cliente Web / Mobile"] --> Gateway["API Gateway / Proxy"]
          Gateway --> Auth["Serviço de Autenticação"]
          Gateway --> Core["SpecLine Core API"]
          Core --> DB[("PostgreSQL Database")]
          Core --> Cache[("Redis Cache / Store")]
          Core --> Storage["Cloud Object Storage"]
      MERMAID
      @whiteboard.content = {
        elements: [
          { id: "arch-1", type: "mermaid", x: 120, y: 80, width: 560, height: 380, code: @whiteboard.mermaid_code.strip },
          { id: "note-1", type: "sticky", x: 720, y: 100, width: 200, height: 160, text: "Decisão de Arquitetura:\nGateway gerencia rate limit e CORS centralizado.", fill: "#FEF08A" },
          { id: "note-2", type: "sticky", x: 720, y: 290, width: 200, height: 160, text: "Cache Redis:\nArmazena sessões JWT ativas e contadores rápidos.", fill: "#BAE6FD" }
        ],
        viewport: { zoom: 1, scrollX: 0, scrollY: 0 }
      }.to_json
    when "sequence"
      @whiteboard.title = "Fluxo de Autenticação"
      @whiteboard.icon = "sequence"
      @whiteboard.mermaid_code = <<~MERMAID
        sequenceDiagram
          autonumber
          actor User as Usuario
          participant App as Frontend
          participant Server as Backend API
          participant DB as Banco de Dados

          User->>App: Clica em Entrar
          App->>Server: POST /login (email, senha)
          Server->>DB: Verifica credenciais
          DB-->>Server: Usuário válido
          Server-->>App: Retorna JWT Token
          App-->>User: Redireciona para o Workspace
      MERMAID
      @whiteboard.content = {
        elements: [
          { id: "seq-1", type: "mermaid", x: 100, y: 80, width: 620, height: 420, code: @whiteboard.mermaid_code.strip },
          { id: "stamp-1", type: "stamp", x: 740, y: 120, width: 48, height: 48, emoji: "🔒" },
          { id: "note-1", type: "sticky", x: 740, y: 180, width: 200, height: 160, text: "Regra de Segurança:\nTokens expiram a cada 24h com refresh token rotativo.", fill: "#BBF7D0" }
        ],
        viewport: { zoom: 1, scrollX: 0, scrollY: 0 }
      }.to_json
    when "brainstorm"
      @whiteboard.title = "Ideação & Levantamento de Requisitos"
      @whiteboard.icon = "brainstorm"
      @whiteboard.content = {
        elements: [
          { id: "frame-1", type: "frame", x: 60, y: 60, width: 500, height: 380, text: "Ideias para o Próximo Release" },
          { id: "bs-1", type: "sticky", x: 90, y: 120, width: 180, height: 140, text: "Exportação em PDF das especificações", fill: "#FEF08A" },
          { id: "bs-2", type: "sticky", x: 300, y: 120, width: 180, height: 140, text: "Notificações em tempo real com Turbo Streams", fill: "#BAE6FD" },
          { id: "bs-3", type: "sticky", x: 90, y: 280, width: 180, height: 140, text: "Modo escuro persistente no perfil", fill: "#BBF7D0" },
          { id: "bs-4", type: "sticky", x: 300, y: 280, width: 180, height: 140, text: "Suporte a imagens coladas no editor", fill: "#FECDD3" },
          { id: "stamp-1", type: "stamp", x: 230, y: 220, width: 44, height: 44, emoji: "🚀" }
        ],
        viewport: { zoom: 1, scrollX: 0, scrollY: 0 }
      }.to_json
    when "er_diagram"
      @whiteboard.title = "Modelo de Banco de Dados"
      @whiteboard.icon = "er_diagram"
      @whiteboard.mermaid_code = <<~MERMAID
        erDiagram
          WORKSPACE ||--o{ PROJECT : contains
          PROJECT ||--o{ DOCUMENT : has
          PROJECT ||--o{ WHITEBOARD : includes
          PROJECT ||--o{ ISSUE : tracks
          USER ||--o{ WHITEBOARD : creates
      MERMAID
      @whiteboard.content = {
        elements: [
          { id: "er-1", type: "mermaid", x: 120, y: 80, width: 560, height: 360, code: @whiteboard.mermaid_code.strip },
          { id: "note-1", type: "sticky", x: 710, y: 110, width: 210, height: 160, text: "Integridade Referencial:\nTodos os relacionamentos possuem onDelete: CASCADE.", fill: "#E9D5FF" }
        ],
        viewport: { zoom: 1, scrollX: 0, scrollY: 0 }
      }.to_json
    end
  end
end
