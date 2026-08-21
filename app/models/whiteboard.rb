class Whiteboard < ApplicationRecord
  belongs_to :workspace
  belongs_to :project
  belongs_to :user

  validates :title, presence: true
  validates :mode, inclusion: { in: %w[whiteboard mermaid hybrid] }

  scope :ordered, -> { order(position: :asc, created_at: :desc) }

  before_validation :set_defaults

  def parsed_content
    return {} if content.blank?
    JSON.parse(content) rescue {}
  end

  private

  def set_defaults
    self.mode ||= "hybrid"
    self.position ||= 0
    self.icon = icon.presence || "canvas"
    if mermaid_code.blank? && mode != "whiteboard"
      self.mermaid_code = <<~MERMAID
        graph TD
          A["Início do Fluxo"] --> B{"Decisão do Usuário"}
          B -->|"Opção A"| C["Processar Regra A"]
          B -->|"Opção B"| D["Processar Regra B"]
          C --> E["Sucesso"]
          D --> E
      MERMAID
    end
  end
end
