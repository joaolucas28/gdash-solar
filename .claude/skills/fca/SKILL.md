---
name: fca
description: Faz o FCA (Fato, Causa, Ação) da conta de Meta Ads da Gdash Solar pela métrica de decisão do CLAUDE.md, com gráficos, publica no ClickUp e arquiva no Notion pessoal. Use SEMPRE que o usuário pedir FCA, análise da conta, leitura da semana ou do fim de semana, "por que o custo subiu/caiu", comparação de períodos, checkpoint ou fechamento. NÃO use para documentar um criativo (isso é a skill avaliar-criativo).
---

# FCA · Gdash Solar

As regras de raciocínio estão no `CLAUDE.md`: métrica de decisão, cascata, janelas, regra de pausa, princípios.
Esta skill é **como executar e entregar**. Escrita: `referencias/regras-escrita.md`.

Rodar tudo **da raiz do projeto**. `AF` = último dia da janela atual (AAAA-MM-DD), é a chave das pastas.

**Antes de tudo:** se a seção 1 do `CLAUDE.md` ainda tiver `A DEFINIR` em métrica de decisão, meta ou conversão
rastreada, perguntar ao usuário e registrar a resposta no `CLAUDE.md` antes de analisar.

## O que o usuário quer (não negociável)

1. **Gráfico sempre.** Todo FCA tem o gráfico diário da métrica de decisão e um gráfico que prova a Causa.
2. **Nada desnecessário.** Breakdown sem achado vira uma linha, não tabela.
3. **Clareza máxima.** O título de cada FCA já diz a conclusão. A primeira frase responde "está dentro da meta e por quê".
4. **Sempre por anúncio.** Métrica de decisão de cada anúncio em 3, 7 e 14 dias e a decisão (manter, monitorar, candidato à pausa).
5. **Ações diretas.** Cada ação é decisão tomada, com quando e quem. Sem "só se".
6. **Termina publicado.** ClickUp (entrega oficial) e Notion pessoal (arquivo), com os dois links na resposta.

## 1. Janela

- `git pull` antes de tudo.
- Padrão: últimos 7 dias completos x os mesmos 7 dias da semana retrasada. FDS: sex a dom x mesmo FDS da semana anterior.
- Conferir feriado nas duas janelas.

## 2. Dados

```
node scripts/fca-meta.mjs <atual início> <atual fim> <comparação início> <comparação fim>
node scripts/fca-ler.mjs  <atual fim>
```

| Script | Entrega |
|---|---|
| `fca-meta.mjs` | `dados/fca/AF/meta.json`: campanha, conjunto, anúncio (janelas, 3 e 14 dias), breakdowns, série diária, log de mudanças |
| `fca-ler.mjs` | Cascata no terminal: conta, campanha, conjunto, anúncio em 3/7/14 dias e mudanças. O evento de lead vem de `META_LEAD_ACTION` no `.env` |

Sem CRM ligado, a análise fica em CPL e isso entra como ressalva. Quando o CRM chegar, criar `scripts/fca-crm.mjs`
(somente leitura) gravando `dados/fca/AF/crm.json`. Pergunta que os scripts não respondem: script novo
`scripts/fca-<tema>.mjs`, somente leitura, gravando em `dados/fca/AF/`. Nunca gravar dado pessoal de lead.

## 3. Análise

Cascata do `CLAUDE.md` de cima para baixo, parando no nível onde a variação está.
- Decompor a métrica de decisão em CPL × Lead → Qualificado. Qual dos dois mexeu?
- Toda hipótese testada com dado e marcada como confirmada ou descartada.
- Conferir o log de mudanças contra a data da variação.
- Anúncio por anúncio: 3, 7 e 14 dias contra a meta (seção 7 do `CLAUDE.md`).
- No máximo 3 FCAs.

## 4. Gráficos

1. `node scripts/fca-graficos-base.mjs AF [meta]` monta `dados/fca/AF/graficos.json` com os 3 gráficos-base (CPL diário,
   por campanha e por anúncio com 3% ou mais do gasto). Acrescentar à mão um gráfico por FCA que prove a Causa
   (formato no topo de `scripts/fca-graficos.py`); rodar o base de novo mantém os extras.
2. `python scripts/fca-graficos.py AF` grava os PNG em `docs/fca/AF/`.
3. **Abrir cada PNG e olhar** antes de publicar.

Regras: um eixo só, no máximo 2 séries, meta tracejada, título que diz o que olhar.

## 5. Documento

Modelo: `templates/fca.md`. Salvar em `docs/fca/AF/FCA.md`. Conferir: toda variação com número, antes → depois, %
e nível; Ação num input com prazo e responsável; uma Ação por Causa; nenhum travessão nem palavra proibida.

## 6. Publicar e fechar

1. ClickUp: `node scripts/clickup-fca.mjs docs/fca/AF/FCA.md --teste` confere; sem `--teste` cria a tarefa na lista
   `CLICKUP_LIST_ID` com o texto e os gráficos anexados. Rodar de novo reescreve a mesma tarefa.
2. Notion pessoal: `node scripts/notion-pessoal-fca.mjs docs/fca/AF/FCA.md --teste`, depois sem `--teste`. Cria a
   página na base `NOTION_PESSOAL_DB` com Cliente = Gdash Solar, Categoria, Data e as imagens.
3. Commit e push, conferindo que não há `access_token` em `dados/fca/`.
4. Resposta no chat: placar (atual x comparação x meta), uma linha por FCA com a Ação, link do ClickUp e do Notion.
