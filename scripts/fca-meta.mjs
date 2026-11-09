// FCA: puxa da API do Meta tudo que a cascata precisa. Somente leitura.
// Uso: node scripts/fca-meta.mjs <atual início> <atual fim> <comparação início> <comparação fim>   (datas AAAA-MM-DD)
// Grava dados/fca/<atual fim>/meta.json: campanha, conjunto e anúncio nas duas janelas, anúncio em 3 e 14 dias,
// breakdowns (idade, gênero, posicionamento, dispositivo, região, hora), série diária por campanha e log de atividades.
import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';

const [AI, AF, CI, CF] = process.argv.slice(2);
if (![AI, AF, CI, CF].every(d => /^\d{4}-\d{2}-\d{2}$/.test(d || ''))) {
  console.error('Uso: node scripts/fca-meta.mjs <atual início> <atual fim> <comparação início> <comparação fim> (AAAA-MM-DD)'); process.exit(1);
}
const API = 'https://graph.facebook.com/v21.0';
const ACCOUNT = process.env.META_AD_ACCOUNT_ID, TOKEN = process.env.META_ACCESS_TOKEN;
const dia = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

const W = { curr: { since: AI, until: AF }, prev: { since: CI, until: CF }, d3: { since: dia(AF, -2), until: AF }, d14: { since: dia(AF, -13), until: AF } };
const FIELDS = 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,reach,frequency,clicks,inline_link_clicks,ctr,cpc,cpm,actions';

async function fetchAll(url) {
  const out = [];
  while (url) {
    const j = await (await fetch(url)).json();
    if (j.error) throw new Error(j.error.message);
    out.push(...(j.data || []));
    url = j.paging?.next; // o link de paginação traz o token: usado aqui e nunca gravado
  }
  return out;
}
const insights = (level, range, extra = {}) => {
  const p = new URLSearchParams({ level, fields: FIELDS, time_range: JSON.stringify(range), limit: '500', access_token: TOKEN, ...extra });
  return fetchAll(`${API}/${ACCOUNT}/insights?${p}`);
};

const out = { janelas: W };
for (const level of ['campaign', 'adset', 'ad']) for (const w of ['curr', 'prev']) out[`${level}_${w}`] = await insights(level, W[w]);
for (const w of ['d3', 'd14']) out[`ad_${w}`] = await insights('ad', W[w]);

const BD = { age: 'age', gender: 'gender', placement: 'publisher_platform,platform_position', device: 'device_platform', region: 'region', hour: 'hourly_stats_aggregated_by_advertiser_time_zone' };
for (const [k, b] of Object.entries(BD)) for (const w of ['curr', 'prev']) {
  try { out[`bd_${k}_${w}`] = await insights('campaign', W[w], { breakdowns: b }); } catch (e) { out[`bd_${k}_${w}`] = [{ error: e.message }]; }
}

const ini = [CI, dia(AF, -13)].sort()[0];
out.daily = await insights('campaign', { since: ini, until: AF }, { time_increment: '1' });
out.daily_ad = await insights('ad', { since: ini, until: AF }, { time_increment: '1' });

const ap = new URLSearchParams({ fields: 'event_time,translated_event_type,object_name,object_type,extra_data,actor_name', since: dia(ini, -7), until: dia(AF, 1), limit: '500', access_token: TOKEN });
try { out.activities = await fetchAll(`${API}/${ACCOUNT}/activities?${ap}`); } catch (e) { out.activities = [{ error: e.message }]; }

const txt = JSON.stringify(out);
if (TOKEN && txt.includes(TOKEN)) throw new Error('Token apareceu na resposta. Nada foi gravado.');
mkdirSync(`dados/fca/${AF}`, { recursive: true });
writeFileSync(`dados/fca/${AF}/meta.json`, txt);
for (const [k, v] of Object.entries(out)) if (Array.isArray(v)) console.log(k, v.length, v[0]?.error ?? '');
console.log(`gravado em dados/fca/${AF}/meta.json`);
