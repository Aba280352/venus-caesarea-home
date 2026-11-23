// Generates wp/service-bouquet-page.json - "זרי כלה" service page (same layout system as the other service pages:
// serviceCss from make-service-stage.mjs, 50/50, no tag pills, library icons). All 9 bridal bouquets sold straight from the page
// (WooCommerce [add_to_cart] = live price + ajax add to cart), lead time per product (from product descriptions), custom bouquet form.
//   node _build/make-service-bouquet.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serviceCss } from './make-service-stage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const icon = (n) => fs.readFileSync(path.join(ROOT, 'assets/icons', n + '.svg'), 'utf8').replace(/ xmlns="[^"]*"/, '').replace(/ width="24" height="24"/, '').trim();
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לשמוע על זר כלה 🌸');
const ART_BOUQUET = '/2026/08/11/bridal-bouquet/';
const WEDDINGS = '/product-category/%d7%97%d7%aa%d7%95%d7%a0%d7%95%d7%aa/';
const CAR = '/%d7%a7%d7%99%d7%a9%d7%95%d7%98-%d7%a8%d7%9b%d7%91-%d7%9c%d7%97%d7%aa%d7%95%d7%a0%d7%94/';
const CHUPPAH = '/%d7%a2%d7%99%d7%a6%d7%95%d7%91-%d7%90%d7%99%d7%a8%d7%95%d7%a2-%d7%a4%d7%a8%d7%98%d7%99-%d7%95%d7%97%d7%95%d7%a4%d7%94/';
const P = 'vsv';
const pu = (slug) => '/product/' + encodeURIComponent(slug).toLowerCase() + '/';

// [id, image, name, slug, lead time (from the product page)]
const bouquets = [
  [821, 818, 'זר כלה כפרי', 'זר-כלה-כפרי', '24 שעות מראש'],
  [820, 815, 'זר כלה גלי ים', 'זר-כלה-גלי-ים', '24 שעות מראש'],
  [1343, 1340, 'זר כלה אקליפטוס', 'זר-כלה-אקליפטוס', '24 שעות מראש'],
  [2161, 2160, 'זר כלה טוליפים', 'זר-כלה-טוליפים', '10 ימי עסקים מראש'],
  [1786, 1784, 'זר כלה ורדים', 'זר-כלה-ורדים', 'בתיאום מראש'],
  [1783, 1780, 'זר כלה קאלות', 'זר-כלה-קאלות', 'שבועיים מראש'],
  [1256, 1324, 'זר כלה לבן מפואר', 'זר-כלה-לבן-מפואר', 'שבוע מראש'],
  [2163, 2162, 'זר כלה על זמני', 'זר-כלה-על-זמני', '10 ימי עסקים מראש'],
  [2159, 2158, 'זר כלה הכי לא לבן', 'זר-כלה-הכי-לא-לבן', '10 ימי עסקים מראש'],
];

const extra = `
selector .${P}-bul{margin:22px 0 0;padding:0;list-style:none}
selector .${P}-bul li{position:relative;padding:10px 26px 10px 0;border-bottom:1px solid rgba(20,20,20,.1);font-size:17px;line-height:1.5;color:rgba(20,20,20,.85)}
selector .${P}-bul li::before{content:"";position:absolute;right:4px;top:19px;width:8px;height:8px;border-radius:50%;background:${G}}
selector .${P}-img.port img{aspect-ratio:4/5}
selector .${P}-pk-h{max-width:720px}
selector .${P}-pk-note{margin:24px 0 0;font-size:17px;color:rgba(20,20,20,.75)}
selector .${P}-pk-note a{color:${G};font-weight:500;text-decoration:underline;text-underline-offset:3px}
/* product cards */
selector .${P}-bqs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:36px}
selector .${P}-bq{display:flex;flex-direction:column;border:1px solid ${LINE};border-radius:16px;background:#fff;overflow:hidden}
selector .${P}-bq>a{display:block}
selector .${P}-bq img{display:block;width:100%;aspect-ratio:4/5;height:auto;object-fit:cover}
selector .${P}-bq-b{display:flex;flex:1;flex-direction:column;padding:18px 20px 20px}
selector .${P}-bq h3{margin:0;font-size:20px;font-weight:500;line-height:1.3}
selector .${P}-bq h3 a{color:#141414}
selector .${P}-bq h3 a:hover{color:${G}}
selector .${P}-bq-b>p{margin:6px 0 0;font-size:15px;line-height:1.55;color:rgba(20,20,20,.7)}
selector .${P}-lead{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:14px;color:rgba(20,20,20,.62)}
selector .${P}-lead svg{width:16px;height:16px;flex:none;color:${G}}
selector .${P}-buy{margin-top:auto;padding-top:16px}
selector .${P}-buy .add_to_cart_inline{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:0!important;padding:0!important;border:0!important}
selector .${P}-buy .amount{font-family:${H};font-size:24px;font-weight:700;color:#141414}
selector .${P}-buy ins{text-decoration:none}
selector .${P}-buy del,selector .${P}-buy del .amount{font-family:inherit;font-size:16px;font-weight:300;color:rgba(20,20,20,.5)}
selector .${P}-buy .add_to_cart_button{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;height:46px;margin-inline-start:auto!important;padding:0 20px!important;border:0!important;border-radius:12px!important;background:${G}!important;color:#fff!important;font-family:inherit!important;font-size:16px!important;font-weight:500!important;line-height:1!important;transition:background .15s}
selector .${P}-buy .add_to_cart_button:hover{background:#2C3624!important}
selector .${P}-buy .add_to_cart_button.loading{opacity:.6}
selector .${P}-buy .button:not(.add_to_cart_button){box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;height:46px;margin-inline-start:auto!important;padding:0 20px!important;border:1px solid #141414!important;border-radius:12px!important;background:transparent!important;color:#141414!important;font-family:inherit!important;font-size:16px!important;font-weight:500!important;line-height:1!important}
selector .${P}-buy .button:not(.add_to_cart_button):hover{background:${G}!important;border-color:${G}!important;color:#fff!important}
selector .${P}-buy .added_to_cart{flex-basis:100%;font-size:15px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px;text-align:left}
selector .${P}-bq .${P}-btn{margin-top:auto;height:46px;font-size:16px}
selector .${P}-bq .${P}-btn-line{margin-top:18px}
@media(max-width:1024px){selector .${P}-bqs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){selector .${P}-bul li{font-size:16px}selector .${P}-bqs{gap:10px}selector .${P}-bq-b{padding:12px}selector .${P}-bq h3{font-size:16px}selector .${P}-bq-b>p{font-size:14px}selector .${P}-lead{font-size:13px}selector .${P}-buy .amount{font-size:20px}selector .${P}-buy .add_to_cart_button,selector .${P}-buy .button,selector .${P}-bq .${P}-btn{width:100%;height:42px;margin-inline-start:0!important;padding:0 10px!important;font-size:15px!important}}`;

const hero = `<section class="${P}-split ${P}-hero" aria-label="זרי כלה">
<div>
<nav class="${P}-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>שירותים</span><i aria-hidden="true">›</i><span>זרי כלה</span></nav>
<h1 class="${P}-title">זרי <b>כלה</b></h1>
<p class="${P}-p">זר הכלה מלווה את היום מהצילומים הראשונים ועד החופה. אפשר לבחור מתוך הזרים המוכנים שלנו ולהזמין ישירות באתר, ואפשר לעצב יחד זר אישי – לפי השמלה, הסגנון והצבעים של החתונה.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-green" href="#bouquets">לבחירת זר</a><a class="${P}-btn ${P}-btn-line" href="#quote">לזר בעיצוב אישי</a></div>
<div class="${P}-trust"><span>${icon('leaf')}פרחים טריים, שזורים ביד</span><span>${icon('truck')}איסוף מקיסריה או משלוח</span></div>
</div>
<div class="${P}-img">[vns_img id="1340" size="full" eager="1" sizes="(max-width:1024px) 92vw, 600px" alt="כלה מחזיקה זר כלה של ורדים לבנים ואקליפטוס – ונוס קיסריה"]</div>
</section>`;

const grid = `<section class="${P}-sec" id="bouquets" aria-label="זרי הכלה שלנו">
<div class="${P}-pk-h"><h2 class="${P}-h2">זרי הכלה שלנו</h2><p class="${P}-p">תשעה זרים, מכפרי וצבעוני ועד לבן ויוקרתי. ליד כל זר מופיע כמה זמן מראש צריך להזמין אותו.</p></div>
<div class="${P}-bqs">${bouquets.map(([id, img, t, slug, lead]) => `<article class="${P}-bq"><a href="${pu(slug)}" aria-label="${t}">[vns_img id="${img}" size="medium_large" sizes="(max-width:1024px) 46vw, 400px" alt="${t} – ונוס קיסריה"]</a><div class="${P}-bq-b"><h3><a href="${pu(slug)}">${t}</a></h3><div class="${P}-lead">${icon('clock')}הזמנה ${lead}</div><div class="${P}-buy">[add_to_cart id="${id}" show_price="true" style=""]</div></div></article>`).join('')}</div>
<p class="${P}-pk-note">ברוב הזרים אפשר לשנות צבעים, פרחים או גודל בתיאום מראש. מחפשים משהו אחר לגמרי? <a href="#quote">נעצב לכם זר אישי</a></p>
</section>`;

const steps = [
  ['1', 'שולחים לנו השראה', 'תמונה של השמלה, שתיים־שלוש תמונות של זרים שאהבתם וצבעי האירוע – בטופס או בוואטסאפ.'],
  ['2', 'בוחרים פרחים לפי העונה', 'מתאימים פרחים שייראו הכי טוב בתאריך שלכם, ושומרים על הסגנון והצבעים שבחרתם.'],
  ['3', 'מתאימים גודל ונוחות', 'זר מחזיקים ביד שעות – לכן מקפידים שיהיה פרופורציונלי לשמלה ונוח לאחיזה.'],
  ['4', 'מקבלים ביום החתונה', 'אוספים מהחנות בקיסריה או מקבלים במשלוח, בשעה שתיאמנו מראש.'],
];
const custom = `<section class="${P}-split ${P}-sec" aria-label="זר בעיצוב אישי">
<div class="${P}-img port">[vns_img id="1782" size="large" sizes="(max-width:1024px) 92vw, 600px" alt="זר כלה של קאלות לבנות בעיצוב אישי – ונוס קיסריה"]</div>
<div><h2 class="${P}-h2">זר בעיצוב אישי</h2><p class="${P}-p">לא חייבים לבחור מהקטלוג. מספרים לנו על השמלה ועל החתונה, ואנחנו שוזרים זר שמרגיש בדיוק כמו שדמיינתם.</p>
<div class="${P}-rows">${steps.map(([n, t, p]) => `<div class="${P}-row"><em>${n}</em><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
</section>`;

const factors = [
  ['סגנון החתונה', 'קלאסי, רומנטי, כפרי או צבעוני – הזר צריך לדבר באותה שפה כמו שאר האירוע.'],
  ['השמלה', 'שמלה עשירה בפרטים? זר נקי ייתן לה מקום. שמלה חלקה? אפשר זר עם יותר נפח וצבע.'],
  ['צבעים', 'לבן יוצר המשכיות עם השמלה, וצבע מוסיף אופי. גם נגיעה קטנה של תכלת או ורוד עושה הבדל.'],
  ['עונה', 'פרחים עונתיים נראים הכי טוב. כדאי להגיע עם סגנון וצבעים, ולא רק עם רשימת פרחים.'],
];
const bring = ['תמונה של השמלה', 'שתיים־שלוש תמונות השראה שאהבתם', 'צבעי האירוע או העיצוב המתוכנן', 'פרחים שחייבים להופיע – ופרחים שלא אוהבים', 'מתי ואיך תקבלו את הזר ביום החתונה'];
const tips = `<section class="${P}-split ${P}-sec" aria-label="איך בוחרים זר כלה" style="align-items:start">
<div><h2 class="${P}-h2">איך בוחרים זר כלה</h2><p class="${P}-p">במקום לשאול איזה זר הכי יפה, כדאי לשאול איזה זר מתאים לכם:</p>
<div class="${P}-rows">${factors.map(([t, p]) => `<div class="${P}-row"><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
<div><h2 class="${P}-h2">מה להביא כשמזמינים</h2><p class="${P}-p">ככל שיש יותר הקשר, קל יותר לדייק:</p>
<ul class="${P}-bul">${bring.map((c) => `<li>${c}</li>`).join('')}</ul>
<a class="${P}-more" href="${ART_BOUQUET}">המדריך המלא לבחירת זר כלה</a></div>
</section>`;

const more = `<section class="${P}-sec" aria-label="משלימים את הלוק">
<div class="${P}-gal-h"><div><h2 class="${P}-h2">משלימים את הלוק</h2><p class="${P}-p">כשהזר, הרכב והחופה באותם גוונים – כל התמונות מתחברות לסיפור אחד.</p></div><a class="${P}-btn ${P}-btn-line" href="${WEDDINGS}">לכל מוצרי החתונה</a></div>
<div class="${P}-bqs">
<article class="${P}-bq"><a href="${pu('צמיד-יד-ומפית-חליפה-פרחים')}" aria-label="צמיד יד וכיס חליפה">[vns_img id="1475" size="medium_large" sizes="(max-width:1024px) 46vw, 400px" alt="צמיד יד וכיס חליפה מפרחים – ונוס קיסריה"]</a><div class="${P}-bq-b"><h3><a href="${pu('צמיד-יד-ומפית-חליפה-פרחים')}">צמיד יד וכיס חליפה</a></h3><p>פרחים טבעיים לשושבינות ולחליפת החתן, בגוונים של הזר.</p><div class="${P}-lead">${icon('clock')}הזמנה 24 שעות מראש</div><div class="${P}-buy">[add_to_cart id="1476" show_price="true" style=""]</div></div></article>
<article class="${P}-bq"><a href="${CAR}" aria-label="קישוט רכב לחתונה">[vns_img id="2470" size="medium_large" sizes="(max-width:1024px) 46vw, 400px" alt="קישוט רכב לחתונה – ונוס קיסריה"]</a><div class="${P}-bq-b"><h3><a href="${CAR}">קישוט רכב לחתונה</a></h3><p>טול וגיבסנית על הידיות, המראות וחזית הרכב – קישוט מלא או 4 ידיות.</p><a class="${P}-btn ${P}-btn-line" href="${CAR}">לקישוט הרכב</a></div></article>
<article class="${P}-bq"><a href="${CHUPPAH}" aria-label="עיצוב חופה ואירוע">[vns_img id="1346" size="medium_large" sizes="(max-width:1024px) 46vw, 400px" alt="חבק פרחים לחופה – ונוס קיסריה"]</a><div class="${P}-bq-b"><h3><a href="${CHUPPAH}">עיצוב חופה ואירוע</a></h3><p>חבקים לחופה, שולחנות ופינות מיוחדות – באותה שפה כמו הזר.</p><a class="${P}-btn ${P}-btn-line" href="${CHUPPAH}">לעיצוב החופה</a></div></article>
</div>
</section>`;

const quoteSide = `<div class="${P}-sticky"><h2 class="${P}-h2">בואו נעצב לכם זר</h2><p class="${P}-p">השאירו כמה פרטים, ונחזור אליכם עם רעיונות והצעת מחיר. אפשר לשלוח לנו בוואטסאפ גם תמונה של השמלה ותמונות השראה.</p>
<div class="${P}-rows">
<div class="${P}-row"><em>${icon('chat-dots')}</em><div><h3><a href="${WA}" target="_blank" rel="noopener" style="color:inherit">וואטסאפ 053-279-1444</a></h3><p>הכי נוח לשלוח תמונות.</p></div></div>
<div class="${P}-row"><em>${icon('phone')}</em><div><h3><a href="tel:+972532791444" style="color:inherit">053-279-1444</a></h3><p>בשעות הפעילות של החנות.</p></div></div>
<div class="${P}-row"><em>${icon('location-pin')}</em><div><h3>הרקיע 1, מתחם C Center, קיסריה</h3><p>לאיסוף הזר ביום החתונה, או לפגישה בתיאום.</p></div></div>
</div></div>`;

const faqs = [
  ['כמה זמן מראש צריך להזמין זר כלה?', 'זה תלוי בזר: חלק מהזרים המוכנים אפשר להזמין 24 שעות מראש, ואחרים דורשים שבוע עד שבועיים – זה מופיע ליד כל זר. לזר בעיצוב אישי מומלץ לפנות כמה שבועות לפני החתונה.'],
  ['איך מקבלים את הזר ביום החתונה?', 'אפשר לאסוף אותו מהחנות שלנו בקיסריה או לקבל במשלוח. בוחרים את האפשרות בקופה, ומתאמים איתנו את השעה.'],
  ['אפשר לשנות צבעים או פרחים בזר מהאתר?', 'ברוב הזרים כן, בתיאום מראש. ספרו לנו מה תרצו לשנות, ונבדוק מה אפשרי לפי העונה.'],
  ['זר לבן או צבעוני?', 'אין חובה. זר לבן יוצר המשכיות נקייה עם השמלה, וזר צבעוני הופך לחלק בולט מהלוק. אפשר גם להוסיף נגיעה עדינה של צבע.'],
  ['כמה גדול צריך להיות הזר?', 'כזה שמרגיש פרופורציונלי לשמלה ונוח להחזיק שעות. זר גדול מאוד יפה בתמונות, אבל כדאי לחשוב גם על המשקל והאחיזה.'],
  ['איך שומרים על הזר טרי עד החופה?', 'שומרים אותו במקום קריר ומוצל ולא משאירים ברכב חם. אם יש הפסקה ארוכה בין הצילומים לטקס, שאלו אותנו מה מומלץ לפרחים שבחרתם.'],
  ['אפשר להזמין גם פרחים לשושבינות ולחתן?', 'בטח. יש צמיד יד וכיס חליפה מפרחים טבעיים, ואפשר להתאים אותם לגוונים של הזר.'],
];
const faq = `<section class="${P}-split ${P}-sec ${P}-faq" aria-label="שאלות נפוצות">
<div class="${P}-sticky"><h2 class="${P}-h2">שאלות נפוצות</h2><p class="${P}-p">לא מצאתם תשובה? כתבו לנו ונשמח לעזור.</p><a class="${P}-more" href="${ART_BOUQUET}">המדריך המלא לבחירת זר כלה</a></div>
<div class="${P}-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

const cta = `<section class="${P}-sec ${P}-cta" aria-label="להזמנה">
<h2 class="${P}-h2">מתחתנים בקרוב?</h2>
<p class="${P}-p">בחרו זר מוכן או ספרו לנו על החלום שלכם – ונשזור זר שתרצו להחזיק כל הערב.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-cream" href="#bouquets">לבחירת זר</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">וואטסאפ</a></div>
</section>`;

let n = 0;
const nid = (p) => 'vbb' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra2 = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra2 }, elements: children });
const form = {
  id: 'vbbform', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'זר כלה בעיצוב אישי',
    form_fields: [
      { _id: 'vbbf1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: 'vbbf2', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: 'vbbf3', custom_id: 'event_date', field_type: 'date', field_label: 'תאריך החתונה', width: '50' },
      { _id: 'vbbf4', custom_id: 'style', field_type: 'select', field_label: 'איזה סגנון?', field_options: 'קלאסי ולבן\nרומנטי ופסטלי\nכפרי וטבעי\nצבעוני ונועז\nעוד לא בטוחים', width: '50' },
      { _id: 'vbbf5', custom_id: 'colors', field_type: 'text', field_label: 'צבעים ופרחים שאוהבים', placeholder: 'לדוגמה: לבן ושמנת, ורדים ואקליפטוס', width: '50' },
      { _id: 'vbbf6', custom_id: 'delivery', field_type: 'select', field_label: 'איך תקבלו את הזר?', field_options: 'איסוף מהחנות בקיסריה\nמשלוח\nעוד לא יודעים', width: '50' },
      { _id: 'vbbf7', custom_id: 'message', field_type: 'textarea', field_label: 'ספרו לנו עוד', placeholder: 'על השמלה, על החתונה – כל מה שיעזור לנו', rows: '4', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחת פרטים', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'זר כלה בעיצוב אישי – [field id="event_date"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    success_message: 'תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה', invalid_message: 'הערך לא תקין', custom_messages: 'yes',
    _css_classes: P + '-form',
  },
};

const elements = [{
  id: 'vbbroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: P, custom_css: serviceCss(P) + extra },
  elements: [
    sc(hero), sc(grid), sc(custom), sc(tips), sc(more),
    box(`${P}-split ${P}-sec ${P}-quote`, [
      box('', [sc(quoteSide)], { flex_direction: 'column' }),
      box(`${P}-formcard`, [sc(`<span id="quote"></span><h2 class="${P}-h2">זר בעיצוב אישי</h2><p class="${P}-p">כמה פרטים קצרים, ונחזור אליכם בהקדם.</p>`), form, sc(`<p class="${P}-note">הפרטים נשלחים ישירות לצוות ונוס קיסריה.</p>`)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc('[vns_pa_reviews]'), sc(faq), sc(cta),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/service-bouquet-page.json'), JSON.stringify(elements));
console.log('ok bouquet', JSON.stringify(elements).length);
