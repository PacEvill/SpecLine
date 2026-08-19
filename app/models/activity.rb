class Activity < ApplicationRecord
  belongs_to :user
  belongs_to :workspace
  belongs_to :trackable, polymorphic: true

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :feed, -> { recent.limit(20) }

  # Helper para criar atividades facilmente
  def self.track(user:, workspace:, trackable:, action:, metadata: {})
    create!(
      user: user,
      workspace: workspace,
      trackable: trackable,
      action: action,
      metadata: metadata
    )
  end
end
