/* Elementor Custom Code snippet #2189 (body end, all pages): strip marquee, header search popover, sticky compact header. Mirrors venus.js initHeader. */
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
  function init(){ initStrip(); initSearch(); initSticky(); }
  function ready(){ if (document.fonts && document.fonts.ready) { document.fonts.ready.then(init); } else { init(); } }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
})();
