class MyTasksController < ApplicationController
  before_action :authenticate_user!

  def index
    # Todas as issues atribuídas ao usuário logado, que não estejam no status 'done', ordenadas pela mais recente
    issues = Issue.where(assignee: current_user)
                  .joins(:issue_status)
                  .where.not(issue_statuses: { category: "done" })
                  .order(due_date: :asc, created_at: :desc)

    @issues_by_date = issues.group_by { |i| i.due_date || "Sem data" }
  end
end
