<?php
/**
 * Plugin Name: Venus Shop Archive
 * Description: Shortcodes + helpers for the new Venus shop / category archive template (Elementor Theme Builder). Preview switch: add ?vns_pa=1 to /shop/ or any category URL to see the new template without touching the live one.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VPA_VER', '1.0.0' );
define( 'VPA_URL', plugin_dir_url( __FILE__ ) );
define( 'VPA_DIR', plugin_dir_path( __FILE__ ) );
define( 'VPA_PER_PAGE', 24 );
define( 'VPA_TI_WIDGET', '55f69ae851117832b48681f869a' ); /* Trustindex: "Venus - Google slider (shop archive)" */

/* New template runs when previewing (?vns_pa=1) or after go-live (option venus_pa_live = 1). */
function vpa_preview() { return ! empty( $_GET['vns_pa'] ); }
function vpa_on() { return vpa_preview() || get_option( 'venus_pa_live' ); }

/* ---------- preview switch (does not affect normal visitors) ---------- */
add_filter( 'elementor/theme/get_location_templates/template_id', function ( $id ) {
	if ( ! vpa_preview() ) { return $id; }
	if ( 'product-archive' === get_post_meta( $id, '_elementor_template_type', true ) ) {
		$new = (int) get_option( 'venus_pa_template_id' );
		return $new ? $new : $id;
	}
	return $id;
}, 10, 1 );
add_action( 'template_redirect', function () {
	if ( vpa_preview() ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
	}
}, 0 );
add_filter( 'wp_robots', function ( $r ) {
	if ( vpa_preview() ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );

/* ---------- query: 24 per page + budget filter ---------- */
function vpa_price_ranges() {
	return array(
		'u150'   => array( 'label' => 'עד ₪150', 'meta' => array( array( 'key' => '_price', 'value' => 150, 'compare' => '<=', 'type' => 'DECIMAL(10,2)' ) ) ),
		'150-300' => array( 'label' => '₪150–₪300', 'meta' => array( 'relation' => 'AND',
			array( 'key' => '_price', 'value' => 150, 'compare' => '>', 'type' => 'DECIMAL(10,2)' ),
			array( 'key' => '_price', 'value' => 300, 'compare' => '<=', 'type' => 'DECIMAL(10,2)' ) ) ),
		'300p'   => array( 'label' => 'מעל ₪300', 'meta' => array( array( 'key' => '_price', 'value' => 300, 'compare' => '>', 'type' => 'DECIMAL(10,2)' ) ) ),
	);
}
function vpa_cur_price() {
	$p = isset( $_GET['price'] ) ? sanitize_key( wp_unslash( $_GET['price'] ) ) : '';
	return isset( vpa_price_ranges()[ $p ] ) ? $p : '';
}
function vpa_cur_order() {
	$o = isset( $_GET['orderby'] ) ? sanitize_key( wp_unslash( $_GET['orderby'] ) ) : '';
	return isset( vpa_orders()[ $o ] ) ? $o : 'menu_order';
}
function vpa_orders() {
	return array( 'menu_order' => 'מומלצים', 'popularity' => 'הנמכרים ביותר', 'date' => 'חדשים באתר', 'price' => 'מחיר: מהנמוך לגבוה', 'price-desc' => 'מחיר: מהגבוה לנמוך' );
}
add_filter( 'loop_shop_per_page', function ( $n ) { return vpa_on() ? VPA_PER_PAGE : $n; }, 99 );
add_action( 'woocommerce_product_query', function ( $q ) {
	if ( ! vpa_on() ) { return; }
	/* WC sorts price/popularity with posts_clauses filters that Elementor's loop grid (current query) does not keep,
	   so express those sorts as plain query vars */
	/* every sort keeps in-stock products first and out-of-stock ones at the end (named meta clauses = plain query vars) */
	$o  = vpa_cur_order();
	$mq = (array) $q->get( 'meta_query' );
	$mq['vpa_stock'] = array( 'key' => '_stock_status', 'compare' => 'EXISTS' ); /* instock < onbackorder < outofstock */
	if ( 'price' === $o || 'price-desc' === $o ) {
		$mq['vpa_sort'] = array( 'key' => '_price', 'compare' => 'EXISTS', 'type' => 'DECIMAL(10,2)' );
		$q->set( 'orderby', array( 'vpa_stock' => 'ASC', 'vpa_sort' => 'price' === $o ? 'ASC' : 'DESC', 'ID' => 'ASC' ) );
	} elseif ( 'popularity' === $o ) {
		$mq['vpa_sort'] = array( 'key' => 'total_sales', 'compare' => 'EXISTS', 'type' => 'NUMERIC' );
		$q->set( 'orderby', array( 'vpa_stock' => 'ASC', 'vpa_sort' => 'DESC', 'ID' => 'ASC' ) );
	} elseif ( 'date' === $o ) {
		$q->set( 'orderby', array( 'vpa_stock' => 'ASC', 'date' => 'DESC', 'ID' => 'DESC' ) );
	} else {
		$q->set( 'orderby', array( 'vpa_stock' => 'ASC', 'menu_order' => 'ASC', 'title' => 'ASC' ) );
	}
	$q->set( 'meta_key', '' );
	$p = vpa_cur_price();
	if ( $p ) { $mq[] = vpa_price_ranges()[ $p ]['meta']; }
	$q->set( 'meta_query', $mq );
} );

/* ---------- helpers ---------- */
function vpa_term() {
	$o = get_queried_object();
	return ( $o instanceof WP_Term && 'product_cat' === $o->taxonomy ) ? $o : null;
}
function vpa_shop_url() {
	$id = function_exists( 'wc_get_page_id' ) ? wc_get_page_id( 'shop' ) : 0;
	return $id > 0 ? get_permalink( $id ) : home_url( '/shop/' );
}
/* keeps the preview flag + current sort/budget unless overridden; never carries the page number */
function vpa_link( $base, $set = array() ) {
	$args = array();
	if ( vpa_preview() ) { $args['vns_pa'] = '1'; }
	$o = vpa_cur_order();
	if ( 'menu_order' !== $o ) { $args['orderby'] = $o; }
	if ( vpa_cur_price() ) { $args['price'] = vpa_cur_price(); }
	foreach ( $set as $k => $v ) {
		if ( '' === $v || null === $v ) { unset( $args[ $k ] ); } else { $args[ $k ] = $v; }
	}
	return add_query_arg( $args, $base );
}
function vpa_cats() {
	$pref = array( 'פרחים', 'חתונות', 'צמחים וסחלבים', 'מארזים', 'אלכוהול ושוקולד', 'בלונים וכרטיסי ברכה', 'נרות', 'ואזות וכלים' );
	$terms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'parent' => 0 ) );
	if ( is_wp_error( $terms ) ) { return array(); }
	$terms = array_values( array_filter( $terms, function ( $t ) { return 'uncategorized' !== $t->slug; } ) );
	usort( $terms, function ( $a, $b ) use ( $pref ) {
		$x = array_search( $a->name, $pref, true ); $y = array_search( $b->name, $pref, true );
		$x = false === $x ? 99 : $x; $y = false === $y ? 99 : $y;
		return $x === $y ? strcmp( $a->name, $b->name ) : $x - $y;
	} );
	return $terms;
}
/* splits a category description into [intro, seo-html, faq-template-id] */
function vpa_desc_parts( $term ) {
	$d = $term ? trim( (string) $term->description ) : '';
	if ( '' === $d ) { return array( '', '', 0 ); }
	$faq = 0;
	if ( preg_match( '/\[elementor-template id="?(\d+)"?\s*\]/', $d, $m ) ) { $faq = (int) $m[1]; }
	$d = preg_replace( '/\[elementor-template[^\]]*\]/', '', $d );
	$d = str_replace( "\r", '', $d );
	$lines = array_values( array_filter( array_map( 'trim', explode( "\n", $d ) ), 'strlen' ) );
	/* drop a trailing "שאלות נפוצות" heading left without its template */
	while ( $lines && preg_match( '/^(<h[1-6][^>]*>)?\s*שאלות (נפוצות|ותשובות)\s*(<\/h[1-6]>)?$/u', end( $lines ) ) ) { array_pop( $lines ); }
	if ( ! $lines ) { return array( '', '', $faq ); }
	$title = wp_strip_all_tags( array_shift( $lines ) );
	$intro = '';
	$out = '<h2>' . esc_html( $title ) . '</h2>';
	foreach ( $lines as $i => $l ) {
		$plain = trim( wp_strip_all_tags( $l ) );
		if ( preg_match( '/^<h([1-6])[^>]*>(.*)<\/h\1>$/is', $l, $h ) ) {
			$out .= '<h3>' . wp_kses_post( $h[2] ) . '</h3>';
		} elseif ( mb_strlen( $plain ) < 70 && ! preg_match( '/[.!?:;,]$/u', $plain ) && false === strpos( $l, '<a ' ) ) {
			$out .= '<h3>' . wp_kses_post( $l ) . '</h3>';
		} else {
			if ( '' === $intro && 0 === $i ) { $intro = $plain; }
			$out .= '<p>' . wp_kses_post( $l ) . '</p>';
		}
	}
	/* intro: first 1-2 sentences, max ~200 chars */
	if ( $intro && mb_strlen( $intro ) > 200 ) {
		$cut = mb_substr( $intro, 0, 200 );
		$p = max( mb_strrpos( $cut, '.' ), mb_strrpos( $cut, '!' ) );
		$intro = $p > 60 ? mb_substr( $cut, 0, $p + 1 ) : rtrim( $cut ) . '…';
	}
	return array( $intro, $out, $faq );
}
function vpa_assets() {
	static $done = false;
	if ( $done ) { return; }
	$done = true;
	wp_enqueue_script( 'venus-shop-archive', VPA_URL . 'assets/archive.js', array(), filemtime( VPA_DIR . 'assets/archive.js' ), true );
	wp_add_inline_script( 'venus-shop-archive', 'window.VPA=' . wp_json_encode( array(
		'ajax' => class_exists( 'WC_AJAX' ) ? WC_AJAX::get_endpoint( 'add_to_cart' ) : '',
	) ) . ';', 'before' );
}
function vpa_chev() {
	return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
}

/* ---------- [vns_pa_crumbs] ---------- */
add_shortcode( 'vns_pa_crumbs', function () {
	$sep = '<i aria-hidden="true">›</i>';
	$t = vpa_term();
	$out = '<nav class="vpa-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a>' . $sep;
	if ( ! $t ) { return $out . '<span>חנות</span></nav>'; }
	$out .= '<a href="' . esc_url( vpa_link( vpa_shop_url(), array( 'orderby' => '', 'price' => '' ) ) ) . '">חנות</a>' . $sep;
	foreach ( array_reverse( get_ancestors( $t->term_id, 'product_cat' ) ) as $aid ) {
		$a = get_term( $aid, 'product_cat' );
		$out .= '<a href="' . esc_url( vpa_link( get_term_link( $a ), array( 'orderby' => '', 'price' => '' ) ) ) . '">' . esc_html( $a->name ) . '</a>' . $sep;
	}
	return $out . '<span>' . esc_html( $t->name ) . '</span></nav>';
} );

/* ---------- [vns_pa_head]: H1 + intro ---------- */
add_shortcode( 'vns_pa_head', function () {
	vpa_assets();
	$t = vpa_term();
	if ( $t ) {
		$title = $t->name;
		list( $intro ) = vpa_desc_parts( $t );
	} else {
		$title = 'כל המוצרים';
		$intro = 'זרי פרחים, צמחים, מארזים, בלונים ומתנות – הכול במקום אחד, עם משלוחים מהירים לקיסריה והסביבה.';
	}
	return '<header class="vpa-head"><h1 class="vpa-title">' . esc_html( $title ) . '</h1>' . ( $intro ? '<p class="vpa-intro">' . esc_html( $intro ) . '</p>' : '' ) . '</header>';
} );

/* ---------- [vns_pa_bar]: category chips + budget + sort ---------- */
add_shortcode( 'vns_pa_bar', function () {
	global $wp_query;
	vpa_assets();
	$t = vpa_term();
	$cur = $t ? (int) $t->term_id : 0;
	$chips = '<a class="vpa-chip' . ( $cur ? '' : ' is-on' ) . '" href="' . esc_url( vpa_link( vpa_shop_url() ) ) . '"' . ( $cur ? '' : ' aria-current="page"' ) . '>הכל</a>';
	foreach ( vpa_cats() as $c ) {
		$on = $cur === (int) $c->term_id || ( $t && in_array( (int) $c->term_id, array_map( 'intval', get_ancestors( $cur, 'product_cat' ) ), true ) );
		$chips .= '<a class="vpa-chip' . ( $on ? ' is-on' : '' ) . '" href="' . esc_url( vpa_link( get_term_link( $c ) ) ) . '"' . ( $on ? ' aria-current="page"' : '' ) . '>' . esc_html( $c->name ) . '</a>';
	}
	$base = $t ? get_term_link( $t ) : vpa_shop_url();
	$cp = vpa_cur_price();
	$prices = '<a class="vpa-pchip' . ( $cp ? '' : ' is-on' ) . '" href="' . esc_url( vpa_link( $base, array( 'price' => '' ) ) ) . '">כל המחירים</a>';
	foreach ( vpa_price_ranges() as $k => $r ) {
		$prices .= '<a class="vpa-pchip' . ( $cp === $k ? ' is-on' : '' ) . '" href="' . esc_url( vpa_link( $base, array( 'price' => $k ) ) ) . '" rel="nofollow">' . esc_html( $r['label'] ) . '</a>';
	}
	$opts = '';
	foreach ( vpa_orders() as $k => $l ) {
		$opts .= '<option value="' . esc_attr( $k ) . '"' . selected( vpa_cur_order(), $k, false ) . '>' . esc_html( $l ) . '</option>';
	}
	$hidden = ( vpa_preview() ? '<input type="hidden" name="vns_pa" value="1">' : '' ) . ( $cp ? '<input type="hidden" name="price" value="' . esc_attr( $cp ) . '">' : '' );
	$n = (int) $wp_query->found_posts;
	$count = 0 === $n ? 'לא נמצאו מוצרים' : ( 1 === $n ? 'מוצר אחד' : $n . ' מוצרים' );
	return '<div class="vpa-bar">'
		. '<nav class="vpa-cats" aria-label="קטגוריות">' . $chips . '</nav>'
		. '<div class="vpa-tools">'
		. '<div class="vpa-prices" role="group" aria-label="סינון לפי תקציב"><span class="vpa-lbl">תקציב:</span>' . $prices . '</div>'
		. '<div class="vpa-side"><span class="vpa-count" aria-live="polite">' . esc_html( $count ) . '</span>'
		. '<form class="vpa-sort" method="get" action="' . esc_url( $base ) . '"><label class="screen-reader-text" for="vpa-orderby">מיון</label>'
		. '<select name="orderby" id="vpa-orderby">' . $opts . '</select>' . $hidden . '<noscript><button type="submit">מיון</button></noscript></form></div>'
		. '</div></div>';
} );

/* ---------- [vns_pa_more]: load more ---------- */
add_shortcode( 'vns_pa_more', function () {
	global $wp_query;
	vpa_assets();
	$total = (int) $wp_query->found_posts;
	$paged = max( 1, (int) get_query_var( 'paged' ) );
	$shown = min( $total, $paged * (int) $wp_query->get( 'posts_per_page' ) );
	if ( $total <= 0 ) { return '<div class="vpa-more" hidden></div>'; }
	$out = '<div class="vpa-more"><p class="vpa-shown">מציג ' . $shown . ' מתוך ' . $total . ' מוצרים</p>';
	if ( $paged < (int) $wp_query->max_num_pages ) {
		$out .= '<a class="vpa-more-btn" href="' . esc_url( get_pagenum_link( $paged + 1 ) ) . '" rel="next"><span class="vpa-more-t">הצגת מוצרים נוספים</span></a>';
	}
	return $out . '</div>';
} );

/* ---------- [vns_pa_reviews]: Google reviews via Trustindex ---------- */
add_shortcode( 'vns_pa_reviews', function () {
	return '<section class="vpa-revs" aria-label="ביקורות בגוגל"><h2 class="vpa-h2">מה הלקוחות שלנו אומרים</h2><p class="vpa-sub">ביקורות אמיתיות מגוגל</p>'
		. '<div class="vpa-ti"><script defer async src="https://cdn.trustindex.io/loader.js?' . esc_attr( VPA_TI_WIDGET ) . '"></script></div></section>';
} );

/* ---------- [vns_pa_faq]: category FAQ (from its Elementor FAQ template) or general FAQ ---------- */
function vpa_faq_items( $tid ) {
	$items = array();
	if ( $tid && class_exists( '\Elementor\Plugin' ) ) {
		$doc = \Elementor\Plugin::$instance->documents->get( $tid );
		$walk = function ( $els ) use ( &$walk, &$items ) {
			foreach ( $els as $e ) {
				if ( isset( $e['widgetType'] ) && 'nested-accordion' === $e['widgetType'] && ! empty( $e['settings']['items'] ) ) {
					foreach ( $e['settings']['items'] as $i => $it ) {
						$a = '';
						$w = function ( $x ) use ( &$w, &$a ) { foreach ( $x as $y ) { if ( isset( $y['widgetType'] ) && 'text-editor' === $y['widgetType'] ) { $a .= $y['settings']['editor'] ?? ''; } $w( $y['elements'] ?? array() ); } };
						$w( isset( $e['elements'][ $i ] ) ? array( $e['elements'][ $i ] ) : array() );
						if ( ! empty( $it['item_title'] ) && '' !== trim( wp_strip_all_tags( $a ) ) ) { $items[] = array( $it['item_title'], $a ); }
					}
					return;
				}
				$walk( $e['elements'] ?? array() );
			}
		};
		if ( $doc ) { $walk( $doc->get_elements_data() ); }
	}
	return $items;
}
add_shortcode( 'vns_pa_faq', function () {
	vpa_assets();
	$t = vpa_term();
	$items = array();
	$title = 'שאלות ותשובות';
	if ( $t ) {
		list( , , $fid ) = vpa_desc_parts( $t );
		$items = vpa_faq_items( $fid );
		if ( $items ) { $title = 'שאלות נפוצות על ' . $t->name; }
	}
	if ( ! $items ) {
		$j = json_decode( (string) file_get_contents( VPA_DIR . 'faq.json' ), true );
		$items = is_array( $j ) ? $j : array();
	}
	if ( ! $items ) { return ''; }
	$out = '<section class="vpa-faq" aria-label="שאלות נפוצות"><h2 class="vpa-h2">' . esc_html( $title ) . '</h2><div class="vpa-faq-l">';
	foreach ( $items as $i => $it ) {
		$a = wpautop( wp_kses_post( $it[1] ) );
		$out .= '<div class="vpa-faq-i"><button type="button" class="vpa-faq-q" aria-expanded="false" aria-controls="vpa-faq-' . $i . '">' . esc_html( wp_strip_all_tags( $it[0] ) ) . vpa_chev() . '</button><div class="vpa-faq-a" id="vpa-faq-' . $i . '" hidden>' . $a . '</div></div>';
	}
	return $out . '</div></section>';
} );

/* ---------- [vns_pa_seo]: category long description ---------- */
add_shortcode( 'vns_pa_seo', function () {
	$t = vpa_term();
	$html = '';
	if ( $t ) { list( , $html ) = vpa_desc_parts( $t ); }
	if ( '' === $html ) { return '<section class="vpa-seo" hidden></section>'; }
	return '<section class="vpa-seo" aria-label="על הקטגוריה"><div class="vpa-seo-in">' . $html . '</div><button type="button" class="vpa-seo-tg" aria-expanded="false" hidden><span>קראו עוד</span>' . vpa_chev() . '</button></section>';
} );
