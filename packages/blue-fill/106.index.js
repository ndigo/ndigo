(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[106],{

/***/ 312:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(313);

module.exports = parent;


/***/ }),

/***/ 314:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(315);
var path = __webpack_require__(116);

module.exports = path.Math.atanh;


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 315:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;
var log = Math.log;

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$({ target: 'Math', stat: true, forced: !($atanh && 1 / $atanh(-0) < 0) }, {
  atanh: function atanh(x) {
    var n = +x;
    return n == 0 ? n : log((1 + n) / (1 - n)) / 2;
  }
});


/***/ }),

/***/ 313:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(314);

module.exports = parent;


/***/ })

}]);