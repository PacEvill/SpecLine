class Comment < ApplicationRecord
  include HtmlSanitizer

  belongs_to :user
  belongs_to :commentable, polymorphic: true

  validates :body, presence: true
  before_save :sanitize_body

  scope :ordered, -> { order(created_at: :asc) }

  after_create_commit -> {
    broadcast_append_to [ commentable, :comments ], target: "comments_list", partial: "comments/comment", locals: { comment: self }
  }
  after_destroy_commit -> {
    broadcast_remove_to [ commentable, :comments ], target: self
  }

  private

  def sanitize_body
    self.body = sanitize_html_field(body) if body.present?
  end
end
