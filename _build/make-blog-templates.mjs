// Generates wp/blog-single-template.json (Elementor single-post) and wp/blog-archive-template.json (Elementor archive / magazine page).
// Dynamic parts = "Venus Blog" plugin shortcodes. The product carousel placeholder {__clone:'vnspcar'} is filled at deploy with a copy of the homepage carousel.
//   node _build/make-blog-templates.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const B = 'var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif';
const C = '#FFFBE9';

const base = `/* ===== Venus blog (plugin Venus Blog) ===== */
body{background-color:${C}}
html,body{overflow-x:clip!important;overflow-y:visible!important}
selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 96px;gap:0;display:block;font-family:${B};font-size:18px;font-weight:300;line-height:1.3;color:#141414}
selector .elementor-widget{margin:0}
selector [hidden]{display:none!important}
selector a{text-decoration:none}
selector button{font-family:inherit;line-height:inherit;text-transform:none;letter-spacing:normal}
selector .vbl-body,selector .vbl-body>.e-con{--padding-top:0px;--padding-right:0px;--padding-bottom:0px;--padding-left:0px;--gap:0px;gap:0}
selector .vbl-crumbs{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;font-size:15px;color:rgba(20,20,20,.6)}
selector .vbl-crumbs a{color:inherit}
selector .vbl-crumbs a:hover{color:${G};text-decoration:underline}
selector .vbl-crumbs i{font-style:normal;opacity:.5}
selector .vbl-crumbs span{color:#141414}
selector .vbl-tag{display:inline-flex;align-items:center;padding:7px 12px;border-radius:6px;background:${G};color:#fff;font-size:14px;font-weight:500;line-height:1}
selector .vbl-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:50px;padding:0 26px;border-radius:12px;font-size:17px;font-weight:500;line-height:1;white-space:nowrap;transition:background .15s,color .15s,border-color .15s;-webkit-tap-highlight-color:transparent}
selector .vbl-btn svg{width:20px;height:20px;flex:none}
selector .vbl-btn-green{background:${G};color:#fff}
selector .vbl-btn-green:hover{background:#2C3624;color:#fff}
selector .vbl-btn-cream{background:${C};color:${G}}
selector .vbl-btn-cream:hover{background:#fff;color:${G}}
selector .vbl-btn-line{border:1px solid rgba(255,251,233,.55);color:${C}}
selector .vbl-btn-line:hover{border-color:${C};background:rgba(255,251,233,.08);color:${C}}
selector .vbl-btn-full{width:100%}
selector .vbl-h2{margin:0;font-family:${H};font-weight:700;font-size:38px;line-height:1.12;color:#141414}
/* cards = homepage magazine card */
selector .vbl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
selector .vbl-card{display:flex;flex-direction:column;height:100%;box-sizing:border-box;background:#fff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;color:#141414}
selector .vbl-card-img{position:relative;display:block;aspect-ratio:4/3;overflow:hidden}
selector .vbl-card-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;max-width:none;border-radius:0;transition:transform .6s cubic-bezier(.16,1,.3,1)}
selector .vbl-card:hover .vbl-card-img img{transform:scale(1.04)}
selector .vbl-card-cat{position:absolute;top:16px;right:16px;z-index:2;padding:6px 12px;border-radius:6px;background:${G};color:#fff;font-size:14px;font-weight:500;line-height:1}
selector .vbl-card-body{display:flex;flex-direction:column;flex:1;padding:24px 28px 0}
selector .vbl-card-date{font-size:15px;opacity:.7}
selector .vbl-card-h{margin:12px 0 0;font-family:${H};font-size:clamp(22px,1.8vw,28px);font-weight:700;line-height:1.2;color:#141414;transition:color .15s}
selector .vbl-card:hover .vbl-card-h{color:${G}}
selector .vbl-card-ex{flex:1;margin-top:12px;font-size:17px;line-height:1.5;opacity:.8;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
selector .vbl-card-more{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding:18px 0 22px;border-top:1px solid ${LINE};font-size:18px;font-weight:500;color:${G}}
selector .vbl-card-more::after{content:"←";font-size:20px;line-height:1}
@media(max-width:1024px){selector .vbl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){
selector{padding:16px 0 72px}
selector .vbl-crumbs{font-size:14px}
selector .vbl-h2{font-size:30px}
selector .vbl-grid{grid-template-columns:minmax(0,1fr)}
selector .vbl-card-body{padding:20px 20px 0}
}`;

const single = `
selector .vbl-head{max-width:860px;margin:20px auto 0;text-align:center;display:flex;flex-direction:column;align-items:center}
selector .vbl-head .vbl-tag{margin-top:26px}
selector .vbl-title{margin:16px 0 0;font-family:${H};font-weight:700;font-size:52px;line-height:1.12;color:#141414}
selector .vbl-intro{margin:16px 0 0;max-width:720px;font-size:20px;line-height:1.55;color:rgba(20,20,20,.75)}
selector .vbl-meta{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 10px;margin-top:22px;font-size:15px;color:rgba(20,20,20,.7)}
selector .vbl-meta i{font-style:normal;opacity:.5}
selector .vbl-av{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${G};color:${C};font-family:"Cormorant Garamond",Georgia,serif;font-size:20px;line-height:1}
selector .vbl-read{display:inline-flex;align-items:center;gap:5px}
selector .vbl-read svg{width:16px;height:16px}
selector .vbl-hero{margin:36px 0 0}
selector .vbl-hero img{display:block;width:100%;height:auto;aspect-ratio:16/8;object-fit:cover;border-radius:16px}
selector .vbl-body{display:grid;grid-template-columns:minmax(0,760px) 320px;justify-content:space-between;align-items:start;gap:64px;margin-top:48px}
selector .vbl-body>.e-con{min-width:0;width:auto}
selector .vbl-aside{position:sticky;top:110px;align-self:start}
selector .vbl-toc{margin:0 0 36px;border:1px solid ${LINE};border-radius:12px;background:#fff}
selector .vbl-toc summary{display:flex;align-items:center;gap:10px;padding:18px 22px;cursor:pointer;list-style:none;font-size:18px;font-weight:500;-webkit-tap-highlight-color:transparent}
selector .vbl-toc summary::-webkit-details-marker{display:none}
selector .vbl-toc summary small{margin-inline-start:auto;font-size:14px;font-weight:300;opacity:.6}
selector .vbl-toc summary svg{width:20px;height:20px;flex:none;transition:transform .25s}
selector .vbl-toc[open] summary svg{transform:rotate(180deg)}
selector .vbl-toc ol{margin:0;padding:0 44px 20px 22px;counter-reset:t}
selector .vbl-toc li{margin:0;padding:6px 0;font-size:16px;line-height:1.45}
selector .vbl-toc li::marker{color:${G};font-weight:500}
selector .vbl-toc a{color:#141414}
selector .vbl-toc a:hover{color:${G};text-decoration:underline}
selector .vbl-content{font-size:19px;line-height:1.75;color:rgba(20,20,20,.88)}
selector .vbl-content>*:first-child{margin-top:0}
selector .vbl-content h2{margin:48px 0 16px;font-family:${H};font-size:34px;font-weight:700;line-height:1.2;color:#141414;scroll-margin-top:120px}
selector .vbl-content h3{margin:32px 0 10px;font-size:22px;font-weight:600;line-height:1.35;color:#141414}
selector .vbl-content h4{margin:24px 0 8px;font-size:19px;font-weight:600;color:#141414}
selector .vbl-content p{margin:0 0 20px}
selector .vbl-content strong,selector .vbl-content b{font-weight:500;color:#141414}
selector .vbl-content a{color:${G};text-decoration:underline;text-underline-offset:3px}
selector .vbl-content ul,selector .vbl-content ol{margin:0 0 22px;padding-inline-start:24px}
selector .vbl-content li{margin:0 0 8px}
selector .vbl-content li::marker{color:${G}}
selector .vbl-content img{max-width:100%;height:auto;border-radius:12px}
selector .vbl-content figure{margin:28px 0}
selector .vbl-content blockquote{margin:28px 0;padding:6px 22px;border-right:3px solid ${G};font-size:21px;color:#141414}
selector .vbl-content table{width:100%;margin:8px 0 28px;border-collapse:separate;border-spacing:0;border:1px solid ${LINE};border-radius:12px;overflow:hidden;background:#fff;font-size:16px;line-height:1.5}
selector .vbl-content th{background:${G};color:#fff;font-weight:500;text-align:right;padding:12px 14px}
selector .vbl-content td{padding:12px 14px;border-top:1px solid ${LINE};vertical-align:top}
selector .vbl-content .elementor{margin:28px 0}
selector .vbl-mid{margin:40px 0;padding:28px 32px;border-radius:16px;background:${G};color:${C}}
selector .vbl-mid-t{font-family:${H};font-weight:700;font-size:26px;line-height:1.2}
selector .vbl-mid p{margin:10px 0 0;font-size:17px;line-height:1.55;color:rgba(255,251,233,.85)}
selector .vbl-mid-b{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
selector .vbl-mid .vbl-btn{text-decoration:none}
selector .vbl-inprod{margin:32px 0;padding:22px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vbl-inprod-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:16px;font-size:18px;font-weight:500;color:#141414;line-height:1.3}
selector .vbl-inprod-h a{font-size:15px;font-weight:400;color:${G};text-decoration:underline}
selector .vbl-inprod-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
selector .vbl-pc{display:flex;flex-direction:column;gap:6px;color:#141414!important;text-decoration:none!important;line-height:1.3}
selector .vbl-pc-img{display:block;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid ${LINE}}
selector .vbl-pc-img img{width:100%;height:100%;object-fit:cover;display:block;border-radius:0;transition:transform .5s}
selector .vbl-pc:hover .vbl-pc-img img{transform:scale(1.05)}
selector .vbl-pc-n{font-size:15px;font-weight:500}
selector .vbl-pc-p{font-size:15px;opacity:.8}
selector .vbl-share{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:48px;padding-top:24px;border-top:1px solid ${LINE};font-size:16px;font-weight:500}
selector .vbl-share a,selector .vbl-share button{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid ${LINE};border-radius:50%;background:transparent;color:#141414;cursor:pointer;transition:border-color .15s,color .15s}
selector .vbl-share a:hover,selector .vbl-share button:hover{border-color:${G};color:${G};background:transparent}
selector .vbl-share svg{width:20px;height:20px}
selector .vbl-copied{font-style:normal;font-size:14px;font-weight:300;color:${G}}
selector .vbl-author{display:flex;align-items:center;gap:28px;margin-top:32px;padding:28px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vbl-author-logo{flex:none;display:flex;align-items:center;justify-content:center;width:150px}
selector .vbl-author-logo img{width:150px;height:auto;display:block}
selector .vbl-author small{display:block;font-size:14px;opacity:.6}
selector .vbl-author b{display:block;margin-top:2px;font-family:${H};font-size:24px;font-weight:700}
selector .vbl-author p{margin:8px 0 0;font-size:16px;line-height:1.6;color:rgba(20,20,20,.8)}
selector .vbl-author-l{display:flex;flex-wrap:wrap;gap:16px;margin-top:10px}
selector .vbl-author-l a{font-size:15px;font-weight:500;color:${G};text-decoration:underline}
selector .vbl-wa{padding:26px;border-radius:16px;background:${G};color:${C}}
selector .vbl-wa-t{font-family:${H};font-size:26px;font-weight:700;line-height:1.15}
selector .vbl-wa p{margin:10px 0 18px;font-size:16px;line-height:1.55;color:rgba(255,251,233,.85)}
selector .vbl-sp{margin-top:20px;padding:20px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vbl-sp-h{margin-bottom:14px;font-size:18px;font-weight:500}
selector .vbl-sp-i{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid rgba(20,20,20,.08);color:#141414}
selector .vbl-sp-i:first-of-type{border-top:0;padding-top:0}
selector .vbl-sp-img{flex:none;width:72px;height:72px;border-radius:10px;overflow:hidden;border:1px solid ${LINE}}
selector .vbl-sp-img img{width:100%;height:100%;object-fit:cover;display:block}
selector .vbl-sp-n{display:block;font-size:15px;font-weight:500;line-height:1.3}
selector .vbl-sp-i:hover .vbl-sp-n{color:${G}}
selector .vbl-sp-p{display:block;margin-top:4px;font-size:15px;opacity:.8}
selector .vbl-sp-all{display:block;margin-top:12px;font-size:15px;font-weight:500;color:${G}}
selector .vbl-prods{margin:96px 0 0}
selector .vbl-prods .vpcar-title .elementor-heading-title{font-size:38px}
selector .vpa-revs{margin-top:96px}
selector .vpa-revs .vpa-h2{margin:0;text-align:center;font-family:${H};font-weight:700;font-size:38px;line-height:1.12;color:#141414}
selector .vpa-sub{margin:8px 0 0;text-align:center;font-size:18px;color:rgba(20,20,20,.7)}
selector .vpa-ti{margin-top:28px;min-height:240px}
selector .vpa-ti .ti-widget,selector .vpa-ti .ti-widget *{font-family:${B}!important}
selector .vpa-ti .ti-inner{background-color:#fff!important}
selector .vbl-more{margin-top:96px}
selector .vbl-more-h{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:28px}
selector .vbl-more-h a{font-size:17px;font-weight:500;color:${G};text-decoration:underline}
@media(max-width:1024px){
selector .vbl-body{grid-template-columns:minmax(0,1fr);gap:0}
selector .vbl-aside{display:none}
}
@media(max-width:767px){
selector .vbl-title{font-size:32px}
selector .vbl-intro{font-size:17px}
selector .vbl-meta{font-size:14px}
selector .vbl-hero{margin-top:24px}
selector .vbl-hero img{aspect-ratio:4/3;border-radius:12px}
selector .vbl-body{margin-top:28px}
selector .vbl-content{font-size:17px;line-height:1.7}
selector .vbl-content h2{font-size:26px;margin-top:40px}
selector .vbl-content h3{font-size:19px}
selector .vbl-content table{display:block;overflow-x:auto;font-size:14px}
selector .vbl-mid{padding:22px}
selector .vbl-mid-t{font-size:22px}
selector .vbl-mid .vbl-btn{width:100%}
selector .vbl-inprod{padding:16px}
selector .vbl-inprod-g{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
selector .vbl-author{flex-direction:column;align-items:flex-start;gap:16px;padding:22px}
selector .vbl-prods,selector .vpa-revs,selector .vbl-more{margin-top:64px}
selector .vbl-prods .vpcar-title .elementor-heading-title,selector .vpa-revs .vpa-h2{font-size:30px}
selector .vbl-more-h{flex-direction:column;align-items:flex-start}
}`;

const archive = `
selector .vbl-ahead{max-width:860px;margin:20px auto 0;text-align:center;display:flex;flex-direction:column;align-items:center}
selector .vbl-atitle{margin:22px 0 0;font-family:${H};font-weight:700;font-size:60px;line-height:1.05;color:#141414}
selector .vbl-aintro{margin:14px 0 0;max-width:680px;font-size:19px;line-height:1.55;color:rgba(20,20,20,.75)}
selector .vbl-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:28px}
selector .vbl-chip{box-sizing:border-box;display:inline-flex;align-items:center;height:44px;padding:0 20px;border:1px solid ${LINE};border-radius:6px;color:#141414;font-size:17px;font-weight:400;white-space:nowrap;transition:background .15s,color .15s,border-color .15s;-webkit-tap-highlight-color:transparent;outline:none}
selector .vbl-chip:hover,selector .vbl-chip:focus-visible{border-color:${G}}
selector .vbl-chip.is-on,selector .vbl-chip.is-on:hover{background:${G};border-color:${G};color:#fff}
selector .vbl-alist{margin-top:44px;transition:opacity .2s}
selector .vbl-feat{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:48px;align-items:center;margin-bottom:48px}
selector .vbl-feat-img{display:block;aspect-ratio:4/3;border-radius:16px;overflow:hidden}
selector .vbl-feat-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.16,1,.3,1)}
selector .vbl-feat:hover .vbl-feat-img img{transform:scale(1.03)}
selector .vbl-feat-t{display:flex;flex-direction:column;align-items:flex-start}
selector .vbl-feat-t .vbl-card-date{margin-top:16px}
selector .vbl-feat-h{margin:12px 0 0;font-family:${H};font-size:clamp(30px,2.8vw,42px);font-weight:700;line-height:1.12}
selector .vbl-feat-h a{color:#141414}
selector .vbl-feat-h a:hover{color:${G}}
selector .vbl-feat-t p{margin:14px 0 24px;font-size:18px;line-height:1.6;color:rgba(20,20,20,.78)}
selector .vbl-amore{display:flex;flex-direction:column;align-items:center;gap:16px;margin-top:44px}
selector .vbl-amore p{margin:0;font-size:16px;color:rgba(20,20,20,.6)}
selector .vbl-more-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 36px;border:1px solid #141414;border-radius:12px;color:#141414;font-size:18px;font-weight:500;transition:background .15s,color .15s,border-color .15s}
selector .vbl-more-btn:hover{background:${G};border-color:${G};color:#fff}
selector .vbl-empty{text-align:center;font-size:19px;padding:48px 0}
@media(max-width:1024px){selector .vbl-feat{grid-template-columns:minmax(0,1fr);gap:24px}}
@media(max-width:767px){
selector .vbl-atitle{font-size:36px}
selector .vbl-aintro{font-size:16px}
selector .vbl-chips{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;width:calc(100% + 8vw);margin:20px -4vw 0;padding:0 4vw 2px;scrollbar-width:none}
selector .vbl-chips::-webkit-scrollbar{display:none}
selector .vbl-chip{flex:none;height:40px;padding:0 16px;font-size:15px}
selector .vbl-alist{margin-top:28px}
selector .vbl-feat{margin-bottom:28px}
selector .vbl-feat-img{border-radius:12px}
selector .vbl-feat-t p{font-size:16px}
selector .vbl-more-btn{width:100%}
}`;

let n = 0;
const id = (p) => 'vbl' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const box = (cls, children, extra = {}) => ({ id: id('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra }, elements: children });
const sc = (code) => ({ id: id('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });

const singleEls = [{
  id: 'vblroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'vbl', html_tag: 'article', custom_css: base + single },
  elements: [
    sc('[vns_bl_head]'),
    sc('[vns_bl_hero]'),
    box('vbl-body', [
      box('vbl-main', [sc('[vns_bl_toc]'), sc('[vns_bl_content]'), sc('[vns_bl_share]'), sc('[vns_bl_author]')]),
      box('vbl-aside', [sc('[vns_bl_side]')]),
    ]),
    { id: 'vblprods', elType: 'container', isInner: false, settings: { __clone: 'vnspcar' }, elements: [] },
    sc('[vns_pa_reviews]'),
    sc('[vns_bl_related]'),
  ],
}];
const archiveEls = [{
  id: 'vblaroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'vbl vbla', custom_css: base + archive },
  elements: [sc('[vns_bl_arch_head]'), sc('[vns_bl_arch_list]')],
}];

fs.writeFileSync(path.join(ROOT, 'wp/blog-single-template.json'), JSON.stringify(singleEls));
fs.writeFileSync(path.join(ROOT, 'wp/blog-archive-template.json'), JSON.stringify(archiveEls));
console.log('ok single', JSON.stringify(singleEls).length, 'archive', JSON.stringify(archiveEls).length);
