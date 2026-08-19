class Workspace < ApplicationRecord
  belongs_to :user
  has_many :projects, dependent: :destroy
  has_many :labels, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_one_attached :logo

  validates :name, presence: true

  after_create :create_default_labels

  private

  def create_default_labels
    [
      { name: 'Bug', color: '#e11d48' },
      { name: 'Feature', color: '#2563eb' },
      { name: 'Enhancement', color: '#16a34a' },
      { name: 'Design', color: '#d946ef' },
      { name: 'Documentation', color: '#64748b' }
    ].each do |label_attrs|
      labels.create!(label_attrs)
    end
  end
end
