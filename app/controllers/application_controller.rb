class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :configure_permitted_parameters, if: :devise_controller?
  layout :layout_by_resource

  rescue_from ActiveRecord::RecordNotFound do |exception|
    respond_to do |format|
      format.html { render file: Rails.root.join("public/404.html"), status: :not_found, layout: false }
      format.json { render json: { error: "Recurso não encontrado ou não autorizado." }, status: :not_found }
    end
  end

  protected

  def layout_by_resource
    if devise_controller? && resource_name == :user && action_name == "edit"
      "app"
    else
      "application"
    end
  end

  def after_sign_in_path_for(resource)
    workspaces_path
  end

  def after_update_path_for(resource)
    workspaces_path
  end

  def signed_in_root_path(resource_or_scope)
    workspaces_path
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:account_update, keys: [ :first_name, :last_name, :bio, :job_title, :avatar ])
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :first_name, :last_name ])
  end
end
