class IssueStatus < ApplicationRecord
  belongs_to :project
  has_many :issues, dependent: :restrict_with_error

  validates :name, presence: true
  validates :category, presence: true, inclusion: { in: %w[backlog todo in_progress done cancelled] }

  scope :ordered, -> { order(:position) }

  # Cria os statuses padrão para um novo projeto
  def self.create_defaults_for(project)
    [
      { name: "Backlog", category: "backlog", color: "#94a3b8", position: 0 },
      { name: "A Fazer", category: "todo", color: "#f59e0b", position: 1 },
      { name: "Em Progresso", category: "in_progress", color: "#3b82f6", position: 2 },
      { name: "Em Revisão", category: "in_progress", color: "#8b5cf6", position: 3 },
      { name: "Concluído", category: "done", color: "#22c55e", position: 4 },
      { name: "Cancelado", category: "cancelled", color: "#ef4444", position: 5 }
    ].each { |attrs| project.issue_statuses.create!(attrs) }
  end
end
