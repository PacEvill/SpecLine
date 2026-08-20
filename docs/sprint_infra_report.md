# Walkthrough: Integração do Login Social (Google OAuth)

A funcionalidade de autenticação social com o Google foi implementada com sucesso, seguindo estritamente as novas regras da **Constitution** e a filosofia do Clean Room TDD.

## Modificações na Arquitetura

### 1. Migrations (Banco de Dados)

- Criada a migração [20260819173108_add_omniauth_to_users.rb](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/db/migrate/20260819173108_add_omniauth_to_users.rb) contendo os campos `provider` e `uid`, além de um índice composto único para acelerar e garantir a segurança das buscas de usuários associados a contas do Google.

### 2. Clean Room TDD (Contratos de Arquitetura)

Antes de qualquer código ser alterado em `app/`, construímos os contratos em `test/`:

- [user_omniauth_contract_test.rb](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/test/models/user_omniauth_contract_test.rb): Garante que a classe de Usuário saiba interpretar o payload retornado pelo Google (AuthHash) e criar o cadastro corretamente, ou fazer login de uma conta já existente.
- [omniauth_callbacks_controller_test.rb](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/test/controllers/users/omniauth_callbacks_controller_test.rb): Valida o comportamento da requisição no controlador, conferindo o redirecionamento pós-login e a exibição correta do flash notice.

### 3. Código Fonte (Fulfillment)

Com os contratos firmados, a implementação seguiu:

- **Model**: A model [User](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/app/models/user.rb) recebeu a tag `:omniauthable` e o método `from_omniauth` gerando usuários dinamicamente.
- **Controller**: O [OmniauthCallbacksController](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/app/controllers/users/omniauth_callbacks_controller.rb) foi criado contendo a action `google_oauth2`.
- **Rotas**: O arquivo [routes.rb](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/config/routes.rb) agora direciona o Devise para utilizar o nosso novo controlador de callbacks.

### 4. Tracking

- O [SPRINTS.md](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/docs/SPRINTS.md) foi atualizado para rastrear esta entrega na etapa "Sprint Infra & Setup".

## Próximos Passos Obrigatórios (Para Você)

> [!IMPORTANT]
> Apenas para relembrar: como o ambiente precisava das gems novas que incluímos antes, você precisa rodar no seu terminal local os comandos finais para aplicar as mudanças:
>
> 1. `bundle install`
> 2. `bin/rails db:migrate`
> 3. `bundle exec rubocop -a` (Para que o Lint faça o auto-fix exigido pela constituição no código gerado).

Feito isso, se você preencher o `.env` com as chaves do Google, o botão de login já funcionará!
Qual a próxima meta do nosso Sprint?
