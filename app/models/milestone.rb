class Milestone < ApplicationRecord
  belongs_to :project
  has_many :issues, dependent: :nullify

  validates :title, presence: true
  validates :status, inclusion: { in: %w[open active closed] }

  scope :ordered, -> { order(:target_date) }
  scope :active, -> { where(status: "active") }

  def progress_percentage
    return 0 if issues.count.zero?
    done = issues.joins(:issue_status).where(issue_statuses: { category: "done" }).count
    ((done.to_f / issues.count) * 100).round
  end
end
