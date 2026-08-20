# Relatório da Sprint 1: Módulo de Documentos & Wiki

## 1. Contexto e Motivação

O objetivo desta Sprint foi transformar o módulo de Documentação Técnica e PRD do **SpecLine** em uma experiência de produto final com nível de excelência comparável a ferramentas líderes de mercado (**Notion**, **Outline** e **Linear Docs**).

Anteriormente, o editor continha inconsistências visuais, ausência de capas customizáveis, índice lateral estático, repetição do identificador de projeto na barra lateral e duplicidade entre as abas superiores do projeto e a navegação lateral.

## 2. Tarefas Executadas

1. **Eliminação de Duplicidade de Navegação & Hierarquia Limpa**:
   - As visões do projeto (**Board, Lista, Milestones, Documentos**) ficaram concentradas exclusivamente nas abas horizontais do topo (`projects/_header.html.erb`).
   - A barra lateral esquerda (`_workspace_sidebar.html.erb`) foi redesenhada para gerenciar o contexto do **Workspace, alternância rápida entre Projetos, Tags e outros Workspaces**.
2. **Correção da Identidade Visual do Projeto**:
   - Adicionadas colunas `icon` e `color` na tabela `projects`.
   - Remoção da duplicação do texto "PRO" na barra lateral e substituição por ícone visual e tag de identificador.
   - Sincronização da exibição de logo e ícone entre a barra lateral e o cabeçalho do projeto.
3. **Editor TipTap Rico e Avançado**:
   - Correção do encapsulamento de formulários no DOM (remoção de formulários aninhados inválidos no `<header>`).
   - Integração do **Bubble Menu Flutuante** posicionado nativamente via coordenadas de seleção.
   - Suporte nativo a **Listas de Tarefas / Checklists interativos**, **Blocos de Código**, **Citações** e **Caixas de Destaque (Callouts)**.
   - **Menu de Comandos com Barra (`/` menu)** com botão de acesso direto na barra de ferramentas.
   - Atalhos de teclado essenciais (`Ctrl+S` / `Cmd+S` para salvamento imediato).
4. **Controlador Dropdown e Ações**:
   - Correção do `dropdown_controller.js` para suportar `target=menu` com clique externo e tecla `Esc`.
   - Ações de **Duplicação**, **Exportação para Markdown** e **Exclusão** operando diretamente via Turbo.
5. **Navegação & Índice TOC Dinâmico**:
   - Extração automática de títulos (`H1`, `H2`, `H3`) com scroll suave para a seção clicada.
   - Cálculo em tempo real de estatísticas de leitura (tempo estimado e contagem de palavras).
6. **Sistema de Capas (Cover Art) & Emojis**:
   - Seletor de gradientes e capas pré-definidas com controle de remoção e edição.
   - Seletor de emojis sincronizado com temas claro e escuro.

## 3. Arquivos Criados e Modificados

| Arquivo | Ação | Descrição |
| :--- | :--- | :--- |
| `app/models/document.rb` | Modificado | Métodos `to_markdown` e `duplicate!` |
| `app/controllers/documents_controller.rb` | Modificado | Ações `duplicate`, `export` e permissão de `cover_image` |
| `app/controllers/projects_controller.rb` | Modificado | Permissão de `icon` e `color` em `project_params` |
| `app/views/documents/show.html.erb` | Modificado | Correção de formulários, capa, bubble menu, slash menu, TOC e ações |
| `app/views/documents/new.html.erb` | Modificado | Suporte a capa, barra de formatação e layout responsivo |
| `app/views/projects/_header.html.erb` | Modificado | Sincronização do badge de ícone/logo e abas de visualização |
| `app/views/shared/_workspace_sidebar.html.erb` | Modificado | Eliminação de duplicidade de links e alternância de projetos |
| `app/javascript/controllers/dropdown_controller.js` | Modificado | Suporte robusto a alvos de menu flutuante e fechamento externo |
| `app/javascript/controllers/tiptap_controller.js` | Modificado | Slash commands, bubble menu nativo, atalhos `Ctrl+S` e estatísticas |
| `app/javascript/controllers/document_actions_controller.js` | Criado | Gerenciamento de capas, cópia de links e modo Zen |
| `test/models/document_feature_contract_test.rb` | Criado | Contrato de teste imutável TDD para modelo `Document` |
| `test/controllers/document_features_sprint_test.rb` | Criado | Testes de integração para exportação e duplicação |
| `db/migrate/20260819161109_add_cover_image_to_documents.rb` | Criado | Migração da coluna `cover_image` |
| `db/migrate/20260819161830_add_icon_and_color_to_projects.rb` | Criado | Migração das colunas `icon` e `color` |

## 4. Validação e Testes

Todos os testes foram desenvolvidos seguindo o ciclo estrito de **Clean Room TDD (Red-Green-Refactor)**.

```text
Running 50 tests in a single process
Finished in 7.155s, 6.9878 runs/s, 11.4600 assertions/s.
50 runs, 82 assertions, 0 failures, 0 errors, 0 skips (100% Passing)
```

## 5. Referências

- [`app/views/documents/show.html.erb`](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/app/views/documents/show.html.erb)
- [`app/views/shared/_workspace_sidebar.html.erb`](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/app/views/shared/_workspace_sidebar.html.erb)
- [`app/views/projects/_header.html.erb`](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/app/views/projects/_header.html.erb)
- [`docs/SPRINTS.md`](file:///home/diego_silva/Documentos/FACULDADE/6%C2%B0%20Periodo/Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI/SpecLine/docs/SPRINTS.md)
