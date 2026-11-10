---
name: fca-entrega
description: FCA sempre com gráficos, métrica de decisão por anúncio, enxuto, publicado no ClickUp e arquivado no Notion pessoal
metadata:
  type: feedback
---

FCA: sempre com gráficos, sempre com a métrica de decisão por anúncio, sem nada desnecessário, o mais claro possível. Formato aprovado: placar, FCA com FATO, CAUSA e AÇÃO em 2 a 4 linhas cada, tabela de decisão por anúncio (3d, 7d, 14d), um gráfico por FCA, próximas leituras em 3 linhas. Cerca de 1.250 a 2.000 palavras.

**Why:** FCAs longos (método, breakdown sem achado) não são lidos. Na Gdash Solar a entrega oficial é o ClickUp, e o Notion pessoal guarda o histórico para consulta futura (pedido de 09/11/2026).

**How to apply:** skill `fca`; publicar com `clickup-fca.mjs` e `notion-pessoal-fca.mjs`; terminar com os dois links. Ver [[acoes-diretas]], [[meta-ads-vs-meta]].

Destino no ClickUp (definido em 10/11/2026): lista "Análises de Mídia Paga" (id 1400700000004418), pasta Campaign Tracking & Analytics. A tarefa fixa "Padrão de análise de mídia paga (FCA)" (https://app.clickup.com/t/17txqgz6w7a) sai de `docs/padrao-analise/PADRAO.md`; ao mudar regra no CLAUDE.md, atualizar o PADRAO.md e rodar `node scripts/clickup-fca.mjs docs/padrao-analise/PADRAO.md`.
