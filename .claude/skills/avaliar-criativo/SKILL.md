---
name: avaliar-criativo
description: Documenta um criativo de anúncio da Gdash Solar nos 7 dias de teste e decide o veredito (Validado, Descartado ou Inconclusivo / testar novamente) pela métrica de decisão contra a meta do CLAUDE.md. Use SEMPRE que o usuário pedir documentação de anúncio, análise de criativo, "esse criativo validou?", baseline de criativo, hook ou hold. NÃO use para FCA de conta (isso é a skill fca) nem para criar roteiro ou peça nova.
---

# Avaliar criativo · Gdash Solar

Regras do cliente: `cliente/cliente.md`. Onde está cada dado: `cliente/guia-dados.md`.
Escrita: `referencias/regras-escrita.md`. Rodar todo script **da raiz do projeto**.

## 1. Janela e dados

- **Teste = 7 primeiros dias de vida** (D1 = primeiro dia com gasto). Nunca período maior.
- Métrica de decisão e meta: seção 1 do `CLAUDE.md`. Se estiver `A DEFINIR`, perguntar antes.
- Sem CRM ligado ao anúncio, o documento sai com CPL e a ressalva de que o veredito final depende do qualificado.

## 2. Material da peça

1. Vídeo: `node scripts/download-videos-ads.mjs <ID>=<ad_id>` baixa para `videos/`. Copiar para `criativos/<ID>/`.
2. Frames sem ffmpeg: de dentro de `criativos/<ID>/`, `python -I ../../scripts/frames.py <video>.mp4 frames`.
3. Transcrição: `python scripts/transcribe-ads.py videos/<arquivo>.mp4` (grava em `dados/transcricoes_ads.json`).
4. Ler `sheet_hook.png` primeiro, depois a linha do tempo. Guia: `references/leitura-frames.md`.

## 3. Veredito

| Situação nos 7 dias | Veredito |
|---|---|
| Investimento abaixo do piso | Inconclusivo / testar novamente |
| Piso atingido e métrica na meta ou abaixo | Validado |
| Piso atingido e métrica acima da meta | Descartado |

Piso: seção 2 do `cliente.md`. Demais métricas contra a régua da seção 3, nunca contra referência de fora da conta.

## 4. Documento

Template: `templates/analise-criativo.md`. Salvar em `criativos/<ID>/DOC - <ID> - <nome curto>.md`.
Peça com volume: análise métrica por métrica e 3 a 6 aprendizados. Peça sem volume: documento curto.

## 5. Publicar

1. Validado: criar `criativos/baseline/meta/AD-<ID>.md` com o número que provou e a linha no `LEIA-ME.md`.
2. ClickUp e Notion pessoal: `node scripts/clickup-fca.mjs "<caminho do DOC>.md"` e
   `node scripts/notion-pessoal-fca.mjs "<caminho do DOC>.md"` (imagens lidas da mesma pasta do documento).
3. Commit e push.
