# Store theme (WAVO'S VISION)

Dawn-based Shopify theme styled to match the portfolio (`#111111` background, `#fdf8dc` text, Roboto, frosted header).

If you **already have a live theme** with edits, run `shopify theme pull` into a folder and **copy over** the files touched in this repo (`assets/wavos-brand.css`, `layout/theme.liquid` stylesheet line + `theme-color`, `config/settings_data.json` color schemes and fonts, `sections/header.liquid` schema, `sections/header-group.json`, `snippets/header-*.liquid`), or push this theme as a **new** theme in Admin and reconfigure.

## Deploy to your store

**Important:** Use your **`.myshopify.com`** admin domain with the CLI (e.g. `wavos-vision.myshopify.com`), not only `store.wavos.vision`. Find it under **Shopify admin → Settings → Domains** (primary Shopify domain).

### Preview while editing (interactive terminal)

```bash
cd store-theme
shopify auth login
shopify theme dev --store YOURSTORE.myshopify.com
```

Open the preview URL the CLI prints.

### Push this code to Shopify (so you can see it in Admin)

In **Terminal.app** or an interactive Cursor terminal (after `shopify auth login`):

```bash
cd store-theme
shopify theme push --unpublished --store YOURSTORE.myshopify.com
```

That creates a **new unpublished theme** with these files. In **Admin → Online Store → Themes**, open **⋯** on that theme → **Preview** or **Publish** when ready.

### Non-interactive push (Theme Access password)

1. Install [Theme Access](https://shopify.dev/docs/storefronts/themes/tools/theme-access) (or use a token from your store).
2. `cp .env.push.example .env.push` and fill `SHOPIFY_FLAG_STORE` + `SHOPIFY_CLI_THEME_TOKEN`.
3. `./push-theme.sh`

> Cursor’s agent cannot complete `shopify auth login` (browser OAuth). Run login + push on your machine.

## Logo

`assets/wavos-stars-logo.png` is a copy of the portfolio star mark. In **Theme settings → Logo**, upload that file or choose it if Shopify lists theme assets.

## Portfolio link

**Header → Portfolio** settings control the **FEATURED WORK** link back to the main site (`https://wavos.vision` by default in `header-group.json`).
