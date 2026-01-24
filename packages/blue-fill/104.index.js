(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[104],{

/***/ 343:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(344);

module.exports = parent;


/***/ }),

/***/ 345:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(346);
var path = __webpack_require__(116);

module.exports = path.Math.log1p;


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

/***/ 346:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var log1p = __webpack_require__(307);

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$({ target: 'Math', stat: true }, { log1p: log1p });


/***/ }),

/***/ 344:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(345);

module.exports = parent;


/***/ })

}]);