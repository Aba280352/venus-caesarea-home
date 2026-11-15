/* Venus Blog - copy link, TOC close-on-jump (mobile), magazine chips without reload + load more. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var busy = false;

  function getDoc(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); })
      .then(function (h) { return new DOMParser().parseFromString(h, 'text/html'); });
  }
  function swap(sel, doc) {
    var cur = $(sel), nxt = doc.querySelector(sel);
    if (!cur || !nxt) { return false; }
    (cur.closest('.elementor-widget') || cur).replaceWith(document.importNode(nxt.closest('.elementor-widget') || nxt, true));
    return true;
  }
  function go(url, push) {
    if (busy) { return; }
    busy = true;
    var list = $('.vbl-alist'); if (list) { list.style.opacity = '.45'; }
    getDoc(url).then(function (doc) {
      if (!swap('.vbl-ahead', doc) || !swap('.vbl-alist', doc)) { throw new Error('parts'); }
      if (doc.title) { document.title = doc.title; }
      if (push) { history.pushState({ vbl: 1 }, '', url); }
      busy = false;
    }).catch(function () { window.location.href = url; });
  }
  function more(btn) {
    if (busy) { return; }
    busy = true;
    btn.textContent = 'טוען…';
    getDoc(btn.href).then(function (doc) {
      var grid = $('.vbl-agrid');
      $$('.vbl-agrid .vbl-card', doc).forEach(function (c) { grid.appendChild(document.importNode(c, true)); });
      var cur = $('.vbl-amore'), nxt = doc.querySelector('.vbl-amore');
      if (cur && nxt) { cur.replaceWith(document.importNode(nxt, true)); }
      busy = false;
    }).catch(function () { window.location.href = btn.href; });
  }

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('a.vbl-chip');
    if (chip && $('.vbl-alist') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); if (!chip.classList.contains('is-on')) { go(chip.href, true); } return; }
    var mb = e.target.closest('a.vbl-more-btn');
    if (mb) { e.preventDefault(); more(mb); return; }
    var cp = e.target.closest('.vbl-copy');
    if (cp) {
      var done = function () { var m = $('.vbl-copied'); if (m) { m.hidden = false; setTimeout(function () { m.hidden = true; }, 1800); } };
      if (navigator.clipboard) { navigator.clipboard.writeText(cp.getAttribute('data-url')).then(done, done); } else { done(); }
      return;
    }
    var tl = e.target.closest('.vbl-toc a');
    if (tl && window.matchMedia('(max-width:767px)').matches) { var d = tl.closest('details'); if (d) { d.open = false; } }
  });
  window.addEventListener('popstate', function () { if ($('.vbl-alist')) { go(location.href, false); } });
})();
