// FCA: monta dados/fca/<AF>/graficos.json com os 3 gráficos-base a partir do meta.json (sem CRM, métrica = CPL).
// Uso: node scripts/fca-graficos-base.mjs <atual fim> [meta em R$]
//   1_diario.png   CPL diário da conta nos últimos 14 dias + comparação, com a janela atual sombreada
//   2_campanha.png CPL por campanha, atual x comparação
//   3_anuncio.png  CPL por anúncio com gasto na janela atual, atual x comparação
// Depois: acrescentar à mão um gráfico por FCA e rodar python scripts/fca-graficos.py <AF>.
// Quando o CRM entrar, trocar CPL pela métrica de decisão do CLAUDE.md.
import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const AF = process.argv[2], META = process.argv[3] ? +process.argv[3] : null, ARQ = `dados/fca/${AF}/meta.json`;
if (!AF || !existsSync(ARQ)) { console.error(`Uso: node scripts/fca-graficos-base.mjs <atual fim> [meta]. Não achei ${ARQ}.`); process.exit(1); }
const M = JSON.parse(readFileSync(ARQ, 'utf8')), J = M.janelas;
const LEADS = (process.env.META_LEAD_ACTION || 'lead').split(',').map(s => s.trim()).filter(Boolean);
const leads = r => LEADS.reduce((s, t) => s + +(r.actions?.find(a => a.action_type === t)?.value || 0), 0);
const ddmm = d => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const cpl = o => o && o.leads ? +(o.gasto / o.leads).toFixed(2) : null;
const agrega = (rows, k) => { const g = {}; for (const r of rows || []) { if (r.error) continue; const o = (g[k(r)] ??= { gasto: 0, leads: 0 }); o.gasto += +r.spend || 0; o.leads += leads(r); } return g; };
const curta = s => s.length > 38 ? s.slice(0, 36) + '…' : s;
const periodo = `${ddmm(J.curr.since)} a ${ddmm(J.curr.until)} x ${ddmm(J.prev.since)} a ${ddmm(J.prev.until)}`;
const notas = (vals, gs) => vals.map((v, i) => v === null ? (gs[i] ? 'sem lead' : 'sem gasto') : '');

const dia = agrega(M.daily, r => r.date_start), dias = Object.keys(dia).sort();
const g1 = { arquivo: '1_diario.png', tipo: 'linha', titulo: 'CPL diário da conta', formato: 'reais',
  subtitulo: `Lead = ${LEADS.length} origens somadas. Faixa = janela atual (${ddmm(J.curr.since)} a ${ddmm(J.curr.until)})`,
  x: dias.map(ddmm), series: [{ nome: 'CPL', valores: dias.map(d => cpl(dia[d])) }],
  faixas: [[ddmm(J.curr.since), ddmm(J.curr.until), 'janela atual']] };

function comparativo(arquivo, titulo, cur, prev) {
  // Só o que tem gasto relevante: 3% ou mais do investimento da janela, no máximo 12 itens. O resto vira nota no subtítulo.
  const total = Object.values(cur).reduce((s, o) => s + o.gasto, 0);
  const todos = Object.keys(cur).filter(k => cur[k].gasto > 0).sort((a, b) => cur[b].gasto - cur[a].gasto);
  const ks = todos.filter(k => cur[k].gasto >= total * 0.03).slice(0, 12), fora = todos.filter(k => !ks.includes(k));
  const resto = fora.length ? `. Fora: ${fora.length} com menos de 3% do gasto (R$ ${Math.round(fora.reduce((s, k) => s + cur[k].gasto, 0))})` : '';
  const va = ks.map(k => cpl(cur[k])), vp = ks.map(k => cpl(prev[k]));
  return { arquivo, tipo: 'barras_h', titulo, formato: 'reais', subtitulo: `CPL, ${periodo}. Ordenado por investimento atual${resto}`,
    x: ks.map(k => `${curta(k)} · R$ ${Math.round(cur[k].gasto)}`),
    series: [{ nome: 'Atual', valores: va, notas: notas(va, ks.map(k => cur[k].gasto)) },
             { nome: 'Comparação', valores: vp, notas: notas(vp, ks.map(k => prev[k]?.gasto || 0)) }] };
}
const g2 = comparativo('2_campanha.png', 'CPL por campanha', agrega(M.campaign_curr, r => r.campaign_name), agrega(M.campaign_prev, r => r.campaign_name));
const g3 = comparativo('3_anuncio.png', 'CPL por anúncio', agrega(M.ad_curr, r => r.ad_name), agrega(M.ad_prev, r => r.ad_name));
const todos = [g1, g2, g3];
if (META) for (const g of todos) g.meta = META;

const SAIDA = `dados/fca/${AF}/graficos.json`;
const extras = existsSync(SAIDA) ? JSON.parse(readFileSync(SAIDA, 'utf8')).filter(g => !todos.some(t => t.arquivo === g.arquivo)) : [];
writeFileSync(SAIDA, JSON.stringify([...todos, ...extras], null, 1));
console.log(`gravado ${SAIDA}: 3 gráficos-base${extras.length ? ` + ${extras.length} extras mantidos` : ''}${META ? `, meta R$ ${META}` : ', sem linha de meta'}`);
