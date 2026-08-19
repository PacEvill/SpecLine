class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :commentable, polymorphic: true

  validates :body, presence: true

  scope :ordered, -> { order(created_at: :asc) }
end
