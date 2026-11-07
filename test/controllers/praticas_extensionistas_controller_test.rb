require "test_helper"

class PraticasExtensionistasControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get praticas_extensionistas_url
    assert_response :success
    assert_select "h1", /3 perguntas/
  end

  test "index links the community research form" do
    get praticas_extensionistas_url
    assert_select "a[href=?]", PraticasExtensionistasController::PESQUISA_URL
    assert_select "a[href=?]", PraticasExtensionistasController::FORMS_URL, minimum: 2
  end

  test "registro saves interest without account" do
    assert_difference "PraticaRegistro.count", 1 do
      post pratica_registro_url, params: {
        nome: "Dona Ana",
        contato: "ana@exemplo.com",
        ideia: "Vender bolo por encomenda"
      }
    end

    registro = PraticaRegistro.sole
    assert_equal "Dona Ana", registro.nome
    assert_equal "site", registro.origem
    assert_redirected_to praticas_extensionistas_path(anchor: "inscricao")
  end

  test "registro discards honeypot submissions" do
    assert_no_difference "PraticaRegistro.count" do
      post pratica_registro_url, params: {
        website: "spam.example",
        nome: "Bot",
        contato: "bot@bots.example"
      }
    end
    assert_redirected_to praticas_extensionistas_path(anchor: "inscricao")
  end

  test "registro rejects blank nome" do
    assert_no_difference "PraticaRegistro.count" do
      post pratica_registro_url, params: { contato: "ana@exemplo.com" }
    end
    assert_redirected_to praticas_extensionistas_path(anchor: "inscricao")
  end

  test "certificado renders a printable page with the participant name" do
    get pratica_certificado_url, params: { nome: "  Dona Ana  " }
    assert_response :success
    assert_select "p.nome-participante", "Dona Ana"
    assert_select "h1", /Certificado/
    assert_includes @response.body, "Salvar em PDF"
    assert_includes @response.body, "Mão na Massa"
  end

  test "certificado redirects back when nome is blank" do
    get pratica_certificado_url, params: { nome: "   " }
    assert_redirected_to praticas_extensionistas_path(anchor: "certificado")
  end

  test "index offers the self-serve certificate" do
    get praticas_extensionistas_url
    assert_select "form[action=?]", pratica_certificado_url, minimum: 0
    assert_operator @response.body.scan('praticas-extensionistas/certificado"').size, :>=, 2,
      "esperava o formulário do certificado nas duas seções (roteiro e evidências)"
    assert_includes @response.body, "Baixar certificado"
  end
end
