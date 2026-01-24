(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [32],
    {
        /***/ 509: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isConstructor = __webpack_require__(140);
            var tryToString = __webpack_require__(60);

            var $TypeError = TypeError;

            // `Assert: IsConstructor(argument) is true`
            module.exports = function (argument) {
                if (isConstructor(argument)) return argument;
                throw $TypeError(tryToString(argument) + ' is not a constructor');
            };

            /***/
        },

        /***/ 279: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var isPrototypeOf = __webpack_require__(53);

            var $TypeError = TypeError;

            module.exports = function (it, Prototype) {
                if (isPrototypeOf(Prototype, it)) return it;
                throw $TypeError('Incorrect invocation');
            };

            /***/
        },

        /***/ 110: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var uncurryThis = __webpack_require__(42);

            module.exports = uncurryThis([].slice);

            /***/
        },

        /***/ 238: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var wellKnownSymbol = __webpack_require__(62);

            var ITERATOR = wellKnownSymbol('iterator');
            var SAFE_CLOSING = false;

            try {
                var called = 0;
                var iteratorWithReturn = {
                    next: function () {
                        return { done: !!called++ };
                    },
                    return: function () {
                        SAFE_CLOSING = true;
                    },
                };
                iteratorWithReturn[ITERATOR] = function () {
                    return this;
                };
                // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
                Array.from(iteratorWithReturn, function () {
                    throw 2;
                });
            } catch (error) {
                /* empty */
            }

            module.exports = function (exec, SKIP_CLOSING) {
                if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
                var ITERATION_SUPPORT = false;
                try {
                    var object = {};
                    object[ITERATOR] = function () {
                        return {
                            next: function () {
                                return { done: (ITERATION_SUPPORT = true) };
                            },
                        };
                    };
                    exec(object);
                } catch (error) {
                    /* empty */
                }
                return ITERATION_SUPPORT;
            };

            /***/
        },

        /***/ 515: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var IS_DENO = __webpack_require__(516);
            var IS_NODE = __webpack_require__(113);

            module.exports = !IS_DENO && !IS_NODE && typeof window == 'object' && typeof document == 'object';

            /***/
        },

        /***/ 516: /***/ (module) => {
            /* global Deno -- Deno case */
            module.exports = typeof Deno == 'object' && Deno && typeof Deno.version == 'object';

            /***/
        },

        /***/ 114: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var userAgent = __webpack_require__(57);
            var global = __webpack_require__(32);

            module.exports = /ipad|iphone|ipod/i.test(userAgent) && global.Pebble !== undefined;

            /***/
        },

        /***/ 112: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var userAgent = __webpack_require__(57);

            module.exports = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent);

            /***/
        },

        /***/ 113: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var classof = __webpack_require__(43);
            var global = __webpack_require__(32);

            module.exports = classof(global.process) == 'process';

            /***/
        },

        /***/ 115: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var userAgent = __webpack_require__(57);

            module.exports = /web0s(?!.*chrome)/i.test(userAgent);

            /***/
        },

        /***/ 108: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var NATIVE_BIND = __webpack_require__(37);

            var FunctionPrototype = Function.prototype;
            var apply = FunctionPrototype.apply;
            var call = FunctionPrototype.call;

            // eslint-disable-next-line es/no-reflect -- safe
            module.exports =
                (typeof Reflect == 'object' && Reflect.apply) ||
                (NATIVE_BIND
                    ? call.bind(apply)
                    : function () {
                          return call.apply(apply, arguments);
                      });

            /***/
        },

        /***/ 105: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var uncurryThis = __webpack_require__(106);
            var aCallable = __webpack_require__(59);
            var NATIVE_BIND = __webpack_require__(37);

            var bind = uncurryThis(uncurryThis.bind);

            // optional / simple context binding
            module.exports = function (fn, that) {
                aCallable(fn);
                return that === undefined
                    ? fn
                    : NATIVE_BIND
                      ? bind(fn, that)
                      : function (/* ...args */) {
                            return fn.apply(that, arguments);
                        };
            };

            /***/
        },

        /***/ 106: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var classofRaw = __webpack_require__(43);
            var uncurryThis = __webpack_require__(42);

            module.exports = function (fn) {
                // Nashorn bug:
                //   https://github.com/zloirock/core-js/issues/1128
                //   https://github.com/zloirock/core-js/issues/1130
                if (classofRaw(fn) === 'Function') return uncurryThis(fn);
            };

            /***/
        },

        /***/ 237: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var classof = __webpack_require__(141);
            var getMethod = __webpack_require__(58);
            var isNullOrUndefined = __webpack_require__(45);
            var Iterators = __webpack_require__(199);
            var wellKnownSymbol = __webpack_require__(62);

            var ITERATOR = wellKnownSymbol('iterator');

            module.exports = function (it) {
                if (!isNullOrUndefined(it))
                    return getMethod(it, ITERATOR) || getMethod(it, '@@iterator') || Iterators[classof(it)];
            };

            /***/
        },

        /***/ 236: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var call = __webpack_require__(36);
            var aCallable = __webpack_require__(59);
            var anObject = __webpack_require__(75);
            var tryToString = __webpack_require__(60);
            var getIteratorMethod = __webpack_require__(237);

            var $TypeError = TypeError;

            module.exports = function (argument, usingIterator) {
                var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
                if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
                throw $TypeError(tryToString(argument) + ' is not iterable');
            };

            /***/
        },

        /***/ 510: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = function (a, b) {
                var console = global.console;
                if (console && console.error) {
                    arguments.length == 1 ? console.error(a) : console.error(a, b);
                }
            };

            /***/
        },

        /***/ 234: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var wellKnownSymbol = __webpack_require__(62);
            var Iterators = __webpack_require__(199);

            var ITERATOR = wellKnownSymbol('iterator');
            var ArrayPrototype = Array.prototype;

            // check on default Array iterator
            module.exports = function (it) {
                return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
            };

            /***/
        },

        /***/ 140: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var uncurryThis = __webpack_require__(42);
            var fails = __webpack_require__(35);
            var isCallable = __webpack_require__(49);
            var classof = __webpack_require__(141);
            var getBuiltIn = __webpack_require__(52);
            var inspectSource = __webpack_require__(79);

            var noop = function () {
                /* empty */
            };
            var empty = [];
            var construct = getBuiltIn('Reflect', 'construct');
            var constructorRegExp = /^\s*(?:class|function)\b/;
            var exec = uncurryThis(constructorRegExp.exec);
            var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

            var isConstructorModern = function isConstructor(argument) {
                if (!isCallable(argument)) return false;
                try {
                    construct(noop, empty, argument);
                    return true;
                } catch (error) {
                    return false;
                }
            };

            var isConstructorLegacy = function isConstructor(argument) {
                if (!isCallable(argument)) return false;
                switch (classof(argument)) {
                    case 'AsyncFunction':
                    case 'GeneratorFunction':
                    case 'AsyncGeneratorFunction':
                        return false;
                }
                try {
                    // we can't check .prototype since constructors produced by .bind haven't it
                    // `Function#toString` throws on some built-it function in some legacy engines
                    // (for example, `DOMQuad` and similar in FF41-)
                    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
                } catch (error) {
                    return true;
                }
            };

            isConstructorLegacy.sham = true;

            // `IsConstructor` abstract operation
            // https://tc39.es/ecma262/#sec-isconstructor
            module.exports =
                !construct ||
                fails(function () {
                    var called;
                    return (
                        isConstructorModern(isConstructorModern.call) ||
                        !isConstructorModern(Object) ||
                        !isConstructorModern(function () {
                            called = true;
                        }) ||
                        called
                    );
                })
                    ? isConstructorLegacy
                    : isConstructorModern;

            /***/
        },

        /***/ 278: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var bind = __webpack_require__(105);
            var call = __webpack_require__(36);
            var anObject = __webpack_require__(75);
            var tryToString = __webpack_require__(60);
            var isArrayIteratorMethod = __webpack_require__(234);
            var lengthOfArrayLike = __webpack_require__(92);
            var isPrototypeOf = __webpack_require__(53);
            var getIterator = __webpack_require__(236);
            var getIteratorMethod = __webpack_require__(237);
            var iteratorClose = __webpack_require__(233);

            var $TypeError = TypeError;

            var Result = function (stopped, result) {
                this.stopped = stopped;
                this.result = result;
            };

            var ResultPrototype = Result.prototype;

            module.exports = function (iterable, unboundFunction, options) {
                var that = options && options.that;
                var AS_ENTRIES = !!(options && options.AS_ENTRIES);
                var IS_RECORD = !!(options && options.IS_RECORD);
                var IS_ITERATOR = !!(options && options.IS_ITERATOR);
                var INTERRUPTED = !!(options && options.INTERRUPTED);
                var fn = bind(unboundFunction, that);
                var iterator, iterFn, index, length, result, next, step;

                var stop = function (condition) {
                    if (iterator) iteratorClose(iterator, 'normal', condition);
                    return new Result(true, condition);
                };

                var callFn = function (value) {
                    if (AS_ENTRIES) {
                        anObject(value);
                        return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
                    }
                    return INTERRUPTED ? fn(value, stop) : fn(value);
                };

                if (IS_RECORD) {
                    iterator = iterable.iterator;
                } else if (IS_ITERATOR) {
                    iterator = iterable;
                } else {
                    iterFn = getIteratorMethod(iterable);
                    if (!iterFn) throw $TypeError(tryToString(iterable) + ' is not iterable');
                    // optimisation for array iterators
                    if (isArrayIteratorMethod(iterFn)) {
                        for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
                            result = callFn(iterable[index]);
                            if (result && isPrototypeOf(ResultPrototype, result)) return result;
                        }
                        return new Result(false);
                    }
                    iterator = getIterator(iterable, iterFn);
                }

                next = IS_RECORD ? iterable.next : iterator.next;
                while (!(step = call(next, iterator)).done) {
                    try {
                        result = callFn(step.value);
                    } catch (error) {
                        iteratorClose(iterator, 'throw', error);
                    }
                    if (typeof result == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
                }
                return new Result(false);
            };

            /***/
        },

        /***/ 233: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var call = __webpack_require__(36);
            var anObject = __webpack_require__(75);
            var getMethod = __webpack_require__(58);

            module.exports = function (iterator, kind, value) {
                var innerResult, innerError;
                anObject(iterator);
                try {
                    innerResult = getMethod(iterator, 'return');
                    if (!innerResult) {
                        if (kind === 'throw') throw value;
                        return value;
                    }
                    innerResult = call(innerResult, iterator);
                } catch (error) {
                    innerError = true;
                    innerResult = error;
                }
                if (kind === 'throw') throw value;
                if (innerError) throw innerResult;
                anObject(innerResult);
                return value;
            };

            /***/
        },

        /***/ 104: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);
            var bind = __webpack_require__(105);
            var getOwnPropertyDescriptor = __webpack_require__(33).f;
            var macrotask = __webpack_require__(107).set;
            var IS_IOS = __webpack_require__(112);
            var IS_IOS_PEBBLE = __webpack_require__(114);
            var IS_WEBOS_WEBKIT = __webpack_require__(115);
            var IS_NODE = __webpack_require__(113);

            var MutationObserver = global.MutationObserver || global.WebKitMutationObserver;
            var document = global.document;
            var process = global.process;
            var Promise = global.Promise;
            // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
            var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global, 'queueMicrotask');
            var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

            var flush, head, last, notify, toggle, node, promise, then;

            // modern engines have queueMicrotask method
            if (!queueMicrotask) {
                flush = function () {
                    var parent, fn;
                    if (IS_NODE && (parent = process.domain)) parent.exit();
                    while (head) {
                        fn = head.fn;
                        head = head.next;
                        try {
                            fn();
                        } catch (error) {
                            if (head) notify();
                            else last = undefined;
                            throw error;
                        }
                    }
                    last = undefined;
                    if (parent) parent.enter();
                };

                // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
                // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
                if (!IS_IOS && !IS_NODE && !IS_WEBOS_WEBKIT && MutationObserver && document) {
                    toggle = true;
                    node = document.createTextNode('');
                    new MutationObserver(flush).observe(node, { characterData: true });
                    notify = function () {
                        node.data = toggle = !toggle;
                    };
                    // environments with maybe non-completely correct, but existent Promise
                } else if (!IS_IOS_PEBBLE && Promise && Promise.resolve) {
                    // Promise.resolve without an argument throws an error in LG WebOS 2
                    promise = Promise.resolve(undefined);
                    // workaround of WebKit ~ iOS Safari 10.1 bug
                    promise.constructor = Promise;
                    then = bind(promise.then, promise);
                    notify = function () {
                        then(flush);
                    };
                    // Node.js without promises
                } else if (IS_NODE) {
                    notify = function () {
                        process.nextTick(flush);
                    };
                    // for other environments - macrotask based on:
                    // - setImmediate
                    // - MessageChannel
                    // - window.postMessage
                    // - onreadystatechange
                    // - setTimeout
                } else {
                    // strange IE + webpack dev server bug - use .bind(global)
                    macrotask = bind(macrotask, global);
                    notify = function () {
                        macrotask(flush);
                    };
                }
            }

            module.exports =
                queueMicrotask ||
                function (fn) {
                    var task = { fn: fn, next: undefined };
                    if (last) last.next = task;
                    if (!head) {
                        head = task;
                        notify();
                    }
                    last = task;
                };

            /***/
        },

        /***/ 517: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var aCallable = __webpack_require__(59);

            var $TypeError = TypeError;

            var PromiseCapability = function (C) {
                var resolve, reject;
                this.promise = new C(function ($$resolve, $$reject) {
                    if (resolve !== undefined || reject !== undefined) throw $TypeError('Bad Promise constructor');
                    resolve = $$resolve;
                    reject = $$reject;
                });
                this.resolve = aCallable(resolve);
                this.reject = aCallable(reject);
            };

            // `NewPromiseCapability` abstract operation
            // https://tc39.es/ecma262/#sec-newpromisecapability
            module.exports.f = function (C) {
                return new PromiseCapability(C);
            };

            /***/
        },

        /***/ 210: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var TO_STRING_TAG_SUPPORT = __webpack_require__(142);
            var classof = __webpack_require__(141);

            // `Object.prototype.toString` method implementation
            // https://tc39.es/ecma262/#sec-object.prototype.tostring
            module.exports = TO_STRING_TAG_SUPPORT
                ? {}.toString
                : function toString() {
                      return '[object ' + classof(this) + ']';
                  };

            /***/
        },

        /***/ 511: /***/ (module) => {
            module.exports = function (exec) {
                try {
                    return { error: false, value: exec() };
                } catch (error) {
                    return { error: true, value: error };
                }
            };

            /***/
        },

        /***/ 514: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);
            var NativePromiseConstructor = __webpack_require__(513);
            var isCallable = __webpack_require__(49);
            var isForced = __webpack_require__(96);
            var inspectSource = __webpack_require__(79);
            var wellKnownSymbol = __webpack_require__(62);
            var IS_BROWSER = __webpack_require__(515);
            var IS_DENO = __webpack_require__(516);
            var IS_PURE = __webpack_require__(64);
            var V8_VERSION = __webpack_require__(56);

            var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
            var SPECIES = wellKnownSymbol('species');
            var SUBCLASSING = false;
            var NATIVE_PROMISE_REJECTION_EVENT = isCallable(global.PromiseRejectionEvent);

            var FORCED_PROMISE_CONSTRUCTOR = isForced('Promise', function () {
                var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor);
                var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor);
                // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
                // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
                // We can't detect it synchronously, so just check versions
                if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
                // We need Promise#{ catch, finally } in the pure version for preventing prototype pollution
                if (IS_PURE && !(NativePromisePrototype['catch'] && NativePromisePrototype['finally'])) return true;
                // We can't use @@species feature detection in V8 since it causes
                // deoptimization and performance degradation
                // https://github.com/zloirock/core-js/issues/679
                if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
                    // Detect correctness of subclassing with @@species support
                    var promise = new NativePromiseConstructor(function (resolve) {
                        resolve(1);
                    });
                    var FakePromise = function (exec) {
                        exec(
                            function () {
                                /* empty */
                            },
                            function () {
                                /* empty */
                            }
                        );
                    };
                    var constructor = (promise.constructor = {});
                    constructor[SPECIES] = FakePromise;
                    SUBCLASSING =
                        promise.then(function () {
                            /* empty */
                        }) instanceof FakePromise;
                    if (!SUBCLASSING) return true;
                    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
                }
                return !GLOBAL_CORE_JS_PROMISE && (IS_BROWSER || IS_DENO) && !NATIVE_PROMISE_REJECTION_EVENT;
            });

            module.exports = {
                CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR,
                REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
                SUBCLASSING: SUBCLASSING,
            };

            /***/
        },

        /***/ 513: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global.Promise;

            /***/
        },

        /***/ 524: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var anObject = __webpack_require__(75);
            var isObject = __webpack_require__(48);
            var newPromiseCapability = __webpack_require__(517);

            module.exports = function (C, x) {
                anObject(C);
                if (isObject(x) && x.constructor === C) return x;
                var promiseCapability = newPromiseCapability.f(C);
                var resolve = promiseCapability.resolve;
                resolve(x);
                return promiseCapability.promise;
            };

            /***/
        },

        /***/ 519: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var NativePromiseConstructor = __webpack_require__(513);
            var checkCorrectnessOfIteration = __webpack_require__(238);
            var FORCED_PROMISE_CONSTRUCTOR = __webpack_require__(514).CONSTRUCTOR;

            module.exports =
                FORCED_PROMISE_CONSTRUCTOR ||
                !checkCorrectnessOfIteration(function (iterable) {
                    NativePromiseConstructor.all(iterable).then(undefined, function () {
                        /* empty */
                    });
                });

            /***/
        },

        /***/ 512: /***/ (module) => {
            var Queue = function () {
                this.head = null;
                this.tail = null;
            };

            Queue.prototype = {
                add: function (item) {
                    var entry = { item: item, next: null };
                    if (this.head) this.tail.next = entry;
                    else this.head = entry;
                    this.tail = entry;
                },
                get: function () {
                    var entry = this.head;
                    if (entry) {
                        this.head = entry.next;
                        if (this.tail === entry) this.tail = null;
                        return entry.item;
                    }
                },
            };

            module.exports = Queue;

            /***/
        },

        /***/ 283: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var getBuiltIn = __webpack_require__(52);
            var definePropertyModule = __webpack_require__(73);
            var wellKnownSymbol = __webpack_require__(62);
            var DESCRIPTORS = __webpack_require__(34);

            var SPECIES = wellKnownSymbol('species');

            module.exports = function (CONSTRUCTOR_NAME) {
                var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
                var defineProperty = definePropertyModule.f;

                if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
                    defineProperty(Constructor, SPECIES, {
                        configurable: true,
                        get: function () {
                            return this;
                        },
                    });
                }
            };

            /***/
        },

        /***/ 508: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var anObject = __webpack_require__(75);
            var aConstructor = __webpack_require__(509);
            var isNullOrUndefined = __webpack_require__(45);
            var wellKnownSymbol = __webpack_require__(62);

            var SPECIES = wellKnownSymbol('species');

            // `SpeciesConstructor` abstract operation
            // https://tc39.es/ecma262/#sec-speciesconstructor
            module.exports = function (O, defaultConstructor) {
                var C = anObject(O).constructor;
                var S;
                return C === undefined || isNullOrUndefined((S = anObject(C)[SPECIES]))
                    ? defaultConstructor
                    : aConstructor(S);
            };

            /***/
        },

        /***/ 107: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);
            var apply = __webpack_require__(108);
            var bind = __webpack_require__(105);
            var isCallable = __webpack_require__(49);
            var hasOwn = __webpack_require__(67);
            var fails = __webpack_require__(35);
            var html = __webpack_require__(109);
            var arraySlice = __webpack_require__(110);
            var createElement = __webpack_require__(71);
            var validateArgumentsLength = __webpack_require__(111);
            var IS_IOS = __webpack_require__(112);
            var IS_NODE = __webpack_require__(113);

            var set = global.setImmediate;
            var clear = global.clearImmediate;
            var process = global.process;
            var Dispatch = global.Dispatch;
            var Function = global.Function;
            var MessageChannel = global.MessageChannel;
            var String = global.String;
            var counter = 0;
            var queue = {};
            var ONREADYSTATECHANGE = 'onreadystatechange';
            var $location, defer, channel, port;

            try {
                // Deno throws a ReferenceError on `location` access without `--location` flag
                $location = global.location;
            } catch (error) {
                /* empty */
            }

            var run = function (id) {
                if (hasOwn(queue, id)) {
                    var fn = queue[id];
                    delete queue[id];
                    fn();
                }
            };

            var runner = function (id) {
                return function () {
                    run(id);
                };
            };

            var listener = function (event) {
                run(event.data);
            };

            var post = function (id) {
                // old engines have not location.origin
                global.postMessage(String(id), $location.protocol + '//' + $location.host);
            };

            // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
            if (!set || !clear) {
                set = function setImmediate(handler) {
                    validateArgumentsLength(arguments.length, 1);
                    var fn = isCallable(handler) ? handler : Function(handler);
                    var args = arraySlice(arguments, 1);
                    queue[++counter] = function () {
                        apply(fn, undefined, args);
                    };
                    defer(counter);
                    return counter;
                };
                clear = function clearImmediate(id) {
                    delete queue[id];
                };
                // Node.js 0.8-
                if (IS_NODE) {
                    defer = function (id) {
                        process.nextTick(runner(id));
                    };
                    // Sphere (JS game engine) Dispatch API
                } else if (Dispatch && Dispatch.now) {
                    defer = function (id) {
                        Dispatch.now(runner(id));
                    };
                    // Browsers with MessageChannel, includes WebWorkers
                    // except iOS - https://github.com/zloirock/core-js/issues/624
                } else if (MessageChannel && !IS_IOS) {
                    channel = new MessageChannel();
                    port = channel.port2;
                    channel.port1.onmessage = listener;
                    defer = bind(port.postMessage, port);
                    // Browsers with postMessage, skip WebWorkers
                    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
                } else if (
                    global.addEventListener &&
                    isCallable(global.postMessage) &&
                    !global.importScripts &&
                    $location &&
                    $location.protocol !== 'file:' &&
                    !fails(post)
                ) {
                    defer = post;
                    global.addEventListener('message', listener, false);
                    // IE8-
                } else if (ONREADYSTATECHANGE in createElement('script')) {
                    defer = function (id) {
                        html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
                            html.removeChild(this);
                            run(id);
                        };
                    };
                    // Rest old browsers
                } else {
                    defer = function (id) {
                        setTimeout(runner(id), 0);
                    };
                }
            }

            module.exports = {
                set: set,
                clear: clear,
            };

            /***/
        },

        /***/ 111: /***/ (module) => {
            var $TypeError = TypeError;

            module.exports = function (passed, required) {
                if (passed < required) throw $TypeError('Not enough arguments');
                return passed;
            };

            /***/
        },

        /***/ 209: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var TO_STRING_TAG_SUPPORT = __webpack_require__(142);
            var defineBuiltIn = __webpack_require__(76);
            var toString = __webpack_require__(210);

            // `Object.prototype.toString` method
            // https://tc39.es/ecma262/#sec-object.prototype.tostring
            if (!TO_STRING_TAG_SUPPORT) {
                defineBuiltIn(Object.prototype, 'toString', toString, { unsafe: true });
            }

            /***/
        },

        /***/ 518: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var call = __webpack_require__(36);
            var aCallable = __webpack_require__(59);
            var newPromiseCapabilityModule = __webpack_require__(517);
            var perform = __webpack_require__(511);
            var iterate = __webpack_require__(278);
            var PROMISE_STATICS_INCORRECT_ITERATION = __webpack_require__(519);

            // `Promise.all` method
            // https://tc39.es/ecma262/#sec-promise.all
            $(
                { target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION },
                {
                    all: function all(iterable) {
                        var C = this;
                        var capability = newPromiseCapabilityModule.f(C);
                        var resolve = capability.resolve;
                        var reject = capability.reject;
                        var result = perform(function () {
                            var $promiseResolve = aCallable(C.resolve);
                            var values = [];
                            var counter = 0;
                            var remaining = 1;
                            iterate(iterable, function (promise) {
                                var index = counter++;
                                var alreadyCalled = false;
                                remaining++;
                                call($promiseResolve, C, promise).then(function (value) {
                                    if (alreadyCalled) return;
                                    alreadyCalled = true;
                                    values[index] = value;
                                    --remaining || resolve(values);
                                }, reject);
                            });
                            --remaining || resolve(values);
                        });
                        if (result.error) reject(result.value);
                        return capability.promise;
                    },
                }
            );

            /***/
        },

        /***/ 520: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var IS_PURE = __webpack_require__(64);
            var FORCED_PROMISE_CONSTRUCTOR = __webpack_require__(514).CONSTRUCTOR;
            var NativePromiseConstructor = __webpack_require__(513);
            var getBuiltIn = __webpack_require__(52);
            var isCallable = __webpack_require__(49);
            var defineBuiltIn = __webpack_require__(76);

            var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

            // `Promise.prototype.catch` method
            // https://tc39.es/ecma262/#sec-promise.prototype.catch
            $(
                { target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR, real: true },
                {
                    catch: function (onRejected) {
                        return this.then(undefined, onRejected);
                    },
                }
            );

            // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
            if (!IS_PURE && isCallable(NativePromiseConstructor)) {
                var method = getBuiltIn('Promise').prototype['catch'];
                if (NativePromisePrototype['catch'] !== method) {
                    defineBuiltIn(NativePromisePrototype, 'catch', method, { unsafe: true });
                }
            }

            /***/
        },

        /***/ 507: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var IS_PURE = __webpack_require__(64);
            var IS_NODE = __webpack_require__(113);
            var global = __webpack_require__(32);
            var call = __webpack_require__(36);
            var defineBuiltIn = __webpack_require__(76);
            var setPrototypeOf = __webpack_require__(206);
            var setToStringTag = __webpack_require__(205);
            var setSpecies = __webpack_require__(283);
            var aCallable = __webpack_require__(59);
            var isCallable = __webpack_require__(49);
            var isObject = __webpack_require__(48);
            var anInstance = __webpack_require__(279);
            var speciesConstructor = __webpack_require__(508);
            var task = __webpack_require__(107).set;
            var microtask = __webpack_require__(104);
            var hostReportErrors = __webpack_require__(510);
            var perform = __webpack_require__(511);
            var Queue = __webpack_require__(512);
            var InternalStateModule = __webpack_require__(80);
            var NativePromiseConstructor = __webpack_require__(513);
            var PromiseConstructorDetection = __webpack_require__(514);
            var newPromiseCapabilityModule = __webpack_require__(517);

            var PROMISE = 'Promise';
            var FORCED_PROMISE_CONSTRUCTOR = PromiseConstructorDetection.CONSTRUCTOR;
            var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
            var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
            var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
            var setInternalState = InternalStateModule.set;
            var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
            var PromiseConstructor = NativePromiseConstructor;
            var PromisePrototype = NativePromisePrototype;
            var TypeError = global.TypeError;
            var document = global.document;
            var process = global.process;
            var newPromiseCapability = newPromiseCapabilityModule.f;
            var newGenericPromiseCapability = newPromiseCapability;

            var DISPATCH_EVENT = !!(document && document.createEvent && global.dispatchEvent);
            var UNHANDLED_REJECTION = 'unhandledrejection';
            var REJECTION_HANDLED = 'rejectionhandled';
            var PENDING = 0;
            var FULFILLED = 1;
            var REJECTED = 2;
            var HANDLED = 1;
            var UNHANDLED = 2;

            var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

            // helpers
            var isThenable = function (it) {
                var then;
                return isObject(it) && isCallable((then = it.then)) ? then : false;
            };

            var callReaction = function (reaction, state) {
                var value = state.value;
                var ok = state.state == FULFILLED;
                var handler = ok ? reaction.ok : reaction.fail;
                var resolve = reaction.resolve;
                var reject = reaction.reject;
                var domain = reaction.domain;
                var result, then, exited;
                try {
                    if (handler) {
                        if (!ok) {
                            if (state.rejection === UNHANDLED) onHandleUnhandled(state);
                            state.rejection = HANDLED;
                        }
                        if (handler === true) result = value;
                        else {
                            if (domain) domain.enter();
                            result = handler(value); // can throw
                            if (domain) {
                                domain.exit();
                                exited = true;
                            }
                        }
                        if (result === reaction.promise) {
                            reject(TypeError('Promise-chain cycle'));
                        } else if ((then = isThenable(result))) {
                            call(then, result, resolve, reject);
                        } else resolve(result);
                    } else reject(value);
                } catch (error) {
                    if (domain && !exited) domain.exit();
                    reject(error);
                }
            };

            var notify = function (state, isReject) {
                if (state.notified) return;
                state.notified = true;
                microtask(function () {
                    var reactions = state.reactions;
                    var reaction;
                    while ((reaction = reactions.get())) {
                        callReaction(reaction, state);
                    }
                    state.notified = false;
                    if (isReject && !state.rejection) onUnhandled(state);
                });
            };

            var dispatchEvent = function (name, promise, reason) {
                var event, handler;
                if (DISPATCH_EVENT) {
                    event = document.createEvent('Event');
                    event.promise = promise;
                    event.reason = reason;
                    event.initEvent(name, false, true);
                    global.dispatchEvent(event);
                } else event = { promise: promise, reason: reason };
                if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = global['on' + name])) handler(event);
                else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
            };

            var onUnhandled = function (state) {
                call(task, global, function () {
                    var promise = state.facade;
                    var value = state.value;
                    var IS_UNHANDLED = isUnhandled(state);
                    var result;
                    if (IS_UNHANDLED) {
                        result = perform(function () {
                            if (IS_NODE) {
                                process.emit('unhandledRejection', value, promise);
                            } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
                        });
                        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
                        state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
                        if (result.error) throw result.value;
                    }
                });
            };

            var isUnhandled = function (state) {
                return state.rejection !== HANDLED && !state.parent;
            };

            var onHandleUnhandled = function (state) {
                call(task, global, function () {
                    var promise = state.facade;
                    if (IS_NODE) {
                        process.emit('rejectionHandled', promise);
                    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
                });
            };

            var bind = function (fn, state, unwrap) {
                return function (value) {
                    fn(state, value, unwrap);
                };
            };

            var internalReject = function (state, value, unwrap) {
                if (state.done) return;
                state.done = true;
                if (unwrap) state = unwrap;
                state.value = value;
                state.state = REJECTED;
                notify(state, true);
            };

            var internalResolve = function (state, value, unwrap) {
                if (state.done) return;
                state.done = true;
                if (unwrap) state = unwrap;
                try {
                    if (state.facade === value) throw TypeError("Promise can't be resolved itself");
                    var then = isThenable(value);
                    if (then) {
                        microtask(function () {
                            var wrapper = { done: false };
                            try {
                                call(
                                    then,
                                    value,
                                    bind(internalResolve, wrapper, state),
                                    bind(internalReject, wrapper, state)
                                );
                            } catch (error) {
                                internalReject(wrapper, error, state);
                            }
                        });
                    } else {
                        state.value = value;
                        state.state = FULFILLED;
                        notify(state, false);
                    }
                } catch (error) {
                    internalReject({ done: false }, error, state);
                }
            };

            // constructor polyfill
            if (FORCED_PROMISE_CONSTRUCTOR) {
                // 25.4.3.1 Promise(executor)
                PromiseConstructor = function Promise(executor) {
                    anInstance(this, PromisePrototype);
                    aCallable(executor);
                    call(Internal, this);
                    var state = getInternalPromiseState(this);
                    try {
                        executor(bind(internalResolve, state), bind(internalReject, state));
                    } catch (error) {
                        internalReject(state, error);
                    }
                };

                PromisePrototype = PromiseConstructor.prototype;

                // eslint-disable-next-line no-unused-vars -- required for `.length`
                Internal = function Promise(executor) {
                    setInternalState(this, {
                        type: PROMISE,
                        done: false,
                        notified: false,
                        parent: false,
                        reactions: new Queue(),
                        rejection: false,
                        state: PENDING,
                        value: undefined,
                    });
                };

                // `Promise.prototype.then` method
                // https://tc39.es/ecma262/#sec-promise.prototype.then
                Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
                    var state = getInternalPromiseState(this);
                    var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
                    state.parent = true;
                    reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
                    reaction.fail = isCallable(onRejected) && onRejected;
                    reaction.domain = IS_NODE ? process.domain : undefined;
                    if (state.state == PENDING) state.reactions.add(reaction);
                    else
                        microtask(function () {
                            callReaction(reaction, state);
                        });
                    return reaction.promise;
                });

                OwnPromiseCapability = function () {
                    var promise = new Internal();
                    var state = getInternalPromiseState(promise);
                    this.promise = promise;
                    this.resolve = bind(internalResolve, state);
                    this.reject = bind(internalReject, state);
                };

                newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
                    return C === PromiseConstructor || C === PromiseWrapper
                        ? new OwnPromiseCapability(C)
                        : newGenericPromiseCapability(C);
                };

                if (!IS_PURE && isCallable(NativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
                    nativeThen = NativePromisePrototype.then;

                    if (!NATIVE_PROMISE_SUBCLASSING) {
                        // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
                        defineBuiltIn(
                            NativePromisePrototype,
                            'then',
                            function then(onFulfilled, onRejected) {
                                var that = this;
                                return new PromiseConstructor(function (resolve, reject) {
                                    call(nativeThen, that, resolve, reject);
                                }).then(onFulfilled, onRejected);
                                // https://github.com/zloirock/core-js/issues/640
                            },
                            { unsafe: true }
                        );
                    }

                    // make `.constructor === Promise` work for native promise-based APIs
                    try {
                        delete NativePromisePrototype.constructor;
                    } catch (error) {
                        /* empty */
                    }

                    // make `instanceof Promise` work for native promise-based APIs
                    if (setPrototypeOf) {
                        setPrototypeOf(NativePromisePrototype, PromisePrototype);
                    }
                }
            }

            $(
                { global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR },
                {
                    Promise: PromiseConstructor,
                }
            );

            setToStringTag(PromiseConstructor, PROMISE, false, true);
            setSpecies(PROMISE);

            /***/
        },

        /***/ 506: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            // TODO: Remove this module from `core-js@4` since it's split to modules listed below
            __webpack_require__(507);
            __webpack_require__(518);
            __webpack_require__(520);
            __webpack_require__(521);
            __webpack_require__(522);
            __webpack_require__(523);

            /***/
        },

        /***/ 521: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var call = __webpack_require__(36);
            var aCallable = __webpack_require__(59);
            var newPromiseCapabilityModule = __webpack_require__(517);
            var perform = __webpack_require__(511);
            var iterate = __webpack_require__(278);
            var PROMISE_STATICS_INCORRECT_ITERATION = __webpack_require__(519);

            // `Promise.race` method
            // https://tc39.es/ecma262/#sec-promise.race
            $(
                { target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION },
                {
                    race: function race(iterable) {
                        var C = this;
                        var capability = newPromiseCapabilityModule.f(C);
                        var reject = capability.reject;
                        var result = perform(function () {
                            var $promiseResolve = aCallable(C.resolve);
                            iterate(iterable, function (promise) {
                                call($promiseResolve, C, promise).then(capability.resolve, reject);
                            });
                        });
                        if (result.error) reject(result.value);
                        return capability.promise;
                    },
                }
            );

            /***/
        },

        /***/ 522: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var call = __webpack_require__(36);
            var newPromiseCapabilityModule = __webpack_require__(517);
            var FORCED_PROMISE_CONSTRUCTOR = __webpack_require__(514).CONSTRUCTOR;

            // `Promise.reject` method
            // https://tc39.es/ecma262/#sec-promise.reject
            $(
                { target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR },
                {
                    reject: function reject(r) {
                        var capability = newPromiseCapabilityModule.f(this);
                        call(capability.reject, undefined, r);
                        return capability.promise;
                    },
                }
            );

            /***/
        },

        /***/ 523: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var $ = __webpack_require__(31);
            var getBuiltIn = __webpack_require__(52);
            var IS_PURE = __webpack_require__(64);
            var NativePromiseConstructor = __webpack_require__(513);
            var FORCED_PROMISE_CONSTRUCTOR = __webpack_require__(514).CONSTRUCTOR;
            var promiseResolve = __webpack_require__(524);

            var PromiseConstructorWrapper = getBuiltIn('Promise');
            var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;

            // `Promise.resolve` method
            // https://tc39.es/ecma262/#sec-promise.resolve
            $(
                { target: 'Promise', stat: true, forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR },
                {
                    resolve: function resolve(x) {
                        return promiseResolve(
                            CHECK_WRAPPER && this === PromiseConstructorWrapper ? NativePromiseConstructor : this,
                            x
                        );
                    },
                }
            );

            /***/
        },
    },
]);
