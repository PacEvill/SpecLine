class CreateIssueStatuses < ActiveRecord::Migration[8.1]
  def change
    create_table :issue_statuses do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name
      t.string :category
      t.string :color
      t.integer :position

      t.timestamps
    end
  end
end
