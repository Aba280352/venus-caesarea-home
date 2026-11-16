<?php
/**
 * Plugin Name: Venus Blog
 * Description: New article template + magazine archive for Venus Caesarea (Elementor). TOC, reading time, topic-matched products (inline, mid-article banner, sticky sidebar, carousel), WhatsApp card, share, author box, related posts, magazine archive with featured post, chips and load more. Preview: add ?vns_bl=1 to any post / category URL or the magazine page; live after option venus_bl_live = 1.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VBL_VER', '1.0.0' );
define( 'VBL_URL', plugin_dir_url( __FILE__ ) );
define( 'VBL_DIR', plugin_dir_path( __FILE__ ) );
define( 'VBL_PER_PAGE', 9 );
define( 'VBL_WA', '972532791444' );

function vbl_preview() { return ! empty( $_GET['vns_bl'] ); }
function vbl_live() { return (bool) get_option( 'venus_bl_live' ); }
function vbl_on() { return vbl_preview() || vbl_live(); }
function vbl_page_id() { return (int) get_option( 'venus_bl_page_id' ); }

/* ================= preview switch ================= */
add_filter( 'elementor/theme/get_location_templates/template_id', function ( $id ) {
	if ( ! vbl_preview() ) { return $id; }
	if ( is_singular( 'post' ) && 'single-post' === get_post_meta( $id, '_elementor_template_type', true ) ) {
		$t = (int) get_option( 'venus_bl_single_tpl' );
		return $t ? $t : $id;
	}
	return $id;
}, 10, 1 );
/* category archives have no Elementor archive template yet: assign ours for this request only */
add_filter( 'option_elementor_pro_theme_builder_conditions', function ( $v ) {
	if ( ! vbl_preview() || is_admin() ) { return $v; }
	$t = (int) get_option( 'venus_bl_archive_tpl' );
	if ( $t && is_array( $v ) ) { $v['archive'][ $t ] = array( 'include/archive/category' ); }
	return $v;
} );
add_action( 'template_redirect', function () {
	if ( vbl_preview() ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
		return;
	}
	if ( vbl_page_id() && is_page( vbl_page_id() ) && ! vbl_live() && ! current_user_can( 'edit_pages' ) ) {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
	}
}, 1 );
add_filter( 'wp_robots', function ( $r ) {
	if ( vbl_preview() || ( vbl_page_id() && is_page( vbl_page_id() ) && ! vbl_live() ) ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );
/* keep the preview flag on post / category / magazine links while previewing */
foreach ( array( 'post_link', 'term_link' ) as $f ) {
	add_filter( $f, function ( $url, $obj = null, $tax = null ) use ( $f ) {
		if ( ! vbl_preview() || is_admin() ) { return $url; }
		if ( 'term_link' === $f && 'category' !== $tax ) { return $url; }
		return add_query_arg( 'vns_bl', '1', $url );
	}, 99, 3 );
}
function vbl_mag_url() {
	$u = vbl_page_id() ? get_permalink( vbl_page_id() ) : home_url( '/' );
	return vbl_preview() ? add_query_arg( 'vns_bl', '1', $u ) : $u;
}

/* ================= helpers ================= */
function vbl_post() {
	$id = get_queried_object_id();
	return ( $id && 'post' === get_post_type( $id ) ) ? get_post( $id ) : null;
}
function vbl_cat( $post ) {
	$pid = (int) get_post_meta( $post->ID, '_yoast_wpseo_primary_category', true );
	if ( $pid && ( $t = get_term( $pid, 'category' ) ) && ! is_wp_error( $t ) ) { return $t; }
	foreach ( get_the_category( $post->ID ) as $t ) { if ( 'uncategorized' !== $t->slug ) { return $t; } }
	return null;
}
function vbl_date( $post ) { return wp_date( 'j בF Y', get_post_timestamp( $post ) ); }
function vbl_excerpt( $post, $len = 170 ) {
	$e = trim( (string) get_post_meta( $post->ID, '_yoast_wpseo_metadesc', true ) );
	if ( '' === $e ) { $e = trim( $post->post_excerpt ); }
	if ( '' === $e ) {
		$txt = preg_replace( '/\[[^\]]*\]/', '', $post->post_content );
		foreach ( preg_split( '/\R/', $txt ) as $l ) {
			if ( preg_match( '/^\s*<h[1-6]/i', $l ) ) { continue; }
			$l = trim( wp_strip_all_tags( $l ) );
			if ( mb_strlen( $l ) > 60 ) { $e = $l; break; }
		}
	}
	if ( mb_strlen( $e ) > $len ) {
		$cut = mb_substr( $e, 0, $len );
		$p = max( (int) mb_strrpos( $cut, '.' ), (int) mb_strrpos( $cut, '!' ), (int) mb_strrpos( $cut, '?' ) );
		$e = $p > 60 ? mb_substr( $cut, 0, $p + 1 ) : rtrim( $cut ) . '…';
	}
	return $e;
}
function vbl_minutes( $post ) {
	$words = count( preg_split( '/\s+/u', trim( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ) ) ) );
	return max( 1, (int) ceil( $words / 180 ) );
}
/* product category that matches the article topic */
function vbl_prod_term( $post ) {
	$hay = $post ? $post->post_title . ' ' . implode( ' ', wp_list_pluck( get_the_category( $post->ID ), 'name' ) ) : '';
	$map = array(
		'/צמח|עציץ|סחלב|ט["״\']?ו בשבט|טו בשבט/u' => 'צמחים וסחלבים',
		'/חתונ|כלה|קישוט רכב/u'                   => 'חתונות',
		'/שוקולד|אלכוהול|יין|וויסקי|פרלינ/u'       => 'אלכוהול ושוקולד',
		'/בלון/u'                                 => 'בלונים וכרטיסי ברכה',
		'/נר |נרות|חנוכה/u'                       => 'נרות',
		'/ואז|אגרטל/u'                            => 'ואזות וכלים',
	);
	$name = 'פרחים';
	foreach ( $map as $re => $n ) { if ( preg_match( $re, $hay ) ) { $name = $n; break; } }
	$t = get_term_by( 'name', $name, 'product_cat' );
	return $t ? $t : get_term_by( 'name', 'פרחים', 'product_cat' );
}
function vbl_products( $post, $n ) {
	$t = vbl_prod_term( $post );
	if ( ! $t ) { return array(); }
	return wc_get_products( array( 'status' => 'publish', 'limit' => $n, 'visibility' => 'catalog', 'stock_status' => 'instock', 'category' => array( $t->slug ), 'orderby' => 'popularity', 'order' => 'DESC' ) );
}
function vbl_money( $n ) { $n = (float) $n; return '₪' . number_format( $n, floor( $n ) == $n ? 0 : 2, '.', ',' ); }
function vbl_icon( $name ) {
	$p = array(
		'wa'   => '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>',
		'fb'   => '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
		'link' => '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
		'chev' => '<path d="M6 9l6 6 6-6"/>',
		'clock'=> '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
	);
	return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $p[ $name ] . '</svg>';
}
function vbl_assets() {
	static $done = false;
	if ( $done ) { return; }
	$done = true;
	wp_enqueue_script( 'venus-blog', VBL_URL . 'assets/blog.js', array(), filemtime( VBL_DIR . 'assets/blog.js' ), true );
}
function vbl_wa_link( $post ) {
	$msg = $post ? 'היי, הגעתי מהמאמר "' . get_the_title( $post ) . '" ואשמח לעזרה בבחירת מתנה 🌸' : 'היי, אשמח לעזרה בבחירת מתנה 🌸';
	return 'https://wa.me/' . VBL_WA . '?text=' . rawurlencode( $msg );
}

/* processed article html + toc (computed once) */
function vbl_body( $post ) {
	static $cache = array();
	if ( isset( $cache[ $post->ID ] ) ) { return $cache[ $post->ID ]; }
	$raw = preg_replace( '/\[elementor-template id="?1614"?\s*\]/', '[vns_bl_inline_products]', $post->post_content );
	$GLOBALS['post'] = $post;
	setup_postdata( $post );
	$html = apply_filters( 'the_content', $raw );
	/* the hero already shows the featured image: drop the same image if it repeats in the body */
	$fid = get_post_thumbnail_id( $post );
	if ( $fid ) {
		$base = preg_replace( array( '/\.[a-z0-9]+$/i', '/-scaled$/' ), '', wp_basename( (string) get_attached_file( $fid ) ) );
		$re = '/<img[^>]*(?:wp-image-' . (int) $fid . '\b' . ( $base ? '|' . preg_quote( $base, '/' ) : '' ) . ')[^>]*>/i';
		if ( preg_match( $re, $html, $m ) ) {
			$img = preg_quote( $m[0], '/' );
			$html = preg_replace( '/<(figure|p)\b[^>]*>\s*(?:<a\b[^>]*>)?\s*' . $img . '\s*(?:<\/a>)?\s*(?:<figcaption\b.*?<\/figcaption>)?\s*<\/\1>/is', '', $html, 1, $cnt );
			if ( ! $cnt ) { $html = preg_replace( '/' . $img . '/', '', $html, 1 ); }
		}
	}
	$toc = array();
	$i = 0;
	$html = preg_replace_callback( '/<h2([^>]*)>(.*?)<\/h2>/is', function ( $m ) use ( &$i, &$toc ) {
		$i++;
		$txt = trim( wp_strip_all_tags( $m[2] ) );
		$toc[] = array( 's' . $i, $txt );
		$attrs = preg_replace( '/\sid="[^"]*"/', '', $m[1] );
		return '<h2 id="s' . $i . '"' . $attrs . '>' . $m[2] . '</h2>';
	}, $html );
	/* mid-article banner before the middle h2 */
	if ( $i >= 4 ) {
		$mid = (int) floor( $i / 2 ) + 1;
		$html = preg_replace( '/<h2 id="s' . $mid . '"/', vbl_mid_banner( $post ) . '<h2 id="s' . $mid . '"', $html, 1 );
	}
	wp_reset_postdata();
	return $cache[ $post->ID ] = array( $html, $toc );
}
function vbl_mid_banner( $post ) {
	$t = vbl_prod_term( $post );
	if ( ! $t ) { return ''; }
	$link = get_term_link( $t );
	return '<aside class="vbl-mid" aria-label="מהחנות"><div class="vbl-mid-t">מחפשים ' . esc_html( $t->name ) . '?</div>'
		. '<p>אצלנו בוונוס קיסריה מעצבים כל הזמנה ביד, ושולחים לקיסריה והסביבה תוך כמה שעות.</p>'
		. '<div class="vbl-mid-b"><a class="vbl-btn vbl-btn-cream" href="' . esc_url( $link ) . '">ל' . esc_html( $t->name ) . ' בחנות</a>'
		. '<a class="vbl-btn vbl-btn-line" href="' . esc_url( vbl_wa_link( $post ) ) . '" target="_blank" rel="noopener">' . vbl_icon( 'wa' ) . 'התייעצות בוואטסאפ</a></div></aside>';
}

/* ================= single shortcodes ================= */
add_shortcode( 'vns_bl_head', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	vbl_assets();
	$cat = vbl_cat( $post );
	$sep = '<i aria-hidden="true">›</i>';
	$crumbs = '<nav class="vbl-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a>' . $sep . '<a href="' . esc_url( vbl_mag_url() ) . '">מגזין</a>'
		. ( $cat ? $sep . '<a href="' . esc_url( get_term_link( $cat ) ) . '">' . esc_html( $cat->name ) . '</a>' : '' ) . '</nav>';
	return '<header class="vbl-head">' . $crumbs
		. ( $cat ? '<a class="vbl-tag" href="' . esc_url( get_term_link( $cat ) ) . '">' . esc_html( $cat->name ) . '</a>' : '' )
		. '<h1 class="vbl-title">' . esc_html( get_the_title( $post ) ) . '</h1>'
		. '<p class="vbl-intro">' . esc_html( vbl_excerpt( $post, 220 ) ) . '</p>'
		. '<div class="vbl-meta"><span class="vbl-av" aria-hidden="true">V</span><span>צוות ונוס קיסריה</span><i aria-hidden="true">·</i><time datetime="' . esc_attr( get_the_date( 'c', $post ) ) . '">' . esc_html( vbl_date( $post ) ) . '</time><i aria-hidden="true">·</i><span class="vbl-read">' . vbl_icon( 'clock' ) . vbl_minutes( $post ) . ' דק׳ קריאה</span></div>'
		. '</header>';
} );
add_shortcode( 'vns_bl_hero', function () {
	$post = vbl_post();
	if ( ! $post || ! has_post_thumbnail( $post ) ) { return ''; }
	return '<figure class="vbl-hero">' . get_the_post_thumbnail( $post, 'full', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'sizes' => '(max-width:1300px) 92vw, 1240px', 'alt' => esc_attr( get_the_title( $post ) ) ) ) . '</figure>';
} );
add_shortcode( 'vns_bl_toc', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	list( , $toc ) = vbl_body( $post );
	if ( count( $toc ) < 2 ) { return ''; }
	$li = '';
	foreach ( $toc as $t ) { $li .= '<li><a href="#' . esc_attr( $t[0] ) . '">' . esc_html( $t[1] ) . '</a></li>'; }
	return '<details class="vbl-toc"><summary><span>מה במאמר</span><small>' . count( $toc ) . ' פרקים</small>' . vbl_icon( 'chev' ) . '</summary><ol>' . $li . '</ol></details>';
} );
add_shortcode( 'vns_bl_content', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	list( $html ) = vbl_body( $post );
	return '<div class="vbl-content">' . $html . '</div>';
} );
add_shortcode( 'vns_bl_inline_products', function () {
	$post = vbl_post();
	$items = vbl_products( $post, 4 );
	if ( ! $items ) { return ''; }
	$t = vbl_prod_term( $post );
	$out = '<div class="vbl-inprod"><div class="vbl-inprod-h"><span>מהחנות שלנו</span><a href="' . esc_url( get_term_link( $t ) ) . '">לכל ה' . esc_html( $t->name ) . '</a></div><div class="vbl-inprod-g">';
	foreach ( $items as $p ) {
		$out .= '<a class="vbl-pc" href="' . esc_url( $p->get_permalink() ) . '"><span class="vbl-pc-img">' . $p->get_image( 'woocommerce_thumbnail', array( 'loading' => 'lazy', 'alt' => '' ) ) . '</span><span class="vbl-pc-n">' . esc_html( $p->get_name() ) . '</span><span class="vbl-pc-p">' . esc_html( vbl_money( $p->get_price() ) ) . '</span></a>';
	}
	return $out . '</div></div>';
} );
add_shortcode( 'vns_bl_share', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	$url = get_permalink( $post );
	$url = remove_query_arg( 'vns_bl', $url );
	$title = get_the_title( $post );
	return '<div class="vbl-share"><span>אהבתם? שתפו:</span>'
		. '<a href="https://wa.me/?text=' . rawurlencode( $title . ' ' . $url ) . '" target="_blank" rel="noopener" aria-label="שיתוף בוואטסאפ">' . vbl_icon( 'wa' ) . '</a>'
		. '<a href="https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode( $url ) . '" target="_blank" rel="noopener" aria-label="שיתוף בפייסבוק">' . vbl_icon( 'fb' ) . '</a>'
		. '<button type="button" class="vbl-copy" data-url="' . esc_attr( $url ) . '" aria-label="העתקת קישור">' . vbl_icon( 'link' ) . '</button><em class="vbl-copied" hidden>הקישור הועתק ✓</em></div>';
} );
add_shortcode( 'vns_bl_author', function () {
	$logo = wp_get_attachment_url( get_theme_mod( 'custom_logo' ) );
	$shop = function_exists( 'wc_get_page_id' ) ? get_permalink( wc_get_page_id( 'shop' ) ) : home_url( '/' );
	return '<section class="vbl-author" aria-label="על הכותבים">' . ( $logo ? '<span class="vbl-author-logo"><img src="' . esc_url( $logo ) . '" alt="ונוס קיסריה" width="160" height="80" loading="lazy"></span>' : '' )
		. '<div><small>נכתב על ידי</small><b>צוות ונוס קיסריה</b><p>אנחנו חנות פרחים ומתנות במרכז המסחרי C-CENTER בקיסריה. מעצבים זרים, עציצים ומארזים בעבודת יד, ושולחים לקיסריה ולכל הסביבה.</p>'
		. '<span class="vbl-author-l"><a href="' . esc_url( $shop ) . '">לחנות שלנו</a><a href="https://wa.me/' . VBL_WA . '" target="_blank" rel="noopener">וואטסאפ 053-279-1444</a></span></div></section>';
} );
add_shortcode( 'vns_bl_side', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	$items = vbl_products( $post, 3 );
	$t = vbl_prod_term( $post );
	$out = '<aside class="vbl-side"><div class="vbl-wa"><div class="vbl-wa-t">רוצים זר מותאם אישית?</div><p>ספרו לנו למי ולאיזה אירוע, ונציע מתנה שמתאימה בדיוק.</p>'
		. '<a class="vbl-btn vbl-btn-cream vbl-btn-full" href="' . esc_url( vbl_wa_link( $post ) ) . '" target="_blank" rel="noopener">' . vbl_icon( 'wa' ) . 'כתבו לנו בוואטסאפ</a></div>';
	if ( $items ) {
		$out .= '<div class="vbl-sp"><div class="vbl-sp-h">מוצרים שיתאימו</div>';
		foreach ( $items as $p ) {
			$out .= '<a class="vbl-sp-i" href="' . esc_url( $p->get_permalink() ) . '"><span class="vbl-sp-img">' . $p->get_image( 'thumbnail', array( 'loading' => 'lazy', 'alt' => '' ) ) . '</span><span><span class="vbl-sp-n">' . esc_html( $p->get_name() ) . '</span><span class="vbl-sp-p">' . esc_html( vbl_money( $p->get_price() ) ) . '</span></span></a>';
		}
		$out .= '<a class="vbl-sp-all" href="' . esc_url( get_term_link( $t ) ) . '">לכל ה' . esc_html( $t->name ) . ' ←</a></div>';
	}
	return $out . '</aside>';
} );
function vbl_card( $p, $cls = 'vbl-card' ) {
	$cat = vbl_cat( $p );
	return '<a class="' . $cls . '" href="' . esc_url( get_permalink( $p ) ) . '"><span class="vbl-card-img">' . get_the_post_thumbnail( $p, 'medium_large', array( 'loading' => 'lazy', 'alt' => '', 'sizes' => '(max-width:767px) 92vw, 400px' ) )
		. ( $cat ? '<span class="vbl-card-cat">' . esc_html( $cat->name ) . '</span>' : '' ) . '</span><span class="vbl-card-body"><span class="vbl-card-date">' . esc_html( vbl_date( $p ) ) . '</span>'
		. '<h3 class="vbl-card-h">' . esc_html( get_the_title( $p ) ) . '</h3><span class="vbl-card-ex">' . esc_html( vbl_excerpt( $p, 150 ) ) . '</span><span class="vbl-card-more">לקריאת הכתבה</span></span></a>';
}
add_shortcode( 'vns_bl_related', function () {
	$post = vbl_post();
	if ( ! $post ) { return ''; }
	$cats = wp_list_pluck( get_the_category( $post->ID ), 'term_id' );
	$q = get_posts( array( 'numberposts' => 3, 'post__not_in' => array( $post->ID ), 'category__in' => $cats, 'orderby' => 'date' ) );
	if ( count( $q ) < 3 ) { $q = array_merge( $q, get_posts( array( 'numberposts' => 3 - count( $q ), 'post__not_in' => array_merge( array( $post->ID ), wp_list_pluck( $q, 'ID' ) ) ) ) ); }
	if ( ! $q ) { return ''; }
	$out = '<section class="vbl-more" aria-label="מאמרים נוספים"><div class="vbl-more-h"><h2 class="vbl-h2">עוד מהמגזין</h2><a href="' . esc_url( vbl_mag_url() ) . '">לכל המאמרים</a></div><div class="vbl-grid">';
	foreach ( $q as $p ) { $out .= vbl_card( $p ); }
	return $out . '</div></section>';
} );
/* end-of-article product carousel (Elementor loop grid with Query ID vns_bl_products) */
add_action( 'elementor/query/vns_bl_products', function ( $q ) {
	$post = vbl_post();
	$t = vbl_prod_term( $post );
	if ( ! $t ) { return; }
	$q->set( 'post_type', 'product' );
	$q->set( 'posts_per_page', 8 );
	$q->set( 'tax_query', array( 'relation' => 'AND',
		array( 'taxonomy' => 'product_cat', 'field' => 'term_id', 'terms' => array( $t->term_id ) ),
		array( 'taxonomy' => 'product_visibility', 'field' => 'name', 'terms' => array( 'exclude-from-catalog', 'outofstock' ), 'operator' => 'NOT IN' ) ) );
	$q->set( 'meta_key', 'total_sales' );
	$q->set( 'orderby', array( 'meta_value_num' => 'DESC', 'ID' => 'DESC' ) );
} );

/* ================= archive shortcodes (magazine page + category archives) ================= */
function vbl_term() {
	$o = get_queried_object();
	return ( $o instanceof WP_Term && 'category' === $o->taxonomy ) ? $o : null;
}
function vbl_page_num() { return max( 1, isset( $_GET['pg'] ) ? (int) $_GET['pg'] : 1 ); }
/* SEO: "load more" pages (?pg=N) list different posts, so they get their own canonical instead of pointing to page 1 */
add_filter( 'wpseo_canonical', function ( $c ) {
	if ( vbl_on() && vbl_page_num() > 1 && ( is_category() || ( vbl_page_id() && is_page( vbl_page_id() ) ) ) && $c ) {
		return add_query_arg( 'pg', vbl_page_num(), $c );
	}
	return $c;
} );
function vbl_cats() {
	$terms = get_terms( array( 'taxonomy' => 'category', 'hide_empty' => true ) );
	return is_wp_error( $terms ) ? array() : array_values( array_filter( $terms, function ( $t ) { return 'uncategorized' !== $t->slug; } ) );
}
function vbl_arch_query() {
	$t = vbl_term();
	$args = array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => VBL_PER_PAGE, 'paged' => vbl_page_num(), 'ignore_sticky_posts' => true );
	if ( $t ) { $args['cat'] = $t->term_id; }
	return new WP_Query( $args );
}
add_shortcode( 'vns_bl_arch_head', function () {
	vbl_assets();
	$t = vbl_term();
	$sep = '<i aria-hidden="true">›</i>';
	$crumbs = '<nav class="vbl-crumbs" aria-label="פירורי לחם"><a href="' . esc_url( home_url( '/' ) ) . '">דף הבית</a>' . $sep . ( $t ? '<a href="' . esc_url( vbl_mag_url() ) . '">מגזין</a>' . $sep . '<span>' . esc_html( $t->name ) . '</span>' : '<span>מגזין</span>' ) . '</nav>';
	$intro = $t && trim( $t->description ) ? wp_trim_words( wp_strip_all_tags( $t->description ), 40 ) : 'טיפים, רעיונות למתנות ומדריכים מעולם הפרחים, מצוות ונוס קיסריה.';
	$chips = '<a class="vbl-chip' . ( $t ? '' : ' is-on' ) . '" href="' . esc_url( vbl_mag_url() ) . '">הכל</a>';
	foreach ( vbl_cats() as $c ) {
		$on = $t && (int) $t->term_id === (int) $c->term_id;
		$chips .= '<a class="vbl-chip' . ( $on ? ' is-on' : '' ) . '" href="' . esc_url( get_term_link( $c ) ) . '"' . ( $on ? ' aria-current="page"' : '' ) . '>' . esc_html( $c->name ) . '</a>';
	}
	return '<header class="vbl-ahead">' . $crumbs . '<h1 class="vbl-atitle">' . esc_html( $t ? $t->name : 'המגזין של ונוס' ) . '</h1><p class="vbl-aintro">' . esc_html( $intro ) . '</p><nav class="vbl-chips" aria-label="קטגוריות">' . $chips . '</nav></header>';
} );
add_shortcode( 'vns_bl_arch_list', function () {
	vbl_assets();
	$q = vbl_arch_query();
	$posts = $q->posts;
	$out = '<div class="vbl-alist">';
	if ( ! $posts ) { return $out . '<p class="vbl-empty">עדיין אין כאן מאמרים.</p></div>'; }
	if ( 1 === vbl_page_num() ) {
		$f = array_shift( $posts );
		$cat = vbl_cat( $f );
		$out .= '<article class="vbl-feat"><a class="vbl-feat-img" href="' . esc_url( get_permalink( $f ) ) . '" tabindex="-1">' . get_the_post_thumbnail( $f, 'large', array( 'loading' => 'eager', 'alt' => '', 'sizes' => '(max-width:767px) 92vw, 680px' ) ) . '</a>'
			. '<div class="vbl-feat-t">' . ( $cat ? '<span class="vbl-tag">' . esc_html( $cat->name ) . '</span>' : '' ) . '<span class="vbl-card-date">' . esc_html( vbl_date( $f ) ) . ' · ' . vbl_minutes( $f ) . ' דק׳ קריאה</span>'
			. '<h2 class="vbl-feat-h"><a href="' . esc_url( get_permalink( $f ) ) . '">' . esc_html( get_the_title( $f ) ) . '</a></h2><p>' . esc_html( vbl_excerpt( $f, 200 ) ) . '</p>'
			. '<a class="vbl-btn vbl-btn-green" href="' . esc_url( get_permalink( $f ) ) . '">לקריאת הכתבה</a></div></article>';
	}
	$out .= '<div class="vbl-grid vbl-agrid">';
	foreach ( $posts as $p ) { $out .= vbl_card( $p ); }
	$out .= '</div>';
	$shown = min( (int) $q->found_posts, vbl_page_num() * VBL_PER_PAGE );
	$out .= '<div class="vbl-amore"><p>מציג ' . $shown . ' מתוך ' . (int) $q->found_posts . ' מאמרים</p>';
	if ( vbl_page_num() < (int) $q->max_num_pages ) {
		$out .= '<a class="vbl-more-btn" href="' . esc_url( add_query_arg( 'pg', vbl_page_num() + 1 ) ) . '" rel="next">עוד מאמרים</a>';
	}
	return $out . '</div></div>';
} );
