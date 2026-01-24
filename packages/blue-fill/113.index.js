(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[113],{

/***/ 364:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(365);

module.exports = parent;


/***/ }),

/***/ 366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(367);
var path = __webpack_require__(116);

module.exports = path.Math.tanh;


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

/***/ 367:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var expm1 = __webpack_require__(329);

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var n = +x;
    var a = expm1(n);
    var b = expm1(-n);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
  }
});


/***/ }),

/***/ 365:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(366);

module.exports = parent;


/***/ })

}]);