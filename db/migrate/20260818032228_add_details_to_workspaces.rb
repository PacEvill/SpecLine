class AddDetailsToWorkspaces < ActiveRecord::Migration[8.1]
  def change
    add_column :workspaces, :description, :text
    add_column :workspaces, :website, :string
    add_column :workspaces, :color, :string
  end
end
