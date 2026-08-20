# frozen_string_literal: true

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :https, :data, "https://fonts.gstatic.com"
    policy.img_src     :self, :https, :data, "blob:", "https://*.r2.cloudflarestorage.com"
    policy.object_src  :none
    policy.script_src  :self, :unsafe_eval, "https://cdn.jsdelivr.net"
    policy.style_src   :self, :https, "'unsafe-inline'", "https://fonts.googleapis.com"
    policy.connect_src :self, :wss, :ws, "https://*.neon.tech", "https://*.r2.cloudflarestorage.com"
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self
  end

  # Dynamic nonces for Hotwire / Inline scripts
  config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  config.content_security_policy_nonce_directives = %w[script-src]
end
