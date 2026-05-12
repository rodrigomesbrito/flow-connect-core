# Sidebar contextual do projeto + cor navy #08273F

## Objetivo

1. Criar um **sidebar próprio** que aparece dentro de `/projects/$projectId/*`, substituindo o `AppSidebar` global atual nessas rotas.
2. Aplicar **#08273F** como cor base de qualquer sidebar do app (global e contextual), com tokens claros para texto, hover, borda e item ativo.

## Estrutura final do sidebar do projeto

```text
+---------------------------+
|  [icon] Bryant Farms  v   |   <- Switcher de projetos (dropdown)
|  Procurement Phase        |
+---------------------------+
|  ← All projects           |
+---------------------------+
|  PROJECT                  |
|  • Dashboard              |
|  • Directory              |
|  • Meetings               |
|  • Action Items     12    |
|  • Decisions              |
|  • Issues            4    |
|  • Settings               |
+---------------------------+
```

- **Topo — Project Switcher**: badge colorido do projeto + nome + chevron. Dropdown lista todos os projetos do mock; clicar troca a rota mantendo a sub-página atual quando possível (fallback para `/projects/$projectId`). Linha secundária mostra a `phase`.
- **Voltar**: link discreto `← All projects` para `/projects`.
- **Menu PROJECT (padrão completo)**: Dashboard, Directory, Meetings, Action Items, Decisions, Issues, Settings. Cada item tem ícone (`LayoutDashboard`, `Users`, `CalendarClock`, `CheckSquare`, `Gavel`, `AlertTriangle`, `Settings`). Badges de contagem em Action Items (`pendingTasks`) e Issues (`openIssues`) vindos do mock.
- **Active state**: usar `useRouterState` + `isActive` igual ao `AppSidebar` atual.
- **Collapsible**: `collapsible="icon"` (mesmo padrão do app).

## Paleta navy aplicada aos tokens de sidebar

Atualizar `src/styles.css` (`:root` e `.dark`) — afeta tanto o `AppSidebar` global quanto o novo:

- `--sidebar`: #08273F (≈ `oklch(0.27 0.04 240)`)
- `--sidebar-foreground`: branco levemente azulado (`oklch(0.95 0.01 240)`)
- `--sidebar-accent`: hover sutil sobre o navy (`oklch(0.33 0.05 240)`)
- `--sidebar-accent-foreground`: branco
- `--sidebar-border`: branco translúcido (`oklch(1 0 0 / 8%)`)
- `--sidebar-ring`: o azul primário existente
- `--sidebar-primary`: mantém azul primário; `--sidebar-primary-foreground` mantém branco

No dark mode os valores ficam praticamente iguais (já é navy escuro), só ajustamos para garantir o tom exato.

Resultado: badges de contagem, itens ativos e separadores ficam legíveis sobre o navy, sem precisar mudar componentes individuais.

## Rotas filhas

Criar layout + páginas placeholder mínimas para que o menu funcione hoje:

- `src/routes/_app.projects.$projectId.tsx` vira **layout** (mantém dados do projeto via loader, renderiza `<ProjectSidebar>` + `<Outlet />`).
- `src/routes/_app.projects.$projectId.index.tsx` → atual conteúdo do dashboard.
- `src/routes/_app.projects.$projectId.directory.tsx`
- `src/routes/_app.projects.$projectId.meetings.tsx`
- `src/routes/_app.projects.$projectId.action-items.tsx`
- `src/routes/_app.projects.$projectId.decisions.tsx`
- `src/routes/_app.projects.$projectId.issues.tsx`
- `src/routes/_app.projects.$projectId.settings.tsx`

Cada placeholder = header simples (`<h1>` + descrição curta) — o conteúdo real entra nas próximas etapas. Sem isso o sidebar ficaria com links quebrados.

## Orquestração do layout

`src/routes/_app.tsx` hoje esconde o sidebar global em `/projects`. Atualizar para:

- `/projects` → sem sidebar (igual hoje)
- `/projects/$projectId/*` → renderiza **`ProjectSidebar`** (não o `AppSidebar` global)
- demais rotas `_app/*` → `AppSidebar` global

A escolha do sidebar fica numa pequena função pura baseada em `pathname`.

## Componentes novos

- `src/components/projects/ProjectSidebar.tsx` — sidebar contextual completo
- `src/components/projects/ProjectSwitcher.tsx` — dropdown shadcn (`DropdownMenu`) com a lista de projetos

## Fora de escopo

- Conteúdo real de Directory / Meetings / Action Items / Decisions / Issues / Settings (próxima etapa)
- Persistência (continua mock)
- Reorganizar o sidebar global (Inbox/Channels/DMs) — só recebe a nova cor

## Validação visual após implementar

1. `/projects` continua sem sidebar.
2. `/projects/bryant-farms` mostra o novo sidebar navy com Dashboard ativo.
3. Trocar de projeto pelo switcher mantém a aba (ex.: estando em Issues, troca para outro projeto e cai em Issues dele).
4. Badges de Action Items e Issues batem com o mock.
5. Collapsed state mantém ícones legíveis sobre o navy.
6. `AppSidebar` global (em `/inbox`, etc.) também aparece em navy, com texto legível.
