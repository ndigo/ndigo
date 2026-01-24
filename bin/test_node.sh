#!/bin/bash
rm -rf ./coverage 2> /dev/null
../../node_modules/.bin/cross-env TS_NODE_COMPILER_OPTIONS='{ "module": "commonjs" }' ../../node_modules/.bin/nyc ../../node_modules/.bin/mocha
