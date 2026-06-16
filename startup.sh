#!/usr/bin/env bash
set -euo pipefail

URL="https://huggingface.co/datasets/openfoodfacts/product-database/resolve/main/food.parquet?download=true"
OUT_DIR="./data/food"
OUT_FILE="${OUT_DIR}/food.parquet"

mkdir -p "$OUT_DIR"

# prefer curl if available, fallback to wget
if command -v curl >/dev/null 2>&1; then
  curl -fSL "$URL" -o "$OUT_FILE"
else
  wget -qO "$OUT_FILE" "$URL"
fi

echo "Downloaded: $OUT_FILE"
