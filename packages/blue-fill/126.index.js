(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [126],
    {
        /***/ 565: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(566);

            module.exports = parent;

            /***/
        },

        /***/ 567: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(546);
            var path = __webpack_require__(116);

            module.exports = path.Reflect.defineProperty;

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 546: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var DESCRIPTORS = __webpack_require__(34);
            var anObject = __webpack_require__(75);
            var toPropertyKey = __webpack_require__(46);
            var definePropertyModule = __webpack_require__(73);
            var fails = __webpack_require__(35);

            // MS Edge has broken Reflect.defineProperty - throwing instead of returning false
            var ERROR_INSTEAD_OF_FALSE = fails(function () {
                // eslint-disable-next-line es/no-reflect -- required for testing
                Reflect.defineProperty(definePropertyModule.f({}, 1, { value: 1 }), 1, { value: 2 });
            });

            // `Reflect.defineProperty` method
            // https://tc39.es/ecma262/#sec-reflect.defineproperty
            $(
                { target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS },
                {
                    defineProperty: function defineProperty(target, propertyKey, attributes) {
                        anObject(target);
                        var key = toPropertyKey(propertyKey);
                        anObject(attributes);
                        try {
                            definePropertyModule.f(target, key, attributes);
                            return true;
                        } catch (error) {
                            return false;
                        }
                    },
                }
            );

            /***/
        },

        /***/ 566: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(567);

            module.exports = parent;

            /***/
        },
    },
]);
