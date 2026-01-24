(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [102],
    {
        /***/ 589: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(590);

            module.exports = parent;

            /***/
        },

        /***/ 591: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(555);
            var path = __webpack_require__(116);

            module.exports = path.Reflect.preventExtensions;

            /***/
        },

        /***/ 277: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var fails = __webpack_require__(35);

            module.exports = !fails(function () {
                // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
                return Object.isExtensible(Object.preventExtensions({}));
            });

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 555: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var getBuiltIn = __webpack_require__(52);
            var anObject = __webpack_require__(75);
            var FREEZING = __webpack_require__(277);

            // `Reflect.preventExtensions` method
            // https://tc39.es/ecma262/#sec-reflect.preventextensions
            $(
                { target: 'Reflect', stat: true, sham: !FREEZING },
                {
                    preventExtensions: function preventExtensions(target) {
                        anObject(target);
                        try {
                            var objectPreventExtensions = getBuiltIn('Object', 'preventExtensions');
                            if (objectPreventExtensions) objectPreventExtensions(target);
                            return true;
                        } catch (error) {
                            return false;
                        }
                    },
                }
            );

            /***/
        },

        /***/ 590: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(591);

            module.exports = parent;

            /***/
        },
    },
]);
