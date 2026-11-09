---
name: rodar-consultas-pelo-usuario
description: Usuário pede em linguagem natural e Claude roda o script; não ensinar comando
metadata:
  type: feedback
---

Quando o usuário perguntar um número, rodar o script ou a consulta e entregar a resposta. Não ensinar o comando como caminho principal.

**Why:** o usuário não quer ficar rodando node na mão; quer só pedir.

**How to apply:** rodar da raiz (`node scripts/x.mjs`), somente leitura, e responder com o número.
