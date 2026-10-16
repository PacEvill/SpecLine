class PracticalSession < ApplicationRecord
  belongs_to :project
  belongs_to :user, optional: true
  belongs_to :issue, optional: true

  validates :title, presence: true
  validates :location, presence: true
  validates :scheduled_at, presence: true

  before_validation :generate_check_in_code, on: :create

  STATUSES = %w[scheduled in_progress completed cancelled].freeze
  STATUS_LABELS = {
    "scheduled" => "Agendado",
    "in_progress" => "Em Andamento (Presencial)",
    "completed" => "Presença Confirmada",
    "cancelled" => "Cancelado"
  }.freeze

  # Para selects e etapas do feed — sem ícones de texto/glyph
  def self.status_options
    STATUS_LABELS.map { |value, label| [label, value] }.to_h
  end

  scope :ordered, -> { order(scheduled_at: :asc) }
  scope :upcoming, -> { where("scheduled_at >= ?", Time.current).where.not(status: "completed") }
  scope :completed, -> { where(status: "completed") }

  def status_label
    STATUS_LABELS[status] || status.to_s.humanize
  end

  def status_color
    case status
    when "scheduled" then "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    when "in_progress" then "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse"
    when "completed" then "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    when "cancelled" then "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    else "bg-gray-500/10 text-gray-600 border-gray-500/20"
    end
  end

  private

  def generate_check_in_code
    return if check_in_code.present?
    self.check_in_code = "PRAT-#{SecureRandom.hex(3).upcase}"
  end
end
