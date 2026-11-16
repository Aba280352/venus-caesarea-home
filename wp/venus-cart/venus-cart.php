<?php
/**
 * Plugin Name: Venus Cart
 * Description: New design for the WooCommerce cart (block cart on page 238). Preview only: open /cart/?vns_ct=1 (sets a session cookie; ?vns_ct=0 turns it off). Live for everyone when option venus_ct_live = 1. Adds: steps bar, styled line items with trash icon, collapsed coupon / gift card field, "add to the bouquet" strip (Store API, no reload), delivery info, trust box, empty-cart page, and keeps the header cart badge in sync.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VCT_VER', '1.0.0' );
define( 'VCT_URL', plugin_dir_url( __FILE__ ) );
define( 'VCT_DIR', plugin_dir_path( __FILE__ ) );
define( 'VCT_WA', '972532791444' );

/* ---------- switch ---------- */
function vct_preview() {
	if ( isset( $_GET['vns_ct'] ) ) { return '1' === (string) $_GET['vns_ct']; }
	return ! empty( $_COOKIE['vns_ct'] );
}
function vct_on() { return vct_preview() || get_option( 'venus_ct_live' ); }
function vct_here() { return function_exists( 'is_cart' ) && is_cart() && vct_on(); }

add_action( 'init', function () {
	if ( ! isset( $_GET['vns_ct'] ) || headers_sent() ) { return; }
	if ( '1' === (string) $_GET['vns_ct'] ) {
		setcookie( 'vns_ct', '1', 0, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl(), true );
	} else {
		setcookie( 'vns_ct', '', time() - 3600, COOKIEPATH ? COOKIEPATH : '/', COOKIE_DOMAIN, is_ssl(), true );
	}
} );
add_action( 'template_redirect', function () {
	if ( vct_preview() && function_exists( 'is_cart' ) && is_cart() ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
	}
}, 0 );
add_filter( 'wp_robots', function ( $r ) {
	if ( vct_preview() ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );

/* New header / footer on the cart while the new design is on (until the new header goes live site-wide).
   The new templates are drafts, which Elementor never prints in a theme location, so the live ones are
   switched off, Hello's fallback header is suppressed, and the drafts are printed as [elementor-template]
   (same as the new homepage preview #2252). */
function vct_swap_hf() { return vct_here() && ! get_option( 'venus_header_live' ); }
add_filter( 'elementor/theme/get_location_templates/template_id', function ( $id, $location = '' ) {
	if ( ( 'header' === $location || 'footer' === $location ) && vct_swap_hf() ) { return 0; }
	return $id;
}, 10, 2 );
add_filter( 'hello_elementor_header_footer', function ( $show ) { return vct_swap_hf() ? false : $show; }, 99 );
add_action( 'wp_body_open', function () {
	if ( vct_swap_hf() ) { echo do_shortcode( '[elementor-template id="2186"]' ); }
}, 5 );
add_action( 'get_footer', function () {
	if ( vct_swap_hf() ) { echo do_shortcode( '[elementor-template id="2360"]' ); }
} );

add_filter( 'body_class', function ( $c ) {
	if ( ! vct_here() ) { return $c; }
	$c[] = 'vct';
	if ( function_exists( 'WC' ) && WC()->cart && WC()->cart->is_empty() ) { $c[] = 'vct-is-empty'; }
	return $c;
} );

/* ---------- helpers ---------- */
function vct_icon( $n ) {
	$f = VCT_DIR . 'assets/icons/' . $n . '.svg';
	if ( ! file_exists( $f ) ) { return ''; }
	$s = file_get_contents( $f );
	$s = preg_replace( '/ xmlns="[^"]*"/', '', $s );
	return trim( str_replace( ' width="24" height="24"', '', $s ) );
}
function vct_wa( $text ) { return 'https://wa.me/' . VCT_WA . '?text=' . rawurlencode( $text ); }

/* Products offered in "add to the bouquet" (cards, chocolate, teddy, balloons, wine, vase). Filterable. */
function vct_addon_ids() {
	return apply_filters( 'vct_addon_ids', array( 2052, 2056, 2058, 2023, 2046, 1442, 2124, 2140, 2078, 2377 ) );
}
function vct_card( $p, $label = 'הוספה' ) {
	$img = $p->get_image_id() ? wp_get_attachment_image( $p->get_image_id(), 'woocommerce_thumbnail', false, array( 'loading' => 'lazy', 'alt' => $p->get_name() ) ) : '';
	return '<div class="vct-card" data-pid="' . esc_attr( $p->get_id() ) . '">'
		. '<a class="vct-card-img" href="' . esc_url( $p->get_permalink() ) . '">' . $img . '</a>'
		. '<a class="vct-card-name" href="' . esc_url( $p->get_permalink() ) . '">' . esc_html( $p->get_name() ) . '</a>'
		. '<div class="vct-card-row"><span class="vct-card-price">' . wp_kses_post( $p->get_price_html() ) . '</span>'
		. '<button type="button" class="vct-add" data-pid="' . esc_attr( $p->get_id() ) . '" aria-label="' . esc_attr( 'הוספה לעגלה: ' . $p->get_name() ) . '">' . vct_icon( 'plus' ) . '<span>' . esc_html( $label ) . '</span></button></div>'
		. '</div>';
}
function vct_products( $ids ) {
	$out = array();
	foreach ( $ids as $id ) {
		$p = wc_get_product( $id );
		if ( $p && 'publish' === $p->get_status() && $p->is_purchasable() && $p->is_in_stock() && $p->is_type( 'simple' ) ) { $out[] = $p; }
	}
	return $out;
}

/* ---------- markup around the cart block ---------- */
function vct_steps() {
	return '<nav class="vct-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a><i>/</i><span>עגלת קניות</span></nav>'
		. '<div class="vct-top"><h1 class="vct-title">העגלה <b>שלך</b></h1>'
		. '<ol class="vct-steps" aria-label="שלבי ההזמנה"><li class="is-on"><b>1</b>עגלה</li><li><b>2</b>פרטים ותשלום</li><li><b>3</b>אישור הזמנה</li></ol></div>';
}
function vct_ship_box() {
	$cities = 'אור עקיבא · אור ים · חדרה · פרדס חנה־כרכור · בנימינה · גבעת עדה · זכרון יעקב · עמיקם · בית חנניה · עין שמר';
	return '<section id="vct-ship" class="vct-ship" aria-label="משלוח ואיסוף">'
		. '<h2 class="vct-h3">' . vct_icon( 'truck' ) . 'משלוח או איסוף</h2>'
		. '<ul class="vct-ship-list">'
		. '<li><b>קיסריה</b><span>משלוח ₪20</span></li>'
		. '<li><b>ערים נוספות באזור</b><span>משלוח ₪40</span></li>'
		. '<li><b>איסוף עצמי</b><span>חינם · הרקיע 1, קיסריה</span></li>'
		. '</ul>'
		. '<p class="vct-ship-note">משלוחים לערים: ' . esc_html( $cities ) . '. בוחרים עיר ושיטת משלוח בשלב הבא. לעיר אחרת או משלוח דחוף <a href="' . esc_url( vct_wa( 'היי ונוס 🌸 אני רוצה לתאם משלוח מיוחד. לאן: … | תאריך ושעה: … | מה לשלוח: …' ) ) . '" target="_blank" rel="noopener">כתבו לנו בוואטסאפ</a>.</p>'
		. '</section>';
}
function vct_trust_box() {
	return '<div id="vct-trust" class="vct-trust">'
		. '<ul>'
		. '<li>' . vct_icon( 'shield-check' ) . '<span><b>תשלום מאובטח</b>סליקה מוצפנת בכרטיס אשראי</span></li>'
		. '<li>' . vct_icon( 'leaf' ) . '<span><b>פרחים טריים מהחנות</b>כל זר נבנה ביד אצלנו בקיסריה</span></li>'
		. '<li>' . vct_icon( 'gift' ) . '<span><b>רוצים לצרף ברכה?</b>כותבים אותה בשדה &quot;הערות להזמנה&quot; בשלב הבא</span></li>'
		. '</ul>'
		. '<a class="vct-wa" href="' . esc_url( vct_wa( 'היי ונוס 🌸 יש לי שאלה לפני שאני מזמין/ה' ) ) . '" target="_blank" rel="noopener">' . vct_icon( 'chat-dots' ) . '<span>שאלה לפני שמזמינים? <b>וואטסאפ</b></span></a>'
		. '</div>';
}
function vct_addons() {
	$ps = vct_products( vct_addon_ids() );
	if ( ! $ps ) { return ''; }
	$h = '';
	foreach ( $ps as $p ) { $h .= vct_card( $p ); }
	return '<section class="vct-addons" aria-label="הוסיפו לזר"><div class="vct-sec-head"><h2 class="vct-h2">הוסיפו <b>לזר</b></h2><p class="vct-sub">כרטיס ברכה, שוקולד או בלון. נכנס לאותו משלוח.</p></div>'
		. '<div class="vct-rail" tabindex="0">' . $h . '</div></section>';
}
function vct_empty() {
	/* Category cards: image = best seller of the category. */
	$cats = array( 34 => 'פרחים', 35 => 'צמחים וסחלבים', 49 => 'חתונות', 38 => 'בלונים וכרטיסי ברכה', 40 => 'אלכוהול ושוקולד', 37 => 'ואזות וכלים' );
	$pick = array( 49 => 1343 ); /* weddings: bridal bouquet, not the car (its best seller) */
	$ch = '';
	foreach ( $cats as $tid => $name ) {
		$t = get_term( $tid, 'product_cat' );
		if ( ! $t || is_wp_error( $t ) ) { continue; }
		$top = isset( $pick[ $tid ] ) ? array_filter( array( wc_get_product( $pick[ $tid ] ) ) ) : wc_get_products( array( 'status' => 'publish', 'limit' => 1, 'stock_status' => 'instock', 'category' => array( $t->slug ), 'orderby' => 'meta_value_num', 'meta_key' => 'total_sales', 'order' => 'DESC' ) );
		$img = ( $top && $top[0]->get_image_id() ) ? wp_get_attachment_image( $top[0]->get_image_id(), 'woocommerce_thumbnail', false, array( 'loading' => 'lazy', 'alt' => '' ) ) : '';
		$ch .= '<a class="vct-cat" href="' . esc_url( get_term_link( $t ) ) . '"><span class="vct-cat-img">' . $img . '</span><span class="vct-cat-name">' . esc_html( $name ) . '</span></a>';
	}
	$best = wc_get_products( array( 'status' => 'publish', 'limit' => 12, 'stock_status' => 'instock', 'type' => 'simple', 'category' => array( get_term( 34, 'product_cat' )->slug ), 'orderby' => 'meta_value_num', 'meta_key' => 'total_sales', 'order' => 'DESC' ) );
	$bh = ''; $n = 0;
	foreach ( $best as $p ) {
		if ( $n >= 8 || false !== mb_strpos( $p->get_name(), 'בדיקה' ) || (float) $p->get_price() < 20 ) { continue; }
		$bh .= vct_card( $p, 'לעגלה' ); $n++;
	}
	return '<section id="vct-empty" class="vct-empty" aria-label="העגלה ריקה">'
		. '<div class="vct-empty-hero">' . vct_icon( 'shopping-bag' ) . '<h2 class="vct-h2">העגלה שלך <b>עדיין ריקה</b></h2><p class="vct-sub">בואו נמצא משהו יפה. זרים, צמחים ומתנות שיוצאים מהחנות שלנו בקיסריה.</p>'
		. '<a class="vct-btn vct-btn-green" href="' . esc_url( wc_get_page_permalink( 'shop' ) ) . '">לכל המוצרים</a></div>'
		. '<div class="vct-cats">' . $ch . '</div>'
		. ( $bh ? '<div class="vct-sec-head"><h2 class="vct-h2">הזרים <b>האהובים</b></h2><p class="vct-sub">הנמכרים ביותר אצלנו</p></div><div class="vct-rail" tabindex="0">' . $bh . '</div>' : '' )
		. '</section>';
}

/* Wrap the cart block. Extras that belong inside the React tree (delivery box, trust box) are moved in by cart.js. */
add_filter( 'render_block_woocommerce/cart', function ( $html ) {
	if ( ! vct_here() ) { return $html; }
	$rev = shortcode_exists( 'vns_pa_reviews' ) ? do_shortcode( '[vns_pa_reviews]' ) : '';
	return '<div class="vct-wrap">' . vct_steps() . $html
		. '<div class="vct-park" hidden>' . vct_ship_box() . vct_trust_box() . '</div>'
		. vct_addons() . vct_empty()
		. ( $rev ? '<div class="vct-revs">' . $rev . '</div>' : '' )
		. '</div>';
} );

/* Summary heading text */
add_filter( 'render_block_data', function ( $b ) {
	if ( 'woocommerce/cart-order-summary-heading-block' === ( $b['blockName'] ?? '' ) && vct_here() ) {
		$b['attrs']['content'] = 'סיכום הזמנה';
	}
	return $b;
} );

/* ---------- assets ---------- */
add_action( 'wp_enqueue_scripts', function () {
	if ( ! vct_here() ) { return; }
	wp_enqueue_style( 'venus-cart', VCT_URL . 'assets/cart.css', array(), filemtime( VCT_DIR . 'assets/cart.css' ) );
	$deps = array( 'wp-data', 'wp-i18n' );
	if ( wp_script_is( 'wc-blocks-data-store', 'registered' ) ) { $deps[] = 'wc-blocks-data-store'; }
	wp_enqueue_script( 'venus-cart', VCT_URL . 'assets/cart.js', $deps, filemtime( VCT_DIR . 'assets/cart.js' ), true );
	wp_add_inline_script( 'venus-cart', 'window.VCT=' . wp_json_encode( array(
		'checkout' => wc_get_checkout_url(),
		'check'    => vct_icon( 'check' ),
	) ) . ';', 'before' );
	/* Block cart strings (JS i18n) */
	/* gettext filter runs at call time, so later-loaded translation chunks cannot override it */
	$map = array(
		'Add coupons'         => 'יש לך קוד קופון או גיפט קארד?',
		'Add a coupon'        => 'יש לך קוד קופון או גיפט קארד?',
		'Enter code'          => 'קוד קופון או גיפט קארד',
		'Apply'               => 'הפעלה',
		'Proceed to Checkout' => 'להמשך לתשלום',
		'Proceed to checkout' => 'להמשך לתשלום',
		'Remove item'         => 'הסרה מהעגלה',
	);
	wp_add_inline_script( 'wp-i18n', '(function(m){if(window.wp&&wp.hooks){wp.hooks.addFilter("i18n.gettext_woocommerce","venus/cart",function(t,s){return Object.prototype.hasOwnProperty.call(m,s)?m[s]:t;});}})(' . wp_json_encode( $map, JSON_UNESCAPED_UNICODE ) . ');', 'after' );
}, 20 );
