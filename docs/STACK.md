# Stack Tecnológica Completa — SpecLine

Para garantir que o projeto seja desenvolvido em um sprint ágil (3 a 4 dias) por um **desenvolvedor solo** com **investimento financeiro zero (R$ 0,00)**, a stack adota o padrão de **Monólito Modular no Ruby on Rails 8**. Esse modelo maximiza a velocidade de codificação, elimina a sobrecarga de manter microsserviços ou servidores de mensageria separados e entrega alta performance sem custos operacionais.

---

## 1. Núcleo do Sistema (Backend & Framework)

- **Ruby on Rails 8 (v8.1.x):** Framework web full-stack principal, utilizando geradores de código, convenções sobre configurações e arquitetura MVC moderna.
- **Hotwire:** Padrão nativo do Rails para reatividade e experiência de SPA em tempo real sem complexidade de frameworks JavaScript pesados:
  - **Turbo Drive & Turbo Frames:** Navegação ultrarrápida e atualização parcial de páginas com requisições HTML assíncronas.
  - **StimulusJS:** Framework JavaScript minimalista e focado em comportamentos pontuais de interface (modais, validação em tempo real, toggles).
- **Propshaft & esbuild:** Pipeline moderno de assets que realiza o empacotamento ultrarrápido de módulos JavaScript (ESM) e CSS compilado.
- **Bootsnap:** Pré-compilação de bytecode Ruby para otimizar o tempo de inicialização da aplicação no servidor.
- **Jbuilder:** Construção declarativa de payloads JSON para APIs internas e integrações.

---

## 2. Estilização, Design System e Frontend

- **Tailwind CSS (v3.4.x):** Framework de CSS utilitário integrado via PostCSS e Autoprefixer, permitindo prototipação ágil e classes de componentes customizadas (`@layer components`).
- **Design System Editorial / Fable:** Paleta de cores semântica personalizada (`fable`, `ink`, `terracotta`, `sage`) com tipografia moderna via Google Fonts (**Instrument Sans** para corpo de texto e **Newsreader** com serifa editorial para títulos).
- **Lucide Icons / Heroicons:** Ícones vetoriais modernos em SVG inline, garantindo leveza e eliminando bibliotecas pesadas de fontes de ícones.

---

## 3. Componentes Específicos dos Módulos (Planejados para o Sprint)

- **Módulo de Documentação:** **TipTap** (Headless Rich Text) integrado com suporte a Markdown, blocos de código e exportação limpa.
- **Módulo de Tarefas e Tempo (Kanban):** **SortableJS** para movimentação fluida de cards via Drag & Drop, sincronizado via Turbo Streams com persistência assíncrona.
- **Módulo de Relatórios e Métricas B2B:** **Chartkick + Groupdate** para geração de gráficos estatísticos, e **Prawn** ou **Grover** para emissão de relatórios consolidados em PDF.
- **Comunicação Contextual:** Chat interno contextual por demanda e documento, eliminando ruído de canais genéricos.

---

## 4. Autenticação, Persistência e Dados

- **Devise (v5.0):** Autenticação robusta para cadastro, controle de sessões, encriptação de senhas com `bcrypt`, recuperação de acessos e rotas customizadas.
- **OmniAuth Google OAuth2:** Login social via conta Google para facilidade de onboarding.
- **SQLite3 (v2.1+):** Banco de dados relacional leve e sem configuração para desenvolvimento local e suíte de testes.
- **PostgreSQL Serverless (Neon.tech):** Banco de dados relacional de produção no plano gratuito, com *Connection Pooling* nativo (PgBouncer) e ativação automática (*Auto-Wake* em < 1s).
- **Active Storage + ImageProcessing (libvips):** Gerenciamento e transformação de uploads (fotos de perfil, anexos de documentos e exportações de quadro).

---

## 5. Infraestrutura, Implantação e Operações (DevOps R$ 0,00)

### 5.1. Containerização e Servidor de Aplicação

- **Docker Multi-Stage Build:** Imagem de produção otimizada com Ruby 3.4, alocador de memória `jemalloc` (economia de ~30% de RAM) e execução segura em usuário não-root.
- **Thruster (`bin/thrust`):** Proxy HTTP/2 de alta performance criado pela Basecamp que fornece terminação TLS, compressão Brotli/Gzip, cache de assets estáticos na memória e bufferização de requisições.
- **Puma:** Servidor web multi-thread concorrente nativo do Rails.

### 5.2. Hospedagem e Borda (Edge)

- **Render.com (Hobby Free Tier):** Web Service gratuito com deploy contínuo automatizado a partir da branch `main` do GitHub via Docker.
- **Cloudflare (Free Tier):** Gerenciamento de DNS, mitigação DDoS, certificados SSL/TLS automáticos e CDN global que absorve 70% a 85% do tráfego estático antes do servidor.
- **Kamal (`config/deploy.yml`):** Orquestrador de deploy sem downtime em containers para qualquer VPS quando houver migração de escala.

### 5.3. Processamento Assíncrono e Tempo Real (Solid Stack)

- **Solid Queue:** Filas de background jobs (envio de emails, relatórios pesados) persistidas no banco relacional, sem necessidade de servidores Redis dedicados.
- **Solid Cache:** Armazenamento de cache de fragments e queries em tabelas SQL dedicadas.
- **Solid Cable:** WebSockets em tempo real para atualizações de cards e chat sem dependências externas.

### 5.4. Serviços de Apoio em Nuvem

- **Cloudflare R2:** Armazenamento de arquivos compatível com S3 com **10 GB gratuitos para sempre** e **Zero Taxa de Transferência (Zero Egress)**.
- **Resend:** Serviço de envio de e-mails transacionais (ativação de conta e recuperação de senha do Devise) com cota de **3.000 e-mails/mês gratuitos**.

### 5.5. Integração Contínua, Testes e Qualidade (CI/CD)

- **GitHub Actions (`.github/workflows/ci.yml`):** Pipeline automático executando testes unitários, testes de sistema (`Capybara` + `Selenium`), verificação de segurança estática (**Brakeman**), auditoria de CVEs (**Bundler-Audit**) e linter de estilo (**RuboCop**).
- **Dependabot:** Monitoramento automatizado de atualizações e segurança de dependências.
- **Health Check Endpoint (`/up`):** Verificação de integridade e liveness probe do Rails para monitoramento contínuo de uptime.

---

## 6. Integrações e Escalabilidade Futura (Roadmap)

Conforme o SpecLine amadurece e cresce além do MVP, novas camadas tecnológicas serão integradas para suportar recursos avançados e monetização, mantendo a filosofia do Monólito Modular:

### 6.1. Faturamento e Pagamentos (Billing)
- **Stripe / LemonSqueezy:** Integração via webhooks e APIs oficiais para gerenciar assinaturas SaaS, controle de cotas de workspaces e faturamento B2B/B2C, garantindo conformidade fiscal internacional (Merchant of Record).
- **Pay (Gem):** Camada de abstração Ruby para gerenciar assinaturas, clientes e faturas independente do gateway de pagamento, facilitando trocas futuras se necessário.

### 6.2. Inteligência Artificial e Agentes (AI)
- **Model Context Protocol (MCP):** Adoção do padrão MCP para permitir que assistentes de IA se conectem de forma padronizada aos repositórios e bases de conhecimento do Workspace.
- **Langchain.rb / Ruby-OpenAI:** Abstrações para construção de pipelines de RAG (Retrieval-Augmented Generation), vetorização de especificações (Pgvector) e interação com LLMs (Gemini, Claude, OpenAI) diretamente no Rails.
- **Background AI Jobs:** Processamento de resumos, traduções ou análises preditivas via Solid Queue para não bloquear as threads principais.

### 6.3. Tempo Real de Alta Escala (WebSockets)
- Embora o **Solid Cable** atenda perfeitamente o estágio inicial, caso haja pico de acessos simultâneos (dezenas de milhares de conexões em chat e quadros colaborativos), haverá a migração contínua para o **AnyCable** (backend Go/Erlang) que remove a carga de manutenção de conexões longas dos processos Ruby/Puma.

### 6.4. Observabilidade e Telemetria (APM)
- **Sentry / AppSignal:** Monitoramento avançado de erros (Exceptions) em tempo real no frontend e backend, agregando tracing de performance para consultas lentas no PostgreSQL (N+1 queries).
- **Logster / Better Stack:** Centralização estruturada de logs para auditoria de segurança avançada, painéis de resposta a incidentes e gerenciamento de SLA/SLO.
