# DOCUMENTO OFICIAL DE PLANEJAMENTO E GESTÃO DO PROJETO

**Instituição de Ensino Superior**
**Curso:** Engenharia de Software / Ciência da Computação (6º Período)
**Disciplina:** Práticas Extensionistas Integradoras VI
**Equipe do Projeto:** Diego Silva Pereira Pacheco
**Data de Solicitação da Atividade:** 27 de Agosto de 2026
**Prazo Final de Homologação:** 27 de Novembro de 2026

**Projeto:** SpecLine — Unified Product Engineering Workspace
**Repositório Base:** https://github.com/PacEvill/SpecLine
**Ambiente de Produção:** https://specline.onrender.com

---

## SUMÁRIO EXECUTIVO

O presente documento foi elaborado para atender integralmente à atividade prática ministrada em 27 de agosto de 2026, com o objetivo de **exercitar o domínio das práticas iniciais de gerência de projetos aplicadas à Engenharia de Software e estabelecer uma articulação clara com o problema real do trabalho.**

O documento consolida as seguintes etapas:
1. **Levantamento de Requisitos e Problema Real:** Articulação do contexto do problema enfrentado no mercado e a proposta de solução, incluindo a lista completa de requisitos.
2. **Planejamento do Projeto:** Metodologias ágeis aplicadas, governança técnica e restrições de sustentabilidade.
3. **Backlog do Produto (EAP):** Estruturação do Backlog garantindo a cobertura de todos os requisitos levantados, complementado pelo Dicionário de Dados do modelo relacional.
4. **Planejamento em Sprints:** Mapeamento de entregas estruturado em sprints, especificando a alocação de recursos e a respectiva justificativa da priorização de cada ciclo, estendendo-se até o marco final em 27 de novembro de 2026.

*(Anexos complementares em PDF no repositório: Plano de Gerenciamento do Projeto e Relatório de Práticas Extensionistas Integradoras VI).*

---

## 1. LEVANTAMENTO DE REQUISITOS E PROBLEMA REAL

### 1.1 Articulação do Problema Real e Justificativa

No ecossistema moderno de desenvolvimento de software e gestão de produtos, as equipes enfrentam um problema severo de **fragmentação operacional e perda de contexto**. O fluxo de trabalho diário exige que especificações de produto (PRDs) fiquem em repositórios de documentação (como Notion ou Confluence), a gestão de tarefas em quadros ágeis (como Jira ou Trello), o desenho de arquitetura em quadros brancos virtuais (Miro) e as trocas de mensagens no Slack.

O problema real do trabalho a ser resolvido é a ineficiência, os altos custos de licenciamento e a falta de rastreabilidade gerados por este cenário descentralizado. A solução, o **SpecLine**, atua como um espaço de trabalho unificado ("Unified Workspace"), agregando edição rica de documentos, quadros Kanban reativos e diagramação vetorial em uma única infraestrutura sem custo de propriedade (TCO zero).

### 1.2 Metodologia de Levantamento de Dados

A validação do problema baseia-se em uma abordagem empírica. Encontra-se em fase de coleta de dados um questionário estruturado voltado ao público-alvo, criado via Google Forms (Acesso: `https://forms.gle/x1i9uhtfk5F32TAQ8`). Os requisitos abaixo foram consolidados a partir da identificação de dores dessas personas e do estudo da arquitetura das ferramentas líderes de mercado.

### 1.3 Requisitos Funcionais (RF)

| Código | Descrição do Requisito | Prioridade |
| :--- | :--- | :--- |
| **RF01** | **Autenticação:** O sistema deve permitir cadastro/login via e-mail e integração SSO (Google OAuth 2.0). | Essencial |
| **RF02** | **Multi-Tenant:** Criação e isolamento de múltiplos espaços de trabalho (Workspaces) para diferentes organizações. | Essencial |
| **RF03** | **Gestão de Projetos:** Criação de projetos com atributos customizados (ícones, cores, prefixos de tickets). | Essencial |
| **RF04** | **Edição Hierárquica de Documentos:** Editor TipTap com suporte a árvore de páginas (pastas), formatação rica e Markdown. | Essencial |
| **RF05** | **Modo Foco:** Alternância para escrita imersiva, ocultando barras laterais. | Desejável |
| **RF06** | **Kanban Reativo:** Quadro ágil com colunas de status, movimentação (Drag & Drop) e sincronização em tempo real. | Essencial |
| **RF07** | **Metas (Milestones):** Agrupamento de tarefas em ciclos de entrega (Sprints) com cálculo automático de conclusão. | Importante |
| **RF08** | **Classificação:** Criação de etiquetas semânticas (labels) configuráveis por projeto. | Importante |
| **RF09** | **Whiteboard:** Quadro branco de ideação colaborativa e renderização de diagramas (Mermaid.js). | Importante |
| **RF10** | **Busca Global (`⌘K`):** Paleta de navegação universal por atalhos indexando todo o Workspace. | Importante |
| **RF11** | **Gestão de Perfil e LGPD:** Edição de perfil e deleção completa (direito ao esquecimento) sem registros órfãos. | Essencial |

### 1.4 Requisitos Não-Funcionais (RNF)

| Código | Categoria | Critério de Aceitação Técnico |
| :--- | :--- | :--- |
| **RNF01** | Sustentabilidade Financeira | O Custo Total de Propriedade (TCO) deve ser estritamente R$ 0,00, operando nas camadas gratuitas de Render, Neon e Cloudflare. |
| **RNF02** | Performance (Tempo Real) | Navegação SPA (Turbo Drive) e WebSockets sem dependência de instâncias Redis pagas, utilizando Solid Stack (PostgreSQL). |
| **RNF03** | Qualidade (TDD) | Adoção da política "Clean Room TDD", garantindo testes unitários e de sistema executados previamente à codificação, com cobertura superior a 90%. |
| **RNF04** | Segurança Defensiva | Proteção contra XSS, ataques DoS (Rack::Attack) e validação binária severa de arquivos de upload. |

---

## 2. PLANEJAMENTO DO PROJETO E METODOLOGIA

A gestão da engenharia adota uma intersecção de práticas ágeis projetadas para eficiência:
*   **Kanban/Scrum Híbrido:** Execução por meio de Sprints orientadas a entregas incrementais. O fluxo contínuo garante flexibilidade enquanto as "Milestones" determinam prazos rígidos de homologação.
*   **Restrições Operacionais:** Toda decisão arquitetônica respeita a restrição de $0.00 de custo e a capacidade de processamento (512MB RAM e servidores PostgreSQL em plano Hobby).

---

## 3. BACKLOG DO PRODUTO (EAP) E DICIONÁRIO DE DADOS

O Backlog do Produto foi estruturado para abranger a totalidade dos requisitos levantados.

### 3.1 Estrutura Analítica do Projeto (Relacionamento com Requisitos)

*   **1. SpecLine Core (Cobertura: RNF01, RNF02, RNF04)**
    *   1.1 Orquestração Docker Multi-stage e CI/CD.
*   **2. Módulo de Autenticação e Multi-Tenant (Cobertura: RF01, RF02, RF11)**
    *   2.1 Autenticação Devise e Google OAuth2.
    *   2.2 Isolamento de Dados por Entidade Workspace.
*   **3. Módulo de Documentação (Cobertura: RF03, RF04, RF05)**
    *   3.1 Implementação do TipTap Engine e Persistência ActionText.
    *   3.2 Navegação em Árvore (Tree Explorer).
*   **4. Módulo de Gestão de Demanda e Fluxo (Cobertura: RF06, RF07, RF08)**
    *   4.1 Board Kanban com SortableJS (Drag & Drop).
    *   4.2 Gestão de Status Customizados, Labels e Milestones.
*   **5. Ideação Visual e Produtividade (Cobertura: RF09, RF10)**
    *   5.1 Integração Canvas/Whiteboard e Barra de Comando Global.

### 3.2 Dicionário de Dados do Modelo Relacional

O mapeamento estrutural das entidades do banco PostgreSQL implementado:

*   **`users`**: Armazena credenciais (e-mail, senha bcrypt `encrypted_password`), provedores de SSO OAuth e dados biográficos do titular (LGPD).
*   **`workspaces`**: Raiz lógica do sistema multi-tenant. Possui `user_id` (PK do criador) e configurações corporativas (nome, cor, tamanho da equipe).
*   **`projects`**: Subdivisão do Workspace (`workspace_id`), responsável por agrupar documentos, tarefas e quadros de um contexto (com datas e status).
*   **`documents`**: Nós da árvore de documentação. Possui `parent_id` (auto-relacionamento para estrutura de pastas), `content` (texto rico) e metadados de layout.
*   **`issues`**: Cartões de tarefas. Relaciona-se ao `project_id`, possui um `identifier` único (ex: SPEC-10), `priority` e vincula-se aos usuários (`creator_id`, `assignee_id`) e prazos (`due_date`).
*   **`issue_statuses` e `labels`**: Entidades de categorização que definem as colunas do Kanban (`category`: backlog, in_progress, done) e as etiquetas coloridas dos projetos.
*   **`milestones`**: Ciclos de meta, contendo `start_date` e `target_date`. Agrupa issues para cálculo de velocidade/progresso.
*   **`whiteboards`**: Armazena as sessões de ideação visual (`project_id`), persistindo o estado dos vetores gráficos no formato JSON (`content`) e texto Mermaid (`mermaid_code`).
*   **`comments` e `activities`**: Mecanismos de auditoria (Activity Logs) e colaboração polimórfica associada aos documentos e cartões.

---

## 4. PLANEJAMENTO EM SPRINTS, PRIORIZAÇÃO E RECURSOS

O cronograma a seguir delineia a evolução do projeto, segmentando rigorosamente as etapas que já foram implementadas daquelas que estão mapeadas para o futuro. Todo o alicerce de infraestrutura, bem como os módulos vitais (Documentos, Kanban, Autenticação e Segurança), encontra-se integralmente entregue e funcional até a data-base de **27/08/2026**. O período remanescente (até a entrega final em **27/11/2026**) está reservado para a expansão de aquisição de usuários, lapidação de UX e comunicação síncrona.

**Recursos Empregados:** A alocação consiste na atuação de um Desenvolvedor Solo (Full-Stack) conduzindo o projeto sob a metodologia de engenharia de software *Clean Room TDD*. Os recursos de infraestrutura em nuvem mantêm-se restritos aos limites estritos do *Free Tier* (Render.com, Neon.tech), resguardando o custo financeiro nulo.

| Sprint / Marco | Período de Execução | Escopo e Entregáveis | Justificativa da Priorização | Status Atual |
| :--- | :--- | :--- | :--- | :---: |
| **Sprint 1 & Infra** | 10/08 a 18/08/2026 | Arquitetura Core, Banco Multi-Tenant, Docker, Autenticação Devise/Google, e Motor de Documentos (TipTap + Árvore). | **Alta (Base Tecnológica):** Sem a autenticação e a persistência básica de dados, o workspace não opera. | **Homologado e Entregue** |
| **Sprint 2 & 3** | 18/08 a 24/08/2026 | Quadro Kanban (Drag&Drop), Colunas Customizadas, Milestones, Barra Global (`⌘K`) e Ideação (Whiteboard Vetorial). | **Alta (Core Business):** Representa o núcleo de valor do SpecLine (unificar documentos, tarefas e diagramas). | **Homologado e Entregue** |
| **Sprint 4 & 5** | 24/08 a 27/08/2026 | Painéis Visuais (Overview 360°), Hardening de Segurança (CSP, Rate Limiting, Validação Binária de Uploads). | **Alta (Confiabilidade):** Proteção do sistema contra vetores comuns de ataque antes do cadastro público. | **Homologado e Entregue** |
| **Sprint 6** | 28/08 a 06/09/2026 | Onboarding Inteligente com Projetos Demo e Disparo de E-mails Transacionais (Resend). | **Alta (Aquisição):** Indispensável para reter primeiros usuários beta reduzindo a curva de aprendizado. | **Em Execução (Atual)** |
| **Sprint 7** | 07/09 a 16/09/2026 | Foco Diário: Dashboard "Meu Dia" e Cronômetro (Pomodoro Timer) integrado ao fluxo de trabalho. | **Média (Engajamento):** Agrega recursos avançados de micro-produtividade diária para desenvolvedores. | **Planejado (A Iniciar)** |
| **Sprint 8** | 17/09 a 26/09/2026 | Comunicação Síncrona: Chat nos Projetos, sistema de menções (@) e notificações em tempo real. | **Alta (Colaboração):** Elimina a necessidade de uso de apps externos (ex: Slack) para resolver impedimentos. | **Planejado (A Iniciar)** |
| **Sprint 9** | 27/09 a 06/10/2026 | Central de Relatórios e Exportação estruturada (Geração nativa de PDFs para specs e atas). | **Média (Gerencial):** Facilita a comunicação com stakeholders externos e registro documental histórico. | **Planejado (A Iniciar)** |
| **Sprint 10** | 07/10 a 16/10/2026 | Componentes de Interface Avançados (Scoop Tabs CSS, Animações Fluidas de Event Stacking). | **Média (UI/UX):** Eleva a percepção de valor do produto refinando o design system editorial. | **Planejado (A Iniciar)** |
| **Sprint 11** | 17/10 a 26/10/2026 | Automações e Regras de Negócio Kanban (Fechamento automático de Milestones, transições de status). | **Alta (Eficiência):** Reduz o esforço manual da equipe na gestão e manutenção dos painéis de tarefas. | **Planejado (A Iniciar)** |
| **Sprint 12** | 27/10 a 05/11/2026 | Integração de Calendário Global e Date Picker Avançado (Filtros dinâmicos de prazos). | **Alta (Produtividade):** Oferece visualização clara de gargalos de entrega no mês para toda a equipe. | **Planejado (A Iniciar)** |
| **Sprint 13** | 06/11 a 13/11/2026 | Central Help Desk Pública (Knowledge Base) publicada diretamente dos documentos internos. | **Média (Suporte):** Permite criar tutoriais visíveis externamente sem duplicação de esforço. | **Planejado (A Iniciar)** |
| **Sprint 14** | 14/11 a 20/11/2026 | Lapidação do Design System, Correção de Acessibilidade (WCAG) e Dark Mode Otimizado. | **Média (Qualidade):** Polimento estético final da interface garantindo contraste legível em todos os temas. | **Planejado (A Iniciar)** |
| **Sprint 15** | 21/11 a 26/11/2026 | Freeze Code, Bateria Final de Testes End-to-End (E2E) e Correção Massiva de Bugs (Bug Bash). | **Alta (Homologação):** Garantia final de que a aplicação está íntegra, estável e imune a falhas em produção. | **Planejado (A Iniciar)** |
| **Marco Final** | **27/11/2026** | **Apresentação Oficial de PEI VI e Entrega Final da Plataforma ao Professor/Banca.** | O ciclo de desenvolvimento cessa oficialmente e inicia-se o período de defesa acadêmica. | **Entrega Final** |

