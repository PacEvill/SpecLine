require "application_system_test_case"

# Fluxo de projeto: abas de contexto e módulo de sessões práticas (recuperado do clone antigo).
class ProjetoFlowTest < ApplicationSystemTestCase
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
  end

  test "aba de práticas presenciais lista sessões com status legível" do
    pratica = @project.practical_sessions.create!(
      title: "Prática de Homologação E2E",
      location: "Lab 02 - Bancada 03",
      scheduled_at: Time.current + 3.days,
      user: @user
    )

    login_com_fixture("user_one@example.com")
    visit workspace_project_path(@workspace, @project)
    click_on "Práticas Presenciais", wait: 10

    assert_text pratica.title
    assert_text "Agendado"
    assert_text "PRAT-"
  end

  test "navegação entre abas do projeto mantém contexto visual" do
    login_com_fixture("user_one@example.com")
    visit workspace_project_path(@workspace, @project)

    click_on "Lista", wait: 10
    assert_text "Nova Issue", wait: 10

    click_on "Práticas Presenciais", wait: 10
    assert_selector "h1, h2, a span", text: /Práticas Presenciais/, wait: 10
  end
end
