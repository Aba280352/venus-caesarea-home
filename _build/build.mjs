// Converts the Claude Design export (Main.dc.html) into static, Elementor-ready files:
//   sections/*.html  – one block per section (paste into an Elementor HTML widget / Theme Builder template)
//   venus.css        – the design's CSS, scoped under .vns so it cannot leak into the theme
//   index.html       – all sections assembled, for local preview
//
// Usage: node _build/build.mjs <path-to-extracted-export>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as real from './real-data.mjs';

const SRC = path.resolve(process.argv[2] || '');
const OUT = path.resolve(import.meta.dirname, '..');
if (!fs.existsSync(path.join(SRC, 'Main.dc.html'))) {
  console.error('Usage: node _build/build.mjs <path-to-extracted-export>');
  process.exit(1);
}
const html = fs.readFileSync(path.join(SRC, 'Main.dc.html'), 'utf8').replace(/\r\n/g, '\n');
const between = (s, a, b, from = 0) => { const i = s.indexOf(a, from); const j = s.indexOf(b, i + a.length); return s.slice(i + a.length, j); };

// ---------- assets ----------
const FONTS = {
  '5ab04fad5d74f712c8c22596b3d55acc.woff2': 'Leon-Bold.woff2',
  '8e4258e88b7583f461ce6b993fd63b3a.woff2': 'DiscoveryFs-Light.woff2',
  'e2f3865def2db6148a446b5b283c8e58.woff2': 'DiscoveryFs-Medium.woff2'
};
const FALLBACK_IMG = 'bc129f9bdf73ac725b82b0f0ba1c484f.jpg';
const assetById = {};
fs.mkdirSync(path.join(OUT, 'assets', 'fonts'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'sections'), { recursive: true });
for (const f of fs.readdirSync(path.join(SRC, 'assets'))) {
  const from = path.join(SRC, 'assets', f);
  if (FONTS[f]) { fs.copyFileSync(from, path.join(OUT, 'assets', 'fonts', FONTS[f])); continue; }
  assetById[f.replace(/\.\w+$/, '')] = f;
  fs.copyFileSync(from, path.join(OUT, 'assets', f));
}
const fixAssets = (s) => {
  for (const [hash, name] of Object.entries(FONTS)) s = s.split('./assets/' + hash).join('./assets/fonts/' + name);
  return s.replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => './assets/' + (assetById[id] || FALLBACK_IMG));
};

// ---------- CSS: scope every selector under .vns ----------
const scopeSel = (sel) => {
  sel = sel.trim();
  if (sel === 'body') return '';
  if (sel === 'html') return 'html';
  if (sel === '.acc-on') return '.vns.acc-on';
  if (sel.startsWith('.acc-on ')) return '.vns.acc-on ' + sel.slice(8);
  return '.vns ' + sel;
};
const scopeCss = (css) => {
  let out = '', i = 0;
  while (i < css.length) {
    const ws = /^(\s+|\/\*[\s\S]*?\*\/)/.exec(css.slice(i));
    if (ws) { out += ws[0]; i += ws[0].length; continue; }
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (prelude.startsWith('@media')) out += prelude + '{\n' + scopeCss(body) + '}';
    else if (prelude.startsWith('@')) out += prelude + '{' + body + '}';
    else { const sel = prelude.split(',').map(scopeSel).filter(Boolean).join(','); if (sel) out += sel + '{' + body + '}'; }
    i = j;
  }
  return out;
};
const css = fixAssets(scopeCss(between(html, '<style>', '</style>')));
fs.writeFileSync(path.join(OUT, 'venus.css'),
  '/* Venus Caesarea – generated from the design export by _build/build.mjs. Do not edit: put changes in venus-overrides.css */\n' + css.trim() + '\n');

// ---------- data: run the design's own logic class to get the exact content ----------
const scriptTag = /<script type="text\/x-dc"[^>]*data-props='([^']*)'[^>]*>/.exec(html);
const propDefs = JSON.parse(scriptTag[1]);
const props = Object.fromEntries(Object.entries(propDefs).map(([k, v]) => [k, v.default]));
const logic = between(html, scriptTag[0], '</script>', scriptTag.index);
const Component = vm.runInNewContext('class DCLogic{constructor(p){this.props=p}}\n' + logic + '\nComponent', {});
const comp = new Component(props);
comp.state = { open: null, slide: 0, tab: 0 };
const vals = comp.renderVals();
const tabData = vals.recTabs.map((_, i) => { comp.state.tab = i; const v = comp.renderVals(); return { items: v.recItems, cta: v.recCta }; });
vals.recTabs.forEach((t, i) => { t.cta = tabData[i].cta; });
vals.recGrids = tabData.map((t, i) => ({ items: t.items, attr: i ? ' hidden' : '' }));
// the design doubles every looping list for its marquee; venus.js clones at runtime instead
for (const k of ['trust', 'circles', 'bestItems', 'newItems', 'luxItems', 'brideItems', 'dealItems']) vals[k] = vals[k].slice(0, vals[k].length / 2);
// render every dropdown panel (closed) instead of only the open one
vals.navItems.forEach((n) => { n.isOpen = n.hasMenu; n.cls = ''; });
vals.searchOpen = vals.cartOpen = true;
vals.searchCls = vals.cartCls = '';
// real products, prices, links and contact details from the live store (site-data.json)
real.apply(vals, comp);

// ---------- template ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (scope, expr) => {
  expr = expr.trim();
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  return expr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
};
const subst = (s, scope) => s.replace(/\{\{([^}]*)\}\}/g, (_, e) => { const v = get(scope, e); return v == null || typeof v === 'function' ? '' : esc(String(v)); });
const render = (src, scope) => {
  let out = '', i = 0;
  const re = /<sc-(for|if)\b([^>]*)>/g;
  for (;;) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) { out += subst(src.slice(i), scope); break; }
    out += subst(src.slice(i, m.index), scope);
    const tag = 'sc-' + m[1];
    const re2 = new RegExp('<' + tag + '\\b[^>]*>|</' + tag + '>', 'g');
    re2.lastIndex = re.lastIndex;
    let depth = 1, mm;
    while ((mm = re2.exec(src))) { depth += mm[0][1] === '/' ? -1 : 1; if (!depth) break; }
    const inner = src.slice(re.lastIndex, mm.index);
    i = re2.lastIndex;
    if (m[1] === 'for') {
      const list = get(scope, /list="\{\{([^}]*)\}\}"/.exec(m[2])[1]) || [];
      const as = /as="([^"]*)"/.exec(m[2])[1];
      for (const it of list) out += render(inner, { ...scope, [as]: it });
    } else if (get(scope, /value="\{\{([^}]*)\}\}"/.exec(m[2])[1])) out += render(inner, scope);
  }
  return out;
};

let tpl = between(html, '</helmet>', '</x-dc>')
  .replace(/\s+on[A-Z]\w*="\{\{[^}]*\}\}"/g, '')
  .replace('aria-selected="{{t.sel}}"', 'aria-selected="{{t.sel}}" data-cta="{{t.cta}}" data-href="{{t.href}}"')
  .replace('<section class="pcar-sec" aria-label="זרי כלה">', '<section class="pcar-sec" aria-label="כל מה שצריך לחתונה">')
  .replace('<h2 class="rec-title">זרי כלה</h2>', '<h2 class="rec-title">כל מה שצריך לחתונה</h2>')
  .replace('<a href="#" class="vm-cta rl">', '<a href="{{m.href}}" class="vm-cta rl">')
  .replace('<a href="#" class="cat">', '<a href="{{c.href}}" class="cat">')
  .split('<a href="#" class="rec-card">').join('<a href="{{r.href}}" class="rec-card">')
  .replace('<a href="#" class="csl-card">', '<a href="{{b.href}}" class="csl-card">')
  .replace('<a href="#" class="rec-cta rl">', '<a href="{{recHref}}" class="rec-cta rl">')
  .replace('<li><a href="#">{{lnk}}</a></li>', '<li><a href="{{lnk.href}}">{{lnk.label}}</a></li>')
  .replace('<div class="rec-grid"><sc-for list="{{recItems}}" as="r" hint-placeholder-count="12">', '<sc-for list="{{recGrids}}" as="g"><div class="rec-grid"{{g.attr}}><sc-for list="{{g.items}}" as="r">')
  .replace('</sc-for></div>\n<a href="{{recHref}}" class="rec-cta', '</sc-for></div></sc-for>\n<a href="{{recHref}}" class="rec-cta');

// split the artboard into its top-level blocks
const NAMES = { trust: 'trust', vhero: 'hero', 'cats-wrap': 'categories', rec: 'recommended', 'abt-sec': 'about', 'rev-sec': 'reviews', 'csl-root': 'budget', 'dcs-root': 'areas', 'rwl-root': 'why', 'art-sec': 'magazine', 'ig-sec': 'instagram' };
const PCAR = ['bestsellers', 'new', 'luxury', 'bridal', 'deals'];
const chunks = [];
let pc = 0;
for (const line of tpl.split('\n')) {
  const cls = (/class="([\w-]+)/.exec(line) || [])[1];
  const start = /^<(header|footer)\b/.test(line) || (/^<(section|div)\b/.test(line) && (cls === 'pcar-sec' || cls in NAMES));
  if (start) {
    const name = line.startsWith('<header') ? 'header' : line.startsWith('<footer') ? 'footer' : cls === 'pcar-sec' ? PCAR[pc++] : NAMES[cls];
    chunks.push({ name, lines: [line] });
  } else if (chunks.length) chunks[chunks.length - 1].lines.push(line);
}
const count = (s, re) => (s.match(re) || []).length;
const blocks = {};
for (const c of chunks) {
  while (c.lines.length && !c.lines[c.lines.length - 1].trim()) c.lines.pop();
  // drop the closers of the artboard wrappers that trail this block
  while (c.lines[c.lines.length - 1].trim() === '</div>' && count(c.lines.join('\n'), /<\/div>/g) > count(c.lines.join('\n'), /<div\b/g)) {
    c.lines.pop();
    while (!c.lines[c.lines.length - 1].trim()) c.lines.pop();
  }
  let out = fixAssets(real.post(render(c.lines.join('\n'), vals)))
    .replace(/aria-expanded="true"/g, 'aria-expanded="false"')
    .replace(/<div class="(panel[^"]*|search-panel|cart-panel)"/g, '<div hidden class="$1"')
    .replace(/class="([^"]*)"/g, (_, v) => 'class="' + v.trim().replace(/\s+/g, ' ') + '"');
  if (c.name === 'reviews') {
    out = out.replace('<div class="dg-root"', '<div class="dg-root" data-logo="./assets/d4ddb7a5f9434ac69d189550b719890c.png"')
      .replace('<p class="rev-hint">', '<script type="application/json" class="dg-data">' + JSON.stringify(comp.reviews).replace(/</g, '\\u003c') + '</script>\n<p class="rev-hint">');
  }
  // the design has no mobile header: add a menu button, plus a favourites link that moves into the menu on phones.
  // (the CTA's href is already the real category link at this point, so match it by class only)
  if (c.name === 'header') {
    const before = out;
    out = out.replace(/<a href="[^"]*" class="hdr-cta rl"/, (m) => '<button type="button" class="hdr-burger" aria-label="תפריט" aria-expanded="false" aria-controls="vns-nav"><i></i><i></i><i></i></button>\n' + m)
      .replace('<nav aria-label="תפריט ראשי"', '<nav id="vns-nav" aria-label="תפריט ראשי"')
      .replace('</nav>', '<div class="nav-m"><a href="#" class="nav-link">מועדפים</a></div>\n</nav>');
    if (!out.includes('hdr-burger') || !out.includes('id="vns-nav"') || out === before) throw new Error('mobile header injection failed');
  }
  if (c.name === 'hero') out = out.replace('<section class="vhero', '<section data-auto="' + props.autoSeconds + '" class="vhero');
  blocks[c.name] = out;
}

// ---------- output ----------
const root = ['vns', vals.rootCls].filter(Boolean).join(' ');
const wrap = (cls, inner) => '<div class="' + root + ' ' + cls + '">\n' + inner + '\n</div>\n';
const files = [
  ['00-header', 'הדר + פס יתרונות · Theme Builder › Header', wrap('vns-top', blocks.trust + '\n' + blocks.header)],
  ['01-hero', 'מסך פתיחה (סליידר קטגוריות)', wrap('vns-sec', blocks.hero)],
  ['02-categories', 'עיגולי קטגוריות', wrap('vns-sec', blocks.categories)],
  ['03-recommended', 'המומלצים שלנו (טאבים)', wrap('vns-sec', blocks.recommended)],
  ['04-bestsellers', 'הנמכרים ביותר', wrap('vns-sec', blocks.bestsellers)],
  ['05-new', 'חדשים בחנות', wrap('vns-sec', blocks.new)],
  ['06-luxury', 'זרים יוקרתיים', wrap('vns-sec', blocks.luxury)],
  ['07-bridal', 'זרי כלה', wrap('vns-sec', blocks.bridal)],
  ['08-deals', 'מבצעים חמים', wrap('vns-sec', blocks.deals)],
  ['09-about', 'אודות', wrap('vns-sec', blocks.about)],
  ['10-reviews', 'ביקורות גוגל', wrap('vns-sec', blocks.reviews)],
  ['11-budget', 'קנייה לפי תקציב', wrap('vns-sec', blocks.budget)],
  ['12-areas', 'אזורי משלוח', wrap('vns-sec', blocks.areas)],
  ['13-why', 'למה ונוס קיסריה', wrap('vns-sec', blocks.why)],
  ['14-magazine', 'המגזין', wrap('vns-sec', blocks.magazine)],
  ['15-instagram', 'אינסטגרם', wrap('vns-sec', blocks.instagram)],
  ['99-footer', 'פוטר · Theme Builder › Footer', wrap('vns-foot', blocks.footer)]
];
for (const f of fs.readdirSync(path.join(OUT, 'sections'))) fs.unlinkSync(path.join(OUT, 'sections', f));
for (const [name, , body] of files) fs.writeFileSync(path.join(OUT, 'sections', name + '.html'), body);

const page = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ונוס קיסריה – פרחים ומתנות</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./venus.css">
<link rel="stylesheet" href="./venus-overrides.css">
</head>
<body class="vns-body">
${files.map(([name, label, body], i) => (i === 1 ? '<main>\n' : '') + (i === files.length - 1 ? '</main>\n' : '') + '<!-- ===== ' + name + ' · ' + label + ' ===== -->\n' + body).join('\n')}
<script src="./venus.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), page);
fs.writeFileSync(path.join(OUT, '_build', 'image-manifest.json'), JSON.stringify(real.manifest, null, 1));
console.log('Built ' + files.length + ' sections → ' + OUT);
