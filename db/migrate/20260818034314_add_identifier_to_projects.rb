class AddIdentifierToProjects < ActiveRecord::Migration[8.1]
  def change
    add_column :projects, :identifier_prefix, :string
    add_column :projects, :issues_count, :integer, default: 0
    add_column :projects, :default_view, :string, default: "board"
  end
end
