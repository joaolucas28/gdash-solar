// Confere cada credencial do .env sem gravar nada. Uso: node scripts/conexoes.mjs
import 'dotenv/config';

const E = process.env;
const linha = (nome, ok, info) => console.log(`${ok ? 'OK  ' : 'FALTA'}  ${nome.padEnd(16)} ${info}`);
const json = async (url, headers = {}) => { const r = await fetch(url, { headers }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };

if (!E.META_ACCESS_TOKEN) linha('Meta Ads', false, 'META_ACCESS_TOKEN vazio');
else {
  const { j } = await json(`https://graph.facebook.com/v21.0/${E.META_AD_ACCOUNT_ID || 'me'}?fields=name&access_token=${E.META_ACCESS_TOKEN}`);
  linha('Meta Ads', !j.error, j.error ? j.error.message : `conta: ${j.name}`);
}

if (!E.CLICKUP_TOKEN) linha('ClickUp', false, 'CLICKUP_TOKEN vazio');
else {
  const u = await json('https://api.clickup.com/api/v2/user', { Authorization: E.CLICKUP_TOKEN });
  if (!u.ok) linha('ClickUp', false, u.j.err || 'token recusado');
  else if (!E.CLICKUP_LIST_ID) linha('ClickUp', false, `usuário ${u.j.user?.username}, mas CLICKUP_LIST_ID vazio (rodar clickup-listas.mjs)`);
  else {
    const l = await json(`https://api.clickup.com/api/v2/list/${E.CLICKUP_LIST_ID}`, { Authorization: E.CLICKUP_TOKEN });
    linha('ClickUp', l.ok, l.ok ? `usuário ${u.j.user?.username}, lista "${l.j.name}"` : `lista ${E.CLICKUP_LIST_ID} não encontrada`);
  }
}

if (!E.NOTION_PESSOAL_TOKEN) linha('Notion pessoal', false, 'NOTION_PESSOAL_TOKEN vazio');
else {
  const H = { Authorization: `Bearer ${E.NOTION_PESSOAL_TOKEN}`, 'Notion-Version': '2022-06-28' };
  const u = await json('https://api.notion.com/v1/users/me', H);
  if (!u.ok) linha('Notion pessoal', false, u.j.message || 'token recusado');
  else if (!E.NOTION_PESSOAL_DB) linha('Notion pessoal', false, `integração ${u.j.name}, mas NOTION_PESSOAL_DB vazio (rodar notion-pessoal-criar-base.mjs)`);
  else {
    const d = await json(`https://api.notion.com/v1/databases/${E.NOTION_PESSOAL_DB}`, H);
    linha('Notion pessoal', d.ok, d.ok ? `base "${d.j.title?.[0]?.plain_text}"` : 'base não encontrada ou não compartilhada com a integração');
  }
}

linha('CRM', !!E.DATABASE_URL, E.DATABASE_URL ? 'DATABASE_URL preenchido' : 'sem acesso ainda');
