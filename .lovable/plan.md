# Meetings — captura, notas marcadas e revisão

## Fluxo do usuário

```text
/meetings  →  [+ New meeting] (modal)
                ├─ Title, Date, Attendees (multi-select do mock)
                └─ Start meeting  →  abre detalhe (status: Live)

/meetings/$meetingId  (Live)
  ┌────────────────────────────┬──────────────────────────┐
  │ NOTES (textarea grande)    │ GENERATED ITEMS (live)   │
  │  Linhas livres +           │  Tabs: Actions | Issues  │
  │  marcadores:               │         | Decisions      │
  │   [action @Joey] ...       │  Cards com origem da     │
  │   [action] ...             │  linha + remover/editar  │
  │   [issue] ...              │                          │
  │   [decision] ...           │                          │
  └────────────────────────────┴──────────────────────────┘
                          [End meeting]
                                ↓
                       Review dialog (lista todos os itens
                       extraídos, permite editar/remover/
                       atribuir assignee em actions sem dono)
                                ↓
                       Meeting marcada como Completed
                       Itens publicados no store global
```

## Status da reunião

- `Scheduled` — criada para o futuro (opcional, próxima fase)
- `Live` — em andamento, edição livre das notas
- `Completed` — finalizada, notas e itens congelados

> Mudou de `In progress` → **Live** para ficar mais humano e alinhado a "meeting system".

## Listagem `/meetings`

- Header: título + botão **New meeting**
- Stat strip: Total · Scheduled · Live · Completed
- Filtros: tabs por status (All / Scheduled / Live / Completed) + busca
- Lista com: título, data, status badge, attendees (avatar stack), contagem de itens gerados
- Clique → detalhe

## Detalhe `/meetings/$meetingId`

**Header**: título editável inline, data, status badge, attendees (avatar stack + add), botão **End meeting** (só em Live).

**Esquerda — Notes**
- Textarea full-height, fonte mono leve.
- Hint discreto com a legenda dos marcadores aceitos:
  - `[action] texto` — action sem responsável
  - `[action @Nome] texto` — action com assignee
  - `[issue] texto`
  - `[decision] texto`

**Direita — Generated Items**
- Tabs: Actions / Issues / Decisions com contadores.
- Cada item: texto, badge de assignee (ou **Unassigned** quando vazio), nº da linha de origem, botão remover.
- Atualiza em tempo real (debounce 200ms).

**End meeting**
- Abre `Dialog` de revisão com as 3 listas editáveis.
- Em Actions sem assignee, mostra select inline para atribuir antes de finalizar (não obrigatório — pode finalizar como Unassigned).
- Confirmar → status Completed, itens vão para o store global, redireciona para `/meetings`.

## Modelo de dados (store local)

`src/lib/meetings/store.ts` — store simples com `localStorage` + listeners. Chave: `mango.meetings.{projectId}`.

```ts
type ItemKind = "action" | "issue" | "decision";
type GeneratedItem = {
  id: string;
  kind: ItemKind;
  text: string;
  assignee?: string;   // opcional em actions
  sourceLine: number;
};
type Meeting = {
  id: string;
  projectId: string;
  title: string;
  date: string;        // ISO
  attendees: string[];
  notes: string;
  items: GeneratedItem[];
  status: "Scheduled" | "Live" | "Completed";
  createdAt: string;
  completedAt?: string;
};
```

API:
- `listMeetings(projectId)`, `getMeeting(id)`
- `createMeeting({projectId, title, date, attendees})` → status Live
- `updateMeetingNotes(id, notes)` → re-roda parser
- `updateItem(id, itemId, patch)` / `removeItem(id, itemId)`
- `endMeeting(id)` → Completed + `publishItems(projectId, items)`

`publishItems` grava em três stores irmãs (`actionItems`, `issues`, `decisions`) por projeto para as abas placeholder consumirem depois.

Hooks `useMeetings(projectId)` e `useMeeting(id)` com `useSyncExternalStore`.

## Parser de marcadores

Regex por linha, case-insensitive, tolerante a espaços. **Assignee é opcional em actions.**

- `^\s*\[action(?:\s+@([^\]]+))?\]\s*(.+)$` → action (grupo 1 = assignee opcional, grupo 2 = texto)
- `^\s*\[issue\]\s*(.+)$`
- `^\s*\[decision\]\s*(.+)$`

Re-parse completo a cada edição. IDs estáveis: hash `kind|sourceLine|text` para preservar edições do usuário entre re-parses.

## Arquivos

**Novos**
- `src/lib/meetings/store.ts`
- `src/components/meetings/NewMeetingDialog.tsx`
- `src/components/meetings/MeetingsList.tsx`
- `src/components/meetings/MeetingDetail.tsx`
- `src/components/meetings/EndMeetingDialog.tsx`
- `src/components/meetings/ItemCard.tsx`
- `src/routes/_app.projects.$projectId.meetings.$meetingId.tsx`

**Editados**
- `src/routes/_app.projects.$projectId.meetings.tsx` — vira a listagem real

## Validação visual

1. `/meetings` mostra lista vazia + **New meeting**.
2. Criar meeting → abre detalhe com status **Live** e cursor nas notas.
3. `[decision] Approve bid #3` → card em Decisions instantâneo.
4. `[action] Update easement schedule` → action **Unassigned**.
5. `[action @Joey Cox] Send schedule` → action com assignee Joey Cox.
6. **End meeting** → dialog de revisão permite atribuir as actions sem dono; confirmar volta à lista com status **Completed** e contagem de itens correta.
7. Reload mantém tudo (localStorage).

## Fora de escopo

- IA / NLP / transcrição
- Telas reais de Action Items / Issues / Decisions consumindo o store (próxima etapa)
- Edição rica (markdown, autocomplete de mentions)
- Notificações, recorrência, integrações
