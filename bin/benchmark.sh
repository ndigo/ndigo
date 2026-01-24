#!/bin/bash
../../bin/build_bundle.sh
wait
echo ========================================================================
node "./benchmark/$1.js"
