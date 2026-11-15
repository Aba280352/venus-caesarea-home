// Generates wp/service-business-page.json - "אירועים עסקיים" service page (same layout system as the stage page:
// serviceCss from make-service-stage.mjs, 50/50 compositions, no tag pills, no client names, library icons, business inquiry form).
//   node _build/make-service-business.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serviceCss } from './make-service-stage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const C = '#FFFBE9';
const icon = (n) => fs.readFileSync(path.join(ROOT, 'assets/icons', n + '.svg'), 'utf8').replace(/ xmlns="[^"]*"/, '').replace(/ width="24" height="24"/, '').trim();
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לשמוע על פרחים ומתנות לעסק שלנו 🌸');
const STAGE = '/%d7%a2%d7%99%d7%a6%d7%95%d7%91-%d7%91%d7%9e%d7%95%d7%aa-%d7%9c%d7%90%d7%99%d7%a8%d7%95%d7%a2%d7%99%d7%9d/';
const P = 'vsv';

const extra = `
selector .${P}-bul{margin:22px 0 0;padding:0;list-style:none}
selector .${P}-bul li{position:relative;padding:10px 26px 10px 0;border-bottom:1px solid rgba(20,20,20,.1);font-size:17px;line-height:1.5;color:rgba(20,20,20,.85)}
selector .${P}-bul li::before{content:"";position:absolute;right:4px;top:19px;width:8px;height:8px;border-radius:50%;background:${G}}
selector .${P}-link{display:inline-block;margin-top:22px;font-size:17px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px}
selector .${P}-img.land img{aspect-ratio:4/3}
selector .${P}-img.port img{aspect-ratio:4/5}
selector .${P}-band{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;padding:44px 24px;border-radius:16px;background:${G};color:${C}}
selector .${P}-band>div{padding:0 22px;border-inline-start:1px solid rgba(255,251,233,.22)}
selector .${P}-band>div:first-child{border-inline-start:0}
selector .${P}-band svg{display:block;width:30px;height:30px;color:${C}}
selector .${P}-band h3{margin:16px 0 0;font-family:${H};font-size:22px;font-weight:700;line-height:1.2;color:${C}}
selector .${P}-band p{margin:8px 0 0;font-size:16px;line-height:1.55;color:rgba(255,251,233,.82)}
@media(max-width:1024px){selector .${P}-band{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:32px}selector .${P}-band>div:nth-child(3){border-inline-start:0}selector .${P}-detail .${P}-img{order:-1}}
@media(max-width:767px){selector .${P}-band{grid-template-columns:minmax(0,1fr);padding:32px 22px}selector .${P}-band>div{padding:0;border:0}selector .${P}-bul li{font-size:16px}}`;

const hero = `<section class="${P}-split ${P}-hero" aria-label="פרחים לעסקים">
<div>
<nav class="${P}-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>שירותים</span><i aria-hidden="true">›</i><span>אירועים עסקיים</span></nav>
<h1 class="${P}-title">פרחים לעסקים <b>ולאירועי חברה</b></h1>
<p class="${P}-p">כנסים והשקות, פרחים קבועים למשרד וללובי, מתנות לעובדים וללקוחות וסידורים למסעדות ולמלונות. אתם מספרים לנו מה צריך – ואנחנו דואגים לכל השאר, בזמן ובסטנדרט קבוע.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-green" href="#quote">לפנייה עסקית</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">${icon('chat-dots')}דברו איתנו בוואטסאפ</a></div>
<div class="${P}-trust"><span>${icon('receipt-alt')}חשבונית מס על שם החברה</span><span>${icon('location-pin')}קיסריה, השרון והכרמל</span></div>
</div>
<div class="${P}-img">[vns_img id="1531" size="full" eager="1" sizes="(max-width:1024px) 92vw, 600px" alt="סידור פרחים לבן ללובי – ונוס קיסריה"]</div>
</section>`;

const svcs = [
  ['01', 'כנסים ואירועי חברה', 'במות, דוכני קבלה, שולחנות והשקות – עיצוב שמחמיא למותג ומתאים לאופי האירוע.'],
  ['02', 'פרחים קבועים למשרד', 'סידור טרי ללובי, לקבלה ולחדרי הישיבות, שמתחלף בתדירות קבועה.'],
  ['03', 'מתנות לעובדים וללקוחות', 'מארזים, עציצים וזרים לחגים, לימי הולדת ולאירועי הוקרה – בכמויות.'],
  ['04', 'מסעדות ומלונות', 'סידורים לשולחנות, לדלפק ולמבואה, בהתאמה לעיצוב המקום ולעונה.'],
];
const services = `<section class="${P}-split ${P}-sec" aria-label="מה אנחנו עושים לעסקים">
<div><h2 class="${P}-h2">מה אנחנו עושים לעסקים</h2><p class="${P}-p">ארבעה תחומים שאנחנו מלווים בהם עסקים באזור – מאירוע חד־פעמי ועד שירות קבוע לאורך כל השנה.</p><p class="${P}-p">כל הזמנה מקבלת התאמה אישית: גודל, צבעים, תקציב ותדירות.</p></div>
<div class="${P}-list">${svcs.map(([n, t, p]) => `<div class="${P}-item"><em>${n}</em><h3>${t}</h3><p>${p}</p></div>`).join('')}</div>
</section>`;

const detail = (img, cls, title, text, bullets, link, flip) => `<section class="${P}-split ${P}-sec ${P}-detail" aria-label="${title}">
${flip ? '' : `<div class="${P}-img ${cls}">${img}</div>`}
<div><h2 class="${P}-h2">${title}</h2><p class="${P}-p">${text}</p><ul class="${P}-bul">${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>${link || ''}</div>
${flip ? `<div class="${P}-img ${cls}">${img}</div>` : ''}
</section>`;

const d1 = detail(`[vns_img id="1845" size="full" sizes="(max-width:1024px) 92vw, 600px" alt="עיצוב פרחים לבמה באירוע חברה – ונוס קיסריה"]`, 'land',
  'כנסים, השקות ואירועי חברה',
  'באירוע עסקי הפרחים צריכים להיראות מושקעים בלי להסיח את הדעת מהתוכן. אנחנו בונים עיצוב מאופק ואלגנטי, בצבעים שמתחברים למותג שלכם.',
  ['עיטור במה ורקע לנואמים ולצילומים', 'דוכן קבלה וכניסה שמזמינים את האורחים פנימה', 'סידורים לשולחנות ולאזורי הכיבוד', 'הקמה במקום לפני האירוע, בתיאום עם המפיקים'],
  `<a class="${P}-link" href="${STAGE}">עוד על עיצוב במות לאירועים</a>`, false);
const d2 = detail(`[vns_img id="1666" size="full" sizes="(max-width:1024px) 92vw, 600px" alt="סידור פרחים מלבני למשרד ולמסעדה – ונוס קיסריה"]`, 'land',
  'פרחים קבועים למשרד, למסעדה ולמלון',
  'משרד עם פרחים טריים מרגיש אחרת – ללקוחות שנכנסים ולצוות שעובד שם כל יום. קובעים איתנו גודל ותדירות, ואנחנו דואגים שהסידור תמיד ייראה טרי.',
  ['סידור ללובי, לקבלה ולחדרי ישיבות', 'החלפה בתדירות קבועה, לפי מה שמתאים לכם', 'סידורים לשולחנות ולמבואה במסעדות ובמלונות', 'צמחים ירוקים שדורשים מעט טיפול, לצד הפרחים'],
  '', true);
const d3 = detail(`[vns_img id="2019" size="large" sizes="(max-width:1024px) 92vw, 600px" alt="זר ורדים למתנה לעובדים וללקוחות – ונוס קיסריה"]`, 'land',
  'מתנות לעובדים וללקוחות',
  'ראש השנה, פסח, ט״ו בשבט, יום הולדת או סגירת פרויקט – מתנה שמגיעה עד הדלת אומרת תודה בצורה הכי אישית. מרכיבים איתכם מתנה לפי תקציב ושולחים לכולם.',
  ['זרים, עציצים, סחלבים ומארזי שוקולד', 'כרטיס ברכה אישי עם שם החברה', 'הזמנה אחת מרוכזת – משלוח לכתובות שונות באזור', 'אפשר לשלב גם גיפט קארד, שכל אחד יבחר בעצמו'],
  `<a class="${P}-link" href="/shop/">למוצרים בחנות</a>`, false);

const perks = [
  ['receipt-alt', 'חשבונית מס', 'על שם החברה, לכל הזמנה.'],
  ['gift', 'הזמנה מרוכזת', 'רשימה אחת – ואנחנו מטפלים בכל המשלוחים.'],
  ['chat-heart', 'מענה אישי', 'בוואטסאפ ובטלפון, מההזמנה ועד המסירה.'],
  ['leaf', 'פרחים טריים', 'נבחרים ביד מדי יום, בסטנדרט קבוע.'],
];
const band = `<section class="${P}-sec ${P}-band" aria-label="למה לעבוד איתנו">${perks.map(([i, t, p]) => `<div>${icon(i)}<h3>${t}</h3><p>${p}</p></div>`).join('')}</section>`;

const quoteSide = `<div class="${P}-sticky"><h2 class="${P}-h2">בואו נדבר על העסק שלכם</h2><p class="${P}-p">ספרו לנו מה אתם צריכים – אירוע, פרחים קבועים או מתנות – ונחזור אליכם עם הצעה מותאמת. מעדיפים לדבר? אנחנו זמינים גם בוואטסאפ ובטלפון.</p>
<div class="${P}-rows">
<div class="${P}-row"><em>${icon('chat-dots')}</em><div><h3><a href="${WA}" target="_blank" rel="noopener" style="color:inherit">וואטסאפ 053-279-1444</a></h3><p>הדרך הכי מהירה לשאלה קצרה.</p></div></div>
<div class="${P}-row"><em>${icon('envelope')}</em><div><h3><a href="mailto:venuscaesarea@gmail.com" style="color:inherit">venuscaesarea@gmail.com</a></h3><p>אפשר לשלוח גם רשימת משלוחים מסודרת.</p></div></div>
<div class="${P}-row"><em>${icon('location-pin')}</em><div><h3>קיסריה, השרון והכרמל</h3><p>משרדים, אולמות, מסעדות ומלונות באזור.</p></div></div>
</div></div>`;

const faqs = [
  ['אתם מוציאים חשבונית מס על שם החברה?', 'כן. כל הזמנה מקבלת חשבונית מס, ואפשר להוציא אותה על שם החברה.'],
  ['אפשר להזמין עשרות מתנות עם משלוח לכתובות שונות?', 'כן. שולחים לנו רשימה אחת עם הכתובות, ואנחנו דואגים למשלוחים באזור. בהזמנות גדולות כדאי לתאם כמה ימים מראש.'],
  ['כמה זמן מראש להזמין מתנות לחגים?', 'לחגים מומלץ לפנות לפחות שבוע־שבועיים מראש, כדי שנוכל להכין את כל הכמות בזמן. לאירועי חברה עם עיצוב במה – לפחות שלושה שבועות.'],
  ['איך עובד שירות פרחים קבוע למשרד?', 'קובעים יחד גודל סידור ותדירות החלפה, ואנחנו מגיעים ומחליפים את הפרחים באופן קבוע. המחיר נקבע לפי ההיקף.'],
  ['אפשר להתאים את העיצוב לצבעי המותג?', 'בטח. אנחנו בוחרים פרחים וגוונים שמתחברים למותג ולעיצוב המקום, גם באירועים וגם בסידורים קבועים.'],
  ['באילו אזורים אתם עובדים?', 'בקיסריה, בשרון ובכרמל. לאירוע או להזמנה במקום אחר, כתבו לנו ונבדוק.'],
];
const faq = `<section class="${P}-split ${P}-sec ${P}-faq" aria-label="שאלות נפוצות">
<div class="${P}-sticky"><h2 class="${P}-h2">שאלות נפוצות</h2><p class="${P}-p">לא מצאתם תשובה? כתבו לנו ונשמח לעזור.</p></div>
<div class="${P}-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

const cta = `<section class="${P}-sec ${P}-cta" aria-label="לפנייה">
<h2 class="${P}-h2">יש לכם אירוע או חג בקרוב?</h2>
<p class="${P}-p">ספרו לנו מה צריך, ונכין לכם הצעה מסודרת – פרחים, עיצוב ומתנות במקום אחד.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-cream" href="#quote">לפנייה עסקית</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">וואטסאפ</a></div>
</section>`;

let n = 0;
const nid = (p) => 'vbz' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra2 = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra2 }, elements: children });
const form = {
  id: 'vbzform', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'פנייה עסקית - אירועים עסקיים',
    form_fields: [
      { _id: 'vbzf1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: 'vbzf2', custom_id: 'company', field_type: 'text', field_label: 'שם החברה', placeholder: 'שם העסק', width: '50' },
      { _id: 'vbzf3', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: 'vbzf4', custom_id: 'email', field_type: 'email', field_label: 'מייל', placeholder: 'name@company.co.il', width: '50' },
      { _id: 'vbzf5', custom_id: 'service', field_type: 'select', field_label: 'במה אפשר לעזור?', field_options: 'כנס / אירוע חברה\nפרחים קבועים למשרד\nמתנות לעובדים / ללקוחות\nמסעדה / מלון\nאחר', width: '50' },
      { _id: 'vbzf6', custom_id: 'details', field_type: 'text', field_label: 'כמות משוערת / תאריך', placeholder: 'לדוגמה: 40 מתנות לראש השנה', width: '50' },
      { _id: 'vbzf7', custom_id: 'message', field_type: 'textarea', field_label: 'פרטים נוספים', placeholder: 'תקציב, צבעי מותג, מיקום – כל מה שיעזור לנו', rows: '4', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחת פנייה', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'פנייה עסקית – [field id="service"] – [field id="company"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    email_reply_to: '[field id="email"]',
    success_message: 'תודה! קיבלנו את הפנייה ונחזור אליכם בהקדם עם הצעה.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה', invalid_message: 'הערך לא תקין', custom_messages: 'yes',
    _css_classes: P + '-form',
  },
};

const elements = [{
  id: 'vbzroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: P, custom_css: serviceCss(P) + extra },
  elements: [
    sc(hero), sc(services), sc(d1), sc(d2), sc(d3), sc(band),
    box(`${P}-split ${P}-sec ${P}-quote`, [
      box('', [sc(quoteSide)], { flex_direction: 'column' }),
      box(`${P}-formcard`, [sc(`<span id="quote"></span><h2 class="${P}-h2">פנייה עסקית</h2><p class="${P}-p">כמה פרטים, ונחזור אליכם עם הצעה מסודרת.</p>`), form, sc(`<p class="${P}-note">הפרטים נשלחים ישירות לצוות ונוס קיסריה.</p>`)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc('[vns_pa_reviews]'), sc(faq), sc(cta),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/service-business-page.json'), JSON.stringify(elements));
console.log('ok business', JSON.stringify(elements).length);
