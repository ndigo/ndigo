(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[112],{

/***/ 360:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(361);

module.exports = parent;


/***/ }),

/***/ 362:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(363);
var path = __webpack_require__(116);

module.exports = path.Math.sinh;


/***/ }),

/***/ 329:
/***/ ((module) => {

// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  var n = +x;
  return n == 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp(n) - 1;
} : $expm1;


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 363:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var fails = __webpack_require__(35);
var expm1 = __webpack_require__(329);

var abs = Math.abs;
var exp = Math.exp;
var E = Math.E;

var FORCED = fails(function () {
  // eslint-disable-next-line es/no-math-sinh -- required for testing
  return Math.sinh(-2e-17) != -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$({ target: 'Math', stat: true, forced: FORCED }, {
  sinh: function sinh(x) {
    var n = +x;
    return abs(n) < 1 ? (expm1(n) - expm1(-n)) / 2 : (exp(n - 1) - exp(-n - 1)) * (E / 2);
  }
});


/***/ }),

/***/ 361:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(362);

module.exports = parent;


/***/ })

}]);