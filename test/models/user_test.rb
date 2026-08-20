require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test "full_name returns capitalized email prefix when first and last name are blank" do
    @user.first_name = nil
    @user.last_name = nil
    assert_equal @user.email.split("@").first.capitalize, @user.full_name
  end

  test "full_name returns combined first and last name when present" do
    @user.first_name = "Ada"
    @user.last_name = "Lovelace"
    assert_equal "Ada Lovelace", @user.full_name
  end

  test "user associations and profile attributes" do
    @user.job_title = "Principal Security Engineer"
    @user.bio = "Building resilient modular monoliths."
    assert @user.valid?
    assert_respond_to @user, :workspaces
    assert_respond_to @user, :assigned_issues
    assert_respond_to @user, :created_issues
    assert_respond_to @user, :documents
    assert_respond_to @user, :whiteboards
  end
end
