# 📌 Padrão de análise de mídia paga (FCA): leia antes de decidir

Descrição: Como lemos a conta, como chegamos a uma decisão e como cada análise aparece nesta lista
Categoria: Padrão de análise, Meta Ads

## Para que serve esta lista

Cada análise de mídia paga vira uma tarefa aqui, sempre no formato FCA (Fato, Causa, Ação), com gráficos anexados. Esta tarefa fixa traz as regras que todas seguem. Qualquer mudança na conta (pausar anúncio, mexer em verba, público ou criativo) parte de uma análise publicada nesta lista.

## O que é FCA

| Etapa | Pergunta que responde |
|---|---|
| **Fato** | O que aconteceu? Qual métrica mudou, quanto e em qual campanha, conjunto ou anúncio? |
| **Causa** | Por que aconteceu? Hipótese testada com dado, específica |
| **Ação** | O que vamos fazer, quando e quem faz |

FCA sem Ação é só observação, e FCA sem Causa é chute. A Ação sempre responde diretamente à Causa.

## Métrica que decide

- **Decisão:** custo por lead qualificado (SQL), contra a meta. Meta e critério de qualificado: **a definir com o time**.
- **CPL é input:** dá para baixar o CPL e piorar a qualidade ao mesmo tempo. Num público B2B pequeno e técnico, lead barato fora do ICP (consumidor final, integrador muito pequeno) é desperdício.
- **Qualidade:** Lead → Qualificado (qualificados ÷ leads), assim que o CRM estiver ligado. Até lá, a análise fica no CPL e isso aparece como ressalva em cada FCA.
- **Venda (MRR)** confirma, mas não decide: o ciclo é longo e depende do comercial.

Lead hoje é a soma de três origens que não se sobrepõem: formulário da landing page, formulário nativo do Meta Ads e conversa iniciada no WhatsApp.

| Output (consequência) | Input (alavanca) |
|---|---|
| Custo por qualificado, volume de qualificados, custo total | CTR, CPC, CPM, taxa de conversão (cliques → leads), frequência, CPL, Lead → Qualificado |

A Ação sempre atua num input. "Reduzir o custo por lead" é objetivo, e objetivo não entra como Ação.

## Janelas de comparação

Sempre contra o período equivalente, porque cada dia da semana se comporta de um jeito.

| Janela analisada | Comparar com |
|---|---|
| Últimos 7 dias | Mesmos 7 dias da semana retrasada |
| Sexta a domingo | Mesmo fim de semana da semana anterior |
| Terça a quinta | Mesmos dias da semana anterior |

Feriado em qualquer uma das janelas entra no Fato e ajusta a leitura. Variação de um dia só vira Fato se aparecer na janela comparável.

## Cascata: de cima para baixo

1. **Campanha:** qual variou, em qual métrica e quanto
2. **Conjunto:** qual conjunto dentro da campanha responde pela variação
3. **Anúncio:** qual anúncio variou e se vale pausar
4. **Breakdowns:** idade, posicionamento, dispositivo, gênero, região, dia e horário, frequência (acima de 3 a 4 indica fadiga)

Só se desce um nível depois de achar a variação no nível de cima. O nível onde a variação aparece é onde está a Causa e onde a Ação atua.

## Quando pausar um anúncio

Uma semana ruim não basta. Todo anúncio é lido em **3, 7 e 14 dias**:

| Situação | Decisão |
|---|---|
| Mal nas três janelas | Candidato à pausa |
| Bem em 14 dias e mal nos últimos 3 | Monitorar |
| Bem em 7 e 14 dias, ruim só no fim de semana | Manter |

**Critérios para pausar:** custo acima da meta em 7 e 14 dias; zero ou quase zero leads com gasto relevante, depois de conferir que o rastreamento funciona; CTR caindo sem parar com frequência alta, mesmo depois de rotacionar criativo.

**Não pausar:** anúncio que puxa boa parte da verba sem uma leitura mais longa; período sazonal que encarece a campanha inteira; campanha ou conjunto em aprendizado (menos de 50 conversões em 7 dias).

**Antes de pausar, tentar corrigir:**

| Sintoma | Alternativa à pausa |
|---|---|
| CTR em queda | Testar criativo ou título novo |
| Clique alto e lead baixo | Alinhar a copy com o destino |
| CPM alto | Expandir audiência ou rotacionar criativos |
| Zero lead com gasto | Testar o fluxo do clique até o lead |
| Faixa etária gastando sem lead | Excluir a faixa |

## Teste de criativo novo

Os 7 primeiros dias de vida do criativo são o teste. O veredito sai pela métrica de decisão contra a meta: **Validado** (piso de investimento atingido e dentro da meta), **Descartado** (piso atingido e acima da meta) ou **Inconclusivo / testar novamente** (abaixo do piso). Piso de investimento: a definir junto com a meta.

## Regras que valem sempre

1. **Uma Ação por Causa.** Duas mudanças ao mesmo tempo deixam a próxima análise ilegível.
2. **Linha do tempo prova causa.** Se a variação veio antes da mudança feita na conta, a mudança não causou a variação.
3. **Toda hipótese fecha:** confirmada ou descartada com dado, nada fica em aberto.
4. **Faltou dado, pede o dado.** Nada de estimativa ou benchmark de mercado no lugar.
5. **Cuidado com o aprendizado:** editar verba, público, lance ou criativo em campanha ativa reinicia a fase de aprendizado.
6. **Contexto novo no meio da análise:** volta e corrige as conclusões anteriores.

## Como cada análise aparece nesta lista

- **Título** já diz a conclusão
- **Placar:** atual x comparação x meta
- **FCA:** até 3, com Fato, Causa e Ação em 2 a 4 linhas cada
- **Tabela por anúncio:** custo em 3, 7 e 14 dias e a decisão (manter, monitorar, candidato à pausa)
- **Gráficos anexados:** custo diário contra a meta e um gráfico que prova cada Causa
- **Próximas leituras:** o que conferir na próxima análise

Rotina: leitura semanal (últimos 7 dias) e leitura de fim de semana quando houver mudança relevante. Checkpoint mensal opcional com o funil por campanha e por conjunto.

## Em aberto (definir com o time)

- Meta da métrica de decisão e critério de lead qualificado (SQL)
- CRM de vendas onde o SQL é marcado, para ligar lead a anúncio
- O que a conversão "Signup" representa, para saber se entra na contagem de lead
