class IssuesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  before_action :set_workspace
  before_action :set_project
  before_action :set_issue, only: [:show, :edit, :update, :destroy, :move]

  def show
  end

  def new
    @issue = @project.issues.build
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
  # PATCH /workspaces/:workspace_id/projects/:project_id/issues/:id/move
  # Endpoint para drag-and-drop do Kanban
  def move
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
      update_params[:project_id] = params[:new_project_id]
    end

    @issue.update!(update_params)

    old_status_name = IssueStatus.find_by(id: @issue.issue_status_id_before_last_save)&.name
    Activity.track(
      user: current_user,
      workspace: @workspace,
      trackable: @issue,
      action: "status_changed",
      metadata: { from: old_status_name, to: @issue.issue_status.name }
    )

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

  def issue_params
    params.require(:issue).permit(
      :title, :description, :issue_status_id, :assignee_id,
      :priority, :due_date, :start_date, :parent_id,
      :milestone_id, :position, label_ids: []
    )
  end
end
