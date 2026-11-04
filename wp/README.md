# WordPress / Elementor build of the header

Reference copies (read-only snapshots) of what was pushed to venus-caesarea.net. The source of truth is Elementor.

- `header-template-2186.css` - compiled CSS of Elementor Theme Builder template #2186 "header" (DRAFT, no display conditions). The card/menu/cart/search rules live in the custom CSS of container `vnshdr`; the strip rules in `venus-trust`.
- `header.js` - Elementor Custom Code snippet #2189 (body end, all pages): strip marquee loop, search popover (adds `post_type=product`), sticky compact header.
- Preview page: https://venus-caesarea.net/venus-strip-preview/ (published, noindex + nofollow via Yoast).

Widgets (all native Elementor / Elementor Pro): Button (phone), Image (logo), Search, Icon List (account / wishlist), Menu Cart (mini-cart), Nav Menu (menu #51 `vns-main`).
Global colours/typography are in Elementor Site Settings (kit #7): `vns*`.

Revert: delete template #2186, snippet #2189, page #2192, menu #51, media #2221-#2227. Live header (#291) is untouched.
