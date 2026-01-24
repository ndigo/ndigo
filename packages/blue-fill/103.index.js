(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[103],{

/***/ 303:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(304);

module.exports = parent;


/***/ }),

/***/ 305:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(306);
var path = __webpack_require__(116);

module.exports = path.Math.acosh;


/***/ }),

/***/ 307:
/***/ ((module) => {

var log = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
module.exports = Math.log1p || function log1p(x) {
  var n = +x;
  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log(1 + n);
};


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 306:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var log1p = __webpack_require__(307);

// eslint-disable-next-line es/no-math-acosh -- required for testing
var $acosh = Math.acosh;
var log = Math.log;
var sqrt = Math.sqrt;
var LN2 = Math.LN2;

var FORCED = !$acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor($acosh(Number.MAX_VALUE)) != 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || $acosh(Infinity) != Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$({ target: 'Math', stat: true, forced: FORCED }, {
  acosh: function acosh(x) {
    var n = +x;
    return n < 1 ? NaN : n > 94906265.62425156
      ? log(n) + LN2
      : log1p(n - 1 + sqrt(n - 1) * sqrt(n + 1));
  }
});


/***/ }),

/***/ 304:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(305);

module.exports = parent;


/***/ })

}]);