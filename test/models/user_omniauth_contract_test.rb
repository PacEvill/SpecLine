require "test_helper"

class UserOmniauthContractTest < ActiveSupport::TestCase
  test "from_omniauth cria um novo usuario se nao existir" do
    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "123456789",
      info: {
        email: "test@example.com",
        first_name: "Test",
        last_name: "User"
      }
    })

    assert_difference("User.count", 1) do
      user = User.from_omniauth(auth)
      assert_equal "google_oauth2", user.provider
      assert_equal "123456789", user.uid
      assert_equal "test@example.com", user.email
      assert_equal "Test", user.first_name
      assert_equal "User", user.last_name
    end
  end

  test "from_omniauth encontra usuario existente pelo provider e uid" do
    existing_user = users(:one) # assuming fixture exists
    existing_user.update!(provider: "google_oauth2", uid: "987654321")

    auth = OmniAuth::AuthHash.new({
      provider: "google_oauth2",
      uid: "987654321",
      info: {
        email: existing_user.email
      }
    })

    assert_no_difference("User.count") do
      user = User.from_omniauth(auth)
      assert_equal existing_user, user
    end
  end
end
