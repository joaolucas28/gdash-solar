// Lista workspaces, espaços, pastas e listas do ClickUp com os IDs, para preencher CLICKUP_LIST_ID no .env.
// Uso: node scripts/clickup-listas.mjs   (somente leitura)
import 'dotenv/config';

const TOKEN = process.env.CLICKUP_TOKEN;
if (!TOKEN) { console.error('Preencha CLICKUP_TOKEN no .env (ClickUp > Settings > Apps > API Token, começa com pk_).'); process.exit(1); }
const get = async rota => {
  const r = await fetch('https://api.clickup.com/api/v2/' + rota, { headers: { Authorization: TOKEN } });
  const j = await r.json(); if (!r.ok) throw new Error(`${rota}: ${j.err || r.status}`); return j;
};

for (const t of (await get('team')).teams) {
  console.log(`Workspace: ${t.name} (${t.id})`);
  for (const s of (await get(`team/${t.id}/space?archived=false`)).spaces) {
    console.log(`  Espaço: ${s.name}`);
    for (const l of (await get(`space/${s.id}/list?archived=false`)).lists) console.log(`    Lista: ${l.name}  ->  ${l.id}`);
    for (const f of (await get(`space/${s.id}/folder?archived=false`)).folders) {
      console.log(`    Pasta: ${f.name}`);
      for (const l of f.lists) console.log(`      Lista: ${l.name}  ->  ${l.id}`);
    }
  }
}
