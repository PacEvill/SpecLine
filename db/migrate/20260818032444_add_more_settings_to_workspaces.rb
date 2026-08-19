class AddMoreSettingsToWorkspaces < ActiveRecord::Migration[8.1]
  def change
    add_column :workspaces, :visibility, :string
    add_column :workspaces, :timezone, :string
    add_column :workspaces, :industry, :string
    add_column :workspaces, :team_size, :string
    add_column :workspaces, :company_number, :string
    add_column :workspaces, :billing_email, :string
  end
end
