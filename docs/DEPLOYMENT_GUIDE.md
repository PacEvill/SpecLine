# Guia Completo de Deploy Passo a Passo — SpecLine

Este guia foi elaborado para que qualquer pessoa (mesmo sem experiência prévia em deploy) consiga colocar o **SpecLine** no ar em produção, com **investimento financeiro zero (R$ 0,00)**, alta performance e segurança de nível empresarial.

---

## 📋 Visão Geral da Infraestrutura Gratuita

| Serviço | Função | Plano | Custo |
| :--- | :--- | :--- | :---: |
| **GitHub** | Hospedagem do código-fonte e CI/CD | Free | **R$ 0,00** |
| **Neon.tech** | Banco de dados PostgreSQL Serverless (com PgBouncer) | Free (500 MB) | **R$ 0,00** |
| **Render.com** | Servidor de aplicação web (Docker + Thruster + Puma) | Hobby Free | **R$ 0,00** |
| **Cloudflare R2** *(Opcional)* | Armazenamento de fotos/anexos (compatível com S3) | Free (10 GB) | **R$ 0,00** |
| **Resend** *(Opcional)* | Envio de e-mails transacionais (ativação/recuperação) | Free (3.000/mês) | **R$ 0,00** |

---

## 🚀 Passo 1: Enviar o Código para o seu GitHub

Se você ainda não enviou as alterações para o seu repositório remoto:

1. Abra o terminal na pasta do projeto e execute:
   ```bash
   git add .
   git commit -m "feat(deploy): pre-deploy security hardening, render blueprint and capacity compliance"
   git push origin main
   ```

*(Certifique-se de que a branch `main` esteja atualizada no seu GitHub).*

---

## 🐘 Passo 2: Criar o Banco de Dados no Neon.tech (2 minutos)

O Neon fornece PostgreSQL em nuvem com auto-scaling e suspensão automática quando ocioso.

1. Acesse **[https://neon.tech](https://neon.tech)** e faça login (pode usar sua conta GitHub).
2. Clique no botão **"New Project"** (Novo Projeto).
3. Dê um nome ao projeto (ex: `specline-db`) e selecione a região mais próxima (ex: `US East (Ohio)` ou `South America (São Paulo)` se disponível).
4. Clique em **"Create Project"**.
5. Na tela seguinte (Dashboard do Neon), você verá a seção **"Connection Details"**:
   - Selecione a opção **"Pooled connection"** (recomendado para conexões concorrentes).
   - Copie a string de conexão completa (`DATABASE_URL`). Ela terá um formato como este:
     ```text
     postgres://neondb_owner:SENHA_SECRETA@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
6. Guarde essa URL para o próximo passo.

---

## ⚡ Passo 3: Criar e Configurar o Web Service no Render.com (3 minutos)

O Render fará o build do container Docker e executará o servidor com o proxy **Thruster** (`bin/thrust`).

1. Acesse **[https://render.com](https://render.com)** e faça login com seu GitHub.
2. No Dashboard do Render, clique em **"New +"** no canto superior direito e selecione **"Web Service"**.
3. Selecione a opção **"Build and deploy from a Git repository"** e clique em **Next**.
4. Localize e selecione o repositório **`SpecLine`** da sua lista.
5. Na tela de configuração do serviço, preencha os seguintes campos:
   - **Name:** `specline` (ou o nome de sua preferência)
   - **Region:** Escolha a mesma região do banco Neon (ex: `Ohio (US East)`).
   - **Branch:** `main`
   - **Runtime:** Selecione **`Docker`** (o Render detectará automaticamente o `Dockerfile` otimizado).
   - **Instance Type:** Selecione **`Free`** (512 MB RAM, 0.1 CPU).

6. Role até a seção **"Environment Variables"** (Variáveis de Ambiente) e adicione as seguintes chaves:

| Variável (Key) | Valor (Value) | Descrição |
| :--- | :--- | :--- |
| `RAILS_ENV` | `production` | Modo de execução em produção |
| `DATABASE_URL` | *(Cole a string copiada do Neon no Passo 2)* | Conexão com o PostgreSQL |
| `RAILS_MASTER_KEY` | *(Conteúdo do arquivo `config/master.key` local)* | Chave para descriptografar credenciais |
| `RAILS_LOG_LEVEL` | `info` | Nível de logs em produção |
| `RAILS_MAX_THREADS` | `5` | Número de threads concorrentes do Puma |
| `ACTIVE_STORAGE_SERVICE` | `local` *(ou `cloudflare_r2` se fizer o Passo 4)* | Onde salvar uploads |
| `APP_HOST` | *(Deixe em branco por enquanto; coloque o domínio do Render após criar)* | Host para links de e-mail |

7. Role até a seção **"Health Check Path"** e digite:
   ```text
   /up
   ```
   *(Isso garante que o Render saiba exatamente quando o Rails inicializou com sucesso).*

8. Clique no botão azul **"Create Web Service"**.

O Render iniciará a compilação do container Docker. O script `bin/docker-entrypoint` executará automaticamente `rails db:prepare` (criando as tabelas e migrações no Neon) e subirá o servidor com o proxy de aceleração **Thruster**!

---

## 📦 Passo 4 (Opcional): Configurar Armazenamento em Nuvem no Cloudflare R2

Por padrão, a aplicação pode rodar com armazenamento local (`ACTIVE_STORAGE_SERVICE=local`). Se desejar persistência permanente de fotos e anexos em nuvem com 10 GB gratuitos e Zero Taxa de Transferência:

1. Acesse **[https://dash.cloudflare.com](https://dash.cloudflare.com)** e crie uma conta gratuita.
2. No menu lateral, acesse **R2 Object Storage** e clique em **"Create Bucket"**.
3. Dê um nome ao bucket (ex: `specline-uploads`) e crie.
4. No menu lateral do R2, clique em **"Manage R2 API Tokens"** -> **"Create API Token"**:
   - Permissões: **Object Read & Write**.
   - Crie o token e copie o `Access Key ID` e `Secret Access Key`.
5. No Render, adicione as seguintes variáveis de ambiente ao seu Web Service:
   - `ACTIVE_STORAGE_SERVICE`: `cloudflare_r2`
   - `R2_ACCESS_KEY_ID`: *(Sua Access Key do R2)*
   - `R2_SECRET_ACCESS_KEY`: *(Sua Secret Key do R2)*
   - `R2_BUCKET`: `specline-uploads`
   - `R2_ENDPOINT`: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## ✉️ Passo 5 (Opcional): Configurar E-mails Transacionais com Resend

Para envio de e-mails de confirmação e recuperação de senha:

1. Acesse **[https://resend.com](https://resend.com)** e crie uma conta gratuita (3.000 e-mails/mês).
2. Vá em **API Keys** e gere uma nova chave de API (ex: `re_123456789`).
3. No Render, adicione as seguintes variáveis de ambiente:
   - `SMTP_ADDRESS`: `smtp.resend.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USERNAME`: `resend`
   - `SMTP_PASSWORD`: *(Sua chave de API `re_...`)*

---

## ✅ Passo 6: Validação Final e Acesso

1. No painel do Render, assim que os logs exibirem:
   ```text
   [Thruster] Listening on port 80...
   * Listening on http://0.0.0.0:3000
   * Application successfully started
   ```
2. Clique na URL gerada no topo do Render (ex: `https://specline.onrender.com`).
3. Cadastre sua primeira conta de usuário, crie seu primeiro Workspace e teste:
   - Criar uma nova Issue no Kanban.
   - Criar um novo Documento com formatação rica no TipTap.
   - Criar um novo Quadro Branco (Whiteboard) com desenho interativo.
   - Alternar entre o tema Claro e Escuro.

---

## 🔒 Garantias de Segurança Aplicadas Automaticamente

- **Nenhum arquivo local ou de teste foi para produção:** SQLite local, arquivos `tmp/`, `log/`, `.git/` e a pasta `test/` são estritamente excluídos via `.dockerignore` e `.gitignore`.
- **Proteção Anti-Brute-force:** O `Rack::Attack` já está ativo em produção bloqueando tentativas excessivas de login ou criação abusiva de contas.
- **Proteção de Upload:** O `SecureAttachable` inspeciona os bytes reais de imagens/anexos impedindo scripts camuflados de extensão.
- **Isolamento de Dados:** Cada usuário só enxerga os workspaces aos quais pertence.
