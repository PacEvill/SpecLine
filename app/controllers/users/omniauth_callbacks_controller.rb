class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    auth = request.env['omniauth.auth']
    if auth.blank?
      flash[:alert] = "Nenhuma informação de autenticação foi recebida do Google."
      redirect_to new_user_session_path and return
    end

    @user = User.from_omniauth(auth)

    if @user.persisted?
      flash[:notice] = I18n.t 'devise.omniauth_callbacks.success', kind: 'Google'
      sign_in_and_redirect @user, event: :authentication
    else
      session['devise.google_data'] = auth.except('extra')
      redirect_to new_user_registration_url, alert: @user.errors.full_messages.to_sentence
    end
  end

  def failure
    error_msg = params[:message].presence || "Autenticação cancelada ou não autorizada"
    Rails.logger.error("[OmniAuth Failure] Mensagem: #{error_msg}")
    flash[:alert] = "Não foi possível concluir o login com o Google (#{error_msg.humanize}). Tente novamente ou use e-mail e senha."
    redirect_to new_user_session_path
  end
end
