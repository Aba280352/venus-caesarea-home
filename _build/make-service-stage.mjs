// Generates wp/service-stage-page.json - "עיצוב במות לאירועים" service page (50/50 compositions, no tag pills,
// icons from the user's library, quote form -> email + submissions, real stage photos 1841-1848).   node _build/make-service-stage.mjs
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
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לשמוע על עיצוב במה לאירוע 🌸');
const ARTICLE = '/2026/07/20/stage-floral-design-events/';

export const serviceCss = (p) => `/* ===== Venus service page ===== */
body{background-color:${C}}
html,body{overflow-x:clip!important;overflow-y:visible!important}
selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 96px;gap:0;display:block;font-family:${B};font-size:18px;font-weight:300;line-height:1.3;color:#141414}
selector .elementor-widget{margin:0}
selector a{text-decoration:none}
selector .${p}-crumbs{display:flex;flex-wrap:wrap;gap:8px;font-size:15px;color:rgba(20,20,20,.6)}
selector .${p}-crumbs a{color:inherit}
selector .${p}-crumbs a:hover{color:${G};text-decoration:underline}
selector .${p}-crumbs i{font-style:normal;opacity:.5}
selector .${p}-crumbs span{color:#141414}
selector .${p}-h2{margin:0;font-family:${H};font-weight:700;font-size:44px;line-height:1.1;color:#141414}
selector .${p}-p{margin:14px 0 0;font-size:19px;line-height:1.65;color:rgba(20,20,20,.78)}
selector .${p}-split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:56px;align-items:center}
selector .${p}-sec{margin-top:110px}
selector .${p}-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 28px;border-radius:12px;font-size:17px;font-weight:500;line-height:1;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
selector .${p}-btn svg{width:20px;height:20px;flex:none}
selector .${p}-btn-green{background:${G};color:#fff}
selector .${p}-btn-green:hover{background:#2C3624;color:#fff}
selector .${p}-btn-line{border:1px solid #141414;color:#141414}
selector .${p}-btn-line:hover{background:${G};border-color:${G};color:#fff}
selector .${p}-btn-cream{background:${C};color:${G}}
selector .${p}-btn-cream:hover{background:#fff;color:${G}}
selector .${p}-btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
selector .${p}-img img{display:block;width:100%;height:auto;object-fit:cover;border-radius:16px}
/* hero */
selector .${p}-hero{margin-top:20px}
selector .${p}-title{margin:22px 0 0;font-family:${H};font-weight:700;font-size:62px;line-height:1.05;color:#141414}
selector .${p}-title b{font-weight:inherit;color:${G}}
selector .${p}-trust{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:26px;font-size:15px;color:rgba(20,20,20,.65)}
selector .${p}-trust span{display:inline-flex;align-items:center;gap:6px}
selector .${p}-trust svg{width:18px;height:18px;color:${G}}
selector .${p}-hero .${p}-img img{aspect-ratio:4/5}
/* numbered list */
selector .${p}-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
selector .${p}-item{padding:26px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .${p}-item em{display:block;font-style:normal;font-family:${H};font-size:28px;line-height:1;color:${G}}
selector .${p}-item h3{margin:14px 0 0;font-family:${H};font-size:22px;font-weight:700;line-height:1.2}
selector .${p}-item p{margin:8px 0 0;font-size:16px;line-height:1.6;color:rgba(20,20,20,.75)}
/* rows list (events / steps / factors) */
selector .${p}-rows{margin-top:26px;border-top:1px solid ${LINE}}
selector .${p}-row{display:flex;gap:18px;padding:20px 0;border-bottom:1px solid ${LINE}}
selector .${p}-row em{flex:none;width:34px;font-style:normal;font-family:${H};font-size:22px;line-height:1.3;color:${G}}
selector .${p}-row em svg{display:block;width:24px;height:24px;margin-top:2px}
selector #quote{display:block;position:relative;top:-24px}
selector .${p}-row h3{margin:0;font-size:20px;font-weight:500;line-height:1.35;color:#141414}
selector .${p}-row p{margin:6px 0 0;font-size:16px;line-height:1.6;color:rgba(20,20,20,.75)}
/* gallery */
selector .${p}-gal-h{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
selector .${p}-ggrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:230px;grid-auto-flow:dense;gap:16px;margin-top:36px}
selector .${p}-ggrid figure{position:relative;margin:0;border-radius:12px;overflow:hidden}
selector .${p}-ggrid figure.w2{grid-column:span 2}
selector .${p}-ggrid figure.h2{grid-row:span 2}
selector .${p}-ggrid img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.16,1,.3,1)}
selector .${p}-ggrid figure:hover img{transform:scale(1.04)}
selector .${p}-ggrid figcaption{position:absolute;right:12px;bottom:12px;left:12px;padding:8px 12px;border-radius:8px;background:rgba(255,251,233,.92);font-size:14px;font-style:normal;font-weight:500;line-height:1.35;color:#141414}
/* quote */
selector .${p}-quote{align-items:start;--gap:56px;gap:56px;padding:0}
selector .${p}-quote>.e-con{--padding-top:0px;--padding-right:0px;--padding-bottom:0px;--padding-left:0px;min-width:0;width:auto}
selector .${p}-formcard{padding:40px!important;border:1px solid ${LINE};border-radius:16px;background:#fff;gap:0;--gap:0px;scroll-margin-top:24px}
selector .${p}-formcard .${p}-p{margin-bottom:26px}
selector .${p}-form .elementor-field-group{margin-bottom:16px}
selector .${p}-form .elementor-field-label{margin-bottom:6px;font-size:15px;font-weight:500;color:#141414;font-family:inherit}
selector .${p}-form .elementor-mark-required .elementor-field-label:after{color:${G}}
selector .${p}-form .elementor-field-textual,selector .${p}-form .elementor-select-wrapper select{box-sizing:border-box;min-height:50px;padding:0 14px;border:1px solid ${LINE}!important;border-radius:6px!important;background:#fff!important;color:#141414!important;font-family:inherit!important;font-size:17px!important;font-weight:300;line-height:1.3;box-shadow:none!important}
selector .${p}-form textarea.elementor-field-textual{min-height:120px;padding:12px 14px}
selector .${p}-form .elementor-field-textual:focus,selector .${p}-form select:focus{border-color:${G}!important;outline:none}
selector .${p}-form .elementor-select-wrapper:before,selector .${p}-form .select-caret-down-wrapper{color:#141414!important;font-size:13px}
selector .${p}-form .select-caret-down-wrapper svg{fill:#141414!important;width:12px;height:12px}
selector .${p}-form .elementor-field-type-submit{margin-top:8px;margin-bottom:0}
selector .${p}-form .elementor-button{width:100%;min-height:54px;border-radius:12px!important;background:${G}!important;color:#fff!important;font-family:inherit!important;font-size:18px!important;font-weight:500!important;transition:background .15s}
selector .${p}-form .elementor-button:hover{background:#2C3624!important}
selector .${p}-form .elementor-message{font-size:16px;margin-top:12px}
selector .${p}-note{margin:14px 0 0;font-size:14px;color:rgba(20,20,20,.55);text-align:center}
selector .${p}-sticky{position:sticky;top:24px}
/* reviews */
selector .vpa-revs{margin-top:110px}
selector .vpa-revs .vpa-h2{margin:0;text-align:center;font-family:${H};font-weight:700;font-size:44px;line-height:1.1;color:#141414}
selector .vpa-sub{margin:10px 0 0;text-align:center;font-size:19px;color:rgba(20,20,20,.72)}
selector .vpa-ti{margin-top:32px;min-height:240px}
selector .vpa-ti .ti-widget,selector .vpa-ti .ti-widget *{font-family:${B}!important}
selector .vpa-ti .ti-widget .ti-inner.ti-inner.ti-inner{background-color:#fff!important}
/* faq */
selector .${p}-faq{align-items:start}
selector .${p}-faq-l{border-top:1px solid ${LINE}}
selector .${p}-faq-l details{border-bottom:1px solid ${LINE}}
selector .${p}-faq-l summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 4px;cursor:pointer;list-style:none;font-size:20px;font-weight:400;color:#141414;-webkit-tap-highlight-color:transparent}
selector .${p}-faq-l summary::-webkit-details-marker{display:none}
selector .${p}-faq-l summary::after{content:"";flex:none;width:12px;height:12px;border-left:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg) translateY(-3px);transition:transform .25s}
selector .${p}-faq-l details[open] summary::after{transform:rotate(135deg) translateY(-3px)}
selector .${p}-faq-l summary:hover{color:${G}}
selector .${p}-faq-l details p{margin:0;padding:0 4px 22px;font-size:17px;line-height:1.65;color:rgba(20,20,20,.8)}
selector .${p}-more{display:inline-block;margin-top:18px;font-size:17px;font-weight:500;color:${G};text-decoration:underline;text-underline-offset:3px}
/* closing */
selector .${p}-cta{padding:64px 32px;border-radius:16px;background:${G};color:${C};text-align:center}
selector .${p}-cta .${p}-h2{color:${C}}
selector .${p}-cta .${p}-p{max-width:600px;margin-inline:auto;color:rgba(255,251,233,.85)}
selector .${p}-cta .${p}-btns{justify-content:center}
selector .${p}-cta .${p}-btn-line{border-color:rgba(255,251,233,.6);color:${C}}
selector .${p}-cta .${p}-btn-line:hover{background:rgba(255,251,233,.1);border-color:${C};color:${C}}
@media(max-width:1024px){
selector .${p}-split{grid-template-columns:minmax(0,1fr);gap:36px}
selector .${p}-quote{flex-direction:column}
selector .${p}-hero .${p}-img{order:-1}
selector .${p}-hero .${p}-img img{aspect-ratio:16/10}
selector .${p}-sticky{position:static}
selector .${p}-ggrid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(max-width:767px){
selector{padding:16px 0 72px}
selector .${p}-crumbs{font-size:14px}
selector .${p}-title{font-size:38px}
selector .${p}-p{font-size:17px}
selector .${p}-h2,selector .vpa-revs .vpa-h2{font-size:32px}
selector .${p}-sec,selector .vpa-revs{margin-top:72px}
selector .${p}-hero .${p}-img img{aspect-ratio:4/3;border-radius:12px}
selector .${p}-list{grid-template-columns:minmax(0,1fr)}
selector .${p}-btns .${p}-btn{flex:1 1 100%}
selector .${p}-gal-h{flex-direction:column;align-items:flex-start}
selector .${p}-ggrid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:170px;gap:10px}
selector .${p}-ggrid figure.w2{grid-column:span 2}
selector .${p}-ggrid figure.h2{grid-row:auto}
selector .${p}-formcard{padding:24px!important}
selector .${p}-faq-l summary{font-size:18px}
selector .${p}-cta{padding:44px 20px}
}`;

const P = 'vsv';
const hero = `<section class="${P}-split ${P}-hero" aria-label="עיצוב במות לאירועים">
<div>
<nav class="${P}-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>שירותים</span><i aria-hidden="true">›</i><span>עיצוב במות לאירועים</span></nav>
<h1 class="${P}-title">עיצוב במות <b>לאירועים</b></h1>
<p class="${P}-p">הבמה היא המקום שאליו כל העיניים מופנות. אנחנו מעצבים במות, קירות פרחים וקשתות כניסה לחתונות, לבר ובת מצווה, לאירועי חברה ולאירועים פרטיים – מהתכנון הראשון ועד שהאורחים מגיעים.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-green" href="#quote">לקבלת הצעת מחיר</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">${icon('chat-dots')}דברו איתנו בוואטסאפ</a></div>
<div class="${P}-trust"><span>${icon('location-pin')}קיסריה, השרון והכרמל</span><span>${icon('leaf')}פרחים טריים בעיצוב אישי</span></div>
</div>
<div class="${P}-img">[vns_img id="1848" size="full" eager="1" sizes="(max-width:1024px) 92vw, 600px" alt="עיצוב במה בפרחים של ונוס קיסריה"]</div>
</section>`;

const items = [
  ['01', 'עיטור במה', 'פרחים לאורך קצוות הבמה או סביבה כולה, שמגדירים את השטח ומבליטים את מי שעומד עליה.'],
  ['02', 'קיר פרחים לרקע', 'רקע מרשים לנאומים, לתמונות ולווידאו, שיכול לשמש גם פינת צילום לאורחים.'],
  ['03', 'קשת כניסה', 'קשת מעוטרת בפרחים שמסמנת את הכניסה לרחבת הטקס ומכינה את האורחים לרגע המרכזי.'],
  ['04', 'חופה ורחבת טקס', 'מסגרת פרחים לחופה, גירלנדות וירק טבעי – בשילוב עם עיצוב הבמה, באותה שפה.'],
];
const what = `<section class="${P}-split ${P}-sec" aria-label="מה אנחנו מעצבים">
<div><h2 class="${P}-h2">מה אנחנו מעצבים</h2><p class="${P}-p">כל במה מתחילה בשאלה מה אמור לקרות עליה: טקס, נאומים, הופעה או טקס פרסים. לפי זה אנחנו בונים את העיצוב – מעיטור עדין ועד במה מלאה בפרחים.</p><p class="${P}-p">משלבים פרחים עונתיים, ירק טבעי וגוונים שמתאימים לאולם ולשאר העיצוב, כדי שהבמה תיראה מושלמת גם בתמונות.</p></div>
<div class="${P}-list">${items.map(([n, t, p]) => `<div class="${P}-item"><em>${n}</em><h3>${t}</h3><p>${p}</p></div>`).join('')}</div>
</section>`;

const events = [
  ['חתונות וחינות', 'עיצוב עשיר ומלא, לרוב בגוונים בהירים ורכים, שמתחבר לחופה ולשולחנות.'],
  ['בר ובת מצווה, ברית', 'במה תוססת וצבעונית לנאומים ולהדלקת נרות, שמתאימה לאווירה החגיגית.'],
  ['אירועי חברה', 'עיצוב מאופק ואלגנטי בגוונים ניטרליים, שמחמיא למותג ולא מסיח את הדעת מהתוכן.'],
  ['אירועים פרטיים', 'ימי הולדת, אירועים בבית ובגן – עיצוב בהתאמה אישית לגודל המקום ולסגנון.'],
];
const types = `<section class="${P}-split ${P}-sec" aria-label="לאילו אירועים">
<div class="${P}-img">[vns_img id="1845" size="full" sizes="(max-width:1024px) 92vw, 600px" alt="במת פרחים לאירוע של ונוס קיסריה"]</div>
<div><h2 class="${P}-h2">לכל סוג של אירוע</h2><p class="${P}-p">הסגנון משתנה לפי האירוע, אבל ההקפדה נשארת אותו דבר.</p>
<div class="${P}-rows">${events.map(([t, p]) => `<div class="${P}-row"><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
</section>`;

const gal = [[1845, 'w2', ''], [1848, 'h2', ''], [1844, 'w2', ''], [1846, 'h2', ''], [1842, '', ''], [1843, '', ''], [1847, 'w2', 'מאחורי הקלעים – הכנת העיצוב בשטח']];
const gallery = `<section class="${P}-sec" aria-label="במות שעיצבנו">
<div class="${P}-gal-h"><div><h2 class="${P}-h2">במות שעיצבנו</h2><p class="${P}-p">כמה רגעים מאירועים אמיתיים – מהבנייה בשטח ועד הבמה המוכנה.</p></div><a class="${P}-btn ${P}-btn-line" href="#quote">רוצים כזה גם אצלכם?</a></div>
<div class="${P}-ggrid">${gal.map(([id, cls, cap]) => `<figure${cls ? ` class="${cls}"` : ''}>[vns_img id="${id}" size="full" sizes="(max-width:767px) 46vw, 310px" alt="${cap || 'עיצוב במה בפרחים – ונוס קיסריה'}"]${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`).join('')}</div>
</section>`;

const steps = [
  ['1', 'מספרים לנו על האירוע', 'תאריך, מקום, סוג האירוע וגודל הבמה. אפשר בטופס, בוואטסאפ או בטלפון.'],
  ['2', 'מתאימים עיצוב ותקציב', 'בוחרים יחד סגנון, צבעים ופרחים, ומקבלים הצעת מחיר מסודרת.'],
  ['3', 'מקימים ביום האירוע', 'הפרחים מגיעים טריים, והצוות שלנו בונה את העיצוב במקום לפני שהאורחים מגיעים.'],
];
const factors = [
  ['גודל הבמה', 'ככל שהשטח גדול יותר, צריך יותר פרחים כדי שהמראה יהיה מלא ולא דליל.'],
  ['סוג הפרחים', 'פרחים עונתיים וזמינים משתלמים יותר מפרחים מיובאים או נדירים.'],
  ['שילוב ירק', 'שילוב חכם של ירק טבעי לצד הפרחים מוזיל את העלות בלי לפגוע במראה.'],
  ['פירוק בסיום', 'אם צריך פירוק ופינוי בסוף האירוע, מתאמים את זה מראש כחלק מההצעה.'],
];
const process = `<section class="${P}-split ${P}-sec" aria-label="איך זה עובד" style="align-items:start">
<div><h2 class="${P}-h2">איך זה עובד</h2><p class="${P}-p">מומלץ לפנות אלינו לפחות שלושה שבועות לפני האירוע, כדי לתכנן כמויות ולהזמין את הפרחים הנכונים.</p>
<div class="${P}-rows">${steps.map(([n, t, p]) => `<div class="${P}-row"><em>${n}</em><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
<div><h2 class="${P}-h2">מה משפיע על המחיר</h2><p class="${P}-p">כל במה מתומחרת בנפרד, לפי האירוע. אלה הדברים שהכי משפיעים:</p>
<div class="${P}-rows">${factors.map(([t, p]) => `<div class="${P}-row"><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div>
</section>`;

const quoteSide = `<div class="${P}-sticky"><h2 class="${P}-h2">בואו נעצב לכם במה</h2><p class="${P}-p">השאירו פרטים על האירוע, ונחזור אליכם עם רעיונות והצעת מחיר אישית. מעדיפים לדבר? אנחנו זמינים גם בוואטסאפ ובטלפון.</p>
<div class="${P}-rows">
<div class="${P}-row"><em>${icon('chat-dots')}</em><div><h3><a href="${WA}" target="_blank" rel="noopener" style="color:inherit">וואטסאפ 053-279-1444</a></h3><p>הדרך הכי מהירה לשאלה קצרה.</p></div></div>
<div class="${P}-row"><em>${icon('phone')}</em><div><h3><a href="tel:+972532791444" style="color:inherit">053-279-1444</a></h3><p>בשעות הפעילות של החנות.</p></div></div>
<div class="${P}-row"><em>${icon('location-pin')}</em><div><h3>קיסריה, השרון והכרמל</h3><p>אולמות, גני אירועים, משרדים ובתים פרטיים באזור.</p></div></div>
</div></div>`;

const faqs = [
  ['כמה זמן מראש צריך להזמין עיצוב במה?', 'מומלץ לפחות שלושה שבועות מראש לתכנון ולהזמנת הפרחים. הפרחים עצמם מגיעים ימים ספורים לפני האירוע, כדי שיהיו במיטבם.'],
  ['כמה עולה עיצוב במה בפרחים?', 'המחיר תלוי בגודל הבמה, בסוג הפרחים ובכמות הירק, ולכן כל אירוע מקבל הצעת מחיר אישית. השאירו פרטים ונחזור אליכם.'],
  ['אפשר לשלב פרחים מלאכותיים כדי להוזיל?', 'אפשר לשלב פרחים מלאכותיים איכותיים באזורים פחות בולטים, אבל באזורים המרכזיים ובקרבת המצלמות מומלץ פרחים טריים.'],
  ['מה ההבדל בין קיר פרחים לקשת כניסה?', 'קיר פרחים משמש רקע לבמה ולצילומים, וקשת כניסה ממוקמת במעבר שהאורחים עוברים דרכו בדרך לרחבת הטקס.'],
  ['אפשר לקחת פרחים הביתה אחרי האירוע?', 'בדרך כלל כן, בעיקר זרים וסידורים קטנים. אלמנטים גדולים כמו קיר פרחים מלא מפורקים בסיום, בתיאום מראש.'],
  ['באילו אזורים אתם מעצבים?', 'בקיסריה, בשרון ובכרמל – אולמות, גני אירועים, משרדים ובתים פרטיים. לאירוע במקום אחר, כתבו לנו ונבדוק.'],
];
const faq = `<section class="${P}-split ${P}-sec ${P}-faq" aria-label="שאלות נפוצות">
<div class="${P}-sticky"><h2 class="${P}-h2">שאלות נפוצות</h2><p class="${P}-p">לא מצאתם תשובה? כתבו לנו ונשמח לעזור.</p><a class="${P}-more" href="${ARTICLE}">למדריך המלא על עיצוב פרחים לבמה</a></div>
<div class="${P}-faq-l">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}</div>
</section>`;

const cta = `<section class="${P}-sec ${P}-cta" aria-label="להזמנה">
<h2 class="${P}-h2">יש לכם אירוע בקרוב?</h2>
<p class="${P}-p">ספרו לנו על הבמה, ואנחנו נדאג שכל העיניים יופנו אליה.</p>
<div class="${P}-btns"><a class="${P}-btn ${P}-btn-cream" href="#quote">לקבלת הצעת מחיר</a><a class="${P}-btn ${P}-btn-line" href="${WA}" target="_blank" rel="noopener">וואטסאפ</a></div>
</section>`;

let n = 0;
const nid = (p) => P + p + (++n).toString(36);
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const sc = (code) => ({ id: nid('s'), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const box = (cls, children, extra = {}) => ({ id: nid('c'), elType: 'container', isInner: false, settings: { content_width: 'full', padding: pad0, css_classes: cls, ...extra }, elements: children });
const form = {
  id: P + 'form', elType: 'widget', widgetType: 'form', isInner: false, elements: [],
  settings: {
    form_name: 'הצעת מחיר - עיצוב במות',
    form_fields: [
      { _id: P + 'f1', custom_id: 'name', field_type: 'text', field_label: 'שם מלא', placeholder: 'איך קוראים לך?', required: 'true', width: '50' },
      { _id: P + 'f2', custom_id: 'phone', field_type: 'tel', field_label: 'טלפון', placeholder: '050-0000000', required: 'true', width: '50' },
      { _id: P + 'f3', custom_id: 'event_type', field_type: 'select', field_label: 'סוג האירוע', field_options: 'חתונה\nחינה\nבר / בת מצווה\nברית\nאירוע חברה\nאירוע פרטי\nאחר', width: '50' },
      { _id: P + 'f4', custom_id: 'event_date', field_type: 'date', field_label: 'תאריך האירוע', width: '50' },
      { _id: P + 'f5', custom_id: 'venue', field_type: 'text', field_label: 'מקום / אולם', placeholder: 'לדוגמה: גן אירועים בקיסריה', width: '100' },
      { _id: P + 'f6', custom_id: 'message', field_type: 'textarea', field_label: 'ספרו לנו על הבמה', placeholder: 'גודל משוער, צבעים, השראה – כל מה שיעזור לנו', rows: '4', width: '100' },
    ],
    show_labels: 'yes', mark_required: 'yes', label_position: 'above',
    column_gap: { unit: 'px', size: 14, sizes: [] }, row_gap: { unit: 'px', size: 2, sizes: [] },
    button_text: 'שליחת בקשה להצעת מחיר', button_size: 'md', button_width: '100',
    submit_actions: ['save-to-database', 'email'],
    email_to: 'venuscaesarea@gmail.com',
    email_subject: 'בקשת הצעת מחיר – עיצוב במה – [field id="event_type"]',
    email_content: '[all-fields]',
    email_from: 'email@venus-caesarea.net', email_from_name: 'venus caesarea',
    success_message: 'תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם עם הצעה.',
    error_message: 'משהו השתבש. נסו שוב או כתבו לנו בוואטסאפ.',
    required_field_message: 'שדה חובה', invalid_message: 'הערך לא תקין', custom_messages: 'yes',
    _css_classes: P + '-form',
  },
};

const elements = [{
  id: P + 'root', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: P, custom_css: serviceCss(P) },
  elements: [
    sc(hero), sc(what), sc(types), sc(gallery), sc(process),
    box(`${P}-split ${P}-sec ${P}-quote`, [
      box('', [sc(quoteSide)], { flex_direction: 'column' }),
      box(`${P}-formcard`, [sc(`<span id="quote"></span><h2 class="${P}-h2">בקשה להצעת מחיר</h2><p class="${P}-p">כמה פרטים קצרים, ונחזור אליכם בהקדם.</p>`), form, sc(`<p class="${P}-note">הפרטים נשלחים ישירות לצוות ונוס קיסריה.</p>`)], { flex_direction: 'column' }),
    ], { flex_direction: 'row' }),
    sc('[vns_pa_reviews]'), sc(faq), sc(cta),
  ],
}];
fs.writeFileSync(path.join(ROOT, 'wp/service-stage-page.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length);
