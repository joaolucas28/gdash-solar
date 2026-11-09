// Baixa o vídeo de um anúncio do Meta Ads para videos/ (somente leitura).
// Uso: node scripts/download-videos-ads.mjs <ID>=<ad_id>[,<ad_id>] ...   (ID = número do criativo na nomenclatura)
import 'dotenv/config';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const API = 'https://graph.facebook.com/v21.0', T = process.env.META_ACCESS_TOKEN;
const get = async (p, q, t = T) => (await fetch(`${API}/${p}?${new URLSearchParams({ ...q, access_token: t })}`)).json();
if (!process.argv[2]) { console.error('Uso: node scripts/download-videos-ads.mjs <ID>=<ad_id>[,<ad_id>] ...'); process.exit(1); }
mkdirSync('videos', { recursive: true });
const pages = await get('me/accounts', { fields: 'id,name,access_token', limit: '100' });

for (const arg of process.argv.slice(2)) {
  const [id, lista] = arg.split('=');
  if (!lista) { console.log(arg, 'sem ad_id: use <ID>=<ad_id>'); continue; }
  let feito = false;
  for (const ad of lista.split(',')) {
    const a = await get(ad, { fields: 'creative{video_id,object_story_spec,asset_feed_spec}' });
    const vid = a.creative?.video_id || a.creative?.object_story_spec?.video_data?.video_id || a.creative?.asset_feed_spec?.videos?.[0]?.video_id;
    if (!vid) { console.log(id, ad, 'sem video_id'); continue; }
    const file = `videos/${id}_${vid}.mp4`;
    if (existsSync(file)) { console.log('já existe', file); feito = true; break; }
    let src = null;
    for (const p of pages.data || []) { const r = await get(vid, { fields: 'source' }, p.access_token); if (r.source) { src = r.source; break; } }
    src ??= (await get(vid, { fields: 'source' })).source;
    if (!src) { console.log(id, 'sem acesso ao vídeo', vid); continue; }
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    writeFileSync(file, buf); console.log(file, (buf.length / 1e6).toFixed(1) + 'MB'); feito = true; break;
  }
  if (!feito) console.log(id, 'não baixado');
}
