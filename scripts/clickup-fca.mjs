// Publica um documento .md (FCA ou criativo) como tarefa no ClickUp, com os gráficos anexados.
// Uso: node scripts/clickup-fca.mjs docs/fca/<AF>/FCA.md [--teste]
// Lista de destino: CLICKUP_LIST_ID no .env (achar com node scripts/clickup-listas.mjs).
// Rodar de novo reescreve a mesma tarefa (id guardado em clickup_task.txt, na pasta do documento)
// e só anexa as imagens que ainda não estão na tarefa.
// No corpo, "[IMAGEM:x.png]" vira uma linha "📎 Gráfico anexo: x.png".
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { lerDoc } from './lib-md.mjs';

const [ARQ, FLAG] = process.argv.slice(2), TESTE = FLAG === '--teste';
const doc = lerDoc(ARQ);
const TOKEN = process.env.CLICKUP_TOKEN, LISTA = process.env.CLICKUP_LIST_ID;
const ID_FILE = path.join(doc.dir, 'clickup_task.txt');

const texto = [
  doc.descricao && `**${doc.descricao}**`,
  `Categoria: ${doc.categorias.join(', ')}`,
  '',
  ...doc.corpo.map(l => l.replace(/^\[IMAGEM:(.+)\]$/, '📎 Gráfico anexo: $1')),
].filter(l => l !== false && l !== undefined).join('\n').replace(/^\n+/, '');

if (TESTE) {
  console.log('Título:', doc.titulo);
  console.log('Imagens:', doc.imagens.join(', ') || 'nenhuma');
  console.log('Corpo:', texto.length, 'caracteres. Lista:', LISTA || 'CLICKUP_LIST_ID vazio no .env');
  process.exit(0);
}
if (!TOKEN || !LISTA) { console.error('Preencha CLICKUP_TOKEN e CLICKUP_LIST_ID no .env.'); process.exit(1); }

const api = async (method, rota, body) => {
  const r = await fetch('https://api.clickup.com/api/v2/' + rota, {
    method, headers: { Authorization: TOKEN, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok || j.err) throw new Error(`${rota}: ${j.err || r.status}`);
  return j;
};

let id = existsSync(ID_FILE) ? readFileSync(ID_FILE, 'utf8').trim() : null;
if (id) await api('PUT', `task/${id}`, { name: doc.titulo, markdown_content: texto });
else {
  id = (await api('POST', `list/${LISTA}/task`, { name: doc.titulo, markdown_content: texto })).id;
  writeFileSync(ID_FILE, id);
}

const tarefa = await api('GET', `task/${id}`);
const jaTem = new Set((tarefa.attachments || []).map(a => a.title));
for (const f of doc.imagens) {
  if (jaTem.has(f)) continue;
  const fd = new FormData();
  fd.append('attachment', new Blob([readFileSync(path.join(doc.dir, f))], { type: 'image/png' }), f);
  const r = await fetch(`https://api.clickup.com/api/v2/task/${id}/attachment`, { method: 'POST', headers: { Authorization: TOKEN }, body: fd });
  if (!r.ok) throw new Error(`anexo ${f}: ${r.status} ${await r.text()}`);
}
console.log('OK', doc.imagens.length, 'imagens', tarefa.url);
