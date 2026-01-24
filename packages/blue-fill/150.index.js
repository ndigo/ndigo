(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[150],{

/***/ 416:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(417);

module.exports = parent;


/***/ }),

/***/ 418:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(419);
var entryUnbind = __webpack_require__(144);

module.exports = entryUnbind('Number', 'toPrecision');


/***/ }),

/***/ 144:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(32);
var uncurryThis = __webpack_require__(42);

module.exports = function (CONSTRUCTOR, METHOD) {
  return uncurryThis(global[CONSTRUCTOR].prototype[METHOD]);
};


/***/ }),

/***/ 414:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var uncurryThis = __webpack_require__(42);

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
module.exports = uncurryThis(1.0.valueOf);


/***/ }),

/***/ 419:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(31);
var uncurryThis = __webpack_require__(42);
var fails = __webpack_require__(35);
var thisNumberValue = __webpack_require__(414);

var nativeToPrecision = uncurryThis(1.0.toPrecision);

var FORCED = fails(function () {
  // IE7-
  return nativeToPrecision(1, undefined) !== '1';
}) || !fails(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$({ target: 'Number', proto: true, forced: FORCED }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision(thisNumberValue(this))
      : nativeToPrecision(thisNumberValue(this), precision);
  }
});


/***/ }),

/***/ 417:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var parent = __webpack_require__(418);

module.exports = parent;


/***/ })

}]);