# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.2.0] - 2026-08-21

### 🚀 Adicionado
- **Autenticação Google OAuth 2.0:** Suporte oficial para login e cadastro com um clique via Google, com vinculação automática de contas existentes e extração segura de avatares.
- **Proteção Anti-Bot Cloudflare Turnstile:** Integração inteligente e invisível contra abusos e bots nos fluxos de autenticação, com validação resiliente no backend.
- **Navegação de Preferências Mobile (`_settings_mobile_nav`):** Nova barra de navegação responsiva com rolagem horizontal no modal de configurações para dispositivos móveis, categorizando Perfil, Preferências, Segurança e Notificações de forma limpa.
- **Conjunto Completo de Favicons & App Icons:** Geração e padronização dos ativos `public/icon.png` (512x512), `public/favicon.ico` (multi-resolução) e `public/icon.svg` com tempo de resposta `200 OK`.
- **Suíte de Testes de Segurança Integrada:** Implementação de testes automatizados (`SecurityHardeningTest`) validando isolamento IDOR multi-tenant, bloqueio de agentes maliciosos via Rack::Attack e cabeçalhos de segurança HTTP.

### 🛠️ Corrigido
- **Menu Hambúrguer Responsivo (CSP):** Migração do menu mobile da landing page para o controlador oficial do Hotwire Stimulus (`dropdown`), eliminando violações de Content Security Policy (`script-src-attr`) causadas por atributos inline `onclick`.
- **Compatibilidade de CSP em Desenvolvimento:** Isolamento da geração estrita de nonces dinâmicos para o ambiente de produção, evitando conflitos locais com o `web-console` do Rails (`utils.js`) e extensões de navegadores.
- **Sobreposição no Modo Zen / Foco Mobile:** Correção de conflito de z-index e visibilidade na visualização mobile de documentos, onde a barra global sobrepunha o botão de saída (`Sair do Modo Foco`).
- **Limpeza do Cabeçalho Mobile:** Remoção do botão redundante de alternância de tema no topo, centralizando as preferências visuais no modal oficial de Preferências.
- **Dependências PostgreSQL no Dockerfile:** Inclusão dos pacotes `libpq5` e `libpq-dev` no build multi-stage para garantir conectividade nativa e resiliente com o Neon PostgreSQL em produção.
- **Pipeline de CI (`bin/ci`):** Padronização da auditoria de vulnerabilidades JavaScript para utilizar nativamente `npm audit`.

### 🔒 Segurança
- **Auditoria de Vulnerabilidades 100% Limpa:** 
  - `Brakeman 8.0.6`: 0 vulnerabilidades e 0 avisos em 27 controllers, 14 models e 93 templates.
  - `Bundler-Audit`: 0 CVEs em dependências Ruby.
  - `NPM Audit`: 0 vulnerabilidades em pacotes Node.js.
  - `RuboCop`: 152 arquivos inspecionados sem ofensas.
- **Isolamento de Tenant Estrito:** Verificação de que consultas e acessos a workspaces, projetos e documentos são estritamente restritos ao usuário autenticado, retornando `404 Not Found` em tentativas de acesso indevido (IDOR).

---

## [1.1.0] - 2026-08-19

### 🚀 Adicionado
- **Quadro Branco Interativo & Diagramas:** Integração completa do Whiteboard com suporte a diagramas Mermaid.js e renderização artística via Rough.js.
- **Editor TipTap & Estrutura em Árvore:** Gestão hierárquica de documentos e páginas wiki com ordenação por arrasto e alternância para o Modo Word (Zen Mode).
- **Comunicação em Tempo Real:** Sistema de chat contextual por projeto com Turbo Streams e ActionCable operando sobre o Solid Cable.
- **Gestão de Tarefas (Kanban):** Quadro Kanban interativo com colunas customizáveis, estimativas, prioridades e acompanhamento por marcos (Milestones).
- **Armazenamento em Nuvem (Active Storage + Cloudflare R2):** Suporte a uploads de arquivos com validação de cabeçalhos binários reais (Magic Bytes) via gema Marcel e limite de 5MB.

### 🔒 Segurança
- **Proteção contra Brute Force (Rack::Attack):** Configuração de limites de requisições (`req/ip`), proteção de endpoints de login (`logins/ip`) e bloqueio automático de scanners conhecidos (`sqlmap`, `nikto`, `dirbuster`).
- **Sanitização de Rich Text (`HtmlSanitizer`):** Filtragem estrita de tags e atributos HTML para prevenir ataques de Stored XSS em documentos colaborativos.

---

## [1.0.0] - 2026-08-12

### 🚀 Adicionado
- **Lançamento Inicial da Plataforma SpecLine:**
  - Arquitetura Modular Monolith baseada no Rails 8 Solid Stack (`solid_cache`, `solid_queue`, `solid_cable`).
  - Autenticação nativa com Devise (bcrypt cost: 12) e verificação de integridade de sessão.
  - Design system refinado com Tailwind CSS v4, suporte a Modo Escuro/Claro automático e tipografia editorial.
  - Estrutura multi-tenant com múltiplos workspaces e isolamento contextual de projetos.
