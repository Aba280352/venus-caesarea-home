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

## Add-ons carousel (step 5)
- Same page #2252 after the bestsellers: container `vnsadd` = exact clone of `vnspcar` (same classes, so `initPcar` and the CSS apply), heading "כי אם כבר מפנקים אז עד הסוף", product IDs 2037, 2150, 2033, 2146, 1442, 2144, 2035, 2138.
- Several products used by the GitHub build (1519, 1521, 1523, 930, 931, 932) are in the WordPress TRASH, so replacements were chosen from the live catalogue: recommended tab 6 = 1442, 2037, 2084, 2033, 1440, 2106, 2046, 2043.

## Bridal carousel (step 6)
- Same page #2252 after the add-ons: container `vnsbrd` = clone of `vnspcar` (ids vnsbrdt/w/l/r/g), heading "כל מה שצריך לחתונה", products 1347, 1456, 1786, 1783, 1343, 820, 821, 1461 (all published).

## About section (step 7)
- Same page #2252 after the bridal carousel: container `vnsabt` (class `vabt`, custom CSS) = Heading h2 "אודותינו" + Text Editor (4 paragraphs, bold brand names) in a copy column + Image (media #2279, sideloaded from the GitHub Pages build `vns-about.jpg`).
- Scroll effect = `initAbout` in `header.js` (snippet #2189): the text is split into per-character spans that light up from opacity .2 to 1 as the section scrolls through the viewport (start 0.8H, end 0.2H), and the image is revealed with a `clip-path` wipe. `prefers-reduced-motion` shows everything immediately.
- Gotchas: the Text Editor widget inherits Roboto from the kit, so the body font var is set explicitly on `.vabt-text`; Elementor zeroes the last paragraph's margin, so `p:last-child{margin-bottom:1em}` is restored. Whitespace splitting in JS uses a `trim()` helper (`splitWs`) instead of a `\s` regex, because backslashes get eaten when code is pushed through the MCP JSON parameter.
- Mobile / tablet: image first (500px tall on tablet, 300px on mobile), text below. Geometry (section, title, paragraphs, image) matches the GitHub build at 340-1440.

## Google reviews (step 8) - plugin "Venus Reviews"
- Source: `wp/venus-reviews/` (installed in `wp-content/plugins/venus-reviews/`, active). Seed data: `reviews-seed.json` (the 35 Google reviews as of 2026-11-05: 27 with text, 8 rating only).
- WP admin > **ביקורות גוגל**: one post per review. Title = name, content = text (empty = rating only), publish date = review date (shown as "לפני ..."), "סדר" = display order (lower first), draft = hidden. Rating in the side box.
- Shortcode `[venus_reviews]` prints the dome gallery (`assets/reviews.js` = `initReviews` from `venus.js`, `assets/reviews.css` = the `.dg-*` styles). Defaults: only reviews with text and 4+ stars. Attributes: `min_rating`, `text_only`, `limit`.
- Page #2252 after the About section: container `vnsrev` (class `vrev-sec`) = Heading "מה מספרים עלינו" + Text Editor subtitle (Google logo = media #2318) + Shortcode widget + Heading (p) hint pill.
- Google sync: a daily WP-Cron (`venus_reviews_sync`) runs the filter `venus_reviews_fetch`. Nothing hooks it yet, so it does nothing. When Google Business Profile API access is ready, add a function on that filter that returns `[['gid','name','text','rating','date'], ...]`; `venus_reviews_upsert()` adds new reviews (order 0 = first) and updates existing ones (matched by Google id, or by name for the hand-imported ones). Status page: ביקורות גוגל > סנכרון Google.
- Updating the plugin on the server: files are pulled from raw.githubusercontent.com at a specific commit SHA (avoids CDN cache), linted with `php -l`, then swapped in.
- 1.0.2 (mobile fixes, differs from the GitHub build on purpose): an open review on mobile = short card on top + text box sized to its content (long text scrolls inside the box, a scroll does not close it); touch drag on the cards turns the dome vertically too (`touch-action:none` on `.dg-field`, the page scrolls from outside the gallery).
- 1.0.3: mobile gallery height min(56svh,460px) (min 360px) and cards 56% of the stage width (was 76vh / 62%), so there is always page area around it to scroll with the finger.
- 1.0.4: mobile gallery height min(64svh,560px) (min 420px); a tap/click anywhere outside the gallery closes an open review (page scroll or swipe does not).

## Shop by budget (step 10)
- Same page #2252 after the reviews: container `vnsbud` (class `vbud-sec`, custom CSS) = Heading h2 "קנייה לפי תקציב" + container `vnsbuds` (class `vbud-stage`) with 6 card containers `vbc0-5` (each: Image + Heading title "עד ₪100" ... + Heading CTA "לצפייה במוצרים", the whole card links to `/shop/?max_price=...`) + nav container `vnsbudn` with 2 Buttons (prev / next, arrow SVG media #2320/#2321).
- Slider = `initBudget` in `header.js` (snippet #2189): centered current card (54vw, 76vw on mobile) with side cards, order/width/margins/visibility computed in JS (port of the GitHub build), drag + fling, side-card click, arrows, keyboard left/right, `ResizeObserver`, reduced-motion aware. Title + CTA show only on the current card; CTA text rolls on hover (`initRoll` selector `.vbud-cta .elementor-heading-title`).
- Known: product photos #909 and #775 only exist at 300x300 (also in the GitHub build) so the first two cards look soft at desktop width; replace with larger photos when available.

## Carousel arrows (step 10b)
- In the three product carousels (bestsellers `vnspcar`, add-ons `vnsadd`, bridal `vnsbrd`) the two arrow Buttons moved out of `vpcar-wrap` into a new container `vnspcarn` / `vnsaddn` / `vnsbrdn` (class `vpcar-nav`) BELOW the carousel, centered, white circle style like the hero (44px on mobile). Equal vertical spacing between the carousels (section gap 8vw / 64px on mobile).

## Delivery areas (step 11)
- Same page #2252 after the budget section: container `vnsare` (class `vare`, id `areas`, custom CSS) = green rounded panel with a side column (`vare-side`: Heading h2, counter Heading `01 / 08`, nav container with 2 Buttons, media #2320/#2321) + a view container `vare-view` (74%, fade mask on desktop) holding the track `vare-track` with 8 slide containers `vas0-7` (each a link container: Image + tag Heading "אזור 0N" + title Heading h3 + text Heading p). Images = featured photos of products 1541, 1215, 1217, 1214, 1314, 1282, 821, 1786 (attachments 1896, 1204, 1990, 1208, 1311, 1318, 817, 1784); links = the city blog posts (first one `#areas`).
- Carousel = `initAreas` in `header.js` (snippet #2189): infinite wrapped track with dimmed (35%) non-active slides, rolling digit counter, arrows, keyboard left/right, drag + fling with click guard, `ResizeObserver`, reduced-motion aware.
- Mobile / tablet (<=1024): column layout, heading above the counter + arrows row; slides 58vw (tablet) / 80vw (mobile).
- Known: 3 of the 8 photos (products 1215, 1214, 821) exist only as 300x300 on the live site, so they look soft on desktop; replace with larger photos later.
