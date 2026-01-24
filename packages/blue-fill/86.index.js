(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[86],{

/***/ 444:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(445);

module.exports = parent;


/***/ }),

/***/ 446:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(447);
var path = __webpack_require__(116);

module.exports = path.Object.getPrototypeOf;


/***/ }),

/***/ 204:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(35);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),

/***/ 203:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hasOwn = __webpack_require__(67);
var isCallable = __webpack_require__(49);
var toObject = __webpack_require__(68);
var sharedKey = __webpack_require__(82);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(204);

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);

module.exports = global;


/***/ }),

/***/ 447:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(31);
var fails = __webpack_require__(35);
var toObject = __webpack_require__(68);
var nativeGetPrototypeOf = __webpack_require__(203);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(204);

var FAILS_ON_PRIMITIVES = fails(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  }
});



/***/ }),

/***/ 445:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(446);

module.exports = parent;


/***/ })

}]);