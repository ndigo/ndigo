#!/bin/bash
rm -rf ./lib 2> /dev/null
../../node_modules/.bin/tsc --build tsconfig.build.json --force