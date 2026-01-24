#!/bin/bash
../../bin/build_bundle.sh
wait
echo ========================================================================
node --allow-natives-syntax --trace_opt --trace_deopt "./profile/$1.js"
