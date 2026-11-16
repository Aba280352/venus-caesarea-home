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

    /* quantity + running total (main product only - add-ons go to the cart on tap) */
    var priceEl = $('.pd-price', pd), base = Number(priceEl && priceEl.getAttribute('data-base')) || 0;
    var qtyIn = $('.pd-q-in', pd), totals = $$('[data-total]', pd);
    var qty = function () { return Math.min(20, Math.max(1, parseInt(qtyIn && qtyIn.value, 10) || 1)); };
    var update = function () {
      totals.forEach(function (t) { t.textContent = fmt(base * qty()); });
    };
    var step = function (d) { if (qtyIn) { qtyIn.value = Math.min(20, Math.max(1, qty() + d)); update(); } };
    var qm = $('.pd-q-m', pd), qp = $('.pd-q-p', pd);
    if (qm) { qm.addEventListener('click', function () { step(-1); }); }
    if (qp) { qp.addEventListener('click', function () { step(1); }); }
    if (qtyIn) {
      qtyIn.addEventListener('input', update);
      qtyIn.addEventListener('blur', function () { qtyIn.value = qty(); update(); });
    }
    update();

    /* header cart badge + mini cart: refresh from WooCommerce fragments */
    var syncHeader = function () {
      if (window.jQuery) { window.jQuery(document.body).trigger('wc_fragment_refresh'); }
    };
    /* small confirmation toast (aria-live) */
    var toastEl = null, toastT = 0;
    var toast = function (txt, bad) {
      if (!toastEl) {
        var st = document.createElement('style');
        st.textContent = '.vpp-toast{position:fixed;left:50%;bottom:96px;z-index:99999;transform:translate(-50%,12px);max-width:calc(100% - 32px);padding:12px 20px;border-radius:12px;background:#3A4831;color:#fff;font:500 16px/1.35 inherit;font-family:inherit;box-shadow:0 8px 24px rgba(20,20,20,.18);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;text-align:center}.vpp-toast.is-on{opacity:1;transform:translate(-50%,0)}.vpp-toast.is-bad{background:#8A2B1D}@media(min-width:1025px){.vpp-toast{bottom:32px}}.vpd .pd-add.is-busy{opacity:.6;pointer-events:none}.vpd a.added_to_cart{display:none!important}';
        document.head.appendChild(st);
        toastEl = document.createElement('div');
        toastEl.className = 'vpp-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = txt;
      toastEl.classList.toggle('is-bad', !!bad);
      toastEl.classList.add('is-on');
      clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
    };

    /* add-ons: tap = add to cart now, tap again = remove (WooCommerce Store API) */
    var STORE = '/wp-json/wc/store/v1/cart';
    var nonce = '';
    var store = function (path, method, body) {
      var h = { 'Content-Type': 'application/json' };
      if (nonce) { h.Nonce = nonce; }
      return fetch(STORE + path, { method: method || 'GET', credentials: 'same-origin', headers: h, body: body ? JSON.stringify(body) : undefined })
        .then(function (r) {
          var n = r.headers.get('Nonce');
          if (n) { nonce = n; }
          return r.json().then(function (j) { if (!r.ok) { throw j; } return j; });
        });
    };
    var cardOf = function (inp) { return inp.closest('.pd-add') || inp.closest('label') || inp.parentElement; };
    var nameOf = function (inp) { var n = cardOf(inp).querySelector('.pd-add-name,.pd-add-t,b,h3'); return n ? n.textContent.trim() : ''; };
    var inCart = {}; /* product id -> cart item {key, quantity} */
    var readCart = function (cart) {
      inCart = {};
      (cart.items || []).forEach(function (it) { inCart[String(it.id)] = { key: it.key, quantity: it.quantity }; });
      $$('.pd-add-in', pd).forEach(function (i) { i.checked = !!inCart[i.getAttribute('data-id')]; });
    };
    var addIns = $$('.pd-add-in', pd);
    if (addIns.length && window.fetch) {
      store('').then(readCart).catch(function () {});
      addIns.forEach(function (inp) {
        inp.addEventListener('change', function () {
          var id = inp.getAttribute('data-id'), card = cardOf(inp), want = inp.checked;
          card.classList.add('is-busy');
          var p;
          if (want) {
            p = store('/add-item', 'POST', { id: Number(id), quantity: 1 });
          } else {
            var it = inCart[id];
            if (!it) { card.classList.remove('is-busy'); return; }
            p = it.quantity > 1
              ? store('/update-item', 'POST', { key: it.key, quantity: it.quantity - 1 })
              : store('/remove-item', 'POST', { key: it.key });
          }
          p.then(function (cart) {
            readCart(cart);
            if (!want && inCart[id]) { inp.checked = false; }
            syncHeader();
            toast(want ? 'נוסף לעגלה: ' + nameOf(inp) : 'הוסר מהעגלה: ' + nameOf(inp));
          }).catch(function (err) {
            inp.checked = !want;
            toast((err && err.message) ? String(err.message).replace(/<[^>]+>/g, '') : 'לא הצלחנו לעדכן את העגלה. נסו שוב.', true);
          }).then(function () { card.classList.remove('is-busy'); });
        });
      });
    }

    /* add to cart: main product via WooCommerce AJAX, fallback = normal form post */
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
        ctas.forEach(function (b) { b.classList.add('is-busy'); });
        post(mainId, qty()).then(function (r) {
          if (!r || r.error) { throw new Error('main'); }
          form.removeAttribute('data-busy');
          ctas.forEach(function (b) { b.classList.remove('is-busy'); });
          if (window.jQuery) {
            /* no button passed: WooCommerce would add its own pink "view cart" link next to ours */
            window.jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash]);
          }
          syncHeader();
          flash('נוסף לעגלה ✓');
          toast('נוסף לעגלה ✓');
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
