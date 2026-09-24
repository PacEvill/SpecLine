require "test_helper"

class SolutionsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get solutions_url
    assert_response :success
  end

  test "should get startups" do
    get solutions_startups_url
    assert_response :success
  end

  test "should get agencies" do
    get solutions_agencies_url
    assert_response :success
  end

  test "should get product" do
    get solutions_product_url
    assert_response :success
  end

  test "should get academic" do
    get solutions_academic_url
    assert_response :success
  end

  test "should get education" do
    get solutions_education_url
    assert_response :success
  end

  test "should get creators" do
    get solutions_creators_url
    assert_response :success
  end
end
