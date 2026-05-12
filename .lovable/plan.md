# Plano de Construção — Sistema de Gestão de Projetos (estilo ClickUp)

## Visão geral

Sistema operacional simples para projetos com módulos conectados: Projects, Dashboard, Directory, Meetings, Action Items, Decisions, Issues e Settings. Tudo nasce dentro de um Project, com rastreabilidade completa entre reuniões, decisões, problemas e tarefas.

**Stack:** TanStack Start + React 19 + Tailwind v4 + shadcn/ui. **Persistência: Local Storage** (sem backend nesta fase).

**Princípio de execução:** uma etapa por vez. Ao final de cada etapa, paro, mostro o resultado, e aguardo sua aprovação antes de seguir.

---

## Etapa 1 — Design System e Shell de Navegação

**Objetivo:** estabelecer a base visual ClickUp-like e o layout principal (sidebar + topbar + área de conteúdo).

**Entregas:**
- Tokens de cor em `src/styles.css` (oklch): neutros refinados + acentos vibrantes (rosa/magenta primário, verde sucesso, amarelo warning, azul info, vermelho destrutivo) — modo claro e escuro
- Tipografia (Inter como base, escala e pesos ClickUp-like)
- Sidebar esquerda colapsável com workspace switcher, navegação principal e seção de DMs/canais (mock visual)
- Topbar com busca global, ações rápidas e avatar
- Layout route `_app` com `<Outlet />` para todas as telas internas
- Tela de Login (visual apenas — login fake que apenas marca sessão no Local Storage)
- Página `/projects` placeholder com card grid

**Impacto:** define a linguagem visual de todo o sistema.

---

## Etapa 2 — Project Dashboard

**Objetivo:** tela principal de um projeto selecionado.

**Entregas:**
- Rota `/projects/$projectId` com header do projeto (nome, status, fase, owner)
- Cards de métricas: Open Action Items, Open Issues, Recent Decisions, Upcoming Meetings
- Widget de Recent Activity (timeline)
- Widget de Project Status
- Dados iniciais via seed em Local Storage

---

## Etapa 3 — Módulos de Listagem (List View padrão ClickUp)

**Objetivo:** componente de lista reutilizável aplicado a Action Items, Decisions e Issues.

**Entregas:**
- Componente `DataList` com agrupamento por status (DONE, IN PROGRESS, OPEN, IN REVIEW), colunas configuráveis, badges de prioridade, avatares de assignee, hover/selected states
- Filtros, busca, ordenação
- Tabs por view: List / Board / Gantt (List funcional, outras como placeholder)
- Telas: `/projects/$id/action-items`, `/projects/$id/decisions`, `/projects/$id/issues`
- Sheet de detalhe ao clicar em item
- Modal de criação rápida (escrevendo direto no Local Storage)

---

## Etapa 4 — Meetings + Directory + Settings

**Objetivo:** completar os módulos restantes e o fluxo de criação de reunião que gera itens conectados.

**Entregas:**
- `/projects/$id/meetings`: lista + tela de detalhe com seções (Attendees, Notes, Linked Decisions, Linked Issues, Linked Action Items)
- Fluxo de criação de reunião com inline-create de Decisions/Issues/Action Items (todos persistidos e relacionados via IDs no Local Storage)
- `/projects/$id/directory`: tabela de pessoas/organizações com role, permission, status
- `/projects/$id/settings`: abas Project / Permissions / Roles / Preferences

---

## Etapa 5 — Camada de Dados em Local Storage

**Objetivo:** consolidar e endurecer a persistência local que vinha sendo construída nas etapas anteriores.

**Entregas:**
- Módulo `src/lib/storage/` centralizando leitura/escrita por entidade (`projects`, `directory`, `meetings`, `actionItems`, `decisions`, `issues`)
- Schemas Zod por entidade + validação na escrita
- Hooks (`useProjects`, `useActionItems`, etc.) com subscribe a mudanças (storage events) para sincronizar abas
- Seed inicial com dados de exemplo (executado uma vez)
- Versionamento do schema + migração simples
- Export / Import JSON (backup manual)
- Botão "Reset data" em Settings

**Impacto:** dados consistentes, rastreáveis e exportáveis sem depender de backend.

---

## Etapa 6 — Polimento e Estados

**Entregas:**
- Loading skeletons e empty states ilustrados
- Toasts de sucesso/erro
- Confirmações destrutivas
- Responsividade mobile (sidebar drawer, listas adaptadas)
- Atalhos de teclado (⌘K busca global)

---

## Notas técnicas

- Cada rota como arquivo separado em `src/routes/` (convenção flat com `.`)
- Componentes reutilizáveis em `src/components/` (`DataList`, `StatusBadge`, `PriorityFlag`, `AssigneeAvatar`, `ProjectHeader`)
- Zero cor hardcoded — sempre via tokens semânticos
- shadcn como base, customizado via variantes (cva)
- Todo dado persistido em `localStorage` sob namespace único (ex.: `app:v1:*`)
- Sem chamadas de rede, sem Lovable Cloud nesta fase

---

## Próximo passo

Se aprovar, começo pela **Etapa 1 (Design System + Shell)**. Ao terminar, paro e te mostro antes de avançar.
