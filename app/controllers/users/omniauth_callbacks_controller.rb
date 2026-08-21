class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    auth = request.env["omniauth.auth"]
    if auth.blank?
      flash[:alert] = "Nenhuma informação de autenticação foi recebida do Google."
      redirect_to new_user_session_path and return
    end

    @user = User.from_omniauth(auth)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", kind: "Google"
      sign_in_and_redirect @user, event: :authentication
    else
      session["devise.google_data"] = auth.except("extra")
      redirect_to new_user_registration_url, alert: @user.errors.full_messages.to_sentence
    end
  end

  def failure
    error_type = request.env["omniauth.error.type"]&.to_s.presence || params[:message].presence
    error_obj = request.env["omniauth.error"]

    Rails.logger.error("[OmniAuth Failure] Tipo: #{error_type.inspect} | Erro: #{error_obj.inspect} | Params: #{params.to_unsafe_h.except('controller', 'action')}")

    detail = case error_type&.to_s&.downcase
             when "access_denied"
               "Permissão não concedida ou usuário cancelou a autorização"
             when "csrf_detected"
               "Falha de validação de segurança da sessão (CSRF)"
             when "invalid_credentials"
               "Credenciais inválidas"
             when "timeout"
               "Tempo limite de conexão esgotado"
             else
               error_type.present? ? error_type.humanize : "Autenticação cancelada ou não autorizada"
             end

    flash[:alert] = "Não foi possível concluir o login com o Google (#{detail}). Tente novamente ou use e-mail e senha."
    redirect_to new_user_session_path
  end
end
