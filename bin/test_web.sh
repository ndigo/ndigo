#!/bin/sh
rm -rf ./coverage 2> /dev/null
../../node_modules/.bin/karma start ../../karma.conf.js $1