class Users::RegistrationsController < Devise::RegistrationsController
  include TurnstileVerifiable
  before_action :verify_turnstile, only: [ :create ]
  before_action :configure_sign_up_params, only: [ :create ]
  before_action :configure_account_update_params, only: [ :update ]

  # PUT /resource
  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource_updated = update_resource(resource, account_update_params)
    yield resource if block_given?
    if resource_updated
      set_flash_message_for_update(resource, prev_unconfirmed_email)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?

      respond_to do |format|
        format.html { redirect_to after_update_path_for(resource), status: :see_other, notice: "Perfil atualizado com sucesso." }
        format.turbo_stream { redirect_to after_update_path_for(resource), status: :see_other, notice: "Perfil atualizado com sucesso." }
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_to do |format|
        format.html { render :edit, status: :unprocessable_entity }
        format.turbo_stream { render :edit, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /resource
  def destroy
    resource.destroy
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    set_flash_message! :notice, :destroyed
    yield resource if block_given?
    respond_with_navigational(resource) { redirect_to after_sign_out_path_for(resource_name), status: Devise.responder.redirect_status }
  end

  protected

  def update_resource(resource, params)
    # Permite atualizar nome, cargo, bio e avatar sem exigir a senha atual se os campos de senha estiverem em branco
    if params[:password].blank? && params[:password_confirmation].blank? && params[:current_password].blank?
      resource.update_without_password(params.except(:current_password))
    else
      resource.update_with_password(params)
    end
  end

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :first_name, :last_name ])
  end

  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [ :first_name, :last_name, :bio, :job_title, :avatar ])
  end

  def after_update_path_for(resource)
    edit_user_registration_path
  end
end
