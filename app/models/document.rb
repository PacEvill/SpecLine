class Document < ApplicationRecord
  belongs_to :workspace
  belongs_to :project, optional: true
  belongs_to :author, class_name: "User"
  belongs_to :parent, class_name: "Document", optional: true

  has_many :children, class_name: "Document", foreign_key: :parent_id, dependent: :destroy
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :activities, as: :trackable, dependent: :destroy

  

  validates :title, presence: true

  scope :roots, -> { where(parent_id: nil) }
  scope :ordered, -> { order(:position) }
end
