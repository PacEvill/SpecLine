require "test_helper"

class ChangelogControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get changelog_url
    assert_response :success
  end

  test "should link to the public extension page" do
    get changelog_url

    assert_select "a[href=?]", praticas_extensionistas_path
  end
end
