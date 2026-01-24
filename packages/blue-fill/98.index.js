(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [98],
    {
        /***/ 448: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(449);

            module.exports = parent;

            /***/
        },

        /***/ 450: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(451);
            var path = __webpack_require__(116);

            module.exports = path.Object.isExtensible;

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

        /***/ 451: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var $isExtensible = __webpack_require__(275);

            // `Object.isExtensible` method
            // https://tc39.es/ecma262/#sec-object.isextensible
            // eslint-disable-next-line es/no-object-isextensible -- safe
            $(
                { target: 'Object', stat: true, forced: Object.isExtensible !== $isExtensible },
                {
                    isExtensible: $isExtensible,
                }
            );

            /***/
        },

        /***/ 449: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(450);

            module.exports = parent;

            /***/
        },
    },
]);
