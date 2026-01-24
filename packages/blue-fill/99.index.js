(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [99],
    {
        /***/ 583: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(584);

            module.exports = parent;

            /***/
        },

        /***/ 585: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(553);
            var path = __webpack_require__(116);

            module.exports = path.Reflect.isExtensible;

            /***/
        },

        /***/ 276: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            // FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
            var fails = __webpack_require__(35);

            module.exports = fails(function () {
                if (typeof ArrayBuffer == 'function') {
                    var buffer = new ArrayBuffer(8);
                    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
                    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
                }
            });

            /***/
        },

        /***/ 275: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var fails = __webpack_require__(35);
            var isObject = __webpack_require__(48);
            var classof = __webpack_require__(43);
            var ARRAY_BUFFER_NON_EXTENSIBLE = __webpack_require__(276);

            // eslint-disable-next-line es/no-object-isextensible -- safe
            var $isExtensible = Object.isExtensible;
            var FAILS_ON_PRIMITIVES = fails(function () {
                $isExtensible(1);
            });

            // `Object.isExtensible` method
            // https://tc39.es/ecma262/#sec-object.isextensible
            module.exports =
                FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE
                    ? function isExtensible(it) {
                          if (!isObject(it)) return false;
                          if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) == 'ArrayBuffer') return false;
                          return $isExtensible ? $isExtensible(it) : true;
                      }
                    : $isExtensible;

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 553: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var anObject = __webpack_require__(75);
            var $isExtensible = __webpack_require__(275);

            // `Reflect.isExtensible` method
            // https://tc39.es/ecma262/#sec-reflect.isextensible
            $(
                { target: 'Reflect', stat: true },
                {
                    isExtensible: function isExtensible(target) {
                        anObject(target);
                        return $isExtensible(target);
                    },
                }
            );

            /***/
        },

        /***/ 584: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(585);

            module.exports = parent;

            /***/
        },
    },
]);
