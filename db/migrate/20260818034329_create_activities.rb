class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :activities do |t|
      t.references :user, null: false, foreign_key: true
      t.references :workspace, null: false, foreign_key: true
      t.references :trackable, polymorphic: true, null: false
      t.string :action
      t.json :metadata

      t.timestamps
    end
  end
end
