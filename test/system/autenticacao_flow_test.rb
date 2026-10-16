require "application_system_test_case"

# Fluxo de autenticação de ponta a ponta (browser real, headless).
# Cobertura da skill e2e-testing (vault: Skills/Ativas/).
class AutenticacaoFlowTest < ApplicationSystemTestCase
  test "cadastro com aceite prévio dos termos entra na plataforma" do
    visit new_user_registration_path

    fill_in "user_name", with: "Estudante de Teste"
    fill_in "user_email", with: "estudante_e2e@universidade.edu"
    fill_in "user_password", with: "senha12345"
    fill_in "user_password_confirmation", with: "senha12345"
    check "terms_consent"
    find("form button[type=submit]").click

    assert_text "Bem-vindo", wait: 10
    assert User.find_by(email: "estudante_e2e@universidade.edu").terms_accepted_at.present?
  end

  test "cadastro sem aceite prévio dos termos é bloqueado e não cria conta" do
    visit new_user_registration_path

    fill_in "user_name", with: "Sem Consentimento"
    fill_in "user_email", with: "sem_consentimento@universidade.edu"
    fill_in "user_password", with: "senha12345"
    fill_in "user_password_confirmation", with: "senha12345"
    # checkbox deliberadamente NÃO marcado (server-side também é obrigatório)
    find("form button[type=submit]").click

    assert_text "Criar Conta", wait: 6
    assert_nil User.find_by(email: "sem_consentimento@universidade.edu")
  end

  test "login pelo formulário acessa o painel do produto" do
    login_com_fixture("user_one@example.com")
  end
end
