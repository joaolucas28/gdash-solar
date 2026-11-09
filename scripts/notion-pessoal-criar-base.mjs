// Cria no Notion pessoal a base "Análises de Mídia Paga" que guarda as análises de todos os clientes.
// Uso: node scripts/notion-pessoal-criar-base.mjs <id ou link da página onde a base vai ficar>
// Antes: na página escolhida, menu "..." > Conexões > adicionar a integração do NOTION_PESSOAL_TOKEN.
// Depois: copiar o id impresso para NOTION_PESSOAL_DB no .env. A mesma base serve para outros clientes
// (o campo Cliente separa), então nos próximos projetos basta reaproveitar o mesmo id.
import 'dotenv/config';

const arg = process.argv[2] || '';
const pagina = (arg.replace(/-/g, '').match(/[0-9a-f]{32}/i) || [])[0];
if (!pagina) { console.error('Uso: node scripts/notion-pessoal-criar-base.mjs <id ou link da página>'); process.exit(1); }
if (!process.env.NOTION_PESSOAL_TOKEN) { console.error('Preencha NOTION_PESSOAL_TOKEN no .env.'); process.exit(1); }

const r = await (await fetch('https://api.notion.com/v1/databases', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.NOTION_PESSOAL_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parent: { type: 'page_id', page_id: pagina },
    title: [{ type: 'text', text: { content: 'Análises de Mídia Paga' } }],
    properties: {
      Nome: { title: {} },
      Cliente: { select: { options: [{ name: 'Gdash Solar', color: 'yellow' }] } },
      Categoria: { multi_select: { options: [{ name: 'Análise de Mídia Paga' }, { name: 'Meta Ads' }, { name: 'Google Ads' }] } },
      'Descrição': { rich_text: {} },
      Data: { date: {} },
    },
  }),
})).json();
if (r.object === 'error') { console.error('Erro:', r.message); process.exit(1); }
console.log('Base criada:', r.url);
console.log('Coloque no .env:  NOTION_PESSOAL_DB=' + r.id.replace(/-/g, ''));
