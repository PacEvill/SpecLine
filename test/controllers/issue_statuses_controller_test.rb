require "test_helper"

class IssueStatusesControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get issue_statuses_new_url
    assert_response :success
  end

  test "should get create" do
    get issue_statuses_create_url
    assert_response :success
  end

  test "should get edit" do
    get issue_statuses_edit_url
    assert_response :success
  end

  test "should get update" do
    get issue_statuses_update_url
    assert_response :success
  end

  test "should get destroy" do
    get issue_statuses_destroy_url
    assert_response :success
  end
end
