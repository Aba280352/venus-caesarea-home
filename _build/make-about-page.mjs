// Generates wp/about-page.json - Elementor data for the new About page (static sections; images via [vns_img] from the Venus Pages plugin,
// Google reviews via [vns_pa_reviews] from Venus Shop Archive).   node _build/make-about-page.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const G = 'var(--e-global-color-vnsgreen,#3A4831)';
const LINE = 'rgba(20,20,20,.18)';
const H = '"Leon","Discovery Fs",system-ui,sans-serif';
const B = 'var(--e-global-typography-vnsbody-font-family),"Discovery Fs",system-ui,sans-serif';
const C = '#FFFBE9';
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const WA = 'https://wa.me/972532791444?text=' + encodeURIComponent('היי ונוס, אשמח לעזרה בבחירת מתנה 🌸');
const SHOP = '/shop/';
const FLOWERS = '/product-category/%d7%a4%d7%a8%d7%97%d7%99%d7%9d/';
const MAPQ = encodeURIComponent('ונוס קיסריה - חנות פרחים ומתנות, הרקיע 1, קיסריה');

const css = `/* ===== Venus About ===== */
body{background-color:${C}}
html,body{overflow-x:clip!important;overflow-y:visible!important}
selector{width:calc(100% - 8vw);max-width:1240px;margin:0 auto;padding:24px 0 96px;gap:0;display:block;font-family:${B};font-size:18px;font-weight:300;line-height:1.3;color:#141414}
selector .elementor-widget{margin:0}
selector a{text-decoration:none}
selector .vab-crumbs{display:flex;justify-content:center;gap:8px;font-size:15px;color:rgba(20,20,20,.6)}
selector .vab-crumbs a{color:inherit}
selector .vab-crumbs a:hover{color:${G};text-decoration:underline}
selector .vab-crumbs i{font-style:normal;opacity:.5}
selector .vab-crumbs span{color:#141414}
selector .vab-tag{display:inline-flex;align-items:center;padding:7px 12px;border-radius:6px;background:${G};color:#fff;font-size:14px;font-weight:500;line-height:1}
selector .vab-h2{margin:0;font-family:${H};font-weight:700;font-size:44px;line-height:1.1;color:#141414}
selector .vab-sub{margin:10px 0 0;font-size:19px;line-height:1.5;color:rgba(20,20,20,.72)}
selector .vab-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 30px;border-radius:12px;font-size:17px;font-weight:500;line-height:1;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}
selector .vab-btn svg{width:20px;height:20px;flex:none}
selector .vab-btn-green{background:${G};color:#fff}
selector .vab-btn-green:hover{background:#2C3624;color:#fff}
selector .vab-btn-line{border:1px solid #141414;color:#141414}
selector .vab-btn-line:hover{background:${G};border-color:${G};color:#fff}
selector .vab-btn-cream{background:${C};color:${G}}
selector .vab-btn-cream:hover{background:#fff;color:${G}}
/* hero */
selector .vab-hero{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:860px;margin:20px auto 0}
selector .vab-hero .vab-tag{margin-top:26px}
selector .vab-title{margin:16px 0 0;font-family:${H};font-weight:700;font-size:64px;line-height:1.05;color:#141414}
selector .vab-title b{color:${G};font-weight:inherit}
selector .vab-intro{margin:18px 0 0;max-width:700px;font-size:20px;line-height:1.55;color:rgba(20,20,20,.75)}
selector figure.vab-cover{margin:36px 0 0!important;padding:0;border-radius:16px;overflow:hidden}
selector .vab-cover img{display:block;width:100%;height:auto;aspect-ratio:16/7;object-fit:cover}
/* story */
selector .vab-story{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:72px;align-items:center;margin-top:110px}
selector .vab-story-t p{margin:18px 0 0;font-size:19px;line-height:1.75;color:rgba(20,20,20,.85)}
selector .vab-story-t p strong{font-weight:500;color:#141414}
selector .vab-story-t .vab-h2{margin-top:18px}
selector .vab-story-b{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
selector .vab-story-img{position:relative}
selector .vab-story-img img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:16px}
selector .vab-badge{position:absolute;bottom:24px;right:-28px;display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:12px;background:#fff;box-shadow:0 18px 40px -18px rgba(20,20,20,.35)}
selector .vab-badge b{font-family:${H};font-size:34px;line-height:1;color:${G}}
selector .vab-badge span{font-size:15px;line-height:1.3}
selector .vab-badge i{display:block;font-style:normal;color:#E7A93B;letter-spacing:1px;font-size:14px}
/* numbers */
selector .vab-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin-top:110px;padding:44px 24px;border-radius:16px;background:${G};color:${C};text-align:center}
selector .vab-num{padding:0 12px;border-inline-start:1px solid rgba(255,251,233,.22)}
selector .vab-num:first-child{border-inline-start:0}
selector .vab-num b{display:block;font-family:${H};font-size:52px;font-weight:700;line-height:1}
selector .vab-num span{display:block;margin-top:10px;font-size:17px;line-height:1.35;color:rgba(255,251,233,.85)}
/* values */
selector .vab-vals{margin-top:110px;text-align:center}
selector .vab-vgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:40px;text-align:right}
selector .vab-val{padding:28px 26px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vab-val-i{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C};color:${G}}
selector .vab-val-i svg{width:26px;height:26px}
selector .vab-val h3{margin:20px 0 0;font-family:${H};font-size:24px;font-weight:700;line-height:1.2}
selector .vab-val p{margin:10px 0 0;font-size:16px;line-height:1.6;color:rgba(20,20,20,.75)}
/* gallery */
selector .vab-gal{margin-top:110px}
selector .vab-gal-h{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
selector .vab-ggrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:220px;grid-auto-flow:dense;gap:16px;margin-top:36px}
selector .vab-ggrid figure{margin:0;border-radius:12px;overflow:hidden}
selector .vab-ggrid figure:nth-child(1){grid-row:span 2}
selector .vab-ggrid figure:nth-child(4){grid-row:span 2}
selector .vab-ggrid figure:nth-child(7),selector .vab-ggrid figure:nth-child(8){grid-column:span 2}
selector .vab-ggrid img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.16,1,.3,1)}
selector .vab-ggrid figure:hover img{transform:scale(1.04)}
/* reviews */
selector .vpa-revs{margin-top:110px}
selector .vpa-revs .vpa-h2{margin:0;text-align:center;font-family:${H};font-weight:700;font-size:44px;line-height:1.1;color:#141414}
selector .vpa-sub{margin:10px 0 0;text-align:center;font-size:19px;color:rgba(20,20,20,.72)}
selector .vpa-ti{margin-top:32px;min-height:240px}
selector .vpa-ti .ti-widget,selector .vpa-ti .ti-widget *{font-family:${B}!important}
selector .vpa-ti .ti-widget .ti-inner.ti-inner.ti-inner{background-color:#fff!important}
/* visit */
selector .vab-visit{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:40px;align-items:stretch;margin-top:110px}
selector .vab-vcard{padding:40px;border:1px solid ${LINE};border-radius:16px;background:#fff}
selector .vab-vrow{display:flex;gap:14px;margin-top:22px;font-size:17px;line-height:1.5}
selector .vab-vrow svg{flex:none;width:22px;height:22px;margin-top:2px;color:${G}}
selector .vab-vrow b{display:block;font-weight:500}
selector .vab-vrow a{color:#141414}
selector .vab-vrow a:hover{color:${G};text-decoration:underline}
selector .vab-hours{width:100%;margin-top:6px;border-collapse:collapse;font-size:16px}
selector .vab-hours,selector .vab-hours tr,selector .vab-hours td{border:0!important;background:transparent!important}
selector .vab-hours td{padding:4px 0}
selector .vab-hours td:last-child{text-align:left;direction:ltr}
selector .vab-hours tr.is-closed td{opacity:.55}
selector .vab-vbtns{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
selector .vab-map{min-height:460px;border-radius:16px;overflow:hidden;border:1px solid ${LINE};background:#e9e6d8}
selector .vab-map iframe{display:block;width:100%;height:100%;min-height:460px;border:0}
/* closing */
selector .vab-cta{margin-top:110px;padding:64px 32px;border-radius:16px;background:${G};color:${C};text-align:center}
selector .vab-cta .vab-h2{color:${C}}
selector .vab-cta p{margin:12px auto 0;max-width:560px;font-size:19px;line-height:1.55;color:rgba(255,251,233,.85)}
selector .vab-cta .vab-story-b{justify-content:center}
selector .vab-cta .vab-btn-line{border-color:rgba(255,251,233,.6);color:${C}}
selector .vab-cta .vab-btn-line:hover{background:rgba(255,251,233,.1);border-color:${C};color:${C}}
@media(max-width:1024px){
selector .vab-story,selector .vab-visit{grid-template-columns:minmax(0,1fr);gap:40px}
selector .vab-badge{right:16px}
selector .vab-nums{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:32px}
selector .vab-num:nth-child(3){border-inline-start:0}
selector .vab-vgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
selector .vab-ggrid{grid-template-columns:repeat(3,minmax(0,1fr))}

}
@media(max-width:767px){
selector{padding:16px 0 72px}
selector .vab-crumbs{font-size:14px}
selector .vab-title{font-size:38px}
selector .vab-intro{font-size:17px}
selector figure.vab-cover{margin-top:24px!important;border-radius:12px}
selector .vab-cover img{aspect-ratio:4/3}
selector .vab-h2,selector .vpa-revs .vpa-h2{font-size:32px}
selector .vab-sub,selector .vpa-sub{font-size:16px}
selector .vab-story,selector .vab-nums,selector .vab-vals,selector .vab-gal,selector .vpa-revs,selector .vab-visit,selector .vab-cta{margin-top:72px}
selector .vab-story-t p{font-size:17px}
selector .vab-story-b .vab-btn{flex:1 1 100%}
selector .vab-nums{padding:32px 12px}
selector .vab-num b{font-size:38px}
selector .vab-num span{font-size:15px}
selector .vab-vgrid{grid-template-columns:minmax(0,1fr);gap:14px}
selector .vab-val{padding:22px}
selector .vab-gal-h{flex-direction:column;align-items:flex-start}
selector .vab-ggrid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:160px;gap:10px}
selector .vab-ggrid figure:nth-child(4),selector .vab-ggrid figure:nth-child(8){grid-row:auto;grid-column:auto}
selector .vab-vcard{padding:26px}
selector .vab-vbtns .vab-btn{flex:1 1 100%}
selector .vab-map,selector .vab-map iframe{min-height:340px}
selector .vab-cta{padding:44px 20px}
}`;

const hero = `<header class="vab-hero">
<nav class="vab-crumbs" aria-label="פירורי לחם"><a href="/">דף הבית</a><i aria-hidden="true">›</i><span>אודות</span></nav>
<span class="vab-tag">אודות</span>
<h1 class="vab-title">נעים להכיר, <b>ונוס קיסריה</b></h1>
<p class="vab-intro">חנות בוטיק לפרחים ומתנות במרכז המסחרי C-CENTER בקיסריה. אנחנו מעצבים כל זר ביד, ושולחים אותו עם חיוך לקיסריה ולכל הסביבה.</p>
</header>
<figure class="vab-cover">[vns_img id="2279" size="full" eager="1" sizes="(max-width:1300px) 92vw, 1240px" alt="זר פרחים מהחנות של ונוס קיסריה"]</figure>`;

const story = `<section class="vab-story" aria-label="הסיפור שלנו">
<div class="vab-story-t">
<span class="vab-tag">הסיפור שלנו</span>
<h2 class="vab-h2">כל זר מתחיל בשיחה</h2>
<p>ונוס קיסריה היא חנות פרחים ומתנות בלב המרכז המסחרי C-CENTER בקיסריה. אצלנו כל הזמנה מתחילה בכמה שאלות פשוטות: למי הזר, לאיזה רגע, ומה אתם רוצים שירגישו כשיפתחו את הדלת.</p>
<p>אנחנו עובדים עם <strong>פרחים טריים שמגיעים אלינו מדי יום</strong>, ומעצבים כל הזמנה ביד – מזר קטן ליום רגיל ועד עיצוב פרחים מלא לחתונה. לצד הפרחים תמצאו עציצים וסחלבים, מארזי שוקולד ואלכוהול, נרות, בלונים ואגרטלים, כדי שתוכלו להרכיב מתנה שלמה במקום אחד.</p>
<p>אפשר להזמין באתר ולקבל <strong>משלוח תוך כמה שעות</strong> לקיסריה ולכל הסביבה, או לקפוץ לחנות, להריח את הפרחים ולבחור יחד איתנו. מבטיחים שתצאו עם חיוך.</p>
<div class="vab-story-b"><a class="vab-btn vab-btn-green" href="${SHOP}">לחנות שלנו</a><a class="vab-btn vab-btn-line" href="${WA}" target="_blank" rel="noopener">${svg('<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>')}לדבר איתנו בוואטסאפ</a></div>
</div>
<div class="vab-story-img">[vns_img id="1797" size="large" sizes="(max-width:1024px) 92vw, 520px" alt="זר פרחים בעבודת יד של ונוס קיסריה"]
<div class="vab-badge"><b>5.0</b><span><i>★★★★★</i>דירוג הלקוחות<br>שלנו בגוגל</span></div></div>
</section>`;

const nums = `<section class="vab-nums" aria-label="ונוס במספרים">
<div class="vab-num"><b>5.0</b><span>דירוג בגוגל</span></div>
<div class="vab-num"><b>כ־5</b><span>שעות מההזמנה<br>ועד הדלת</span></div>
<div class="vab-num"><b>17</b><span>יישובים<br>במשלוח</span></div>
<div class="vab-num"><b>6</b><span>ימים בשבוע<br>פתוחים בשבילכם</span></div>
</section>`;

const vals = [
  ['<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19c3-4 6-7 10-9"/>', 'פרחים טריים מדי יום', 'סחורה חדשה מגיעה אלינו כל יום, ואנחנו בוחרים כל גבעול בעצמנו כדי שהזר יחזיק מעמד.'],
  ['<path d="M12 21c-4-3-8-6.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4.5-4 8-8 11z"/>', 'עיצוב אישי ביד', 'אין שני זרים זהים. כל הזמנה נשזרת ביד, לפי האירוע, הצבעים והאדם שמקבל אותה.'],
  ['<path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.2A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/>', 'שירות אישי', 'מתלבטים? כתבו לנו בוואטסאפ, ונעזור לבחור מתנה שמתאימה בדיוק לתקציב ולרגע.'],
  ['<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>', 'משלוח מהיר', 'הזמנות יוצאות תוך כמה שעות לקיסריה ולכל הסביבה, ובקיסריה המשלוח חינם מ־₪200.'],
];
const values = `<section class="vab-vals" aria-label="מה חשוב לנו">
<span class="vab-tag">מה חשוב לנו</span>
<h2 class="vab-h2" style="margin-top:18px">הדברים הקטנים שעושים את ההבדל</h2>
<div class="vab-vgrid">${vals.map(([d, t, p]) => `<div class="vab-val"><span class="vab-val-i">${svg(d)}</span><h3>${t}</h3><p>${p}</p></div>`).join('')}</div>
</section>`;

const galIds = [1796, 2020, 1801, 1949, 1990, 1788, 2329, 1803];
const gallery = `<section class="vab-gal" aria-label="מהעבודות שלנו">
<div class="vab-gal-h"><div><span class="vab-tag">מהסטודיו</span><h2 class="vab-h2" style="margin-top:18px">קצת מהעבודות שלנו</h2><p class="vab-sub">כל הזרים בתמונות עוצבו אצלנו בחנות.</p></div><a class="vab-btn vab-btn-line" href="${FLOWERS}">לכל הזרים בחנות</a></div>
<div class="vab-ggrid">${galIds.map((id) => `<figure>[vns_img id="${id}" size="medium_large" sizes="(max-width:767px) 46vw, 310px" alt="זר פרחים של ונוס קיסריה"]</figure>`).join('')}</div>
</section>`;

const pin = svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>');
const clock = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
const phone = svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>');
const mail = svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>');
const visit = `<section class="vab-visit" aria-label="בואו לבקר">
<div class="vab-vcard">
<span class="vab-tag">בואו לבקר</span>
<h2 class="vab-h2" style="margin-top:18px">מחכים לכם בחנות</h2>
<div class="vab-vrow">${pin}<div><b>הכתובת</b>הרקיע 1, מרכז מסחרי C-CENTER, קיסריה</div></div>
<div class="vab-vrow">${clock}<div style="flex:1"><b>שעות פתיחה</b><table class="vab-hours"><tbody>
<tr><td>ראשון</td><td>10:00–17:00</td></tr><tr><td>שני–חמישי</td><td>09:00–18:30</td></tr><tr><td>שישי</td><td>08:30–14:30</td></tr><tr class="is-closed"><td>שבת</td><td>סגור</td></tr>
</tbody></table></div></div>
<div class="vab-vrow">${phone}<div><b>טלפון / וואטסאפ</b><a href="tel:+972532791444">053-279-1444</a></div></div>
<div class="vab-vrow">${mail}<div><b>מייל</b><a href="mailto:venuscaesarea@gmail.com">venuscaesarea@gmail.com</a></div></div>
<div class="vab-vbtns"><a class="vab-btn vab-btn-green" href="https://waze.com/ul?q=${MAPQ}&navigate=yes" target="_blank" rel="noopener">ניווט בוויז</a><a class="vab-btn vab-btn-line" href="${WA}" target="_blank" rel="noopener">כתבו לנו בוואטסאפ</a></div>
</div>
<div class="vab-map"><iframe title="מפה – ונוס קיסריה" src="https://www.google.com/maps?q=${MAPQ}&hl=he&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
</section>`;

const cta = `<section class="vab-cta" aria-label="להזמנה">
<h2 class="vab-h2">מוכנים לשמח מישהו?</h2>
<p>בחרו זר, עציץ או מארז באתר, ואנחנו נדאג שהוא יגיע מושלם – היום.</p>
<div class="vab-story-b"><a class="vab-btn vab-btn-cream" href="${SHOP}">לחנות שלנו</a><a class="vab-btn vab-btn-line" href="${WA}" target="_blank" rel="noopener">התייעצות בוואטסאפ</a></div>
</section>`;

let n = 0;
const sc = (code) => ({ id: 'vab' + (++n).toString(36), elType: 'widget', widgetType: 'shortcode', isInner: false, settings: { shortcode: code }, elements: [] });
const pad0 = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const elements = [{
  id: 'vabroot', elType: 'container', isInner: false,
  settings: { content_width: 'full', flex_direction: 'column', padding: pad0, css_classes: 'vab', custom_css: css },
  elements: [sc(hero), sc(story), sc(nums), sc(values), sc(gallery), sc('[vns_pa_reviews]'), sc(visit), sc(cta)],
}];
fs.writeFileSync(path.join(ROOT, 'wp/about-page.json'), JSON.stringify(elements));
console.log('ok', JSON.stringify(elements).length);
