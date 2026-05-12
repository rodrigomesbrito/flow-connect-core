## Objetivo

Tornar o link de uma "Mitigation Action" um fluxo natural — só aparece quando a issue é **blocking** — suportando vincular um Action Item existente ou criar um novo já vinculado, com relação bidirecional automática.

## Mudanças propostas

### 1. Modelo de dados (bidirecional)

**`src/lib/action-items/store.ts`** — adicionar a `ActionItem`:
- `linkedIssueId?: string`
- `linkedIssueText?: string` (snapshot para exibição sem cross-lookup)

Estender `createActionItem` e `updateActionItem` para aceitar/atualizar esses campos.

**`src/lib/issues/store.ts`** — `linkedActionItemId` já existe, mantém. Links órfãos (action item deletado) caem silenciosamente para "—".

### 2. UX no `IssueDialog` — bloco condicional

Remover o campo fixo atual **"Linked mitigation action"**. Em seu lugar, render condicional ao toggle `blocking`:

**Vazio + Blocking ON:**
```
Mitigation action
┌──────────────────────────────────────┐
│ No mitigation action linked          │
│ [ Link existing ]   [ + Create ]     │
└──────────────────────────────────────┘
```

**Já vinculado:**
```
Mitigation action
┌──────────────────────────────────────┐
│ ✓ "Contact utility company"          │
│      [ Change ]   [ Unlink ]         │
└──────────────────────────────────────┘
```

- **Link existing**: `Popover` + `Command` (combobox com busca) listando os action items abertos do projeto. Selecionar seta `linkedActionItemId` no estado local.
- **Create**: troca a região para mini-form inline (Textarea de texto + Input opcional de assignee + Select de prioridade). Botão "Create & link" apenas seta no estado local um marker `pendingNewAction = { text, assignee, priority }` — a criação real ocorre no submit (ver §3).
- **Unlink**: limpa `linkedActionItemId` e `pendingNewAction` no estado.

Quando `blocking` for desligado durante a edição, **esconder a UI mas manter os valores no estado** (sem perda se o usuário religar).

### 3. Persistência — ordem segura no submit

Pseudocódigo de `handleSubmit`:

```text
1. Salvar issue primeiro:
   - se isEdit:  updateIssue(...)  → issueId = issue.id
   - se create:  issueId = createIssue(...).id

2. Se blocking == false E havia link prévio:
   - mostrar AlertDialog discreto:
     "This issue is no longer blocking. Keep mitigation action linked?"
     [ Unlink ]  [ Keep linked ]
   - se Unlink: limpar linkedActionItemId no estado antes do passo 4

3. Se há pendingNewAction:
   actionId = createActionItem(projectId, {
     ...pendingNewAction,
     linkedIssueId: issueId,
     linkedIssueText: issueText,
   }).id
   linkedActionItemId = actionId

4. Reconciliar bidirecional:
   - se linkedActionItemId !== prev:
     - se prev existia: updateActionItem(prev, { linkedIssueId: undefined, linkedIssueText: undefined })
     - se atual existe E não veio de pendingNewAction:
         updateActionItem(atual, { linkedIssueId: issueId, linkedIssueText: issueText })

5. updateIssue(issueId, { linkedActionItemId })  (caso tenha mudado após o passo 1)
6. Fechar dialog.
```

A ordem garante que o issueId já existe antes de qualquer criação/patch de action item — evita o caso "create issue + create action" com referência indefinida.

### 4. Action Items: badge "Mitigation for Issue"

**`src/components/action-items/ActionItemRow.tsx`** — quando `item.linkedIssueId` presente, exibir badge pequeno ao lado do badge de origem:

```
[ Shield icon ] Mitigation for Issue
```

Com `Tooltip` mostrando o `linkedIssueText`. Clique leva à rota `/projects/$projectId/issues` (sem deep-link a uma issue específica por enquanto — não há rota de detalhe).

### 5. Página de Issues

**`src/routes/_app.projects.$projectId.issues.tsx`** — sem mudanças funcionais; já passa `actionItems` ao dialog (agora também usado pelo combobox "Link existing").

## Fora de escopo

- Cascade delete bidirecional (deletar issue/action não toca o outro lado; link órfão exibido como "—").
- Auto-resolver issue quando o action vira "Done".
- Múltiplos action items por issue (mantém 1:1).
- Rota de detalhe de issue.

## Arquivos afetados

- `src/lib/action-items/store.ts` — campos `linkedIssueId` / `linkedIssueText` em `ActionItem`, `createActionItem`, `updateActionItem`.
- `src/components/issues/IssueDialog.tsx` — remover campo fixo, adicionar bloco condicional (Link existing / Create inline / Unlink), AlertDialog de confirmação ao salvar com Blocking OFF tendo link prévio, persistência bidirecional ordenada.
- `src/components/action-items/ActionItemRow.tsx` — badge "Mitigation for Issue" com tooltip.
