/* Venus Shop Archive - filters & sort without reload, load more, quick add to cart, FAQ, SEO "read more". */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root, busy = false;
  var PARTS = ['.vpa-crumbs', '.vpa-head', '.vpa-bar', '.vpa-grid', '.vpa-more', '.vpa-faq', '.vpa-seo'];

  /* same rolling-text wrap the homepage uses on card buttons (for cards added later) */
  function roll(scope) {
    $$('.vrc-btn .elementor-heading-title', scope).forEach(function (b) {
      if (b.getAttribute('data-vns-rt')) { return; }
      b.setAttribute('data-vns-rt', '1');
      var t = b.textContent.trim(), w = document.createElement('span'), s = document.createElement('span');
      w.className = 'vns-rt'; s.textContent = t; w.appendChild(s); b.textContent = ''; b.appendChild(w);
    });
  }

  function getDoc(url) {
    return fetch(url, { credentials: 'same-origin', headers: { 'X-Requested-With': 'vpa' } })
      .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); })
      .then(function (h) { return new DOMParser().parseFromString(h, 'text/html'); });
  }

  /* swap the dynamic parts of the page with the ones from another archive URL */
  function go(url, push) {
    if (busy) { return; }
    busy = true;
    root.classList.add('is-loading');
    getDoc(url).then(function (doc) {
      if (!doc.querySelector('.vpa')) { throw new Error('no vpa'); }
      PARTS.forEach(function (sel) {
        var cur = $(sel, root), nxt = doc.querySelector('.vpa ' + sel);
        var curW = cur && (cur.closest('.elementor-widget') || cur), nxtW = nxt && (nxt.closest('.elementor-widget') || nxt);
        if (curW && nxtW) { curW.replaceWith(document.importNode(nxtW, true)); }
        else if (curW && !nxt) { curW.hidden = true; }
      });
      if (doc.title) { document.title = doc.title; }
      if (push) { history.pushState({ vpa: 1 }, '', url); }
      roll(root);
      bindStatic();
      root.classList.remove('is-loading');
      busy = false;
      var bar = $('.vpa-bar', root);
      if (bar && bar.getBoundingClientRect().top < 0) { bar.scrollIntoView({ block: 'start' }); }
    }).catch(function () { window.location.href = url; });
  }

  function loadMore(btn) {
    if (busy) { return; }
    busy = true;
    btn.classList.add('is-busy');
    var t = $('.vpa-more-t', btn); if (t) { t.textContent = 'טוען…'; }
    getDoc(btn.href).then(function (doc) {
      var box = $('.vpa-grid .elementor-loop-container', root);
      $$('.vpa-grid .e-loop-item', doc).forEach(function (it) { box.appendChild(document.importNode(it, true)); });
      var cur = $('.vpa-more', root), nxt = doc.querySelector('.vpa-more');
      if (cur && nxt) { (cur.closest('.elementor-widget') || cur).replaceWith(document.importNode(nxt.closest('.elementor-widget') || nxt, true)); }
      roll(root);
      busy = false;
    }).catch(function () { window.location.href = btn.href; });
  }

  function addToCart(btn) {
    var item = btn.closest('.e-loop-item');
    var m = item && item.className.match(/(?:^|\s)post-(\d+)(?:\s|$)/);
    var link = item && (item.querySelector('a[href]') || item.closest('a[href]'));
    if (!m || !window.VPA || !window.VPA.ajax) { if (link) { window.location.href = link.href; } return; }
    if (btn.getAttribute('data-busy')) { return; }
    btn.setAttribute('data-busy', '1');
    var label = $('.vns-rt > span', btn) || $('.elementor-heading-title', btn);
    var old = label.textContent;
    var fd = new FormData(); fd.append('product_id', m[1]); fd.append('quantity', 1);
    fetch(window.VPA.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r || r.error) { if (r && r.product_url) { window.location.href = r.product_url; return; } throw new Error('atc'); }
        label.textContent = 'נוסף לעגלה ✓';
        btn.classList.add('is-added');
        if (window.jQuery) {
          window.jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash, window.jQuery(btn)]);
          window.jQuery(document.body).trigger('wc_fragment_refresh');
        }
        setTimeout(function () { label.textContent = old; btn.classList.remove('is-added'); btn.removeAttribute('data-busy'); }, 1800);
      })
      .catch(function () { btn.removeAttribute('data-busy'); if (link) { window.location.href = link.href; } });
  }

  /* things that live inside swapped parts */
  function bindStatic() {
    var sel = $('#vpa-orderby', root);
    if (sel && !sel.getAttribute('data-b')) {
      sel.setAttribute('data-b', '1');
      sel.addEventListener('change', function () {
        var f = sel.form, u = new URL(f.action, location.href);
        $$('input[type=hidden]', f).forEach(function (h) { u.searchParams.set(h.name, h.value); });
        if (sel.value === 'menu_order') { u.searchParams.delete('orderby'); } else { u.searchParams.set('orderby', sel.value); }
        go(u.toString(), true);
      });
    }
    var seo = $('.vpa-seo', root);
    if (seo && !seo.getAttribute('data-b')) {
      seo.setAttribute('data-b', '1');
      var inn = $('.vpa-seo-in', seo), tg = $('.vpa-seo-tg', seo);
      if (inn && tg) { seo.classList.add('is-clamped'); }
      if (inn && tg && inn.scrollHeight <= inn.clientHeight + 40) { seo.classList.remove('is-clamped'); }
      else if (inn && tg) {
        tg.hidden = false;
        tg.addEventListener('click', function () {
          var open = seo.classList.toggle('is-open');
          tg.setAttribute('aria-expanded', open ? 'true' : 'false');
          $('span', tg).textContent = open ? 'הצגת פחות' : 'קראו עוד';
        });
      }
    }
  }

  function init() {
    root = $('.vpa');
    if (!root || root.getAttribute('data-vpa')) { return; }
    root.setAttribute('data-vpa', '1');
    roll(root);
    bindStatic();

    root.addEventListener('click', function (e) {
      var a = e.target.closest('a.vpa-chip, a.vpa-pchip');
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); if (!a.classList.contains('is-on') || a.classList.contains('vpa-pchip')) { go(a.href, true); } return; }
      var more = e.target.closest('a.vpa-more-btn');
      if (more) { e.preventDefault(); loadMore(more); return; }
      var q = e.target.closest('.vpa-faq-q');
      if (q) {
        var open = q.getAttribute('aria-expanded') === 'true';
        $$('.vpa-faq-q', root).forEach(function (x) {
          var on = x === q && !open;
          x.setAttribute('aria-expanded', on ? 'true' : 'false');
          var ans = document.getElementById(x.getAttribute('aria-controls'));
          if (ans) { ans.hidden = !on; }
        });
      }
    });
    /* quick add: the card is a link, so stop it in the capture phase */
    root.addEventListener('click', function (e) {
      var b = e.target.closest('.vpa-grid .vrc-btn');
      if (!b) { return; }
      e.preventDefault(); e.stopPropagation();
      addToCart(b);
    }, true);
    window.addEventListener('popstate', function () { go(location.href, false); });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
