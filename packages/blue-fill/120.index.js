(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[120],{

/***/ 381:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(382);

module.exports = parent;


/***/ }),

/***/ 383:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(384);
var path = __webpack_require__(116);

module.exports = path.Number.isInteger;


/***/ }),

/***/ 385:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(48);

var floor = Math.floor;

// `IsIntegralNumber` abstract operation
// https://tc39.es/ecma262/#sec-isintegralnumber
// eslint-disable-next-line es/no-number-isinteger -- safe
module.exports = Number.isInteger || function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 384:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var isIntegralNumber = __webpack_require__(385);

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$({ target: 'Number', stat: true }, {
  isInteger: isIntegralNumber
});


/***/ }),

/***/ 382:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(383);

module.exports = parent;


/***/ })

}]);