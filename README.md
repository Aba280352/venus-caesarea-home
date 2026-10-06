# Venus Caesarea – homepage build

Static homepage for ונוס קיסריה, converted from a Claude Design export and prepared for WordPress + Elementor.

- `index.html` – full page for local preview
- `sections/` – one HTML block per section (Elementor HTML widget / Theme Builder header + footer)
- `venus.css` – generated from the design (do not edit by hand)
- `venus-overrides.css` – wrappers, tablet and mobile adaptations
- `venus.js` – interactions, vanilla JS
- `_build/` – converter (`build.mjs`), store snapshot (`site-data.json`), image fetcher, preview server

```bash
node _build/serve.mjs                         # preview on http://localhost:4321
node _build/build.mjs <extracted-design-dir>  # regenerate css + sections
node _build/fetch-images.mjs                  # download store photos to assets/shop/
```

All CSS is scoped under `.vns`. Content (products, prices, contact details) is a read-only snapshot of the live store.
