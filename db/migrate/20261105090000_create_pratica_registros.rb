class CreatePraticaRegistros < ActiveRecord::Migration[8.1]
  def change
    create_table :pratica_registros do |t|
      t.string :nome, null: false
      t.string :contato, null: false
      t.text :ideia
      t.string :origem, null: false, default: "site"
      t.timestamps
    end

    add_index :pratica_registros, :created_at
    add_index :pratica_registros, :contato
  end
end
