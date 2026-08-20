# SpecLine - Roadmap de Sprints & Desenvolvimento

Acompanhamento contínuo dos módulos e sprints do projeto SpecLine de acordo com a Constituição de Desenvolvimento e TDD.

## Sprints

- [x] **Sprint 1: Document Editor & Wiki System (Notion/Outline Tier)**
  - [x] Sub-task 1.1: Migração para TipTap Core + TaskList + Bubble Menu
  - [x] Sub-task 1.2: TOC interativo dinâmico e scroll spy
  - [x] Sub-task 1.3: Sistema de Capas (Cover Art) com gradientes e emojis
  - [x] Sub-task 1.4: Slash Commands Menu (`/` menu) e atalhos de teclado (`Ctrl+S`, `Ctrl+B`)
  - [x] Sub-task 1.5: Exportação em Markdown (`.md`) e duplicação de documentos
  - [x] Sub-task 1.6: Contrato TDD imutável (`DocumentFeatureContractTest` e `DocumentFeaturesSprintTest`)
  - [x] Sub-task 1.7: Tree/Explorer Navigation (`vscode_explorer_tree_sprint_test` e `document_tree_sprint_test`)
  - [x] Relatório da Sprint: `docs/sprint_1_documents_report.md`
- [x] **Sprint Infra & Setup: Deploy e APIs**
  - [x] Tradução e Adaptação da Constituição (`SPECLINE_CONSTITUTION.md`)
  - [x] Preparação de infraestrutura (`.env`, Neon Postgres, Cloudflare R2, Resend SMTP)
  - [x] TDD: Contratos de Arquitetura para OmniAuth (`UserOmniauthContractTest`)
  - [x] Integração do Google OAuth2 (`OmniauthCallbacksController`)
  - [x] Relatório da Sprint: `docs/sprint_infra_report.md`
- [x] **Sprint 2: Kanban & Issue Tracker Linear-Tier**
  - [x] Sub-task 2.1: Agrupamento dinâmico e múltiplos quadros por projeto (`boards_controller_test`)
  - [x] Sub-task 2.2: Ciclos e Milestones com cálculo de progresso e datas (`milestones_controller_test`)
  - [x] Sub-task 2.3: Filtros rápidos, tags coloridas e colunas customizáveis (`issue_statuses_controller_test`, `labels_controller_test`)
  - [x] Sub-task 2.4: Drag & Drop reativo via SortableJS + Turbo Streams
- [x] **Sprint 3: Global Command Palette (`⌘K`) & Visual Canvas (Whiteboards)**
  - [x] Sub-task 3.1: Command Palette indexada para issues, documentos, quadros e navegação (`search_controller_test`)
  - [x] Sub-task 3.2: Quadro Branco / Whiteboard vetorial interativo com RoughJS e persistência em tempo real (`whiteboards_controller_test`, `whiteboard_test`)
- [x] **Sprint 4: Ecossistema Unificado & Visão Geral 360° do Projeto**
  - [x] Sub-task 4.1: Painel 360° de métricas e saúde do projeto (`project_ecosystem_overview_test`)
  - [x] Sub-task 4.2: Integração cruzada de ferramentas (Docs, Issues, Whiteboards, Milestones, Atividades)
  - [x] Sub-task 4.3: Perfil da Conta & Preferências (Avatar com validação magic bytes, edição de perfil, tema claro/escuro)
  - [x] Sub-task 4.4: Conformidade LGPD & Exclusão Segura de Conta (anonimização com `nullify` e exclusão limpa)
- [x] **Sprint 5: Security Hardening & Pre-Deploy Certification**
  - [x] Sub-task 5.1: Rack::Attack (proteção contra brute-force e DoS com limites em login, registro e WebSockets)
  - [x] Sub-task 5.2: Content Security Policy (CSP) estrito e cabeçalhos de segurança HTTP em produção
  - [x] Sub-task 5.3: Validação binária de uploads por Magic Bytes via `Marcel` (`SecureAttachable`)
  - [x] Sub-task 5.4: Sanitização HTML de Rich Text para proteção contra Stored XSS (`HtmlSanitizer`)
  - [x] Sub-task 5.5: Proteção IDOR e isolamento multi-inquilino com fallback 404 seguro
  - [x] Sub-task 5.6: Docker Multi-Stage com `jemalloc` + `Thruster` + usuário não-root
  - [x] Sub-task 5.7: Pipeline de CI/CD e SAST (`.github/workflows/ci.yml`, `.github/workflows/security.yml`, `render.yaml`)
  - [x] Testes de Integração Exaustivos: `exhaustive_platform_test.rb` e `security_hardening_test.rb` (114 testes, 335 asserções, 0 falhas)
