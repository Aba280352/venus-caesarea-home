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

## Recommended products (step 3b)
- Same page #2252 after the categories: container `vnsrec` (class `vrec`, custom CSS) = Heading (h2) + native **Nested Tabs** widget (6 tabs; each tab = a container holding a **Loop Grid** + a Button CTA "לכל <קטגוריה>").
- Product card = Loop Item template **#2265** `vns-product-card` (`loop-item-2265.css`): one linked container (`html_tag a`, link = post URL) with an image box (featured image + product-gallery first image shown on hover via Basic Gallery widget with the Product Gallery dynamic tag) and name / price headings (price = custom field `_price` + before "₪"). "הוספה לעגלה" is a decorative heading styled as a button, exactly like the GitHub build (whole card goes to the product page). The template is reusable for the bestsellers / add-ons carousels.
- Each Loop Grid uses *Manual Selection* (product IDs) with `post_query_orderby = post__in` so the order follows the design. This value is not in the editor dropdown: do not touch "Order by" in the editor or the order is lost.
- Mobile: 2 columns, only 8 cards (CSS `nth-child(n+10)`), tabs row scrolls horizontally (drag with mouse = `initRecTabs` in `header.js`). Tablet: 3 columns.
- Roll-text hover on the card button and CTA = `initRoll` in `header.js` (wraps text in `.vns-rt`).

## Bestsellers carousel (step 4)
- Same page #2252 after the recommended section: container `vnspcar` (class `vpcar-sec`) = Heading h2 + container `vnspcarwrap` (class `vpcar-wrap`: 2 arrow Buttons + ONE Loop Grid `vpcar` that reuses the product-card template #2265, manual product IDs, `post_query_orderby = post__in`).
- The Loop Grid container is turned into a one-row flex track by CSS; `initPcar` in `header.js` runs the same marquee as the categories (30 px/s, drag, arrow kick +/-380; arrows hidden on mobile; card 58vw on mobile).
- CSS is in `hero-page-2252.css` (custom CSS of `vnspcar`).
