# FCA: gera os gráficos (PNG para o Notion) a partir de dados/fca/<atual fim>/graficos.json.
# Uso: python scripts/fca-graficos.py <atual fim>   -> grava em docs/fca/<atual fim>/
# Cada item do graficos.json:
#   arquivo, tipo ('linha', 'barras' ou 'barras_h' para rótulos longos, como anúncios), titulo, subtitulo, x (rótulos), series [{nome, valores}],
#   'legenda' (opcional, barras_h): posição da legenda, ex.: 'upper right'
#   series pode ter 'notas' (texto para valor vazio, ex.: 'sem gasto'); opcionais: meta (linha tracejada), formato ('reais', 'pct' ou 'num'), faixas [[x início, x fim, rótulo]], destaques [rótulos de x]
# Paleta de referência do dataviz, tema claro. Um eixo só; até 2 séries por gráfico.
import json, os, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

if len(sys.argv) < 2:
    sys.exit('Uso: python scripts/fca-graficos.py <atual fim> (AAAA-MM-DD)')
AF = sys.argv[1]
SPEC = f'dados/fca/{AF}/graficos.json'
OUT = f'docs/fca/{AF}'
os.makedirs(OUT, exist_ok=True)

SURF, TXT, TXT2, GRID = '#fcfcfb', '#0b0b0b', '#52514e', '#e4e3df'
CORES, SHADE = ['#2a78d6', '#eb6834'], '#f0efec'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10, 'axes.edgecolor': GRID, 'axes.labelcolor': TXT2,
                     'xtick.color': TXT2, 'ytick.color': TXT2, 'figure.facecolor': SURF, 'axes.facecolor': SURF})

def fmt(v, f):
    if v is None: return ''
    if f == 'reais' and float(v).is_integer() and v < 1000: return f'R$ {v:.0f}'
    if f == 'reais': return f'R$ {v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    if f == 'pct': return f'{v:.1f}%'.replace('.', ',')
    return f'{v:,.0f}'.replace(',', '.')

def barras_h(g):
    xs, f, series = g['x'], g.get('formato', 'num'), g['series'][:2]
    n, k = len(xs), len(series)
    alt = 1.9 + 0.62 * n * (1 if k == 1 else 1.35)
    fig, ax = plt.subplots(figsize=(10, alt), dpi=150)
    fig.text(0.04, 1 - 0.32 / alt, g['titulo'], fontsize=13, weight='bold', color=TXT, va='top', parse_math=False)
    fig.text(0.04, 1 - 0.68 / alt, g.get('subtitulo', ''), fontsize=9.5, color=TXT2, va='top', parse_math=False)
    fig.subplots_adjust(top=1 - 1.35 / alt, bottom=0.5 / alt, left=0.34, right=0.9)
    ax.grid(axis='x', color=GRID, lw=0.8); ax.set_axisbelow(True)
    for s in ['top', 'right', 'bottom']: ax.spines[s].set_visible(False)
    todos = [v for s in series for v in s['valores'] if v is not None] + ([g['meta']] if g.get('meta') else [])
    topo = max(todos) * 1.18 if todos else 1
    ax.set_xlim(0, topo)
    h = 0.78 / k
    for j, s in enumerate(series):
        pos = [i + (j - (k - 1) / 2) * h for i in range(n)]
        ax.barh(pos, [v or 0 for v in s['valores']], height=h - 0.04, color=CORES[j], label=s['nome'], zorder=3)
        notas = s.get('notas') or [''] * n
        for y, v, nt in zip(pos, s['valores'], notas):
            ax.text((v or 0) + topo * 0.008, y, fmt(v, f) if v is not None else (nt or 'sem dado'), va='center', fontsize=8.5,
                    color=TXT if v is not None else TXT2, zorder=4, bbox=dict(facecolor=SURF, edgecolor='none', pad=0.6))
    if g.get('meta'):
        ax.axvline(g['meta'], color=TXT2, lw=1, ls='--', zorder=2)
        ax.text(g['meta'], 1.0, ' meta ' + fmt(g['meta'], f), transform=ax.get_xaxis_transform(), ha='left', va='bottom', fontsize=8.5, color=TXT2)
    ax.set_yticks(range(n)); ax.set_yticklabels(xs, fontsize=9); ax.invert_yaxis()
    if k > 1: ax.legend(frameon=False, loc=g.get('legenda', 'lower right'), fontsize=9)
    fig.savefig(f"{OUT}/{g['arquivo']}"); plt.close(fig)
    print('ok', g['arquivo'])

def grafico(g):
    if g['tipo'] == 'barras_h': return barras_h(g)
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=150)
    fig.text(0.06, 0.95, g['titulo'], fontsize=13, weight='bold', color=TXT, va='top', parse_math=False)
    fig.text(0.06, 0.885, g.get('subtitulo', ''), fontsize=9.5, color=TXT2, va='top', parse_math=False)
    ax.grid(axis='y', color=GRID, lw=0.8); ax.set_axisbelow(True)
    for s in ['top', 'right', 'left']: ax.spines[s].set_visible(False)
    fig.subplots_adjust(top=0.78, bottom=0.16, left=0.07, right=0.9)
    xs, f, series = g['x'], g.get('formato', 'num'), g['series'][:2]
    todos = [v for s in series for v in s['valores'] if v is not None] + ([g['meta']] if g.get('meta') else [])
    topo = max(todos) * 1.25 if todos else 1
    ax.set_ylim(0, topo)
    for a, b, rot in g.get('faixas', []):
        if a in xs and b in xs:
            i, j = xs.index(a), xs.index(b)
            ax.axvspan(i - 0.5, j + 0.5, color=SHADE, zorder=0)
            ax.text((i + j) / 2, topo * 0.97, rot, ha='center', va='top', fontsize=8.5, color=TXT2)
    if g['tipo'] == 'barras':
        n = len(series); w = 0.72 / n
        for k, s in enumerate(series):
            pos = [i + (k - (n - 1) / 2) * (w + 0.02) for i in range(len(xs))]
            vals = [v if v is not None else 0 for v in s['valores']]
            ax.bar(pos, vals, width=w, color=CORES[k], label=s['nome'], zorder=3)
            for x, v in zip(pos, s['valores']):
                if v is not None: ax.text(x, v + topo * 0.01, fmt(v, f), ha='center', va='bottom', fontsize=8.5, color=TXT, zorder=4, bbox=dict(facecolor=SURF, edgecolor='none', pad=0.6))
    else:
        for k, s in enumerate(series):
            ax.plot(range(len(xs)), s['valores'], color=CORES[k], lw=2, marker='o', ms=4.5, zorder=3, label=s['nome'])
        for d in g.get('destaques', []):
            if d in xs:
                i = xs.index(d); v = series[0]['valores'][i]
                if v is not None: ax.annotate(fmt(v, f), (i, v), xytext=(0, 8), textcoords='offset points', ha='center', fontsize=8.5, color=TXT)
    if g.get('meta'):
        ax.axhline(g['meta'], color=TXT2, lw=1, ls='--')
        ax.text(1.005, g['meta'], 'meta\n' + fmt(g['meta'], f), transform=ax.get_yaxis_transform(), ha='left', va='center', fontsize=8.5, color=TXT2)
    ax.set_xticks(range(len(xs)))
    ax.set_xticklabels(xs, rotation=45 if len(xs) > 10 else 0, fontsize=8 if len(xs) > 10 else 9.5)
    if len(series) > 1: fig.legend(*ax.get_legend_handles_labels(), frameon=False, loc='upper right', bbox_to_anchor=(0.97, 0.97), fontsize=9)
    fig.savefig(f"{OUT}/{g['arquivo']}"); plt.close(fig)
    print('ok', g['arquivo'])

for g in json.load(open(SPEC, encoding='utf-8')):
    grafico(g)
