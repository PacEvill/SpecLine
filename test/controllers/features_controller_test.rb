require "test_helper"

class FeaturesControllerTest < ActionDispatch::IntegrationTest
  test "should get docs" do
    get features_docs_url
    assert_response :success
  end

  test "should get kanban" do
    get features_kanban_url
    assert_response :success
  end

  test "should get chat" do
    get features_chat_url
    assert_response :success
  end

  test "should get whiteboard" do
    get features_whiteboard_url
    assert_response :success
  end
end
