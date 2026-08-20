require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    sign_in @user
  end

  test "should get index" do
    get workspace_projects_url(@workspace)
    assert_response :success
  end

  test "should get new" do
    get new_workspace_project_url(@workspace)
    assert_response :success
  end

  test "should create project" do
    assert_difference("Project.count") do
      post workspace_projects_url(@workspace), params: {
        project: {
          name: "Novo Projeto Teste",
          description: "Desc",
          identifier_prefix: "TEST",
          status: "Em Andamento"
        }
      }
    end

    assert_redirected_to workspace_project_url(@workspace, Project.last)
  end

  test "should show project" do
    get workspace_project_url(@workspace, @project)
    assert_response :success
  end

  test "should get edit" do
    get edit_workspace_project_url(@workspace, @project)
    assert_response :success
  end

  test "should update project" do
    patch workspace_project_url(@workspace, @project), params: {
      project: { name: "Nome Atualizado" }
    }
    assert_redirected_to workspace_project_url(@workspace, @project)
  end

  test "should destroy project" do
    assert_difference("Project.count", -1) do
      delete workspace_project_url(@workspace, @project)
    end

    assert_redirected_to workspace_url(@workspace)
  end
end
