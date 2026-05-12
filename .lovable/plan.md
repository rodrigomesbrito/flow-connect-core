## Action Items — escopo

Tela operacional global de execução do projeto. Meetings é a fonte principal, mas o usuário também pode criar items manualmente. Items publicados de meetings continuam sendo a referência rastreável; campos operacionais (status, due, priority, assignee) podem ser editados na própria tela.

## Modelo de dados

Estender o store de meetings (`src/lib/meetings/store.ts`) sem quebrar o existente:

```ts
type ActionStatus = "Open" | "In Progress" | "Done";
type ActionPriority = "Low" | "Medium" | "High";
type ActionOrigin = "meeting" | "manual";

type ActionItem = {
  id: string;
  projectId: string;
  text: string;
  assignee?: string;
  status: ActionStatus;
  priority: ActionPriority;       // default "Medium"
  dueDate?: string;               // ISO
  origin: ActionOrigin;
  meetingId?: string;             // quando origin = "meeting"
  meetingTitle?: string;
  sourceLine?: number;
  createdAt: string;
  completedAt?: string;
};
```

Persistência: `localStorage` em `mango.actionItems.{projectId}`. Lista é a verdade única lida pela tela. `usePublishedItems("action")` continua existindo para compatibilidade com Issues/Decisions, mas a tela Action Items lê do novo store.

### Sincronização com Meetings

Em `endMeeting`, para cada item `kind === "action"`:
- Upsert por `id` estável do parser:
  - Existe (mesma meeting + mesmo id): atualiza `text`, `assignee` (se vazio), `meetingTitle`, mantém `status/priority/dueDate`.
  - Novo: insere com `status: "Open"`, `priority: "Medium"`, `origin: "meeting"`.
- Items manuais nunca são tocados.
- Histórico preservado mesmo se a meeting for removida (badge "Meeting removed" no fallback).

Seed (`src/lib/meetings/seed.ts`): após o seed atual, popular ActionItems variados — alguns Done, alguns Overdue, alguns Due today, alguns In Progress, com mix de origin Meeting e Manual.

## API do store

```ts
useActionItems(projectId): ActionItem[]
createActionItem(projectId, { text, assignee?, dueDate?, priority? })
updateActionItem(projectId, id, patch)   // status, assignee, dueDate, priority, text
deleteActionItem(projectId, id)
```

`updateActionItem` define `completedAt` automaticamente quando `status` vira `Done` e limpa quando volta a Open/In Progress.

## UI — `src/routes/_app.projects.$projectId.action-items.tsx`

Lista única + filtros.

### Header
- Título "Action Items" + subtítulo curto.
- Botão `+ New Action Item` discreto à direita (variant outline + ícone Plus).

### Stats compactas (4 cards)
- Open · In Progress · Overdue · Done
- Clicar aplica o filtro correspondente.

### Tabs rápidas
`All` · `My Tasks` · `Overdue` · `Completed`
("My Tasks" usa string fixa "Me" por enquanto, com TODO para integrar auth.)

### Filtros (linha)
Status (multi) · Priority (multi) · Assignee (select) · Origin (Meeting / Manual) · Busca textual.

### Linha da tabela
- **Status pill clicável** → abre mini menu (Popover) com 3 opções: Open · In Progress · Done. Sem toggle binário no clique principal.
- Texto do action (truncado, tooltip full).
- Assignee (avatar/inicial + nome, editável inline).
- Due date (DatePicker inline) com 3 estados visuais sutis:
  - Overdue: `text-destructive` + ícone alerta
  - Due today: `text-amber-700` + tag pequena "Today"
  - Próximos: neutro
- Priority (Select pequeno colorido).
- Origin badge discreto:
  - `Meeting` (link → `/projects/$projectId/meetings/$meetingId`)
  - `Manual`
- Menu `…` com Edit / Delete.

### Ordenação default
1. **Overdue primeiro** (status ≠ Done && dueDate < hoje)
2. Open / In Progress antes de Done
3. dueDate ascendente (sem due → final do grupo)
4. priority desc (High → Low)

### Empty state
Ilustração simples + texto "No action items yet" + CTA `+ New Action Item`.
Bloco de exemplo visual mostrando o parser em ação:

```
Pro tip — items also appear here when you publish meetings with markers:

  [action @John] Send revised schedule by Friday
  [action] Review punch list
```

Renderizado como bloco mono com syntax highlight leve (mesmas cores dos tags na tela de meetings).

### New / Edit dialog
Title · Assignee (input livre, sugere attendees recentes) · Due date (Popover + Calendar shadcn com `pointer-events-auto`) · Priority (Select) · Status (Select; default Open).
Sem Notes nesta fase.

## Componentes novos

- `src/components/action-items/ActionItemRow.tsx`
- `src/components/action-items/ActionItemDialog.tsx` (create + edit)
- `src/components/action-items/ActionFilters.tsx`
- `src/components/action-items/PriorityBadge.tsx`
- `src/components/action-items/StatusMenu.tsx` (pill + popover de 3 estados)

## Detalhes técnicos

- Cores via tokens semânticos (`src/styles.css`); Overdue usa `text-destructive`, Due today usa `text-amber-700`/`bg-amber-500/10`, Priority High `bg-destructive/10 text-destructive`, Medium âmbar, Low `bg-muted`.
- Datas com `date-fns`; helper `isOverdue` / `isDueToday` no próprio módulo.
- DatePicker shadcn (Popover + Calendar com `pointer-events-auto`).
- Reatividade via `useSyncExternalStore` já existente.
- Issues/Decisions permanecem com `usePublishedItems` (sem mudanças).

## Arquivos a alterar/criar

- editar `src/lib/meetings/store.ts` (tipos, store actionItems, hooks, mutações, sync em `endMeeting`)
- editar `src/lib/meetings/seed.ts` (popular actionItems realistas com mix de estados)
- substituir `src/routes/_app.projects.$projectId.action-items.tsx`
- criar `src/components/action-items/*` (5 componentes)

## Fora de escopo (Fase 1)

Notes/Comments · Subtasks · Labels · Dependencies · Drag & drop · Bulk actions · "My Tasks" com auth real.
