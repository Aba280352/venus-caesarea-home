<?php
/**
 * Plugin Name: Venus Go-Live
 * Description: Switches venus-caesarea.net to the new design with a full backup and a one-call revert. Apply: vgl_apply(). Revert: vgl_revert(). Backup: option venus_golive_backup + uploads/venus-backups/golive-*.json. Also prints the homepage H1 (first hero slide heading). Nothing is deleted: old templates stay published, only their display conditions move.
 * Version: 1.0.0
 * Author: Venus Caesarea
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ---------------- SEO: homepage H1 = first hero slide heading (same look, h2 -> h1) ---------------- */
add_filter( 'elementor/widget/render_content', function ( $html, $widget ) {
	if ( 'vnsslides' !== $widget->get_id() ) { return $html; } /* id exists only on the homepage (and its noindex preview) */
	return vgl_h1( $html );
}, 10, 2 );
function vgl_h1( $html ) {
	return preg_replace( '~<h2 class="elementor-slide-heading">(.*?)</h2>~s', '<h1 class="elementor-slide-heading">$1</h1>', $html, 1 );
}
/* the hero carousel (Swiper loop) clones slides: keep one H1, clones go back to h2 */
add_action( 'wp_footer', function () {
	if ( ! is_front_page() ) { return; }
	echo "<script>(function(){function f(){var h=[].slice.call(document.querySelectorAll('.elementor-element-vnsslides h1.elementor-slide-heading'));if(h.length<2)return;var keep=h.filter(function(e){return !e.closest('.swiper-slide-duplicate')})[0]||h[0];h.forEach(function(e){if(e===keep)return;var n=document.createElement('h2');n.className=e.className;n.innerHTML=e.innerHTML;e.parentNode.replaceChild(n,e);});}window.addEventListener('load',function(){f();setTimeout(f,1500);setTimeout(f,4000);});})();</script>";
}, 99 );
/* cart / checkout: the theme's hidden page title is a second H1 next to the new heading */
add_filter( 'hello_elementor_page_title', function ( $show ) {
	if ( get_option( 'venus_ct_live' ) && function_exists( 'is_cart' ) && ( is_cart() || is_checkout() ) ) { return false; }
	return $show;
} );
/* fallback: final Elementor output of the front page */
add_filter( 'elementor/frontend/the_content', function ( $html ) {
	if ( ! is_front_page() || false !== strpos( $html, '<h1 class="elementor-slide-heading">' ) ) { return $html; }
	return vgl_h1( $html );
}, 99 );

/* ---------------- speed: first screen of the homepage (hero slider) ----------------
   Before: the first slide stayed blurred with hidden text until the slider script started (seconds on a slow phone),
   its 324KB JPEG was discovered late (CSS background) and all 7 slide images loaded at once.
   Now: fonts + first slide image are preloaded, slides use lighter WebP copies (assets/hero), the first slide is
   sharp with visible text from the first paint, and slides 2-7 load only after the slider starts. */
function vgl_hero_url( $i, $mobile = false ) {
	$f = 'assets/hero/hero-' . $i . ( $mobile ? '-m' : '' ) . '.webp';
	return plugins_url( $f, __FILE__ ) . '?v=' . @filemtime( __DIR__ . '/' . $f );
}
add_action( 'wp_head', function () {
	if ( ! get_option( 'venus_header_live' ) ) { return; }
	$fonts = content_url( 'uploads/venus-fonts/' );
	foreach ( array( 'Leon-Bold', 'DiscoveryFs-Medium', 'DiscoveryFs-Light' ) as $f ) {
		echo '<link rel="preload" as="font" type="font/woff2" href="' . esc_url( $fonts . $f . '.woff2' ) . '" crossorigin>' . "\n";
	}
	if ( ! is_front_page() || ! file_exists( __DIR__ . '/assets/hero/hero-0.webp' ) ) { return; }
	echo '<link rel="preload" as="image" type="image/webp" href="' . esc_url( vgl_hero_url( 0 ) ) . '" media="(min-width:768px)" fetchpriority="high">' . "\n";
	echo '<link rel="preload" as="image" type="image/webp" href="' . esc_url( vgl_hero_url( 0, true ) ) . '" media="(max-width:767px)" fetchpriority="high">' . "\n";
	$s  = '.elementor-element-vnsslides';
	$p  = $s . ' .swiper:not(.swiper-initialized) .swiper-slide';
	$d  = '';
	$m  = '';
	for ( $i = 0; $i < 7; $i++ ) {
		$d .= $s . ' .elementor-repeater-item-vns' . $i . 'hero .swiper-slide-bg{background-image:url(' . esc_url( vgl_hero_url( $i ) ) . ')!important}';
		$m .= $s . ' .elementor-repeater-item-vns' . $i . 'hero .swiper-slide-bg{background-image:url(' . esc_url( vgl_hero_url( $i, true ) ) . ')!important}';
	}
	echo '<style id="vgl-hero">' . $d . '@media(max-width:767px){' . $m . '}'
		. $p . ':first-child .swiper-slide-bg{filter:none!important;transition:none!important}'
		. $p . ':first-child .swiper-slide-contents{opacity:1!important;filter:none!important;translate:0 0!important;transition:none!important}'
		. $p . ':not(:first-child) .swiper-slide-bg{background-image:none!important}'
		. '@media(min-width:1025px){' . $p . ':first-child .swiper-slide-bg{transform:scale(1.01)!important;background-size:120% auto!important;background-position:100% 50%!important}}'
		/* mobile + tablet: no dark frame (the container was #141414 and showed at the edges) and the photo fades into the page
		   at the bottom with a mask, so there is no visible bottom edge */
		. '@media(max-width:1024px){.elementor-element-vnshero{background:transparent!important;border-bottom-left-radius:0!important;border-bottom-right-radius:0!important}'
		. '.elementor-element-vnshero .swiper-slide-bg{-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 46%,rgba(0,0,0,.55) 72%,transparent 100%);mask-image:linear-gradient(to bottom,#000 0%,#000 46%,rgba(0,0,0,.55) 72%,transparent 100%)}'
		. '.elementor-element-vnshero .swiper-slide-bg:after{background:linear-gradient(0deg,#FFFBE9 0%,rgba(255,251,233,.82) 30%,rgba(255,251,233,0) 62%)!important}}'
		. '</style>' . "\n";
}, 1 );

/* ---------------- store QA: product-card buttons everywhere ----------------
   Cards (loop item #2265) carry a "הוספה לעגלה" button. In the shop/category grid venus-shop-archive handles it; elsewhere
   (homepage carousels, blog, cart empty state) it only opened the product. Now: real AJAX add + header badge sync, and
   out-of-stock cards say "אזל במלאי" and open the product page. */
add_action( 'wp_footer', function () {
	if ( ! get_option( 'venus_header_live' ) || is_admin() ) { return; }
	?>
<style id="vgl-popup">#elementor-popup-modal-2489 .dialog-widget-content{border-radius:20px!important;overflow:hidden!important}#elementor-popup-modal-2489 .dialog-message{border-radius:20px}@media(max-width:767px){#elementor-popup-modal-2489 .dialog-widget-content,#elementor-popup-modal-2489 .dialog-message{border-radius:16px!important}}</style>
<style id="vgl-cards">.e-loop-item .vrc-btn.is-oos .elementor-heading-title{background:#ECE8DA!important;color:#55544e!important}.e-loop-item .vrc-btn.is-added .elementor-heading-title{background:var(--e-global-color-vnsgreen,#3A4831)!important;color:#fff!important}.e-loop-item .vrc-btn.is-busy{opacity:.7}a.added_to_cart.wc-forward{color:var(--e-global-color-vnsgreen,#3A4831)!important}</style>
<script id="vgl-cards-js">(function(){
var AJAX='/?wc-ajax=add_to_cart';
function setLabel(b,t){var rt=b.querySelectorAll('.vns-rt > span');if(rt.length){[].forEach.call(rt,function(s){s.textContent=t;});return;}var h=b.querySelector('.elementor-heading-title');if(h){h.textContent=t;}}
function getLabel(b){var s=b.querySelector('.vns-rt > span')||b.querySelector('.elementor-heading-title');return s?s.textContent:'';}
function mark(root){[].forEach.call((root||document).querySelectorAll('.e-loop-item.outofstock .vrc-btn:not(.is-oos)'),function(b){b.classList.add('is-oos');setLabel(b,'אזל במלאי');});}
function pid(b){var it=b.closest('.e-loop-item');var m=it&&it.className.match(/(?:^|\s)post-(\d+)(?:\s|$)/);return m?m[1]:0;}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.e-loop-item .vrc-btn');
  if(!b||b.closest('.vpa')||b.classList.contains('is-oos')){return;} /* shop grid: venus-shop-archive; sold out: open product */
  var id=pid(b);if(!id||!window.fetch){return;}
  e.preventDefault();e.stopPropagation();
  if(b.classList.contains('is-busy')){return;}
  var it=b.closest('.e-loop-item'),link=(it.querySelector('a[href]')||it.closest('a[href]')),old=getLabel(b);
  b.classList.add('is-busy');
  var fd=new FormData();fd.append('product_id',id);fd.append('quantity',1);
  fetch(AJAX,{method:'POST',body:fd,credentials:'same-origin'}).then(function(r){return r.json();}).then(function(r){
    b.classList.remove('is-busy');
    if(!r||r.error){if(r&&r.product_url){location.href=r.product_url;return;}throw 0;}
    b.classList.add('is-added');setLabel(b,'נוסף לעגלה ✓');
    if(window.jQuery){window.jQuery(document.body).trigger('added_to_cart',[r.fragments,r.cart_hash]);window.jQuery(document.body).trigger('wc_fragment_refresh');}
    setTimeout(function(){b.classList.remove('is-added');setLabel(b,old);},1800);
  }).catch(function(){b.classList.remove('is-busy');if(link){location.href=link.href;}});
},true);
mark();
var q=0;if('MutationObserver' in window){new MutationObserver(function(){if(q){return;}q=1;setTimeout(function(){q=0;mark();},300);}).observe(document.body,{childList:true,subtree:true});}
})();</script>
	<?php
}, 99 );

/* TZD test product (₪1, "לא למכירה") must never appear in product lists / carousels; the product itself stays as is */
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() || $q->is_main_query() ) { return; }
	$pt = (array) $q->get( 'post_type' );
	if ( ! in_array( 'product', $pt, true ) ) { return; }
	$q->set( 'post__not_in', array_merge( (array) $q->get( 'post__not_in' ), array( 2153 ) ) );
} );

/* ---------------- ids ---------------- */
const VGL_HOME = 231;          /* front page (keeps URL + Yoast) */
const VGL_HOME_NEW = 2252;     /* new homepage built here (preview, noindex) */
const VGL_CONTACT = 357;       /* /צור-קשר/ (keeps URL) */
const VGL_CONTACT_NEW = 2455;  /* /contact-new/ (hidden) */
const VGL_FOOTER = 2360;
const VGL_MENU = 51;

function vgl_templates() {
	/* new => conditions ; old => conditions removed (kept published) */
	return array(
		'new' => array(
			2186 => array( 'include/general' ),            /* header */
			2360 => array( 'include/general' ),            /* footer */
			2407 => array( 'include/product' ),            /* single product */
			2413 => array( 'include/product_archive' ),    /* shop + product categories */
			2436 => array( 'include/singular/post' ),      /* article */
			2438 => array( 'include/archive/category' ),   /* blog category archive */
		),
		'old' => array( 291, 342, 312, 414, 1384 ),
	);
}
function vgl_live_pages() { return array( 2450, 2458, 2463, 2466, 2471, 2473 ); }
function vgl_options() {
	return array( 'venus_header_live', 'venus_ct_live', 'venus_pa_live', 'venus_bl_live', 'venus_gc_live', 'venus_live_pages', 'venus_hidden_pages', 'elementor_pro_theme_builder_conditions' );
}
function vgl_meta_keys() {
	return array( '_elementor_data', '_elementor_page_settings', '_wp_page_template', '_elementor_edit_mode', '_elementor_template_type', '_elementor_page_assets', '_elementor_version', '_elementor_pro_version', '_elementor_conditions', '_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_meta-robots-noindex' );
}
function vgl_seo() {
	return array(
		VGL_HOME => array( '', 'ונוס קיסריה, חנות פרחים ומתנות בקיסריה: זרי פרחים בעבודת יד, צמחים וסחלבים, זרי כלה ומארזי מתנה, עם משלוחים לקיסריה והסביבה.' ),
		2450 => array( 'אודות ונוס קיסריה | חנות פרחים ומתנות בקיסריה', 'ונוס קיסריה היא חנות פרחים ומתנות במתחם C Center בקיסריה: זרים בעבודת יד, צמחים, מתנות ומשלוחים לקיסריה והסביבה. דירוג 5.0 בגוגל.' ),
		2458 => array( 'עיצוב במות לאירועים בפרחים | ונוס קיסריה', 'עיצוב במות בפרחים לחתונות, בר ובת מצווה, אירועי חברה ואירועים פרטיים בקיסריה, בשרון ובכרמל. הצעת מחיר אישית ותיאום בוואטסאפ.' ),
		2463 => array( 'פרחים לאירועים עסקיים ולמשרדים | ונוס קיסריה', 'סידורי פרחים לכנסים ולאירועי חברה, פרחים קבועים למשרד ומתנות לעובדים וללקוחות. ונוס קיסריה, הצעת מחיר מותאמת לעסק.' ),
		2466 => array( 'עיצוב אירוע פרטי ועיצוב חופה בפרחים | ונוס קיסריה', 'עיצוב חופה וסידורי פרחים לאירועים פרטיים, מחתונה קטנה ועד אירוע בבית. ונוס קיסריה, הצעת מחיר אישית ותיאום בוואטסאפ.' ),
		2471 => array( 'קישוט רכב לחתונה בפרחים | ונוס קיסריה', 'קישוט רכב חתן וכלה בפרחים טריים: קישוט מלא או קישוט ידיות, הזמנה באתר או עיצוב בהתאמה אישית. ונוס קיסריה.' ),
		2473 => array( 'זרי כלה בעיצוב אישי | ונוס קיסריה', 'זרי כלה מפרחים טריים בעיצוב אישי: לבן קלאסי, ורדים, פרחי בר ועוד. הזמנה באתר או זר בהתאמה אישית בקיסריה והסביבה.' ),
		2440 => array( 'המגזין של ונוס | מדריכים ורעיונות לפרחים ומתנות', 'מדריכים, השראה וטיפים על זרי פרחים, צמחים, מתנות, חתונות ומשלוחי פרחים בקיסריה והסביבה, המגזין של ונוס קיסריה.' ),
		2425 => array( 'גיפט קארד ונוס קיסריה | כרטיס מתנה דיגיטלי', 'כרטיס מתנה דיגיטלי של ונוס קיסריה בסכום לבחירה, נשלח במייל לנמען וממומש באתר או בחנות בקיסריה. בלי תאריך תפוגה.' ),
	);
}
function vgl_backup_posts() {
	$t = vgl_templates();
	return array_unique( array_merge( array_keys( $t['new'] ), $t['old'], array( VGL_HOME, VGL_HOME_NEW, VGL_CONTACT, VGL_CONTACT_NEW ), array_keys( vgl_seo() ) ) );
}

/* ---------------- helpers ---------------- */
function vgl_url( $id ) { return urldecode( get_permalink( $id ) ); }
function vgl_caesarea_url() {
	$p = get_page_by_path( 'איך-לבחור-משלוחי-פרחים-בקיסריה', OBJECT, 'post' );
	return $p ? vgl_url( $p->ID ) : home_url( '/#areas' );
}
function vgl_set_data( $id, $arr ) { update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( $arr ) ) ); }
function vgl_get_data( $id ) { return json_decode( (string) get_post_meta( $id, '_elementor_data', true ), true ); }
/* walk Elementor tree, $fn( &$el ) */
function vgl_walk( &$els, $fn ) {
	foreach ( $els as &$e ) {
		$fn( $e );
		if ( ! empty( $e['elements'] ) ) { vgl_walk( $e['elements'], $fn ); }
	}
	unset( $e );
}
/* Yoast reads titles/descriptions from its indexables table: rebuild the rows of the posts we touched */
function vgl_yoast_refresh() {
	if ( ! function_exists( 'YoastSEO' ) ) { return 'no yoast'; }
	$n = 0;
	try {
		$w = YoastSEO()->classes->get( \Yoast\WP\SEO\Integrations\Watchers\Indexable_Post_Watcher::class );
		foreach ( vgl_backup_posts() as $id ) { clean_post_cache( $id ); $w->build_indexable( $id ); $n++; }
	} catch ( Throwable $e ) { return 'yoast refresh error: ' . $e->getMessage(); }
	return 'yoast indexables rebuilt: ' . $n;
}
function vgl_flush() {
	if ( class_exists( '\ElementorPro\Modules\ThemeBuilder\Module' ) ) {
		\ElementorPro\Modules\ThemeBuilder\Module::instance()->get_conditions_manager()->get_cache()->regenerate();
	}
	foreach ( array( VGL_HOME, VGL_CONTACT ) as $id ) {
		delete_post_meta( $id, '_elementor_element_cache' );
		delete_post_meta( $id, '_elementor_css' );
	}
	if ( class_exists( '\Elementor\Plugin' ) ) { \Elementor\Plugin::$instance->files_manager->clear_cache(); }
	if ( function_exists( 'rocket_clean_domain' ) ) { rocket_clean_domain(); }
	wp_cache_flush();
}

/* ---------------- backup ---------------- */
function vgl_take_backup() {
	$b = array( 'time' => current_time( 'mysql' ), 'options' => array(), 'posts' => array(), 'menu' => array() );
	foreach ( vgl_options() as $o ) {
		$v = get_option( $o, '__vgl_none__' );
		$b['options'][ $o ] = $v;
	}
	foreach ( vgl_backup_posts() as $id ) {
		$p = get_post( $id );
		if ( ! $p ) { continue; }
		$m = array();
		foreach ( vgl_meta_keys() as $k ) {
			$m[ $k ] = metadata_exists( 'post', $id, $k ) ? get_post_meta( $id, $k, true ) : '__vgl_none__';
		}
		$b['posts'][ $id ] = array( 'status' => $p->post_status, 'meta' => $m );
	}
	foreach ( (array) wp_get_nav_menu_items( VGL_MENU ) as $i ) {
		$b['menu'][ $i->ID ] = array( 'title' => $i->title, 'url' => $i->url, 'parent' => (int) $i->menu_item_parent, 'order' => (int) $i->menu_order );
	}
	$dir = WP_CONTENT_DIR . '/uploads/venus-backups';
	wp_mkdir_p( $dir );
	if ( ! file_exists( $dir . '/.htaccess' ) ) { file_put_contents( $dir . '/.htaccess', "Require all denied\nDeny from all\n" ); }
	$file = $dir . '/golive-' . gmdate( 'Ymd-His' ) . '.json';
	file_put_contents( $file, wp_json_encode( $b, JSON_UNESCAPED_UNICODE ) );
	$b['file'] = $file;
	update_option( 'venus_golive_backup', $b, false );
	return $b;
}

/* ---------------- apply ---------------- */
function vgl_apply( $force = false ) {
	if ( get_option( 'venus_golive_on' ) && ! $force ) { return 'already live (pass true to force)'; }
	$log = array();
	$b = vgl_take_backup();
	$log[] = 'backup ' . basename( $b['file'] ) . ' (' . count( $b['posts'] ) . ' posts, ' . count( $b['menu'] ) . ' menu items)';

	/* 1. templates: publish new, move conditions (old ones stay published) */
	$t = vgl_templates();
	foreach ( $t['new'] as $id => $c ) {
		if ( 'publish' !== get_post_status( $id ) ) { wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) ); }
		update_post_meta( $id, '_elementor_conditions', $c );
	}
	foreach ( $t['old'] as $id ) { delete_post_meta( $id, '_elementor_conditions' ); }
	$log[] = 'conditions moved';

	/* 2. feature switches */
	foreach ( array( 'venus_header_live', 'venus_ct_live', 'venus_pa_live', 'venus_bl_live', 'venus_gc_live' ) as $o ) { update_option( $o, 1 ); }
	update_option( 'venus_live_pages', vgl_live_pages() );
	$log[] = 'switches on';

	$caes = vgl_caesarea_url();
	$mag  = vgl_url( 2440 );

	/* 3. homepage: new content into page 231 (same URL, same Yoast title) */
	$new = vgl_get_data( VGL_HOME_NEW );
	$new = array_values( array_filter( $new, function ( $e ) { return ! in_array( $e['id'], array( 'vnshtpl', 'vnsfoottpl' ), true ); } ) );
	vgl_walk( $new, function ( &$e ) use ( $caes, $mag ) {
		if ( 'vnsbud' === $e['id'] ) { $e['settings']['_element_id'] = 'budget'; }
		if ( 'vartall' === $e['id'] ) { $e['settings']['link']['url'] = $mag; }
		if ( 'vas0' === $e['id'] ) { $e['settings']['link']['url'] = $caes; }
	} );
	vgl_set_data( VGL_HOME, $new );
	$ps = (array) get_post_meta( VGL_HOME_NEW, '_elementor_page_settings', true );
	$ps['hide_title'] = 'yes';
	update_post_meta( VGL_HOME, '_elementor_page_settings', wp_slash( $ps ) );
	update_post_meta( VGL_HOME, '_wp_page_template', 'elementor_header_footer' );
	update_post_meta( VGL_HOME, '_elementor_edit_mode', 'builder' );
	foreach ( array( '_elementor_page_assets', '_elementor_version', '_elementor_pro_version' ) as $k ) {
		update_post_meta( VGL_HOME, $k, wp_slash( get_post_meta( VGL_HOME_NEW, $k, true ) ) );
	}
	$log[] = 'homepage content -> 231';

	/* 4. contact: new content into /צור-קשר/ (357), FAQ gets id "faq"; /contact-new/ out of the sitemap */
	$c = vgl_get_data( VGL_CONTACT_NEW );
	if ( isset( $c[0]['elements'][3] ) ) { $c[0]['elements'][3]['settings']['_element_id'] = 'faq'; }
	vgl_set_data( VGL_CONTACT, $c );
	$cps = (array) get_post_meta( VGL_CONTACT_NEW, '_elementor_page_settings', true );
	$cps['hide_title'] = 'yes';
	update_post_meta( VGL_CONTACT, '_elementor_page_settings', wp_slash( $cps ) );
	update_post_meta( VGL_CONTACT, '_wp_page_template', get_post_meta( VGL_CONTACT_NEW, '_wp_page_template', true ) );
	update_post_meta( VGL_CONTACT, '_elementor_edit_mode', 'builder' );
	foreach ( array( '_elementor_page_assets', '_elementor_version', '_elementor_pro_version' ) as $k ) {
		update_post_meta( VGL_CONTACT, $k, wp_slash( get_post_meta( VGL_CONTACT_NEW, $k, true ) ) );
	}
	update_post_meta( VGL_CONTACT_NEW, '_yoast_wpseo_meta-robots-noindex', '1' );
	$log[] = 'contact content -> 357';

	/* 5. footer links */
	$terms = home_url( '/2025/03/27/' . rawurlencode( 'תקנון-אתר' ) . '/' );
	$terms = urldecode( $terms );
	$contact = vgl_url( VGL_CONTACT );
	$map = array(
		'vfcl07' => vgl_url( 2425 ),
		'vfcl10' => vgl_url( 2458 ),
		'vfcl11' => vgl_url( 2471 ),
		'vfcl12' => vgl_url( 2473 ),
		'vfcl13' => vgl_url( 2466 ),
		'vfcl14' => home_url( '/#budget' ),
		'vfcl20' => $caes,
		'vfcl30' => vgl_url( 2450 ),
		'vfcl31' => $mag,
		'vfcl33' => $contact . '#faq',
		'vfcl34' => $contact,
		'vfleg1' => $terms,
		'vfleg2' => $terms,
	);
	$f = vgl_get_data( VGL_FOOTER );
	vgl_walk( $f, function ( &$e ) use ( $map ) {
		if ( ! empty( $e['settings']['icon_list'] ) ) {
			foreach ( $e['settings']['icon_list'] as &$it ) {
				if ( isset( $it['_id'], $map[ $it['_id'] ] ) ) { $it['link']['url'] = $map[ $it['_id'] ]; }
			}
			unset( $it );
		}
		if ( isset( $e['settings']['title'] ) && false !== strpos( $e['settings']['title'], 'TZD' ) ) {
			$e['settings']['title'] = str_replace( 'href="#"', 'href="http://tzd-seo.org.il/" target="_blank" rel="noopener"', $e['settings']['title'] );
		}
	} );
	vgl_set_data( VGL_FOOTER, $f );
	delete_post_meta( VGL_FOOTER, '_elementor_element_cache' );
	$log[] = 'footer links';

	/* 6. header menu #51 */
	$set = function ( $id, $url, $title = null ) {
		$args = array( 'ID' => $id );
		update_post_meta( $id, '_menu_item_url', esc_url_raw( $url ) );
		if ( null !== $title ) { wp_update_post( array( 'ID' => $id, 'post_title' => $title ) ); }
	};
	$set( 2201, vgl_url( 2425 ) );
	$set( 2208, $caes );
	$set( 2217, $mag );
	$set( 2218, vgl_url( 2450 ) );
	$set( 2197, home_url( '/product-category/' . rawurlencode( 'נרות' ) . '/' ), 'נרות' );
	/* two categories that are in the old menu only: insert after "נרות" (order 5) */
	$items = wp_get_nav_menu_items( VGL_MENU );
	foreach ( $items as $i ) {
		if ( (int) $i->menu_order > 5 ) { wp_update_post( array( 'ID' => $i->ID, 'menu_order' => (int) $i->menu_order + 2 ) ); }
	}
	$created = array();
	foreach ( array( array( 'ואזות וכלים', 'ואזות-וכלים', 6 ), array( 'מארזים', 'מארזים', 7 ) ) as $n ) {
		$created[] = wp_update_nav_menu_item( VGL_MENU, 0, array(
			'menu-item-title'     => $n[0],
			'menu-item-url'       => home_url( '/product-category/' . rawurlencode( $n[1] ) . '/' ),
			'menu-item-parent-id' => 2194,
			'menu-item-position'  => $n[2],
			'menu-item-type'      => 'custom',
			'menu-item-status'    => 'publish',
		) );
	}
	update_option( 'venus_golive_menu_created', $created, false );
	$log[] = 'menu updated, new items ' . implode( ',', $created ) . ' / caesarea=' . $caes;

	/* 7. Yoast titles / descriptions (only where empty) */
	foreach ( vgl_seo() as $id => $v ) {
		if ( $v[0] && ! get_post_meta( $id, '_yoast_wpseo_title', true ) ) { update_post_meta( $id, '_yoast_wpseo_title', $v[0] ); }
		if ( $v[1] && ! get_post_meta( $id, '_yoast_wpseo_metadesc', true ) ) { update_post_meta( $id, '_yoast_wpseo_metadesc', $v[1] ); }
	}
	$log[] = 'yoast meta';

	update_option( 'venus_golive_on', current_time( 'mysql' ) );
	$log[] = vgl_yoast_refresh();
	vgl_flush();
	$log[] = 'caches cleared';
	return $log;
}

/* ---------------- revert (restores everything from the backup) ---------------- */
function vgl_revert() {
	$b = get_option( 'venus_golive_backup' );
	if ( ! $b ) { return 'no backup'; }
	foreach ( $b['options'] as $o => $v ) {
		if ( '__vgl_none__' === $v ) { delete_option( $o ); } else { update_option( $o, $v ); }
	}
	foreach ( $b['posts'] as $id => $p ) {
		if ( get_post_status( $id ) !== $p['status'] ) { wp_update_post( array( 'ID' => $id, 'post_status' => $p['status'] ) ); }
		foreach ( $p['meta'] as $k => $v ) {
			if ( '__vgl_none__' === $v ) { delete_post_meta( $id, $k ); continue; }
			update_post_meta( $id, $k, wp_slash( $v ) );
		}
	}
	foreach ( (array) get_option( 'venus_golive_menu_created', array() ) as $mid ) {
		if ( $mid && ! is_wp_error( $mid ) ) { wp_delete_post( (int) $mid, true ); } /* only the 2 items vgl_apply() added */
	}
	foreach ( $b['menu'] as $id => $m ) {
		wp_update_post( array( 'ID' => $id, 'post_title' => $m['title'], 'menu_order' => $m['order'] ) );
		update_post_meta( $id, '_menu_item_url', $m['url'] );
	}
	delete_option( 'venus_golive_on' );
	delete_option( 'venus_golive_menu_created' );
	delete_post_meta( VGL_FOOTER, '_elementor_element_cache' );
	$y = vgl_yoast_refresh();
	vgl_flush();
	return 'reverted from ' . $b['time'] . ' / ' . $y;
}
