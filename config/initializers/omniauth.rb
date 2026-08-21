# frozen_string_literal: true

OmniAuth.config.allowed_request_methods = %i[get post]
OmniAuth.config.silence_get_warning = true

# Desativa a validação padrão do Rack-Protection do OmniAuth (que busca tokens do Sinatra/Rack
# e rejeita os tokens de CSRF nativos do Rails, causando 'Authenticity error')
OmniAuth.config.request_validation_phase = nil
