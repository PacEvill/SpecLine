class OnboardingService
  def initialize(user)
    @user = user
  end

  def run!
    ApplicationRecord.transaction do
      # 1. Create Default Workspace
      workspace = Workspace.create!(
        name: "Workspace de #{@user.email.split('@').first.capitalize}",
        user: @user
      )

      # 2. Create Demo Project
      project = Project.create!(
        name: "SpecLine - Projeto Demo",
        description: "Projeto de demonstração gerado automaticamente para você explorar as funcionalidades do SpecLine.",
        workspace: workspace
      )

      # 3. Create Milestone
      milestone = Milestone.create!(
        title: "Lançamento do MVP (Sprint 1)",
        description: "Ciclo focado em entregar a versão inicial testável do produto.",
        status: :active,
        start_date: Date.today - 2.days,
        target_date: Date.today + 12.days,
        project: project
      )

      # 4. Fetch default statuses (assuming they are created via callbacks on project creation or seeds)
      todo = project.issue_statuses.find_by(category: 'todo')
      in_progress = project.issue_statuses.find_by(category: 'in_progress')
      done = project.issue_statuses.find_by(category: 'done')

      # 5. Create Demo Issues
      issues_data = [
        { title: "Mapear fluxo de Autenticação de Usuários", status: done, milestone: milestone },
        { title: "Configurar banco de dados PostgreSQL na nuvem", status: done, milestone: milestone },
        { title: "Prototipar dashboard com Bento Box", status: done, milestone: milestone },
        { title: "Implementar login via Google OAuth", status: in_progress, milestone: milestone },
        { title: "Ajustar tipografia e contraste do Modo Escuro", status: in_progress, milestone: milestone },
        { title: "Conectar Calendário a eventos reais", status: todo, milestone: milestone },
        { title: "Configurar envio de e-mails transacionais (Resend)", status: todo, milestone: milestone },
        { title: "Sincronização em tempo real (Multiplayer) nos Quadros", status: todo, milestone: nil }
      ]

      issues_data.each do |data|
        Issue.create!(
          title: data[:title],
          description: "Esta é uma tarefa de exemplo. Tente editá-la, mudar seu status ou atribuí-la a alguém.",
          issue_status: data[:status],
          project: project,
          author: @user,
          assignee: (data[:status] == in_progress ? @user : nil),
          milestone: data[:milestone]
        )
      end

      # 6. Create Demo Document
      doc_content = <<~HTML
        <h1>Especificação de Produto (PRD)</h1>
        <p>Bem-vindo ao editor de Documentos do <strong>SpecLine</strong>.</p>
        <p>Use este espaço para escrever requisitos técnicos, rascunhos de arquitetura ou notas de reunião. O editor suporta formatação rica e, em breve, colaboração multiplayer!</p>
        <h2>Metas do Trimestre</h2>
        <ul>
          <li>Lançar a versão Alpha para 50 testadores.</li>
          <li>Atingir 90% de estabilidade de servidor.</li>
        </ul>
      HTML

      Document.create!(
        title: "PRD: Visão Geral do Produto",
        content: doc_content,
        project: project,
        user: @user
      )

      # 7. Add some fake activities to populate the feed
      # We just track a few things so the dashboard looks alive
      Activity.track(user: @user, workspace: workspace, trackable: project, action: "project_created", metadata: { name: project.name })
      Activity.track(user: @user, workspace: workspace, trackable: milestone, action: "milestone_created", metadata: { title: milestone.title })
    end
  rescue StandardError => e
    Rails.logger.error("Falha ao rodar OnboardingService para usuário #{@user.id}: #{e.message}")
  end
end
