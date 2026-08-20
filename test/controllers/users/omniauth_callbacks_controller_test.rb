require "test_helper"

class Users::OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
      provider: 'google_oauth2',
      uid: '12345',
      info: {
        email: 'callback@example.com',
        first_name: 'Callback',
        last_name: 'User'
      }
    })
    Rails.application.env_config["devise.mapping"] = Devise.mappings[:user]
    Rails.application.env_config["omniauth.auth"] = OmniAuth.config.mock_auth[:google_oauth2]
  end

  teardown do
    OmniAuth.config.test_mode = false
  end

  test "should authenticate user via google oauth2 and redirect" do
    post user_google_oauth2_omniauth_callback_url

    assert_redirected_to workspaces_path
    assert_equal "Autorizado com sucesso de uma conta de Google.", flash[:notice]
  end
end
