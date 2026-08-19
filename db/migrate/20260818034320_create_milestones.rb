class CreateMilestones < ActiveRecord::Migration[8.1]
  def change
    create_table :milestones do |t|
      t.references :project, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.date :start_date
      t.date :target_date
      t.string :status

      t.timestamps
    end
  end
end
