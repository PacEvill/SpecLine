class SearchController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  def index
    @query = params[:q].to_s.strip
    workspace_ids = current_user.workspaces.pluck(:id)
    project_ids = Project.where(workspace_id: workspace_ids).pluck(:id)

    if @query.present?
      sanitized = "%#{@query}%"

      @projects = Project.where(workspace_id: workspace_ids)
                         .where("name LIKE :q OR description LIKE :q OR identifier_prefix LIKE :q", q: sanitized)
                         .limit(8)

      @issues = Issue.where(project_id: project_ids)
                     .where("title LIKE :q OR description LIKE :q OR identifier LIKE :q", q: sanitized)
                     .includes(:project, :issue_status, :assignee)
                     .limit(15)

      @documents = Document.where(workspace_id: workspace_ids)
                           .where("title LIKE :q OR content LIKE :q", q: sanitized)
                           .includes(:project, :workspace)
                           .limit(10)

      @whiteboards = Whiteboard.where(project_id: project_ids)
                               .where("title LIKE :q OR description LIKE :q", q: sanitized)
                               .includes(:project, :workspace)
                               .limit(8)
    else
      @projects = Project.where(workspace_id: workspace_ids).order(updated_at: :desc).limit(4)
      @issues = Issue.where(project_id: project_ids).order(updated_at: :desc).includes(:project, :issue_status).limit(5)
      @documents = Document.where(workspace_id: workspace_ids).order(updated_at: :desc).includes(:project, :workspace).limit(5)
      @whiteboards = Whiteboard.where(project_id: project_ids).order(updated_at: :desc).includes(:project, :workspace).limit(5)
    end

    respond_to do |format|
      format.html
      format.json do
        render json: {
          projects: @projects.map { |p| { id: p.id, name: p.name, prefix: p.identifier_prefix, url: workspace_project_path(p.workspace, p) } },
          issues: @issues.map { |i| { id: i.id, identifier: i.identifier, title: i.title, status: i.issue_status.name, url: workspace_project_issue_path(i.project.workspace, i.project, i) } },
          documents: @documents.map { |d| { id: d.id, title: d.title, icon: d.icon.presence || "📄", project: d.project&.name, url: workspace_project_document_path(d.workspace, d.project, d) } },
          whiteboards: @whiteboards.map { |w| { id: w.id, title: w.title, project: w.project.name, url: workspace_project_whiteboard_path(w.workspace, w.project, w) } }
        }
      end
    end
  end
end
