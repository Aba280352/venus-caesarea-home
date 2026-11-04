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
    var bs = document.querySelectorAll('.vhero .elementor-slide-button');
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
  function init(){ initStrip(); initSearch(); initSticky(); initRoll(); initCats(); }
  function ready(){ if (document.fonts && document.fonts.ready) { document.fonts.ready.then(init); } else { init(); } }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
})();
