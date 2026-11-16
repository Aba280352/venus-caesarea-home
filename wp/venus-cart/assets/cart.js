/* Venus cart: move extras into the block cart, keep the header badge in sync, add-ons via the Store API. */
(function () {
	'use strict';
	var STORE = 'wc/store/cart';
	var d = document;

	function store() { return window.wp && wp.data && wp.data.select(STORE) ? wp.data : null; }

	/* ---- header cart badge (Elementor menu cart) ---- */
	var lastCount = null, fragTimer = null;
	function setBadge(n) {
		d.querySelectorAll('.elementor-button-icon-qty').forEach(function (el) {
			el.textContent = n;
			el.setAttribute('data-counter', n);
		});
	}
	function onCount(n) {
		if (n === lastCount) { return; }
		var first = lastCount === null;
		lastCount = n;
		setBadge(n);
		d.body.classList.toggle('vct-is-empty', n === 0);
		if (!first && window.jQuery) {
			clearTimeout(fragTimer);
			/* refresh the mini-cart dropdown contents too (classic fragments) */
			fragTimer = setTimeout(function () { jQuery(d.body).trigger('wc_fragment_refresh'); }, 400);
		}
		markInCart();
	}

	/* ---- extras into the React tree ---- */
	function place() {
		var main = d.querySelector('.wc-block-cart .wc-block-cart__main');
		var side = d.querySelector('.wc-block-cart .wc-block-cart__sidebar');
		var ship = d.getElementById('vct-ship');
		var trust = d.getElementById('vct-trust');
		if (main && ship && ship.parentNode !== main) { main.appendChild(ship); }
		if (side && trust && trust.parentNode !== side) { side.appendChild(trust); }
	}

	/* ---- add-ons ---- */
	function cartIds() {
		var s = store();
		if (!s) { return []; }
		var c = s.select(STORE).getCartData();
		return (c && c.items ? c.items : []).map(function (i) { return i.id; });
	}
	function markInCart() {
		var ids = cartIds();
		d.querySelectorAll('.vct-add').forEach(function (b) {
			if (b.classList.contains('is-busy')) { return; }
			var inCart = ids.indexOf(parseInt(b.getAttribute('data-pid'), 10)) !== -1;
			b.classList.toggle('is-in', inCart);
		});
	}
	d.addEventListener('click', function (e) {
		var b = e.target.closest ? e.target.closest('.vct-add') : null;
		if (!b || b.classList.contains('is-busy')) { return; }
		e.preventDefault();
		var s = store();
		var pid = parseInt(b.getAttribute('data-pid'), 10);
		if (!s || !pid) { location.href = '?add-to-cart=' + pid; return; }
		var label = b.querySelector('span');
		var orig = label.textContent;
		b.classList.add('is-busy');
		label.textContent = 'מוסיף…';
		s.dispatch(STORE).addItemToCart(pid, 1).then(function () {
			b.classList.remove('is-busy');
			b.classList.add('is-done');
			label.textContent = 'נוסף';
			setTimeout(function () { b.classList.remove('is-done'); label.textContent = orig; markInCart(); }, 1800);
		}).catch(function () {
			b.classList.remove('is-busy');
			label.textContent = orig;
			location.href = b.closest('.vct-card').querySelector('a').href;
		});
	});

	/* ---- boot ---- */
	function boot() {
		place();
		var mo = new MutationObserver(function () { place(); });
		var root = d.querySelector('.vct-wrap') || d.body;
		mo.observe(root, { childList: true, subtree: true });
		var s = store();
		if (!s) { return; }
		var read = function () {
			var c = s.select(STORE).getCartData();
			if (!c || !c.items) { return; }
			onCount(c.itemsCount || 0);
		};
		s.subscribe(read);
		read();
	}
	if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
