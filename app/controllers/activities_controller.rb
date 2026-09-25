class ActivitiesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  def index
    workspace_ids = current_user.workspaces.pluck(:id)
    scope = Activity.where(workspace_id: workspace_ids).recent

    if params[:activity_filter] == "mine"
      scope = scope.where(user: current_user)
    end

    respond_to do |format|
      format.html do
        @activities = scope.limit(50).group_by { |a| a.created_at.to_date }
      end
      format.csv do
        headers = [ "ID", "Data/Hora", "Usuario", "Email", "Workspace", "Entidade", "Acao", "Detalhes" ]
        rows = [ headers.map { |h| escape_csv_field(h) }.join(",") ]

        scope.limit(500).find_each do |act|
          row = [
            act.id,
            act.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            act.user&.full_name || "Sistema",
            act.user&.email || "N/A",
            act.workspace&.name || "N/A",
            act.trackable_type || "N/A",
            act.action,
            act.metadata.to_json
          ]
          rows << row.map { |f| escape_csv_field(f) }.join(",")
        end

        send_data rows.join("\r\n"),
                  filename: "auditoria-atividades-#{Date.today}.csv",
                  type: "text/csv; charset=utf-8; header=present",
                  disposition: "attachment"
      end
    end
  end

  private

  def escape_csv_field(value)
    str = value.to_s.gsub('"', '""')
    if str.match?(/[,\r\n"]/)
      "\"#{str}\""
    else
      str
    end
  end
end
