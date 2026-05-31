// Build a self-contained preview page from data-viz-palettes.json.
// Data is embedded inline so the page opens directly from file:// (no fetch/CORS).
// Usage: bun build-palettes-preview.mjs   (or: node build-palettes-preview.mjs)
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(
  readFileSync(new URL('./data-viz-palettes.json', import.meta.url), 'utf8'),
);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${data.title}</title>
<style>
  :root {
    --bg: #0e0f12; --panel: #16181d; --line: #2a2d35; --ink: #e8eaed; --muted: #9aa0ab;
    --good: #34d399; --safe: #60a5fa; --chip: #20242c;
    --demo-bg: #14161b; --demo-grid: #2a2d35;
  }
  [data-bg="light"] { --bg:#f6f7f9; --panel:#ffffff; --line:#e3e6ea; --ink:#1b1e24; --muted:#5b626d; --chip:#eef1f5; --demo-bg:#ffffff; --demo-grid:#e7eaef; }
  [data-bg="mid"]   { --bg:#7d8390; --panel:#8b909b; --line:#9aa0ab; --ink:#15171b; --muted:#3a3d44; --chip:#979ca6; --demo-bg:#9aa0ab; --demo-grid:#aeb3bc; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased; }
  header { position:sticky; top:0; z-index:5; background:color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter:blur(8px); border-bottom:1px solid var(--line); padding:16px 22px; }
  h1 { margin:0 0 4px; font-size:18px; letter-spacing:-0.01em; }
  .sub { color:var(--muted); font-size:12.5px; }
  .sub b { color:var(--ink); font-weight:600; }
  .controls { display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin-top:12px; }
  .ctl { display:flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted); }
  select, .seg button { font:inherit; font-size:12.5px; color:var(--ink); background:var(--chip);
    border:1px solid var(--line); border-radius:8px; padding:5px 9px; cursor:pointer; }
  .seg { display:inline-flex; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
  .seg button { border:0; border-radius:0; background:transparent; }
  .seg button[aria-pressed="true"] { background:var(--chip); color:var(--ink); font-weight:600; }
  .grid { display:grid; gap:14px; padding:20px 22px 60px;
    grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); max-width:1500px; margin:0 auto; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; overflow:hidden;
    display:flex; flex-direction:column; }
  .swatches { display:flex; height:62px; }
  .swatches span { flex:1; position:relative; }
  .swatches span::after { content:attr(data-hex); position:absolute; left:0; right:0; bottom:4px; text-align:center;
    font:600 9.5px ui-monospace,SFMono-Regular,Menlo,monospace; color:rgba(255,255,255,.0); transition:color .12s; }
  .card:hover .swatches span::after { color:var(--lbl); }
  .body { padding:11px 13px 13px; }
  .row1 { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
  .name { font-weight:600; font-size:13px; letter-spacing:-0.01em; }
  .idx { color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; }
  .badges { display:flex; gap:5px; margin:7px 0 9px; flex-wrap:wrap; }
  .b { font-size:10.5px; font-weight:600; padding:2px 7px; border-radius:999px; border:1px solid var(--line); color:var(--muted); }
  .b.good { color:var(--good); border-color:color-mix(in srgb,var(--good) 45%,transparent); }
  .b.safe { color:var(--safe); border-color:color-mix(in srgb,var(--safe) 45%,transparent); }
  .demo { background:var(--demo-bg); border:1px solid var(--line); border-radius:9px; padding:8px; }
  .metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:6px 10px; margin-top:10px; }
  .metric { font-size:11px; color:var(--muted); }
  .metric b { display:block; color:var(--ink); font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
  .bar { height:5px; border-radius:3px; background:var(--chip); overflow:hidden; margin-top:3px; }
  .bar i { display:block; height:100%; background:var(--good); }
  a.cl { color:var(--muted); font-size:11px; text-decoration:none; margin-top:9px; display:inline-block; }
  a.cl:hover { color:var(--ink); text-decoration:underline; }
  .empty { color:var(--muted); padding:40px; text-align:center; grid-column:1/-1; }
</style>
</head>
<body data-bg="dark">
<header>
  <h1>${data.title}</h1>
  <div class="sub">
    <b>${data.count}</b> palettes from ${data.source} &middot;
    <b>${data.suitableCount}</b> pass data-viz floors &middot;
    <b>${data.cvdSafeCount}</b> colourblind-safe &middot;
    generated ${data.generatedAt.slice(0, 10)}
  </div>
  <div class="controls">
    <span class="ctl">Sort
      <select id="sort">
        <option value="composite">Composite score</option>
        <option value="minDeltaE2000">Distinctness (min &Delta;E)</option>
        <option value="harmony">Harmony</option>
        <option value="lightnessBalance">Lightness balance</option>
      </select>
    </span>
    <span class="ctl">Show
      <span class="seg" id="filter">
        <button data-f="all" aria-pressed="true">All</button>
        <button data-f="suitable">Suitable</button>
        <button data-f="cvd">CVD-safe</button>
      </span>
    </span>
    <span class="ctl">Background
      <span class="seg" id="bg">
        <button data-b="dark" aria-pressed="true">Dark</button>
        <button data-b="light">Light</button>
        <button data-b="mid">Gray</button>
      </span>
    </span>
  </div>
</header>
<main class="grid" id="grid"></main>

<script type="application/json" id="data">${JSON.stringify(data.palettes)}</script>
<script>
const palettes = JSON.parse(document.getElementById('data').textContent);
const grid = document.getElementById('grid');
let sortKey = 'composite', filter = 'all';

// luminance to pick readable hex-label colour over each swatch
function lum(hex){ const n=parseInt(hex.slice(1),16); const r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255;
  const f=c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4); return .2126*f(r)+.7152*f(g)+.0722*f(b); }

// mini demo: grouped bars + scatter using the palette, on the current demo bg
function demo(cols){
  const W=270,H=72,pad=6, n=cols.length;
  const heights=[0.95,0.55,0.78,0.4,0.66];
  const bw=(W-pad*2)/(n*1.7);
  let bars='';
  for(let i=0;i<n;i++){ const h=(H-pad*2)*heights[i]; const x=pad+i*(bw*1.7);
    bars+='<rect x="'+x.toFixed(1)+'" y="'+(H-pad-h).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+cols[i]+'"/>'; }
  // scatter dots overlaid right side
  const dots=[[0.62,0.3],[0.7,0.62],[0.78,0.4],[0.86,0.7],[0.93,0.5],[0.66,0.78],[0.82,0.24],[0.9,0.86]];
  let sc=''; dots.forEach((d,i)=>{ sc+='<circle cx="'+(d[0]*W).toFixed(1)+'" cy="'+(d[1]*H).toFixed(1)+'" r="3.4" fill="'+cols[i%n]+'"/>'; });
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="none" style="display:block;height:72px">'
    +'<line x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+(H-pad)+'" stroke="var(--demo-grid)" stroke-width="1"/>'
    +bars+sc+'</svg>';
}

function card(p){
  const sw = p.colors.map(c=>'<span style="background:'+c+';--lbl:'+(lum(c)>0.45?'#000':'#fff')+'" data-hex="'+c.toUpperCase()+'"></span>').join('');
  const s = p.scores;
  const mk=(label,val,frac)=>'<div class="metric">'+label+'<b>'+val+'</b><div class="bar"><i style="width:'+Math.round(frac*100)+'%"></i></div></div>';
  return '<article class="card">'
    + '<div class="swatches">'+sw+'</div>'
    + '<div class="body">'
    +   '<div class="row1"><span class="name">'+p.name+'</span><span class="idx">#'+p.id+'</span></div>'
    +   '<div class="badges">'
    +     '<span class="b '+(p.suitable?'good':'')+'">'+(p.suitable?'✓ suitable':'borderline')+'</span>'
    +     (s.cvd.safe?'<span class="b safe">◉ CVD-safe</span>':'')
    +   '</div>'
    +   '<div class="demo">'+demo(p.colors)+'</div>'
    +   '<div class="metrics">'
    +     mk('Composite', s.composite, s.composite)
    +     mk('Min ΔE', s.minDeltaE2000, Math.min(1,s.minDeltaE2000/40))
    +     mk('Harmony', s.harmony, s.harmony)
    +   '</div>'
    +   '<a class="cl" href="'+p.coolorsUrl+'" target="_blank" rel="noopener">open in coolors ↗</a>'
    + '</div></article>';
}

function render(){
  let list = palettes.slice();
  if(filter==='suitable') list=list.filter(p=>p.suitable);
  if(filter==='cvd') list=list.filter(p=>p.scores.cvd.safe);
  list.sort((a,b)=> (sortKey==='minDeltaE2000'? b.scores.minDeltaE2000-a.scores.minDeltaE2000 : b.scores[sortKey]-a.scores[sortKey]));
  grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No palettes match this filter.</div>';
}
document.getElementById('sort').addEventListener('change', e=>{ sortKey=e.target.value; render(); });
document.getElementById('filter').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b)return;
  filter=b.dataset.f; [...e.currentTarget.children].forEach(x=>x.setAttribute('aria-pressed', x===b)); render(); });
document.getElementById('bg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b)return;
  document.body.dataset.bg=b.dataset.b; [...e.currentTarget.children].forEach(x=>x.setAttribute('aria-pressed', x===b)); });
render();
</script>
</body>
</html>`;

writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(
  'Wrote index.html (' + (html.length / 1024).toFixed(1) + ' KB)',
);
