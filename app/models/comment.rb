class Comment < ApplicationRecord
  include HtmlSanitizer

  belongs_to :user
  belongs_to :commentable, polymorphic: true

  validates :body, presence: true
  before_save :sanitize_body

  scope :ordered, -> { order(created_at: :asc) }

  private

  def sanitize_body
    self.body = sanitize_html_field(body) if body.present?
  end
end
