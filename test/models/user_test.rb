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
  test "cadastro por senha exige aceite dos termos (LGPD)" do
    user = User.new(email: "consent_test@example.com", password: "password123", password_confirmation: "password123")
    assert_not user.valid?, "deve invalidar sem consentimento"
    assert_includes user.errors[:terms_consent], "É obrigatório aceitar os Termos de Uso e a Política de Privacidade."
    user.terms_consent = true
    user.save!
    assert_not_nil user.terms_accepted_at
  end

  test "cadastro via google não exige aceite prévio e não grava timestamp" do
    user = User.create!(provider: "google_oauth2", uid: "consent-ok", email: "consent_oauth@example.com", password: Devise::Encryptor.digest(User, "password123"))
    assert_nil user.terms_accepted_at
  end
end
