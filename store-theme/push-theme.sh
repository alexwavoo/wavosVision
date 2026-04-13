#!/usr/bin/env bash
# Push this folder to Shopify as a NEW unpublished theme (safe — does not overwrite live).
# Option A — interactive (your Mac Terminal, not Cursor agent):
#   cd store-theme && shopify auth login && shopify theme push --unpublished --store YOURSTORE.myshopify.com
#
# Option B — Theme Access password (works non-interactively):
#   cp .env.push.example .env.push && edit .env.push
#   source .env.push && shopify theme push --unpublished --json --store "$SHOPIFY_FLAG_STORE" --password "$SHOPIFY_CLI_THEME_TOKEN"

set -euo pipefail
cd "$(dirname "$0")"

if [[ -f .env.push ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env.push
  set +a
fi

if [[ -n "${SHOPIFY_CLI_THEME_TOKEN:-}" && -n "${SHOPIFY_FLAG_STORE:-}" ]]; then
  exec shopify theme push --unpublished --json --store "$SHOPIFY_FLAG_STORE" --password "$SHOPIFY_CLI_THEME_TOKEN"
fi

echo "No credentials in .env.push. Run this in Terminal.app (interactive login):"
echo ""
echo "  cd $(pwd)"
echo "  shopify auth login"
echo "  shopify theme push --unpublished --store YOURSTORE.myshopify.com"
echo ""
echo "Replace YOURSTORE with your shop handle from admin (e.g. wavos-vision.myshopify.com)."
echo "Do not use the public storefront domain alone — use the .myshopify.com admin domain."
exit 1
