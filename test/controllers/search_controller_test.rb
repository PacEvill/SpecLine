require "test_helper"

class SearchControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in @user
  end

  test "should get search index without query" do
    get search_url
    assert_response :success
  end

  test "should get search index with query" do
    get search_url(q: "Projeto")
    assert_response :success
  end

  test "should respond to json format" do
    get search_url(q: "test", format: :json)
    assert_response :success
  end
end
