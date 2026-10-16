class CreatePracticalSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :practical_sessions do |t|
      t.references :project, null: false, foreign_key: true
      t.references :user, foreign_key: true
      t.references :issue, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :location, null: false
      t.datetime :scheduled_at, null: false
      t.datetime :ends_at
      t.string :status, null: false, default: "scheduled"
      t.string :participant_name
      t.string :participant_email
      t.string :check_in_code, null: false
      t.text :observations

      t.timestamps
    end
    add_index :practical_sessions, :check_in_code, unique: true
  end
end
