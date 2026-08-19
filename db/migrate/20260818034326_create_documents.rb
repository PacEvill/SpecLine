class CreateDocuments < ActiveRecord::Migration[8.1]
  def change
    create_table :documents do |t|
      t.references :workspace, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.references :parent, foreign_key: { to_table: :documents }
      t.string :title, null: false
      t.text :content
      t.string :icon
      t.integer :position, default: 0

      t.timestamps
    end
  end
end
