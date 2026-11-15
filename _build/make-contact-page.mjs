// Generates wp/contact-page.json - Elementor data for the new Contact page (50/50 compositions, no tag pills,
// icons from the user's Light-SVG library in assets/icons, Elementor Pro form -> email + submissions).   node _build/make-contact-page.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const B = 'var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif';
const C = '#FFFBE9';
const icon = (n) => fs.readFileSync(path.join(ROOT, 'assets/icons', n + '.svg'), 'utf8').replace(/ xmlns="[^"]*"/, '').replace(/ width="24" height="24"/, '').trim();
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, יש לי שאלה 🌸');
const MAPQ = encodeURIComponent('ונוס קיסריה - חנות פרחים ומתנות, הרקיע 1, קיסריה');
const SOC = [['Instagram', 'https://www.instagram.com/venus_caesarea'], ['Facebook', 'https://www.facebook.com/profile.php?id=61567038299847'], ['TikTok', 'https://www.tiktok.com/@venus_caesarea']];

const css = `/* ===== Venus Contact ===== */
body{background-color:${C}}
html,body{overflow-x:clip!important;overflow-y:visible!important}
selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 96px;gap:0;display:block;font-family:${B};font-size:18px;font-weight:300;line-height:1.3;color:#141414}
selector .elementor-widget{margin:0}
selector a{text-decoration:none}
selector .vct-crumbs{display:flex;gap:8px;font-size:15px;color:rgba(20,20,20,.6)}
selector .vct-crumbs a{color:inherit}
selector .vct-crumbs a:hover{color:${G};text-decoration:underline}
selector .vct-crumbs i{font-style:normal;opacity:.5}
selector .vct-crumbs span{color:#141414}
selector .vct-h2{margin:0;font-family:${H};font-weight:700;font-size:44px;line-height:1.1;color:#141414}
selector .vct-p{margin:14px 0 0;font-size:19px;line-height:1.6;color:rgba(20,20,20,.75)}
selector .vct-split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px;align-items:stretch}
selector .vct-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 28px;border-radius:12px;font-size:17px;font-weight:500;line-height:1;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
selector .vct-btn svg{width:20px;height:20px;flex:none}
selector .vct-btn-green{background:${G};color:#fff}
selector .vct-btn-green:hover{background:#2C3624;color:#fff}
selector .vct-btn-line{border:1px solid #141414;color:#141414}
selector .vct-btn-line:hover{background:${G};border-color:${G};color:#fff}
/* hero */
selector .vct-hero{align-items:center;margin-top:20px}
selector .vct-title{margin:22px 0 0;font-family:${H};font-weight:700;font-size:64px;line-height:1.05;color:#141414}
selector .vct-title b{font-weight:inherit;color:${G}}
selector .vct-quick{display:flex;flex-direction:column;margin-top:32px;border-top:1px solid ${LINE}}
selector .vct-q{display:flex;align-items:center;gap:18px;padding:20px 4px;border-bottom:1px solid ${LINE};color:#141414;transition:color .15s}
selector .vct-q:hover{color:${G}}
selector .vct-q-i{flex:none;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#fff;border:1px solid ${LINE};color:${G}}
selector .vct-q-i svg{width:24px;height:24px}
selector .vct-q small{display:block;font-size:15px;color:rgba(20,20,20,.6)}
selector .vct-q b{display:block;margin-top:2px;font-size:21px;font-weight:500;direction:ltr;text-align:right}
selector .vct-q b.he{direction:rtl}
selector .vct-q-go{margin-inline-start:auto;font-size:22px;opacity:.5}
selector .vct-hero-img img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:16px}
/* form + info */
selector .vct-formrow{margin-top:110px;--gap:48px;gap:48px;padding:0}
selector .vct-formrow>.e-con{--padding-top:0px;--padding-right:0px;--padding-bottom:0px;--padding-left:0px;min-width:0;width:auto}
selector .vct-card{box-sizing:border-box;height:100%;padding:40px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vct-formcard{padding:40px!important;border:1px solid ${LINE};border-radius:16px;background:#fff;gap:0;--gap:0px}
selector .vct-formcard .vct-p{margin-bottom:28px}
selector .vct-form .elementor-field-group{margin-bottom:16px}
selector .vct-form .elementor-field-label{margin-bottom:6px;font-size:15px;font-weight:500;color:#141414;font-family:inherit}
selector .vct-form .elementor-mark-required .elementor-field-label:after{color:${G}}
selector .vct-form .elementor-field-textual,selector .vct-form .elementor-select-wrapper select{box-sizing:border-box;min-height:50px;padding:0 14px;border:1px solid ${LINE}!important;border-radius:6px!important;background:#fff!important;color:#141414!important;font-family:inherit!important;font-size:17px!important;font-weight:300;line-height:1.3;box-shadow:none!important}
selector .vct-form textarea.elementor-field-textual{min-height:140px;padding:12px 14px}
selector .vct-form .elementor-field-textual:focus,selector .vct-form select:focus{border-color:${G}!important;outline:none}
selector .vct-form .elementor-select-wrapper:before{color:#141414;font-size:13px}
selector .vct-form .elementor-field-type-submit{margin-top:8px;margin-bottom:0}
selector .vct-form .elementor-button{width:100%;min-height:54px;border-radius:12px!important;background:${G}!important;color:#fff!important;font-family:inherit!important;font-size:18px!important;font-weight:500!important;transition:background .15s}
selector .vct-form .elementor-button:hover{background:#2C3624!important}
selector .vct-form .elementor-message{font-size:16px;margin-top:12px}
selector .vct-form .elementor-message.elementor-message-success{color:${G}}
selector .vct-note{margin:14px 0 0;font-size:14px;color:rgba(20,20,20,.55);text-align:center}
selector .vct-row{display:flex;gap:14px;margin-top:22px;font-size:17px;line-height:1.5}
selector .vct-row:first-of-type{margin-top:26px}
selector .vct-row>svg{flex:none;width:22px;height:22px;margin-top:2px;color:${G}}
selector .vct-row b{display:block;font-weight:500}
selector .vct-hours{width:100%;margin-top:6px;border-collapse:collapse;font-size:16px}
selector .vct-hours,selector .vct-hours tr,selector .vct-hours td{border:0!important;background:transparent!important}
selector .vct-hours td{padding:4px 0}
selector .vct-hours td:last-child{text-align:left;direction:ltr}
selector .vct-hours tr.is-closed td{opacity:.55}
selector .vct-soc{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
selector .vct-soc a{display:inline-flex;align-items:center;height:42px;padding:0 18px;border:1px solid ${LINE};border-radius:6px;color:#141414;font-size:16px;font-weight:500;transition:border-color .15s,color .15s}
selector .vct-soc a:hover{border-color:${G};color:${G}}
/* visit */
selector .vct-visit{margin-top:110px;align-items:center}
selector .vct-map{min-height:480px;border-radius:16px;overflow:hidden;border:1px solid ${LINE};background:#e9e6d8}
selector .vct-map iframe{display:block;width:100%;height:100%;min-height:480px;border:0}
selector .vct-addr{margin-top:26px;padding:22px 24px;border-radius:12px;background:#fff;border:1px solid ${LINE};font-size:18px;line-height:1.5}
selector .vct-addr b{display:block;font-weight:500}
selector .vct-btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
/* faq */
selector .vct-faq{margin-top:110px;align-items:start}
selector .vct-faq-side{position:sticky;top:24px}
selector .vct-faq-side .vct-btn{margin-top:26px}
selector .vct-faq-l{border-top:1px solid ${LINE}}
selector .vct-faq-l details{border-bottom:1px solid ${LINE}}
selector .vct-faq-l summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 4px;cursor:pointer;list-style:none;font-size:20px;font-weight:400;color:#141414;-webkit-tap-highlight-color:transparent}
selector .vct-faq-l summary::-webkit-details-marker{display:none}
selector .vct-faq-l summary::after{content:"";flex:none;width:12px;height:12px;border-left:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg) translateY(-3px);transition:transform .25s}
selector .vct-faq-l details[open] summary::after{transform:rotate(135deg) translateY(-3px)}
selector .vct-faq-l summary:hover{color:${G}}
selector .vct-faq-l details p{margin:0;padding:0 4px 22px;font-size:17px;line-height:1.65;color:rgba(20,20,20,.8)}
@media(max-width:1024px){
selector .vct-split{grid-template-columns:minmax(0,1fr);gap:36px}
selector .vct-formrow{flex-direction:column}
selector .vct-hero-img{order:-1}
selector .vct-hero-img img{aspect-ratio:16/10}
selector .vct-faq-side{position:static}
}
@media(max-width:767px){
selector{padding:16px 0 72px}
selector .vct-crumbs{font-size:14px}
selector .vct-title{font-size:40px}
selector .vct-p{font-size:17px}
selector .vct-h2{font-size:32px}
selector .vct-hero-img img{aspect-ratio:4/3;border-radius:12px}
selector .vct-q b{font-size:18px}
selector .vct-formrow,selector .vct-visit,selector .vct-faq{margin-top:72px}
selector .vct-card,selector .vct-formcard{padding:24px!important}
selector .vct-map,selector .vct-map iframe{min-height:340px}
selector .vct-btns .vct-btn,selector .vct-faq-side .vct-btn{flex:1 1 100%;width:100%}
selector .vct-faq-l summary{font-size:18px}
}`;

const hero = `<section class="vct-split vct-hero" aria-label="יצירת קשר">
<div class="vct-hero-t">
<nav class="vct-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>צור קשר</span></nav>
<h1 class="vct-title">דברו <b>איתנו</b></h1>
<p class="vct-p">שאלה על הזמנה, זר בעיצוב מיוחד או פרחים לאירוע? אנחנו זמינים בוואטסאפ, בטלפון ובמייל, ושמחים לעזור לבחור.</p>
<div class="vct-quick">
<a class="vct-q" href="${WA}" target="_blank" rel="noopener"><span class="vct-q-i">${icon('chat-dots')}</span><span><small>הכי מהיר – וואטסאפ</small><b>053-279-1444</b></span><span class="vct-q-go" aria-hidden="true">←</span></a>
<a class="vct-q" href="tel:+972532791444"><span class="vct-q-i">${icon('phone')}</span><span><small>טלפון</small><b>053-279-1444</b></span><span class="vct-q-go" aria-hidden="true">←</span></a>
<a class="vct-q" href="mailto:venuscaesarea@gmail.com"><span class="vct-q-i">${icon('envelope')}</span><span><small>מייל</small><b>venuscaesarea@gmail.com</b></span><span class="vct-q-go" aria-hidden="true">←</span></a>
</div>
</div>
<div class="vct-hero-img">[vns_img id="1795" size="large" eager="1" sizes="(max-width:1024px) 92vw, 600px" alt="זר פרחים מהחנות של ונוס קיסריה"]</div>
</section>`;

const formHead = `<h2 class="vct-h2">השאירו פרטים</h2><p class="vct-p">כתבו לנו במה אפשר לעזור, ונחזור אליכם בהקדם בשעות הפעילות.</p>`;
const formNote = `<p class="vct-note">אפשר גם לכתוב לנו ישירות בוואטסאפ – בדרך כלל זה הכי מהיר.</p>`;

const info = `<div class="vct-card">
<h2 class="vct-h2">פרטים ושעות</h2>
<div class="vct-row">${icon('location-pin')}<div><b>החנות</b>הרקיע 1, מרכז מסחרי C-CENTER, קיסריה</div></div>
<div class="vct-row">${icon('clock')}<div style="flex:1"><b>שעות פתיחה</b><table class="vct-hours"><tbody>
<tr><td>ראשון</td><td>10:00–17:00</td></tr><tr><td>שני–חמישי</td><td>09:00–18:30</td></tr><tr><td>שישי</td><td>08:30–14:30</td></tr><tr class="is-closed"><td>שבת</td><td>סגור</td></tr>
</tbody></table></div></div>
<div class="vct-row">${icon('phone')}<div><b>טלפון / וואטסאפ</b><a href="tel:+972532791444" style="color:inherit">053-279-1444</a></div></div>
<div class="vct-row">${icon('envelope')}<div><b>מייל</b><a href="mailto:venuscaesarea@gmail.com" style="color:inherit">venuscaesarea@gmail.com</a></div></div>
<div class="vct-row" style="display:block"><b>עקבו אחרינו</b><div class="vct-soc">${SOC.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener nofollow">${n}</a>`).join('')}</div></div>
</div>`;

const visit = `<section class="vct-split vct-visit" aria-label="איך מגיעים">
<div class="vct-map"><iframe title="מפה – ונוס קיסריה" src="https://www.google.com/maps?q=${MAPQ}&hl=he&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
<div>
<h2 class="vct-h2">בואו לבקר בחנות</h2>
<p class="vct-p">החנות נמצאת במרכז המסחרי C-CENTER בקיסריה. אפשר להגיע, להריח את הפרחים ולבחור איתנו זר במקום, או לאסוף הזמנה שהזמנתם באתר.</p>
<div class="vct-addr"><b>ונוס קיסריה – חנות פרחים ומתנות</b>הרקיע 1, קיסריה</div>
<div class="vct-btns"><a class="vct-btn vct-btn-green" href="https://waze.com/ul?q=${MAPQ}&navigate=yes" target="_blank" rel="noopener">ניווט בוויז</a><a class="vct-btn vct-btn-line" href="https://www.google.com/maps/search/?api=1&query=${MAPQ}" target="_blank" rel="noopener">פתיחה בגוגל מפות</a></div>
</div>
</section>`;

const faqs = [
  ['מה הדרך הכי מהירה להשיג אתכם?', 'וואטסאפ למספר 053-279-1444. בשעות הפעילות אנחנו זמינים גם בטלפון, ובדרך כלל עונים מהר.'],
  ['עד מתי אפשר להזמין משלוח להיום?', 'בימים ראשון עד חמישי עד 18:00, ובימי שישי וערבי חג עד 13:00. הזמנה שמגיעה אחרי השעות האלה יוצאת ביום העסקים הבא.'],
  ['אפשר להזמין זר בעיצוב מיוחד שלא מופיע באתר?', 'בטח. ספרו לנו בוואטסאפ או בטופס למי הזר, לאיזה אירוע ובאיזה תקציב, ונציע עיצוב שמתאים בדיוק.'],
  ['אתם עושים פרחים לחתונות ולאירועים?', 'כן – זרי כלה, קישוט רכב ועיצוב פרחים לאירוע. השאירו פרטים בטופס ובחרו בנושא "חתונה ואירועים", ונחזור אליכם לתיאום.'],
  ['אפשר לאסוף את ההזמנה בעצמי?', 'כן. בקופה באתר אפשר לבחור איסוף עצמי מהחנות ברחוב הרקיע 1, במרכז המסחרי C-CENTER בקיסריה.'],
  ['לאילו יישובים אתם שולחים?', 'קיסריה, פרדס חנה־כרכור, אור עקיבא, אור ים, זכרון יעקב, עין שמר, שדות ים, בית חנינה, מעגן מיכאל, חריש, בנימינה־גבעת עדה, משמרות, גן שלמה, עין עירון, גן שומרון, תלמי אלעזר וגן שמואל.'],
  ['איך משנים או מבטלים הזמנה?', 'כתבו לנו בוואטסאפ כמה שיותר מהר. אפשר לבטל תוך שעה מאישור ההזמנה, כל עוד היא לא יצאה למשלוח. הפרטים המלאים מופיעים בתקנון האתר.'],
];
const faq = `<section class="vct-split vct-faq" aria-label="שאלות נפוצות">
<div class="vct-faq-side"><h2 class="vct-h2">שאלות נפוצות</h2><p class="vct-p">לא מצאתם תשובה? כתבו לנו, ונשמח לעזור.</p><a class="vct-btn vct-btn-green" href="${WA}" target="_blank" rel="noopener">${icon('chat-dots')}שאלה בוואטסאפ</a></div>
<div class="vct-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

let n = 0;
const nid = (p) => 'vct' + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra }, elements: children });
const form = {
  id: 'vctform', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'צור קשר - עמוד חדש',
    form_fields: [
      { _id: 'vctf1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: 'vctf2', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: 'vctf3', custom_id: 'email', field_type: 'email', field_label: 'מייל (לא חובה)', placeholder: 'name@example.com', width: '50' },
      { _id: 'vctf4', custom_id: 'subject', field_type: 'select', field_label: 'נושא הפנייה', field_options: 'הזמנה בעיצוב מיוחד\nחתונה ואירועים\nשאלה על הזמנה קיימת\nשיתוף פעולה\nאחר', width: '50' },
      { _id: 'vctf5', custom_id: 'message', field_type: 'textarea', field_label: 'הודעה', placeholder: 'ספרו לנו במה אפשר לעזור', required: 'true', rows: '5', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחה', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'פנייה חדשה מעמוד צור קשר – [field id="subject"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    email_reply_to: '[field id="email"]',
    success_message: 'תודה! קיבלנו את הפנייה ונחזור אליכם בהקדם.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה',
    invalid_message: 'הערך לא תקין',
    custom_messages: 'yes',
    _css_classes: 'vct-form',
  },
};

const elements = [{
  id: 'vctroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'vct', custom_css: css },
  elements: [
    sc(hero),
    box('vct-split vct-formrow', [
      box('vct-formcard', [sc(formHead), form, sc(formNote)], { flex_direction: 'column' }),
      box('', [sc(info)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc(visit),
    sc(faq),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/contact-page.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length);
