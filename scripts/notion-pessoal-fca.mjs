// Arquiva um documento .md (FCA ou criativo) no Notion pessoal do João Lucas, com as imagens.
// Uso: node scripts/notion-pessoal-fca.mjs docs/fca/<AF>/FCA.md [--teste]
// Base: NOTION_PESSOAL_DB no .env (criada por node scripts/notion-pessoal-criar-base.mjs).
// Propriedades: Nome (título), Cliente = Gdash Solar, Categoria (da linha "Categoria:"), Descrição, Data (hoje).
// "[IMAGEM:x.png]" sobe a imagem; "> texto" vira destaque; "---" vira divisória; tabelas, títulos e listas viram blocos.
// Rodar de novo reescreve a mesma página (id guardado em notion_pessoal_page.txt, na pasta do documento).
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { lerDoc } from './lib-md.mjs';

const CLIENTE = 'Gdash Solar';
const [ARQ, FLAG] = process.argv.slice(2), TESTE = FLAG === '--teste';
const doc = lerDoc(ARQ);
const DB = process.env.NOTION_PESSOAL_DB, ID_FILE = path.join(doc.dir, 'notion_pessoal_page.txt');
const BASE = { Authorization: `Bearer ${process.env.NOTION_PESSOAL_TOKEN}`, 'Notion-Version': '2022-06-28' };
const H = { ...BASE, 'Content-Type': 'application/json' };
const api = async (method, p, body) => { const r = await (await fetch('https://api.notion.com/v1/' + p, { method, headers: H, body: body && JSON.stringify(body) })).json(); if (r.object === 'error') throw new Error(`${p}: ${r.message}`); return r; };
const rt = s => s.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map(p => p.startsWith('**') ? { type: 'text', text: { content: p.slice(2, -2) }, annotations: { bold: true } }
  : p.startsWith('`') ? { type: 'text', text: { content: p.slice(1, -1) }, annotations: { code: true } } : { type: 'text', text: { content: p } });
const blk = (type, s, extra = {}) => ({ object: 'block', type, [type]: { rich_text: rt(s), ...extra } });
const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

async function upload(file) {
  if (TESTE) return { type: 'image', file };
  const c = await api('POST', 'file_uploads', { filename: file, content_type: 'image/png' });
  const fd = new FormData(); fd.append('file', new Blob([readFileSync(path.join(doc.dir, file))], { type: 'image/png' }), file);
  const s = await (await fetch(`https://api.notion.com/v1/file_uploads/${c.id}/send`, { method: 'POST', headers: BASE, body: fd })).json();
  if (s.status !== 'uploaded') throw new Error(`upload ${file}: ${s.message}`);
  return { object: 'block', type: 'image', image: { type: 'file_upload', file_upload: { id: c.id } } };
}

const md = doc.corpo, blocks = [];
for (let i = 0; i < md.length; i++) {
  const l = md[i];
  if (!l.trim() || l.startsWith('# ')) continue;
  const im = l.match(/^\[IMAGEM:(.+)\]$/);
  if (im) { blocks.push(await upload(im[1].trim())); continue; }
  if (l.startsWith('|')) {
    const rows = []; while (i < md.length && md[i].startsWith('|')) { if (!/^\|[-:| ]+\|$/.test(md[i])) rows.push(cells(md[i])); i++; } i--;
    blocks.push({ object: 'block', type: 'table', table: { table_width: rows[0].length, has_column_header: true, has_row_header: false,
      children: rows.map(r => ({ object: 'block', type: 'table_row', table_row: { cells: r.map(c => rt(c)) } })) } });
  } else if (/^-{3,}$/.test(l)) blocks.push({ object: 'block', type: 'divider', divider: {} });
  else if (l.startsWith('> ')) {
    const parts = [l.slice(2)]; while (md[i + 1]?.startsWith('> ')) parts.push(md[++i].slice(2));
    blocks.push(blk('callout', parts.join('\n'), { icon: { type: 'emoji', emoji: '🎯' } }));
  }
  else if (l.startsWith('```')) { const code = []; while (++i < md.length && !md[i].startsWith('```')) code.push(md[i]); blocks.push(blk('code', code.join('\n'), { language: 'plain text' })); }
  else if (l.startsWith('## ')) blocks.push(blk('heading_2', l.slice(3)));
  else if (l.startsWith('### ')) blocks.push(blk('heading_3', l.slice(4)));
  else if (l.startsWith('- ')) blocks.push(blk('bulleted_list_item', l.slice(2)));
  else if (/^\d+\. /.test(l)) blocks.push(blk('numbered_list_item', l.replace(/^\d+\. /, '')));
  else blocks.push(blk('paragraph', l));
}

if (TESTE) { console.log(doc.titulo, '|', doc.descricao, '|', doc.categorias.join(', ')); console.log(blocks.map(b => b.type).join(' ')); process.exit(0); }
if (!process.env.NOTION_PESSOAL_TOKEN || !DB) { console.error('Preencha NOTION_PESSOAL_TOKEN e NOTION_PESSOAL_DB no .env.'); process.exit(1); }

const props = {
  Nome: { title: rt(doc.titulo) }, Cliente: { select: { name: CLIENTE } },
  'Categoria': { multi_select: doc.categorias.map(name => ({ name })) },
  'Descrição': { rich_text: rt(doc.descricao) }, Data: { date: { start: new Date().toISOString().slice(0, 10) } },
};
let PAGE = existsSync(ID_FILE) ? readFileSync(ID_FILE, 'utf8').trim() : null;
if (PAGE) {
  let cur, old = [];
  do { const r = await api('GET', `blocks/${PAGE}/children?page_size=100${cur ? '&start_cursor=' + cur : ''}`); old.push(...r.results); cur = r.has_more ? r.next_cursor : null; } while (cur);
  for (const b of old) await api('DELETE', `blocks/${b.id}`);
  await api('PATCH', `pages/${PAGE}`, { properties: props });
} else {
  PAGE = (await api('POST', 'pages', { parent: { database_id: DB }, properties: props })).id;
  writeFileSync(ID_FILE, PAGE);
}
for (let i = 0; i < blocks.length; i += 50) await api('PATCH', `blocks/${PAGE}/children`, { children: blocks.slice(i, i + 50) });
console.log('OK', blocks.length, 'blocos', (await api('GET', `pages/${PAGE}`)).url);
