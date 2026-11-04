<?php
/**
 * Plugin Name: Venus Reviews
 * Description: ביקורות גוגל של ונוס קיסריה: סוג תוכן "ביקורות גוגל", שורטקוד [venus_reviews] שמציג את גלריית הכיפה, ותשתית לסנכרון יומי אוטומטי מ-Google Business Profile API (יחובר כשתתקבל גישה).
 * Version: 1.0.1
 * Author: Venus Caesarea
 * Text Domain: venus-reviews
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('VNSREV_VER', '1.0.1');
define('VNSREV_URL', plugin_dir_url(__FILE__));
define('VNSREV_CRON', 'venus_reviews_sync');

/* ------------------------------------------------------------------ *
 * Post type: one post = one review.
 *   title        = reviewer name
 *   content      = review text (empty = rating only)
 *   post_date    = review date (shown as "לפני ..." on the site)
 *   menu_order   = display order (lower first)
 *   status       = publish (shown) / draft (hidden)
 *   meta         = _vnsrev_rating (1-5), _vnsrev_source (google|manual), _vnsrev_gid (Google review id)
 * ------------------------------------------------------------------ */
add_action('init', function () {
    register_post_type('vns_review', [
        'labels' => [
            'name'          => 'ביקורות גוגל',
            'singular_name' => 'ביקורת',
            'menu_name'     => 'ביקורות גוגל',
            'add_new'       => 'הוספת ביקורת',
            'add_new_item'  => 'הוספת ביקורת',
            'edit_item'     => 'עריכת ביקורת',
            'all_items'     => 'כל הביקורות',
            'search_items'  => 'חיפוש ביקורות',
            'not_found'     => 'אין ביקורות',
        ],
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => false,
        'exclude_from_search' => true,
        'menu_position'       => 26,
        'menu_icon'           => 'dashicons-star-filled',
        'supports'            => ['title', 'editor', 'page-attributes'],
    ]);
});

add_filter('enter_title_here', function ($t, $post) {
    return $post->post_type === 'vns_review' ? 'שם הכותב/ת' : $t;
}, 10, 2);

/* ---------- Meta box: rating + source ---------- */
add_action('add_meta_boxes', function () {
    add_meta_box('vnsrev_meta', 'פרטי הביקורת', 'vnsrev_meta_box', 'vns_review', 'side', 'high');
});

function vnsrev_meta_box($post) {
    wp_nonce_field('vnsrev_save', 'vnsrev_nonce');
    $rating = (int) get_post_meta($post->ID, '_vnsrev_rating', true) ?: 5;
    $source = get_post_meta($post->ID, '_vnsrev_source', true) ?: 'manual';
    $gid    = get_post_meta($post->ID, '_vnsrev_gid', true);
    echo '<p><label for="vnsrev_rating"><strong>דירוג</strong></label><br><select name="vnsrev_rating" id="vnsrev_rating">';
    for ($i = 5; $i >= 1; $i--) {
        printf('<option value="%1$d"%2$s>%3$s (%1$d)</option>', $i, selected($rating, $i, false), str_repeat('★', $i));
    }
    echo '</select></p>';
    echo '<p><strong>מקור:</strong> ' . ($source === 'google' ? 'Google' : 'הוזן ידנית') . '</p>';
    if ($gid) echo '<p style="word-break:break-all;color:#666;font-size:11px">Google ID: ' . esc_html($gid) . '</p>';
    echo '<p style="color:#666">תאריך הביקורת = תאריך הפרסום (בתיבת "פרסום"). כדי להסתיר ביקורת מהאתר: להעביר לטיוטה.</p>';
}

add_action('save_post_vns_review', function ($id) {
    if (!isset($_POST['vnsrev_nonce']) || !wp_verify_nonce($_POST['vnsrev_nonce'], 'vnsrev_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $id)) return;
    $r = isset($_POST['vnsrev_rating']) ? max(1, min(5, (int) $_POST['vnsrev_rating'])) : 5;
    update_post_meta($id, '_vnsrev_rating', $r);
    if (!get_post_meta($id, '_vnsrev_source', true)) update_post_meta($id, '_vnsrev_source', 'manual');
});

/* ---------- Admin list columns ---------- */
add_filter('manage_vns_review_posts_columns', function ($c) {
    $new = [];
    foreach ($c as $k => $v) {
        $new[$k] = $v;
        if ($k === 'title') {
            $new['vnsrev_rating'] = 'דירוג';
            $new['vnsrev_text']   = 'ביקורת';
            $new['vnsrev_source'] = 'מקור';
            $new['menu_order']    = 'סדר';
        }
    }
    return $new;
});

add_action('manage_vns_review_posts_custom_column', function ($col, $id) {
    if ($col === 'vnsrev_rating') echo esc_html(str_repeat('★', (int) get_post_meta($id, '_vnsrev_rating', true)));
    if ($col === 'vnsrev_text') {
        $t = trim(wp_strip_all_tags(get_post_field('post_content', $id)));
        echo $t === '' ? '<em style="color:#999">דירוג בלבד</em>' : esc_html(wp_trim_words($t, 14, '…'));
    }
    if ($col === 'vnsrev_source') echo get_post_meta($id, '_vnsrev_source', true) === 'google' ? 'Google' : 'ידני';
    if ($col === 'menu_order') echo (int) get_post_field('menu_order', $id);
}, 10, 2);

add_action('pre_get_posts', function ($q) {
    if (is_admin() && $q->is_main_query() && $q->get('post_type') === 'vns_review' && !$q->get('orderby')) {
        $q->set('orderby', ['menu_order' => 'ASC', 'date' => 'DESC']);
    }
});

/* ---------- "לפני ..." in Hebrew, like Google ---------- */
function vnsrev_when($ts) {
    $d = (current_time('timestamp') - $ts) / DAY_IN_SECONDS;
    if ($d < 1)  return 'היום';
    if ($d < 2)  return 'אתמול';
    if ($d < 7)  return 'לפני ' . floor($d) . ' ימים';
    if ($d < 14) return 'לפני שבוע';
    if ($d < 21) return 'לפני שבועיים';
    if ($d < 30) return 'לפני 3 שבועות';
    $m = floor($d / 30.4);
    if ($m < 2)  return 'לפני חודש';
    if ($m < 3)  return 'לפני חודשיים';
    if ($m < 12) return 'לפני ' . $m . ' חודשים';
    $y = floor($d / 365);
    if ($y < 2)  return 'לפני שנה';
    if ($y < 3)  return 'לפני שנתיים';
    return 'לפני ' . $y . ' שנים';
}

/* ---------- Data for the gallery ---------- */
function vnsrev_items($min_rating = 4, $text_only = true, $limit = 0) {
    $posts = get_posts([
        'post_type'        => 'vns_review',
        'post_status'      => 'publish',
        'numberposts'      => -1,
        'orderby'          => ['menu_order' => 'ASC', 'date' => 'DESC'],
        'suppress_filters' => false,
    ]);
    $palette = ['#3A4831', '#5A6B4D', '#2C3424', '#6E7D60', '#49573D'];
    $out = [];
    foreach ($posts as $p) {
        $rating = (int) get_post_meta($p->ID, '_vnsrev_rating', true) ?: 5;
        if ($rating < $min_rating) continue;
        $text = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($p->post_content)));
        if ($text_only && $text === '') continue;
        $name = trim($p->post_title);
        $out[] = [
            'name'    => $name,
            'when'    => vnsrev_when(strtotime($p->post_date)),
            'text'    => $text,
            'stars'   => str_repeat('★', $rating),
            'initial' => mb_strtoupper(mb_substr($name, 0, 1)),
            'color'   => $palette[count($out) % count($palette)],
        ];
        if ($limit && count($out) >= $limit) break;
    }
    return $out;
}

/* ---------- Assets ---------- */
add_action('wp_enqueue_scripts', function () {
    wp_register_style('venus-reviews', VNSREV_URL . 'assets/reviews.css', [], VNSREV_VER);
    wp_register_script('venus-reviews', VNSREV_URL . 'assets/reviews.js', [], VNSREV_VER, true);
});

/* ---------- Shortcode [venus_reviews min_rating="4" text_only="1" limit="0"] ---------- */
add_shortcode('venus_reviews', function ($atts) {
    $a = shortcode_atts([
        'min_rating' => 4,
        'text_only'  => 1,
        'limit'      => 0,
        'logo'       => VNSREV_URL . 'assets/google.png',
        'label'      => 'ביקורות גוגל. גוררים לכל כיוון או משתמשים בחיצים. Enter פותח את הביקורת שבמרכז, Esc סוגר.',
    ], $atts, 'venus_reviews');

    $items = vnsrev_items((int) $a['min_rating'], (bool) (int) $a['text_only'], (int) $a['limit']);
    if (!$items) return '';

    if (!wp_style_is('venus-reviews', 'registered')) {
        wp_register_style('venus-reviews', VNSREV_URL . 'assets/reviews.css', [], VNSREV_VER);
        wp_register_script('venus-reviews', VNSREV_URL . 'assets/reviews.js', [], VNSREV_VER, true);
    }
    wp_enqueue_script('venus-reviews');

    ob_start();
    if (!wp_style_is('venus-reviews', 'done')) wp_print_styles('venus-reviews'); // print the CSS right here so the box has its size before the footer loads
    $json = wp_json_encode($items, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
    printf(
        '<div class="vrev"><div class="dg-root" data-logo="%s" aria-label="%s"></div><script type="application/json" class="dg-data">%s</script></div>',
        esc_url($a['logo']),
        esc_attr($a['label']),
        $json
    );
    return ob_get_clean();
});

/* ------------------------------------------------------------------ *
 * Google sync (ready, not connected yet)
 *
 * A daily cron calls the filter 'venus_reviews_fetch'. Until the Google
 * Business Profile API connection is added, nothing hooks it, so the sync
 * does nothing. When it returns an array of reviews:
 *   [ ['gid'=>..., 'name'=>..., 'text'=>..., 'rating'=>5, 'date'=>'Y-m-d H:i:s'], ... ]
 * each one is added or updated with venus_reviews_upsert().
 * ------------------------------------------------------------------ */
function venus_reviews_upsert(array $r) {
    $gid  = isset($r['gid']) ? (string) $r['gid'] : '';
    $name = trim((string) ($r['name'] ?? ''));
    if ($name === '') return 0;

    $id = 0;
    if ($gid !== '') {
        $found = get_posts(['post_type' => 'vns_review', 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids',
            'meta_key' => '_vnsrev_gid', 'meta_value' => $gid]);
        if ($found) $id = (int) $found[0];
    }
    if (!$id) { // a review imported by hand before the API was connected: match by name
        foreach (get_posts(['post_type' => 'vns_review', 'post_status' => 'any', 'numberposts' => -1, 'title' => $name]) as $p) {
            if (!get_post_meta($p->ID, '_vnsrev_gid', true)) { $id = $p->ID; break; }
        }
    }

    $post = [
        'post_type'    => 'vns_review',
        'post_title'   => $name,
        'post_content' => (string) ($r['text'] ?? ''),
    ];
    if ($id) {
        $post['ID'] = $id; // keep status (hidden stays hidden), order and date
        wp_update_post($post);
    } else {
        $post['post_status'] = 'publish';
        $post['menu_order']  = isset($r['menu_order']) ? (int) $r['menu_order'] : 0; // new reviews first
        if (!empty($r['date'])) { $post['post_date'] = $r['date']; $post['post_date_gmt'] = get_gmt_from_date($r['date']); }
        $id = wp_insert_post($post);
        if (!$id || is_wp_error($id)) return 0;
    }
    update_post_meta($id, '_vnsrev_rating', max(1, min(5, (int) ($r['rating'] ?? 5))));
    update_post_meta($id, '_vnsrev_source', $r['source'] ?? 'google');
    if ($gid !== '') update_post_meta($id, '_vnsrev_gid', $gid);
    return $id;
}

function venus_reviews_run_sync() {
    $items = apply_filters('venus_reviews_fetch', null);
    if (!is_array($items)) {
        update_option('vnsrev_last_sync', ['time' => time(), 'msg' => 'לא בוצע: החיבור ל-Google עוד לא הוגדר'], false);
        return 0;
    }
    $n = 0;
    foreach ($items as $r) if (venus_reviews_upsert((array) $r)) $n++;
    update_option('vnsrev_last_sync', ['time' => time(), 'msg' => 'עודכנו ' . $n . ' ביקורות'], false);
    return $n;
}
add_action(VNSREV_CRON, 'venus_reviews_run_sync');

register_activation_hook(__FILE__, function () {
    if (!wp_next_scheduled(VNSREV_CRON)) wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', VNSREV_CRON);
});
register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook(VNSREV_CRON);
});

/* ---------- Admin page: Google sync status ---------- */
add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=vns_review', 'סנכרון Google', 'סנכרון Google', 'manage_options', 'vnsrev-sync', 'vnsrev_sync_page');
});

add_action('admin_post_vnsrev_sync_now', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('vnsrev_sync_now')) wp_die('אין הרשאה');
    venus_reviews_run_sync();
    wp_safe_redirect(admin_url('edit.php?post_type=vns_review&page=vnsrev-sync&done=1'));
    exit;
});

function vnsrev_sync_page() {
    $connected = has_filter('venus_reviews_fetch');
    $last      = get_option('vnsrev_last_sync');
    $count     = wp_count_posts('vns_review');
    $next      = wp_next_scheduled(VNSREV_CRON);
    echo '<div class="wrap"><h1>סנכרון ביקורות Google</h1>';
    echo '<p>ביקורות באתר: <strong>' . (int) $count->publish . '</strong> מוצגות, ' . (int) $count->draft . ' מוסתרות.</p>';
    echo '<p>חיבור ל-Google Business Profile API: ' . ($connected ? '<strong style="color:green">מחובר</strong>' : '<strong style="color:#b32d2e">עוד לא הוגדר</strong>. עד אז מוסיפים ביקורות ידנית ב"הוספת ביקורת".') . '</p>';
    echo '<p>סנכרון אוטומטי: פעם ביום' . ($next ? ' (הבא: ' . esc_html(wp_date('d/m/Y H:i', $next)) . ')' : '') . '.</p>';
    if ($last) echo '<p>סנכרון אחרון: ' . esc_html(wp_date('d/m/Y H:i', $last['time'])) . ' – ' . esc_html($last['msg']) . '</p>';
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="vnsrev_sync_now">';
    wp_nonce_field('vnsrev_sync_now');
    submit_button('סנכרן עכשיו', 'secondary', 'submit', false, $connected ? [] : ['disabled' => 'disabled']);
    echo '</form>';
    echo '<p style="color:#666;margin-top:24px">באתר: השורטקוד <code>[venus_reviews]</code> מציג את הגלריה. ברירת מחדל: רק ביקורות עם טקסט ו-4 כוכבים ומעלה. סדר התצוגה לפי השדה "סדר" (מספר נמוך קודם).</p>';
    echo '</div>';
}
