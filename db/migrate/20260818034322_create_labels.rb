class CreateLabels < ActiveRecord::Migration[8.1]
  def change
    create_table :labels do |t|
      t.references :workspace, null: false, foreign_key: true
      t.string :name
      t.string :color

      t.timestamps
    end
  end
end
