require "test_helper"

# Chrome headless explícito (evita kwarg `options:` cru, que o Selenium 4.47
# não aceita via driven_by). Flags mínimas para CI/local.
Capybara.register_driver :spec_headless_chrome do |app|
  browser_options = Selenium::WebDriver::Chrome::Options.new.tap do |opts|
    opts.args << "--headless=new"
    opts.args << "--disable-dev-shm-usage"
    opts.args << "--disable-gpu"
    opts.args << "--no-first-run"
    opts.args << "--mute-audio"
  end
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: browser_options)
end

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  driven_by :spec_headless_chrome, screen_size: [1400, 1400]

  private

  # Login real pelo formulário. O wait fecha a corrida Turbo × cookie:
  # o destino logado ("Bem-vindo de volta…" no índice de workspaces) só
  # aparece com a sessão já gravada, evitando 401 em visitas seguintes.
  def login_com_fixture(email, senha = "password123")
    visit new_user_session_path
    fill_in "user_email", with: email
    fill_in "user_password", with: senha
    find("form button[type=submit]").click
    assert_text "Bem-vindo", wait: 10
  end
end
