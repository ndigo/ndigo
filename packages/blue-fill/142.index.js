(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [142],
    {
        /***/ 410: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(411);

            module.exports = parent;

            /***/
        },

        /***/ 412: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(413);
            var entryUnbind = __webpack_require__(144);

            module.exports = entryUnbind('Number', 'toFixed');

            /***/
        },

        /***/ 141: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var TO_STRING_TAG_SUPPORT = __webpack_require__(142);
            var isCallable = __webpack_require__(49);
            var classofRaw = __webpack_require__(43);
            var wellKnownSymbol = __webpack_require__(62);

            var TO_STRING_TAG = wellKnownSymbol('toStringTag');
            var $Object = Object;

            // ES3 wrong here
            var CORRECT_ARGUMENTS =
                classofRaw(
                    (function () {
                        return arguments;
                    })()
                ) == 'Arguments';

            // fallback for IE11 Script Access Denied error
            var tryGet = function (it, key) {
                try {
                    return it[key];
                } catch (error) {
                    /* empty */
                }
            };

            // getting tag from ES6+ `Object.prototype.toString`
            module.exports = TO_STRING_TAG_SUPPORT
                ? classofRaw
                : function (it) {
                      var O, tag, result;
                      return it === undefined
                          ? 'Undefined'
                          : it === null
                            ? 'Null'
                            : // @@toStringTag case
                              typeof (tag = tryGet((O = $Object(it)), TO_STRING_TAG)) == 'string'
                              ? tag
                              : // builtinTag case
                                CORRECT_ARGUMENTS
                                ? classofRaw(O)
                                : // ES3 arguments fallback
                                  (result = classofRaw(O)) == 'Object' && isCallable(O.callee)
                                  ? 'Arguments'
                                  : result;
                  };

            /***/
        },

        /***/ 144: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);
            var uncurryThis = __webpack_require__(42);

            module.exports = function (CONSTRUCTOR, METHOD) {
                return uncurryThis(global[CONSTRUCTOR].prototype[METHOD]);
            };

            /***/
        },

        /***/ 415: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var toIntegerOrInfinity = __webpack_require__(90);
            var toString = __webpack_require__(229);
            var requireObjectCoercible = __webpack_require__(44);

            var $RangeError = RangeError;

            // `String.prototype.repeat` method implementation
            // https://tc39.es/ecma262/#sec-string.prototype.repeat
            module.exports = function repeat(count) {
                var str = toString(requireObjectCoercible(this));
                var result = '';
                var n = toIntegerOrInfinity(count);
                if (n < 0 || n == Infinity) throw $RangeError('Wrong number of repetitions');
                for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
                return result;
            };

            /***/
        },

        /***/ 414: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var uncurryThis = __webpack_require__(42);

            // `thisNumberValue` abstract operation
            // https://tc39.es/ecma262/#sec-thisnumbervalue
            module.exports = uncurryThis((1.0).valueOf);

            /***/
        },

        /***/ 142: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var wellKnownSymbol = __webpack_require__(62);

            var TO_STRING_TAG = wellKnownSymbol('toStringTag');
            var test = {};

            test[TO_STRING_TAG] = 'z';

            module.exports = String(test) === '[object z]';

            /***/
        },

        /***/ 229: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var classof = __webpack_require__(141);

            var $String = String;

            module.exports = function (argument) {
                if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
                return $String(argument);
            };

            /***/
        },

        /***/ 413: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var uncurryThis = __webpack_require__(42);
            var toIntegerOrInfinity = __webpack_require__(90);
            var thisNumberValue = __webpack_require__(414);
            var $repeat = __webpack_require__(415);
            var fails = __webpack_require__(35);

            var $RangeError = RangeError;
            var $String = String;
            var floor = Math.floor;
            var repeat = uncurryThis($repeat);
            var stringSlice = uncurryThis(''.slice);
            var nativeToFixed = uncurryThis((1.0).toFixed);

            var pow = function (x, n, acc) {
                return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
            };

            var log = function (x) {
                var n = 0;
                var x2 = x;
                while (x2 >= 4096) {
                    n += 12;
                    x2 /= 4096;
                }
                while (x2 >= 2) {
                    n += 1;
                    x2 /= 2;
                }
                return n;
            };

            var multiply = function (data, n, c) {
                var index = -1;
                var c2 = c;
                while (++index < 6) {
                    c2 += n * data[index];
                    data[index] = c2 % 1e7;
                    c2 = floor(c2 / 1e7);
                }
            };

            var divide = function (data, n) {
                var index = 6;
                var c = 0;
                while (--index >= 0) {
                    c += data[index];
                    data[index] = floor(c / n);
                    c = (c % n) * 1e7;
                }
            };

            var dataToString = function (data) {
                var index = 6;
                var s = '';
                while (--index >= 0) {
                    if (s !== '' || index === 0 || data[index] !== 0) {
                        var t = $String(data[index]);
                        s = s === '' ? t : s + repeat('0', 7 - t.length) + t;
                    }
                }
                return s;
            };

            var FORCED =
                fails(function () {
                    return (
                        nativeToFixed(0.00008, 3) !== '0.000' ||
                        nativeToFixed(0.9, 0) !== '1' ||
                        nativeToFixed(1.255, 2) !== '1.25' ||
                        nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128'
                    );
                }) ||
                !fails(function () {
                    // V8 ~ Android 4.3-
                    nativeToFixed({});
                });

            // `Number.prototype.toFixed` method
            // https://tc39.es/ecma262/#sec-number.prototype.tofixed
            $(
                { target: 'Number', proto: true, forced: FORCED },
                {
                    toFixed: function toFixed(fractionDigits) {
                        var number = thisNumberValue(this);
                        var fractDigits = toIntegerOrInfinity(fractionDigits);
                        var data = [0, 0, 0, 0, 0, 0];
                        var sign = '';
                        var result = '0';
                        var e, z, j, k;

                        // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
                        if (fractDigits < 0 || fractDigits > 20) throw $RangeError('Incorrect fraction digits');
                        // eslint-disable-next-line no-self-compare -- NaN check
                        if (number != number) return 'NaN';
                        if (number <= -1e21 || number >= 1e21) return $String(number);
                        if (number < 0) {
                            sign = '-';
                            number = -number;
                        }
                        if (number > 1e-21) {
                            e = log(number * pow(2, 69, 1)) - 69;
                            z = e < 0 ? number * pow(2, -e, 1) : number / pow(2, e, 1);
                            z *= 0x10000000000000;
                            e = 52 - e;
                            if (e > 0) {
                                multiply(data, 0, z);
                                j = fractDigits;
                                while (j >= 7) {
                                    multiply(data, 1e7, 0);
                                    j -= 7;
                                }
                                multiply(data, pow(10, j, 1), 0);
                                j = e - 1;
                                while (j >= 23) {
                                    divide(data, 1 << 23);
                                    j -= 23;
                                }
                                divide(data, 1 << j);
                                multiply(data, 1, 1);
                                divide(data, 2);
                                result = dataToString(data);
                            } else {
                                multiply(data, 0, z);
                                multiply(data, 1 << -e, 0);
                                result = dataToString(data) + repeat('0', fractDigits);
                            }
                        }
                        if (fractDigits > 0) {
                            k = result.length;
                            result =
                                sign +
                                (k <= fractDigits
                                    ? '0.' + repeat('0', fractDigits - k) + result
                                    : stringSlice(result, 0, k - fractDigits) +
                                      '.' +
                                      stringSlice(result, k - fractDigits));
                        } else {
                            result = sign + result;
                        }
                        return result;
                    },
                }
            );

            /***/
        },

        /***/ 411: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(412);

            module.exports = parent;

            /***/
        },
    },
]);
