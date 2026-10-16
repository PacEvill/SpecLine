# SpecLine: Planejamento Ágil e Sprints (Roadmap)

Este documento centraliza o Roadmap (EAP) do SpecLine, detalhando as entregas de cada Sprint de acordo com as metas estabelecidas no planejamento acadêmico e técnico.

## 1. 🚀 Sprints Concluídas (Base Estrutural Entregue)

- [x] **Sprint 1: Infraestrutura Core & Documentos** (Docker, Devise, TipTap, Árvore de Arquivos)
- [x] **Sprint 2: Motor Kanban & Milestones** (SortableJS, Quadros)
- [x] **Sprint 3: Interface de Ideação & Comandos** (Whiteboard Rough.js, Barra Global ⌘K)
- [x] **Sprint 4: Visão 360° & Health Metrics** (Dashboards Iniciais)
- [x] **Sprint 5: Segurança & Docker Thruster** (Hardening, CSP, Rate Limiting)

## 2. 🏃 Sprints Atuais e Futuras (Foco: UI/UX, Multiplayer & I/O)

- [x] **Sprint 6: Productization & Landing Page (Concluída em 24/09/2026)**
  **Objetivo:** Transformar a aplicação de um "software cru" para um produto comercial com fluxos de onboarding, páginas de soluções e nova Landing Page institucional.

  **Sub-tasks:**
  - [x] Sub-task 6.1: Dashboard "Bento Box Híbrido" refinado com métricas claras.
  - [x] Sub-task 6.2: Fluxos de Onboarding e consentimento LGPD explícito no cadastro.
  - [x] Sub-task 6.3: Configuração e documentação de infraestrutura em nuvem (Render, Neon, Resend).
  - [x] Sub-task 6.4: Landing Page institucional, páginas de soluções setoriais e tabela de preços.

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

- [ ] **Sprint 16: Conformidade com Feedback PEI VI (Code Review 24/09/2026)**
  **Objetivo:** Adequar repositório, documentação e posicionamento ao _Feedback · SpecLine — Code Review · PEI VI Maricá · 24/09/2026_, separando claramente **Software (Produto)** x **Proposta Extensionista (PEI VI)**, fortalecendo as páginas de posicionamento (`solutions/academic` e `solutions/extension`), melhorando fluxo clicável + _empty states_ e revisando pontos de segurança/boas práticas. Manter todos os testes existentes verdes (regressão zero).

  **Critérios de Aceite Gerais:**
  - [ ] Todos os testes existentes continuam passando (`bin/rails test` → 128 runs, 0 failures, 0 errors).
  - [ ] Não há quebra de funcionalidades existentes (sem regressões no core: Workspaces/Projects/Documents/Boards/Issues/Whiteboards/Auth).
  - [ ] Navegação mantém happy path funcional e clicável.
  - [ ] Documentação coerente entre README, `docs/` e views de posicionamento.

  **Sub-tasks:**

  - [ ] **Sub-task 16.1: README – Separação clara Software × Extensão (P0)**
    **Escopo:** Reestruturar [`README.md`](README.md) para separar fronteiras conceituais (produto vs ação extensionista), conforme apontado no feedback.

    **Tarefas:**
    - [ ] 16.1.1: Reorganizar estrutura: (1) Visão Geral/Proposta de Engenharia (Software), (2) Demonstração/Galeria, (3) Arquitetura & Topologia, (4) Matriz Tecnológica, (5) Documentação Técnica (`docs/`), (6) Ambiente Dev/QA, (7) Build/Docker, (8) **Extensão Universitária (PEI VI)** (seção enxuta com referência a `docs/academic/`), (9) Como Contribuir, (10) Licença/Contexto Institucional.
    - [ ] 16.1.2: Mover o bloco pesado de PEI VI/Maricá (identificação, território, local/parceiro, dados da oficina, links de plano/roteiro) do corpo principal do README para referência direcionada em `docs/academic/`, mantendo apenas um parágrafo conciso no README sobre vínculo extensionista.
    - [ ] 16.1.3: Deixar explícito que o SpecLine é uma **ferramenta genérica** (serve estudantes, extensionistas, times de produto e agências), com distinção clara entre _produto de software_ e _proposta de ação extensionista_.
    - [ ] 16.1.4: Revisar links cruzados (apontar para [`docs/academic/Planejamento_Gestao_SpecLine_PEI_VI.md`](docs/academic/Planejamento_Gestao_SpecLine_PEI_VI.md), [`docs/academic/oficina-marica.md`](docs/academic/oficina-marica.md), [`docs/oficina-marica.md`](docs/oficina-marica.md), [`docs/academic/PLANO DE AÇÃO EXTENSIONISTA.docx`](docs/academic/PLANO%20DE%20AÇÃO%20EXTENSIONISTA.docx)) sem duplicar excesso de informação.

    **Critério de Aceite:** README mais focado em produto, seção extensionista enxuta + referências claras. Sem perda de informações relevantes (tudo permanece acessível em `docs/academic/`).

  - [ ] **Sub-task 16.2: Solutions – Fortalecer `solutions/academic` (Estudantes) (P0)**
    **Escopo:** Completar [`app/views/solutions/academic.html.erb`](app/views/solutions/academic.html.erb) com conteúdo objetivo e útil para estudantes (TCC, trabalhos de disciplina, PEI, grupos de projeto).

    **Tarefas:**
    - [ ] 16.2.1: Definir estrutura clara: Título, Problema (desafios de organização/documentação em trabalhos acadêmicos), Público-alvo (estudantes de graduação/engenharia), Solução (como SpecLine resolve), Benefícios práticos (documentação unificada, Kanban, rastreabilidade, whiteboard, colaboração), Casos de Uso (TCC, PBL, projetos de disciplina, PEI), CTA para experimentar/plataforma.
    - [ ] 16.2.2: Usar tom objetivo, sem vincular a oficina/Professor Victor (manter neutro). Destacar valor prático (mesma plataforma, casos de uso acadêmicos).
    - [ ] 16.2.3: Garantir semântica HTML acessível (headings hierárquicos, textos legíveis) e consistência com estilo existente (Tailwind v4).
    - [ ] 16.2.4: Revisar renderização da view (sem erros, carrega corretamente nas rotas `/solutions/academic`).

    **Critério de Aceite:** Página explica claramente caso de uso acadêmico, diferencia posicionamento sem duplicar produto, mantém consistência visual/semântica.

  - [ ] **Sub-task 16.3: Solutions – Fortalecer `solutions/extension` (Projetos de Extensão) (P0)**
    **Escopo:** Completar [`app/views/solutions/extension.html.erb`](app/views/solutions/extension.html.erb) com posicionamento claro para projetos de extensão universitária.

    **Tarefas:**
    - [ ] 16.3.1: Estruturar: Problema (organização/registro/documentação de ações extensionistas), Público-alvo (extensionistas, coordenadores de projeto), Solução (SpecLine como hub de especificação + planejamento + organização), Benefícios (planejamento, documentação estruturada, organização de entregas, rastreabilidade, transparência), Casos de Uso (projetos de extensão, ações comunitárias, registro de atividades).
    - [ ] 16.3.2: Tratar vínculo PEI VI como **contexto de origem (opcional/referencial)**, sem travar em dados fixos da oficina (seguir abordagem _placeholder_ acordada). Focar em **valor geral** para extensão.
    - [ ] 16.3.3: Reforçar mensagem: "mesma plataforma, diferentes casos de uso" (produto genérico vs posicionamento por público).
    - [ ] 16.3.4: Garantir acessibilidade, consistência Tailwind e renderização sem erros em `/solutions/extension`.

    **Critério de Aceite:** Página clara, objetiva, coerente com 16.1/16.2, evita misturar excessivamente produto x ação extensionista (mantém fronteira adequada).

  - [ ] **Sub-task 16.4: UX – Fluxo Clicável + Empty States (P1)**
    **Escopo:** Revisar happy path completo (Home → Workspace → Projeto → Documentos/Kanban/Whiteboard) e adicionar/refinar _empty states_ com CTAs úteis, conforme feedback.

    **Tarefas:**
    - [ ] 16.4.1: **Fluxo clicável (happy path):** Inspecionar e validar navegação principal: breadcrumbs, links, botões, redirecionamentos. Cobrir fluxos críticos em [`app/views/projects/show.html.erb`](app/views/projects/show.html.erb), [`app/views/documents/`](app/views/documents/), [`app/views/boards/`](app/views/boards/), [`app/views/whiteboards/`](app/views/whiteboards/), [`app/views/shared/`](app/views/shared/).
    - [ ] 16.4.2: **Empty States – Projetos/Workspaces:** Revisar telas vazias (sem documentos, sem issues, sem quadros, sem whiteboards). Adicionar mensagens claras + CTAs acionáveis (ex.: "Criar primeiro documento", "Criar quadro Kanban", "Criar whiteboard").
    - [ ] 16.4.3: **Empty States – Documentos:** Melhorar experiência quando árvore vazia/sem conteúdo (orientar próximo passo).
    - [ ] 16.4.4: **Empty States – Boards/Kanban:** Orientar criação de colunas/issues quando quadro vazio.
    - [ ] 16.4.5: **Empty States – Whiteboards:** Sugerir criação/uso quando não há itens.
    - [ ] 16.4.6: Teste manual rápido do fluxo completo (sem quebrar links/rotas). Verificar ausência de dead-ends óbvios.

    **Critério de Aceite:** Fluxo navegável sem quebras, empty states úteis (orientam ação), UX mais polida sem alterar lógica de negócio.

  - [ ] **Sub-task 16.5: Segurança/Boas Práticas – Revisão `config/master.key` (P1)**
    **Escopo:** Avaliar presença/versionamento de [`config/master.key`](config/master.key) no repositório, documentar decisão de forma objetiva (boa prática de segurança) sem quebrar deploy existente (Render já usa `RAILS_MASTER_KEY`).

    **Tarefas:**
    - [ ] 16.5.1: Verificar histórico/uso: confirmar se chave é de ambiente dev/local ou compartilhada. Avaliar risco/adequação (melhor prática: não versionar master.key em repositórios públicos; usar variáveis de ambiente em produção).
    - [ ] 16.5.2: Documentar **decisão justificada** no commit/PR (ou em `docs/architecture/SECURITY_BLUEPRINT.md` se relevante): manter como está (compatibilidade com setup atual/Render) OU propor ajuste (gitignore + instruções). Decisão pragmática p/ contexto acadêmico, com registro claro.
    - [ ] 16.5.3: Caso optar por ajustar, atualizar `.gitignore` (se aplicável), `.env.example` com orientações e `README.md` (seção Dev Local) com instruções de geração/uso de chaves, **sem expor segredos**.
    - [ ] 16.5.4: Garantir que não quebra build/deploy (produção usa `RAILS_MASTER_KEY` via env). Validar configuração em `config/environments/production.rb`/deploy se necessário.

    **Critério de Aceite:** Ponto avaliado e **documentado com clareza**. Decisão registrada (pragmática, segura e não-bloqueante p/ PEI). Nenhum segredo novo exposto.

  - [ ] **Sub-task 16.6: Metadados, Links e Consistência (P2)**
    **Escopo:** Pequenos ajustes cosméticos apontados no feedback (homepage GitHub, consistência de links, referências cruzadas).

    **Tarefas:**
    - [ ] 16.6.1: Avaliar metadados do repositório (homepage GitHub `null` vs demo em README). Verificar se cabe ajustar (não crítico). Registrar decisão.
    - [ ] 16.6.2: Revisar coerência entre rotas ([`config/routes.rb`](config/routes.rb)) e links em views (`marketing_header`, `marketing_footer`, home) para `solutions/*` (academic/education/extension).
    - [ ] 16.6.3: Garantir que páginas `solutions/*` existentes estão consistentes com novo conteúdo (links, títulos, semântica).
    - [ ] 16.6.4: Revisar referências cruzadas README ↔ `docs/academic/` ↔ `docs/oficina-marica.md` (evitar duplicação desnecessária).

    **Critério de Aceite:** Consistência de navegação/links, metadados documentados (sem alteração disruptiva).

  - [ ] **Sub-task 16.7: Verificação de Regressão & Homologação Sprint 16 (P0)**
    **Escopo:** Garantir conformidade integral sem regressões.

    **Tarefas:**
    - [ ] 16.7.1: Executar suíte completa: `bin/rails test` → validar **128 runs, 386 assertions, 0 failures, 0 errors, 0 skips** (manter baseline).
    - [ ] 16.7.2: Smoke test manual rápido: Home, Login/Google OAuth, Workspaces→Projetos, Documents (TipTap), Boards/Kanban, Whiteboards, Search (⌘K), Solutions (academic/education/extension).
    - [ ] 16.7.3: Revisar páginas alteradas renderizam sem erros (logs limpos em dev).
    - [ ] 16.7.4: Atualizar status no [`docs/SPRINTS.md`](docs/SPRINTS.md) (marcar subtasks concluídos) e consolidar evidências no PR/commit.

    **Critério de Aceite:** Testes verdes inalterados, smoke test OK, páginas de solutions com conteúdo adequado, README com fronteiras claras Software×Extensão.

- [x] **Sprint 17: Sidebars Universal × Contextual (porte do concept para dev)**
  **Objetivo:** Portar as decisões de `docs/design_concepts/workspaces_concept.html` para `app/views/shared/` sem regressões (128 runs verdes).
  - [x] Trilha (`_global_sidebar`): ordem busca → workspaces → inbox(breve) → atividades → calendário(breve) → agenda(breve) → tarefas; `Painéis (360)` removido; `breve` como `span[aria-disabled]` honesto; logo com `title`.
  - [x] Painel (`_workspace_sidebar`): 3 modos (`@project` → projeto+switcher+filtros+tags; `@workspace` → diretório+tags; `nil` → seletor global + continuar + geral); fim do fallback `workspaces.first` (`app.html.erb`); diretório com abertas + switcher com selo `aqui`; `Membros`/`Configurar` unificados na zona de configuração do rodapé; `Trocar` oculto no global; header `Dashboard Global` → `Workspaces`.
  - [x] Mobile bottom nav mantido (já usava só rotas reais). Hero/abas/simulações ficam só no concept (demo).

- [x] **Sprint 18: Auditoria da Rubrica PEI VI (16/10) — fontes organizadas**
  **Objetivo:** Zerar as deduções apontadas (Objetivos −0,3; Consistência −0,3; Forma/Dados −0,4) e indexar `docs/academic/` (`INDICE.md`).
  - [x] OE1/OE2 do Plano traduzindo stack em benefício extensionista (uso gratuito, sem instalação, método levado à comunidade).
  - [x] Fotos unificadas em "5 a 10" (atividade 4 + resultados + roteiro).
  - [x] Linha do diagnóstico com rótulo próprio (fim do texto duplicado/verticalizado p.2–3 na fonte `.docx`).
  - [x] `(21) 98765-4321` removido de `.docx`, README e roteiros; mantido `(21) 2637-0000` — confirmar números reais.
  - [ ] Reexportar `PLANO DE AÇÃO EXTENSIONISTA.pdf` e `oficina-marica.pdf` do `.docx` (sem LibreOffice neste ambiente) + transcrever o áudio do WhatsApp + remover um dos 2 Planos de Gerenciamento duplicados.

- [x] **Sprint 19: Correções da Auditoria de Código (P0) — backend, frontend e design (16/10)**
  **Objetivo:** Fechar os achados P0/P1 da auditoria backend+frontend+design, com regressão coberta (140 runs verdes).
  - [x] IDOR Whiteboards: `set_workspace` agora `current_user.workspaces.find` (sem fallback global) — `whiteboards_controller.rb`.
  - [x] XSS no feed de atividades: `Activity.formatted_message` escapa todo metadado (ERB::Util) antes do `html_safe`; testes com payload malicioso (`activity_test.rb`).
  - [x] Cross-tenant em Issues: `move` só aceita projeto do mesmo workspace; `board_id` validado no projeto de destino; `label_ids` recuperadas do escopo do workspace; `milestone_id`/`parent_id` do escopo do projeto (`scope_issue_references!`).
  - [x] Cross-tenant em Documents: `move` rejeita pai fora do projeto (404 JSON); `new`/`document_params` descartam pai de outra árvore.
  - [x] Comments: somente o autor remove; dono do workspace recebe alerta "Somente o autor pode remover o comentário." (não há conceito de membros ainda — caso negativo real).
  - [x] Milestones: `start_date` entra no permit e persiste (coluna já existia no schema).
  - [x] Turnstile: se segredo ausente em produção, loga erro explícito `[Turnstile] ... INATIVA` (evita bloqueio total em misconfiguração; nota no SECURITY_BLUEPRINT §5).
  - [x] Higiene: rota morta `home/index` removida (duplicada da raiz) e `OnboardingService` sem referências apagado.
  - [x] Links mortos `_overview_view`: `view: 'docs'` → `view: 'documents'` (2 ocorrências).
  - [x] Sidebar "Urgentes / Bloqueados": vira **"Prioridade alta"** com filtro real `view=list&filter=priority` (issues urgentes + alta) — sem vocabulário inventado.
  - [x] OAuth: botões GitHub/Apple mortos removidos de login e cadastro; Google efetivo em ambos.
  - [x] Fontes internas: `app.html.erb` carrega Inter/Fraunces/Newsreader/JetBrains Mono (fim do `Instrument Sans` residual da raiz comum).
  - [x] Dropdown: `closeOnEsc` como método nomeado (usado por `data-action` em `_board` e outros) e listener de `keydown` removido no `disconnect`.
  - [x] Kanban: hint de coluna vazia permanente no DOM (`hidden unless column_issues.empty?`), sincronizada no drag-and-drop por `updateCounts()`.
  - [x] Design tokens: `terracotta-dark` (inexistente) → `terracotta-hover` (10 arquivos); `py-0.2` → `py-0.5`; pares `dark:` faltantes em `issues/show` (Prazo) e `_list_view` (prioridade sem etiqueta, data).
  - [x] Regressão: `bin/rails test` → **140 runs, 416 assertions, 0 failures** (+12 testes dos P0 sobre o baseline 128/386). Prova grep: 0 ocorrências de `find_by…|| Workspace.find`, `#{metadata`, `view: 'docs'`, `tab: "board"`, `terracotta-dark`, `py-0.2`, `Instrument+Sans`, botões OAuth mortos e rota `home/index`.
  - [ ] Pendente P2: CSP `unsafe-eval`/`unsafe-inline` (cirurgia exige QA manual de navegador — adiado sem quebrar o deploy).

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
