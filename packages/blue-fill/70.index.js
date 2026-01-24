(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [70],
    {
        /***/ 176: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(177);

            module.exports = parent;

            /***/
        },

        /***/ 178: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(179);
            var entryUnbind = __webpack_require__(144);

            module.exports = entryUnbind('Array', 'reduce');

            /***/
        },

        /***/ 143: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var fails = __webpack_require__(35);

            module.exports = function (METHOD_NAME, argument) {
                var method = [][METHOD_NAME];
                return (
                    !!method &&
                    fails(function () {
                        // eslint-disable-next-line no-useless-call -- required for testing
                        method.call(
                            null,
                            argument ||
                                function () {
                                    return 1;
                                },
                            1
                        );
                    })
                );
            };

            /***/
        },

        /***/ 180: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var aCallable = __webpack_require__(59);
            var toObject = __webpack_require__(68);
            var IndexedObject = __webpack_require__(41);
            var lengthOfArrayLike = __webpack_require__(92);

            var $TypeError = TypeError;

            // `Array.prototype.{ reduce, reduceRight }` methods implementation
            var createMethod = function (IS_RIGHT) {
                return function (that, callbackfn, argumentsLength, memo) {
                    aCallable(callbackfn);
                    var O = toObject(that);
                    var self = IndexedObject(O);
                    var length = lengthOfArrayLike(O);
                    var index = IS_RIGHT ? length - 1 : 0;
                    var i = IS_RIGHT ? -1 : 1;
                    if (argumentsLength < 2)
                        while (true) {
                            if (index in self) {
                                memo = self[index];
                                index += i;
                                break;
                            }
                            index += i;
                            if (IS_RIGHT ? index < 0 : length <= index) {
                                throw $TypeError('Reduce of empty array with no initial value');
                            }
                        }
                    for (; IS_RIGHT ? index >= 0 : length > index; index += i)
                        if (index in self) {
                            memo = callbackfn(memo, self[index], index, O);
                        }
                    return memo;
                };
            };

            module.exports = {
                // `Array.prototype.reduce` method
                // https://tc39.es/ecma262/#sec-array.prototype.reduce
                left: createMethod(false),
                // `Array.prototype.reduceRight` method
                // https://tc39.es/ecma262/#sec-array.prototype.reduceright
                right: createMethod(true),
            };

            /***/
        },

        /***/ 113: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var classof = __webpack_require__(43);
            var global = __webpack_require__(32);

            module.exports = classof(global.process) == 'process';

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

        /***/ 179: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var $reduce = __webpack_require__(180).left;
            var arrayMethodIsStrict = __webpack_require__(143);
            var CHROME_VERSION = __webpack_require__(56);
            var IS_NODE = __webpack_require__(113);

            var STRICT_METHOD = arrayMethodIsStrict('reduce');
            // Chrome 80-82 has a critical bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
            var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;

            // `Array.prototype.reduce` method
            // https://tc39.es/ecma262/#sec-array.prototype.reduce
            $(
                { target: 'Array', proto: true, forced: !STRICT_METHOD || CHROME_BUG },
                {
                    reduce: function reduce(callbackfn /* , initialValue */) {
                        var length = arguments.length;
                        return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
                    },
                }
            );

            /***/
        },

        /***/ 177: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(178);

            module.exports = parent;

            /***/
        },
    },
]);
