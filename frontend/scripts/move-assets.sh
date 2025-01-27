#!/bin/bash

# Create public directory structure
mkdir -p public/images

# Move static assets from src to public
cp -r src/static/images/* public/images/

# Find and replace image paths in source files (.jsx and .js)
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' \
  -e 's|src\/static\/images|\/images|g' \
  -e 's|from '\''\.\.\/static\/images|from '\''/images|g' \
  -e 's|from '\''\.\/static\/images|from '\''/images|g' \
  -e 's|import.*from.*\/static\/images\/\([^'"'"']*\)'"'"'|import '\''/images/\1'\''|g' {} +

# Also handle import statements specifically
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' \
  -e 's|import \([a-zA-Z0-9]*\) from.*\/static\/images\/\([^'"'"']*\)'"'"'|import \1 from '\''/images/\2'\''|g' {} +

echo "Static assets moved and references updated"