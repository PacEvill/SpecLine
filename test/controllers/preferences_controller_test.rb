require "test_helper"

class PreferencesControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get preferences_show_url
    assert_response :success
  end
end
