#!/bin/bash
rm -rf ./docs 2> /dev/null
../../bin/build_lib.sh
wait
#../../node_modules/.bin/typedoc --readme ./README.md --target ES5 --out ./docs ./src
#../../node_modules/.bin/esdoc2 -c ../../.esdoc.json
node --max_old_space_size=12288 ../../node_modules/.bin/jsdoc ./lib -r -c ../../.jsdoc.json -d ./docs -R README.md