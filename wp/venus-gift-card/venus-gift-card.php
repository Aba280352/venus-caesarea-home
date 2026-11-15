<?php
/**
 * Plugin Name: Venus Gift Card
 * Description: Digital gift cards for Venus Caesarea: amount picker (100-500 + custom), recipient details, optional send date, unique code (WooCommerce coupon) with running balance, branded email to recipient + copy to buyer, admin screen for in-store redemption. Preview: ?vns_gc=1 on the gift card product until go-live (option venus_gc_live).
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VGC_VER', '1.0.0' );
define( 'VGC_URL', plugin_dir_url( __FILE__ ) );
define( 'VGC_DIR', plugin_dir_path( __FILE__ ) );
define( 'VGC_MIN', 100 );
define( 'VGC_MAX', 2000 );

function vgc_amounts() { return array( 100, 150, 200, 250, 300, 400, 500 ); }
function vgc_pid() { return (int) get_option( 'venus_gc_product_id' ); }
function vgc_live() { return (bool) get_option( 'venus_gc_live' ); }
function vgc_preview() { return ! empty( $_REQUEST['vns_gc'] ); }
function vgc_is_gc( $id ) { return vgc_pid() && (int) $id === vgc_pid(); }
function vgc_money( $n ) { $n = (float) $n; return '₪' . number_format( $n, floor( $n ) == $n ? 0 : 2, '.', ',' ); }
function vgc_today() { return wp_date( 'Y-m-d' ); }

/* ================= visibility / preview ================= */
add_action( 'template_redirect', function () {
	if ( ! is_singular( 'product' ) || ! vgc_is_gc( get_queried_object_id() ) ) { return; }
	if ( vgc_preview() ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
		return;
	}
	if ( ! vgc_live() && ! current_user_can( 'edit_products' ) ) {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
	}
}, 1 );
add_filter( 'wp_robots', function ( $r ) {
	if ( is_singular( 'product' ) && vgc_is_gc( get_queried_object_id() ) && ( vgc_preview() || ! vgc_live() ) ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );
/* the gift card page uses its own Elementor template (live single-product template stays for all other products) */
add_filter( 'elementor/theme/get_location_templates/template_id', function ( $id ) {
	if ( ! is_singular( 'product' ) || ! vgc_is_gc( get_queried_object_id() ) ) { return $id; }
	if ( ! vgc_live() && ! vgc_preview() ) { return $id; }
	if ( 'product' === get_post_meta( $id, '_elementor_template_type', true ) ) {
		$t = (int) get_option( 'venus_gc_template_id' );
		return $t ? $t : $id;
	}
	return $id;
}, 20, 1 );

/* ================= cart ================= */
function vgc_posted() {
	$g = function ( $k ) { return isset( $_POST[ $k ] ) ? trim( (string) wp_unslash( $_POST[ $k ] ) ) : ''; };
	$custom = $g( 'vgc_custom' );
	$amount = '' !== $custom ? $custom : $g( 'vgc_amount' );
	return array(
		'amount'   => (float) str_replace( ',', '', $amount ),
		'to_name'  => sanitize_text_field( $g( 'vgc_to_name' ) ),
		'to_email' => sanitize_email( $g( 'vgc_to_email' ) ),
		'from'     => sanitize_text_field( $g( 'vgc_from' ) ),
		'msg'      => sanitize_textarea_field( mb_substr( $g( 'vgc_msg' ), 0, 300 ) ),
		'date'     => preg_match( '/^\d{4}-\d{2}-\d{2}$/', $g( 'vgc_date' ) ) ? $g( 'vgc_date' ) : '',
	);
}
add_filter( 'woocommerce_add_to_cart_validation', function ( $ok, $pid ) {
	if ( ! vgc_is_gc( $pid ) ) { return $ok; }
	if ( ! vgc_live() && ! vgc_preview() ) { wc_add_notice( 'הגיפט קארד עדיין לא זמין לרכישה.', 'error' ); return false; }
	$d = vgc_posted();
	$err = array();
	if ( $d['amount'] < VGC_MIN || $d['amount'] > VGC_MAX || floor( $d['amount'] ) != $d['amount'] ) { $err[] = 'בחרו סכום בין ₪' . VGC_MIN . ' ל־₪' . number_format( VGC_MAX ) . ' (מספר שלם).'; }
	if ( '' === $d['to_name'] ) { $err[] = 'מלאו את שם המקבל.'; }
	if ( ! is_email( $d['to_email'] ) ) { $err[] = 'מלאו כתובת מייל תקינה של המקבל.'; }
	if ( '' === $d['from'] ) { $err[] = 'מלאו ממי המתנה.'; }
	if ( $d['date'] ) {
		$max = wp_date( 'Y-m-d', time() + YEAR_IN_SECONDS );
		if ( $d['date'] < vgc_today() || $d['date'] > $max ) { $err[] = 'תאריך השליחה צריך להיות מהיום ועד שנה קדימה.'; }
	}
	foreach ( $err as $e ) { wc_add_notice( $e, 'error' ); }
	return $err ? false : $ok;
}, 10, 2 );
add_filter( 'woocommerce_add_cart_item_data', function ( $data, $pid ) {
	if ( ! vgc_is_gc( $pid ) ) { return $data; }
	$data['vgc'] = vgc_posted();
	$data['vgc_key'] = wp_generate_uuid4(); /* every card is its own cart line */
	return $data;
}, 10, 2 );
add_filter( 'woocommerce_add_to_cart_quantity', function ( $q, $pid ) { return vgc_is_gc( $pid ) ? 1 : $q; }, 10, 2 );
add_filter( 'woocommerce_cart_item_quantity', function ( $html, $key, $item ) { return isset( $item['vgc'] ) ? '1' : $html; }, 10, 3 );
add_action( 'woocommerce_before_calculate_totals', function ( $cart ) {
	foreach ( $cart->get_cart() as $key => $item ) {
		if ( ! isset( $item['vgc']['amount'] ) ) { continue; }
		if ( (int) $item['quantity'] !== 1 ) { $cart->cart_contents[ $key ]['quantity'] = 1; } /* one code per line */
		$item['data']->set_price( (float) $item['vgc']['amount'] );
	}
}, 20 );
/* block cart / checkout: no quantity stepper on gift card lines */
add_filter( 'woocommerce_store_api_product_quantity_editable', function ( $editable, $product, $item = null ) {
	return ( $product && vgc_is_gc( $product->get_id() ) ) ? false : $editable;
}, 10, 3 );
add_filter( 'woocommerce_store_api_product_quantity_maximum', function ( $max, $product ) {
	return ( $product && vgc_is_gc( $product->get_id() ) ) ? 1 : $max;
}, 10, 2 );
add_filter( 'woocommerce_cart_item_name', function ( $name, $item ) {
	return isset( $item['vgc'] ) ? $name . ' – ' . esc_html( vgc_money( $item['vgc']['amount'] ) ) : $name;
}, 10, 2 );
function vgc_rows( $d ) {
	$r = array(
		'למי'          => $d['to_name'] . ' (' . $d['to_email'] . ')',
		'מאת'          => $d['from'],
		'מועד שליחה'   => $d['date'] ? wp_date( 'd/m/Y', strtotime( $d['date'] . ' 12:00' ) ) . ' בבוקר' : 'מיד אחרי התשלום',
	);
	if ( '' !== $d['msg'] ) { $r['ברכה'] = $d['msg']; }
	return $r;
}
add_filter( 'woocommerce_get_item_data', function ( $out, $item ) {
	if ( ! isset( $item['vgc'] ) ) { return $out; }
	foreach ( vgc_rows( $item['vgc'] ) as $k => $v ) { $out[] = array( 'key' => $k, 'value' => esc_html( $v ) ); }
	return $out;
}, 10, 2 );
add_action( 'woocommerce_checkout_create_order_line_item', function ( $item, $key, $values ) {
	if ( ! isset( $values['vgc'] ) ) { return; }
	foreach ( vgc_rows( $values['vgc'] ) as $k => $v ) { $item->add_meta_data( $k, $v ); }
	$item->add_meta_data( '_vgc_data', wp_json_encode( $values['vgc'] ) );
}, 10, 3 );
add_filter( 'woocommerce_add_to_cart_redirect', function ( $url, $product = null ) {
	return ( $product && vgc_is_gc( $product->get_id() ) ) ? wc_get_cart_url() : $url;
}, 10, 2 );

/* ================= issue codes when the order is paid ================= */
function vgc_new_code() {
	$abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
	do {
		$s = '';
		for ( $i = 0; $i < 8; $i++ ) { $s .= $abc[ random_int( 0, strlen( $abc ) - 1 ) ]; }
		$code = 'VENUS-' . substr( $s, 0, 4 ) . '-' . substr( $s, 4 );
	} while ( wc_get_coupon_id_by_code( $code ) );
	return $code;
}
function vgc_issue( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order ) { return; }
	foreach ( $order->get_items() as $item_id => $item ) {
		$raw = $item->get_meta( '_vgc_data' );
		if ( ! $raw || $item->get_meta( '_vgc_coupon_id' ) ) { continue; }
		$d = json_decode( $raw, true );
		if ( ! $d ) { continue; }
		$c = new WC_Coupon();
		$c->set_code( vgc_new_code() );
		$c->set_discount_type( 'fixed_cart' );
		$c->set_amount( (float) $d['amount'] );
		$c->set_individual_use( false );
		$c->set_exclude_product_ids( array( vgc_pid() ) );
		$c->set_description( 'גיפט קארד – הזמנה #' . $order->get_order_number() . ' – ל' . $d['to_name'] );
		$cid = $c->save();
		$meta = array( '_vgc' => 1, '_vgc_initial' => (float) $d['amount'], '_vgc_order' => $order->get_id(), '_vgc_to_name' => $d['to_name'], '_vgc_to_email' => $d['to_email'],
			'_vgc_from' => $d['from'], '_vgc_msg' => $d['msg'], '_vgc_date' => $d['date'], '_vgc_buyer' => $order->get_billing_email(), '_vgc_sent' => '' );
		foreach ( $meta as $k => $v ) { update_post_meta( $cid, $k, $v ); }
		vgc_log( $cid, 'נוצר מהזמנה #' . $order->get_order_number() . ' בסך ' . vgc_money( $d['amount'] ) );
		$item->update_meta_data( '_vgc_coupon_id', $cid );
		$item->update_meta_data( 'קוד גיפט קארד', $c->get_code() );
		$item->save();
		$order->add_order_note( 'גיפט קארד ' . $c->get_code() . ' (' . vgc_money( $d['amount'] ) . ') נוצר עבור ' . $d['to_email'] . ( $d['date'] && $d['date'] > vgc_today() ? ' – יישלח ב־' . $d['date'] : ' – נשלח עכשיו' ) . '.' );
		if ( $d['date'] && $d['date'] > vgc_today() ) {
			$ts = ( new DateTime( $d['date'] . ' 08:00', wp_timezone() ) )->getTimestamp();
			wp_schedule_single_event( $ts, 'vgc_send_event', array( $cid ) );
		} else {
			vgc_send( $cid );
		}
		vgc_send_buyer_copy( $cid );
	}
}
add_action( 'woocommerce_order_status_processing', 'vgc_issue', 20 );
add_action( 'woocommerce_order_status_completed', 'vgc_issue', 20 );
add_action( 'vgc_send_event', 'vgc_send' );

function vgc_log( $cid, $txt ) {
	$l = get_post_meta( $cid, '_vgc_log', true );
	$l = is_array( $l ) ? $l : array();
	$l[] = array( wp_date( 'd/m/Y H:i' ), $txt );
	update_post_meta( $cid, '_vgc_log', $l );
}
function vgc_balance( $cid ) { return (float) ( new WC_Coupon( $cid ) )->get_amount(); }
function vgc_set_balance( $cid, $amt, $why ) {
	$c = new WC_Coupon( $cid );
	$c->set_amount( max( 0, round( (float) $amt, 2 ) ) );
	$c->save();
	vgc_log( $cid, $why . ' → יתרה ' . vgc_money( $c->get_amount() ) );
}

/* ================= running balance ================= */
add_filter( 'woocommerce_coupon_is_valid', function ( $valid, $coupon ) {
	if ( ! get_post_meta( $coupon->get_id(), '_vgc', true ) ) { return $valid; }
	if ( get_post_meta( $coupon->get_id(), '_vgc_void', true ) ) { throw new Exception( 'הגיפט קארד הזה בוטל.' ); }
	if ( (float) $coupon->get_amount() <= 0 ) { throw new Exception( 'היתרה בגיפט קארד הזה נוצלה במלואה.' ); }
	return $valid;
}, 10, 2 );
function vgc_deduct( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order ) { return; }
	foreach ( $order->get_items( 'coupon' ) as $ci ) {
		$cid = wc_get_coupon_id_by_code( $ci->get_code() );
		if ( ! $cid || ! get_post_meta( $cid, '_vgc', true ) || $order->get_meta( '_vgc_used_' . $cid ) ) { continue; }
		$used = (float) $ci->get_discount() + (float) $ci->get_discount_tax();
		$order->update_meta_data( '_vgc_used_' . $cid, $used );
		$order->save();
		vgc_set_balance( $cid, vgc_balance( $cid ) - $used, 'מומש באתר בהזמנה #' . $order->get_order_number() . ': ' . vgc_money( $used ) );
	}
}
add_action( 'woocommerce_order_status_processing', 'vgc_deduct', 10 );
add_action( 'woocommerce_order_status_completed', 'vgc_deduct', 10 );
add_action( 'woocommerce_order_status_on-hold', 'vgc_deduct', 10 );
function vgc_restore( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order ) { return; }
	foreach ( $order->get_items( 'coupon' ) as $ci ) {
		$cid = wc_get_coupon_id_by_code( $ci->get_code() );
		$used = $cid ? (float) $order->get_meta( '_vgc_used_' . $cid ) : 0;
		if ( $used <= 0 ) { continue; }
		$order->delete_meta_data( '_vgc_used_' . $cid );
		$order->save();
		vgc_set_balance( $cid, vgc_balance( $cid ) + $used, 'הוחזר אחרי ביטול הזמנה #' . $order->get_order_number() . ': ' . vgc_money( $used ) );
	}
	/* a cancelled/refunded gift card purchase voids its codes */
	foreach ( $order->get_items() as $item ) {
		$cid = (int) $item->get_meta( '_vgc_coupon_id' );
		if ( $cid && ! get_post_meta( $cid, '_vgc_void', true ) ) {
			update_post_meta( $cid, '_vgc_void', 1 );
			vgc_log( $cid, 'בוטל (הזמנת הרכישה בוטלה/הוחזרה)' );
			wp_clear_scheduled_hook( 'vgc_send_event', array( $cid ) );
		}
	}
}
add_action( 'woocommerce_order_status_cancelled', 'vgc_restore' );
add_action( 'woocommerce_order_status_refunded', 'vgc_restore' );

/* ================= emails ================= */
function vgc_email_html( $cid, $buyer_note = '' ) {
	$c = new WC_Coupon( $cid );
	$m = function ( $k ) use ( $cid ) { return (string) get_post_meta( $cid, $k, true ); };
	$img = get_the_post_thumbnail_url( vgc_pid(), 'large' );
	$logo = wp_get_attachment_url( get_theme_mod( 'custom_logo' ) );
	$shop = function_exists( 'wc_get_page_id' ) ? get_permalink( wc_get_page_id( 'shop' ) ) : home_url( '/' );
	$g = '#3A4831'; $ink = '#141414'; $cream = '#FFFBE9';
	$font = "font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;";
	ob_start(); ?>
<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>גיפט קארד – ונוס קיסריה</title></head>
<body style="margin:0;padding:0;background:<?php echo $cream; ?>;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:<?php echo $cream; ?>;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;direction:rtl;text-align:right;<?php echo $font; ?>color:<?php echo $ink; ?>;">
<?php if ( $buyer_note ) : ?><tr><td style="padding:14px 28px;background:<?php echo $g; ?>;color:#ffffff;font-size:14px;line-height:1.5;"><?php echo esc_html( $buyer_note ); ?></td></tr><?php endif; ?>
<tr><td align="center" style="padding:28px 28px 8px;"><?php if ( $logo ) : ?><img src="<?php echo esc_url( $logo ); ?>" width="180" alt="ונוס קיסריה" style="display:block;width:180px;height:auto;border:0;"><?php endif; ?></td></tr>
<tr><td style="padding:16px 28px 0;"><?php if ( $img ) : ?><img src="<?php echo esc_url( $img ); ?>" width="544" alt="גיפט קארד ונוס קיסריה" style="display:block;width:100%;height:auto;border:0;border-radius:14px;"><?php endif; ?></td></tr>
<tr><td style="padding:28px 28px 0;font-size:28px;line-height:1.25;font-weight:bold;">היי <?php echo esc_html( $m( '_vgc_to_name' ) ); ?>, קיבלת גיפט קארד מ<?php echo esc_html( $m( '_vgc_from' ) ); ?> 🌸</td></tr>
<?php if ( '' !== $m( '_vgc_msg' ) ) : ?><tr><td style="padding:18px 28px 0;"><div style="background:<?php echo $cream; ?>;border-radius:12px;padding:18px 20px;font-size:17px;line-height:1.6;white-space:pre-line;"><?php echo esc_html( $m( '_vgc_msg' ) ); ?><div style="margin-top:8px;font-size:15px;color:#555;">– <?php echo esc_html( $m( '_vgc_from' ) ); ?></div></div></td></tr><?php endif; ?>
<tr><td align="center" style="padding:28px 28px 0;">
<div style="font-size:15px;color:#555;">סכום הגיפט קארד</div>
<div style="font-size:44px;font-weight:bold;color:<?php echo $g; ?>;line-height:1.2;"><?php echo esc_html( vgc_money( $m( '_vgc_initial' ) ) ); ?></div>
<div style="margin-top:16px;font-size:15px;color:#555;">הקוד האישי שלך</div>
<div style="display:inline-block;margin-top:6px;padding:14px 26px;border:2px dashed <?php echo $g; ?>;border-radius:12px;font-size:26px;font-weight:bold;letter-spacing:2px;direction:ltr;color:<?php echo $ink; ?>;"><?php echo esc_html( $c->get_code() ); ?></div>
</td></tr>
<tr><td style="padding:28px 28px 0;font-size:16px;line-height:1.7;">
<div style="font-size:19px;font-weight:bold;margin-bottom:6px;">איך מממשים?</div>
<div>• <b>באתר:</b> מוסיפים מוצרים לסל ומזינים את הקוד בשדה "קוד קופון" בקופה.</div>
<div>• <b>בחנות:</b> מציגים את הקוד בחנות שלנו במרכז המסחרי C-CENTER, הרקיע 1, קיסריה.</div>
<div style="margin-top:8px;color:#555;font-size:14px;">הגיפט קארד ללא תוקף, ואפשר לממש אותו בכמה הזמנות עד שהיתרה נגמרת. דמי משלוח, אם יש, משולמים בנפרד.</div>
</td></tr>
<tr><td align="center" style="padding:28px;"><a href="<?php echo esc_url( $shop ); ?>" style="display:inline-block;background:<?php echo $g; ?>;color:#ffffff;text-decoration:none;font-size:17px;font-weight:bold;padding:14px 34px;border-radius:12px;">לבחירת מתנה באתר</a></td></tr>
<tr><td align="center" style="padding:18px 28px 26px;border-top:1px solid #eee;font-size:13px;line-height:1.6;color:#777;">ונוס קיסריה – חנות פרחים ומתנות · הרקיע 1, קיסריה · <a href="https://wa.me/972532791444" style="color:<?php echo $g; ?>;">053-279-1444</a><br><a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="color:<?php echo $g; ?>;">venus-caesarea.net</a></td></tr>
</table></td></tr></table></body></html>
	<?php
	return ob_get_clean();
}
function vgc_headers() {
	$name = get_option( 'woocommerce_email_from_name', get_bloginfo( 'name' ) );
	$addr = get_option( 'woocommerce_email_from_address', get_option( 'admin_email' ) );
	return array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . $name . ' <' . $addr . '>' );
}
function vgc_send( $cid ) {
	if ( get_post_meta( $cid, '_vgc_void', true ) ) { return false; }
	$to = get_post_meta( $cid, '_vgc_to_email', true );
	$from = get_post_meta( $cid, '_vgc_from', true );
	$ok = wp_mail( $to, 'קיבלת גיפט קארד מ' . $from . ' – ונוס קיסריה 🌸', vgc_email_html( $cid ), vgc_headers() );
	update_post_meta( $cid, '_vgc_sent', $ok ? wp_date( 'd/m/Y H:i' ) : '' );
	vgc_log( $cid, $ok ? 'נשלח למקבל (' . $to . ')' : 'שליחה למקבל נכשלה (' . $to . ')' );
	return $ok;
}
function vgc_send_buyer_copy( $cid ) {
	$buyer = get_post_meta( $cid, '_vgc_buyer', true );
	if ( ! is_email( $buyer ) ) { return; }
	$d = get_post_meta( $cid, '_vgc_date', true );
	$to = get_post_meta( $cid, '_vgc_to_email', true );
	$when = ( $d && $d > vgc_today() ) ? 'יישלח אל ' . $to . ' ב־' . wp_date( 'd/m/Y', strtotime( $d . ' 12:00' ) ) . ' בבוקר.' : 'נשלח עכשיו אל ' . $to . '.';
	$note = 'עותק בשבילך: הגיפט קארד ' . $when . ' שמרו את המייל הזה למקרה הצורך.';
	$ok = wp_mail( $buyer, 'עותק: הגיפט קארד ל' . get_post_meta( $cid, '_vgc_to_name', true ) . ' – ונוס קיסריה', vgc_email_html( $cid, $note ), vgc_headers() );
	vgc_log( $cid, $ok ? 'עותק נשלח לקונה (' . $buyer . ')' : 'עותק לקונה נכשל (' . $buyer . ')' );
}

/* ================= admin: list, resend, in-store redemption ================= */
add_action( 'admin_menu', function () {
	add_submenu_page( 'woocommerce', 'גיפט קארד', 'גיפט קארד', 'manage_woocommerce', 'venus-gift-cards', 'vgc_admin_page' );
}, 60 );
add_action( 'admin_post_vgc_action', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) ) { wp_die( 'אין הרשאה' ); }
	check_admin_referer( 'vgc_action' );
	$cid = isset( $_POST['cid'] ) ? (int) $_POST['cid'] : 0;
	$do = isset( $_POST['do'] ) ? sanitize_key( $_POST['do'] ) : '';
	$msg = '';
	if ( $cid && get_post_meta( $cid, '_vgc', true ) ) {
		if ( 'redeem' === $do ) {
			$amt = isset( $_POST['amt'] ) ? (float) $_POST['amt'] : 0;
			$bal = vgc_balance( $cid );
			if ( $amt > 0 && $amt <= $bal ) {
				vgc_set_balance( $cid, $bal - $amt, 'מומש בחנות: ' . vgc_money( $amt ) . ' (' . wp_get_current_user()->display_name . ')' );
				$msg = 'redeemed';
			} else { $msg = 'badamt'; }
		} elseif ( 'resend' === $do ) {
			$msg = vgc_send( $cid ) ? 'sent' : 'sendfail';
		}
	}
	wp_safe_redirect( add_query_arg( array( 'page' => 'venus-gift-cards', 'vgc_msg' => $msg, 's' => isset( $_POST['s'] ) ? sanitize_text_field( wp_unslash( $_POST['s'] ) ) : '' ), admin_url( 'admin.php' ) ) );
	exit;
} );
function vgc_admin_page() {
	$s = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
	$args = array( 'post_type' => 'shop_coupon', 'post_status' => 'publish', 'posts_per_page' => 100, 'meta_key' => '_vgc', 'meta_value' => 1, 'orderby' => 'date', 'order' => 'DESC' );
	if ( $s ) { $args['s'] = $s; }
	$q = new WP_Query( $args );
	$msgs = array( 'redeemed' => 'המימוש נרשם והיתרה עודכנה.', 'badamt' => 'סכום לא תקין (גדול מהיתרה או אפס).', 'sent' => 'הגיפט קארד נשלח שוב למקבל.', 'sendfail' => 'השליחה נכשלה.' );
	echo '<div class="wrap" dir="rtl"><h1>גיפט קארד</h1>';
	if ( ! empty( $_GET['vgc_msg'] ) && isset( $msgs[ $_GET['vgc_msg'] ] ) ) { echo '<div class="notice notice-info"><p>' . esc_html( $msgs[ $_GET['vgc_msg'] ] ) . '</p></div>'; }
	echo '<p>מימוש בחנות: מחפשים את הקוד שהלקוח מציג, מזינים את סכום הקנייה ולוחצים "מימוש בחנות". היתרה מתעדכנת מיד וגם תקפה באתר.</p>';
	echo '<form method="get"><input type="hidden" name="page" value="venus-gift-cards"><input type="search" name="s" value="' . esc_attr( $s ) . '" placeholder="חיפוש לפי קוד"> <button class="button">חיפוש</button></form><br>';
	echo '<table class="widefat striped"><thead><tr><th>קוד</th><th>סכום</th><th>יתרה</th><th>למי</th><th>מאת</th><th>הזמנה</th><th>נשלח</th><th>מימוש בחנות</th><th>היסטוריה</th></tr></thead><tbody>';
	if ( ! $q->have_posts() ) { echo '<tr><td colspan="9">אין עדיין גיפט קארדים.</td></tr>'; }
	foreach ( $q->posts as $p ) {
		$cid = $p->ID; $m = function ( $k ) use ( $cid ) { return get_post_meta( $cid, $k, true ); };
		$void = $m( '_vgc_void' );
		$sent = $m( '_vgc_sent' ) ? esc_html( $m( '_vgc_sent' ) ) : ( $m( '_vgc_date' ) ? 'מתוזמן ל־' . esc_html( $m( '_vgc_date' ) ) : '—' );
		$order = $m( '_vgc_order' );
		$form = function ( $do, $inner ) use ( $cid, $s ) {
			return '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline-flex;gap:4px;align-items:center">' . wp_nonce_field( 'vgc_action', '_wpnonce', true, false )
				. '<input type="hidden" name="action" value="vgc_action"><input type="hidden" name="cid" value="' . $cid . '"><input type="hidden" name="do" value="' . $do . '"><input type="hidden" name="s" value="' . esc_attr( $s ) . '">' . $inner . '</form>';
		};
		$log = '';
		foreach ( (array) $m( '_vgc_log' ) as $l ) { if ( is_array( $l ) ) { $log .= esc_html( $l[0] . ' – ' . $l[1] ) . '<br>'; } }
		echo '<tr><td><code style="direction:ltr">' . esc_html( get_the_title( $cid ) ) . '</code>' . ( $void ? '<br><b style="color:#b32d2e">בוטל</b>' : '' ) . '</td>'
			. '<td>' . esc_html( vgc_money( $m( '_vgc_initial' ) ) ) . '</td><td><b>' . esc_html( vgc_money( vgc_balance( $cid ) ) ) . '</b></td>'
			. '<td>' . esc_html( $m( '_vgc_to_name' ) ) . '<br><small>' . esc_html( $m( '_vgc_to_email' ) ) . '</small></td><td>' . esc_html( $m( '_vgc_from' ) ) . '</td>'
			. '<td>' . ( $order ? '<a href="' . esc_url( admin_url( 'post.php?post=' . (int) $order . '&action=edit' ) ) . '">#' . (int) $order . '</a>' : '—' ) . '</td>'
			. '<td>' . $sent . ( $void ? '' : '<br>' . $form( 'resend', '<button class="button-link">שליחה מחדש</button>' ) ) . '</td>'
			. '<td>' . ( $void ? '—' : $form( 'redeem', '<input type="number" name="amt" min="1" step="0.01" style="width:90px" placeholder="₪"><button class="button">מימוש בחנות</button>' ) ) . '</td>'
			. '<td><details><summary>הצגה</summary><small>' . $log . '</small></details></td></tr>';
	}
	echo '</tbody></table></div>';
}

/* ================= front: shortcodes for the gift card template ================= */
function vgc_assets() {
	static $done = false;
	if ( $done ) { return; }
	$done = true;
	if ( function_exists( 'vpp_assets' ) ) { vpp_assets(); } /* tabs + FAQ from the product page script */
	wp_enqueue_script( 'venus-gift-card', VGC_URL . 'assets/gift-card.js', array(), filemtime( VGC_DIR . 'assets/gift-card.js' ), true );
}
add_shortcode( 'vns_gc_crumbs', function () {
	return '<nav class="pd-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a><i aria-hidden="true">›</i><span>גיפט קארד</span></nav>';
} );
add_shortcode( 'vns_gc_gallery', function () {
	$id = vgc_pid();
	$img = get_post_thumbnail_id( $id );
	return '<div class="pd-gal vgc-gal"><div class="pd-main vgc-main">' . ( $img ? wp_get_attachment_image( $img, 'large', false, array( 'alt' => 'גיפט קארד ונוס קיסריה', 'loading' => 'eager', 'sizes' => '(max-width:767px) 92vw, 620px' ) ) : '' )
		. '<span class="vgc-amt" data-gc-amt aria-hidden="true">' . esc_html( vgc_money( 200 ) ) . '</span></div></div>';
} );
add_shortcode( 'vns_gc_head', function () {
	$p = wc_get_product( vgc_pid() );
	if ( ! $p ) { return ''; }
	return '<h1 class="pd-title">' . esc_html( $p->get_name() ) . '</h1>'
		. ( $p->get_short_description() ? '<p class="pd-short">' . esc_html( wp_strip_all_tags( $p->get_short_description() ) ) . '</p>' : '' )
		. '<div class="pd-price-row"><span class="pd-price vgc-price">' . esc_html( vgc_money( VGC_MIN ) . '–' . vgc_money( 500 ) ) . '</span></div>'
		. '<p class="pd-note">* ללא תוקף · אפשר לממש בכמה הזמנות עד שהיתרה נגמרת · באתר ובחנות</p>';
} );
add_shortcode( 'vns_gc_form', function () {
	vgc_assets();
	$pid = vgc_pid();
	$v = function ( $k, $def = '' ) { return isset( $_POST[ $k ] ) ? esc_attr( wp_unslash( $_POST[ $k ] ) ) : $def; };
	$cur = $v( 'vgc_custom' ) ? '' : $v( 'vgc_amount', '200' );
	$pills = '';
	foreach ( vgc_amounts() as $a ) {
		$pills .= '<button type="button" class="vgc-pill' . ( (string) $a === (string) $cur ? ' is-on' : '' ) . '" data-v="' . $a . '" aria-pressed="' . ( (string) $a === (string) $cur ? 'true' : 'false' ) . '">' . esc_html( vgc_money( $a ) ) . '</button>';
	}
	$total = $v( 'vgc_custom' ) ? (float) $v( 'vgc_custom' ) : (float) $cur;
	$today = vgc_today();
	$max = wp_date( 'Y-m-d', time() + YEAR_IN_SECONDS );
	return '<form class="vgc-form cart" method="post" action="' . esc_url( add_query_arg( vgc_preview() ? array( 'vns_gc' => '1' ) : array(), get_permalink( $pid ) ) ) . '" novalidate>'
		. '<fieldset class="vgc-amounts"><legend class="vgc-lbl">בחרו סכום</legend><div class="vgc-pills">' . $pills . '</div>'
		. '<div class="vgc-custom"><label for="vgc-custom">או הזינו סכום אחר</label><div class="vgc-cwrap"><span aria-hidden="true">₪</span><input type="number" id="vgc-custom" name="vgc_custom" min="' . VGC_MIN . '" max="' . VGC_MAX . '" step="1" inputmode="numeric" placeholder="' . VGC_MIN . '–' . number_format( VGC_MAX ) . '" value="' . $v( 'vgc_custom' ) . '"></div>'
		. '<span class="vgc-err" data-err="amt" hidden>סכום בין ₪' . VGC_MIN . ' ל־₪' . number_format( VGC_MAX ) . '</span></div>'
		. '<input type="hidden" name="vgc_amount" value="' . esc_attr( $cur ) . '"></fieldset>'
		. '<div class="vgc-fields">'
		. '<div class="vgc-f"><label for="vgc-to-name">שם המקבל <i>*</i></label><input type="text" id="vgc-to-name" name="vgc_to_name" required autocomplete="off" value="' . $v( 'vgc_to_name' ) . '"></div>'
		. '<div class="vgc-f"><label for="vgc-to-email">המייל של המקבל <i>*</i></label><input type="email" id="vgc-to-email" name="vgc_to_email" required dir="ltr" autocomplete="off" value="' . $v( 'vgc_to_email' ) . '"></div>'
		. '<div class="vgc-f"><label for="vgc-from">ממי המתנה <i>*</i></label><input type="text" id="vgc-from" name="vgc_from" required value="' . $v( 'vgc_from' ) . '"></div>'
		. '<div class="vgc-f"><label for="vgc-date">תאריך שליחה</label><input type="date" id="vgc-date" name="vgc_date" min="' . $today . '" max="' . $max . '" value="' . $v( 'vgc_date' ) . '"><span class="vgc-hint">ריק = נשלח מיד אחרי התשלום. בתאריך עתידי – בבוקר של אותו יום.</span></div>'
		. '<div class="vgc-f vgc-full"><label for="vgc-msg">ברכה אישית</label><textarea id="vgc-msg" name="vgc_msg" rows="4" maxlength="300" placeholder="מזל טוב! שתבחרי משהו שעושה לך שמח 🌷">' . ( isset( $_POST['vgc_msg'] ) ? esc_textarea( wp_unslash( $_POST['vgc_msg'] ) ) : '' ) . '</textarea><span class="vgc-count"><b data-gc-count>0</b>/300</span></div>'
		. '</div>'
		. '<input type="hidden" name="quantity" value="1">' . ( vgc_preview() ? '<input type="hidden" name="vns_gc" value="1">' : '' )
		. '<button type="submit" name="add-to-cart" value="' . esc_attr( $pid ) . '" class="pd-cta vgc-cta single_add_to_cart_button"><span class="pd-cta-t">הוספה לעגלה</span><span class="pd-cta-sum">· <b data-gc-total>' . esc_html( vgc_money( $total ) ) . '</b></span></button>'
		. '<p class="vgc-secure">תשלום מאובטח · השובר נשלח במייל עם קוד אישי · עותק נשלח גם אליכם</p>'
		. '</form>';
} );
