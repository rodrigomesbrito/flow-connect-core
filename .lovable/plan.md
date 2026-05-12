# Restruturação da Projects Page

## Objetivo

Transformar `/projects` em um hub operacional moderno (Notion/Linear/ClickUp), com filtros, overview e grid de cards ricos — substituindo a lista atual mais simples.

## Estrutura final da tela

```text
+--------------------------------------------------------------+
|  Header: "Projects" + subtitle              [+ New Project]  |
+--------------------------------------------------------------+
|  [Search.............]  [Status v] [Phase v] [Owner v]       |
+--------------------------------------------------------------+
|  Overview cards (4):                                          |
|  Active | Open Issues | Pending Tasks | Meetings This Week    |
+--------------------------------------------------------------+
|  Grid (3 col desktop / 2 tablet / 1 mobile):                  |
|  +----------------+  +----------------+  +----------------+   |
|  | Status   ⋮     |  |                |  |                |   |
|  | Project Name   |  |                |  |                |   |
|  | Owner • Phase  |  |                |  |                |   |
|  | KPIs row       |  |                |  |                |   |
|  | Progress 65%   |  |                |  |                |   |
|  | Last update    |  |                |  |                |   |
|  | Avatars +4     |  |                |  |                |   |
|  +----------------+  +----------------+  +----------------+   |
+--------------------------------------------------------------+
```

## Etapas

### 1. Estender o mock (`src/lib/mock/projects.ts`)

Adicionar campos por projeto e expandir para ~9 projetos para a grid não parecer vazia:
- `phase` ampliado para enum: `Procurement | Design | Construction | Closeout | Planning | Discovery | Execution | Initiation`
- `ownerOrg`: `City of Charlotte | Private | State | Federal`
- `pendingTasks`, `meetingsThisWeek`
- `lastUpdated` (string relativa: "2 hours ago")
- `participants`: array de até 6 avatares (`{ name, initials }`)
- `progress` (já existe)

### 2. Header da página

- Título `Projects` + subtítulo `Manage and track all active projects`
- Botão primário `+ New Project` (apenas visual nesta fase)

### 3. Search + Filtros

Componente `ProjectsToolbar` com:
- Input de busca (`Search projects...`) com ícone de lupa, filtra por nome em tempo real
- 3 dropdowns shadcn `Select`:
  - **Status**: All, Active, Planning, On Hold, Completed
  - **Phase**: All, Procurement, Design, Construction, Closeout
  - **Owner**: All Owners, City of Charlotte, Private, State, Federal
- Estado controlado via `useState` local
- Reset automático: filtros aplicam combinados (AND)

### 4. Overview Cards

Componente `ProjectsOverview` com 4 cards calculados a partir do mock filtrado:
- Active Projects (count de status=Active)
- Open Issues (soma de `openIssues`)
- Pending Tasks (soma de `pendingTasks`)
- Meetings This Week (soma de `meetingsThisWeek`)

Cada card tem ícone colorido em badge suave (info/destructive/success/warning), número grande e label.

### 5. Card de Projeto (`ProjectCard`)

Layout interno:

**Topo** — linha com `StatusBadge` à esquerda + menu `⋮` (DropdownMenu shadcn) à direita com Open Project / Edit / Archive (ações apenas visuais).

**Meio** —
- Nome do projeto (font-semibold, text-base)
- Linha secundária: `Owner • Phase` (text-xs muted)
- Linha de KPIs em pílulas pequenas: `12 Tasks · 4 Issues · 2 Meetings`
- Barra de progresso shadcn `Progress` com % à direita

**Rodapé** — separador + linha com:
- `Last updated 2 hours ago` à esquerda
- Stack de até 3 avatares + `+N` à direita (`AvatarStack` reutilizável)

Card inteiro envolto em `<Link>` para `/projects/$projectId`. Menu `⋮` usa `e.preventDefault()` para não navegar.

Hover: borda mais escura + sombra leve.

### 6. Grid responsivo

`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` com gap-4. Empty state quando filtros não retornarem nada: ícone + "No projects match your filters" + botão "Clear filters".

### 7. Sidebar

Verificar que a sidebar atual já tem itens corretos. Para o contexto **dentro de um projeto** (Dashboard / Directory / Meetings / Action Items / Decisions / Issues / Settings), isso fica para a Etapa 3 — **não é escopo desta tela**, só registrar que o sidebar global hoje já tem Spaces/Channels/DMs e segue como está.

## Componentes novos a criar

- `src/components/projects/ProjectsToolbar.tsx` — search + 3 selects
- `src/components/projects/ProjectsOverview.tsx` — 4 KPI cards
- `src/components/projects/ProjectCard.tsx` — card individual
- `src/components/projects/AvatarStack.tsx` — stack de avatares com `+N`
- `src/components/status-badge.tsx` — badge reutilizável (Active/On Hold/Planning/Completed)

## Reescrita

- `src/routes/_app.projects.index.tsx` passa a orquestrar: estado de filtros → lista filtrada → overview + grid

## O que NÃO entra agora

- Persistência (continua mock até Etapa 5)
- Funcionalidade real do `+ New Project`, Edit, Archive (apenas visuais)
- Sidebar contextual de projeto (será na próxima etapa)

## Validação visual

Após implementar, conferir:
1. Filtros combinam corretamente (status + phase + owner + search)
2. Overview reage aos filtros aplicados
3. Empty state aparece quando lista filtrada = 0
4. Cards mantêm altura consistente independente do conteúdo
5. Clique no card navega; clique no `⋮` não navega
6. Responsivo em 1167px (atual) e abaixo

## Próximo passo após aprovação

Implementar tudo numa única passada (é uma tela só, componentes coesos), depois mostrar pra você validar antes de seguir para a Etapa 3.
