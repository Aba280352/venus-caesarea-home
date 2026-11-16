<?php
/**
 * Venus thank-you page (order-received) + light styling for the Z-Credit order-pay page. Loaded by venus-cart.php.
 * Same switch as cart/checkout (cookie vns_ct / option venus_ct_live).
 * Demo without placing an order: /checkout/order-received/0/?vns_ct=1&vns_ty_demo=1 (in-memory order, never saved).
 * User decisions (2026-11-16): order summary only, personal heading with first name, short and clean (back to shop).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function vty_here() { return vct_on() && function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-received' ); }
function vpy_here() { return vct_on() && function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-pay' ); }

add_filter( 'body_class', function ( $c ) {
	if ( vty_here() ) { $c[] = 'vty'; }
	if ( vpy_here() ) { $c[] = 'vpy'; }
	return $c;
} );

/* Our template replaces checkout/thankyou.php; the order-details table WC adds on woocommerce_thankyou is
   dropped (our summary replaces it) but the action itself still fires for gateways / tracking plugins. */
add_filter( 'wc_get_template', function ( $located, $name ) {
	if ( 'checkout/thankyou.php' === $name && vty_here() ) { return VCT_DIR . 'templates/thankyou.php'; }
	return $located;
}, 20, 2 );
add_action( 'wp', function () {
	if ( vty_here() ) { remove_action( 'woocommerce_thankyou', 'woocommerce_order_details_table', 10 ); }
} );

/* In-memory demo order (preview only; nothing is saved, no emails, no Linet). */
function vty_demo_order() {
	if ( ! vct_preview() || empty( $_GET['vns_ty_demo'] ) ) { return null; }
	$o = new WC_Order();
	$o->set_billing_first_name( 'דנה' );
	$o->set_billing_last_name( 'כהן' );
	$o->set_billing_email( 'dana@example.com' );
	$o->set_billing_phone( '0500000000' );
	$pick = 'pickup' === ( $_GET['vns_ty_demo'] ?? '' );
	$o->set_shipping_first_name( 'נועה' );
	$o->set_shipping_last_name( 'לוי' );
	$o->set_shipping_city( 'קיסריה' );
	$o->set_shipping_address_1( 'הרקיע 1' );
	$o->set_shipping_address_2( 'קומה 2, דירה 5' );
	$o->set_shipping_phone( '0500000001' );
	$sub = 0;
	foreach ( array( 1217 => 1, 2058 => 1 ) as $pid => $q ) {
		$p = wc_get_product( $pid );
		if ( ! $p ) { continue; }
		$it = new WC_Order_Item_Product();
		$it->set_product( $p );
		$it->set_quantity( $q );
		$it->set_subtotal( $p->get_price() * $q );
		$it->set_total( $p->get_price() * $q );
		$o->add_item( $it );
		$sub += $p->get_price() * $q;
	}
	$sh = new WC_Order_Item_Shipping();
	$sh->set_method_title( $pick ? 'איסוף מכתובת החנות: הרקיע 1, קיסריה' : 'תעריף קיסריה' );
	$sh->set_method_id( $pick ? 'local_pickup' : 'flat_rate' );
	$sh->set_total( $pick ? 0 : 20 );
	$o->add_item( $sh );
	$o->set_shipping_total( $pick ? 0 : 20 );
	$o->set_total( $sub + ( $pick ? 0 : 20 ) );
	$o->set_payment_method_title( 'תשלום מאובטח בכרטיס אשראי' );
	$o->set_date_created( time() );
	$o->set_status( 'processing' );
	$o->update_meta_data( '_vns_delivery_date', ( new DateTimeImmutable( 'tomorrow', wp_timezone() ) )->format( 'Y-m-d' ) );
	$o->update_meta_data( '_vns_delivery_slot', '12-16' );
	$o->update_meta_data( '_vns_greeting', "מזל טוב ליום ההולדת!\nאוהבים, דנה ויואב" );
	return $o;
}

/* Title above the Z-Credit payment frame (order-pay). */
add_action( 'woocommerce_before_template_part', function ( $name ) {
	if ( 'checkout/order-receipt.php' !== $name || ! vpy_here() ) { return; }
	echo '<div class="vck-head"><div class="vct-top"><h1 class="vct-title">תשלום <b>מאובטח</b></h1>'
		. '<ol class="vct-steps" aria-label="שלבי ההזמנה"><li class="is-done"><b>' . vct_icon( 'check' ) . '</b>עגלה</li><li class="is-on"><b>2</b>פרטים ותשלום</li><li><b>3</b>אישור הזמנה</li></ol></div>'
		. '<p class="vpy-sub">' . vct_icon( 'shield-check' ) . 'ממלאים את פרטי הכרטיס בעמוד המאובטח של זד קרדיט. אחרי התשלום תועברו לאישור ההזמנה.</p></div>';
} );

add_action( 'wp_enqueue_scripts', function () {
	if ( ! vty_here() && ! vpy_here() ) { return; }
	wp_enqueue_style( 'venus-thankyou', VCT_URL . 'assets/thankyou.css', array(), filemtime( VCT_DIR . 'assets/thankyou.css' ) );
}, 20 );
