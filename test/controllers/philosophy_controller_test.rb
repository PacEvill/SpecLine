require "test_helper"

class PhilosophyControllerTest < ActionDispatch::IntegrationTest
  test "should get vision" do
    get philosophy_vision_url
    assert_response :success
  end

  test "should get focus" do
    get philosophy_focus_url
    assert_response :success
  end
end
