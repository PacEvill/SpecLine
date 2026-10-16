require "test_helper"

class PracticalSessionsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @practical_session = @project.practical_sessions.create!(
      title: "Prática de Teste",
      location: "Lab 02 - Bancada 01",
      scheduled_at: Time.current + 1.day,
      user: @user
    )
    sign_in @user
  end

  test "should get show" do
    get workspace_project_practical_session_path(@workspace, @project, @practical_session)
    assert_response :success
  end

  test "should get new and edit" do
    get new_workspace_project_practical_session_path(@workspace, @project)
    assert_response :success

    get edit_workspace_project_practical_session_path(@workspace, @project, @practical_session)
    assert_response :success
  end

  test "should create practical session" do
    assert_difference("PracticalSession.count") do
      post workspace_project_practical_sessions_path(@workspace, @project),
           params: { practical_session: { title: "Oficina de Exemplo", location: "Lab 02", scheduled_at: Time.current + 2.days } }
    end
    assert_redirected_to workspace_project_path(@workspace, @project, view: "practical_sessions")
  end

  test "check_in confirma presença e conclui a prática" do
    patch check_in_workspace_project_practical_session_path(@workspace, @project, @practical_session)
    assert_redirected_to workspace_project_path(@workspace, @project, view: "practical_sessions")
    assert_equal "completed", @practical_session.reload.status
    assert_not_nil @practical_session.observations
  end

  test "não deve acessar prática de workspace alheio (multi-tenant)" do
    foreign_project = projects(:two)
    foreign = foreign_project.practical_sessions.create!(
      title: "Prática Alheia", location: "Outro Lab", scheduled_at: Time.current + 1.day
    )
    get workspace_project_practical_session_path(workspaces(:two), foreign_project, foreign)
    assert_response :not_found
  end

  test "status_label mapeia sem emojis" do
    assert_equal "Agendado", @practical_session.status_label
    @practical_session.update!(status: "completed")
    assert_equal "Presença Confirmada", @practical_session.reload.status_label
    options = PracticalSession.status_options
    assert options.is_a?(Hash)
    assert_not options.keys.join.match?(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{274C}\u{2705}]/), "rótulos não podem conter emojis/glyphs"
  end
end
