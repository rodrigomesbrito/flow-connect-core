ns# Ajuste de cor — Primary azul ClickUp

## Objetivo

Substituir totalmente o rosa/magenta atual pelo azul ClickUp (#4096FF) como cor primária do sistema, mantendo a estrutura de tokens e o restante da paleta semântica intacta.

## Escopo

Mudança puramente de design tokens. Nenhuma alteração de layout, rota ou comportamento. A página `/projects` e demais telas seguem como estão — só mudam de cor.

## O que muda em `src/styles.css`

**Modo claro (`:root`):**
- `--primary` → azul ClickUp (≈ `oklch(0.62 0.18 250)`, equivalente a #4096FF)
- `--primary-foreground` → branco
- `--ring` → mesmo azul do primary
- `--sidebar-primary` → mesmo azul
- `--sidebar-ring` → mesmo azul
- `--accent` → neutro frio levemente azulado (substitui o rosê atual)
- `--chart-1` → azul primary
- `--chart-2` → realocado (verde ou roxo) para manter contraste entre séries

**Modo escuro (`.dark`):**
- Mesmas variáveis, com luminosidade ajustada (`oklch(0.7 0.17 250)`) para manter contraste AA em fundo escuro
- `--primary-foreground` no dark → tom escuro frio para legibilidade

**`--info`:** mantém o tom azul atual (já era azul) — não conflita; usado para badges informativos.

## O que NÃO muda

- Nenhuma referência hardcoded ao rosa nos componentes (a auditoria nas Etapas 1 confirmou tokens semânticos em todo lugar)
- Tipografia, raios, espaçamentos, sombras
- Estrutura de rotas e componentes
- A cor dos cards de exemplo em `/projects` (cada um tem cor própria de "ícone do projeto" — ficam como estão; são decoração de avatar, não tema)

## Validação

Após aplicar, verifico visualmente:
1. Botão primary do `/projects` ("New project")
2. Estado ativo da sidebar
3. Foco em inputs (ring) na tela de Login
4. Badge "Active" continua verde (success), badges de fase continuam neutras

## Próximo passo após esta mudança

Seguir para **Etapa 2 — Project Dashboard**: criar a rota `/projects/$projectId`, conectar o clique dos cards de Projects para abrir o dashboard, e montar header + métricas + timeline. Aí a página de Projects deixa de ser apenas casca visual e passa a ser ponto de entrada real do sistema.
