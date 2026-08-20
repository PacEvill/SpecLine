require "test_helper"

class ProjectEcosystemOverviewTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    sign_in @user
  end

  test "should get project overview tab with 360 ecosystem metrics" do
    get workspace_project_url(@workspace, @project, view: "overview")
    assert_response :success
    assert_select "h3", text: /Arquitetura de Sistemas/
    assert_select "h3", text: /Documentação Técnica Recente/
    assert_select "h3", text: /Ações Rápidas/
    assert_select "h3", text: /Roadmap & Milestones/
  end

  test "should get project board view" do
    get workspace_project_url(@workspace, @project, view: "board")
    assert_response :success
  end

  test "should get project documents view" do
    get workspace_project_url(@workspace, @project, view: "documents")
    assert_response :success
  end

  test "should get project whiteboards view" do
    get workspace_project_url(@workspace, @project, view: "whiteboards")
    assert_response :success
  end

  test "should search across all ecosystem entities including whiteboards" do
    get search_url(q: "arquitetura")
    assert_response :success
  end
end
