// Replaces the sketch's placeholder content (products, prices, links, contact details, articles)
// with a read-only snapshot of the live store, `site-data.json`.
// Used by build.mjs. Also records which product images have to be downloaded (image-manifest.json).
import fs from 'node:fs';
import path from 'node:path';

const dir = import.meta.dirname;
export const data = JSON.parse(fs.readFileSync(path.join(dir, 'site-data.json'), 'utf8'));
export const BASE = data.site;
const P = data.products.map((p) => ({ ...p, name: p.n }));
const byId = Object.fromEntries(P.map((p) => [p.id, p]));

// ---------- helpers ----------
const url = (p) => BASE + encodeURI(p);
const cat = (name) => url(data.catLinks[name]);
const money = (v) => '₪' + Number(v);
const ok = (p) => p.img && Number(p.price) > 0;
const inStock = (p) => ok(p) && p.stock === 'instock';
const inCat = (p, ...c) => p.cats.some((x) => c.includes(x));
const bySales = (a, b) => b.sales - a.sales || Number(b.price) - Number(a.price);
const byPriceDesc = (a, b) => Number(b.price) - Number(a.price);
const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);
const ext = (u) => ((u.match(/\.(jpe?g|png|webp)(?:\?|$)/i) || [, 'jpg'])[1]).toLowerCase();

export const manifest = {};
const local = (p, second) => {
  const u = second ? p.gal : p.img;
  const f = `assets/shop/${p.id}${second ? '-b' : ''}.jpg`; // PNG sources are converted to JPEG by fetch-images.mjs
  manifest[f] = u;
  return './' + f;
};
const asset = (u, name) => { const f = `assets/shop/${name}.jpg`; manifest[f] = u; return './' + f; };

// the card shows a second photo on hover: the product's own gallery image, otherwise its neighbour's photo
const view = (p, next, badge = '') => ({
  name: p.name,
  price: money(p.price),
  old: p.on_sale && p.reg && Number(p.reg) > Number(p.price) ? money(p.reg) : '',
  img: local(p), pos: '50% 50%',
  img2: p.gal ? local(p, true) : local(next), pos2: '50% 50%',
  badge, href: url(p.href)
});
const list = (arr, badge) => arr.map((p, i) => view(p, arr[(i + 1) % arr.length], badge));

// in stock first; a tab with fewer than 8 in-stock items is topped up with out-of-stock ones so the grid is not sparse
const pickTab = (pool) => {
  const sorted = pool.filter(ok).sort(bySales);
  const stocked = sorted.filter(inStock);
  if (stocked.length < 8) return stocked.concat(sorted.filter((p) => !inStock(p))).slice(0, 8);
  return stocked.slice(0, Math.min(12, Math.floor(stocked.length / 4) * 4));
};
const padTo = (arr, pool, n) => { const seen = new Set(arr.map((p) => p.id)); return arr.concat(pool.filter((p) => !seen.has(p.id))).slice(0, n); };

const stocked = P.filter(inStock);
const KEEP_NUMBERS = new Set(['מספר 1 קשת', 'מספר 0 כסף']);

const tabPools = [
  { pool: P.filter((p) => inCat(p, 'פרחים') && !/קונוס|טנא/.test(p.name)), href: cat('פרחים') },
  { pool: P.filter((p) => inCat(p, 'צמחים וסחלבים')), href: cat('צמחים וסחלבים') },
  { pool: P.filter((p) => inCat(p, 'נרות', 'ואזות וכלים') && Number(p.price) >= 20), href: cat('נרות') },
  { pool: P.filter((p) => inCat(p, 'בלונים וכרטיסי ברכה') && !/^בלון גומי/.test(p.name) && (!/^מספר/.test(p.name) || KEEP_NUMBERS.has(p.name))), href: cat('בלונים וכרטיסי ברכה') },
  { pool: P.filter((p) => inCat(p, 'חתונות')), href: cat('חתונות') },
  { pool: P.filter((p) => inCat(p, 'אלכוהול ושוקולד', 'מארזים')), href: cat('אלכוהול ושוקולד') }
];

// bouquet-only photos for the delivery-area cards (no vases, tables or plants), picked by eye from the store catalogue
const CITY_PHOTOS = [1541, 1215, 1217, 1214, 1314, 1282, 821, 1786, 1269];

const shipText = (caesarea) => {
  const s = caesarea ? data.shipping.caesarea : data.shipping.other;
  return `משלוח ₪${s.cost}, חינם בהזמנה מעל ₪${s.freeFrom}.`;
};

// label → url, applied to the dropdowns and to the footer link lists
const LINKS = {
  'פרחים': cat('פרחים'), 'צמחים וסחלבים': cat('צמחים וסחלבים'), 'נרות': cat('נרות'),
  'נרות ואזות וכלים': cat('נרות'), 'אגרטלים וכלים': cat('ואזות וכלים'), 'ואזות וכלים': cat('ואזות וכלים'),
  'בלונים וכרטיסי ברכה': cat('בלונים וכרטיסי ברכה'), 'חתונות': cat('חתונות'), 'חתונות ואירועים': cat('חתונות'),
  'מארזי אלכוהול ושוקולדים': cat('אלכוהול ושוקולד'),
  'עיצוב במות לאירועים': url(data.posts.stage), 'עיצוב חופה': url(data.posts.chuppah),
  'קישוט רכב לחתונה': url(byId[1456].href), 'זרי כלה': cat('חתונות'),
  'כל החנות': url(data.pages.shop), 'תקנון האתר': url(data.pages.terms), 'הצהרת נגישות': url(data.pages.accessibility),
  'צור קשר': url(data.pages.contact), 'המגזין': url(data.pages.blog), 'קיסריה': '#areas'
};
for (const [city, p] of Object.entries(data.deliveryPosts)) LINKS[city] = url(p);
const BUDGET = [['עד ₪100', 'max_price=100', 909], ['עד ₪200', 'max_price=200', 775], ['עד ₪300', 'max_price=300', 1544], ['עד ₪400', 'max_price=400', 1336], ['עד ₪500', 'max_price=500', 1798], ['₪500 ומעלה', 'min_price=500', 1804]];
for (const [label, q] of BUDGET) LINKS[label] = url(data.pages.shop) + '?' + q;
const CITY_HREF = { '#city-caesarea': '#areas', '#city-pardes-hanna': 'פרדס חנה', '#city-karkur': 'כרכור', '#city-or-akiva': 'אור עקיבא', '#city-or-yam': 'אור ים', '#city-binyamina': 'בנימינה', '#city-givat-ada': 'גבעת עדה', '#city-zichron': 'זכרון יעקב', '#city-hadera': 'חדרה' };
const cityLink = (h) => (CITY_HREF[h] === '#areas' ? '#areas' : LINKS[CITY_HREF[h]] || h);

export function apply(vals, comp) {
  // --- המומלצים: טאבים לפי קטגוריות האמיתיות ---
  vals.recTabs.forEach((t, i) => { t.href = tabPools[i].href; });
  vals.recGrids = tabPools.map((t, i) => ({ items: list(pickTab(t.pool)), attr: i ? ' hidden' : '' }));
  vals.recHref = tabPools[0].href;

  // --- קרוסלות ---
  const best = padTo(stocked.filter((p) => Number(p.price) >= 40 && p.sales > 0).sort(bySales), stocked.filter((p) => Number(p.price) >= 40).sort(byPriceDesc), 8);
  vals.bestItems = list(best);
  vals.newItems = list(stocked.filter((p) => Number(p.price) >= 30 && !/^(מספר|בלון גומי)/.test(p.name)).sort(byDateDesc).slice(0, 8), 'חדש');
  vals.luxItems = list(stocked.filter((p) => inCat(p, 'פרחים') && Number(p.price) >= 250).sort(byPriceDesc).slice(0, 8));
  vals.brideItems = list(stocked.filter((p) => inCat(p, 'חתונות') && /^(זר כלה|חבקים|קישוט רכב)/.test(p.name)).sort(byPriceDesc).slice(0, 8));
  vals.dealItems = list(stocked.filter((p) => p.on_sale).sort(byPriceDesc), 'מבצע');

  // --- עיגולי קטגוריות ---
  vals.circles = [['פרחים', 1798], ['צמחים וסחלבים', 904], ['נרות', 912], ['ואזות וכלים', 923], ['בלונים וכרטיסי ברכה', 1434], ['חתונות', 1783], ['מארזים', 1442], ['אלכוהול ושוקולד', 1523]]
    .map(([name, id]) => ({ name, img: local(byId[id]), href: cat(name) }));

  // --- מסך פתיחה: כל שקופית מובילה לקטגוריה שלה ---
  vals.slides.forEach((s, i) => { s.href = LINKS[comp.cats[i].title] || cat('פרחים'); });

  // --- קנייה לפי תקציב ---
  vals.budget = BUDGET.map(([title, q, id]) => ({ title, img: local(byId[id]), pos: '50% 50%', href: LINKS[title] }));

  // --- אזורי משלוח ---
  vals.cities = comp.cities.map((c, i) => ({
    href: c.name === 'קיסריה' ? '#areas' : LINKS[c.name], img: local(byId[CITY_PHOTOS[i % CITY_PHOTOS.length]]), tag: 'אזור ' + String(i + 1).padStart(2, '0'),
    title: 'משלוח פרחים ל' + c.name, text: shipText(c.name === 'קיסריה')
  }));

  // --- מגזין ואינסטגרם ---
  vals.articles = data.articles.map((a, i) => ({ href: url(a.href), cat: a.cat, date: a.date, title: a.title, text: a.text, img: asset(a.img, 'post-' + (i + 1)), pos: '50% 50%' }));
  vals.igPosts = [1798, 1783, 1544, 1659, 1804, 1786, 1217, 775, 1336, 904, 912, 1434].map((id) => ({ href: data.contact.instagram + '/', img: local(byId[id]) }));

  // --- עגלה, פס יתרונות ---
  vals.cartItems = [775, 909].map((id) => ({ name: byId[id].name, qty: 'כמות: 1', price: money(byId[id].price) }));
  setTotal(money(Number(byId[775].price) + Number(byId[909].price)));
  vals.trust = [`משלוח חינם בקיסריה מ־₪${data.shipping.caesarea.freeFrom}`].concat(vals.trust.slice(1));

  // --- תפריט: קישורים אמיתיים, והתקציב זהה לסליידר ---
  vals.navItems.forEach((n) => {
    if (!n.hasMenu) return;
    if (n.label === 'קנייה לפי תקציב') n.links = BUDGET.map((b) => b[0]);
    n.links = n.links.map((label) => ({ label, href: LINKS[label] || '#' }));
  });
}

// text and link fixes on the rendered HTML of each block
export function post(html) {
  const c = data.contact;
  const lit = [
    ['<a href="#" class="hdr-cta rl"', `<a href="${cat('פרחים')}" class="hdr-cta rl"`],
    ['<a href="#" aria-label="ונוס קיסריה – לעמוד הבית"', `<a href="${BASE}/" aria-label="ונוס קיסריה – לעמוד הבית"`],
    ['<a href="#" class="icon-btn" aria-label="אזור אישי"', `<a href="${url(data.pages.account)}" class="icon-btn" aria-label="אזור אישי"`],
    ['href="#blog"', `href="${url(data.pages.blog)}"`],
    ['<a href="tel:000000000" dir="ltr" style="text-align:right">050-000-0000</a>', `<a href="tel:${c.phoneTel}" dir="ltr" style="text-align:right">${c.phoneDisplay}</a>`],
    ['<span>מתחם C CENTER, קיסריה</span>', `<span>${c.address}</span>`],
    ['<span>א׳–ה׳ 09:00–20:00 · ו׳ 08:00–15:00</span>', `<span>${c.hours}</span>`],
    ['query=C+Center+Caesarea', 'query=' + encodeURIComponent('הרקיע 1 קיסריה')],
    ['q=C%20Center%20Caesarea', 'q=' + encodeURIComponent('הרקיע 1 קיסריה')],
    ['<a href="#" aria-label="אינסטגרם">', `<a href="${c.instagram}" target="_blank" rel="noopener" aria-label="אינסטגרם">`],
    ['<a href="#" aria-label="פייסבוק">', `<a href="${c.facebook}" target="_blank" rel="noopener" aria-label="פייסבוק">`],
    ['<a href="#" aria-label="טיקטוק">', `<a href="${c.tiktok}" target="_blank" rel="noopener" aria-label="טיקטוק">`],
    ['<a href="#" aria-label="וואטסאפ">', `<a href="${c.whatsapp}" target="_blank" rel="noopener" aria-label="וואטסאפ">`],
    ['₪[סכום]', vals_total]
  ];
  for (const [a, b] of lit) html = html.split(a).join(b);
  html = html.replace(/href="(#city-[a-z-]+)"/g, (_, h) => `href="${cityLink(h)}"`);
  html = html.replace(/<a href="#"([^>]*)>(לעגלה|לקופה)<\/a>/g, (_, rest, label) => `<a href="${url(data.pages[label === 'לעגלה' ? 'cart' : 'checkout'])}"${rest}>${label}</a>`);
  // footer link lists: <li><a href="#">label</a></li>
  html = html.replace(/<li><a href="#">([^<]+)<\/a><\/li>/g, (m, label) => (LINKS[label] ? `<li><a href="${LINKS[label]}">${label}</a></li>` : m));
  html = html.replace(/<a href="#">(תקנון האתר|הצהרת נגישות)<\/a>/g, (m, label) => `<a href="${LINKS[label]}">${label}</a>`);
  return html;
}
let vals_total = '';
export const setTotal = (t) => { vals_total = t; };
