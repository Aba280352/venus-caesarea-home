<?php
/**
 * Plugin Name: Venus Pages
 * Description: Hidden preview for new Venus pages (About, ...). Pages listed in option venus_hidden_pages return 404 to visitors unless ?vns_pv=1 (noindex) or the page id is in venus_live_pages. Also renders [vns_img id size class] for Elementor HTML.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function vpg_hidden_ids() { return array_map( 'intval', (array) get_option( 'venus_hidden_pages', array() ) ); }
function vpg_is_hidden_page() {
	if ( ! is_page() ) { return false; }
	$id = get_queried_object_id();
	return in_array( $id, vpg_hidden_ids(), true ) && ! in_array( $id, array_map( 'intval', (array) get_option( 'venus_live_pages', array() ) ), true );
}
add_action( 'template_redirect', function () {
	if ( ! vpg_is_hidden_page() ) { return; }
	if ( ! empty( $_GET['vns_pv'] ) ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
		nocache_headers();
		return;
	}
	if ( ! current_user_can( 'edit_pages' ) ) {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
	}
}, 1 );
add_filter( 'wp_robots', function ( $r ) {
	if ( vpg_is_hidden_page() ) { $r['noindex'] = true; $r['nofollow'] = true; }
	return $r;
}, 99 );
/* [vns_img id="123" size="large" class="x" sizes="..."] - responsive attachment image for static HTML sections.
   crop="1": the image is cropped with object-fit:cover into a box of another shape, so the browser must follow our sizes hint
   (WordPress otherwise prefixes lazy images with sizes="auto", which picks a file as wide as the box and looks soft after the crop). */
add_shortcode( 'vns_img', function ( $a ) {
	$a = shortcode_atts( array( 'id' => 0, 'size' => 'large', 'class' => '', 'sizes' => '', 'alt' => '', 'eager' => '', 'crop' => '' ), $a );
	$attr = array( 'class' => $a['class'], 'loading' => $a['eager'] ? 'eager' : 'lazy' );
	if ( $a['sizes'] ) { $attr['sizes'] = $a['sizes']; }
	if ( '' !== $a['alt'] ) { $attr['alt'] = $a['alt']; }
	$noauto = $a['crop'] && $a['sizes'];
	/* "auto" is only added to lazy images (also later, by the content filter), so a cropped image loads normally with a low priority */
	if ( $noauto ) { $attr['loading'] = 'eager'; $attr['fetchpriority'] = 'low'; }
	if ( $noauto ) { add_filter( 'wp_img_tag_add_auto_sizes', '__return_false' ); }
	$html = wp_get_attachment_image( (int) $a['id'], $a['size'], false, $attr );
	if ( $noauto ) { remove_filter( 'wp_img_tag_add_auto_sizes', '__return_false' ); }
	return $html;
} );
