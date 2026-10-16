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

  test "ação extensionista vive na área acadêmica, isolada do produto" do
    get academic_extension_url
    assert_response :success
    assert_select "h1", text: /Engenharia de Software/
    get "/extension"
    assert_response :missing
    get "/acao-extensionista"
    assert_response :missing
  end
end
