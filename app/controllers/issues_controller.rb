class IssuesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  before_action :set_workspace
  before_action :set_project
  before_action :set_issue, only: [ :show, :edit, :update, :destroy, :move ]
  before_action :prepare_project_context, only: [ :new, :edit, :create, :update ]

  def show
  end

  def new
    @issue = @project.issues.build
    @issue.title = params[:title] if params[:title].present?
    @issue.description = params[:description] if params[:description].present?
    @issue.issue_status_id = params[:issue_status_id] if params[:issue_status_id].present?
  end

  def create
    @issue = @project.issues.build(issue_params)
    @issue.creator = current_user
    @issue.issue_status ||= @project.default_status

    if @issue.save
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @issue,
        action: "issue_created",
        metadata: { title: @issue.title, identifier: @issue.identifier }
      )
      redirect_to workspace_project_path(@workspace, @project, anchor: "issue-#{@issue.id}"),
                  notice: "#{@issue.identifier} criada com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    old_status = @issue.issue_status&.name
    old_assignee = @issue.assignee&.email

    if @issue.update(issue_params)
      # Track status changes
      if @issue.saved_change_to_issue_status_id?
        Activity.track(
          user: current_user,
          workspace: @workspace,
          trackable: @issue,
          action: "status_changed",
          metadata: { from: old_status, to: @issue.issue_status.name }
        )
      end

      # Track assignee changes
      if @issue.saved_change_to_assignee_id?
        Activity.track(
          user: current_user,
          workspace: @workspace,
          trackable: @issue,
          action: "assignee_changed",
          metadata: { from: old_assignee, to: @issue.assignee&.email }
        )
      end

      redirect_to workspace_project_path(@workspace, @project), notice: "Issue atualizada com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    identifier = @issue.identifier
    @issue.destroy
    redirect_to workspace_project_path(@workspace, @project),
                notice: "#{identifier} excluída."
  end

  # PATCH /workspaces/:workspace_id/projects/:project_id/issues/:id/move
  # Endpoint para drag-and-drop do Kanban
  def move
    old_status_id = @issue.issue_status_id
    old_status_name = @issue.issue_status&.name

    update_params = {
      issue_status_id: params[:status_id],
      position: params[:position].to_f
    }

    if params.has_key?(:assignee_id)
      update_params[:assignee_id] = params[:assignee_id].presence
    end

    if params.has_key?(:board_id)
      update_params[:board_id] = params[:board_id].presence
    end

    if params[:new_project_id].present? && params[:new_project_id] != @project.id.to_s
      # Escopo multi-tenant: o destino precisa ser um projeto do MESMO workspace
      new_project = @workspace.projects.find(params[:new_project_id])
      update_params[:project_id] = new_project.id
    end

    if update_params[:board_id].present?
      target_project = update_params[:project_id] ? Project.find(update_params[:project_id]) : @project
      unless Board.exists?(id: update_params[:board_id], project_id: target_project.id)
        raise ActiveRecord::RecordNotFound, "Quadro não pertence ao projeto de destino"
      end
    end

    @issue.update!(update_params)

    if @issue.issue_status_id != old_status_id
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @issue,
        action: "status_changed",
        metadata: { from: old_status_name, to: @issue.issue_status.name }
      )
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

  def set_issue
    @issue = @project.issues.find(params[:id])
  end

  def prepare_project_context
    return if turbo_frame_request?
    @statuses = @project.issue_statuses.ordered
    @issues = @project.issues.includes(:issue_status, :assignee, :labels, :creator).ordered
    @milestones = @project.milestones.ordered
    @documents = @project.documents.roots.ordered
    @whiteboards = @project.whiteboards.ordered
    @recent_documents = @project.documents.order(updated_at: :desc).limit(6)
    @recent_whiteboards = @project.whiteboards.order(updated_at: :desc).limit(4)
    @recent_activities = @workspace.activities.order(created_at: :desc).limit(8)

    total_issues = @issues.count
    done_issues = @issues.select { |i| i.issue_status&.category == "done" }.count
    @completion_rate = total_issues > 0 ? ((done_issues.to_f / total_issues) * 100).round : 0
    @view = "overview"
  end

  def issue_params
    permitted = params.require(:issue).permit(
      :title, :description, :issue_status_id, :assignee_id,
      :priority, :due_date, :start_date, :parent_id,
      :milestone_id, :position, label_ids: []
    )
    scope_issue_references!(permitted)
    permitted
  end

  # Escopo multi-tenant: referências de outro projeto/workspace são descartadas
  def scope_issue_references!(permitted)
    if permitted[:label_ids].present?
      permitted[:label_ids] = permitted[:label_ids] & @workspace.labels.pluck(:id).map(&:to_s)
    end

    if permitted[:milestone_id].present? && !@project.milestones.exists?(id: permitted[:milestone_id])
      permitted[:milestone_id] = nil
    end

    if permitted[:parent_id].present?
      parent = @project.issues.find_by(id: permitted[:parent_id])
      if parent.nil? || parent.id == @issue.try(:id)
        permitted[:parent_id] = nil
      end
    end
  end
end
