class AddIsFolderToDocuments < ActiveRecord::Migration[8.1]
  def change
    add_column :documents, :is_folder, :boolean, default: false
  end
end
