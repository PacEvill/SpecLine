# SpecLine: Planejamento Ágil e Sprints (Roadmap)

Este documento centraliza o Roadmap (EAP) do SpecLine, detalhando as entregas de cada Sprint de acordo com as metas estabelecidas no planejamento acadêmico e técnico.

## 1. 🚀 Sprints Concluídas (Base Estrutural Entregue)

- [x] **Sprint 1: Infraestrutura Core & Documentos** (Docker, Devise, TipTap, Árvore de Arquivos)
- [x] **Sprint 2: Motor Kanban & Milestones** (SortableJS, Quadros)
- [x] **Sprint 3: Interface de Ideação & Comandos** (Whiteboard Rough.js, Barra Global ⌘K)
- [x] **Sprint 4: Visão 360° & Health Metrics** (Dashboards Iniciais)
- [x] **Sprint 5: Segurança & Docker Thruster** (Hardening, CSP, Rate Limiting)

## 2. 🏃 Sprints Atuais e Futuras (Foco: UI/UX, Multiplayer & I/O)

- [ ] **Sprint 6: Productization & Onboarding (Atual)**
  **Objetivo:** Transformar a aplicação de um "software cru" para um produto comercial com fluxos de onboarding, e-mails e dados de demonstração.

  **Sub-tasks:**
  - [x] Sub-task 6.1: Dashboard "Bento Box Híbrido" refinado com métricas claras.
  - [ ] Sub-task 6.2: Fluxos de Onboarding Inteligente (Projeto Demo Auto-Gerado para novos usuários).
  - [ ] Sub-task 6.3: Configuração e Templates de E-mails Transacionais (Resend) para boas-vindas e alertas.
  - [ ] Sub-task 6.4: Landing Page de conversão de Marketing (se aplicável ao MVP).

- [ ] **Sprint 7: Event Stacking & Calendar Connection**
  **Objetivo:** Dar vida ao widget de calendário do Dashboard, conectando-o com os prazos de Milestones e Issues do projeto.

  **Sub-tasks:**
  - [ ] Sub-task 7.1: Modelagem de Datas de Entrega (Due Dates) para Issues.
  - [ ] Sub-task 7.2: Conexão do calendário do Dashboard para listar eventos pendentes nos dias selecionados (Event Stacking).
  - [ ] Sub-task 7.3: Visualização em Timeline/Gantt simplificada para o Roadmap do Projeto.
  - [ ] Sub-task 7.4: Refinamento de UI (Alta Densidade) para Listas e Tabelas, inspirados em painéis utilitários modernos (Bagus Fikri / StartupVisuals).

- [ ] **Sprint 8: Comunicação Síncrona & Colaboração Multiplayer**
  - [ ] Sub-task 8.1: Chat em Tempo Real via Solid Cable (Sem Redis).
  - [ ] Sub-task 8.2: Notificações In-App e Contadores via Turbo Streams.
  - [ ] Sub-task 8.3: Colaboração Multiplayer & Awareness (Yjs) - Edição simultânea de Docs e cursores em tempo real.

- [ ] **Sprint 9: ActiveStorage, Exportações & Rastreabilidade**
  - [ ] Sub-task 9.1: Gestão de Arquivos via ActiveStorage (Drag & Drop em Issues/Docs).
  - [ ] Sub-task 9.2: Importação e Exportação Estruturada (Conversão/Exportação para PDF, DOCX, Markdown, e Parsing de CSV).
  - [ ] Sub-task 9.3: Rastreabilidade Extensionista & Relatório Semestral de PEI VI.

- [ ] **Sprint 10: Polimento de Design System Avançado**
  - [ ] Sub-task 10.1: Abas e Modais com CSS `clip-path: shape()` (Scoop Tabs).
  - [ ] Sub-task 10.2: Animações de Snap elásticas no Kanban e feedbacks de sucesso.

- [ ] **Sprint 11: Automações e Regras de Negócio Kanban**
  - [ ] Sub-task 11.1: Fechamento automático de Milestones e transições de status.

- [ ] **Sprint 12: Integração de Calendário Global**
  - [ ] Sub-task 12.1: Filtros dinâmicos de prazos em calendário geral.

- [ ] **Sprint 13: Central Help Desk Pública**
  - [ ] Sub-task 13.1: Publicação de documentos internos como Knowledge Base externa.

- [ ] **Sprint 14: Acessibilidade (WCAG) & Dark Mode Otimizado**
  - [ ] Sub-task 14.1: Lapidação estética, contraste e paletas (Terracota, Olive, Sage).

- [ ] **Sprint 15: Freeze Code, E2E & Bug Bash**
  - [ ] Sub-task 15.1: Testes massivos e homologação final para entrega.

---

## 3. 📦 Funcionalidades Engavetadas (Fase Enterprise / Pós-MVP)
- [ ] **Integração Avançada GitHub (Octokit):** Sincronização bidirecional de repositórios, linkagem de Pull Requests nas Issues (ex: `Fixes SPEC-12` fechando cartões automaticamente) e importação de commits para a timeline.
- [ ] **Importadores Universais (APIs):** Migração em 1 clique a partir do Jira, Trello e Notion.
- [ ] **Comunicação de Áudio/Vídeo (WebRTC):** Integração de huddles/canais de voz diretamente nos projetos usando LiveKit ou PeerJS, permitindo conversa síncrona durante a ideação no Whiteboard.
- [ ] **Figma API:** Renderização de telas do Figma ao vivo dentro dos Documentos e Whiteboard.
- [ ] **Integração Stripe (Billing SaaS)**
- [ ] **Inteligência Artificial (SpecBots)**: Assistentes autônomos no chat para criar issues via linguagem natural.
- [ ] **Geração de UI via IA (Artboard Workflow)**: Wireframes gerados por IA no Whiteboard.

---

## 4. 🎨 Catálogo de Referências & Inspirações de UI/UX

A premissa do SpecLine é garantir consistência de "produto final". As referências listadas aqui guiam a fluidez, o minimalismo inteligente e o uso de cores (ex: Laranja Terracota, Verde Oliva Claro).

### 4.1. Conceitos de Layout e Interações (Sprint 6+)
- **Bento Box, Dark Dashboards e Interações Premium:** Foco em cartões suspensos, glows sutis, grids minimalistas, layouts expansivos, padrões de hierarquia visual avançada e transições suaves de dados.
- **Micro-Widgets e Calendários (Inspiração: Nazmi Javier / InsporaDesign):** Integração de mini-calendários e mapas de calor diretamente nos painéis.
- **Interfaces Densas e Utilitárias (Inspiração: StartupVisuals / Jubayer / Bagus Fikri):** Aprimoramento de tabelas, data-grids e componentes de lista para suportar alta densidade de informação sem perder o respiro visual (utilizando micro-bordas, tipografia monospace para dados e contrastes rígidos).
- **Sidebar Aesthetic:** Glassmorphism, floating islands e hover states sutis focados em imersão.
- **Date Range Picker & Event Stacking:** Seletores fluídos de datas e expansão dinâmica de cards em calendários diários.
- **CSS `clip-path: shape()`:** Cantos entalhados (scooped corners) nativos para abas de navegação, sem poluir o DOM.

### 4.2. Aplicação Prática no Projeto
1. **Visão 360 / Bento Box (Sprint 6):** Refinar painéis com radiais, texturas suaves e o novo esquema de cores (Olive/Terracotta).
2. **Multiplayer Cursores (Sprint 8):** Aplicar paleta semântica aos cursores colaborativos de cada usuário.
3. **Modais e Uploads (Sprint 9):** Drag and Drop com feedbacks visuais expansivos.
