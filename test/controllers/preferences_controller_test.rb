require "test_helper"

class PreferencesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in @user
  end

  test "should get show" do
    get preferences_url
    assert_response :success
  end

  test "should update preferences" do
    patch preferences_url
    assert_redirected_to preferences_url
  end
end
