/* Venus Product Page - gallery, quantity, add-ons total, tabs, FAQ, sticky bar, AJAX add to cart (product + add-ons). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function init() {
    var pd = $('.vpd');
    if (!pd || pd.getAttribute('data-vpd') === '1') { return; }
    pd.setAttribute('data-vpd', '1');
    var fmt = function (n) { return '₪' + Math.round(n).toLocaleString('en-US'); };

    /* gallery: thumbnails + hover zoom */
    var main = $('.pd-main', pd), mainImg = main && $('img', main);
    $$('.pd-th', pd).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!mainImg) { return; }
        mainImg.src = b.getAttribute('data-src');
        var set = b.getAttribute('data-srcset');
        if (set) { mainImg.srcset = set; } else { mainImg.removeAttribute('srcset'); }
        $$('.pd-th', pd).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      });
    });
    if (main && window.matchMedia && window.matchMedia('(hover:hover)').matches) {
      main.addEventListener('mouseenter', function () { main.classList.add('is-zoom'); });
      main.addEventListener('mouseleave', function () { main.classList.remove('is-zoom'); });
      main.addEventListener('mousemove', function (e) {
        var r = main.getBoundingClientRect();
        mainImg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      });
    }

    /* quantity + running total */
    var priceEl = $('.pd-price', pd), base = Number(priceEl && priceEl.getAttribute('data-base')) || 0;
    var qtyIn = $('.pd-q-in', pd), totals = $$('[data-total]', pd);
    var qty = function () { return Math.min(20, Math.max(1, parseInt(qtyIn && qtyIn.value, 10) || 1)); };
    var update = function () {
      var adds = $$('.pd-add-in:checked', pd).reduce(function (s, i) { return s + (Number(i.getAttribute('data-price')) || 0); }, 0);
      totals.forEach(function (t) { t.textContent = fmt(base * qty() + adds); });
    };
    var step = function (d) { if (qtyIn) { qtyIn.value = Math.min(20, Math.max(1, qty() + d)); update(); } };
    var qm = $('.pd-q-m', pd), qp = $('.pd-q-p', pd);
    if (qm) { qm.addEventListener('click', function () { step(-1); }); }
    if (qp) { qp.addEventListener('click', function () { step(1); }); }
    if (qtyIn) {
      qtyIn.addEventListener('input', update);
      qtyIn.addEventListener('blur', function () { qtyIn.value = qty(); update(); });
    }
    $$('.pd-add-in', pd).forEach(function (i) { i.addEventListener('change', update); });
    update();

    /* add to cart: product + checked add-ons via WooCommerce AJAX, fallback = normal form post */
    var form = $('#pd-form', pd);
    var ctas = $$('.pd-cta', pd);
    var flash = function (txt) {
      ctas.forEach(function (b) {
        var t = $('.pd-cta-t', b);
        if (!t) { return; }
        var old = t.getAttribute('data-old') || t.textContent;
        t.setAttribute('data-old', old);
        t.textContent = txt;
        setTimeout(function () { t.textContent = old; }, 1800);
      });
    };
    var post = function (id, q) {
      var fd = new FormData();
      fd.append('product_id', id);
      fd.append('quantity', q);
      return fetch((window.VPP && window.VPP.ajax) || '/?wc-ajax=add_to_cart', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json(); });
    };
    if (form && window.fetch && window.VPP && window.VPP.ajax) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.getAttribute('data-busy')) { return; }
        form.setAttribute('data-busy', '1');
        var mainId = $('.single_add_to_cart_button', form).value;
        var adds = $$('.pd-add-in:checked', pd);
        var last = null, failed = false;
        post(mainId, qty()).then(function (r) {
          if (!r || r.error) { throw new Error('main'); }
          last = r;
          return adds.reduce(function (p, i) {
            return p.then(function () {
              return post(i.getAttribute('data-id'), 1).then(function (rr) { if (rr && !rr.error) { last = rr; } else { failed = true; } });
            });
          }, Promise.resolve());
        }).then(function () {
          form.removeAttribute('data-busy');
          adds.forEach(function (i) { i.checked = false; });
          update();
          if (window.jQuery && last) {
            window.jQuery(document.body).trigger('added_to_cart', [last.fragments, last.cart_hash, window.jQuery(ctas[0])]);
            window.jQuery(document.body).trigger('wc_fragment_refresh');
          }
          flash(failed ? 'חלק מהפריטים לא נוספו' : 'נוסף לעגלה ✓');
        }).catch(function () {
          form.removeAttribute('data-busy');
          HTMLFormElement.prototype.submit.call(form);
        });
      });
    }

    /* tabs */
    var tabs = $$('.pd-tab', pd);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) {
          var on = x === t;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
          var panel = document.getElementById(x.getAttribute('aria-controls'));
          if (panel) { panel.hidden = !on; }
        });
      });
    });

    /* FAQ accordion */
    $$('.pd-faq-q', pd).forEach(function (q) {
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        $$('.pd-faq-q', pd).forEach(function (x) {
          var on = x === q && !open;
          x.setAttribute('aria-expanded', on ? 'true' : 'false');
          var a = document.getElementById(x.getAttribute('aria-controls'));
          if (a) { a.hidden = !on; }
        });
      });
    });

    /* sticky order bar: shows when the main button leaves the screen (always on mobile via CSS) */
    var bar = $('.pd-bar'), cta = $('#pd-cta');
    if (bar && cta && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var e = en[0];
        bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(cta);
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
