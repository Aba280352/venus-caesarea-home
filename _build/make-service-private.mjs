// Generates wp/service-private-page.json - "עיצוב אירוע פרטי ועיצובי חופה" service page (same layout system as the stage page:
// serviceCss from make-service-stage.mjs, 50/50 compositions, no tag pills, no client names, library icons, quote form, no prices).
//   node _build/make-service-private.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serviceCss } from './make-service-stage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const icon = (n) => fs.readFileSync(path.join(ROOT, 'assets/icons', n + '.svg'), 'utf8').replace(/ xmlns="[^"]*"/, '').replace(/ width="24" height="24"/, '').trim();
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לשמוע על עיצוב פרחים לחופה / לאירוע 🌸');
const ART_CHUPPAH = '/2026/09/30/sidur-prachim-lachupa/';
const ART_COST = '/2026/10/07/wedding-flower-design-cost/';
const ART_CAR = '/2026/11/08/wedding-car-decoration/';
const WEDDINGS = '/product-category/%d7%97%d7%aa%d7%95%d7%a0%d7%95%d7%aa/';
const HUGS = '/product/%d7%97%d7%91%d7%a7%d7%99%d7%9d-%d7%9c%d7%97%d7%95%d7%a4%d7%94/';
const P = 'vsv';

const extra = `
selector .${P}-bul{margin:22px 0 0;padding:0;list-style:none}
selector .${P}-bul li{position:relative;padding:10px 26px 10px 0;border-bottom:1px solid rgba(20,20,20,.1);font-size:17px;line-height:1.5;color:rgba(20,20,20,.85)}
selector .${P}-bul li::before{content:"";position:absolute;right:4px;top:19px;width:8px;height:8px;border-radius:50%;background:${G}}
selector .${P}-links{display:flex;flex-wrap:wrap;gap:6px 26px;margin-top:22px}
selector .${P}-link{display:inline-block;font-size:17px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px}
selector .${P}-img.land img{aspect-ratio:4/3}
selector .${P}-img.port img{aspect-ratio:4/5}
@media(max-width:1024px){selector .${P}-detail .${P}-img{order:-1}}
@media(max-width:767px){selector .${P}-bul li{font-size:16px}selector .${P}-ggrid figure.mw2{grid-column:span 2}}`;

const hero = `<section class="${P}-split ${P}-hero" aria-label="עיצוב אירוע פרטי ועיצובי חופה">
<div>
<nav class="${P}-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>שירותים</span><i aria-hidden="true">›</i><span>עיצוב אירוע פרטי וחופה</span></nav>
<h1 class="${P}-title">עיצוב אירוע פרטי <b>ועיצובי חופה</b></h1>
<p class="${P}-p">חופה, זר כלה, שולחנות ופינות מיוחדות – עיצוב פרחים אחד שמחבר את כל האירוע. אנחנו מלווים חתונות, בר ובת מצווה, בריתות ואירועים משפחתיים, מהפגישה הראשונה ועד שהאורחים מתיישבים.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-green" href="#quote">לקבלת הצעת מחיר</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">${icon('chat-dots')}דברו איתנו בוואטסאפ</a></div>
<div class="${P}-trust"><span>${icon('leaf')}פרחים טריים בעיצוב אישי</span><span>${icon('location-pin')}קיסריה, השרון והכרמל</span></div>
</div>
<div class="${P}-img">[vns_img id="1462" size="full" eager="1" sizes="(max-width:1024px) 92vw, 600px" alt="חופה לבנה עם חבקי פרחים בגן אירועים – ונוס קיסריה"]</div>
</section>`;

const items = [
  ['01', 'חופה ורחבת טקס', 'חבקי פרחים, עיטור מלא למסגרת, בד וירק – ולפעמים גם שביל או שורת כיסאות מעוטרת.'],
  ['02', 'שולחנות האורחים', 'מרכזי שולחן גבוהים ונמוכים, ושולחן ראשי או שולחן אבירים שמקבל תשומת לב מיוחדת.'],
  ['03', 'זר כלה ופרחי החתונה', 'זר כלה בהתאמה אישית, זר ראש, סיכת דש לחתן וזרים קטנים לשושבינות.'],
  ['04', 'פינות מיוחדות', 'קבלת פנים, בר, שלט כניסה, רקע לצילומים וקישוט לרכב – באותה שפה עיצובית.'],
];
const what = `<section class="${P}-split ${P}-sec" aria-label="מה אנחנו מעצבים">
<div><h2 class="${P}-h2">מה אנחנו מעצבים</h2><p class="${P}-p">אפשר להזמין רק חופה וזר כלה, ואפשר עיצוב מלא לכל האירוע. בכל מקרה מתחילים מהסגנון שלכם: קלאסי ולבן, טבעי עם הרבה ירק, רומנטי בוורוד או צבעוני ועונתי.</p><p class="${P}-p">כשכל הפרחים מגיעים מאותה יד, החופה, הזר והשולחנות נראים כמו סיפור אחד – גם באירוע וגם בתמונות.</p></div>
<div class="${P}-list">${items.map(([n, t, p]) => `<div class="${P}-item"><em>${n}</em><h3>${t}</h3><p>${p}</p></div>`).join('')}</div>
</section>`;

const detail = (img, cls, title, text, bullets, links, flip) => `<section class="${P}-split ${P}-sec ${P}-detail" aria-label="${title}">
${flip ? '' : `<div class="${P}-img ${cls}">${img}</div>`}
<div><h2 class="${P}-h2">${title}</h2><p class="${P}-p">${text}</p><ul class="${P}-bul">${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>${links ? `<div class="${P}-links">${links}</div>` : ''}</div>
${flip ? `<div class="${P}-img ${cls}">${img}</div>` : ''}
</section>`;

const d1 = detail(`[vns_img id="1346" size="full" sizes="(max-width:1024px) 92vw, 600px" alt="חבק פרחים ורוד ואפרסק עם אקליפטוס על עמוד חופה – ונוס קיסריה"]`, 'port',
  'עיצוב חופה',
  'החופה היא הרגע שבו כל המצלמות מופנות פנימה, ולכן היא מקבלת את עיקר תשומת הלב. אנחנו בונים אותה לפי המקום – גן, אולם או חוף – ולפי האווירה שאתם רוצים.',
  ['חבקי פרחים לעמודי החופה, עם בד וירק טבעי', 'עיטור מלא למסגרת או פרחים תלויים מלמעלה', 'שביל כניסה ושורת כיסאות מעוטרת', 'התאמה לזר הכלה ולשאר העיצוב באירוע'],
  `<a class="${P}-link" href="${HUGS}">חבקים לחופה בחנות</a><a class="${P}-link" href="${ART_CHUPPAH}">רעיונות לסידור פרחים לחופה</a>`, false);
const d2 = detail(`[vns_img id="1341" size="full" sizes="(max-width:1024px) 92vw, 600px" alt="כלה וחתן עם זר כלה לבן – ונוס קיסריה"]`, 'land',
  'זר כלה ופרחי החתונה',
  'זר הכלה הוא הפרח שמחזיקים ביד לאורך כל הערב. אנחנו מעצבים אותו לפי השמלה, הסגנון והצבעים של החתונה, יחד עם כל הפרטים הקטנים שמסביב.',
  ['זר כלה בהתאמה אישית, או בחירה מהזרים המוכנים באתר', 'זר ראש עדין וסיכת דש לחתן', 'זרים קטנים לשושבינות ולבני המשפחה', 'קישוט רכב לחתונה שמתאים לזר ולחופה'],
  `<a class="${P}-link" href="${WEDDINGS}">זרי כלה בחנות</a><a class="${P}-link" href="${ART_CAR}">על קישוט רכב לחתונה</a>`, true);
const d3 = detail(`[vns_img id="1884" size="large" sizes="(max-width:1024px) 92vw, 600px" alt="שורת זרים ורודים על שולחן אירוע – ונוס קיסריה"]`, 'land',
  'אירועים פרטיים ומשפחתיים',
  'בר ובת מצווה, ברית, אירוסין, יום הולדת עגול או ארוחה חגיגית בחצר – גם לאירוע קטן מגיע עיצוב מושקע. מתאימים את היקף הפרחים לגודל המקום ולתקציב.',
  ['מרכזי שולחן ושולחן ראשי', 'פינת קבלת פנים ופינת צילום לאורחים', 'עיצוב במה להדלקת נרות ולנאומים', 'אירועים בבית, בגן או במסעדה'],
  '', false);

const gal = [
  [1344, 'h2', '', 'חבק פרחים על עמוד חופה'],
  [1341, 'w2', '', 'כלה וחתן עם זר כלה לבן'],
  [1324, 'h2', '', 'זר כלה של חבצלות לבנות'],
  [1463, '', '', 'זוג צועד אל החופה בגן אירועים'],
  [1784, '', '', 'זר כלה של ורדים לבנים'],
  [1780, '', '', 'זר כלה של קאלות לבנות'],
  [2160, '', '', 'זר כלה של טוליפים לבנים'],
  [1345, 'h2', 'mw2', 'חבק פרחים ורוד עם אקליפטוס לחופה'],
];
const gallery = `<section class="${P}-sec" aria-label="מהחתונות שלנו">
<div class="${P}-gal-h"><div><h2 class="${P}-h2">מהחתונות שלנו</h2><p class="${P}-p">חופות וזרי כלה שעיצבנו – פרחים אמיתיים, באירועים אמיתיים.</p></div><a class="${P}-btn ${P}-btn-line" href="#quote">רוצים כזה גם אצלכם?</a></div>
<div class="${P}-ggrid">${gal.map(([id, cls, mcls, alt]) => { const c = [cls, mcls].filter(Boolean).join(' '); return `<figure${c ? ` class="${c}"` : ''}>[vns_img id="${id}" size="large" sizes="(max-width:767px) 46vw, 310px" alt="${alt} – ונוס קיסריה"]</figure>`; }).join('')}</div>
</section>`;

const steps = [
  ['1', 'מספרים לנו על האירוע', 'תאריך, מקום, מספר אורחים וסגנון. תמונות השראה עוזרות מאוד, גם אם הן לא מדויקות.'],
  ['2', 'מקבלים הצעה מפורטת', 'כל רכיב מופיע בנפרד – חופה, שולחנות, זר ופינות – כדי שתדעו בדיוק על מה אתם משלמים.'],
  ['3', 'בוחרים פרחים לפי העונה', 'מתאימים פרחים שיהיו במיטבם בתאריך שלכם, ושומרים על הצבעים שבחרתם.'],
  ['4', 'מקימים ביום האירוע', 'הפרחים מגיעים טריים, והצוות שלנו מקים את העיצוב במקום לפני שהאורחים מגיעים.'],
];
const factors = [
  ['כמה דברים מעצבים', 'חופה וזר כלה בלבד, או גם שולחנות, בר ופינות מיוחדות.'],
  ['גודל וצפיפות', 'חופה מלאה ופרחים תלויים דורשים הרבה יותר פרחים מחבקים עדינים.'],
  ['מספר השולחנות', 'מרכז שולחן אחד לא יקר, אבל בעשרות שולחנות הסכום מצטבר.'],
  ['עונה וסוג הפרחים', 'פרחים עונתיים משתלמים יותר מפרחים מיובאים או מחוץ לעונה.'],
];
const process = `<section class="${P}-split ${P}-sec" aria-label="איך זה עובד" style="align-items:start">
<div><h2 class="${P}-h2">איך זה עובד</h2><p class="${P}-p">לחתונה מומלץ לפנות כמה חודשים מראש, במיוחד בעונת החתונות. לאירוע משפחתי קטן מספיקים בדרך כלל שבועיים־שלושה.</p>
<div class="${P}-rows">${steps.map(([n, t, p]) => `<div class="${P}-row"><em>${n}</em><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
<div><h2 class="${P}-h2">מה משפיע על המחיר</h2><p class="${P}-p">כל אירוע מתומחר בנפרד. אלה הדברים שהכי משפיעים:</p>
<div class="${P}-rows">${factors.map(([t, p]) => `<div class="${P}-row"><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div>
<a class="${P}-more" href="${ART_COST}">כמה עולה עיצוב פרחים לחתונה – המדריך</a></div>
</section>`;

const quoteSide = `<div class="${P}-sticky"><h2 class="${P}-h2">בואו נעצב את האירוע שלכם</h2><p class="${P}-p">השאירו כמה פרטים, ונחזור אליכם עם רעיונות והצעת מחיר אישית. מעדיפים לדבר? אנחנו זמינים גם בוואטסאפ ובטלפון.</p>
<div class="${P}-rows">
<div class="${P}-row"><em>${icon('chat-dots')}</em><div><h3><a href="${WA}" target="_blank" rel="noopener" style="color:inherit">וואטסאפ 053-279-1444</a></h3><p>אפשר לשלוח לנו גם תמונות השראה.</p></div></div>
<div class="${P}-row"><em>${icon('phone')}</em><div><h3><a href="tel:+972532791444" style="color:inherit">053-279-1444</a></h3><p>בשעות הפעילות של החנות.</p></div></div>
<div class="${P}-row"><em>${icon('location-pin')}</em><div><h3>קיסריה, השרון והכרמל</h3><p>גני אירועים, אולמות, מסעדות ובתים פרטיים באזור.</p></div></div>
</div></div>`;

const faqs = [
  ['כמה זמן מראש כדאי לתכנן פרחים לחתונה?', 'מומלץ להתחיל כמה חודשים לפני החתונה, במיוחד בעונה עמוסה או אם אתם רוצים פרח עונתי מסוים. לאירוע משפחתי קטן מספיקים בדרך כלל שבועיים־שלושה.'],
  ['כמה עולה עיצוב חופה?', 'המחיר תלוי בגודל החופה, בצפיפות הפרחים ובסוג שלהם, ולכן כל אירוע מקבל הצעת מחיר אישית. השאירו פרטים ונחזור אליכם.'],
  ['זר הכלה חייב להתאים לחופה?', 'לא חובה, אבל רוב הזוגות בוחרים להתאים ביניהם, כדי שהעיצוב ייראה עקבי לאורך כל האירוע ובתמונות.'],
  ['פרחים טריים או מיובשים לחופה?', 'פרחים טריים נפוצים יותר בגלל המראה החי, אבל פרחים מיובשים יכולים להתאים לסגנון וינטג׳ או טבעי במיוחד. אפשר גם לשלב.'],
  ['אפשר להזמין רק זר כלה או רק חופה?', 'בטח. אפשר להזמין רכיב אחד, ואפשר עיצוב מלא לכל האירוע. יש גם זרי כלה מוכנים בחנות באתר.'],
  ['מה כדאי להביא לפגישת התכנון?', 'תמונות השראה, גם לא מושלמות, ומידע על המקום, מספר האורחים וטווח הצבעים שבחרתם. ככה נוכל לבנות הצעה מדויקת יותר.'],
  ['באילו אזורים אתם עובדים?', 'בקיסריה, בשרון ובכרמל – גני אירועים, אולמות, מסעדות ובתים פרטיים. לאירוע במקום אחר, כתבו לנו ונבדוק.'],
];
const faq = `<section class="${P}-split ${P}-sec ${P}-faq" aria-label="שאלות נפוצות">
<div class="${P}-sticky"><h2 class="${P}-h2">שאלות נפוצות</h2><p class="${P}-p">לא מצאתם תשובה? כתבו לנו ונשמח לעזור.</p><a class="${P}-more" href="${ART_CHUPPAH}">למדריך המלא על סידור פרחים לחופה</a></div>
<div class="${P}-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

const cta = `<section class="${P}-sec ${P}-cta" aria-label="להזמנה">
<h2 class="${P}-h2">מתחתנים או חוגגים בקרוב?</h2>
<p class="${P}-p">ספרו לנו על האירוע, ונבנה יחד עיצוב פרחים שמרגיש בדיוק כמוכם.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-cream" href="#quote">לקבלת הצעת מחיר</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">וואטסאפ</a></div>
</section>`;

let n = 0;
const nid = (p) => 'vch' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra2 = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra2 }, elements: children });
const form = {
  id: 'vchform', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'הצעת מחיר - אירוע פרטי וחופה',
    form_fields: [
      { _id: 'vchf1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: 'vchf2', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: 'vchf3', custom_id: 'event_type', field_type: 'select', field_label: 'סוג האירוע', field_options: 'חתונה\nחינה\nאירוסין\nבר / בת מצווה\nברית / בריתה\nיום הולדת\nאירוע משפחתי אחר', width: '50' },
      { _id: 'vchf4', custom_id: 'event_date', field_type: 'date', field_label: 'תאריך האירוע', width: '50' },
      { _id: 'vchf5', custom_id: 'venue', field_type: 'text', field_label: 'מקום / אולם', placeholder: 'לדוגמה: גן אירועים בקיסריה', width: '50' },
      { _id: 'vchf6', custom_id: 'guests', field_type: 'text', field_label: 'מספר אורחים משוער', placeholder: 'לדוגמה: 250', width: '50' },
      { _id: 'vchf7', custom_id: 'needs', field_type: 'select', field_label: 'מה צריך?', field_options: 'חופה וזר כלה\nעיצוב מלא לאירוע\nשולחנות ופינות\nזר כלה בלבד\nעוד לא בטוחים', width: '100' },
      { _id: 'vchf8', custom_id: 'message', field_type: 'textarea', field_label: 'ספרו לנו עוד', placeholder: 'סגנון, צבעים, השראה – כל מה שיעזור לנו', rows: '4', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחת בקשה להצעת מחיר', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'בקשת הצעת מחיר – [field id="event_type"] – [field id="event_date"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    success_message: 'תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם עם הצעה.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה', invalid_message: 'הערך לא תקין', custom_messages: 'yes',
    _css_classes: P + '-form',
  },
};

const elements = [{
  id: 'vchroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: P, custom_css: serviceCss(P) + extra },
  elements: [
    sc(hero), sc(what), sc(d1), sc(d2), sc(d3), sc(gallery), sc(process),
    box(`${P}-split ${P}-sec ${P}-quote`, [
      box('', [sc(quoteSide)], { flex_direction: 'column' }),
      box(`${P}-formcard`, [sc(`<span id="quote"></span><h2 class="${P}-h2">בקשה להצעת מחיר</h2><p class="${P}-p">כמה פרטים קצרים, ונחזור אליכם בהקדם.</p>`), form, sc(`<p class="${P}-note">הפרטים נשלחים ישירות לצוות ונוס קיסריה.</p>`)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc('[vns_pa_reviews]'), sc(faq), sc(cta),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/service-private-page.json'), JSON.stringify(elements));
console.log('ok private', JSON.stringify(elements).length);
