class ActivitiesController < ApplicationController
  before_action :authenticate_user!
  layout "app"
  
  def index
    workspace_ids = current_user.workspaces.pluck(:id)
    @activities = Activity.where(workspace_id: workspace_ids).recent.limit(50).group_by { |a| a.created_at.to_date }
  end
end
