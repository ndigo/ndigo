#!/bin/bash
rm ./*index.js 2> /dev/null &
rm ./*index.js.map 2> /dev/null &
rm ./*index.js.LICENSE 2> /dev/null &
wait
../../node_modules/.bin/webpack