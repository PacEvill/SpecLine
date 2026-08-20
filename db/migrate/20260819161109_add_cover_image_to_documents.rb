class AddCoverImageToDocuments < ActiveRecord::Migration[8.1]
  def change
    add_column :documents, :cover_image, :string
  end
end
