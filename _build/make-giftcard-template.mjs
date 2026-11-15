// Generates wp/giftcard-template.json - Elementor single-product template used only for the gift card product.
// Look = the new product page (CSS reused from wp/product-template.json) + gift card form styles. Dynamic parts = "Venus Gift Card" plugin shortcodes.
//   node _build/make-product-template.mjs && node _build/make-giftcard-template.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pcss = JSON.parse(fs.readFileSync(path.join(ROOT, 'wp/product-template.json'), 'utf8'))[0].settings.custom_css;
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const B = 'var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif';
const ic = (d) => `<span class="pd-perk-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg></span>`;

const gcss = `
/* ===== gift card additions ===== */
selector .vgc-gal{position:sticky;top:110px}
selector .vgc-main{aspect-ratio:auto;border:0;background:none;border-radius:22px;overflow:visible}
selector .vgc-main img{display:block;width:100%;height:auto;border-radius:22px;box-shadow:0 26px 60px -28px rgba(20,20,20,.45);transform:none!important}
selector .vgc-amt{position:absolute;top:7%;left:5%;z-index:2;padding:8px 18px;border-radius:12px;background:#FFFBE9;color:${G};font-family:${B};font-weight:500;font-size:30px;line-height:1.1;box-shadow:0 8px 24px -10px rgba(20,20,20,.4)}
selector .vgc-price{font-size:40px}
selector .vgc-form{margin-top:28px}
selector .vgc-amounts{margin:0;padding:0;border:0;min-width:0}
selector .vgc-lbl{display:block;margin:0 0 12px;padding:0;font-size:18px;font-weight:500;color:#141414}
selector .vgc-pills{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
selector .vgc-pill{box-sizing:border-box;height:48px;min-width:0;padding:0 10px;border:1px solid ${LINE};border-radius:6px;background:transparent;color:#141414;font-family:inherit;font-size:18px;font-weight:400;line-height:1;cursor:pointer;transition:background .15s,color .15s,border-color .15s;-webkit-tap-highlight-color:transparent;outline:none;box-shadow:none}
selector .vgc-pill:hover,selector .vgc-pill:focus-visible{border-color:${G};background:transparent;color:#141414}
selector .vgc-pill.is-on,selector .vgc-pill.is-on:hover{background:${G};border-color:${G};color:#fff}
selector .vgc-custom{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:16px}
selector .vgc-custom label{font-size:16px;color:rgba(20,20,20,.75)}
selector .vgc-cwrap{position:relative;width:170px}
selector .vgc-cwrap span{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:17px;color:rgba(20,20,20,.6);pointer-events:none}
selector .vgc-form input[type=text],selector .vgc-form input[type=email],selector .vgc-form input[type=number],selector .vgc-form input[type=date],selector .vgc-form textarea{box-sizing:border-box;width:100%;height:48px;margin:0;padding:0 14px;border:1px solid ${LINE};border-radius:6px;background:#fff;color:#141414;font-family:inherit;font-size:17px;font-weight:300;line-height:1.3;box-shadow:none;outline:none;transition:border-color .15s}
selector .vgc-cwrap input[type=number]{padding-right:34px;-moz-appearance:textfield}
selector .vgc-cwrap input::-webkit-outer-spin-button,selector .vgc-cwrap input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
selector .vgc-form textarea{height:auto;min-height:110px;padding:12px 14px;resize:vertical}
selector .vgc-form input:focus,selector .vgc-form textarea:focus{border-color:${G}}
selector .vgc-form .is-bad{border-color:#B3261E!important}
selector .vgc-err{font-size:14px;color:#B3261E}
selector .vgc-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:28px}
selector .vgc-f{display:flex;flex-direction:column;gap:6px;min-width:0}
selector .vgc-full{grid-column:1/-1}
selector .vgc-f label{font-size:16px;font-weight:500;color:#141414}
selector .vgc-f label i{font-style:normal;color:${G}}
selector .vgc-hint{font-size:13px;line-height:1.4;color:rgba(20,20,20,.6)}
selector .vgc-count{align-self:flex-end;font-size:13px;color:rgba(20,20,20,.55)}
selector .vgc-count b{font-weight:400}
selector .vgc-cta{width:100%;margin-top:24px;flex:none}
selector .vgc-secure{margin:12px 0 0;text-align:center;font-size:14px;color:rgba(20,20,20,.6)}
selector .vgc-perks{margin-top:32px}
selector .pd-panel ol{margin:0 0 16px;padding-inline-start:22px}
selector .pd-panel ol li{margin-bottom:6px}
selector .vpa-revs{margin-top:80px}
selector .vpa-h2{margin:0;text-align:center;font-family:${H};font-weight:700;font-size:38px;line-height:1.12;color:#141414}
selector .vpa-sub{margin:8px 0 0;text-align:center;font-size:18px;color:rgba(20,20,20,.7)}
selector .vpa-ti{margin-top:28px;min-height:240px}
selector .vpa-ti .ti-widget,selector .vpa-ti .ti-widget *{font-family:${B}!important}
selector .vpa-ti .ti-inner{background-color:#fff!important}
@media(max-width:1024px){selector .vgc-gal{position:static}}
@media(max-width:767px){
selector .vgc-amt{font-size:20px;padding:6px 12px;border-radius:8px}
selector .vgc-price{font-size:32px}
selector .vgc-pills{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
selector .vgc-pill{min-width:0;padding:0 6px;font-size:16px;height:44px}
selector .vgc-fields{grid-template-columns:minmax(0,1fr);gap:14px}
selector .vgc-cwrap{width:150px}
selector .vpa-revs{margin-top:56px}
selector .vpa-h2{font-size:30px}
selector .vpa-sub{font-size:16px}
}`;

const perks = `<ul class="pd-perks vgc-perks">
<li>${ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')}<span>נשלח במייל<br>תוך דקות</span></li>
<li>${ic('<path d="M7 9a3 3 0 1 0 0 6c2.5 0 3.5-2 5-3s2.5-3 5-3a3 3 0 1 1 0 6c-2.5 0-3.5-2-5-3S9.5 9 7 9z"/>')}<span>ללא<br>תוקף</span></li>
<li>${ic('<path d="M4 10h16v10H4zM3 6l2-3h14l2 3v4H3z"/><path d="M10 20v-5h4v5"/>')}<span>מימוש באתר<br>ובחנות</span></li>
<li>${ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 13v3l2 1"/>')}<span>אפשר לתזמן<br>ליום המיוחד</span></li>
</ul>`;

const tabs = `<div class="pd-tabs" role="tablist"><button type="button" role="tab" class="pd-tab is-on" aria-selected="true" aria-controls="pd-p0">איך זה עובד</button><button type="button" role="tab" class="pd-tab" aria-selected="false" aria-controls="pd-p1">תנאי שימוש</button></div>
<div class="pd-panel" id="pd-p0" role="tabpanel">
<h3>איך זה עובד?</h3>
<ol>
<li>בוחרים סכום – מ־₪100 ועד ₪2,000.</li>
<li>ממלאים את שם המקבל, המייל שלו, ממי המתנה וברכה אישית.</li>
<li>רוצים שהשובר יגיע ביום מסוים? בוחרים תאריך שליחה. בלי תאריך הוא נשלח מיד אחרי התשלום.</li>
<li>המקבל מקבל מייל מעוצב עם קוד אישי, ואתם מקבלים עותק.</li>
</ol>
<h3>איך מממשים?</h3>
<ul>
<li><strong>באתר:</strong> מוסיפים מוצרים לסל ומזינים את הקוד בשדה "קוד קופון" בקופה.</li>
<li><strong>בחנות:</strong> מציגים את הקוד בחנות שלנו במרכז המסחרי C-CENTER, הרקיע 1, קיסריה.</li>
</ul>
</div>
<div class="pd-panel" id="pd-p1" role="tabpanel" hidden>
<ul>
<li>הגיפט קארד ללא תוקף.</li>
<li>אפשר לממש אותו בכמה הזמנות עד שהיתרה נגמרת. היתרה נשמרת על הקוד, באתר ובחנות.</li>
<li>אם ההזמנה יקרה יותר מהיתרה, משלמים את ההפרש בקופה.</li>
<li>השובר מכסה את המוצרים בהזמנה. דמי משלוח, אם יש, משולמים בנפרד.</li>
<li>אי אפשר להמיר את השובר לכסף או לקנות איתו גיפט קארד נוסף.</li>
<li>ביטול רכישה של גיפט קארד שעוד לא נוצל – לפי תקנון האתר וחוק הגנת הצרכן.</li>
<li>הקוד הלך לאיבוד? כתבו לנו בוואטסאפ <a href="https://wa.me/972532791444">053-279-1444</a> ונשלח אותו שוב.</li>
</ul>
</div>`;

const faqs = [
  ['איך המקבל מקבל את הגיפט קארד?', 'במייל מעוצב עם קוד אישי – מיד אחרי התשלום, או בבוקר של התאריך שבחרתם. אתם מקבלים עותק של אותו מייל.'],
  ['אפשר לבחור מתי השובר יישלח?', 'כן. בוחרים תאריך שליחה בטופס (עד שנה קדימה), והשובר יישלח בבוקר של אותו יום. אם לא בוחרים תאריך, הוא נשלח מיד.'],
  ['יש לגיפט קארד תוקף?', 'לא. הגיפט קארד ללא תוקף ואפשר לממש אותו מתי שרוצים.'],
  ['אפשר לממש את הגיפט קארד בחנות?', 'בטח. מציגים את הקוד בחנות במרכז המסחרי C-CENTER בקיסריה, ואנחנו מורידים את הסכום מהיתרה. מה שנשאר אפשר לממש בפעם הבאה – באתר או בחנות.'],
  ['מה קורה אם ההזמנה זולה או יקרה מהשובר?', 'אם ההזמנה זולה יותר, היתרה נשמרת על הקוד להזמנה הבאה. אם היא יקרה יותר, משלמים את ההפרש בקופה.'],
  ['השובר לא הגיע, מה עושים?', 'כדאי לבדוק בתיקיית הספאם או "קידומי מכירות". אם הוא לא שם, כתבו לנו בוואטסאפ 053-279-1444 ונשלח אותו שוב.'],
];
const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const faq = `<section class="pd-faq" aria-label="שאלות נפוצות"><h2 class="pd-h2">שאלות על הגיפט קארד</h2><div class="pd-faq-l">\n` +
  faqs.map(([q, a], i) => `<div class="pd-faq-i"><button type="button" class="pd-faq-q" aria-expanded="false" aria-controls="pd-faq-${i}">${q}${chev}</button><div class="pd-faq-a" id="pd-faq-${i}" hidden><p>${a}</p></div></div>`).join('\n') +
  `\n</div></section>`;

let n = 0;
const id = (p) => 'vgc' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const box = (cls, children, extra = {}) => ({ id: id('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra }, elements: children });
const sc = (code) => ({ id: id('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const html = (h) => ({ id: id('h'), elType: 'widget', widgetType: 'html', isInner: false, settings: { html: h }, elements: [] });

const elements = [{
  id: 'vgcroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'pd vpd vgc', html_tag: 'article', custom_css: pcss + gcss },
  elements: [
    { id: id('w'), elType: 'widget', widgetType: 'woocommerce-notices', isInner: false, settings: {}, elements: [] },
    sc('[vns_gc_crumbs]'),
    box('pd-top', [
      box('', [sc('[vns_gc_gallery]')]),
      box('pd-info', [sc('[vns_gc_head]'), sc('[vns_gc_form]'), html(perks)]),
    ]),
    box('pd-tabs-sec', [html(tabs)], { html_tag: 'section' }),
    sc('[vns_pa_reviews]'),
    html(faq),
  ],
}];

fs.writeFileSync(path.join(ROOT, 'wp/giftcard-template.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length, 'bytes');
