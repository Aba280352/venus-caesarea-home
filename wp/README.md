# WordPress / Elementor build of the header

Reference copies (read-only snapshots) of what was pushed to venus-caesarea.net. The source of truth is Elementor.

- `header-template-2186.css` - compiled CSS of Elementor Theme Builder template #2186 "header" (DRAFT, no display conditions). The card/menu/cart/search rules live in the custom CSS of container `vnshdr`; the strip rules in `venus-trust`.
- `header.js` - Elementor Custom Code snippet #2189 (body end, all pages): strip marquee loop, search popover (adds `post_type=product`), sticky compact header.
- Preview page: https://venus-caesarea.net/venus-strip-preview/ (published, noindex + nofollow via Yoast).

Widgets (all native Elementor / Elementor Pro): Button (phone), Image (logo), Search, Icon List (account / wishlist), Menu Cart (mini-cart), Nav Menu (menu #51 `vns-main`).
Global colours/typography are in Elementor Site Settings (kit #7): `vns*`.

Revert: delete template #2186, snippet #2189, page #2192, menu #51, media #2221-#2227. Live header (#291) is untouched.

## Hero (step 2)
- Preview page #2252 https://venus-caesarea.net/venus-home-preview/ (published, noindex + nofollow, Canvas, cream bg): header template via Shortcode widget + container `vnshero` (class `vhero`, custom CSS) holding ONE Elementor Pro Slides widget (7 slides, fade 1.4s, autoplay 7s, pause on hover, dots = numbered rail via CSS counters).
- `hero-page-2252.css` - compiled CSS of that page. Images: media #2245-#2251 (1672x941 JPEG).
- Class `vhero` on the container is what the sticky-header script uses to decide when the header sticks.

## Categories (step 3)
- Same page #2252, after the hero: outer container `vnscats` (class `vcats-wrap`, holds two Button widgets = the arrows, media #2261/#2262) + inner container `vnscatsrow` (class `vcats`) with 8 native Image Box widgets (circle image + title, linked to the category). All CSS lives in the custom CSS of these two containers; it is compiled into `hero-page-2252.css`.
- Marquee loop / drag / arrow kick = `initCats` in `header.js` (snippet #2189). It wraps the cards in `.vcats-track` at runtime and clones them for the seamless loop.
- Images are existing product photos (#1797, 846, 862, 901, 1894, 1780, 2067, 1522) until real category images exist.
- Note: Elementor's Image Box adds `width:30%` on the image per widget, so the circle size rule needs `!important`.
