# FCA · Gdash Solar

## 1. Contexto fixo da conta

> **Campos marcados com `A DEFINIR` ainda não foram preenchidos.** Enquanto houver campo em aberto que a análise
> precise, pergunte ao usuário antes de concluir. Não preencha com suposição nem com o padrão de outro cliente.

| Item | Informação |
|---|---|
| Cliente | GDASH (gdash.solar), ligada à Sharenergy. Marca, produto e público: `cliente/marca.md` |
| Segmento | **SaaS B2B** de gestão de ativos de energia renovável (monitoramento de usinas, auditoria de faturas, relatórios, O&M, I-REC). Não vende energia solar ao consumidor |
| Oferta das campanhas | Varia por campanha: eventos e conteúdo (podcast GDASH Cast, lives, feiras como Intersolar e Expo Solar), ofertas sazonais (Black November), produto (Agente de IA, geração compartilhada) |
| Público (ICP) | Integradores, desenvolvedores e gestores de usinas de geração distribuída com mais de 20 sistemas e equipe de mais de 6 pessoas. Região: Brasil, com ações pontuais na América Latina (Expo Solar Colômbia) |
| Canais | Meta Ads (esta análise). A empresa também usa Google Ads, LinkedIn Ads, SEO, eventos e e-mail (Customer.io) |
| Destino | Varia por campanha: landing page, formulário nativo do Meta Ads ou WhatsApp |
| Conversão rastreada (lead) | Soma de 3 origens que não se sobrepõem: **LP** = conversão personalizada "Form Submit" (`offsite_conversion.custom.922969469659896`, evento `cf7submission` do pixel 373279804323629); **form nativo** = `onsite_conversion.lead_grouped`; **WhatsApp** = `onsite_conversion.messaging_conversation_started_7d`. Configurado em `META_LEAD_ACTION`. Não usar `fb_pixel_custom` (soma o evento "20s calls", que não é lead) nem `lead` junto com `lead_grouped` (conta o formulário duas vezes). A conversão "Signup" (`custom.2002813826844395`) existe mas não entra no lead até o usuário dizer o que ela representa |
| CRM | `A DEFINIR` (o SOP cita Customer.io para nutrição e PostHog para produto; CRM de vendas não identificado) |
| Métrica de decisão | `A DEFINIR` (ex.: custo por lead qualificado), meta de `A DEFINIR` |
| Funil | Lead → SQL → Oportunidade → Cliente (MRR). North Star da empresa: MRR. KPIs da weekly incluem custo por lead e SQLs |

Ao longo deste documento, **"custo por qualificado"** e **"meta"** se referem à métrica de decisão e à meta da tabela
acima. Quando forem definidas, troque os termos aqui e em `cliente/cliente.md`.

## 2. Regra de escopo (inegociável)

- **Contexto B2B de nicho:** o público é pequeno e técnico. CPL baixo com lead fora do ICP (consumidor final,
  integrador muito pequeno) é desperdício, não ganho. Antes de comemorar CPL, perguntar pela qualidade.

- **O output de decisão é o custo por qualificado**, contra a meta da seção 1. O CPL é input: dá para subir leads e
  piorar a qualidade ao mesmo tempo, então CPL bom não fecha análise.
- **Proxy de qualidade principal: Lead → Qualificado** (qualificados ÷ leads), assim que o CRM estiver ligado.
  Sem CRM, a análise fica no CPL e isso entra como ressalva no documento.
- **Venda** entra como confirmação, não como decisão: ciclo de venda de energia solar é longo e depende do comercial.
- Se o dado necessário para fechar uma Causa não estiver na mesa, peça o dado. Não preencha a lacuna com estimativa,
  benchmark de mercado ou suposição.
- Toda variação citada precisa vir com número e com o nível exato onde ela aparece (campanha, conjunto, anúncio ou breakdown).

## 3. O que é FCA

Três etapas obrigatórias antes de qualquer mexida na conta:

| Etapa | Pergunta que você responde |
|---|---|
| **Fato** | O que aconteceu? Qual métrica mudou e em quanto? |
| **Causa** | Por que aconteceu? Qual foi a origem da variação? |
| **Ação** | O que farei agora? Qual é a próxima mudança concreta? |

FCA sem Ação é observação. FCA sem Causa é chute. A Ação precisa responder diretamente à Causa.

### Formato padrão de saída

| Campo | Conteúdo |
|---|---|
| **Data** | Ex: 28/08 · Gdash Solar |
| **Período** | Ex: últimos 7 dias vs mesmos 7 dias da semana retrasada |
| **FATO** | Qual métrica variou, quanto, em qual campanha/conjunto/anúncio |
| **CAUSA** | Hipótese validada que explica o Fato, específica |
| **AÇÃO** | O que será feito, quando e por quem |

### Output vs Input

| Tipo | Métricas |
|---|---|
| **OUTPUT** (consequência) | Custo por qualificado, volume de qualificados, custo por venda, custo total |
| **INPUT** (alavanca) | CTR, CPC, CPM, taxa de conversão (cliques → leads), frequência, CPL, Lead → Qualificado |

Quando o custo por qualificado piora, decomponha em CPL × Lead → Qualificado e encontre qual input mudou.
**A Ação sempre atua em um input, nunca no output diretamente.**

## 4. Janelas de comparação

Sempre compare com o **período equivalente**, nunca com o imediatamente anterior. Dias da semana se comportam de formas diferentes.

| Janela analisada | Comparar com |
|---|---|
| Sexta + Sábado + Domingo | Mesmo FDS da semana anterior |
| Últimos 7 dias | Mesmos 7 dias da semana retrasada (não da semana passada) |
| Terça + Quarta + Quinta | Mesmos dias da semana anterior |

Se a janela ou a comparação pegar feriado, isso entra no Fato e a leitura é ajustada.

## 5. Cascata de análise

Sempre de cima para baixo. Nunca comece por um anúncio isolado.

| Nível | Pergunta |
|---|---|
| 1 · Campanha | Qual campanha variou? Em qual métrica e em quanto? |
| 2 · Conjunto | Qual conjunto dentro da campanha é o responsável? Pule este nível só se a campanha tiver um único conjunto. |
| 3 · Anúncio | Qual anúncio variou? Vale desativar? (ver seção 7) |
| 4 · Breakdowns | Ainda sem explicação após os 3 níveis? Desça para a segmentação. |

**Regra da cascata:** desça um nível só depois de identificar onde a variação está no nível acima. O nível onde você
encontra a variação é onde está a Causa, e é onde a Ação deve atuar. Granularidade de conjunto e de anúncio é obrigatória.

### Nível 4 · Breakdowns do Meta Ads

| Dimensão | O que observar |
|---|---|
| **Faixa etária** | Uma faixa pode dominar impressões e gasto sem gerar lead qualificado. |
| **Posicionamento** | Feed, Reels, Stories, Audience Network. Algum consumindo verba com baixa conversão? |
| **Dispositivo** | Mobile domina o volume. Se desktop tiver gasto relevante, olhe a taxa de conversão separada. |
| **Gênero** | Pode revelar desequilíbrio real no custo por lead. |
| **Região** | Confira se o gasto está no Brasil (ou no país da campanha, quando for evento fora). |
| **Dia / Horário** | A variação está concentrada em um período específico? |
| **Frequência** | Acima de 3 a 4 na janela indica fadiga de criativo. O CTR começa a cair. |

## 6. Padrões já observados nesta conta

Nenhum ainda. Registre aqui cada padrão que se repetir em mais de um FCA, com como se manifesta e o que fazer.
Padrão recorrente é ponto de partida da hipótese, nunca a Causa pronta.

| Padrão | Como se manifesta | O que fazer |
|---|---|---|
| | | |

## 7. Decisão de desativação de anúncio

Uma semana ruim não justifica pausa. Antes de pausar qualquer anúncio, analise **três janelas**:

| Janela | O que avaliar |
|---|---|
| 3 dias | Comportamento recente. Está com problema agora? |
| 7 dias | Tendência da semana. O problema se repete? |
| 14 dias | Médio prazo. O anúncio já foi bom no histórico? |

**Decisão:** mal nas três janelas, candidato à pausa. Bem nos 14 dias e mal nos últimos 3, monitore antes de decidir.

### Critérios para pausar
1. Custo por qualificado consistentemente acima da meta nas janelas de 7 e 14 dias. Para criativo em teste, vale a régua de 7 dias do `cliente.md`.
2. Zero ou quase zero conversões com gasto relevante, já validado que o rastreamento está funcionando.
3. CTR em queda contínua com frequência alta, sem recuperação após rotação de criativo.

### Quando NÃO pausar
- Resultado ruim só no fim de semana, mas dentro da meta em 7 e 14 dias.
- Anúncio que puxa grande parte da verba: exige análise mais longa antes de qualquer decisão.
- Período de sazonalidade ou data específica que encarece a campanha inteira.
- Campanha ou conjunto ainda em fase de aprendizado, com menos de ~50 conversões em 7 dias.

### Antes de pausar, considere corrigir

| Sintoma | Possível causa | Alternativa à pausa |
|---|---|---|
| CTR em queda | Criativo, copy ou título fraco | Testar novo criativo ou novos títulos |
| Clique alto e lead baixo | Promessa do anúncio desalinhada do destino | Ajustar copy ou o destino antes de mexer no anúncio |
| CPM alto | Fadiga de audiência ou pressão de leilão | Expandir audiência, rotacionar criativos |
| Zero leads com gasto relevante | Evento de conversão não registrando | Testar o fluxo do clique até o lead antes de pausar |
| Leads fora da região | Segmentação geográfica ampla demais | Restringir localização |
| Faixa etária consumindo verba sem lead | Segmentação aberta demais em idade | Excluir a faixa antes de mexer no anúncio |

## 8. Princípios metodológicos

1. **Decomposição é mapa, não veredito.** Quebrar o custo por qualificado em CPM × CTR × CVR × Lead → Qualificado mostra onde olhar, não o que causou.
2. **Linha do tempo é prova causal.** Se a variação veio antes da mudança operacional, a mudança não é a causa.
3. **Hipótese levantada é hipótese testada.** Cada uma confirmada ou descartada com dado. Nada em aberto no relatório.
4. **Uma Ação por Causa.** Duas mudanças simultâneas tornam o próximo FCA ilegível.
5. **Revisar é parte do método.** Contexto novo no meio da análise: volte e corrija as conclusões anteriores.

## 9. Checkpoint mensal (opcional)

- Funil por campanha: impressões, cliques, leads, qualificados, vendas, custo por qualificado vs meta
- Funil por conjunto: quais convertem, quais consomem verba sem resultado
- FCA escrito para toda campanha com custo por qualificado 50% acima da meta

## 10. Erros comuns

| Erro | Correção |
|---|---|
| Pular a cascata e ir direto ao anúncio | Siga sempre Campanha, Conjunto, Anúncio. |
| Pausar com base em janela curta | Analise 3, 7 e 14 dias. |
| Confundir output com alavanca | "Reduzir o custo por qualificado" é objetivo, não Ação. |
| Mexer em várias variáveis ao mesmo tempo | Uma Ação por Causa. |
| Reiniciar o aprendizado sem necessidade | Edição de verba, público, lance ou criativo em campanha ativa devolve o aprendizado ao início. |
| Tratar variação de 1 dia como tendência | Só vira Fato se aparecer na janela comparável. |

## 11. Dados necessários para fechar um FCA

1. **Janela e comparação**
2. **Nível dos dados:** campanha, conjunto ou anúncio
3. **Colunas mínimas:** valor gasto, impressões, cliques, CTR, CPC, CPM, conversões, custo por conversão, frequência
4. **Meta** da métrica de decisão (seção 1)
5. **Mudanças feitas no período**, com as datas
6. **Breakdowns**, se já puxados

Print, CSV ou digitado no chat: qualquer formato serve.

## 12. Formatos de entrega

| Pedido | Entrega |
|---|---|
| Análise completa | Skill `fca`: documento com gráficos e custo por qualificado por anúncio em `docs/fca/<data>/FCA.md`, publicado no **ClickUp** (entrega oficial) e arquivado no **Notion pessoal** do João Lucas |
| Tabela de dados | CSV |
| Leitura rápida no chat | FCA no formato padrão da seção 3, sem preâmbulo |

Sem travessão nos textos. Direto ao ponto, com o racional explícito por trás de cada decisão.
Escrita: `referencias/regras-escrita.md`. Canal sempre com nome completo ("Meta Ads", nunca "Meta").

## 13. Glossário

| Termo | Definição |
|---|---|
| **FCA** | Fato, Causa, Ação. |
| **Cascata** | Campanha, Conjunto, Anúncio, Breakdowns, nesta ordem. |
| **Lead** | `A DEFINIR` (o evento de conversão da seção 1). |
| **Qualificado** | `A DEFINIR` (critério do CRM). |
| **CPL** | Investimento ÷ leads. Input. |
| **Custo por qualificado** | Investimento ÷ qualificados. Métrica de decisão. |
| **Lead → Qualificado** | Qualificados ÷ leads. Proxy principal de qualidade. |
| **CTR** | Cliques ÷ impressões × 100. Input. |
| **CPM** | Custo por mil impressões. Input. |
| **CVR** | Leads ÷ cliques × 100. Input. |
| **Frequência** | Média de vezes que a mesma pessoa viu o anúncio na janela. |
| **FDS** | Final de semana (sábado + domingo). |

## 14. Repositório, credenciais e publicação

Repositório privado `joaolucas28/gdash-solar`, só da Gdash Solar. Nenhum outro cliente entra aqui.

| Pasta | O que tem |
|---|---|
| `CLAUDE.md` | Regras do FCA (este arquivo) |
| `cliente/` | `cliente.md` (contas, régua de criativo, teste de 7 dias), `guia-dados.md` e consultas |
| `criativos/<ID>/` | Documento de cada anúncio (vídeo e frames ficam só na máquina) |
| `criativos/baseline/meta/` | Peças validadas, com o número que provou |
| `.claude/skills/` | `fca` e `avaliar-criativo` |
| `referencias/` | Regras de escrita e glossário |
| `scripts/` | Scripts. Rodar sempre da raiz: `node scripts/x.mjs` |
| `dados/` | Dados puxados das APIs |
| `docs/` | FCAs, gráficos e `memoria-claude/` |

### Credenciais (`.env`)

| Variável | Para quê |
|---|---|
| `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | API do Meta Ads (conta no formato `act_...`) |
| `CLICKUP_TOKEN` | Token pessoal do ClickUp (`pk_...`, em Settings > Apps) |
| `CLICKUP_LIST_ID` | Lista do ClickUp onde cada FCA vira uma tarefa (achar com `node scripts/clickup-listas.mjs`) |
| `NOTION_PESSOAL_TOKEN` | Integração interna do Notion pessoal (notion.so/profile/integrations) |
| `NOTION_PESSOAL_DB` | Base "Análises" do Notion pessoal (criar com `node scripts/notion-pessoal-criar-base.mjs <id da página>`) |
| `DATABASE_URL` | CRM, quando houver acesso (somente leitura) |

Conferir tudo de uma vez: `node scripts/conexoes.mjs`.

O `.env` sobe só trancado com a senha do usuário, como `.env.cifrado` (AES-256-GCM, chave por scrypt). A senha é
digitada pelo usuário num terminal PowerShell e nunca aparece no chat nem em arquivo.
- Trancar, depois de criar ou trocar qualquer token: `node scripts/env-senha.mjs trancar`, depois commit e push do `.env.cifrado`.
- Abrir na outra máquina, depois do `git pull`: `node scripts/env-senha.mjs abrir`.

### Rotina

- **Ao começar uma sessão:** `git pull` antes de qualquer análise.
- **Ao terminar uma tarefa que alterou arquivos:** atualizar `docs/memoria-claude/`, commit com mensagem que diga o
  que mudou e `git push`. Antes do commit, conferir que nenhum token entrou em `dados/`.
- **Memória do Claude:** fica fora do repositório, em cada máquina. Em máquina nova, ler `docs/memoria-claude/` no
  início da sessão e recriar a memória local a partir dela.
