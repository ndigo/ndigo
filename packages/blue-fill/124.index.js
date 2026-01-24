(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [124],
    {
        /***/ 477: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(478);

            module.exports = parent;

            /***/
        },

        /***/ 479: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(480);
            var path = __webpack_require__(116);

            module.exports = path.Object.is;

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 481: /***/ (module) => {
            // `SameValue` abstract operation
            // https://tc39.es/ecma262/#sec-samevalue
            // eslint-disable-next-line es/no-object-is -- safe
            module.exports =
                Object.is ||
                function is(x, y) {
                    // eslint-disable-next-line no-self-compare -- NaN check
                    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
                };

            /***/
        },

        /***/ 480: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var is = __webpack_require__(481);

            // `Object.is` method
            // https://tc39.es/ecma262/#sec-object.is
            $(
                { target: 'Object', stat: true },
                {
                    is: is,
                }
            );

            /***/
        },

        /***/ 478: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(479);

            module.exports = parent;

            /***/
        },
    },
]);
