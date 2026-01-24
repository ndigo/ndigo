(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [164],
    {
        /***/ 372: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(373);

            module.exports = parent;

            /***/
        },

        /***/ 374: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(375);

            module.exports = Math.pow(2, -52);

            /***/
        },

        /***/ 375: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);

            // `Number.EPSILON` constant
            // https://tc39.es/ecma262/#sec-number.epsilon
            $(
                { target: 'Number', stat: true, nonConfigurable: true, nonWritable: true },
                {
                    EPSILON: Math.pow(2, -52),
                }
            );

            /***/
        },

        /***/ 373: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(374);

            module.exports = parent;

            /***/
        },
    },
]);
