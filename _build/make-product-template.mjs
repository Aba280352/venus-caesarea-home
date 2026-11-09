// Generates wp/product-template.json - the Elementor elements for the new Single Product template (WordPress).
// Static sections (perks, tabs, promises, reviews, FAQ) come verbatim from pages/product.html; dynamic parts are shortcodes of the
// "Venus Product Page" plugin (wp/venus-product-page). CSS = the "דף מוצר" block of venus-overrides.css with .vns -> selector.
//   node _build/make-product-template.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = fs.readFileSync(path.join(ROOT, 'pages/product.html'), 'utf8');
const ov = fs.readFileSync(path.join(ROOT, 'venus-overrides.css'), 'utf8');

const grab = (re, what) => { const m = page.match(re); if (!m) throw new Error('missing ' + what); return m[0]; };
const perks = grab(/<ul class="pd-perks">[\s\S]*?<\/ul>/, 'perks');
const tabBtns = grab(/<div class="pd-tabs" role="tablist">[\s\S]*?<\/div>/, 'tabs');
const panel1 = grab(/<div class="pd-panel" id="pd-p1"[\s\S]*?<\/div>\s*(?=<\/section>)/, 'panel1').trim();
const promise = grab(/<section class="pd-promise"[\s\S]*?<\/section>/, 'promise');
const revs = grab(/<section class="pd-revs"[\s\S]*?<\/section>/, 'revs');
const faq = grab(/<section class="pd-faq"[\s\S]*?<\/section>/, 'faq');

// ---- CSS ----
const start = ov.indexOf('.vns .pd{');
const end = ov.indexOf('/* תפריט אזורי משלוח');
let css = ov.slice(start, end).trim();
css = css.replace('.vns .pd{max-width:1240px;margin:0 auto;padding:24px 0 80px}',
  'selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 80px;gap:0;display:block;font-family:var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif;font-size:18px;font-weight:300;line-height:1.3;color:#141414}');
css = css.replace(/\.vns \.pd\{padding:16px 0 96px\}/, 'selector{padding:16px 0 96px}');
css = css.replace(/\.vns /g, 'selector ');
css = css.replace(/^\s*selector \.pd\{/m, 'selector{');
css = 'selector .pd-top>.e-con,selector .pd-tabs-sec{gap:0;--gap:0px;--padding-top:0px;--padding-right:0px;--padding-bottom:0px;--padding-left:0px;padding:0;min-width:0}\n' + css;
css += `
selector .elementor-widget{margin:0}
selector .rec-old{font-size:16px;font-weight:300;color:rgba(20,20,20,.5);text-decoration:line-through;white-space:nowrap}
selector button{font-family:inherit;line-height:inherit;text-transform:none;letter-spacing:normal}
selector .pd-rel{margin:80px 0 0}
@media(max-width:767px){selector .pd-rel{margin-top:56px}}
selector .pd-panel[hidden],selector .pd-faq-a[hidden]{display:none}
selector .woocommerce-notices-wrapper{margin:0}`;

// ---- elements ----
let n = 0;
const id = (p) => 'vpd' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const box = (cls, children, extra = {}) => ({ id: id('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra }, elements: children, widgetType: undefined });
const sc = (code, cls) => ({ id: id('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code, ...(cls ? { _css_classes: cls } : {}) }, elements: [] });
const html = (h, cls) => ({ id: id('h'), elType: 'widget', widgetType: 'html', isInner: false, settings: { html: h, ...(cls ? { _css_classes: cls } : {}) }, elements: [] });

const adds1 = '[vns_pd_addons ids="2150,2146,2144,2138,1523" title="תוספות שתמיד כיף לקבל" sub="כי אם כבר מפנקים – אז עד הסוף" cols="5"]';
const adds2 = '[vns_pd_addons ids="918,923,1195" title="אגרטלים לחוויה מקסימלית" sub="הזר מגיע, והאגרטל כבר מחכה" cols="3"]';

const elements = [{
  id: 'vpdroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'pd vpd', html_tag: 'article', custom_css: '/* ===== Venus single product (plugin Venus Product Page) ===== */\n' + css },
  elements: [
    { id: id('w'), elType: 'widget', widgetType: 'woocommerce-notices', isInner: false, settings: {}, elements: [] },
    sc('[vns_pd_crumbs]'),
    box('pd-top', [
      box('', [sc('[vns_pd_gallery]')]),
      box('pd-info', [sc('[vns_pd_head]'), sc('[vns_pd_buy]'), sc('[vns_pd_share]'), html(perks)]),
    ]),
    sc(adds1),
    sc(adds2),
    box('pd-tabs-sec', [html(tabBtns), sc('[vns_pd_desc]'), html(panel1)], { html_tag: 'section' }),
    html(promise),
    html(revs),
    html(faq),
    { id: 'vpdrel', elType: 'container', isInner: false, settings: { __clone: 'vnspcar' }, elements: [] },
    sc('[vns_pd_bar]'),
  ],
}];

fs.mkdirSync(path.join(ROOT, 'wp'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'wp/product-template.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length, 'bytes; css', css.length);
