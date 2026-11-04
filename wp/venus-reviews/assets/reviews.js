/* Venus Reviews - Google reviews dome gallery (port of initReviews from the GitHub build venus.js) */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  // ===== ביקורות גוגל: גלריית כיפה אינסופית =====
  // ⚙️ size: רוחב כרטיס ביחס לבמה · gap: רווח · ratio: גובה ביחס לרוחב · curve: עוצמת הכיפה
  //    dim: החשכת השוליים (0-1) · smooth: רכות המעקב · glide: גלישה אחרי שחרור · open: משך הפתיחה במילישניות
  const initReviews = () => $$('.vrev .dg-root').forEach((root) => {
    if ($('.dg-stage', root)) return;
    const CFG_DG = { size: 0.27, gap: 0.021, ratio: 1.05, curve: 1, dim: 0.7, smooth: 0.12, glide: 0.93, open: 750, radius: 12, openRadius: 20, mobileBelow: 768, mobileSize: 0.56, mobileGap: 0.035 };
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
      root.classList.toggle('dg-mobile', mobile); needW = -1;
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
      // מובייל: כרטיס עליון נמוך (כוכבים + שם), ומתחתיו אזור טקסט בגובה התוכן (עד גובה הבמה, ואז גלילה פנימית)
      const w = W * 0.88, phH = Math.round(w * 0.44), maxCopy = Math.max(120, H - 24 - phH);
      const copyH = clamp(copyNeed(w), Math.min(W * 0.46, maxCopy), maxCopy), total = phH + copyH;
      const top = Math.max(12, (H - total) / 2), left = (W - w) / 2;
      return { panel: { x: left, y: top, w, h: total }, photo: { x: left, y: top, w, h: phH }, copy: { x: 0, y: phH, w, h: copyH } };
    };
    let needW = -1, needH = 0;
    const copyNeed = (w) => {
      if (Math.abs(w - needW) > 0.5) {
        const sw = copy.style.width, sh = copy.style.height;
        copy.style.width = w.toFixed(1) + 'px'; copy.style.height = 'auto';
        needH = copy.scrollHeight; needW = w;
        copy.style.width = sw; copy.style.height = sh;
      }
      return needH;
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
      needW = -1; copy.scrollTop = 0;
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
      if (!drag || e.pointerId !== drag.id) return;
      // ביקורת פתוחה: תזוזה = גלילת הטקסט, לא סגירה
      if (drag.close) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true; return; }
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; stage.classList.add('is-dragging'); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
      if (drag.moved) { tx += dx; ty += dy; const m = 16.667 / Math.max(4, e.timeStamp - drag.lt); vx = vx * 0.5 + dx * m * 0.5; vy = vy * 0.5 + dy * m * 0.5; }
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = e.timeStamp;
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null; stage.classList.remove('is-dragging');
      if (e.type === 'pointercancel') { vx = vy = 0; return; }
      if (d.close) { if (!d.moved) closeDetail(); return; }
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
    // לחיצה/נגיעה מחוץ לגלריה (בכל מקום בדף) סוגרת ביקורת פתוחה. גלילה של הדף לא סוגרת
    let outTap = null;
    document.addEventListener('pointerdown', (e) => { outTap = (state && !stage.contains(e.target)) ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null; }, true);
    document.addEventListener('pointerup', (e) => {
      const t = outTap; outTap = null;
      if (t && e.pointerId === t.id && state && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10) closeDetail();
    }, true);
    if (window.ResizeObserver) new ResizeObserver(() => layout()).observe(stage);
    if (window.IntersectionObserver) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(root);
    layout(); drawTiles(); requestAnimationFrame(frame);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReviews); else initReviews();
})();
