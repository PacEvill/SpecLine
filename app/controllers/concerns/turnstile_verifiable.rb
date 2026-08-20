module TurnstileVerifiable
  extend ActiveSupport::Concern

  def verify_turnstile
    # In test environment, always pass
    return true if Rails.env.test?

    # In development: bypass if keys are missing, if using Cloudflare test/dummy keys, or if token is absent (e.g. adblockers or local dev)
    if Rails.env.development?
      return true if ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"].blank?
      
      token = params["cf-turnstile-response"]
      if token.blank? || is_dummy_turnstile_key?(ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"])
        Rails.logger.info("[Turnstile] Bypass em ambiente de desenvolvimento (chave de teste ou token ausente).")
        return true
      end
    end

    # In production, bypass only if no secret key is configured
    return true if ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"].blank?

    token = params["cf-turnstile-response"]
    if token.blank?
      Rails.logger.error("[Turnstile] 'cf-turnstile-response' não foi enviado pelo navegador.")
      flash.now[:alert] = "Verificação de segurança falhou. Por favor, conclua o desafio de segurança."
      
      self.resource = resource_class.new(sign_in_params) if respond_to?(:sign_in_params, true)
      self.resource ||= resource_class.new(sign_up_params) if respond_to?(:sign_up_params, true)
      self.resource ||= resource_class.new
      resource.clean_up_passwords if resource.respond_to?(:clean_up_passwords)
      
      render :new, status: :unprocessable_entity
      return false
    end

    begin
      response = Net::HTTP.post_form(
        URI("https://challenges.cloudflare.com/turnstile/v0/siteverify"),
        {
          "secret" => ENV["CLOUDFLARE_TURNSTILE_SECRET_KEY"],
          "response" => token,
          "remoteip" => request.remote_ip
        }
      )

      outcome = JSON.parse(response.body)
      unless outcome["success"]
        Rails.logger.error("[Turnstile] Verificação Cloudflare falhou: #{outcome.inspect}")
        flash.now[:alert] = "Verificação de segurança falhou. Por favor, tente novamente."
        
        self.resource = resource_class.new(sign_in_params) if respond_to?(:sign_in_params, true)
        self.resource ||= resource_class.new(sign_up_params) if respond_to?(:sign_up_params, true)
        self.resource ||= resource_class.new
        resource.clean_up_passwords if resource.respond_to?(:clean_up_passwords)
        
        render :new, status: :unprocessable_entity
        return false
      end
    rescue StandardError => e
      Rails.logger.error("[Turnstile] Erro ao comunicar com Cloudflare: #{e.message}")
      if Rails.env.development? || Rails.env.test?
        return true
      else
        flash.now[:alert] = "Erro temporário na verificação de segurança. Tente novamente."
        render :new, status: :unprocessable_entity
        return false
      end
    end
  end

  private

  def is_dummy_turnstile_key?(key)
    key_str = key.to_s.strip
    key_str.start_with?("1x00000000000000000000") || 
      key_str.start_with?("2x00000000000000000000") || 
      key_str.start_with?("3x00000000000000000000")
  end
end
