#!/bin/bash
rm ./*index.js 2> /dev/null &
rm ./*index.cjs 2> /dev/null &
rm ./*index.js.map 2> /dev/null &
rm ./*index.cjs.map 2> /dev/null &
rm ./*index.js.LICENSE 2> /dev/null &
wait

# Use Vite for bundling
if [ -f "vite.config.ts" ]; then
    ../../node_modules/.bin/vite build
else
    echo "No vite.config.ts found, skipping bundle build"
fi