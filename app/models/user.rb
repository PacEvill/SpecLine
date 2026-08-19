class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :workspaces, dependent: :destroy
  has_many :created_issues, class_name: "Issue", foreign_key: :creator_id, dependent: :nullify
  has_many :assigned_issues, class_name: "Issue", foreign_key: :assignee_id, dependent: :nullify
  has_many :comments, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :documents, foreign_key: :author_id, dependent: :nullify

  has_one_attached :avatar

  def full_name
    return email.split('@').first.capitalize if first_name.blank? && last_name.blank?
    [first_name, last_name].compact.join(" ").strip
  end
end
