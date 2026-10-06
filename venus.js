/* Venus Caesarea – homepage interactions. Vanilla JS, no dependencies.
   Every module looks for its own section and exits quietly when it is not on the page,
   so the sections can be spread across Elementor widgets and Theme Builder templates.
   Optional settings: window.VENUS_CONFIG = { smoothScroll: false } before this file loads. */
(() => {
  'use strict';
  const CFG = Object.assign({ smoothScroll: true }, window.VENUS_CONFIG || {});
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const isPlaceholder = (el) => { const a = el && el.closest ? el.closest('a') : null; return !a || a.getAttribute('href') === '#'; };

  // ===== לולאות אינסופיות =====
  // משכפל את ילדי המסילה עד ש"סט" אחד רחב לפחות כמו החלון שלו, ואז מכפיל, כדי שהריצה תתחבר בלי קפיצה
  const fillLoop = (track, box) => {
    const base = [...track.children];
    if (!base.length) return 1;
    if (track.dataset.loop) return Number(track.dataset.loop);
    const copy = () => base.map((c) => {
      const k = c.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      [k, ...k.querySelectorAll('a,button')].forEach((x) => { if (x.matches('a,button')) x.tabIndex = -1; });
      return k;
    });
    const reps = Math.min(6, Math.max(1, Math.ceil((box.clientWidth || window.innerWidth) / (track.scrollWidth || 1))));
    for (let i = 1; i < reps * 2; i++) track.append(...copy());
    track.dataset.loop = String(reps);
    return reps;
  };
  const period = (track) => { const c = track.children; return c.length > 1 ? Math.abs(c[c.length / 2].offsetLeft - c[0].offsetLeft) : 0; };

  const loops = [];
  let loopTs = 0;
  const loopFrame = (ts) => {
    requestAnimationFrame(loopFrame);
    const dt = loopTs ? Math.min(0.05, (ts - loopTs) / 1000) : 0;
    loopTs = ts;
    for (const m of loops) {
      if (m.drag || !m.visible) continue;
      if (!m.stopped && !reduce) m.off += m.speed * dt;
      if (Math.abs(m.kick) > 0.5) { const d = m.kick * 0.1; m.off += d; m.kick -= d; }
      m.apply();
    }
  };
  const seen = window.IntersectionObserver ? new IntersectionObserver((es) => es.forEach((e) => { const m = loops.find((x) => x.el === e.target); if (m) m.visible = e.isIntersecting; }), { rootMargin: '200px' }) : null;

  // מסילה שרצה לבד, נגררת בעכבר/אצבע ומקבלת "דחיפה" מהחיצים
  const marquee = (el, track, speed, clickPause) => {
    fillLoop(track, el);
    const m = { el, speed, off: 0, kick: 0, stopped: false, drag: null, moved: 0, visible: true };
    m.apply = () => { const h = period(track); if (!h) return; m.off = ((m.off % h) + h) % h; track.style.transform = 'translateX(' + m.off.toFixed(2) + 'px)'; };
    el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; m.drag = { x: e.clientX, id: e.pointerId, cap: false }; m.moved = 0; m.kick = 0; });
    el.addEventListener('pointermove', (e) => {
      if (!m.drag || e.pointerId !== m.drag.id) return;
      const dx = e.clientX - m.drag.x; m.drag.x = e.clientX; m.moved += Math.abs(dx);
      // לוכדים את המצביע רק אחרי שזזו באמת, אחרת הקליק על הקישור לא יגיע אליו
      if (!m.drag.cap && m.moved > 6) { m.drag.cap = true; el.classList.add('is-drag'); try { el.setPointerCapture(e.pointerId); } catch (_) {} }
      m.off += dx; m.apply();
    });
    const up = (e) => {
      if (!m.drag) return;
      m.drag = null; el.classList.remove('is-drag');
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      if (clickPause && e.type === 'pointerup' && m.moved <= 6 && isPlaceholder(e.target)) { m.stopped = !m.stopped; el.title = m.stopped ? 'לחיצה להמשך' : ''; }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', (e) => { if (m.moved > 6) { e.preventDefault(); e.stopPropagation(); m.moved = 0; } }, true);
    el.addEventListener('dragstart', (e) => e.preventDefault());
    loops.push(m);
    if (seen) seen.observe(el);
    if (loops.length === 1) requestAnimationFrame(loopFrame);
    return m;
  };

  // ===== פס היתרונות העליון =====
  const initTrust = () => $$('.vns .trust').forEach((el) => {
    const track = $('.trust-track', el);
    if (!track) return;
    const reps = fillLoop(track, el);
    if (reps > 1) track.style.animationDuration = (45 * reps) + 's';
  });

  // ===== הדר: דרופדאונים, חיפוש ועגלה =====
  const initMenus = () => {
    const btns = $$('.vns .site-hdr [aria-expanded]:not(.hdr-burger)');
    // תפריט המובייל: הכפתור פותח את הניווט כמגירה מתחת להדר
    const hdr = $('.vns .site-hdr'), burger = $('.vns .hdr-burger');
    if (hdr && burger) {
      const setMenu = (open) => { hdr.classList.toggle('is-menu-open', open); burger.setAttribute('aria-expanded', String(open)); };
      burger.addEventListener('click', () => setMenu(!hdr.classList.contains('is-menu-open')));
      document.addEventListener('click', (e) => { if (!e.target.closest('.site-hdr') || e.target.closest('.site-hdr nav a')) setMenu(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }
    if (!btns.length) return;
    const panelOf = (b) => { const n = b.nextElementSibling; return n && n.matches('.panel,.search-panel,.cart-panel') ? n : null; };
    const close = (except) => btns.forEach((b) => {
      if (b === except) return;
      const p = panelOf(b);
      if (p) p.hidden = true;
      b.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false');
    });
    btns.forEach((b) => b.addEventListener('click', () => {
      const p = panelOf(b);
      if (!p) return;
      const open = p.hidden;
      close(b);
      p.hidden = !open;
      b.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
      if (open) { const inp = $('input', p); if (inp) inp.focus(); }
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.site-hdr [aria-expanded],.site-hdr .panel,.site-hdr .search-panel,.site-hdr .cart-panel')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };

  // ===== מסך פתיחה: סליידר קטגוריות =====
  // ⚙️ data-auto על .vhero = שניות בין שקופיות (0 מבטל את ההחלפה האוטומטית)
  const initHero = () => $$('.vns .vhero').forEach((root) => {
    const slides = $$('.vm', root), rail = $$('.vm-rail-item', root), n = slides.length;
    if (!n) return;
    const secs = parseFloat(root.dataset.auto || '7');
    let cur = Math.max(0, slides.findIndex((s) => s.classList.contains('is-on'))), paused = false, timer = null;
    const show = (i) => {
      cur = ((i % n) + n) % n;
      slides.forEach((s, k) => { s.classList.toggle('is-on', k === cur); s.setAttribute('aria-hidden', String(k !== cur)); });
      rail.forEach((b, k) => { b.classList.toggle('is-on', k === cur); b.setAttribute('aria-selected', String(k === cur)); });
      root.classList.toggle('is-light', slides[cur].classList.contains('is-light'));
    };
    const restart = () => {
      clearInterval(timer); timer = null;
      if (!secs || reduce) return;
      timer = setInterval(() => { if (!paused) show(cur + 1); }, secs * 1000);
    };
    rail.forEach((b, k) => b.addEventListener('click', () => { show(k); restart(); }));
    root.addEventListener('mouseenter', () => { paused = true; });
    root.addEventListener('mouseleave', () => { paused = false; });
    root.addEventListener('focusin', () => { paused = true; });
    root.addEventListener('focusout', () => { paused = false; });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); show(cur + (e.key === 'ArrowLeft' ? 1 : -1)); restart();
    });
    show(cur); restart();
  });

  // ===== עיגולי קטגוריות =====
  const initCats = () => $$('.vns .cats-wrap').forEach((wrap) => {
    const el = $('.cats', wrap), track = $('.cats-track', wrap);
    if (!el || !track) return;
    const m = marquee(el, track, 45, false);
    const l = $('.cats-arrow.l', wrap), r = $('.cats-arrow.r', wrap);
    if (l) l.addEventListener('click', () => { m.kick += 420; });
    if (r) r.addEventListener('click', () => { m.kick -= 420; });
  });

  // ===== המומלצים שלנו: טאבים =====
  const initTabs = () => $$('.vns .rec').forEach((sec) => {
    const tabs = $$('.rec-tab', sec), grids = $$('.rec-grid', sec), cta = $('.rec-cta', sec), bar = $('.rec-tabs', sec);
    // במובייל שורת הטאבים גולשת: במגע היא נגללת לבד, ובעכבר מוסיפים גרירה
    if (bar) {
      let drag = null, moved = 0;
      bar.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button > 0 || bar.scrollWidth <= bar.clientWidth) return; drag = { x: e.clientX, left: bar.scrollLeft }; moved = 0; });
      bar.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx));
        if (moved > 4) { bar.classList.add('is-drag'); bar.scrollLeft = drag.left - dx; }
      });
      const end = () => { drag = null; bar.classList.remove('is-drag'); };
      bar.addEventListener('pointerup', end); bar.addEventListener('pointerleave', end); bar.addEventListener('pointercancel', end);
      bar.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
      bar.addEventListener('dragstart', (e) => e.preventDefault());
    }
    tabs.forEach((t, i) => t.addEventListener('click', () => {
      tabs.forEach((x, k) => { x.classList.toggle('is-on', k === i); x.setAttribute('aria-selected', String(k === i)); });
      grids.forEach((g, k) => { g.hidden = k !== i; });
      if (cta && t.dataset.cta) $$('.rl-in > span', cta).forEach((s) => { s.textContent = t.dataset.cta; });
      if (cta && t.dataset.href) cta.href = t.dataset.href;
      if (bar && bar.scrollWidth > bar.clientWidth) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }));
  });

  // ===== קרוסלות מוצרים =====
  // ⚙️ 30 = מהירות הריצה בפיקסלים לשנייה
  const initPcar = () => $$('.vns .pcar').forEach((el) => {
    const track = $('.pcar-track', el);
    if (!track) return;
    const m = marquee(el, track, 30, true);
    $$('.pcar-arrow', el.parentElement).forEach((b) => b.addEventListener('click', () => { m.kick += (parseInt(b.dataset.dir, 10) || 1) * 380; }));
  });

  // ===== אודות: טקסט שנדלק אות אחרי אות + חשיפת תמונה עם הגלילה =====
  // ⚙️ START/END = איפה בגובה המסך הסקשן מתחיל ומסיים (אחוז מגובה החלון, מקצה הסקשן העליון)
  const initAbout = () => $$('.vns .abt-sec').forEach((sec) => {
    const text = $('.abt-text', sec), img = $('.abt-img', sec);
    if (!text) return;
    if (!$('.char', text)) {
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((n) => {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.style.whiteSpace = 'nowrap';
          [...part].forEach((ch) => { const c = document.createElement('span'); c.className = 'char'; c.textContent = ch; w.appendChild(c); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      });
    }
    const chars = $$('.char', text), N = chars.length;
    const START = 0.8, END = 0.2;
    let raf = 0, last = -1;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const update = () => {
      raf = 0;
      const H = window.innerHeight || 800, top = sec.getBoundingClientRect().top;
      const p = reduce ? 1 : clamp((START * H - top) / ((START - END) * H));
      if (p === last) return; last = p;
      const lit = p * (N + 12);
      for (let i = 0; i < N; i++) chars[i].style.opacity = (0.2 + 0.8 * clamp(lit - i)).toFixed(2);
      if (img) { const e = 1 - Math.pow(1 - p, 2); img.style.clipPath = 'inset(0 ' + ((1 - e) * 100).toFixed(2) + '% 0 0)'; }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', req, { passive: true, capture: true });
    window.addEventListener('resize', req);
    update();
  });

  // ===== ביקורות גוגל: גלריית כיפה אינסופית =====
  // ⚙️ size: רוחב כרטיס ביחס לבמה · gap: רווח · ratio: גובה ביחס לרוחב · curve: עוצמת הכיפה
  //    dim: החשכת השוליים (0-1) · smooth: רכות המעקב · glide: גלישה אחרי שחרור · open: משך הפתיחה במילישניות
  const initReviews = () => $$('.vns .dg-root').forEach((root) => {
    if ($('.dg-stage', root)) return;
    const CFG_DG = { size: 0.27, gap: 0.021, ratio: 1.05, curve: 1, dim: 0.7, smooth: 0.12, glide: 0.93, open: 750, radius: 12, openRadius: 20, mobileBelow: 768, mobileSize: 0.62, mobileGap: 0.035 };
    const src = $('.dg-data', root.parentElement) || $('.dg-data');
    let data = [];
    try { data = JSON.parse(src.textContent); } catch (_) {}
    if (!data.length) return;
    const logo = root.dataset.logo || '';
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), mod = (a, n) => ((a % n) + n) % n;
    const lerp = (a, b, p) => a + (b - a) * p, ease = (p) => 1 - Math.pow(1 - p, 4);
    const mix = (A, B, p) => ({ x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), w: lerp(A.w, B.w, p), h: lerp(A.h, B.h, p) });
    const place = (el, r) => { el.style.transform = 'translate(' + r.x.toFixed(1) + 'px,' + r.y.toFixed(1) + 'px)'; el.style.width = r.w.toFixed(1) + 'px'; el.style.height = r.h.toFixed(1) + 'px'; };
    const mk = (tag, cls, parent) => { const el = document.createElement(tag); if (cls) el.className = cls; if (parent) parent.append(el); return el; };
    const card = (parent) => {
      const box = mk('div', 'dg-cardin', parent);
      const top = mk('div', 'dg-top', box);
      const stars = mk('span', 'dg-stars2', top), g = mk('img', 'dg-src', top);
      g.src = logo; g.alt = 'Google'; g.draggable = false;
      const txt = mk('p', 'dg-txt', box);
      const who = mk('div', 'dg-who', box);
      const av = mk('span', 'dg-av', who), wt = mk('span', 'dg-whotxt', who);
      const nm = mk('span', 'dg-nm', wt), wh = mk('span', 'dg-wh', wt);
      return { stars, txt, av, nm, wh };
    };
    const fill = (c, d) => { c.stars.textContent = d.stars; c.txt.textContent = d.text; c.av.textContent = d.initial; c.av.style.background = d.color; c.nm.textContent = d.name; c.wh.textContent = d.when; };

    const stage = mk('div', 'dg-stage'); stage.tabIndex = 0; stage.setAttribute('role', 'region');
    const al = root.getAttribute('aria-label'); if (al) stage.setAttribute('aria-label', al);
    const field = mk('div', 'dg-field', stage), veil = mk('div', 'dg-veil', stage), detail = mk('div', 'dg-detail', stage);
    detail.setAttribute('role', 'dialog'); detail.setAttribute('aria-hidden', 'true'); detail.tabIndex = -1;
    const panel = mk('div', 'dg-panel', detail), copy = mk('div', 'dg-copy', panel);
    const dTop = mk('div', 'dg-dtop', copy), dStars = mk('span', 'dg-stars', dTop), dLogo = mk('img', 'dg-dlogo', dTop), dTitle = mk('h3', 'dg-detail-title', copy), dText = mk('p', 'dg-detail-text', copy), dMeta = mk('p', 'dg-detail-meta', copy);
    dLogo.src = logo; dLogo.alt = 'Google'; dLogo.draggable = false;
    const photo = mk('div', 'dg-photo', detail);
    const pCard = card(photo), pShade = mk('span', 'dg-shade', photo);
    root.append(stage);

    let W = 1, H = 1, cw = 1, ch = 1, px = 1, py = 1, Rd = 0, cols = 0, rows = 0, tiles = [];
    let ox = 0, oy = 0, tx = 0, ty = 0, vx = 0, vy = 0, last = 0, drag = null, state = null, mobile = false, started = false, visible = true;
    const layout = () => {
      const r = stage.getBoundingClientRect(); W = r.width || 1; H = r.height || 1; mobile = W < CFG_DG.mobileBelow;
      // במובייל הכרטיס גדול יותר ביחס לבמה, אחרת הטקסט לא קריא
      cw = W * (mobile ? CFG_DG.mobileSize : CFG_DG.size); ch = cw * CFG_DG.ratio; const g = W * (mobile ? CFG_DG.mobileGap : CFG_DG.gap); px = cw + g; py = ch + g;
      Rd = CFG_DG.curve > 0.01 ? Math.max(W, H * 1.2) * 1.55 / CFG_DG.curve : 0;
      field.style.perspective = (Math.max(W, H) * 1.25).toFixed(0) + 'px';
      const span = Rd ? 1.7 : 1.2;
      cols = Math.min(26, Math.ceil(W * span / px) + 2); rows = Math.min(26, Math.ceil(H * span / py) + 2);
      const need = cols * rows;
      while (tiles.length < need) {
        const el = mk('div', 'dg-tile', field);
        const c = card(el), shade = mk('span', 'dg-shade', el);
        el.setAttribute('aria-hidden', 'true');
        tiles.push(Object.assign({ el, shade, idx: -1, u: 0, v: 0, s: 0 }, c));
      }
      while (tiles.length > need) tiles.pop().el.remove();
      for (const t of tiles) { t.el.style.width = cw.toFixed(1) + 'px'; t.el.style.height = ch.toFixed(1) + 'px'; t.el.style.marginLeft = (-cw / 2).toFixed(1) + 'px'; t.el.style.marginTop = (-ch / 2).toFixed(1) + 'px'; }
      root.style.setProperty('--dg-card', cw.toFixed(1) + 'px');
      if (!started) { started = true; ox = tx = px / 2; oy = ty = py * 0.12; }
    };
    const drawTiles = () => {
      const n = data.length, C = Math.max(1, Math.ceil(Math.sqrt(n))), R = Math.ceil(n / C);
      const c0 = Math.round(-ox / px) - Math.floor(cols / 2), r0 = Math.round(-oy / py) - Math.floor(rows / 2);
      let i = 0;
      for (let b = 0; b < rows; b++) for (let a = 0; a < cols; a++) {
        const t = tiles[i++]; if (!t) continue;
        const col = c0 + a, row = r0 + b, u = col * px + ox, v = row * py + oy;
        const idx = mod(mod(row, R) * C + mod(-col, C), n);
        if (t.idx !== idx) { t.idx = idx; fill(t, data[idx]); }
        t.u = u; t.v = v;
        let vis = true, tr;
        if (Rd) {
          const ax = u / Rd, ay = v / Rd;
          if (Math.abs(ax) > 1.3 || Math.abs(ay) > 1.3) vis = false;
          const X = Rd * Math.sin(ax) * Math.cos(ay), Y = Rd * Math.sin(ay), Z = Rd * (Math.cos(ax) * Math.cos(ay) - 1);
          tr = 'translate3d(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px,' + Z.toFixed(1) + 'px) rotateY(' + ax.toFixed(4) + 'rad) rotateX(' + (-ay).toFixed(4) + 'rad)';
        } else tr = 'translate3d(' + u.toFixed(1) + 'px,' + v.toFixed(1) + 'px,0)';
        t.el.style.transform = tr;
        t.el.style.visibility = (!vis || (state && state.tile === t)) ? 'hidden' : '';
        const dist = Math.hypot(u / (W * 0.6), v / (H * 0.72)), sh = CFG_DG.dim * clamp((dist - 0.15) / 0.6, 0, 1);
        t.s = sh; t.shade.style.opacity = sh.toFixed(3);
      }
    };
    const targets = () => {
      if (!mobile) {
        const side = Math.min(H * 0.705, W * 0.44), total = Math.min(side * 1.9, W * 0.86);
        const top = (H - side) / 2, left = (W - total) / 2;
        return { panel: { x: left, y: top, w: total, h: side }, photo: { x: left + total - side, y: top, w: side, h: side }, copy: { x: 0, y: 0, w: total - side, h: side } };
      }
      const w = Math.min(W * 0.88, H * 0.5), copyH = Math.max(W * 0.46, w * 0.55), total = w + copyH;
      const top = Math.max(12, (H - total) / 2), left = (W - w) / 2;
      return { panel: { x: left, y: top, w, h: total }, photo: { x: left, y: top, w, h: w }, copy: { x: 0, y: w, w, h: copyH } };
    };
    const tileRect = (t) => { const a = stage.getBoundingClientRect(), r = t.el.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }; };
    const drawDetail = (now) => {
      if (!state) return;
      const D = rm.matches ? 0 : CFG_DG.open, rawp = D ? clamp((now - state.t0) / D, 0, 1) : 1, e = ease(rawp);
      const p = state.phase === 'open' ? lerp(state.p0, 1, e) : lerp(state.p0, 0, e);
      state.p = p;
      const from = tileRect(state.tile), T = targets();
      const ph = mix(from, T.photo, p), pn = mix(from, T.panel, Math.pow(p, state.phase === 'open' ? 0.8 : 1.6));
      place(photo, ph); place(panel, pn);
      copy.style.transform = 'translate(' + (T.panel.x + T.copy.x - pn.x).toFixed(1) + 'px,' + (T.panel.y + T.copy.y - pn.y).toFixed(1) + 'px)';
      copy.style.width = T.copy.w.toFixed(1) + 'px'; copy.style.height = T.copy.h.toFixed(1) + 'px';
      copy.style.opacity = clamp((p - 0.45) / 0.4, 0, 1).toFixed(3);
      photo.style.setProperty('--dg-card', ph.w.toFixed(1) + 'px');
      pCard.txt.style.opacity = (1 - clamp(p / 0.5, 0, 1)).toFixed(3);
      pShade.style.opacity = (state.s * (1 - p)).toFixed(3);
      const rad = lerp(CFG_DG.radius, CFG_DG.openRadius, p).toFixed(1) + 'px';
      photo.style.borderRadius = rad; panel.style.borderRadius = rad; veil.style.opacity = p.toFixed(3);
      if (rawp >= 1 && state.phase === 'close') { state.tile.el.style.visibility = ''; detail.classList.remove('is-on'); detail.setAttribute('aria-hidden', 'true'); veil.style.opacity = '0'; state = null; }
    };
    const openTile = (t) => {
      if (!t || t.idx < 0) return;
      const now = performance.now();
      if (state) { if (state.phase === 'close' && state.tile === t) state = Object.assign({}, state, { phase: 'open', t0: now, p0: state.p }); return; }
      const d = data[t.idx];
      fill(pCard, d);
      dStars.textContent = d.stars; dTitle.textContent = d.name; dText.textContent = d.text; dMeta.textContent = d.when;
      vx = vy = 0; tx = ox; ty = oy;
      state = { tile: t, phase: 'open', t0: now, p0: 0, p: 0, s: t.s || 0 };
      detail.classList.add('is-on'); detail.setAttribute('aria-hidden', 'false'); detail.setAttribute('aria-label', d.name);
      drawDetail(now);
    };
    const closeDetail = () => { if (!state || state.phase === 'close') return; state = Object.assign({}, state, { phase: 'close', t0: performance.now(), p0: state.p }); };
    const nearest = () => { let best = null, bd = 1e12; for (const t of tiles) { const d = t.u * t.u + t.v * t.v; if (d < bd) { bd = d; best = t; } } return best; };
    const tileAt = (x, y) => { let best = null, bd = 1e12; for (const t of tiles) { if (t.el.style.visibility === 'hidden') continue; const r = t.el.getBoundingClientRect(); if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue; const d = t.u * t.u + t.v * t.v; if (d < bd) { bd = d; best = t; } } return best; };
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!visible) { last = 0; return; }
      const dt = last ? clamp((now - last) / 16.667, 0.2, 3) : 1; last = now;
      const still = rm.matches;
      if (!drag && !state) { if (still) { vx = vy = 0; } else { const f = Math.pow(CFG_DG.glide, dt); vx *= f; vy *= f; if (Math.abs(vx) < 0.02) vx = 0; if (Math.abs(vy) < 0.02) vy = 0; tx += vx * dt; ty += vy * dt; } }
      const k = still ? 1 : 1 - Math.pow(1 - CFG_DG.smooth, dt);
      ox += (tx - ox) * k; oy += (ty - oy) * k;
      drawTiles(); drawDetail(now);
    };
    stage.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      if (state) { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, close: true }; return; }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, lt: e.timeStamp, moved: false }; vx = vy = 0;
    });
    stage.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id || drag.close) return;
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; stage.classList.add('is-dragging'); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
      if (drag.moved) { tx += dx; ty += dy; const m = 16.667 / Math.max(4, e.timeStamp - drag.lt); vx = vx * 0.5 + dx * m * 0.5; vy = vy * 0.5 + dy * m * 0.5; }
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = e.timeStamp;
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null; stage.classList.remove('is-dragging');
      if (e.type === 'pointercancel') { vx = vy = 0; return; }
      if (d.close) { closeDetail(); return; }
      if (!d.moved) { vx = vy = 0; const t = tileAt(e.clientX, e.clientY); if (t) openTile(t); }
      else if (e.timeStamp - d.lt > 90) { vx = vy = 0; }
    };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('dragstart', (e) => e.preventDefault());
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state) { e.preventDefault(); closeDetail(); return; }
      if (state) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeDetail(); } return; }
      const step = { ArrowLeft: [px * 0.5, 0], ArrowRight: [-px * 0.5, 0], ArrowUp: [0, py * 0.5], ArrowDown: [0, -py * 0.5] }[e.key];
      if (step) { e.preventDefault(); tx += step[0]; ty += step[1]; return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTile(nearest()); }
    });
    if (window.ResizeObserver) new ResizeObserver(() => layout()).observe(stage);
    if (window.IntersectionObserver) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(root);
    layout(); drawTiles(); requestAnimationFrame(frame);
  });

  // ===== קנייה לפי תקציב: סליידר כרטיסים שנפתחים =====
  // ⚙️ side = רוחב כרטיס צדדי (% מהפתוח) · outer = רוחב כרטיס חיצוני (%) · duration = משך מעבר בשניות
  const initBudget = () => $$('.vns .csl-root').forEach((root) => {
    const stage = $('.csl-stage', root);
    if (!stage) return;
    const side = 21.6, outer = 8, duration = 0.4;
    const cards = $$('.csl-card', stage), n = cards.length;
    if (!n) return;
    const wrap = (x, m) => ((x % m) + m) % m;
    let pos = 0, target = 0, raf = 0, drag = null, gap = 0, W = 1, dir = -1;
    const widthAt = (a) => { const O = W, Sd = W * side / 100, Ou = W * outer / 100; if (a < 1) return O + (Sd - O) * a; if (a < 2) return Sd + (Ou - Sd) * (a - 1); if (a < 3) return Ou * (3 - a); return 0; };
    const render = () => {
      const dists = cards.map((el, v) => wrap(v - pos + n / 2, n) - n / 2);
      const rank = dists.map((d, i) => [d, i]).sort((x, y) => x[0] - y[0]);
      rank.forEach(([d, i], r) => {
        const el = cards[i], a = Math.abs(d), w = widthAt(a), g = a <= 2 ? 1 : Math.max(0, 3 - a);
        el.style.transition = 'none';
        el.style.order = String(r);
        el.style.width = w.toFixed(2) + 'px';
        el.style.marginInlineStart = d > 0 && g < 1 ? (-gap * (1 - g)).toFixed(2) + 'px' : '';
        el.style.marginInlineEnd = d < 0 && g < 1 ? (-gap * (1 - g)).toFixed(2) + 'px' : '';
        el.style.visibility = w < 0.5 ? 'hidden' : '';
        el.classList.toggle('is-current', a < 0.12 && !drag);
      });
    };
    const measure = () => {
      const c0 = cards[0], keep = c0.style.width; c0.style.width = ''; W = c0.offsetWidth || 1; c0.style.width = keep;
      gap = parseFloat(getComputedStyle(stage).columnGap) || 0;
      dir = getComputedStyle(root).direction === 'ltr' ? 1 : -1;
    };
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const stop = () => cancelAnimationFrame(raf);
    const animate = () => {
      stop();
      if (reduce) { pos = target; render(); return; }
      const from = pos, t0 = performance.now();
      const tick = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / (duration * 1000))); pos = from + (target - from) * ease(k); render(); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    const go = (d) => { target = Math.round(target) + d; animate(); };
    const pitch = () => (W + W * side / 100) / 2 + gap;
    $$('.csl-nav .csl-btn', root).forEach((b, i) => b.addEventListener('click', () => go(i ? 1 : -1)));
    root.addEventListener('keydown', (e) => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); go((e.key === 'ArrowRight' ? 1 : -1) * dir); });
    let swallow = false;
    stage.addEventListener('click', (e) => {
      if (swallow) { swallow = false; e.preventDefault(); return; }
      const c = e.target.closest('.csl-card'); if (!c) return;
      const i = cards.indexOf(c); if (i < 0) return;
      const d = Math.round(wrap(i - target + n / 2, n) - n / 2);
      // כרטיס צדדי נפתח; הכרטיס הפתוח מוביל לקישור שלו
      if (d) { e.preventDefault(); go(d); }
    });
    stage.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, p0: pos, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }; });
    stage.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x;
      if (!drag.moved) { if (Math.abs(dx) < 6) return; drag.moved = true; stop(); root.classList.add('is-dragging'); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
      const dt = Math.max(1, e.timeStamp - drag.lt); drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4; drag.lx = e.clientX; drag.lt = e.timeStamp;
      pos = drag.p0 - dir * dx / pitch(); target = pos; render();
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; root.classList.remove('is-dragging');
      if (!d.moved) { render(); return; }
      const fling = Math.max(-1, Math.min(1, -dir * d.v * 120 / pitch()));
      target = Math.round(pos + fling); animate();
      swallow = true; setTimeout(() => { swallow = false; }, 120);
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('dragstart', (e) => e.preventDefault());
    const refresh = () => { measure(); render(); };
    window.addEventListener('resize', refresh);
    if (window.ResizeObserver) new ResizeObserver(refresh).observe(root);
    refresh();
  });

  // ===== אזורי משלוח: סליידר נגרר עם מונה =====
  // ⚙️ duration משך מעבר (שנ') · dim עמעום שקופיות צדדיות · dragK רגישות גרירה
  const initAreas = () => $$('.vns .dcs-root').forEach((root) => {
    const view = $('.dcs-view', root), track = $('.dcs-track', root);
    if (!view || !track) return;
    const duration = 0.5, dim = 0.35, dragK = 1;
    const slides = $$('.dcs-slide', track), n = slides.length;
    if (!n) return;
    const prev = $('.dcs-prev', root), next = $('.dcs-next', root), numEl = $('.dcs-num', root);
    let pos = 0, target = 0, raf = 0, W = 1, pitch = 1, lo = -2, dir = -1, cur = $('.dcs-digit', root), shown = -1, drag = null;
    const L = n;
    const wrap = (x, m) => ((x % m) + m) % m;
    const fmt = (i) => String(i + 1).padStart(2, '0');
    const layout = () => {
      const cs = getComputedStyle(track);
      dir = getComputedStyle(root).direction === 'ltr' ? 1 : -1;
      W = slides[0].offsetWidth || 1;
      const gap = parseFloat(cs.columnGap) || 0, pad = parseFloat(dir === 1 ? cs.paddingLeft : cs.paddingRight) || 0;
      pitch = W + gap;
      const V = view.clientWidth, minD = -(pad + W) / pitch, maxD = (V - pad) / pitch, span = maxD - minD;
      lo = minD - (L - span) / 2;
    };
    const roll = (from, to) => {
      if (!numEl) return;
      const nu = document.createElement('span'); nu.className = 'dcs-digit'; nu.textContent = fmt(to);
      const old = cur; cur = nu;
      if (from < 0 || reduce || !nu.animate || !old) { numEl.textContent = ''; numEl.append(nu); return; }
      const up = ((to - from + n) % n) <= n / 2 ? 1 : -1, dur = Math.max(250, duration * 650), easing = 'cubic-bezier(.16,1,.3,1)';
      numEl.append(nu);
      nu.animate([{ transform: 'translateY(' + (100 * up) + '%)' }, { transform: 'translateY(0)' }], { duration: dur, easing });
      const a = old.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-100 * up) + '%)' }], { duration: dur, easing, fill: 'forwards' });
      a.onfinish = () => old.remove();
    };
    const render = () => {
      slides.forEach((el, v) => {
        const d = wrap(v - pos - lo, L) + lo, x = dir * (d - v) * pitch;
        el.style.transition = 'none';
        el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
        el.style.opacity = (1 - (1 - dim) * Math.min(1, Math.abs(d))).toFixed(3);
      });
      const active = wrap(Math.round(pos), n);
      if (active !== shown) { const f = shown; shown = active; roll(f, active); }
    };
    const ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const stop = () => cancelAnimationFrame(raf);
    const animate = () => {
      stop();
      if (reduce) { pos = target; render(); return; }
      const from = pos, t0 = performance.now();
      const tick = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / (duration * 1000))); pos = from + (target - from) * ease(k); render(); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    const go = (d) => { target = Math.round(target) + d; animate(); };
    if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); go(-1); });
    if (next) next.addEventListener('click', (e) => { e.preventDefault(); go(1); });
    root.addEventListener('keydown', (e) => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); go((e.key === 'ArrowRight' ? 1 : -1) * dir); });
    view.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; stop(); drag = { id: e.pointerId, x: e.clientX, p0: pos, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }; });
    view.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) { if (Math.abs(dx) < 5) return; drag.moved = true; root.classList.add('is-dragging'); try { view.setPointerCapture(e.pointerId); } catch (_) {} }
      const dt = Math.max(1, e.timeStamp - drag.lt); drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4; drag.lx = e.clientX; drag.lt = e.timeStamp;
      pos = drag.p0 - dir * dx / pitch * dragK; target = pos; render();
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null; root.classList.remove('is-dragging');
      if (!d.moved) { if (Math.round(target) !== target) { target = Math.round(target); animate(); } return; }
      const fling = Math.max(-2, Math.min(2, -dir * d.v * 160 / pitch * dragK));
      target = Math.round(pos + fling); animate();
      // מבטל רק את הקליק שמסיים גרירה, כדי שלא ייפתח קישור העיר בטעות
      const guard = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      view.addEventListener('click', guard, { capture: true, once: true });
      setTimeout(() => view.removeEventListener('click', guard, { capture: true }), 80);
    };
    view.addEventListener('pointerup', release);
    view.addEventListener('pointercancel', release);
    view.addEventListener('dragstart', (e) => e.preventDefault());
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => { layout(); render(); }); ro.observe(root); ro.observe(view); }
    layout(); render();
  });

  // ===== למה ונוס: רשימה מתגלגלת עם חשיפת תמונה =====
  // ⚙️ roll משך גלגול המילה (שנ') · lean זווית הטיית המילה השנייה (מעלות) · card משך כניסת התמונה (שנ') · tilt זווית כניסת התמונה (מעלות)
  const initWhy = () => $$('.vns .rwl-root').forEach((root) => {
    const rows = $$('.rwl-row', root);
    if (!rows.length) return;
    const roll = 0.5, lean = 9, card = 0.5, tilt = 4;
    root.style.setProperty('--rwl-roll', roll + 's'); root.style.setProperty('--rwl-lean', lean + 'deg');
    root.style.setProperty('--rwl-card', card + 's'); root.style.setProperty('--rwl-tilt', tilt + 'deg');
    const kick = $('.rwl-kicker', root);
    if (kick) root.style.setProperty('--rwl-accent', getComputedStyle(kick).color);
    let active = -1, raf = 0;
    const measure = () => rows.forEach((row) => {
      const line = $('.rwl-line-a', row), r = $('.rwl-roll', row);
      if (line && r) { r.style.height = ''; const h = line.getBoundingClientRect().height; if (h > 0) r.style.height = h.toFixed(2) + 'px'; }
      const ph = $('.rwl-photo', row); if (ph) row.style.setProperty('--rwl-card-slide', (ph.getBoundingClientRect().width * 0.22).toFixed(1) + 'px');
    });
    const setActive = (i) => { if (i === active) return; active = i; rows.forEach((row, k) => row.classList.toggle('is-on', k === i)); };
    const rowOf = (el) => rows.indexOf(el && el.closest ? el.closest('.rwl-row') : null);
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const nearest = () => {
      raf = 0; if (mq.matches) return;
      const rr = root.getBoundingClientRect();
      if (rr.bottom < 0 || rr.top > window.innerHeight) { setActive(-1); return; }
      const mid = window.innerHeight / 2; let best = -1, dist = Infinity;
      rows.forEach((row, i) => { const b = row.getBoundingClientRect(); const d = Math.abs(b.top + b.height / 2 - mid); if (d < dist) { dist = d; best = i; } });
      setActive(dist < window.innerHeight * 0.45 ? best : -1);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(nearest); };
    root.addEventListener('pointerover', (e) => { if (!mq.matches || e.pointerType === 'touch') return; const i = rowOf(e.target); if (i >= 0) setActive(i); });
    root.addEventListener('pointerleave', (e) => { if (!mq.matches || e.pointerType === 'touch') return; setActive(-1); });
    root.addEventListener('click', (e) => { if (mq.matches) return; const i = rowOf(e.target); if (i >= 0) setActive(i); });
    root.addEventListener('focusin', (e) => { const i = rowOf(e.target); if (i >= 0) setActive(i); });
    root.addEventListener('focusout', (e) => { if (mq.matches && !root.contains(e.relatedTarget)) setActive(-1); });
    window.addEventListener('scroll', queue, { passive: true, capture: true });
    if (window.ResizeObserver) new ResizeObserver(() => { measure(); queue(); }).observe(root);
    measure(); queue();
  });

  // ===== הדר נגלל + גובה מסך הפתיחה =====
  const initHeader = () => {
    const top = $('.vns-top'), hdr = $('.vns .site-hdr');
    const setTop = () => { if (top) document.documentElement.style.setProperty('--vns-top-h', top.offsetHeight + 'px'); };
    setTop();
    window.addEventListener('resize', setTop);
    window.addEventListener('load', setTop);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setTop);
    if (!hdr) return;
    // מקום שמור בפריסה + הדר שנעשה fixed כשמסגרת הבאנר פוגעת בראש המסך
    const ph = document.createElement('div');
    ph.style.cssText = 'height:' + hdr.offsetHeight + 'px;margin:0;display:none';
    hdr.parentNode.insertBefore(ph, hdr);
    let stuck = false;
    const place = () => {
      const hero = $('.vns .vhero'), base = stuck ? ph : hdr, r = base.getBoundingClientRect();
      const hit = hero ? hero.getBoundingClientRect().top <= 0 : r.bottom <= 0;
      if (!stuck && hit && r.height) {
        ph.style.height = r.height + 'px'; ph.style.marginBottom = getComputedStyle(hdr).marginBottom; ph.style.display = 'block';
        hdr.classList.add('is-stuck'); stuck = true;
      } else if (stuck) {
        const back = hero ? hero.getBoundingClientRect().top > 0 : ph.getBoundingClientRect().bottom > 0;
        if (back) { hdr.classList.remove('is-stuck'); ph.style.display = 'none'; stuck = false; }
      }
    };
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place);
    place();
  };

  // ===== פוטר: שם המותג "נוחת" על הקו ככל שהפוטר נכנס למסך =====
  const initFooterWord = () => {
    const word = $('.vns .vf-word');
    if (!word) return;
    const land = () => {
      const r = word.getBoundingClientRect(), H = window.innerHeight || 800;
      const bot = $('.vns .vf-bottom'), atEnd = bot && bot.getBoundingClientRect().bottom <= H + 2;
      const p = reduce || atEnd ? 1 : Math.max(0, Math.min(1, (H - r.top) / (r.height * 1.35)));
      word.style.setProperty('--land', p.toFixed(3));
    };
    window.addEventListener('scroll', land, { passive: true, capture: true });
    window.addEventListener('resize', land);
    land();
  };

  // ===== גלילה חלקה בגלגלת העכבר (מגע ומקלדת נשארים טבעיים) + קישורי עוגן =====
  // ⚙️ EASE = כמה חלקה (קטן = איטי ורך, 0.1 רגיל) · STEP = מכפיל מרחק הגלגלת
  const initScroll = () => {
    const EASE = 0.1, STEP = 1;
    let cur = 0, tgt = 0, raf = 0;
    const el = () => document.scrollingElement || document.documentElement;
    const inner = (t) => { for (let n = t; n && n !== document.body && n !== document.documentElement; n = n.parentElement) { const o = getComputedStyle(n).overflowY; if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) return true; } return false; };
    const max = () => el().scrollHeight - window.innerHeight;
    const loop = () => { cur += (tgt - cur) * EASE; if (Math.abs(tgt - cur) < 0.5) { cur = tgt; el().scrollTop = cur; raf = 0; return; } el().scrollTop = cur; raf = requestAnimationFrame(loop); };
    const halt = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    if (CFG.smoothScroll && !reduce) {
      window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || inner(e.target) || max() <= 0) return;
        e.preventDefault();
        if (!raf) { cur = el().scrollTop; tgt = cur; }
        const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
        tgt = Math.max(0, Math.min(max(), tgt + dy * STEP));
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: false });
      window.addEventListener('keydown', halt);
      window.addEventListener('pointerdown', halt);
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('.vns a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1), t = id && document.getElementById(id);
      // קישור "#" ריק הוא placeholder מהסקיצה: לא מקפיצים לראש העמוד
      if (!t) { if (!id) e.preventDefault(); return; }
      e.preventDefault(); halt();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 90, behavior: reduce ? 'auto' : 'smooth' });
    });
  };

  const init = () => {
    [initHeader, initTrust, initMenus, initHero, initCats, initTabs, initPcar, initAbout, initReviews, initBudget, initAreas, initWhy, initFooterWord, initScroll]
      .forEach((fn) => { try { fn(); } catch (err) { console.error('[venus]', err); } });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
