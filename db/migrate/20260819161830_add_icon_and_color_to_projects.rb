class AddIconAndColorToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :icon, :string
    add_column :projects, :color, :string
  end
end
