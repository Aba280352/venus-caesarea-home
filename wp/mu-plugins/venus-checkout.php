<?php
/**
 * Venus checkout (TZD, 27.10.2026):
 * - delivery only to the city list, rate set by city (venus_ck_prices), local pickup stays
 * - shipping details first, "billing same as shipping" checkbox copies them to billing
 * - floor / apartment saved into address line 2 so the Woo app shows them
 * Rollback: delete this file and restore option venus_checkout_backup_20261027.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

/* Delivery price per city (client list, 24.11.2026). Caesarea uses instance 8, every other city instance 9 with its own price. */
function venus_ck_prices() {
	return array(
		'קיסריה' => 20,
		'אור ים' => 25, 'אור עקיבא' => 30, 'בית חנניה' => 45, 'בנימינה' => 45, 'גבעת עדה' => 45,
		'גן שומרון' => 40, 'גן שלמה' => 40, 'גן שמואל' => 40, 'זכרון יעקב' => 45, 'חדרה' => 40,
		'מעגן מיכאל' => 25, 'משמרות' => 45, 'עין עירון' => 40, 'עין שמר' => 45, 'עמיקם' => 45,
		'פרדס חנה כרכור' => 45, 'שדות ים' => 25, 'תלמי אלעזר' => 45,
	);
}
function venus_ck_zones() {
	$z = array();
	foreach ( venus_ck_prices() as $c => $p ) $z[ $c ] = 'קיסריה' === $c ? 'caesarea' : 'other';
	return $z;
}
function venus_ck_norm( $c ) {
	$c = str_replace( array( '–', '—', '-' ), ' ', (string) $c );
	return trim( preg_replace( '/\s+/u', ' ', $c ) );
}
function venus_ck_zone( $city ) {
	$z = venus_ck_zones();
	$c = venus_ck_norm( $city );
	return isset( $z[ $c ] ) ? $z[ $c ] : null;
}

// Rates by city: Caesarea = instances 8 / 6, other listed cities = 9 / 7, anywhere else = pickup only.
add_filter( 'woocommerce_package_rates', function ( $rates, $package ) {
	$zone = venus_ck_zone( isset( $package['destination']['city'] ) ? $package['destination']['city'] : '' );
	foreach ( $rates as $id => $rate ) {
		if ( 'local_pickup' === $rate->get_method_id() ) continue;
		$iid = (int) $rate->get_instance_id();
		if ( ! $zone
			|| ( 'caesarea' === $zone && in_array( $iid, array( 9, 7 ), true ) )
			|| ( 'other' === $zone && in_array( $iid, array( 8, 6 ), true ) ) ) {
			unset( $rates[ $id ] );
			continue;
		}
		/* price and label by city; taxes scale with the new cost */
		$city   = venus_ck_norm( $package['destination']['city'] );
		$prices = venus_ck_prices();
		if ( isset( $prices[ $city ] ) && 'flat_rate' === $rate->get_method_id() ) {
			$old = (float) $rate->get_cost();
			$new = (float) $prices[ $city ];
			if ( $old > 0 && abs( $old - $new ) > 0.001 ) {
				$tx = array();
				foreach ( (array) $rate->get_taxes() as $k => $t ) $tx[ $k ] = $t * $new / $old;
				$rate->set_taxes( $tx );
			}
			$rate->set_cost( $new );
			$rate->set_label( 'משלוח ל' . $city );
		}
	}
	return $rates;
}, 100, 2 );

// Always deliver to the shipping fields; the "different address" checkbox is only a heading now.
add_filter( 'woocommerce_ship_to_different_address_checked', '__return_true' );

add_filter( 'woocommerce_checkout_fields', function ( $f ) {
	if ( isset( $f['shipping']['shipping_city'] ) ) {
		$opts = array( '' => 'בחרו עיר' );
		foreach ( array_keys( venus_ck_zones() ) as $c ) $opts[ $c ] = $c;
		$f['shipping']['shipping_city']['type']     = 'select';
		$f['shipping']['shipping_city']['options']  = $opts;
		$f['shipping']['shipping_city']['required'] = true;
		$f['shipping']['shipping_city']['class'][]  = 'update_totals_on_change';
	}
	// Billing is copied from shipping when the box is checked, so only shipping errors are shown.
	if ( ! empty( $_POST['venus_billing_same'] ) ) {
		foreach ( array( 'first_name', 'last_name', 'city', 'address_1', 'house_number', 'floor', 'apartment', 'phone' ) as $k ) {
			if ( isset( $f['billing'][ 'billing_' . $k ] ) ) $f['billing'][ 'billing_' . $k ]['required'] = false;
		}
	}
	return $f;
}, 9999 );

// The terms label has a link, show it as text in the required notice instead of raw HTML.
add_filter( 'woocommerce_checkout_required_field_notice', function ( $notice ) {
	return strip_tags( html_entity_decode( $notice ), '<strong>' );
} );

add_filter( 'gettext', function ( $t, $orig, $domain ) {
	if ( 'woocommerce' !== $domain ) return $t;
	if ( 'Ship to a different address?' === $orig ) return 'פרטי משלוח';
	if ( 'Billing details' === $orig || 'Billing &amp; Shipping' === $orig ) return 'פרטי המזמין';
	return $t;
}, 20, 3 );

// "Billing same as shipping" checkbox, checked by default.
add_action( 'woocommerce_before_checkout_billing_form', function () {
	$checked = ! isset( $_POST['post_data'] ) && ! isset( $_POST['billing_first_name'] ) ? true : ! empty( $_POST['venus_billing_same'] );
	echo '<p class="form-row form-row-wide venus-same-row"><label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox"><input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox" id="venus_billing_same" name="venus_billing_same" value="1"' . ( $checked ? ' checked' : '' ) . '> <span>פרטי החיוב זהים לפרטי המשלוח</span></label></p>';
} );

// Server side: copy shipping into billing when the box is checked, always ship to the shipping fields.
add_filter( 'woocommerce_checkout_posted_data', function ( $d ) {
	if ( ! empty( $_POST['venus_billing_same'] ) ) {
		foreach ( array( 'first_name', 'last_name', 'city', 'address_1', 'house_number', 'floor', 'apartment', 'phone' ) as $k ) {
			$d[ 'billing_' . $k ] = isset( $d[ 'shipping_' . $k ] ) ? $d[ 'shipping_' . $k ] : '';
		}
	}
	$d['ship_to_different_address'] = 1;
	if ( empty( $d['billing_country'] ) ) $d['billing_country'] = 'IL';
	if ( empty( $d['shipping_country'] ) ) $d['shipping_country'] = 'IL';
	return $d;
} );

add_action( 'woocommerce_after_checkout_validation', function ( $data, $errors ) {
	$pickup = false;
	foreach ( (array) ( isset( $data['shipping_method'] ) ? $data['shipping_method'] : array() ) as $m ) {
		if ( 0 === strpos( (string) $m, 'local_pickup' ) ) $pickup = true;
	}
	if ( ! $pickup && ! venus_ck_zone( isset( $data['shipping_city'] ) ? $data['shipping_city'] : '' ) ) {
		$errors->add( 'shipping', 'משלוחים יוצאים רק לערים שברשימה. אפשר לבחור עיר מהרשימה או איסוף עצמי מהחנות.' );
	}
}, 10, 2 );

// Floor / apartment into address line 2 (the Woo app shows address lines, not custom fields).
add_action( 'woocommerce_checkout_create_order', function ( $order, $data ) {
	foreach ( array( 'shipping', 'billing' ) as $s ) {
		// Street and house number are separate fields; the order keeps them as one address line.
		$st = isset( $data[ $s . '_address_1' ] ) ? trim( $data[ $s . '_address_1' ] ) : '';
		$no = isset( $data[ $s . '_house_number' ] ) ? trim( $data[ $s . '_house_number' ] ) : '';
		if ( '' !== $no ) {
			$line = trim( $st . ' ' . $no );
			if ( 'shipping' === $s ) $order->set_shipping_address_1( $line );
			else $order->set_billing_address_1( $line );
		}
		$p = array();
		// "0" means a private house: nothing to add.
		$fl = isset( $data[ $s . '_floor' ] ) ? trim( $data[ $s . '_floor' ] ) : '';
		$ap = isset( $data[ $s . '_apartment' ] ) ? trim( $data[ $s . '_apartment' ] ) : '';
		if ( '' !== $fl && '0' !== $fl ) $p[] = 'קומה ' . $fl;
		if ( '' !== $ap && '0' !== $ap ) $p[] = 'דירה ' . $ap;
		if ( $p ) {
			if ( 'shipping' === $s ) $order->set_shipping_address_2( implode( ', ', $p ) );
			else $order->set_billing_address_2( implode( ', ', $p ) );
		}
	}
	if ( ! $order->get_shipping_country() ) $order->set_shipping_country( 'IL' );
	if ( ! $order->get_billing_country() ) $order->set_billing_country( 'IL' );
}, 20, 2 );

// Layout: shipping first, billing (with the checkbox) below it.
add_action( 'wp_head', function () {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_order_received_page() ) return;
	?>
<style id="venus-checkout">
#customer_details{display:flex;flex-direction:column}
#customer_details .col-1,#customer_details .col-2{width:100%;max-width:100%;float:none}
#customer_details .col-2{order:-1;margin-bottom:24px}
#ship-to-different-address input{display:none}
#ship-to-different-address label{cursor:default;padding:0}
#ship-to-different-address label span{font-size:inherit;font-weight:inherit}
.woocommerce-shipping-fields .shipping_address{display:block!important}
form.checkout input[type=tel]{direction:rtl;text-align:right}
form.checkout input[type=tel]::placeholder{text-align:right}
.venus-same-row label{display:flex;align-items:center;gap:8px;font-weight:600}
body.venus-same .woocommerce-billing-fields__field-wrapper>.form-row:not(#billing_email_field):not(#termconfirm_field){display:none}
</style>
<script>
jQuery(function($){
	var keys=['first_name','last_name','city','address_1','house_number','floor','apartment','phone'];
	function copy(){ if(!$('#venus_billing_same').is(':checked')) return; keys.forEach(function(k){ var v=$('#shipping_'+k).val(); if(v!==undefined) $('#billing_'+k).val(v); }); }
	function toggle(){ $('body').toggleClass('venus-same',$('#venus_billing_same').is(':checked')); copy(); }
	$(document.body).on('change','#venus_billing_same',toggle);
	$(document.body).on('input change','.woocommerce-shipping-fields :input',copy);
	$('form.checkout').on('checkout_place_order',function(){ copy(); return true; });
	toggle();
	// Delivery is the default once a city with delivery is chosen; pickup only when the customer clicks it.
	var pickupManual=false;
	$(document.body).on('click','#shipping_method input',function(){ pickupManual=String(this.value).indexOf('local_pickup')===0; });
	$(document.body).on('updated_checkout',function(){
		if(pickupManual) return;
		var $sel=$('#shipping_method input:checked'), $del=$('#shipping_method input').filter(function(){ return String(this.value).indexOf('local_pickup')!==0; }).first();
		if($del.length && $sel.length && String($sel.val()).indexOf('local_pickup')===0){ $del.prop('checked',true).trigger('change'); }
	});
});
</script>
	<?php
} );
