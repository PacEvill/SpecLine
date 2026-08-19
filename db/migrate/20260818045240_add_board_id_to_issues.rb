class AddBoardIdToIssues < ActiveRecord::Migration[8.1]
  def change
    add_reference :issues, :board, null: true, foreign_key: true
  end
end
