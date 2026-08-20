class Issue < ApplicationRecord
  include HtmlSanitizer

  belongs_to :project, counter_cache: :issues_count
  belongs_to :issue_status
  belongs_to :assignee, class_name: "User", optional: true
  belongs_to :creator, class_name: "User"
  belongs_to :parent, class_name: "Issue", optional: true
  belongs_to :milestone, optional: true
  belongs_to :board, optional: true

  has_many :sub_issues, class_name: "Issue", foreign_key: :parent_id, dependent: :destroy
  has_many :issue_labels, dependent: :destroy
  has_many :labels, through: :issue_labels
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :activities, as: :trackable, dependent: :destroy

  validates :title, presence: true
  validates :number, presence: true, uniqueness: { scope: :project_id }
  validates :identifier, presence: true, uniqueness: { scope: :project_id }

  scope :ordered, -> { order(:position) }
  scope :by_status, ->(status) { where(issue_status: status) }

  enum :priority, { no_priority: 0, low: 1, medium: 2, high: 3, urgent: 4 }

  before_validation :set_number_and_identifier, on: :create
  before_save :sanitize_description

  private

  def sanitize_description
    self.description = sanitize_html_field(description) if description.present?
  end

  def set_number_and_identifier
    return if number.present?

    last_number = project.issues.maximum(:number) || 0
    self.number = last_number + 1
    prefix = project.identifier_prefix.presence || project.name[0..2].upcase
    self.identifier = "#{prefix}-#{self.number}"
  end
end
