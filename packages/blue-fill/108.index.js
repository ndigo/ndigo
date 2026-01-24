(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [108],
    {
        /***/ 330: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(331);

            module.exports = parent;

            /***/
        },

        /***/ 332: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(333);
            var path = __webpack_require__(116);

            module.exports = path.Math.fround;

            /***/
        },

        /***/ 334: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var sign = __webpack_require__(320);

            var abs = Math.abs;
            var pow = Math.pow;
            var EPSILON = pow(2, -52);
            var EPSILON32 = pow(2, -23);
            var MAX32 = pow(2, 127) * (2 - EPSILON32);
            var MIN32 = pow(2, -126);

            var roundTiesToEven = function (n) {
                return n + 1 / EPSILON - 1 / EPSILON;
            };

            // `Math.fround` method implementation
            // https://tc39.es/ecma262/#sec-math.fround
            // eslint-disable-next-line es/no-math-fround -- safe
            module.exports =
                Math.fround ||
                function fround(x) {
                    var n = +x;
                    var $abs = abs(n);
                    var $sign = sign(n);
                    var a, result;
                    if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
                    a = (1 + EPSILON32 / EPSILON) * $abs;
                    result = a - (a - $abs);
                    // eslint-disable-next-line no-self-compare -- NaN check
                    if (result > MAX32 || result != result) return $sign * Infinity;
                    return $sign * result;
                };

            /***/
        },

        /***/ 320: /***/ (module) => {
            // `Math.sign` method implementation
            // https://tc39.es/ecma262/#sec-math.sign
            // eslint-disable-next-line es/no-math-sign -- safe
            module.exports =
                Math.sign ||
                function sign(x) {
                    var n = +x;
                    // eslint-disable-next-line no-self-compare -- NaN check
                    return n == 0 || n != n ? n : n < 0 ? -1 : 1;
                };

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 333: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var fround = __webpack_require__(334);

            // `Math.fround` method
            // https://tc39.es/ecma262/#sec-math.fround
            $({ target: 'Math', stat: true }, { fround: fround });

            /***/
        },

        /***/ 331: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(332);

            module.exports = parent;

            /***/
        },
    },
]);
