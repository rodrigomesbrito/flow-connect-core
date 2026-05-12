## Mention popover ao digitar `@` nas notas

Adicionar um autocomplete leve no editor de notes da meeting: ao digitar `@` dentro de uma linha que começa com `[action`, abre um popover com pessoas do projeto, navegável por teclado e mouse.

## Fonte de pessoas

Construir a lista no detalhe da meeting (`_app.projects.$projectId.meetings.$meetingId.tsx`) e passar como prop ao `NotesPanel`:

1. Attendees da meeting atual (prioridade visual — aparecem primeiro, com um sutil "in this meeting").
2. Pessoas já vistas no projeto, deduplicadas por nome:
   - attendees de todas as meetings (`useMeetings(projectId)`),
   - assignees existentes em action items (`useActionItems(projectId)`).
3. Resultado final: array `Person[] = { name, inMeeting: boolean }`, ordenado attendees-first, depois alfabético.

## Gatilho (regra restrita)

O popover só abre quando o cursor está em uma linha cujo início (após whitespace e o opcional `executar `) é `[action`. Em qualquer outra linha o `@` é texto comum.

Detecção a cada keystroke / seleção:

```ts
function getMentionContext(value: string, caret: number): {
  query: string;
  start: number; // index do '@'
} | null
```

- Pega o trecho `lineStart..caret`.
- Verifica `RE_ACTION_PREFIX = /^\s*(?:executar\s+)?\[action\b/i` no início da linha. Se não casar → null.
- Procura o último `@` antes do caret na mesma linha; se não houver, ou se houver espaço/`]` entre ele e o caret → null.
- Senão, retorna `{ start: posDo@, query: substring após @ }`.

Roda em `onChange`, `onKeyUp`, `onClick` do textarea (cobre digitação, navegação por setas e clique).

## UI

Popover ancorado abaixo do caret. Implementação simples, sem dependência nova:

- `mention` state no `NotesPanel`: `{ open, query, start, top, left, activeIndex }`.
- Mede a posição do caret usando um div "mirror" invisível com mesma fonte/padding/largura do textarea (técnica padrão; já temos o overlay equivalente). Para MVP, usar uma versão enxuta: clonar `textarea.value.slice(0, caret)` em um `<div>` espelho, medir o último `<span>` (`getBoundingClientRect`) e converter para coordenadas relativas ao container do textarea, somando `-scrollTop/-scrollLeft`.
- Popover: lista de até 6 pessoas filtradas por `query` (case-insensitive, `startsWith` primeiro, depois `includes`).
- Cada item: avatar de iniciais + nome + (opcional) badge "in meeting" sutil.
- Empty state: "No matching attendees".

## Teclado

Quando `mention.open === true`, interceptar no `onKeyDown` do textarea:

- `ArrowDown` / `ArrowUp` → move `activeIndex` (com wrap).
- `Enter` ou `Tab` → confirma a sugestão ativa.
- `Escape` → fecha.
- Espaço, `]` ou movimento que invalide o contexto → fecha.

`preventDefault()` apenas quando o popover está aberto e a tecla é uma das interceptadas.

## Inserir menção

`insertMention(name)`:
- Substitui `@<query>` por `@<name> ` (mantém o espaço final para fluidez).
- Usa `setRangeText` no textarea para preservar undo nativo.
- Chama o mesmo `onChange(textarea.value)` para disparar o debounce de `updateMeetingNotes` que já existe.
- Fecha o popover e reposiciona o caret após a menção.

## Re-uso futuro (sem implementar agora)

Manter o helper `getMentionContext` e o sub-componente `MentionPopover` exportáveis a partir de `src/components/meetings/MentionPopover.tsx`, para depois plugar no `ActionItemDialog` se quisermos a mesma experiência no campo Assignee.

## Arquivos

- editar `src/routes/_app.projects.$projectId.meetings.$meetingId.tsx`
  - construir `people: Person[]` (attendees + outros), passar para `NotesPanel`.
  - estender `NotesPanel` props com `people`.
  - adicionar lógica de detecção, posicionamento, teclado e render do popover dentro do mesmo componente.
- criar `src/components/meetings/MentionPopover.tsx`
  - apresenta a lista (avatares, badge "in meeting", item ativo) e expõe `onSelect(name)`.
  - sem lógica de detecção; recebe `people`, `query`, `activeIndex`, `style` (top/left).

## Fora de escopo (Fase 1)

- Mention em texto livre (fora de `[action]`).
- Mention em campos da tela Action Items.
- Persistir menção como entidade estruturada (continua sendo só texto `@Nome` parseado pelo regex existente).
- Suporte a teclado para navegar com `Home/End` dentro da popover.
