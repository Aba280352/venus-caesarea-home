// Generates wp/archive-template.json - Elementor elements for the new Product Archive template (shop + categories).
// Dynamic parts are shortcodes of the "Venus Shop Archive" plugin (wp/venus-shop-archive); product cards = loop item #2265 (same as homepage).
//   node _build/make-archive-template.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const B = 'var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif';
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';

const css = `/* ===== Venus shop archive (plugin Venus Shop Archive) ===== */
selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 96px;gap:0;display:block;font-family:${B};font-size:18px;font-weight:300;line-height:1.3;color:#141414}
selector .elementor-widget{margin:0}
selector [hidden]{display:none!important}
selector a{text-decoration:none}
body{background-color:#FFFBE9}
selector :is(.vpa-chip,.vpa-pchip,.vpa-more-btn,.vpa-sort select,.vpa-faq-q,.vpa-seo-tg){-webkit-tap-highlight-color:transparent;outline:none;box-shadow:none}
selector button{font-family:inherit;line-height:inherit;text-transform:none;letter-spacing:normal}
selector.is-loading .vpa-grid,selector.is-loading .vpa-more{opacity:.45;pointer-events:none;transition:opacity .2s}

selector .vpa-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:15px;color:rgba(20,20,20,.6)}
selector .vpa-crumbs a{color:inherit}
selector .vpa-crumbs a:hover{color:${G};text-decoration:underline}
selector .vpa-crumbs i{font-style:normal;opacity:.5}
selector .vpa-crumbs span{color:#141414}

selector .vpa-head{max-width:760px;margin:28px auto 0;text-align:center}
selector .vpa-title{margin:0;font-family:${H};font-weight:700;font-size:52px;line-height:1.1;color:#141414}
selector .vpa-intro{margin:14px 0 0;font-size:19px;line-height:1.5;color:rgba(20,20,20,.75)}

selector .vpa-bar{margin-top:36px}
@media(min-width:1025px){selector .vpa-bar{display:grid;grid-template-columns:minmax(0,max-content);justify-content:center}selector .vpa-cats{justify-content:flex-start}}
selector .vpa-cats{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
selector .vpa-chip{box-sizing:border-box;display:inline-flex;align-items:center;height:44px;padding:0 20px;border:1px solid ${LINE};border-radius:6px;background:transparent;color:#141414;font-size:17px;font-weight:400;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
selector .vpa-chip:hover,selector .vpa-chip:focus-visible{border-color:${G}}
selector .vpa-chip.is-on,selector .vpa-chip.is-on:hover{background:${G};border-color:${G};color:#fff}
selector .vpa-tools{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:28px;padding:0}
selector .vpa-prices{display:flex;align-items:center;gap:8px;min-width:0}
selector .vpa-lbl{font-size:16px;font-weight:500;margin-inline-end:4px;white-space:nowrap}
selector .vpa-pchip{box-sizing:border-box;display:inline-flex;align-items:center;height:36px;padding:0 14px;border:1px solid ${LINE};border-radius:6px;background:transparent;color:#141414;font-size:16px;font-weight:400;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
selector .vpa-pchip:hover,selector .vpa-pchip:focus-visible{border-color:${G}}
selector .vpa-pchip.is-on,selector .vpa-pchip.is-on:hover{background:${G};border-color:${G};color:#fff}
selector .vpa-side{display:flex;align-items:center;gap:16px;flex:none}
selector .vpa-count{font-size:16px;color:rgba(20,20,20,.6);white-space:nowrap}
selector .vpa-sort{margin:0}
selector .vpa-sort select{box-sizing:border-box;height:44px;min-width:210px;padding:0 16px 0 40px;border:1px solid ${LINE};border-radius:6px;background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23141414' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat left 14px center/18px;color:#141414;font-family:inherit;font-size:16px;font-weight:400;line-height:1.2;cursor:pointer;-webkit-appearance:none;appearance:none}
selector .vpa-sort select:hover,selector .vpa-sort select:focus{border-color:${G}}

selector .vpa-grid{margin-top:32px}
selector .vpa-grid .elementor-loop-container{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px 24px}
selector .vpa-grid .e-loop-item{width:auto;min-width:0}
selector .vpa-grid .e-loop__load-more,selector .vpa-grid .elementor-pagination{display:none}
selector .vpa-grid .e-loop-nothing-found-message,selector .vpa-grid .e-loop-nothing-found-message__text{padding:56px 0;text-align:center;font-size:19px;color:rgba(20,20,20,.7)}
selector .vpa-grid .vrc-btn.is-added .elementor-heading-title{background:${G};color:#fff}

selector .vpa-more{margin-top:48px;display:flex;flex-direction:column;align-items:center;gap:16px}
selector .vpa-shown{margin:0;font-size:16px;color:rgba(20,20,20,.6)}
selector .vpa-more-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 36px;border:1px solid #141414;border-radius:12px;background:transparent;color:#141414;font-size:18px;font-weight:500;transition:background .15s,color .15s,border-color .15s}
selector .vpa-more-btn:hover{background:${G};border-color:${G};color:#fff}
selector .vpa-more-btn.is-busy{opacity:.6;pointer-events:none}

selector .vpa-h2{margin:0;text-align:center;font-family:${H};font-weight:700;font-size:38px;line-height:1.12;color:#141414}
selector .vpa-sub{margin:8px 0 0;text-align:center;font-size:18px;color:rgba(20,20,20,.7)}
selector .vpa-revs{margin-top:96px}
selector .vpa-ti{margin-top:28px;min-height:240px}
selector .vpa-ti .ti-widget,selector .vpa-ti .ti-widget *{font-family:${B}!important}
selector .vpa-ti .ti-review-item .ti-inner,selector .vpa-ti .ti-inner{background-color:#fff!important}

selector .vpa-faq{max-width:860px;margin:96px auto 0}
selector .vpa-faq-l{margin-top:28px;border-top:1px solid ${LINE}}
selector .vpa-faq-i{border-bottom:1px solid ${LINE}}
selector .vpa-faq-q{box-sizing:border-box;width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 4px;border:0;border-radius:0;background:none;font:inherit;font-size:20px;font-weight:400;text-align:start;white-space:normal;color:#141414;cursor:pointer}
selector .vpa-faq-q:hover,selector .vpa-faq-q:focus{background:none;color:${G}}
selector .vpa-faq-q svg{flex:none;width:22px;height:22px;transition:transform .25s}
selector .vpa-faq-q[aria-expanded="true"] svg{transform:rotate(180deg)}
selector .vpa-faq-a{padding:0 4px 20px}
selector .vpa-faq-a p{margin:0 0 12px;font-size:17px;line-height:1.65;color:rgba(20,20,20,.8)}
selector .vpa-faq-a p:last-child{margin-bottom:0}

selector .vpa-seo{max-width:860px;margin:96px auto 0;font-size:17px;line-height:1.7;color:rgba(20,20,20,.8)}
selector .vpa-seo-in{position:relative}
selector .vpa-seo.is-clamped .vpa-seo-in{max-height:300px;overflow:hidden}
selector .vpa-seo.is-clamped .vpa-seo-in::after{content:"";position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(rgba(255,251,233,0),#FFFBE9)}
selector .vpa-seo.is-open .vpa-seo-in{max-height:none}
selector .vpa-seo.is-open .vpa-seo-in::after{display:none}
selector .vpa-seo h2{margin:0 0 16px;font-family:${H};font-weight:700;font-size:30px;line-height:1.15;color:#141414}
selector .vpa-seo h3{margin:28px 0 10px;font-size:21px;font-weight:600;line-height:1.3;color:#141414}
selector .vpa-seo p{margin:0 0 16px}
selector .vpa-seo strong{font-weight:500;color:#141414}
selector .vpa-seo a{color:${G};text-decoration:underline;text-underline-offset:3px}
selector .vpa-seo-tg{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:0;border:0;border-radius:0;background:none;color:#141414;font-size:17px;font-weight:500;cursor:pointer}
selector .vpa-seo-tg:hover,selector .vpa-seo-tg:focus{background:none;color:${G}}
selector .vpa-seo-tg svg{width:20px;height:20px;transition:transform .25s}
selector .vpa-seo.is-open .vpa-seo-tg svg{transform:rotate(180deg)}

@media(max-width:1024px){
selector .vpa-grid .elementor-loop-container{grid-template-columns:repeat(3,minmax(0,1fr))}
selector .vpa-tools{flex-direction:column;align-items:stretch}
selector .vpa-prices{overflow-x:auto;scrollbar-width:none}
selector .vpa-side{justify-content:space-between}
}
@media(max-width:767px){
selector{padding:16px 0 72px}
selector .vpa-crumbs{font-size:14px}
selector .vpa-head{margin-top:20px}
selector .vpa-title{font-size:34px}
selector .vpa-intro{font-size:16px;margin-top:10px}
selector .vpa-bar{margin-top:24px}
selector .vpa-cats{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;margin:0 -4vw;padding:0 4vw 2px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
selector .vpa-cats::-webkit-scrollbar,selector .vpa-prices::-webkit-scrollbar{display:none}
selector .vpa-chip{flex:none;height:40px;padding:0 16px;font-size:15px}
selector .vpa-tools{margin-top:16px;padding:0;gap:12px}
selector .vpa-prices{margin:0 -4vw;padding:0 4vw}
selector .vpa-lbl,selector .vpa-pchip,selector .vpa-count,selector .vpa-sort select{font-size:15px}
selector .vpa-pchip{flex:none;height:34px;padding:0 12px}
selector .vpa-sort select{min-width:0;width:190px;height:40px}
selector .vpa-grid{margin-top:20px}
selector .vpa-grid .elementor-loop-container{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 12px}
selector .vpa-more{margin-top:36px}
selector .vpa-more-btn{width:100%;height:50px}
selector .vpa-h2{font-size:30px}
selector .vpa-sub{font-size:16px}
selector .vpa-revs,selector .vpa-faq,selector .vpa-seo{margin-top:64px}
selector .vpa-faq-q{font-size:18px}
selector .vpa-seo{font-size:16px}
selector .vpa-seo h2{font-size:26px}
selector .vpa-seo h3{font-size:19px}
}`;

let n = 0;
const id = (p) => 'vpa' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: id('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });

const elements = [{
  id: 'vparoot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'vpa', custom_css: css },
  elements: [
    sc('[vns_pa_crumbs]'),
    sc('[vns_pa_head]'),
    sc('[vns_pa_bar]'),
    { id: 'vpagrid', elType: 'widget', widgetType: 'loop-grid', isInner: false, settings: {
      template_id: '2265', _skin: 'post', post_query_post_type: 'current_query', columns: 4, columns_tablet: 3, columns_mobile: 2,
      pagination_type: '', nothing_found_message: 'לא נמצאו מוצרים בטווח הזה – נסו תקציב אחר או קטגוריה אחרת.', _css_classes: 'vpa-grid' }, elements: [] },
    sc('[vns_pa_more]'),
    sc('[vns_pa_reviews]'),
    sc('[vns_pa_faq]'),
    sc('[vns_pa_seo]'),
  ],
}];

fs.mkdirSync(path.join(ROOT, 'wp'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'wp/archive-template.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length, 'bytes; css', css.length);
