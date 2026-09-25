require "test_helper"

class ActivitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in @user
  end

  test "should get index" do
    get activities_url
    assert_response :success
  end

  test "should export activities to csv" do
    get activities_url(format: :csv)
    assert_response :success
    assert_includes response.header["Content-Type"], "text/csv"
    assert_includes response.body, "ID,Data/Hora,Usuario,Email,Workspace,Entidade,Acao,Detalhes"
  end
end
