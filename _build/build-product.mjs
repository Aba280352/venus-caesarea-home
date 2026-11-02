// Generates pages/product.html – the single product page (Elementor: Theme Builder › Single Product).
// Real data comes from the store snapshot (_build/site-data.json); the review cards are the ones already on the homepage.
//   node _build/build-product.mjs && node _build/build-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, '_build/site-data.json'), 'utf8'));
const BASE = 'https://venus-caesarea.net';
const has = (f) => fs.existsSync(path.join(ROOT, f));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shek = (n) => '₪' + Number(n).toLocaleString('en-US');
const url = (href) => BASE + encodeURI(href);

// ---------- the product shown on the preview ----------
const P = data.products.find((p) => p.id === 1336); // זר חרציות ענק – on sale, 4 photos
const price = Number(P.price), reg = Number(P.reg), saving = reg - price;
const gallery = ['g1', 'g2', 'g3', 'g4'].map((g) => `./assets/product/${g}.jpg`);
const productUrl = url(P.href);
const waShare = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(`${P.n} – ונוס קיסריה\n${productUrl}`);

// ---------- add-ons (real products) ----------
const ADDONS = [
  { id: 2150, n: 'בלון לב לבן ״מלך שלי״', price: 35, img: './assets/product/2150.jpg' },
  { id: 2146, n: 'בלון לב אדום ״לב שלי״', price: 40, img: './assets/product/2146.jpg' },
  { id: 2144, n: 'בלון לב לבן־ורוד מטאלי', price: 45, img: './assets/product/2144.jpg' },
  { id: 2138, n: 'בלון תודה ורוד לבן', price: 35, img: './assets/product/2138.jpg' },
  { id: 1523, n: 'שמפניית שוקולדים', price: 75, img: './assets/shop/1523.jpg' }
];
const VASES = [
  { id: 918, n: 'ואזה ארוכה פתח צר', price: 60, img: './assets/shop/918.jpg' },
  { id: 923, n: 'ואזה פתח רחב', price: 75, img: './assets/shop/923.jpg' },
  { id: 1195, n: 'כלי קרמיקה לבן שתי ידיות', price: 100, img: './assets/shop/1195.jpg' }
];
const addon = (a) => `<label class="pd-add">
<input type="checkbox" class="pd-add-in" data-price="${a.price}" aria-label="הוספת ${esc(a.n)}">
<span class="pd-add-img"><img src="${a.img}" alt="" loading="lazy" draggable="false"></span>
<span class="pd-add-name">${esc(a.n)}</span>
<span class="pd-add-row"><span class="pd-add-price">${shek(a.price)}</span><span class="pd-add-btn" aria-hidden="true"><i></i></span></span>
</label>`;

// ---------- related products (same category, in stock, with photos) ----------
const rel = data.products
  .filter((p) => p.cats.includes('פרחים') && p.stock === 'instock' && p.id !== P.id && has(`assets/shop/${p.id}.jpg`))
  .sort((a, b) => b.sales - a.sales || Number(b.price) - Number(a.price)).slice(0, 8);
const card = (p) => `<a href="${url(p.href)}" class="rec-card"><div class="rec-img"><img class="a" src="./assets/shop/${p.id}.jpg" alt="" draggable="false">${has(`assets/shop/${p.id}-b.jpg`) ? `<img class="b" src="./assets/shop/${p.id}-b.jpg" alt="" draggable="false">` : ''}<span class="rec-btn rl"><span class="rl-in"><span>הוספה לעגלה</span><span aria-hidden="true">הוספה לעגלה</span></span></span></div><div class="rec-row"><span class="rec-name">${esc(p.n)}</span><span class="rec-price">${shek(p.price)}</span></div></a>`;
const arrows = fs.readFileSync(path.join(ROOT, 'sections/04-bestsellers.html'), 'utf8').match(/<button type="button" class="pcar-arrow l"[\s\S]*?<\/button>\s*<button type="button" class="pcar-arrow r"[\s\S]*?<\/button>/)[0];

// ---------- reviews: reuse the Google reviews already on the homepage ----------
const reviews = JSON.parse(fs.readFileSync(path.join(ROOT, 'sections/10-reviews.html'), 'utf8').match(/dg-data">(\[[\s\S]*?\])<\/script>/)[1]).slice(0, 3);
const review = (r) => `<figure class="pd-rev"><div class="pd-rev-top"><span class="pd-rev-av" style="background:${r.color || '#3A4831'}">${esc(r.initial || r.name[0])}</span><div><b>${esc(r.name)}</b><small>${esc(r.when)} · Google</small></div></div><div class="pd-stars" aria-label="5 מתוך 5">${esc(r.stars || '★★★★★')}</div><blockquote>${esc(r.text)}</blockquote></figure>`;

// ---------- icons ----------
const ic = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19c3-4 6-7 10-9"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.2A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-3.7-.9-3.1-1.3-5-4.4-5.2-4.6-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.8 2.1 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
};

// ---------- copy (shipping + cancellation text follows the store's תקנון) ----------
const FAQ = [
  ['כמה זמן לוקח משלוח?', 'ההזמנות מסופקות תוך כ־5 שעות מרגע אישור ההזמנה, בשעות הפעילות. הזמנות ביום ראשון עד חמישי נקלטות עד 18:00, ובימי שישי וערבי חג עד 13:00. הזמנה שמתקבלת אחרי השעות האלה תסופק ביום העסקים הבא.'],
  ['לאילו יישובים אתם שולחים?', 'קיסריה, פרדס חנה־כרכור, אור עקיבא, אור ים, זכרון יעקב, עין שמר, שדות ים, בית חנינה, מעגן מיכאל, חריש, בנימינה־גבעת עדה, משמרות, גן שלמה, עין עירון, גן שומרון, תלמי אלעזר וגן שמואל.'],
  ['כמה עולה משלוח?', 'בקיסריה המשלוח עולה ₪20 וחינם בהזמנה מ־₪200. ביישובים האחרים ₪35 וחינם בהזמנה מ־₪250.'],
  ['אפשר להזמין ליום אחר?', 'כן, אפשר להזמין מראש לאספקה ביום אחר. ביטול של הזמנה כזו אפשרי עד 5 שעות לפני מועד האספקה. לבקשות מיוחדות כתבו לנו בוואטסאפ ונסתדר.'],
  ['הפרחים יהיו בדיוק כמו בתמונה?', 'כל זר נארז ביד, ולכן זני וצבעי הפרחים עשויים להשתנות לפי העונה והמלאי בחנות. אם יש לכם בקשה לעיצוב או לגוונים, מומלץ לפנות אלינו בעת ההזמנה.'],
  ['אפשר להוסיף כרטיס ברכה?', 'בטח. כרטיסי ברכה, בלונים ושוקולדים מופיעים בחנות ואפשר להוסיף אותם להזמנה. את נוסח הברכה אפשר לכתוב לנו בהזמנה או בוואטסאפ.'],
  ['איך שומרים על הזר טרי?', 'חותכים כשני סנטימטרים מהגבעולים באלכסון, מניחים באגרטל עם מים נקיים וקרירים, ומחליפים מים כל יומיים־שלושה. הכי טוב הרחק משמש ישירה ומקור חום.'],
  ['אפשר לבטל או לשנות הזמנה?', 'אפשר לבטל תוך שעה מאישור ההזמנה, כל עוד היא עוד לא יצאה למשלוח. ביטול שלא נובע מפגם יחויב בדמי ביטול של 5% מערך ההזמנה או ₪100, הנמוך מביניהם. פרחים שיצאו ליעד אי אפשר לבטל, כי זה מוצר מתכלה.']
];
const faq = FAQ.map(([q, a], i) => `<div class="pd-faq-i"><button type="button" class="pd-faq-q" aria-expanded="false" aria-controls="pd-faq-${i}">${esc(q)}${ic.chev}</button><div class="pd-faq-a" id="pd-faq-${i}" hidden><p>${esc(a)}</p></div></div>`).join('\n');

const html = `<div class="vns acc-on vns-sec">
<article class="pd" aria-label="${esc(P.n)}">

<nav class="pd-crumbs" aria-label="פירורי לחם"><a href="${BASE}/">דף הבית</a><i aria-hidden="true">›</i><a href="${BASE}/shop/">חנות</a><i aria-hidden="true">›</i><a href="${BASE}/product-category/%D7%A4%D7%A8%D7%97%D7%99%D7%9D/">פרחים</a><i aria-hidden="true">›</i><span aria-current="page">${esc(P.n)}</span></nav>

<div class="pd-top">
<div class="pd-gal">
<div class="pd-main" id="pd-main"><span class="pd-badge">מבצע</span><img src="${gallery[0]}" alt="${esc(P.n)}" draggable="false"></div>
<div class="pd-thumbs" role="tablist" aria-label="גלריית תמונות">
${gallery.map((g, i) => `<button type="button" class="pd-th${i ? '' : ' is-on'}" data-src="${g}" aria-label="תמונה ${i + 1}"><img src="${g}" alt="" loading="lazy" draggable="false"></button>`).join('\n')}
</div>
</div>

<div class="pd-info">
<h1 class="pd-title">${esc(P.n)}</h1>
<p class="pd-short">זר חרציות מפואר ומפנק במיוחד.</p>
<div class="pd-price-row"><span class="pd-price" data-base="${price}">${shek(price)}</span><span class="rec-old">${shek(reg)}</span><span class="pd-save">חסכון של ${shek(saving)}</span></div>
<p class="pd-note">* צבעי הפרחים עלולים להשתנות על פי העונה ועל פי המלאי בחנות.</p>

<div class="pd-buy">
<div class="pd-qty" role="group" aria-label="כמות"><button type="button" class="pd-q-m" aria-label="הפחתת כמות">${ic.minus}</button><input class="pd-q-in" type="text" inputmode="numeric" value="1" aria-label="כמות"><button type="button" class="pd-q-p" aria-label="הוספת כמות">${ic.plus}</button></div>
<button type="button" class="pd-cta" id="pd-cta"><span class="pd-cta-t">הוספה לעגלה</span><span class="pd-cta-sum">· <b data-total>${shek(price)}</b></span></button>
</div>
<a class="pd-share" href="${waShare}" target="_blank" rel="noopener">${ic.wa}<span>שיתוף בוואטסאפ</span></a>

<ul class="pd-perks">
<li><span class="pd-perk-i">${ic.leaf}</span><span>פרחים טריים<br>מדי יום</span></li>
<li><span class="pd-perk-i">${ic.chat}</span><span>שירות אישי<br>בוואטסאפ</span></li>
<li><span class="pd-perk-i">${ic.truck}</span><span>משלוח חינם<br>בקיסריה מ־₪200</span></li>
<li><span class="pd-perk-i">${ic.shield}</span><span>תשלום<br>מאובטח</span></li>
</ul>
</div>
</div>

<section class="pd-adds" aria-label="תוספות להזמנה">
<h2 class="pd-h2">תוספות שתמיד כיף לקבל</h2>
<p class="pd-sub">כי אם כבר מפנקים – אז עד הסוף</p>
<div class="pd-add-grid">
${ADDONS.map(addon).join('\n')}
</div>
</section>

<section class="pd-adds" aria-label="אגרטלים">
<h2 class="pd-h2">אגרטלים לחוויה מקסימלית</h2>
<p class="pd-sub">הזר מגיע, והאגרטל כבר מחכה</p>
<div class="pd-add-grid pd-add-grid-3">
${VASES.map(addon).join('\n')}
</div>
</section>

<section class="pd-tabs-sec" aria-label="פרטים נוספים">
<div class="pd-tabs" role="tablist"><button type="button" role="tab" class="pd-tab is-on" aria-selected="true" aria-controls="pd-p0">תיאור</button><button type="button" role="tab" class="pd-tab" aria-selected="false" aria-controls="pd-p1">משלוחים ומדיניות ביטולים</button></div>
<div class="pd-panel" id="pd-p0" role="tabpanel">
<p>זר חרציות מפואר ומפנק במיוחד.</p>
<p>צבעי הפרחים עלולים להשתנות על פי העונה ועל פי המלאי בחנות.</p>
<p>רוצים לשנות את הצבעים או להוסיף משהו לזר? כתבו לנו בוואטסאפ <a href="https://api.whatsapp.com/send?phone=972532791444">053-279-1444</a> ונתאים אותו בשבילכם.</p>
</div>
<div class="pd-panel" id="pd-p1" role="tabpanel" hidden>
<h3>משלוחים</h3>
<ul>
<li>קיסריה: ₪20, וחינם בהזמנה מ־₪200. יישובים אחרים: ₪35, וחינם בהזמנה מ־₪250.</li>
<li>אספקה תוך כ־5 שעות מאישור ההזמנה. הזמנות עד 18:00 (א׳–ה׳) ועד 13:00 בימי שישי וערבי חג, ואחר כך ביום העסקים הבא.</li>
<li>רכישה מינימלית באתר: ₪80, לא כולל דמי משלוח.</li>
</ul>
<h3>ביטולים</h3>
<ul>
<li>אפשר לבטל הזמנה תוך שעה מאישורה, כל עוד היא לא יצאה למשלוח. הזמנה ליום אחר אפשר לבטל עד 5 שעות לפני האספקה.</li>
<li>ביטול שלא נובע מפגם או אי־התאמה: דמי ביטול של 5% מערך ההזמנה או ₪100, הנמוך מביניהם.</li>
<li>פרחים שיצאו ליעד אי אפשר לבטל, כי זה מוצר מתכלה.</li>
<li>טענה לפגם או לאי־טריות: מודיעים לנו עד 24 שעות מקבלת ההזמנה. ההודעה בוואטסאפ, בטלפון או בדוא״ל.</li>
</ul>
</div>
</section>

<section class="pd-promise" aria-label="ההבטחה שלנו">
<div class="pd-pr"><span class="pd-perk-i">${ic.leaf}</span><b>פרחים טריים</b><span>נבחרים ביד, כל בוקר מחדש</span></div>
<div class="pd-pr"><span class="pd-perk-i">${ic.chat}</span><b>שירות אישי</b><span>עונים בטלפון ובוואטסאפ</span></div>
<div class="pd-pr"><span class="pd-perk-i">${ic.shield}</span><b>לא מרוצים? מדברים</b><span>מודיעים לנו עד 24 שעות ומוצאים פתרון</span></div>
</section>

<section class="pd-revs" aria-label="ביקורות לקוחות">
<h2 class="pd-h2">מה הלקוחות שלנו אומרים</h2>
<p class="pd-sub">ביקורות מגוגל</p>
<div class="pd-rev-grid">
${reviews.map(review).join('\n')}
</div>
</section>

<section class="pd-faq" aria-label="שאלות נפוצות">
<h2 class="pd-h2">שאלות ותשובות</h2>
<div class="pd-faq-l">
${faq}
</div>
</section>

<section class="pcar-sec pd-rel" aria-label="מוצרים נוספים שיאהבו">
<h2 class="rec-title">אולי תאהבו גם</h2>
<div class="pcar-wrap">
${arrows}
<div class="pcar"><div class="pcar-track">${rel.map(card).join('')}</div></div>
</div>
</section>

<div class="pd-bar" id="pd-bar"><div class="pd-bar-in"><span class="pd-bar-name">${esc(P.n)}</span><button type="button" class="pd-cta pd-cta-bar"><span class="pd-cta-t">הוספה לעגלה</span><span class="pd-cta-sum">· <b data-total>${shek(price)}</b></span></button></div></div>
</article>
</div>
`;
fs.writeFileSync(path.join(ROOT, 'pages/product.html'), html);
console.log('Built pages/product.html (' + (html.length / 1024).toFixed(1) + ' KB)');
