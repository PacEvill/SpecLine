class CreateIssues < ActiveRecord::Migration[8.1]
  def change
    create_table :issues do |t|
      t.references :project, null: false, foreign_key: true
      t.references :issue_status, null: false, foreign_key: true
      t.references :assignee, foreign_key: { to_table: :users }
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.references :parent, foreign_key: { to_table: :issues }
      t.references :milestone, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.integer :number, null: false
      t.string :identifier, null: false
      t.integer :priority, default: 0
      t.date :due_date
      t.date :start_date
      t.float :position

      t.timestamps
    end
    add_index :issues, [:project_id, :number], unique: true
    add_index :issues, [:project_id, :identifier], unique: true
  end
end
