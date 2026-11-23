/* Venus checkout: shipping-method chips (mirror the real radios), date + time window, greeting counter. */
jQuery(function ($) {
	'use strict';
	var $body = $(document.body);

	function isPick(v) { return String(v).indexOf('local_pickup') === 0; }

	/* ---- shipping method chips: the real radios stay in the summary table (WC re-renders it) ---- */
	function methods() {
		var $box = $('#vck-methods');
		if (!$box.length) { return; }
		var $in = $('#shipping_method input');
		var anyDelivery = false, pickOn = false;
		$box.empty();
		$in.each(function () {
			var pick = isPick(this.value);
			var on = this.type === 'hidden' || this.checked;
			if (!pick) { anyDelivery = true; }
			if (pick && on) { pickOn = true; }
			var $lab = $('label[for="' + this.id + '"]').clone();
			var price = $.trim($lab.find('.amount').first().text());
			$lab.find('.amount').remove();
			var title = $.trim($lab.text()).replace(/[:\s]+$/, '');
			var $b = $('<button type="button" class="vck-opt" role="radio"></button>')
				.attr({ 'aria-checked': on ? 'true' : 'false', 'data-for': this.id })
				.toggleClass('is-on', on);
			var place = title.replace(/^(תעריף|משלוח)\s*(ל-?)?\s*/, '');
			$b.append($('<b>').text(pick ? 'איסוף עצמי מהחנות' : 'משלוח עד הדלת'));
			$b.append($('<span>').text(pick ? 'הרקיע 1, קיסריה · חינם' : [place, price].filter(Boolean).join(' · ')));
			$box.append($b);
		});
		/* below the delivery minimum the server offers pickup only and leaves a flag row in the summary */
		var $hint = $('#vck-method-hint'), $min = $('.vck-min-flag');
		if (!$hint.data('base')) { $hint.data('base', $hint.text()); }
		if ($min.length) {
			$hint.text('משלוח עד הדלת אפשרי מהזמנה של ₪' + $min.data('min') + ', לא כולל דמי משלוח. חסרים עוד ₪' + $min.data('short') + '. איסוף עצמי מהחנות אפשרי בכל סכום.').prop('hidden', false);
		} else {
			$hint.text($hint.data('base')).prop('hidden', anyDelivery);
		}
		$('#vck-when').toggleClass('is-pickup', pickOn);
		$('#vck-day-lbl').text(pickOn ? 'באיזה יום תגיעו לאסוף?' : 'באיזה יום לשלוח?');
		$('#vck-slot-lbl').text(pickOn ? 'באיזו שעה בערך?' : 'באיזו שעה?');
	}
	$(document).on('click', '.vck-opt', function () {
		var r = document.getElementById(this.getAttribute('data-for'));
		/* a real click, so the TZD script knows pickup was chosen by hand */
		if (r && r.type === 'radio' && !r.checked) { r.click(); }
	});
	$body.on('updated_checkout', methods);
	methods();

	/* ---- date + slot ---- */
	function pick($set, $el) {
		$set.removeClass('is-on').attr('aria-checked', 'false');
		$el.addClass('is-on').attr('aria-checked', 'true');
	}
	$(document).on('click', '.vck-day', function () {
		var $d = $(this);
		pick($('.vck-day'), $d);
		$('#vns_delivery_date').val($d.data('d'));
		var fri = String($d.data('fri')) === '1';
		/* Friday: 09-12 and 12-14 only */
		$('.vck-slot').each(function () {
			var $s = $(this), isFriOnly = $s.hasClass('is-fri');
			var show = fri ? String($s.data('fri')) === '1' : !isFriOnly;
			$s.prop('hidden', !show);
			if (!show && $s.hasClass('is-on')) { $s.removeClass('is-on').attr('aria-checked', 'false'); $('#vns_delivery_slot').val(''); }
		});
		$('.vck-days, .vck-slots').removeClass('is-err');
	});
	$(document).on('click', '.vck-slot', function () {
		pick($('.vck-slot'), $(this));
		$('#vns_delivery_slot').val($(this).data('s'));
		$('.vck-slots').removeClass('is-err');
	});
	/* keyboard: arrows move inside a radio group */
	$(document).on('keydown', '.vck-day, .vck-slot, .vck-opt', function (e) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
		var $all = $(this).parent().children(':visible');
		var i = $all.index(this) + (e.key === 'ArrowLeft' ? 1 : -1); /* RTL */
		if (i >= 0 && i < $all.length) { e.preventDefault(); $all.eq(i).focus().click(); }
	});
	/* mark missing picks when WooCommerce reports errors */
	$body.on('checkout_error', function () {
		if (!$('#vns_delivery_date').val()) { $('.vck-days').addClass('is-err'); }
		if (!$('#vns_delivery_slot').val()) { $('.vck-slots').addClass('is-err'); }
	});

	/* ---- greeting counter ---- */
	$(document).on('input', '#vns_greeting', function () {
		$('.vck-count i').text(this.value.length);
	});
});
