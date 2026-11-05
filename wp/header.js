<script>
/* Venus: header strip marquee + main header behaviour (search panel, sticky compact header) */
(function(){
  if (document.body && document.body.classList.contains('elementor-editor-active')) return;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  function initStrip(){
    var boxes = document.querySelectorAll('.venus-trust');
    for (var b = 0; b < boxes.length; b++) {
      var box = boxes[b], track = box.querySelector('.elementor-icon-list-items');
      if (!track || track.getAttribute('data-loop')) continue;
      var base = [].slice.call(track.children);
      if (!base.length) continue;
      var reps = Math.min(6, Math.max(1, Math.ceil((box.clientWidth || window.innerWidth) / (track.scrollWidth || 1))));
      for (var i = 1; i < reps * 2; i++) {
        for (var j = 0; j < base.length; j++) {
          var k = base[j].cloneNode(true);
          k.setAttribute('aria-hidden', 'true');
          track.appendChild(k);
        }
      }
      track.setAttribute('data-loop', String(reps));
      track.style.animationDuration = (45 * reps) + 's';
    }
  }
  function initSearch(){
    var btn = $('.venus-hdr .vns-search .e-search-submit');
    if (!btn || btn.getAttribute('data-vns')) return;
    var box = btn.closest('.e-search'), inp = $('.e-search-input', box);
    if (!box || !inp) return;
    var fm = inp.form; if (fm && !fm.querySelector('[name=post_type]')) { var ph = document.createElement('input'); ph.type = 'hidden'; ph.name = 'post_type'; ph.value = 'product'; fm.appendChild(ph); }
    btn.setAttribute('data-vns', '1'); btn.setAttribute('aria-expanded', 'false');
    var set = function(open){ box.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); if (open) inp.focus(); };
    btn.addEventListener('click', function(e){
      var open = box.classList.contains('is-open');
      if (!open) { e.preventDefault(); set(true); }
      else if (!inp.value.replace(/s+/g, '')) { e.preventDefault(); set(false); }
    });
    document.addEventListener('click', function(e){ if (!e.target.closest('.venus-hdr .vns-search')) set(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') set(false); });
  }
  function initSticky(){
    var hdr = $('.venus-hdr');
    if (!hdr || hdr.getAttribute('data-vns-sticky')) return;
    hdr.setAttribute('data-vns-sticky', '1');
    var ph = document.createElement('div'); ph.style.display = 'none'; hdr.parentNode.insertBefore(ph, hdr);
    var stuck = false;
    var place = function(){
      var hero = $('.vhero'), base = stuck ? ph : hdr, r = base.getBoundingClientRect();
      var hit = hero ? hero.getBoundingClientRect().top <= 0 : r.bottom <= 0;
      if (!stuck && hit && r.height) {
        ph.style.height = (r.height + (parseFloat(getComputedStyle(hdr).marginTop) || 0)) + 'px'; ph.style.display = 'block';
        hdr.classList.add('is-stuck'); stuck = true;
      } else if (stuck) {
        var back = hero ? hero.getBoundingClientRect().top > 0 : ph.getBoundingClientRect().bottom > 0;
        if (back) { hdr.classList.remove('is-stuck'); ph.style.display = 'none'; stuck = false; }
      }
    };
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place);
    place();
  }
  function initRoll(){
    var bs = document.querySelectorAll('.vhero .elementor-slide-button, .vrc-btn .elementor-heading-title, .vrec-cta .elementor-button-text, .vbud-cta .elementor-heading-title');
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i]; if (b.getAttribute('data-vns-rt')) continue;
      b.setAttribute('data-vns-rt', '1');
      var t = b.textContent.trim(), w = document.createElement('span'), s = document.createElement('span');
      w.className = 'vns-rt'; s.textContent = t; w.appendChild(s); b.textContent = ''; b.appendChild(w);
    }
  }
  var loops = [], loopTs = 0, reduceMo = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function period(track){ var c = track.children; return c.length > 1 ? Math.abs(c[c.length / 2].offsetLeft - c[0].offsetLeft) : 0; }
  function fillLoop(track, box){
    var base = [].slice.call(track.children);
    if (!base.length) return 1;
    if (track.dataset.loop) return Number(track.dataset.loop);
    var copy = function(){ return base.map(function(c){ var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); [].slice.call(k.querySelectorAll('a,button')).forEach(function(x){ x.tabIndex = -1; }); return k; }); };
    var reps = Math.min(6, Math.max(1, Math.ceil((box.clientWidth || window.innerWidth) / (track.scrollWidth || 1))));
    for (var i = 1; i < reps * 2; i++) copy().forEach(function(k){ track.appendChild(k); });
    track.dataset.loop = String(reps);
    return reps;
  }
  function loopFrame(ts){
    requestAnimationFrame(loopFrame);
    var dt = loopTs ? Math.min(0.05, (ts - loopTs) / 1000) : 0; loopTs = ts;
    loops.forEach(function(m){
      if (m.drag || !m.visible) return;
      if (!m.stopped && !reduceMo) m.off += m.speed * dt;
      if (Math.abs(m.kick) > 0.5) { var d = m.kick * 0.1; m.off += d; m.kick -= d; }
      m.apply();
    });
  }
  function marquee(el, track, speed){
    fillLoop(track, el);
    var m = { el: el, speed: speed, off: 0, kick: 0, stopped: false, drag: null, moved: 0, visible: true };
    m.apply = function(){ var h = period(track); if (!h) return; m.off = ((m.off % h) + h) % h; track.style.transform = 'translateX(' + m.off.toFixed(2) + 'px)'; };
    el.addEventListener('pointerdown', function(e){ if (e.button > 0) return; m.drag = { x: e.clientX, id: e.pointerId, cap: false }; m.moved = 0; m.kick = 0; });
    el.addEventListener('pointermove', function(e){
      if (!m.drag || e.pointerId !== m.drag.id) return;
      var dx = e.clientX - m.drag.x; m.drag.x = e.clientX; m.moved += Math.abs(dx);
      if (!m.drag.cap && m.moved > 6) { m.drag.cap = true; el.classList.add('is-drag'); try { el.setPointerCapture(e.pointerId); } catch (_) {} }
      m.off += dx; m.apply();
    });
    var up = function(e){ if (!m.drag) return; m.drag = null; el.classList.remove('is-drag'); try { el.releasePointerCapture(e.pointerId); } catch (_) {} };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', function(e){ if (m.moved > 6) { e.preventDefault(); e.stopPropagation(); m.moved = 0; } }, true);
    el.addEventListener('dragstart', function(e){ e.preventDefault(); });
    loops.push(m);
    if (window.IntersectionObserver) new IntersectionObserver(function(es){ es.forEach(function(x){ m.visible = x.isIntersecting; }); }, { rootMargin: '200px' }).observe(el);
    if (loops.length === 1) requestAnimationFrame(loopFrame);
    return m;
  }
  function initCats(){
    var row = $('.vcats');
    if (!row || row.getAttribute('data-vns')) return;
    row.setAttribute('data-vns', '1');
    var track = document.createElement('div'); track.className = 'vcats-track';
    while (row.firstChild) track.appendChild(row.firstChild);
    row.appendChild(track);
    var imgLinks = track.querySelectorAll('.elementor-image-box-img a'); for (var i = 0; i < imgLinks.length; i++) imgLinks[i].tabIndex = -1;
    var m = marquee(row, track, 45);
    var wrap = row.closest('.vcats-wrap') || document;
    var l = $('.vcats-arrow-l a', wrap), r = $('.vcats-arrow-r a', wrap);
    if (l) l.addEventListener('click', function(e){ e.preventDefault(); m.kick += 420; });
    if (r) r.addEventListener('click', function(e){ e.preventDefault(); m.kick -= 420; });
  }
  function initRecTabs(){
    var bars = document.querySelectorAll('.vrec .e-n-tabs-heading');
    for (var i = 0; i < bars.length; i++) (function(bar){
      if (bar.getAttribute('data-vns-drag')) return; bar.setAttribute('data-vns-drag', '1');
      var drag = null, moved = 0;
      bar.addEventListener('pointerdown', function(e){ if (e.pointerType !== 'mouse' || e.button > 0 || bar.scrollWidth <= bar.clientWidth) return; drag = { x: e.clientX, left: bar.scrollLeft }; moved = 0; });
      bar.addEventListener('pointermove', function(e){ if (!drag) return; var dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); if (moved > 4) { bar.classList.add('is-drag'); bar.scrollLeft = drag.left - dx; } });
      var end = function(){ drag = null; bar.classList.remove('is-drag'); };
      bar.addEventListener('pointerup', end); bar.addEventListener('pointerleave', end); bar.addEventListener('pointercancel', end);
      bar.addEventListener('click', function(e){ if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
      bar.addEventListener('dragstart', function(e){ e.preventDefault(); });
      bar.addEventListener('click', function(e){ var t = e.target.closest && e.target.closest('.e-n-tab-title'); if (t && bar.scrollWidth > bar.clientWidth) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduceMo ? 'auto' : 'smooth' }); });
    })(bars[i]);
  }
  function initPcar(){
    var els = document.querySelectorAll('.vpcar');
    for (var i = 0; i < els.length; i++) (function(el){
      if (el.getAttribute('data-vns')) return;
      var track = el.querySelector('.elementor-loop-container'); if (!track) return;
      el.setAttribute('data-vns', '1');
      var st = track.querySelectorAll(':scope > style'); for (var k = 0; k < st.length; k++) document.head.appendChild(st[k]);
      var m = marquee(el, track, 30);
      var wrap = el.closest('.vpcar-sec') || document;
      var l = wrap.querySelector('.vpcar-arrow-l a'), r = wrap.querySelector('.vpcar-arrow-r a');
      if (l) l.addEventListener('click', function(e){ e.preventDefault(); m.kick += 380; });
      if (r) r.addEventListener('click', function(e){ e.preventDefault(); m.kick -= 380; });
    })(els[i]);
  }
  function splitWs(t){ var out = [], cur = '', ws = null; for (var i = 0; i < t.length; i++) { var ch = t.charAt(i), w = !ch.trim(); if (ws === null || w === ws) cur += ch; else { out.push(cur); cur = ch; } ws = w; } if (cur) out.push(cur); return out; }
  function initAbout(){
    var secs = document.querySelectorAll('.vabt');
    for (var s = 0; s < secs.length; s++) (function(sec){
      if (sec.getAttribute('data-vns')) return;
      var text = sec.querySelector('.vabt-text .elementor-widget-container'), img = sec.querySelector('.vabt-img img');
      if (!text) return; sec.setAttribute('data-vns', '1');
      if (!text.querySelector('.char')) {
        var walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT), nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function(n){
          var frag = document.createDocumentFragment();
          splitWs(n.textContent).forEach(function(part){
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.style.whiteSpace = 'nowrap';
            Array.from(part).forEach(function(ch){ var c = document.createElement('span'); c.className = 'char'; c.textContent = ch; w.appendChild(c); });
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        });
      }
      var chars = text.querySelectorAll('.char'), N = chars.length, START = 0.8, END = 0.2, raf = 0, last = -1;
      var clamp = function(v){ return Math.max(0, Math.min(1, v)); };
      var update = function(){
        raf = 0;
        var H = window.innerHeight || 800, top = sec.getBoundingClientRect().top;
        var p = reduceMo ? 1 : clamp((START * H - top) / ((START - END) * H));
        if (p === last) return; last = p;
        var lit = p * (N + 12);
        for (var i = 0; i < N; i++) chars[i].style.opacity = (0.2 + 0.8 * clamp(lit - i)).toFixed(2);
        if (img) { var e = 1 - Math.pow(1 - p, 2); img.style.clipPath = 'inset(0 ' + ((1 - e) * 100).toFixed(2) + '% 0 0)'; }
      };
      var req = function(){ if (!raf) raf = requestAnimationFrame(update); };
      window.addEventListener('scroll', req, { passive: true, capture: true });
      window.addEventListener('resize', req);
      update();
    })(secs[s]);
  }
  function initBudget(){
    var roots = document.querySelectorAll('.vbud-sec');
    for (var ri = 0; ri < roots.length; ri++) (function(root){
      var stage = root.querySelector('.vbud-stage');
      if (!stage || root.getAttribute('data-vbud')) return;
      var cards = [].slice.call(stage.querySelectorAll('.vbud-card')), n = cards.length;
      if (!n) return;
      root.setAttribute('data-vbud', '1');
      root.tabIndex = 0; root.setAttribute('aria-label', 'קנייה לפי תקציב');
      [].forEach.call(stage.querySelectorAll('img'), function(im){ im.draggable = false; im.alt = ''; im.loading = 'eager'; });
      var side = 21.6, outer = 8, duration = 0.4;
      var pos = 0, target = 0, raf = 0, drag = null, gap = 0, W = 1, dir = -1, swallow = false;
      function wrap(x, m){ return ((x % m) + m) % m; }
      function widthAt(a){ var O = W, Sd = W * side / 100, Ou = W * outer / 100; if (a < 1) return O + (Sd - O) * a; if (a < 2) return Sd + (Ou - Sd) * (a - 1); if (a < 3) return Ou * (3 - a); return 0; }
      function render(){
        var dists = cards.map(function(el, v){ return wrap(v - pos + n / 2, n) - n / 2; });
        var rank = dists.map(function(d, i){ return [d, i]; }).sort(function(x, y){ return x[0] - y[0]; });
        rank.forEach(function(p, r){
          var d = p[0], el = cards[p[1]], a = Math.abs(d), w = widthAt(a), g = a <= 2 ? 1 : Math.max(0, 3 - a);
          el.style.transition = 'none';
          el.style.order = String(r);
          el.style.width = w.toFixed(2) + 'px';
          el.style.marginInlineStart = d > 0 && g < 1 ? (-gap * (1 - g)).toFixed(2) + 'px' : '';
          el.style.marginInlineEnd = d < 0 && g < 1 ? (-gap * (1 - g)).toFixed(2) + 'px' : '';
          el.style.visibility = w < 0.5 ? 'hidden' : '';
          if (a < 0.12 && !drag) el.classList.add('is-current'); else el.classList.remove('is-current');
        });
      }
      function measure(){
        var c0 = cards[0], keep = c0.style.width; c0.style.width = ''; W = c0.offsetWidth || 1; c0.style.width = keep;
        gap = parseFloat(getComputedStyle(stage).columnGap) || 0;
        dir = getComputedStyle(root).direction === 'ltr' ? 1 : -1;
      }
      function ease(t){ return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
      function stop(){ cancelAnimationFrame(raf); }
      function animate(){
        stop();
        if (reduceMo) { pos = target; render(); return; }
        var from = pos, t0 = performance.now();
        function tick(t){ var k = Math.max(0, Math.min(1, (t - t0) / (duration * 1000))); pos = from + (target - from) * ease(k); render(); if (k < 1) raf = requestAnimationFrame(tick); }
        raf = requestAnimationFrame(tick);
      }
      function go(d){ target = Math.round(target) + d; animate(); }
      function pitch(){ return (W + W * side / 100) / 2 + gap; }
      var btns = root.querySelectorAll('.vbud-nav .vbud-btn .elementor-button');
      [].forEach.call(btns, function(b, i){ b.addEventListener('click', function(e){ e.preventDefault(); go(i ? 1 : -1); }); });
      root.addEventListener('keydown', function(e){ if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); go((e.key === 'ArrowRight' ? 1 : -1) * dir); });
      stage.addEventListener('click', function(e){
        if (swallow) { swallow = false; e.preventDefault(); return; }
        var c = e.target.closest ? e.target.closest('.vbud-card') : null; if (!c) return;
        var i = cards.indexOf(c); if (i < 0) return;
        var d = Math.round(wrap(i - target + n / 2, n) - n / 2);
        if (d) { e.preventDefault(); go(d); }
      });
      stage.addEventListener('pointerdown', function(e){ if (e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, p0: pos, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }; });
      stage.addEventListener('pointermove', function(e){
        if (!drag || e.pointerId !== drag.id) return; var dx = e.clientX - drag.x;
        if (!drag.moved) { if (Math.abs(dx) < 6) return; drag.moved = true; stop(); root.classList.add('is-dragging'); try { stage.setPointerCapture(e.pointerId); } catch (x) {} }
        var dt = Math.max(1, e.timeStamp - drag.lt); drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4; drag.lx = e.clientX; drag.lt = e.timeStamp;
        pos = drag.p0 - dir * dx / pitch(); target = pos; render();
      });
      function release(e){
        if (!drag || e.pointerId !== drag.id) return; var d = drag; drag = null; root.classList.remove('is-dragging');
        if (!d.moved) { render(); return; }
        var fling = Math.max(-1, Math.min(1, -dir * d.v * 120 / pitch()));
        target = Math.round(pos + fling); animate();
        swallow = true; setTimeout(function(){ swallow = false; }, 120);
      }
      stage.addEventListener('pointerup', release);
      stage.addEventListener('pointercancel', release);
      stage.addEventListener('dragstart', function(e){ e.preventDefault(); });
      function refresh(){ measure(); render(); }
      window.addEventListener('resize', refresh);
      if (window.ResizeObserver) new ResizeObserver(refresh).observe(root);
      refresh();
    })(roots[ri]);
  }
  function initAreas(){
    var roots = document.querySelectorAll('.vare');
    for (var ri = 0; ri < roots.length; ri++) (function(root){
      var view = root.querySelector('.vare-view'), track = root.querySelector('.vare-track');
      if (!view || !track || root.getAttribute('data-vare')) return;
      var slides = [].slice.call(track.querySelectorAll('.vare-slide')), n = slides.length;
      if (!n) return;
      root.setAttribute('data-vare', '1'); root.tabIndex = 0;
      [].forEach.call(track.querySelectorAll('img'), function(im){ im.draggable = false; im.alt = ''; im.loading = 'eager'; });
      var duration = 0.5, dim = 0.35, dragK = 1;
      var prev = root.querySelector('.vare-prev'), next = root.querySelector('.vare-next'), numEl = root.querySelector('.vare-num');
      var pos = 0, target = 0, raf = 0, W = 1, pitch = 1, lo = -2, dir = -1, cur = root.querySelector('.vare-digit'), shown = -1, drag = null, L = n;
      function wrap(x, m){ return ((x % m) + m) % m; }
      function fmt(i){ var s = String(i + 1); return s.length < 2 ? '0' + s : s; }
      function layout(){
        var cs = getComputedStyle(track);
        dir = getComputedStyle(root).direction === 'ltr' ? 1 : -1;
        W = slides[0].offsetWidth || 1;
        var gap = parseFloat(cs.columnGap) || 0, pad = parseFloat(dir === 1 ? cs.paddingLeft : cs.paddingRight) || 0;
        pitch = W + gap;
        var V = view.clientWidth, minD = -(pad + W) / pitch, maxD = (V - pad) / pitch, span = maxD - minD;
        lo = minD - (L - span) / 2;
      }
      function roll(from, to){
        if (!numEl) return;
        var nu = document.createElement('span'); nu.className = 'vare-digit'; nu.textContent = fmt(to);
        var old = cur; cur = nu;
        if (from < 0 || reduceMo || !nu.animate || !old) { numEl.textContent = ''; numEl.appendChild(nu); return; }
        var up = ((to - from + n) % n) <= n / 2 ? 1 : -1, dur = Math.max(250, duration * 650), easing = 'cubic-bezier(.16,1,.3,1)';
        numEl.appendChild(nu);
        nu.animate([{ transform: 'translateY(' + (100 * up) + '%)' }, { transform: 'translateY(0)' }], { duration: dur, easing: easing });
        var a = old.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-100 * up) + '%)' }], { duration: dur, easing: easing, fill: 'forwards' });
        a.onfinish = function(){ if (old.parentNode) old.parentNode.removeChild(old); };
      }
      function render(){
        for (var v = 0; v < n; v++) {
          var el = slides[v], d = wrap(v - pos - lo, L) + lo, x = dir * (d - v) * pitch;
          el.style.transition = 'none';
          el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
          el.style.opacity = (1 - (1 - dim) * Math.min(1, Math.abs(d))).toFixed(3);
        }
        var active = wrap(Math.round(pos), n);
        if (active !== shown) { var f = shown; shown = active; roll(f, active); }
      }
      function ease(t){ return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
      function stop(){ cancelAnimationFrame(raf); }
      function animate(){
        stop();
        if (reduceMo) { pos = target; render(); return; }
        var from = pos, t0 = performance.now();
        function tick(t){ var k = Math.max(0, Math.min(1, (t - t0) / (duration * 1000))); pos = from + (target - from) * ease(k); render(); if (k < 1) raf = requestAnimationFrame(tick); }
        raf = requestAnimationFrame(tick);
      }
      function go(d){ target = Math.round(target) + d; animate(); }
      if (prev) prev.addEventListener('click', function(e){ e.preventDefault(); go(-1); });
      if (next) next.addEventListener('click', function(e){ e.preventDefault(); go(1); });
      root.addEventListener('keydown', function(e){ if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); go((e.key === 'ArrowRight' ? 1 : -1) * dir); });
      view.addEventListener('pointerdown', function(e){ if (e.button !== 0) return; stop(); drag = { id: e.pointerId, x: e.clientX, p0: pos, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false }; });
      view.addEventListener('pointermove', function(e){
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x;
        if (!drag.moved) { if (Math.abs(dx) < 5) return; drag.moved = true; root.classList.add('is-dragging'); try { view.setPointerCapture(e.pointerId); } catch (_) {} }
        var dt = Math.max(1, e.timeStamp - drag.lt); drag.v = drag.v * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4; drag.lx = e.clientX; drag.lt = e.timeStamp;
        pos = drag.p0 - dir * dx / pitch * dragK; target = pos; render();
      });
      function release(e){
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null; root.classList.remove('is-dragging');
        if (!d.moved) { if (Math.round(target) !== target) { target = Math.round(target); animate(); } return; }
        var fling = Math.max(-2, Math.min(2, -dir * d.v * 160 / pitch * dragK));
        target = Math.round(pos + fling); animate();
        function guard(ev){ ev.preventDefault(); ev.stopPropagation(); }
        view.addEventListener('click', guard, true);
        setTimeout(function(){ view.removeEventListener('click', guard, true); }, 80);
      }
      view.addEventListener('pointerup', release);
      view.addEventListener('pointercancel', release);
      view.addEventListener('dragstart', function(e){ e.preventDefault(); });
      if (window.ResizeObserver) { var ro = new ResizeObserver(function(){ layout(); render(); }); ro.observe(root); ro.observe(view); }
      window.addEventListener('resize', function(){ layout(); render(); });
      layout(); render();
    })(roots[ri]);
  }
  function initWhy(){
    var roots = document.querySelectorAll('.vwhy');
    for (var ri = 0; ri < roots.length; ri++) (function(root){
      var rows = [].slice.call(root.querySelectorAll('.vwhy-row'));
      if (!rows.length || root.getAttribute('data-vwhy')) return;
      root.setAttribute('data-vwhy', '1');
      [].forEach.call(root.querySelectorAll('img'), function(im){ im.draggable = false; im.alt = ''; });
      var active = -1, raf = 0;
      function measure(){
        rows.forEach(function(row){
          var line = row.querySelector('.vwhy-line-a'), r = row.querySelector('.vwhy-roll');
          if (line && r) { r.style.height = ''; var h = line.getBoundingClientRect().height; if (h > 0) r.style.height = h.toFixed(2) + 'px'; }
          var ph = row.querySelector('.vwhy-photo'); if (ph) row.style.setProperty('--rwl-card-slide', (ph.getBoundingClientRect().width * 0.22).toFixed(1) + 'px');
        });
      }
      function setActive(i){ if (i === active) return; active = i; rows.forEach(function(row, k){ if (k === i) row.classList.add('is-on'); else row.classList.remove('is-on'); }); }
      function rowOf(el){ var r = el && el.closest ? el.closest('.vwhy-row') : null; return rows.indexOf(r); }
      var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      function nearest(){
        raf = 0; if (mq.matches) return;
        var rr = root.getBoundingClientRect();
        if (rr.bottom < 0 || rr.top > window.innerHeight) { setActive(-1); return; }
        var mid = window.innerHeight / 2, best = -1, dist = Infinity;
        rows.forEach(function(row, i){ var b = row.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < dist) { dist = d; best = i; } });
        setActive(dist < window.innerHeight * 0.45 ? best : -1);
      }
      function queue(){ if (!raf) raf = requestAnimationFrame(nearest); }
      root.addEventListener('pointerover', function(e){ if (!mq.matches || e.pointerType === 'touch') return; var i = rowOf(e.target); if (i >= 0) setActive(i); });
      root.addEventListener('pointerleave', function(e){ if (!mq.matches || e.pointerType === 'touch') return; setActive(-1); });
      root.addEventListener('click', function(e){ if (mq.matches) return; var i = rowOf(e.target); if (i >= 0) setActive(i); });
      root.addEventListener('focusin', function(e){ var i = rowOf(e.target); if (i >= 0) setActive(i); });
      root.addEventListener('focusout', function(e){ if (mq.matches && !root.contains(e.relatedTarget)) setActive(-1); });
      window.addEventListener('scroll', queue, { passive: true, capture: true });
      if (window.ResizeObserver) new ResizeObserver(function(){ measure(); queue(); }).observe(root);
      window.addEventListener('resize', function(){ measure(); queue(); });
      measure(); queue();
    })(roots[ri]);
  }
  function init(){ initStrip(); initSearch(); initSticky(); initRoll(); initCats(); initRecTabs(); initPcar(); initAbout(); initBudget(); initAreas(); initWhy(); }
  function ready(){ if (document.fonts && document.fonts.ready) { document.fonts.ready.then(init); } else { init(); } }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
})();
</script>