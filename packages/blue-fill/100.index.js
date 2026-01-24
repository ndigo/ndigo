(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[100],{

/***/ 452:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(453);

module.exports = parent;


/***/ }),

/***/ 454:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(455);
var path = __webpack_require__(116);

module.exports = path.Object.isFrozen;


/***/ }),

/***/ 276:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails = __webpack_require__(35);

module.exports = fails(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 455:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var fails = __webpack_require__(35);
var isObject = __webpack_require__(48);
var classof = __webpack_require__(43);
var ARRAY_BUFFER_NON_EXTENSIBLE = __webpack_require__(276);

// eslint-disable-next-line es/no-object-isfrozen -- safe
var $isFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES = fails(function () { $isFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE }, {
  isFrozen: function isFrozen(it) {
    if (!isObject(it)) return true;
    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) == 'ArrayBuffer') return true;
    return $isFrozen ? $isFrozen(it) : false;
  }
});


/***/ }),

/***/ 453:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(454);

module.exports = parent;


/***/ })

}]);