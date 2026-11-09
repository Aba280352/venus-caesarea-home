<?php
/**
 * Plugin Name: Venus Product Page
 * Description: Shortcodes + helpers for the new Venus single-product template (Elementor Theme Builder). Preview switch: add ?vns_pp=1 to any product URL to see the new template without touching the live one.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VPP_VER', '1.0.0' );
define( 'VPP_URL', plugin_dir_url( __FILE__ ) );
define( 'VPP_DIR', plugin_dir_path( __FILE__ ) );

/* ---------- helpers ---------- */
function vpp_product() {
	global $product;
	if ( $product instanceof WC_Product ) { return $product; }
	$p = wc_get_product( get_the_ID() );
	return $p ? $p : null;
}
function vpp_money( $n ) {
	$n = (float) $n;
	return '₪' . number_format( $n, ( floor( $n ) == $n ) ? 0 : 2, '.', ',' );
}
function vpp_in_cat( $p, $name ) {
	$term = get_term_by( 'name', $name, 'product_cat' );
	if ( ! $term ) { return false; }
	foreach ( wp_get_post_terms( $p->get_id(), 'product_cat', array( 'fields' => 'ids' ) ) as $tid ) {
		if ( (int) $tid === (int) $term->term_id || in_array( (int) $term->term_id, array_map( 'intval', get_ancestors( $tid, 'product_cat' ) ), true ) ) { return true; }
	}
	return false;
}
function vpp_assets() {
	static $done = false;
	if ( $done ) { return; }
	$done = true;
	wp_enqueue_script( 'venus-product-page', VPP_URL . 'assets/product.js', array(), filemtime( VPP_DIR . 'assets/product.js' ), true );
	wp_add_inline_script( 'venus-product-page', 'window.VPP=' . wp_json_encode( array(
		'ajax' => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( 'add_to_cart' ) : '',
		'cart' => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
	) ) . ';', 'before' );
}

/* ---------- preview switch (does not affect normal visitors) ---------- */
add_filter( 'elementor/theme/get_location_templates/template_id', function ( $id, $location ) {
	if ( empty( $_GET['vns_pp'] ) ) { return $id; }
	if ( 'product' === get_post_meta( $id, '_elementor_template_type', true ) ) {
		$new = (int) get_option( 'venus_pp_template_id' );
		return $new ? $new : $id;
	}
	if ( '2' === (string) $_GET['vns_pp'] ) {
		if ( 'header' === $location ) { return 2186; }
		if ( 'footer' === $location ) { return 2360; }
	}
	return $id;
}, 10, 2 );
add_action( 'template_redirect', function () {
	if ( ! empty( $_GET['vns_pp'] ) ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
	}
}, 0 );
add_filter( 'wp_robots', function ( $r ) {
	if ( ! empty( $_GET['vns_pp'] ) ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );

/* ---------- [vns_pd_crumbs] ---------- */
add_shortcode( 'vns_pd_crumbs', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	$best = null; $depth = -1;
	foreach ( wp_get_post_terms( $p->get_id(), 'product_cat' ) as $t ) {
		$d = count( get_ancestors( $t->term_id, 'product_cat' ) );
		if ( $d > $depth ) { $depth = $d; $best = $t; }
	}
	$sep = '<i aria-hidden="true">›</i>';
	$out = '<nav class="pd-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a>' . $sep;
	$shop = function_exists( 'wc_get_page_id' ) ? wc_get_page_id( 'shop' ) : 0;
	if ( $shop > 0 ) { $out .= '<a href="' . esc_url( get_permalink( $shop ) ) . '">חנות</a>' . $sep; }
	if ( $best ) {
		$chain = array_reverse( array_map( 'intval', get_ancestors( $best->term_id, 'product_cat' ) ) );
		foreach ( $chain as $tid ) {
			$t = get_term( $tid, 'product_cat' );
			if ( $t && ! is_wp_error( $t ) ) { $out .= '<a href="' . esc_url( get_term_link( $t ) ) . '">' . esc_html( $t->name ) . '</a>' . $sep; }
		}
		$out .= '<a href="' . esc_url( get_term_link( $best ) ) . '">' . esc_html( $best->name ) . '</a>' . $sep;
	}
	return $out . '<span aria-current="page">' . esc_html( $p->get_name() ) . '</span></nav>';
} );

/* ---------- [vns_pd_gallery] ---------- */
add_shortcode( 'vns_pd_gallery', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	vpp_assets();
	$ids = array_values( array_filter( array_merge( array( $p->get_image_id() ), $p->get_gallery_image_ids() ) ) );
	$badge = '';
	if ( $p->is_on_sale() ) { $badge = 'מבצע'; }
	elseif ( $p->get_date_created() && ( time() - $p->get_date_created()->getTimestamp() ) < 30 * DAY_IN_SECONDS ) { $badge = 'חדש'; }
	$out = '<div class="pd-gal"><div class="pd-main" id="pd-main">' . ( $badge ? '<span class="pd-badge">' . esc_html( $badge ) . '</span>' : '' );
	if ( $ids ) {
		$out .= wp_get_attachment_image( $ids[0], 'large', false, array( 'alt' => $p->get_name(), 'draggable' => 'false', 'loading' => 'eager', 'fetchpriority' => 'high', 'sizes' => '(max-width:767px) 92vw, 640px' ) );
	} else {
		$out .= '<img src="' . esc_url( wc_placeholder_img_src( 'large' ) ) . '" alt="" draggable="false">';
	}
	$out .= '</div>';
	if ( count( $ids ) > 1 ) {
		$out .= '<div class="pd-thumbs" role="tablist" aria-label="גלריית תמונות">';
		foreach ( $ids as $i => $id ) {
			$src = wp_get_attachment_image_url( $id, 'large' );
			$set = wp_get_attachment_image_srcset( $id, 'large' );
			$out .= '<button type="button" class="pd-th' . ( 0 === $i ? ' is-on' : '' ) . '" data-src="' . esc_url( $src ) . '" data-srcset="' . esc_attr( $set ) . '" aria-label="תמונה ' . ( $i + 1 ) . '">'
				. wp_get_attachment_image( $id, 'medium', false, array( 'alt' => '', 'loading' => 'lazy', 'draggable' => 'false', 'sizes' => '(max-width:767px) 22vw, 150px' ) ) . '</button>';
		}
		$out .= '</div>';
	}
	return $out . '</div>';
} );

/* ---------- [vns_pd_head]: title + short + price + note ---------- */
add_shortcode( 'vns_pd_head', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	$short = trim( wp_strip_all_tags( $p->get_short_description() ) );
	if ( '' === $short ) {
		$parts = preg_split( '/\R+/u', trim( wp_strip_all_tags( $p->get_description() ) ) );
		$short = trim( isset( $parts[0] ) ? $parts[0] : '' );
		if ( '' !== $short && ! preg_match( '/[.!?:]$/u', $short ) ) { $short .= '.'; }
	}
	$out = '<h1 class="pd-title">' . esc_html( $p->get_name() ) . '</h1>';
	if ( '' !== $short ) { $out .= '<p class="pd-short">' . esc_html( $short ) . '</p>'; }
	$price = (float) $p->get_price();
	if ( '' !== $p->get_price() ) {
		$out .= '<div class="pd-price-row"><span class="pd-price" data-base="' . esc_attr( $price ) . '">' . esc_html( vpp_money( $price ) ) . '</span>';
		if ( $p->is_on_sale() && (float) $p->get_regular_price() > $price ) {
			$reg = (float) $p->get_regular_price();
			$out .= '<span class="rec-old">' . esc_html( vpp_money( $reg ) ) . '</span><span class="pd-save">חסכון של ' . esc_html( vpp_money( $reg - $price ) ) . '</span>';
		}
		$out .= '</div>';
	}
	if ( vpp_in_cat( $p, 'פרחים' ) ) { $out .= '<p class="pd-note">* צבעי הפרחים עלולים להשתנות על פי העונה ועל פי המלאי בחנות.</p>'; }
	return $out;
} );

/* ---------- [vns_pd_buy]: quantity + add-to-cart (real WooCommerce form) ---------- */
add_shortcode( 'vns_pd_buy', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	vpp_assets();
	if ( ! $p->is_purchasable() || ! $p->is_in_stock() ) {
		return '<div class="pd-buy"><button type="button" class="pd-cta" disabled style="opacity:.55;cursor:not-allowed"><span class="pd-cta-t">אזל מהמלאי</span></button></div>';
	}
	$m = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
	$a = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
	return '<form class="pd-buy cart" id="pd-form" action="' . esc_url( apply_filters( 'woocommerce_add_to_cart_form_action', $p->get_permalink() ) ) . '" method="post" enctype="multipart/form-data">'
		. '<div class="pd-qty" role="group" aria-label="כמות"><button type="button" class="pd-q-m" aria-label="הפחתת כמות">' . $m . '</button><input class="pd-q-in" type="text" name="quantity" inputmode="numeric" value="1" aria-label="כמות" autocomplete="off"><button type="button" class="pd-q-p" aria-label="הוספת כמות">' . $a . '</button></div>'
		. '<button type="submit" name="add-to-cart" value="' . esc_attr( $p->get_id() ) . '" class="pd-cta single_add_to_cart_button" id="pd-cta" data-product_id="' . esc_attr( $p->get_id() ) . '"><span class="pd-cta-t">הוספה לעגלה</span><span class="pd-cta-sum">· <b data-total>' . esc_html( vpp_money( $p->get_price() ) ) . '</b></span></button></form>';
} );

/* ---------- [vns_pd_share] ---------- */
add_shortcode( 'vns_pd_share', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	$url = 'https://api.whatsapp.com/send?text=' . rawurlencode( $p->get_name() . " – ונוס קיסריה\n" . $p->get_permalink() );
	return '<a class="pd-share" href="' . esc_url( $url ) . '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-3.7-.9-3.1-1.3-5-4.4-5.2-4.6-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.8 2.1 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.5z"/></svg><span>שיתוף בוואטסאפ</span></a>';
} );

/* ---------- [vns_pd_addons ids="1,2" title="" sub="" cols="5" only_cat="פרחים" label=""] ---------- */
add_shortcode( 'vns_pd_addons', function ( $atts ) {
	$a = shortcode_atts( array( 'ids' => '', 'title' => '', 'sub' => '', 'cols' => '5', 'only_cat' => 'פרחים', 'label' => '' ), $atts );
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	if ( $a['only_cat'] && ! vpp_in_cat( $p, $a['only_cat'] ) ) { return ''; }
	vpp_assets();
	$cards = '';
	foreach ( array_filter( array_map( 'intval', explode( ',', $a['ids'] ) ) ) as $id ) {
		$x = wc_get_product( $id );
		if ( ! $x || 'publish' !== $x->get_status() || ! $x->is_purchasable() || ! $x->is_in_stock() || $x->get_id() === $p->get_id() ) { continue; }
		$name = $x->get_name();
		$cards .= '<label class="pd-add"><input type="checkbox" class="pd-add-in" data-id="' . esc_attr( $id ) . '" data-price="' . esc_attr( (float) $x->get_price() ) . '" aria-label="הוספת ' . esc_attr( $name ) . '">'
			. '<span class="pd-add-img">' . ( $x->get_image_id() ? wp_get_attachment_image( $x->get_image_id(), 'medium', false, array( 'alt' => '', 'loading' => 'lazy', 'draggable' => 'false', 'sizes' => '(max-width:767px) 45vw, 230px' ) ) : '' ) . '</span>'
			. '<span class="pd-add-name">' . esc_html( $name ) . '</span>'
			. '<span class="pd-add-row"><span class="pd-add-price">' . esc_html( vpp_money( $x->get_price() ) ) . '</span><span class="pd-add-btn" aria-hidden="true"><i></i></span></span></label>';
	}
	if ( '' === $cards ) { return ''; }
	$grid = '3' === $a['cols'] ? 'pd-add-grid pd-add-grid-3' : 'pd-add-grid';
	return '<section class="pd-adds" aria-label="' . esc_attr( $a['label'] ? $a['label'] : $a['title'] ) . '"><h2 class="pd-h2">' . esc_html( $a['title'] ) . '</h2>'
		. ( $a['sub'] ? '<p class="pd-sub">' . esc_html( $a['sub'] ) . '</p>' : '' ) . '<div class="' . $grid . '">' . $cards . '</div></section>';
} );

/* ---------- [vns_pd_desc]: description tab panel ---------- */
add_shortcode( 'vns_pd_desc', function () {
	$p = vpp_product();
	if ( ! $p ) { return ''; }
	$d = trim( $p->get_description() );
	$html = '' !== $d ? wpautop( wp_kses_post( $d ) ) : ( $p->get_short_description() ? wpautop( wp_kses_post( $p->get_short_description() ) ) : '' );
	if ( vpp_in_cat( $p, 'פרחים' ) ) {
		$html .= '<p>רוצים לשנות את הצבעים או להוסיף משהו לזר? כתבו לנו בוואטסאפ <a href="https://api.whatsapp.com/send?phone=972532791444">053-279-1444</a> ונתאים אותו בשבילכם.</p>';
	}
	return '<div class="pd-panel" id="pd-p0" role="tabpanel">' . $html . '</div>';
} );

/* ---------- [vns_pd_bar]: mobile / sticky order bar ---------- */
add_shortcode( 'vns_pd_bar', function () {
	$p = vpp_product();
	if ( ! $p || ! $p->is_purchasable() || ! $p->is_in_stock() ) { return ''; }
	vpp_assets();
	return '<div class="pd-bar" id="pd-bar"><div class="pd-bar-in"><span class="pd-bar-name">' . esc_html( $p->get_name() ) . '</span><button type="submit" form="pd-form" name="add-to-cart" value="' . esc_attr( $p->get_id() ) . '" class="pd-cta pd-cta-bar"><span class="pd-cta-t">הוספה לעגלה</span><span class="pd-cta-sum">· <b data-total>' . esc_html( vpp_money( $p->get_price() ) ) . '</b></span></button></div></div>';
} );
