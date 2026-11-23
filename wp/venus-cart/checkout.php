<?php
/**
 * Venus checkout redesign (classic shortcode checkout, page 239). Loaded by venus-cart.php.
 * Same switch as the cart: preview cookie vns_ct (?vns_ct=1) or option venus_ct_live.
 * Works on top of the TZD mu-plugin venus-checkout.php (city select, rates by city, billing-same box).
 *
 * Adds: numbered one-page layout, delivery / pickup date + time window (from tomorrow, no Saturday,
 * Friday until 14:00, longer lead time for made-to-order bouquets; same day = WhatsApp), greeting-card
 * field, summary sidebar with thumbnails, payment section in the main column.
 * Greeting / date are saved as order meta only (NOT the customer note: Linet copies the note onto the invoice).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function vck_here() {
	if ( ! vct_on() || ! function_exists( 'is_checkout' ) || ! is_checkout() ) { return false; }
	if ( is_wc_endpoint_url( 'order-received' ) || is_wc_endpoint_url( 'order-pay' ) ) { return false; }
	return true;
}

/* ---------- delivery calendar ---------- */
function vck_slots( $dow ) {
	if ( 6 === $dow ) { return array(); }
	if ( 5 === $dow ) { return array( '09-12' => '09:00 עד 12:00', '12-14' => '12:00 עד 14:00' ); }
	return array( '09-12' => '09:00 עד 12:00', '12-16' => '12:00 עד 16:00', '16-20' => '16:00 עד 20:00' );
}
/* Made-to-order items (lead time from each product page). Override per product with meta _vns_lead_days. */
function vck_lead_map() {
	return apply_filters( 'vck_lead_days_map', array( 2161 => 14, 2163 => 14, 2159 => 14, 1783 => 14, 1256 => 7 ) );
}
function vck_lead_days() {
	$n = 1;
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) { return $n; }
	$map = vck_lead_map();
	foreach ( WC()->cart->get_cart() as $it ) {
		$pid = (int) $it['product_id'];
		$m   = (int) get_post_meta( $pid, '_vns_lead_days', true );
		if ( isset( $map[ $pid ] ) ) { $m = max( $m, (int) $map[ $pid ] ); }
		$n = max( $n, $m );
	}
	return $n;
}
function vck_dates( $count = 21 ) {
	$closed = array_map( 'strval', (array) get_option( 'venus_closed_dates', array() ) ); /* Y-m-d, e.g. holidays */
	$d      = ( new DateTimeImmutable( 'today', wp_timezone() ) )->modify( '+' . vck_lead_days() . ' day' );
	$out    = array();
	for ( $i = 0; $i < 120 && count( $out ) < $count; $i++ ) {
		$k = $d->format( 'Y-m-d' );
		if ( vck_slots( (int) $d->format( 'w' ) ) && ! in_array( $k, $closed, true ) ) { $out[ $k ] = $d; }
		$d = $d->modify( '+1 day' );
	}
	return $out;
}
function vck_day_name( $w ) {
	$n = array( 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת' );
	return $n[ (int) $w ];
}
function vck_when_label( $date, $slot ) {
	$d = DateTimeImmutable::createFromFormat( '!Y-m-d', (string) $date, wp_timezone() );
	if ( ! $d ) { return ''; }
	$s = vck_slots( (int) $d->format( 'w' ) );
	return 'יום ' . vck_day_name( $d->format( 'w' ) ) . ' ' . $d->format( 'd.m.Y' ) . ( isset( $s[ $slot ] ) ? ' · ' . $s[ $slot ] : '' );
}

/* ---------- layout hooks ---------- */
add_action( 'wp', function () {
	if ( ! vck_here() ) { return; }
	remove_action( 'woocommerce_checkout_order_review', 'woocommerce_checkout_payment', 20 );
	/* no 'returning customer? click to log in' notice (user 2026-11-16: not needed) */
	remove_action( 'woocommerce_before_checkout_form', 'woocommerce_checkout_login_form', 10 );
	add_action( 'woocommerce_checkout_after_customer_details', 'vck_payment_section', 10 );
} );
function vck_payment_section() {
	echo '<section class="vck-sec vck-paysec" aria-label="תשלום"><h3 class="vck-h"><b>5</b>תשלום</h3>';
	woocommerce_checkout_payment();
	echo '</section>';
}

add_filter( 'body_class', function ( $c ) {
	if ( vck_here() ) { $c[] = 'vck'; }
	return $c;
} );

add_action( 'woocommerce_before_checkout_form', function () {
	if ( ! vck_here() ) { return; }
	echo '<div class="vck-head">'
		. '<nav class="vct-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a><i>/</i><a href="' . esc_url( wc_get_cart_url() ) . '">עגלת קניות</a><i>/</i><span>פרטים ותשלום</span></nav>'
		. '<div class="vct-top"><h1 class="vct-title">כמעט <b>סיימנו</b></h1>'
		. '<ol class="vct-steps" aria-label="שלבי ההזמנה"><li class="is-done"><a href="' . esc_url( wc_get_cart_url() ) . '"><b>' . vct_icon( 'check' ) . '</b>עגלה</a></li><li class="is-on"><b>2</b>פרטים ותשלום</li><li><b>3</b>אישור הזמנה</li></ol></div>'
		. '</div>';
}, 1 );

add_action( 'woocommerce_checkout_before_order_review_heading', function () {
	if ( vck_here() ) { echo '<aside class="vck-side" aria-label="סיכום הזמנה">'; }
} );
add_action( 'woocommerce_checkout_after_order_review', function () {
	if ( ! vck_here() ) { return; }
	echo '<div class="vck-trust"><ul>'
		. '<li>' . vct_icon( 'shield-check' ) . '<span><b>תשלום מאובטח</b>התשלום בעמוד מוצפן של זד קרדיט</span></li>'
		. '<li>' . vct_icon( 'leaf' ) . '<span><b>פרחים טריים מהחנות</b>כל זר נבנה ביד אצלנו בקיסריה</span></li>'
		. '</ul><a class="vct-wa" href="' . esc_url( vct_wa( 'היי ונוס 🌸 יש לי שאלה לגבי ההזמנה' ) ) . '" target="_blank" rel="noopener">' . vct_icon( 'chat-dots' ) . '<span>שאלה? <b>וואטסאפ</b></span></a></div>'
		. '</aside>';
} );

/* Sections 2 (when) + 3 (greeting) live inside .woocommerce-additional-fields, around the order-notes field. */
add_action( 'woocommerce_before_order_notes', function () {
	if ( ! vck_here() ) { return; }
	$dates = vck_dates();
	$lead  = vck_lead_days();
	$tom   = ( new DateTimeImmutable( 'today', wp_timezone() ) )->modify( '+1 day' )->format( 'Y-m-d' );
	$days  = '';
	foreach ( $dates as $k => $d ) {
		$w     = (int) $d->format( 'w' );
		$days .= '<button type="button" class="vck-day" role="radio" aria-checked="false" data-d="' . esc_attr( $k ) . '" data-fri="' . ( 5 === $w ? 1 : 0 ) . '">'
			. '<small>' . ( $k === $tom ? 'מחר' : 'יום ' . esc_html( vck_day_name( $w ) ) ) . '</small><b>' . esc_html( $d->format( 'd.m' ) ) . '</b></button>';
	}
	$slots = '';
	foreach ( vck_slots( 0 ) as $k => $l ) {
		$slots .= '<button type="button" class="vck-slot" role="radio" aria-checked="false" data-s="' . esc_attr( $k ) . '" data-fri="' . ( isset( vck_slots( 5 )[ $k ] ) ? 1 : 0 ) . '">' . esc_html( $l ) . '</button>';
	}
	$slots .= '<button type="button" class="vck-slot is-fri" role="radio" aria-checked="false" data-s="12-14" data-fri="1" hidden>12:00 עד 14:00</button>';
	echo '<section class="vck-sec vck-when" id="vck-when" aria-label="מועד">'
		. '<h3 class="vck-h"><b>2</b>מתי זה מגיע?</h3>'
		. '<div class="vck-lbl">משלוח או איסוף</div>'
		. '<div class="vck-opts" id="vck-methods" role="radiogroup" aria-label="שיטת משלוח"></div>'
		. '<p class="vck-hint" id="vck-method-hint">בוחרים עיר בחלק 1, ואז מופיעה כאן גם האפשרות למשלוח.</p>'
		. '<div class="vck-lbl" id="vck-day-lbl">באיזה יום?</div>'
		. ( $lead > 1 ? '<p class="vck-hint">יש בעגלה מוצר שמוכן בהזמנה מראש, ולכן התאריך הקרוב הוא ' . esc_html( vck_when_label( array_key_first( $dates ), '' ) ) . '.</p>' : '' )
		. '<div class="vck-days" role="radiogroup" aria-labelledby="vck-day-lbl">' . $days . '</div>'
		. '<p class="vck-today">צריכים עוד היום? <a href="' . esc_url( vct_wa( 'היי ונוס 🌸 אפשר משלוח עוד היום? לאן: … | מה לשלוח: …' ) ) . '" target="_blank" rel="noopener">כתבו לנו בוואטסאפ</a> ונבדוק מה אפשר.</p>'
		. '<div class="vck-lbl" id="vck-slot-lbl">באיזו שעה?</div>'
		. '<div class="vck-slots" role="radiogroup" aria-labelledby="vck-slot-lbl">' . $slots . '</div>'
		. '<input type="hidden" name="vns_ck" value="1"><input type="hidden" name="vns_delivery_date" id="vns_delivery_date" value=""><input type="hidden" name="vns_delivery_slot" id="vns_delivery_slot" value="">'
		. '</section>'
		. '<section class="vck-sec vck-note" aria-label="ברכה">'
		. '<h3 class="vck-h"><b>3</b>ברכה לכרטיס</h3>'
		. '<p class="form-row form-row-wide vck-greet"><label for="vns_greeting">מה לכתוב בכרטיס? <span class="optional">(לא חובה)</span></label>'
		. '<span class="woocommerce-input-wrapper"><textarea name="vns_greeting" id="vns_greeting" class="input-text" rows="4" maxlength="300" placeholder="למשל: מזל טוב ליום ההולדת! אוהבים, דנה ויואב"></textarea></span>'
		. '<span class="vck-count" aria-live="polite"><i>0</i>/300</span></p>';
} );
add_action( 'woocommerce_after_order_notes', function () {
	if ( vck_here() ) { echo '</section>'; }
} );

/* Order notes: keep, with a clearer hint (Linet prints this field on the invoice). */
add_filter( 'woocommerce_checkout_fields', function ( $f ) {
	if ( vck_here() && isset( $f['order']['order_comments'] ) ) {
		$f['order']['order_comments']['label']       = 'הערות לשליח או לחנות';
		$f['order']['order_comments']['placeholder'] = 'למשל: קוד לשער, להשאיר אצל השכנים';
	}
	return $f;
}, 10000 );

/* Thumbnails in the summary table only (flag avoids touching the header mini cart). */
$GLOBALS['vck_in_review'] = false;
add_action( 'woocommerce_review_order_before_cart_contents', function () { $GLOBALS['vck_in_review'] = vck_here(); } );
add_action( 'woocommerce_review_order_after_cart_contents', function () { $GLOBALS['vck_in_review'] = false; } );
add_filter( 'woocommerce_cart_item_name', function ( $name, $item ) {
	if ( empty( $GLOBALS['vck_in_review'] ) || empty( $item['data'] ) ) { return $name; }
	return '<span class="vck-thumb">' . $item['data']->get_image( 'woocommerce_gallery_thumbnail' ) . '</span><span class="vck-pname">' . $name . '</span>';
}, 20, 2 );

add_filter( 'woocommerce_order_button_text', function ( $t ) { return vck_here() ? 'מעבר לתשלום מאובטח' : $t; }, 99 );
add_filter( 'gettext', function ( $t, $orig, $domain ) {
	if ( 'woocommerce' !== $domain || ! vck_here() ) { return $t; }
	switch ( $orig ) {
		case 'Ship to a different address?': return 'למי שולחים?';
		case 'Billing details':
		case 'Billing &amp; Shipping':       return 'פרטי המזמין';
		case 'Your order':                   return 'סיכום הזמנה';
		case 'Have a coupon?':               return 'יש לך קוד קופון או גיפט קארד?';
		case 'Click here to enter your code': return 'להזנת הקוד';
	}
	return $t;
}, 30, 3 );

/* ---------- delivery minimum (2026-11-23, client): home delivery from ₪150 of products, shipping not included.
   Store pickup has no minimum. Below the minimum only pickup rates are offered; checkout.js explains why (row .vck-min-flag). ---------- */
if ( ! defined( 'VCK_DELIVERY_MIN' ) ) { define( 'VCK_DELIVERY_MIN', 150 ); }
function vck_items_total() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) { return 0; }
	return (float) WC()->cart->get_cart_contents_total() + (float) WC()->cart->get_cart_contents_tax();
}
function vck_is_pickup_rate( $id ) { return 0 === strpos( (string) $id, 'local_pickup' ) || 0 === strpos( (string) $id, 'pickup_location' ); }
function vck_below_min() { return vck_items_total() < VCK_DELIVERY_MIN; }
add_filter( 'woocommerce_package_rates', function ( $rates ) {
	if ( ! vck_below_min() ) { return $rates; }
	$keep = array();
	foreach ( $rates as $k => $r ) { if ( vck_is_pickup_rate( $r->get_method_id() ) ) { $keep[ $k ] = $r; } }
	return $keep ? $keep : $rates;
}, 100 );
add_action( 'woocommerce_review_order_after_shipping', function () {
	if ( ! vck_below_min() || ! WC()->cart->needs_shipping() ) { return; }
	$short = max( 0, VCK_DELIVERY_MIN - vck_items_total() );
	echo '<tr class="vck-min-flag" hidden data-min="' . esc_attr( VCK_DELIVERY_MIN ) . '" data-short="' . esc_attr( wc_format_decimal( $short, 0 ) ) . '"><td colspan="2"></td></tr>';
} );
add_action( 'woocommerce_after_checkout_validation', function ( $data, $errors ) {
	if ( ! vck_below_min() || ! WC()->cart->needs_shipping() ) { return; }
	foreach ( (array) WC()->session->get( 'chosen_shipping_methods' ) as $m ) {
		if ( $m && ! vck_is_pickup_rate( $m ) ) {
			$errors->add( 'vns_delivery_min', 'משלוח עד הבית אפשרי מהזמנה של ₪' . VCK_DELIVERY_MIN . ', לא כולל דמי משלוח. אפשר לבחור איסוף עצמי מהחנות בכל סכום.' );
			return;
		}
	}
}, 15, 2 );

/* ---------- validation + saving (only for forms that carry the new section) ---------- */
add_action( 'woocommerce_after_checkout_validation', function ( $data, $errors ) {
	if ( empty( $_POST['vns_ck'] ) ) { return; }
	$date  = isset( $_POST['vns_delivery_date'] ) ? sanitize_text_field( wp_unslash( $_POST['vns_delivery_date'] ) ) : '';
	$slot  = isset( $_POST['vns_delivery_slot'] ) ? sanitize_text_field( wp_unslash( $_POST['vns_delivery_slot'] ) ) : '';
	$dates = vck_dates( 60 );
	if ( ! isset( $dates[ $date ] ) ) {
		$errors->add( 'vns_delivery_date', 'בחרו באיזה יום לשלוח או לאסוף.' );
		return;
	}
	if ( ! isset( vck_slots( (int) $dates[ $date ]->format( 'w' ) )[ $slot ] ) ) {
		$errors->add( 'vns_delivery_slot', 'בחרו באיזו שעה.' );
	}
}, 20, 2 );

add_action( 'woocommerce_checkout_create_order', function ( $order ) {
	if ( empty( $_POST['vns_ck'] ) ) { return; }
	$date  = sanitize_text_field( wp_unslash( $_POST['vns_delivery_date'] ?? '' ) );
	$slot  = sanitize_text_field( wp_unslash( $_POST['vns_delivery_slot'] ?? '' ) );
	$greet = mb_substr( sanitize_textarea_field( wp_unslash( $_POST['vns_greeting'] ?? '' ) ), 0, 300 );
	$order->update_meta_data( '_vns_delivery_date', $date );
	$order->update_meta_data( '_vns_delivery_slot', $slot );
	$pickup = $order->has_shipping_method( 'local_pickup' );
	/* visible copies (custom fields box + Woo app) */
	$order->update_meta_data( $pickup ? 'מועד איסוף' : 'מועד משלוח', vck_when_label( $date, $slot ) );
	if ( '' !== $greet ) {
		$order->update_meta_data( '_vns_greeting', $greet );
		$order->update_meta_data( 'ברכה לכרטיס', $greet );
	}
}, 30 );

function vck_order_box( $order, $plain = false ) {
	$date = $order->get_meta( '_vns_delivery_date' );
	if ( ! $date ) { return ''; }
	$when  = vck_when_label( $date, $order->get_meta( '_vns_delivery_slot' ) );
	$lab   = $order->has_shipping_method( 'local_pickup' ) ? 'מועד איסוף' : 'מועד משלוח';
	$greet = $order->get_meta( '_vns_greeting' );
	if ( $plain ) {
		return "\n" . $lab . ': ' . $when . ( $greet ? "\nברכה לכרטיס: " . $greet : '' ) . "\n";
	}
	return '<div class="vck-order-box" style="margin:12px 0"><p style="margin:0 0 6px"><strong>' . esc_html( $lab ) . ':</strong> ' . esc_html( $when ) . '</p>'
		. ( $greet ? '<p style="margin:0"><strong>ברכה לכרטיס:</strong><br>' . nl2br( esc_html( $greet ) ) . '</p>' : '' ) . '</div>';
}
add_action( 'woocommerce_admin_order_data_after_shipping_address', function ( $order ) { echo vck_order_box( $order ); } );
add_action( 'woocommerce_email_order_meta', function ( $order, $sent_to_admin, $plain_text ) { echo vck_order_box( $order, $plain_text ); }, 20, 3 );
add_action( 'woocommerce_order_details_after_order_table', function ( $order ) { echo vck_order_box( $order ); } );

/* ---------- assets ---------- */
add_action( 'wp_enqueue_scripts', function () {
	if ( ! vck_here() ) { return; }
	wp_enqueue_style( 'venus-checkout', VCT_URL . 'assets/checkout.css', array(), filemtime( VCT_DIR . 'assets/checkout.css' ) );
	wp_enqueue_script( 'venus-checkout', VCT_URL . 'assets/checkout.js', array( 'jquery', 'wc-checkout' ), filemtime( VCT_DIR . 'assets/checkout.js' ), true );
}, 20 );
