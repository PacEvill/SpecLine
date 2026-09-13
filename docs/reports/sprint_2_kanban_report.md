# Relatório da Sprint 2: Kanban & Issue Tracker (Linear-Tier)

## 1. Contexto e Motivação
A Sprint 2 focou em trazer a funcionalidade core de acompanhamento de tarefas para o SpecLine, garantindo que o módulo de Kanban rivalizasse com ferramentas como Linear e Jira em termos de fluidez.

## 2. Tarefas Executadas
- **Painéis Dinâmicos:** Implementação de múltiplos quadros por projeto com agrupamento dinâmico (por status, prioridade ou responsável).
- **Milestones e Ciclos:** Sistema de acompanhamento de Sprints/Milestones com cálculo de progresso automático baseado nas *issues* associadas.
- **Interatividade:** Drag & Drop reativo nativo via SortableJS integrado perfeitamente ao Turbo Streams, eliminando reloads de página.
- **Customização Rápida:** Filtros rápidos, tags coloridas e colunas (Status) configuráveis a nível de projeto.

## 3. Conformidade de Design e UI/UX
- Os quadros mantiveram a identidade da paleta configurada (fable, ink, terracotta).
- A interatividade de "arrastar e soltar" não quebra a interface, utilizando "ghost classes" semânticas para manter a fluidez "Pure Therapy".
