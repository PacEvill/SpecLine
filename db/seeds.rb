# Seeds de Exemplo para o SpecLine com Foco Extensionista e Práticas Presenciais

user = User.find_or_create_by!(email: "diego@universidade.edu.br") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.name = "Diego Silva Pacheco"
  u.terms_consent = true
end

workspace = user.workspaces.find_or_create_by!(name: "Engenharia de Software - Maricá") do |w|
  w.description = "Espaço de trabalho para projetos de Práticas Extensionistas Integradoras."
end

project = workspace.projects.find_or_create_by!(name: "SpecLine - Plataforma de Engenharia") do |p|
  p.description = "Plataforma de gestão de produtos, especificações técnicas e agendamento de práticas presenciais."
  p.status = "Em Andamento"
  p.progress = 75
  p.identifier_prefix = "SPEC"
end

# Práticas Extensionistas Presenciais de Exemplo
project.practical_sessions.find_or_create_by!(title: "Validação Prática de Arquitetura e Protótipo") do |s|
  s.user = user
  s.location = "Laboratório de TI 01 - Bancada 04"
  s.scheduled_at = Time.current - 1.day
  s.ends_at = Time.current - 1.day + 2.hours
  s.status = "completed"
  s.participant_name = "Diego Silva Pacheco"
  s.participant_email = "diego@universidade.edu.br"
  s.description = "Sessão presencial realizada no laboratório para homologação das funcionalidades do SpecLine com usuários finais."
  s.observations = "Check-in presencial confirmado com sucesso. Apresentação e testes de usabilidade concluídos com a banca."
end

project.practical_sessions.find_or_create_by!(title: "Oficina Extensionista: Capacitação em Testes de Software") do |s|
  s.user = user
  s.location = "Espaço Maker & Inovação - Sala 204"
  s.scheduled_at = Time.current.change(hour: 14, min: 0)
  s.ends_at = Time.current.change(hour: 16, min: 0)
  s.status = "in_progress"
  s.participant_name = "Comunidade Acadêmica / Estagiários"
  s.participant_email = "comunidade@universidade.edu.br"
  s.description = "Capacitação presencial 'mão na massa' demonstrando o fluxo de Kanban e documentação técnica no SpecLine."
  s.observations = "Sessão presencial em andamento na sala de inovação."
end

project.practical_sessions.find_or_create_by!(title: "Code Review & Auditoria Prática de Código") do |s|
  s.user = user
  s.location = "Laboratório 02 - Bancada 01"
  s.scheduled_at = Time.current + 2.days
  s.ends_at = Time.current + 2.days + 2.hours
  s.status = "scheduled"
  s.participant_name = "Equipe PEI VI"
  s.participant_email = "equipe@universidade.edu.br"
  s.description = "Reunião física de revisão de código, análise estática com Rubocop e testes end-to-end do sistema."
end

puts "Seeds de Práticas Presenciais carregados com sucesso para #{user.email}!"
