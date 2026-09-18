class Activity < ApplicationRecord
  include Rails.application.routes.url_helpers

  belongs_to :user
  belongs_to :workspace
  belongs_to :trackable, polymorphic: true

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :feed, -> { recent.limit(20) }

  def self.track(user:, workspace:, trackable:, action:, metadata: {})
    create!(
      user: user,
      workspace: workspace,
      trackable: trackable,
      action: action,
      metadata: metadata
    )
  end

  def target_path
    return "#" unless trackable

    case trackable_type
    when "Issue"
      workspace_project_issue_path(workspace, trackable.project, trackable)
    when "Project"
      workspace_project_path(workspace, trackable)
    when "Document"
      workspace_project_document_path(workspace, trackable.project, trackable)
    when "Whiteboard"
      workspace_project_whiteboard_path(workspace, trackable.project, trackable)
    when "Milestone"
      workspace_project_path(workspace, trackable.project, view: "milestones")
    else
      "#"
    end
  rescue
    "#"
  end

  def location_name
    return nil unless trackable
    if trackable.respond_to?(:project) && trackable.project
      trackable.project.name
    elsif trackable_type == "Project"
      trackable.name
    else
      workspace.name
    end
  rescue
    nil
  end

  def formatted_message
    case action
    when "issue_created"
      "criou a tarefa <span class='font-bold text-ink dark:text-white'>#{metadata['identifier']} #{metadata['title']}</span>"
    when "status_changed"
      identifier = metadata["identifier"] || (trackable.identifier if trackable.respond_to?(:identifier)) || "Tarefa"
      "moveu <span class='font-bold text-ink dark:text-white'>#{identifier}</span> de <span class='line-through text-ink-light dark:text-white/40'>#{metadata['from'] || 'N/A'}</span> para <span class='text-terracotta font-bold'>#{metadata['to']}</span>"
    when "assignee_changed"
      identifier = metadata["identifier"] || (trackable.identifier if trackable.respond_to?(:identifier)) || "Tarefa"
      "atribuiu <span class='font-bold text-ink dark:text-white'>#{identifier}</span> para <span class='font-bold text-olive'>#{metadata['to'] || 'ninguém'}</span>"
    when "project_created"
      "criou o projeto <span class='font-bold text-ink dark:text-white'>#{metadata['name']}</span>"
    when "comment_created"
      "comentou na tarefa <span class='font-bold text-ink dark:text-white'>#{metadata['issue_identifier']}</span>"
    when "document_created"
      "criou a especificação <span class='font-bold text-sage-dark dark:text-sage'>#{metadata['title']}</span>"
    when "whiteboard_created"
      "desenhou o quadro <span class='font-bold text-slate'>#{metadata['title']}</span>"
    else
      "#{action.humanize.downcase}"
    end
  end
end
