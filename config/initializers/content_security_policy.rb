# frozen_string_literal: true

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :https, :data, "https://fonts.gstatic.com"
    policy.img_src     :self, :https, :data, "blob:", "https://*.r2.cloudflarestorage.com", "https://*.googleusercontent.com", "https://lh3.googleusercontent.com"
    policy.object_src  :none
    policy.script_src  :self, :unsafe_eval, :unsafe_inline, "https://cdn.jsdelivr.net", "https://challenges.cloudflare.com"
    policy.style_src   :self, :https, :unsafe_inline, "https://fonts.googleapis.com"
    policy.frame_src   :self, "https://challenges.cloudflare.com"
    policy.connect_src :self, :wss, :ws, "https://*.neon.tech", "https://*.r2.cloudflarestorage.com", "https://challenges.cloudflare.com"
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self, "https://accounts.google.com"
  end

  # Dynamic nonces for Hotwire / Inline scripts in Production
  if Rails.env.production?
    config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s.presence || SecureRandom.hex(16) }
    config.content_security_policy_nonce_directives = %w[script-src]
  end
end
