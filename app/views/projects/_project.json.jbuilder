json.extract! project, :id, :name, :description, :deadline, :progress, :status, :workspace_id, :created_at, :updated_at
json.url project_url(project, format: :json)
