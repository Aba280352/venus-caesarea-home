/* Venus Gift Card - amount pills, custom amount, live total + card preview amount, message counter, light validation. */
(function () {
  'use strict';
  function init() {
    var f = document.querySelector('.vgc-form');
    if (!f || f.getAttribute('data-b')) { return; }
    f.setAttribute('data-b', '1');
    var pills = [].slice.call(f.querySelectorAll('.vgc-pill'));
    var hidden = f.querySelector('input[name=vgc_amount]');
    var custom = f.querySelector('#vgc-custom');
    var err = f.querySelector('[data-err=amt]');
    var totals = [].slice.call(document.querySelectorAll('[data-gc-total],[data-gc-amt]'));
    var msg = f.querySelector('#vgc-msg'), count = f.querySelector('[data-gc-count]');
    var MIN = Number(custom.min) || 100, MAX = Number(custom.max) || 2000;
    var fmt = function (n) { return '₪' + Math.round(n).toLocaleString('en-US'); };
    var value = function () { return custom.value !== '' ? Number(custom.value) : Number(hidden.value); };
    var paint = function () {
      var v = value();
      var ok = v >= MIN && v <= MAX && Math.floor(v) === v;
      totals.forEach(function (t) { t.textContent = ok ? fmt(v) : '₪0'; });
      return ok;
    };
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        pills.forEach(function (x) { var on = x === p; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        hidden.value = p.getAttribute('data-v');
        custom.value = '';
        err.hidden = true;
        paint();
      });
    });
    custom.addEventListener('input', function () {
      if (custom.value !== '') { pills.forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); }); }
      else if (!f.querySelector('.vgc-pill.is-on') && pills[2]) { pills[2].click(); return; }
      err.hidden = paint() || custom.value === '';
    });
    if (msg && count) {
      var c = function () { count.textContent = msg.value.length; };
      msg.addEventListener('input', c); c();
    }
    f.addEventListener('submit', function (e) {
      var bad = null;
      if (!paint()) { err.hidden = false; bad = custom; }
      [].slice.call(f.querySelectorAll('[required]')).forEach(function (i) {
        var invalid = !i.value.trim() || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()));
        i.classList.toggle('is-bad', invalid);
        if (invalid && !bad) { bad = i; }
      });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
    paint();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
