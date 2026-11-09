# GDASH

Ficha do cliente. Marca, produto, ICP e processo do time: `cliente/marca.md`. Ler antes de qualquer análise desta conta. Onde está cada dado: `cliente/guia-dados.md`.
Como documentar um criativo: skill `avaliar-criativo` em `.claude/skills/`.

Campos com `A DEFINIR` ainda não foram preenchidos: perguntar ao usuário, nunca supor.

## 1. Contas

| Plataforma | Conta |
|---|---|
| Meta Ads | conta GDASH `act_206541134752256`, pixel `373279804323629` |
| Google Ads | `A DEFINIR` |
| CRM | `A DEFINIR` |
| ClickUp | lista em `CLICKUP_LIST_ID` (entrega oficial dos FCAs) |
| Notion pessoal | base em `NOTION_PESSOAL_DB` (arquivo das análises) |

## 2. Teste de anúncio e veredito

- **O teste é de 7 dias:** os 7 primeiros dias de vida do criativo (D1 = primeiro dia com gasto)
- **O veredito sai só pela métrica de decisão** (seção 1 do `CLAUDE.md`), contra a meta

| Situação nos 7 dias | Veredito |
|---|---|
| Investimento abaixo do piso | Inconclusivo / testar novamente |
| Piso atingido e métrica na meta ou abaixo | Validado |
| Piso atingido e métrica acima da meta | Descartado |

Piso de investimento: `A DEFINIR` (sugestão de partida: 10 qualificados × meta).

## 3. Régua de comparação

Mediana de blocos de 7 dias dos criativos da conta. Calcular quando houver histórico suficiente.

| Métrica | Mediana Gdash | Como se calcula |
|---|---|---|
| Custo por qualificado | meta `A DEFINIR` | gasto ÷ qualificados |
| Lead → Qualificado | `A CALCULAR` | qualificados ÷ leads |
| Hook | `A CALCULAR` | views de 3s ÷ impressões |
| Hold | `A CALCULAR` | reproduções até 100% ÷ impressões |
| CTR | `A CALCULAR` | cliques no link ÷ impressões |
| CPM | `A CALCULAR` | |
| CPL | `A CALCULAR` | gasto ÷ leads |

## 4. Criativos

```
criativos/
├── baseline/meta/      peças validadas
└── <ID>/               um anúncio: vídeo, frames e documento
```

Vídeos e frames não vão para o GitHub: baixar de novo com `scripts/download-videos-ads.mjs`.

## 5. Pendências

- Definir métrica de decisão e meta (seção 1 do `CLAUDE.md`)
- Identificar o CRM de vendas e onde o SQL é marcado
- Acesso ao CRM (somente leitura) para ligar lead a anúncio
