// Lê um documento .md de análise (FCA ou criativo) e separa o que vira propriedade do que vira corpo.
// "# Título" vira o nome; "Descrição: ..." e "Categoria: A, B" viram campos; "[IMAGEM:x.png]" aponta para um PNG
// da mesma pasta do documento.
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export function lerDoc(arquivo) {
  if (!arquivo || !existsSync(arquivo)) { console.error(`Documento não encontrado: ${arquivo}`); process.exit(1); }
  const dir = path.dirname(arquivo);
  const linhas = readFileSync(arquivo, 'utf8').split(/\r?\n/).map(l => l.trimEnd());
  let titulo = path.basename(arquivo, '.md'), descricao = '', categorias = null;
  const corpo = [], imagens = [];
  for (const l of linhas) {
    if (l.startsWith('# ') && titulo === path.basename(arquivo, '.md')) { titulo = l.slice(2).trim(); continue; }
    if (l.startsWith('Descrição:')) { descricao = l.slice(10).trim(); continue; }
    if (l.startsWith('Categoria:')) { categorias = l.slice(10).split(',').map(s => s.trim()).filter(Boolean); continue; }
    const im = l.match(/^\[IMAGEM:(.+)\]$/);
    if (im) {
      const f = im[1].trim();
      if (!existsSync(path.join(dir, f))) { console.error(`Imagem não encontrada: ${path.join(dir, f)}`); process.exit(1); }
      imagens.push(f);
    }
    corpo.push(l);
  }
  categorias ??= ['Análise de Mídia Paga', /google/i.test(titulo) ? 'Google Ads' : /tiktok/i.test(titulo) ? 'TikTok Ads' : 'Meta Ads'];
  return { dir, titulo, descricao, categorias, corpo, imagens };
}
