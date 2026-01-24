(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [117],
    {
        /***/ 352: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(353);

            module.exports = parent;

            /***/
        },

        /***/ 354: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(355);
            var path = __webpack_require__(116);

            module.exports = path.Math.log2;

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 355: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);

            var log = Math.log;
            var LN2 = Math.LN2;

            // `Math.log2` method
            // https://tc39.es/ecma262/#sec-math.log2
            $(
                { target: 'Math', stat: true },
                {
                    log2: function log2(x) {
                        return log(x) / LN2;
                    },
                }
            );

            /***/
        },

        /***/ 353: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(354);

            module.exports = parent;

            /***/
        },
    },
]);
