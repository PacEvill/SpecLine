class Project < ApplicationRecord
  include SecureAttachable

  belongs_to :workspace
  has_many :issues, dependent: :destroy
  has_many :issue_statuses, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :boards, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :whiteboards, dependent: :destroy

  has_one_attached :logo
  validates :name, presence: true
  validate :validate_logo_attachment

  after_create :create_default_statuses
  after_create :set_identifier_prefix

  def default_status
    issue_statuses.find_by(category: "backlog") || issue_statuses.first
  end

  def next_issue_number
    (issues.maximum(:number) || 0) + 1
  end

  def progress
    return 0 if issues.count.zero?
    done_count = issues.joins(:issue_status).where(issue_statuses: { category: "done" }).count
    ((done_count.to_f / issues.count) * 100).round
  end

  private

  def validate_logo_attachment
    validate_secure_attachment(:logo)
  end

  def create_default_statuses
    IssueStatus.create_defaults_for(self)
  end

  def set_identifier_prefix
    return if identifier_prefix.present?
    prefix = name.gsub(/[^a-zA-Z]/, "")[0..2].upcase
    prefix = "PRJ" if prefix.blank?
    update_column(:identifier_prefix, prefix)
  end
end
