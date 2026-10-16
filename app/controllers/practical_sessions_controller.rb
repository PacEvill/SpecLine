class PracticalSessionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_workspace
  before_action :set_project
  before_action :set_practical_session, only: %i[ show edit update destroy check_in ]
  layout "app"

  def show
    # Renders official printable/viewable practical session certificate/pass
  end

  def new
    @practical_session = @project.practical_sessions.build(
      scheduled_at: Time.current.change(min: 0) + 1.hour,
      ends_at: Time.current.change(min: 0) + 2.hours,
      status: "scheduled"
    )
  end

  def edit
  end

  def create
    @practical_session = @project.practical_sessions.build(practical_session_params)
    @practical_session.user ||= current_user

    if @practical_session.save
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @practical_session,
        action: "practical_session_created",
        metadata: { title: @practical_session.title, location: @practical_session.location }
      )
      redirect_to workspace_project_path(@workspace, @project, view: "practical_sessions"), notice: "Prática presencial agendada com sucesso!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @practical_session.update(practical_session_params)
      redirect_to workspace_project_path(@workspace, @project, view: "practical_sessions"), notice: "Prática presencial atualizada com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @practical_session.destroy
    redirect_to workspace_project_path(@workspace, @project, view: "practical_sessions"), notice: "Agendamento de prática removido."
  end

  def check_in
    if @practical_session.update(status: "completed", observations: params[:observations].presence || "Check-in presencial confirmado com sucesso na bancada/local.")
      Activity.track(
        user: current_user,
        workspace: @workspace,
        trackable: @practical_session,
        action: "practical_session_checkin",
        metadata: { title: @practical_session.title }
      )
      redirect_to workspace_project_path(@workspace, @project, view: "practical_sessions"), notice: "Presença física confirmada! Prática concluída."
    else
      redirect_to workspace_project_path(@workspace, @project, view: "practical_sessions"), alert: "Erro ao confirmar presença."
    end
  end

  private

  def set_workspace
    @workspace = current_user.workspaces.find(params[:workspace_id])
  end

  def set_project
    @project = @workspace.projects.find(params[:project_id])
  end

  def set_practical_session
    @practical_session = @project.practical_sessions.find(params[:id])
  end

  def practical_session_params
    params.require(:practical_session).permit(
      :title, :description, :location, :scheduled_at, :ends_at,
      :status, :participant_name, :participant_email, :issue_id, :observations
    )
  end
end
