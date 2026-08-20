require "test_helper"

class UserAccountProfileTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
  end

  test "user can access edit profile page" do
    sign_in @user
    get edit_user_registration_path
    assert_response :success
    assert_select "h1", text: /Editar Perfil/i
    assert_select "input[name='user[first_name]']"
    assert_select "input[name='user[last_name]']"
    assert_select "input[name='user[job_title]']"
    assert_select "textarea[name='user[bio]']"
    assert_select "input[name='user[email]']"
  end

  test "user can successfully update profile fields with current password" do
    sign_in @user

    put user_registration_path, params: {
      user: {
        first_name: "Linus",
        last_name: "Torvalds",
        job_title: "Linux Creator",
        bio: "Open source advocate and Git creator.",
        current_password: "password123"
      }
    }

    assert_redirected_to workspaces_path
    @user.reload
    assert_equal "Linus", @user.first_name
    assert_equal "Torvalds", @user.last_name
    assert_equal "Linus Torvalds", @user.full_name
    assert_equal "Linux Creator", @user.job_title
    assert_equal "Open source advocate and Git creator.", @user.bio
  end

  test "user can access and update preferences" do
    sign_in @user
    get preferences_path
    assert_response :success
    assert_select "h1", text: /Preferências/i

    patch preferences_path, params: { theme: "dark" }
    assert_redirected_to preferences_path
  end
end
