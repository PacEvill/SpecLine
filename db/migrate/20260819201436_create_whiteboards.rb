class CreateWhiteboards < ActiveRecord::Migration[8.1]
  def change
    create_table :whiteboards do |t|
      t.string :title, null: false
      t.text :description
      t.text :content
      t.text :mermaid_code
      t.string :mode, default: "hybrid", null: false
      t.string :icon
      t.string :cover_image
      t.integer :position, default: 0, null: false
      t.references :workspace, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
