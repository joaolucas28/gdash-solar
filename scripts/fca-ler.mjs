// FCA: lê dados/fca/<AF>/meta.json e imprime a cascata no terminal (somente plataforma, sem CRM).
// Uso: node scripts/fca-ler.mjs <atual fim>
// Lead = soma dos eventos listados em META_LEAD_ACTION no .env, separados por vírgula. Na Gdash são três origens que
// não se sobrepõem: Form Submit da LP, formulário nativo e conversa iniciada no WhatsApp (ver CLAUDE.md, seção 1).
// No bloco CONTA, cada origem também sai separada.
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';

const AF = process.argv[2], ARQ = `dados/fca/${AF}/meta.json`;
if (!AF || !existsSync(ARQ)) { console.error(`Uso: node scripts/fca-ler.mjs <atual fim>. Não achei ${ARQ}.`); process.exit(1); }
const M = JSON.parse(readFileSync(ARQ, 'utf8'));
const LEADS = (process.env.META_LEAD_ACTION || 'lead').split(',').map(s => s.trim()).filter(Boolean);
const NOME = { 'offsite_conversion.custom.922969469659896': 'LP (Form Submit)', 'onsite_conversion.lead_grouped': 'Form nativo', 'onsite_conversion.messaging_conversation_started_7d': 'WhatsApp' };

const acao = (r, t) => +(r.actions?.find(a => a.action_type === t)?.value || 0);
const leads = r => LEADS.reduce((s, t) => s + acao(r, t), 0);
function soma(rows, chave) {
  const g = {};
  for (const r of rows || []) {
    if (r.error) continue;
    const k = chave(r), o = (g[k] ??= { gasto: 0, imp: 0, cliques: 0, leads: 0, alcance: 0 });
    o.gasto += +r.spend || 0; o.imp += +r.impressions || 0; o.cliques += +r.inline_link_clicks || 0; o.leads += leads(r); o.alcance += +r.reach || 0;
  }
  return g;
}
const R = v => v == null || !isFinite(v) ? '-' : 'R$ ' + v.toFixed(2).replace('.', ',');
const P = v => v == null || !isFinite(v) ? '-' : (v * 100).toFixed(2).replace('.', ',') + '%';
const D = (a, b) => !b || !isFinite(a / b) ? '' : ` (${a >= b ? '+' : ''}${((a / b - 1) * 100).toFixed(0)}%)`;
const met = o => o ? { ...o, cpl: o.gasto / o.leads, ctr: o.cliques / o.imp, cpm: o.gasto / o.imp * 1000, cvr: o.leads / o.cliques, freq: o.imp / o.alcance } : null;

function tabela(titulo, cur, prev) {
  console.log(`\n== ${titulo}  (atual vs comparação)`);
  const ks = [...new Set([...Object.keys(cur), ...Object.keys(prev)])].sort((a, b) => (cur[b]?.gasto || 0) - (cur[a]?.gasto || 0));
  for (const k of ks) {
    const c = met(cur[k]), p = met(prev[k]);
    if (!c?.gasto) { console.log(`${k.slice(0, 60).padEnd(60)}  sem gasto na atual (antes ${R(p?.gasto ?? 0)})`); continue; }
    console.log(`${k.slice(0, 60).padEnd(60)}  gasto ${R(c.gasto)}${D(c.gasto, p?.gasto)} | leads ${c.leads}${D(c.leads, p?.leads)} | CPL ${R(c.cpl)}${D(c.cpl, p?.cpl)} | CTR ${P(c.ctr)} | CPM ${R(c.cpm)} | CVR ${P(c.cvr)} | freq ${c.freq.toFixed(2)}`);
  }
}

console.log(`Janelas: atual ${M.janelas.curr.since} a ${M.janelas.curr.until} | comparação ${M.janelas.prev.since} a ${M.janelas.prev.until} | lead = ${LEADS.map(t => NOME[t] || t).join(' + ')}`);
tabela('CONTA', soma(M.campaign_curr, () => 'conta'), soma(M.campaign_prev, () => 'conta'));
for (const [w, rows] of [['atual', M.campaign_curr], ['comparação', M.campaign_prev]])
  console.log(`   leads por origem (${w}): ` + LEADS.map(t => `${NOME[t] || t} ${(rows || []).reduce((s, r) => s + acao(r, t), 0)}`).join(' | '));
tabela('CAMPANHA', soma(M.campaign_curr, r => r.campaign_name), soma(M.campaign_prev, r => r.campaign_name));
tabela('CONJUNTO', soma(M.adset_curr, r => r.adset_name), soma(M.adset_prev, r => r.adset_name));
tabela('ANÚNCIO', soma(M.ad_curr, r => r.ad_name), soma(M.ad_prev, r => r.ad_name));

console.log('\n== ANÚNCIO em 3 · 7 · 14 dias (CPL)');
const a3 = soma(M.ad_d3, r => r.ad_name), a7 = soma(M.ad_curr, r => r.ad_name), a14 = soma(M.ad_d14, r => r.ad_name);
for (const k of Object.keys(a14).sort((a, b) => a14[b].gasto - a14[a].gasto))
  console.log(`${k.slice(0, 60).padEnd(60)}  ${R(met(a3[k])?.cpl)} · ${R(met(a7[k])?.cpl)} · ${R(met(a14[k])?.cpl)}  | gasto 14d ${R(a14[k].gasto)}`);

for (const bd of ['age', 'gender', 'placement', 'device', 'region']) {
  const chave = r => bd === 'placement' ? `${r.publisher_platform}/${r.platform_position}` : r[{ age: 'age', gender: 'gender', device: 'device_platform', region: 'region' }[bd]];
  tabela(`BREAKDOWN ${bd}`, soma(M[`bd_${bd}_curr`], chave), soma(M[`bd_${bd}_prev`], chave));
}

console.log('\n== ATIVIDADES (mudanças na conta)');
for (const a of M.activities || []) if (!a.error) console.log(`${a.event_time?.slice(0, 16)}  ${a.translated_event_type}  ${a.object_name}  ${a.actor_name || ''}`);
