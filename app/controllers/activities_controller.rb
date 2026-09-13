class ActivitiesController < ApplicationController
  before_action :authenticate_user!
  layout "app"

  def index
    workspace_ids = current_user.workspaces.pluck(:id)
    scope = Activity.where(workspace_id: workspace_ids).recent.limit(50)
    
    if params[:activity_filter] == 'mine'
      scope = scope.where(user: current_user)
    end
    
    @activities = scope.group_by { |a| a.created_at.to_date }
  end
end
