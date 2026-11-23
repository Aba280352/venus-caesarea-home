// Generates wp/service-car-page.json - "קישוט רכב לחתונה" service page (same layout system as the other service pages:
// serviceCss from make-service-stage.mjs, 50/50, no tag pills, library icons). Products sold straight from the page
// (WooCommerce [add_to_cart] shortcode = live price + ajax add to cart) + custom-design form + WhatsApp.
//   node _build/make-service-car.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serviceCss } from './make-service-stage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const icon = (n) => fs.readFileSync(path.join(ROOT, 'assets/icons', n + '.svg'), 'utf8').replace(/ xmlns="[^"]*"/, '').replace(/ width="24" height="24"/, '').trim();
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לתאם קישוט רכב לחתונה 🌸');
const ART_CAR = '/2026/11/08/wedding-car-decoration/';
const ART_BOUQUET = '/2026/08/11/bridal-bouquet/';
const WEDDINGS = '/product-category/%d7%97%d7%aa%d7%95%d7%a0%d7%95%d7%aa/';
const FULL = '/product/%d7%9e%d7%95%d7%a6%d7%a8/';
const HANDLES = '/product/%d7%a7%d7%99%d7%a9%d7%95%d7%98-%d7%a8%d7%9b%d7%91-%d7%97%d7%aa%d7%95%d7%a0%d7%94-4-%d7%99%d7%93%d7%99%d7%95%d7%aa/';
const P = 'vsv';

const extra = `
selector .${P}-bul{margin:22px 0 0;padding:0;list-style:none}
selector .${P}-bul li{position:relative;padding:10px 26px 10px 0;border-bottom:1px solid rgba(20,20,20,.1);font-size:17px;line-height:1.5;color:rgba(20,20,20,.85)}
selector .${P}-bul li::before{content:"";position:absolute;right:4px;top:19px;width:8px;height:8px;border-radius:50%;background:${G}}
selector .${P}-img.land img{aspect-ratio:4/3}
selector .${P}-img.port img{aspect-ratio:4/5}
selector .${P}-link{display:inline-block;font-size:17px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px}
/* packages */
selector .${P}-pk-h{max-width:720px}
selector .${P}-pkgs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:36px}
selector .${P}-pkg{display:flex;flex-direction:column;border:1px solid ${LINE};border-radius:16px;background:#fff;overflow:hidden}
selector .${P}-pkg figure{margin:0!important}
selector .${P}-pkg figure img{display:block;width:100%;aspect-ratio:16/10;height:auto;object-fit:cover}
selector .${P}-pkg-b{display:flex;flex:1;flex-direction:column;padding:28px}
selector .${P}-pkg h3{margin:0;font-family:${H};font-size:28px;font-weight:700;line-height:1.15;color:#141414}
selector .${P}-pkg-b>p{margin:8px 0 0;font-size:16px;line-height:1.6;color:rgba(20,20,20,.72)}
selector .${P}-inc{margin:18px 0 0;padding:0;list-style:none;border-top:1px solid rgba(20,20,20,.1)}
selector .${P}-inc li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(20,20,20,.1);font-size:16px;color:#141414}
selector .${P}-inc li b{font-weight:500;color:${G}}
selector .${P}-inc li.no{color:rgba(20,20,20,.45)}
selector .${P}-inc li.no b{color:rgba(20,20,20,.4);font-weight:400}
selector .${P}-buy{margin-top:auto;padding-top:24px}
selector .${P}-buy .add_to_cart_inline{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:0!important;padding:0!important;border:0!important}
selector .${P}-buy .amount{font-family:${H};font-size:30px;font-weight:700;color:#141414}
selector .${P}-buy del,selector .${P}-buy del .amount{font-family:inherit;font-size:17px;font-weight:300;color:rgba(20,20,20,.5)}
selector .${P}-buy ins{text-decoration:none}
selector .${P}-buy .add_to_cart_button{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;height:52px;margin-inline-start:auto!important;padding:0 28px!important;border:0!important;border-radius:12px!important;background:${G}!important;color:#fff!important;font-family:inherit!important;font-size:17px!important;font-weight:500!important;line-height:1!important;transition:background .15s}
selector .${P}-buy .add_to_cart_button:hover{background:#2C3624!important}
selector .${P}-buy .add_to_cart_button.loading{opacity:.6}
selector .${P}-buy .added_to_cart{flex-basis:100%;font-size:16px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px;text-align:left}
selector .${P}-pkg .${P}-link{margin-top:14px;font-size:15px}
selector .${P}-pk-note{margin:22px 0 0;font-size:17px;color:rgba(20,20,20,.75)}
selector .${P}-pk-note a{color:${G};font-weight:500;text-decoration:underline;text-underline-offset:3px}
/* bouquets */
selector .${P}-bqs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:36px}
selector .${P}-bq{display:flex;flex-direction:column;border:1px solid ${LINE};border-radius:16px;background:#fff;overflow:hidden}
selector .${P}-bq>a{display:block}
selector .${P}-bq img{display:block;width:100%;aspect-ratio:4/5;height:auto;object-fit:cover}
selector .${P}-bq-b{display:flex;flex:1;flex-direction:column;padding:16px 18px 18px}
selector .${P}-bq h3{margin:0;font-size:18px;font-weight:500;line-height:1.3}
selector .${P}-bq h3 a{color:#141414}
selector .${P}-bq .${P}-buy{padding-top:12px}
selector .${P}-bq .${P}-buy .amount{font-size:22px}
selector .${P}-bq .${P}-buy .add_to_cart_button{height:42px;padding:0 16px!important;font-size:15px!important}
@media(max-width:1024px){selector .${P}-bqs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){selector .${P}-bul li{font-size:16px}selector .${P}-pkgs{grid-template-columns:minmax(0,1fr)}selector .${P}-pkg-b{padding:22px}selector .${P}-bqs{gap:10px}selector .${P}-bq-b{padding:12px}selector .${P}-bq h3{font-size:16px}selector .${P}-bq .${P}-buy .add_to_cart_button{width:100%;margin-inline-start:0!important}}`;

const hero = `<section class="${P}-split ${P}-hero" aria-label="קישוט רכב לחתונה">
<div>
<nav class="${P}-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>שירותים</span><i aria-hidden="true">›</i><span>קישוט רכב לחתונה</span></nav>
<h1 class="${P}-title">קישוט רכב <b>לחתונה</b></h1>
<p class="${P}-p">טול, גיבסנית ופרחים טריים על הידיות, על המראות ועל חזית הרכב – כדי שהרכב ייראה חגיגי בצילומים, בהגעה לאולם וביציאה בסוף הערב. בוחרים קישוט באתר, מתאמים שעה, ואנחנו מקשטים.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-green" href="#packages">לבחירת קישוט</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">${icon('chat-dots')}דברו איתנו בוואטסאפ</a></div>
<div class="${P}-trust"><span>${icon('clock')}מזמינים עד 24 שעות מראש</span><span>${icon('location-pin')}מתחם C Center, קיסריה</span></div>
</div>
<div class="${P}-img">[vns_img id="2469" size="full" eager="1" sizes="(max-width:1024px) 92vw, 800px" alt="רכב שחור עם קישוט חתונה מלא – טול כחול וגיבסנית – ונוס קיסריה"]</div>
</section>`;

const inc = (rows) => `<ul class="${P}-inc">${rows.map(([t, ok]) => `<li${ok ? '' : ' class="no"'}><span>${t}</span><b>${ok ? 'כלול' : 'לא כלול'}</b></li>`).join('')}</ul>`;
const packages = `<section class="${P}-sec" id="packages" aria-label="אפשרויות הקישוט">
<div class="${P}-pk-h"><h2 class="${P}-h2">שתי אפשרויות קישוט</h2><p class="${P}-p">קישוט מלא לרכב שבולט בכל תמונה, או נגיעה עדינה על הידיות בלבד. אפשר להוסיף לסל ישירות מכאן.</p></div>
<div class="${P}-pkgs">
<article class="${P}-pkg"><figure>[vns_img id="2470" size="large" sizes="(max-width:767px) 92vw, 600px" alt="קישוט רכב לחתונה מלא – פס טול, ידיות ומראות – ונוס קיסריה"]</figure><div class="${P}-pkg-b">
<h3>קישוט רכב מלא</h3><p>מראה אחיד וחגיגי מכל זווית – מתאים במיוחד לצילומים ולהגעה לאולם.</p>
${inc([['4 ידיות – גיבסנית וטול', true], ['2 המראות', true], ['פס טול לאורך הרכב', true], ['סידור גיבסנית מקדימה', true], ['סידור גיבסנית מאחורה', true]])}
<div class="${P}-buy">[add_to_cart id="1456" show_price="true" style=""]</div><a class="${P}-link" href="${FULL}">לפרטים בעמוד המוצר</a></div></article>
<article class="${P}-pkg"><figure>[vns_img id="1460" size="large" sizes="(max-width:767px) 92vw, 600px" alt="קישוט 4 ידיות לרכב חתונה – גיבסנית וטול לבן – ונוס קיסריה"]</figure><div class="${P}-pkg-b">
<h3>קישוט 4 ידיות</h3><p>נגיעה חגיגית ועדינה בתקציב נמוך יותר – מתאים גם לרכב קטן.</p>
${inc([['4 ידיות – גיבסנית וטול', true], ['2 המראות', false], ['פס טול לאורך הרכב', false], ['סידור גיבסנית מקדימה', false], ['סידור גיבסנית מאחורה', false]])}
<div class="${P}-buy">[add_to_cart id="1461" show_price="true" style=""]</div><a class="${P}-link" href="${HANDLES}">לפרטים בעמוד המוצר</a></div></article>
</div>
<p class="${P}-pk-note">רוצים גוונים אחרים, פרחים נוספים או עיצוב שמתאים לזר הכלה? <a href="#quote">השאירו פרטים לעיצוב אישי</a></p>
</section>`;

const steps = [
  ['1', 'מזמינים', 'באתר, בוואטסאפ או בטלפון – לפחות 24 שעות מראש. בעונת החתונות ולפני חמישי ושישי, עדיף מוקדם יותר.'],
  ['2', 'מתאמים שעה וגוונים', 'קובעים איתנו מתי הרכב צריך להיות מוכן, ומספרים על הגוונים של הזר והחופה.'],
  ['3', 'מקשטים אצלנו בקיסריה', 'מגיעים עם הרכב לחנות במתחם C Center בשעה שתיאמנו, ואנחנו מקשטים במקום בפרחים טריים.'],
  ['4', 'יוצאים לדרך', 'בודקים שהכול יציב ושהמראות והשמשה פנויות – ונוסעים לצילומים בנחת.'],
];
const how = `<section class="${P}-split ${P}-sec" aria-label="איך זה עובד">
<div class="${P}-img port">[vns_img id="1459" size="large" sizes="(max-width:1024px) 92vw, 600px" alt="רכב אדום עם קישוט חתונה על הידיות – ונוס קיסריה"]</div>
<div><h2 class="${P}-h2">איך זה עובד</h2><p class="${P}-p">ארבעה צעדים פשוטים, מההזמנה ועד שהרכב יוצא לדרך.</p>
<div class="${P}-rows">${steps.map(([n, t, p]) => `<div class="${P}-row"><em>${n}</em><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div>
<p class="${P}-p" style="font-size:16px">רוצים שנקשט אצלכם, ליד הבית או במקום הצילומים? כתבו לנו ונבדוק אפשרות בתיאום מראש.</p></div>
</section>`;

const factors = [
  ['צבע הרכב', 'על רכב כהה, טול וגיבסנית לבנים בולטים מאוד. על רכב לבן כדאי לשלב ירק או גוון נוסף.'],
  ['גודל הרכב', 'ברכב גדול קישוט מלא נראה מאוזן. ברכב קטן, לפעמים 4 ידיות מספיקות.'],
  ['סגנון החתונה', 'זר כפרי? גם הרכב יכול להרגיש כך. זר קלאסי ולבן? הקישוט הסטנדרטי ישתלב בלי מאמץ.'],
  ['של מי הרכב', 'אם הרכב שכור או של חבר, כדאי לקבל אישור מהבעלים לפני שמזמינים.'],
];
const checks = ['המראות פנויות ורואים בהן טוב', 'השמשה הקדמית לא מוסתרת', 'הפנסים ולוחית הרישוי גלויים', 'הקישוט יציב ולא זז כשסוגרים דלת', 'חונים בצל בהפסקות – פרחים טריים רגישים לשמש'];
const tips = `<section class="${P}-split ${P}-sec" aria-label="איך בוחרים קישוט" style="align-items:start">
<div><h2 class="${P}-h2">עיצוב שמתאים לרכב</h2><p class="${P}-p">אין עיצוב אחד שמתאים לכל רכב. אלה הדברים שהכי משפיעים על המראה:</p>
<div class="${P}-rows">${factors.map(([t, p]) => `<div class="${P}-row"><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
<div><h2 class="${P}-h2">לפני שיוצאים לדרך</h2><p class="${P}-p">בדיקה של דקה, לפני הנסיעה לצילומים:</p>
<ul class="${P}-bul">${checks.map((c) => `<li>${c}</li>`).join('')}</ul>
<a class="${P}-more" href="${ART_CAR}">המדריך המלא לקישוט רכב לחתונה</a></div>
</section>`;

const bqs = [[1786, 1784, 'זר כלה ורדים'], [1783, 1780, 'זר כלה קאלות'], [2161, 2160, 'זר כלה טוליפים'], [1343, 1340, 'זר כלה אקליפטוס']];
const prod = (id) => ({ 1786: '/product/%d7%96%d7%a8-%d7%9b%d7%9c%d7%94-%d7%95%d7%a8%d7%93%d7%99%d7%9d/', 1783: '/product/%d7%96%d7%a8-%d7%9b%d7%9c%d7%94-%d7%a7%d7%90%d7%9c%d7%95%d7%aa/', 2161: '/product/%d7%96%d7%a8-%d7%9b%d7%9c%d7%94-%d7%98%d7%95%d7%9c%d7%99%d7%a4%d7%99%d7%9d/', 1343: '/product/%d7%96%d7%a8-%d7%9b%d7%9c%d7%94-%d7%90%d7%a7%d7%9c%d7%99%d7%a4%d7%98%d7%95%d7%a1/' })[id];
const bouquets = `<section class="${P}-sec" aria-label="זר כלה תואם">
<div class="${P}-gal-h"><div><h2 class="${P}-h2">זר כלה בגוונים תואמים</h2><p class="${P}-p">כשהרכב, הזר והחופה באותם גוונים – התמונות נראות מתוכננות. אפשר להזמין הכול יחד.</p></div><a class="${P}-btn ${P}-btn-line" href="${WEDDINGS}">לכל מוצרי החתונה</a></div>
<div class="${P}-bqs">${bqs.map(([id, img, t]) => `<article class="${P}-bq"><a href="${prod(id)}" aria-label="${t}">[vns_img id="${img}" size="medium_large" sizes="(max-width:1024px) 46vw, 300px" alt="${t} – ונוס קיסריה"]</a><div class="${P}-bq-b"><h3><a href="${prod(id)}">${t}</a></h3><div class="${P}-buy">[add_to_cart id="${id}" show_price="true" style=""]</div></div></article>`).join('')}</div>
</section>`;

const quoteSide = `<div class="${P}-sticky"><h2 class="${P}-h2">רוצים עיצוב אישי?</h2><p class="${P}-p">גוונים מיוחדים, פרחים אחרים או התאמה לזר הכלה – השאירו פרטים ונחזור אליכם. אפשר לשלוח לנו בוואטסאפ גם תמונה של הרכב ושל הזר.</p>
<div class="${P}-rows">
<div class="${P}-row"><em>${icon('chat-dots')}</em><div><h3><a href="${WA}" target="_blank" rel="noopener" style="color:inherit">וואטסאפ 053-279-1444</a></h3><p>הדרך הכי מהירה לתאם.</p></div></div>
<div class="${P}-row"><em>${icon('phone')}</em><div><h3><a href="tel:+972532791444" style="color:inherit">053-279-1444</a></h3><p>בשעות הפעילות של החנות.</p></div></div>
<div class="${P}-row"><em>${icon('location-pin')}</em><div><h3>הרקיע 1, מתחם C Center, קיסריה</h3><p>כאן מקשטים את הרכב, בשעה שתיאמנו.</p></div></div>
</div></div>`;

const faqs = [
  ['כמה זמן מראש צריך להזמין קישוט רכב?', 'לפחות 24 שעות מראש. בעונת החתונות, ובמיוחד לפני חמישי ושישי, מומלץ לסגור מוקדם יותר.'],
  ['איפה מקשטים את הרכב?', 'בדרך כלל אצלנו, בחנות במתחם C Center בקיסריה, בשעה שתיאמנו מראש. אם צריך לקשט במקום אחר, כתבו לנו ונבדוק.'],
  ['מה ההבדל בין הקישוט המלא לקישוט 4 ידיות?', 'בקישוט 4 ידיות יש סידורי גיבסנית וטול על הידיות בלבד. הקישוט המלא מוסיף את שתי המראות, פס טול לאורך הרכב וסידורי גיבסנית מקדימה ומאחורה.'],
  ['אפשר להתאים את הגוונים לזר הכלה?', 'כן. אפשר לשנות את העיצוב בתיאום מראש – ספרו לנו מה הגוונים של הזר והחופה, וכדאי לשלוח תמונה.'],
  ['איזה קישוט מתאים לרכב לבן?', 'על רכב לבן קישוט לבן נראה עדין יותר. מי שרוצה שהקישוט יבלוט יכול לבחור שילוב של ירק או גוון נוסף שמתאים לזר.'],
  ['ביום שישי אפשר?', 'כן, אבל ביום שישי החנות פתוחה עד 14:30 ובשבת היא סגורה, אז חשוב לתאם את השעה מראש.'],
];
const faq = `<section class="${P}-split ${P}-sec ${P}-faq" aria-label="שאלות נפוצות">
<div class="${P}-sticky"><h2 class="${P}-h2">שאלות נפוצות</h2><p class="${P}-p">לא מצאתם תשובה? כתבו לנו ונשמח לעזור.</p><a class="${P}-more" href="${ART_BOUQUET}">המדריך לבחירת זר כלה</a></div>
<div class="${P}-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

const cta = `<section class="${P}-sec ${P}-cta" aria-label="להזמנה">
<h2 class="${P}-h2">מתחתנים בקרוב?</h2>
<p class="${P}-p">בחרו קישוט, תאמו איתנו שעה – והרכב יחכה לכם מוכן ליום הגדול.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-cream" href="#packages">לבחירת קישוט</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">וואטסאפ</a></div>
</section>`;

let n = 0;
const nid = (p) => 'vcr' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra2 = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra2 }, elements: children });
const form = {
  id: 'vcrform', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'עיצוב אישי - קישוט רכב לחתונה',
    form_fields: [
      { _id: 'vcrf1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: 'vcrf2', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: 'vcrf3', custom_id: 'event_date', field_type: 'date', field_label: 'תאריך החתונה', width: '50' },
      { _id: 'vcrf4', custom_id: 'car', field_type: 'text', field_label: 'סוג הרכב וצבע', placeholder: 'לדוגמה: רכב שחור, גודל בינוני', width: '50' },
      { _id: 'vcrf5', custom_id: 'package', field_type: 'select', field_label: 'איזה קישוט?', field_options: 'קישוט מלא\nקישוט 4 ידיות\nעיצוב מיוחד\nעוד לא בטוחים', width: '100' },
      { _id: 'vcrf6', custom_id: 'message', field_type: 'textarea', field_label: 'ספרו לנו עוד', placeholder: 'גוונים, שעה, מקום – כל מה שיעזור לנו', rows: '4', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחת פרטים', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'קישוט רכב לחתונה – [field id="package"] – [field id="event_date"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    success_message: 'תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה', invalid_message: 'הערך לא תקין', custom_messages: 'yes',
    _css_classes: P + '-form',
  },
};

const elements = [{
  id: 'vcrroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: P, custom_css: serviceCss(P) + extra },
  elements: [
    sc(hero), sc(packages), sc(how), sc(tips), sc(bouquets),
    box(`${P}-split ${P}-sec ${P}-quote`, [
      box('', [sc(quoteSide)], { flex_direction: 'column' }),
      box(`${P}-formcard`, [sc(`<span id="quote"></span><h2 class="${P}-h2">עיצוב אישי לרכב</h2><p class="${P}-p">כמה פרטים קצרים, ונחזור אליכם בהקדם.</p>`), form, sc(`<p class="${P}-note">הפרטים נשלחים ישירות לצוות ונוס קיסריה.</p>`)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc('[vns_pa_reviews]'), sc(faq), sc(cta),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/service-car-page.json'), JSON.stringify(elements));
console.log('ok car', JSON.stringify(elements).length);
