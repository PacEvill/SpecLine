class Board < ApplicationRecord
  belongs_to :project
  has_many :issues, dependent: :nullify
end
