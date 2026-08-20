require "test_helper"

class MyTasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in @user
  end

  test "should get index" do
    get my_tasks_url
    assert_response :success
  end
end
