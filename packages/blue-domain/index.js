(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(
            require('@blue/context'),
            require('@blue/core'),
            require('@blue/dispatcher'),
            require('@blue/util')
        );
    else if (typeof define === 'function' && define.amd)
        define(['@blue/context', '@blue/core', '@blue/dispatcher', '@blue/util'], factory);
    else if (typeof exports === 'object')
        exports['blue-domain'] = factory(
            require('@blue/context'),
            require('@blue/core'),
            require('@blue/dispatcher'),
            require('@blue/util')
        );
    else
        root['blue-domain'] = factory(
            root['@blue/context'],
            root['@blue/core'],
            root['@blue/dispatcher'],
            root['@blue/util']
        );
})(
    globalThis,
    function (
        __WEBPACK_EXTERNAL_MODULE__3__,
        __WEBPACK_EXTERNAL_MODULE__2__,
        __WEBPACK_EXTERNAL_MODULE__6__,
        __WEBPACK_EXTERNAL_MODULE__4__
    ) {
        return /******/ (() => {
            // webpackBootstrap
            /******/ 'use strict';
            /******/ var __webpack_modules__ = [
                /* 0 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    /**
                     * @author Jeff Rose
                     * @module component
                     * @requires core
                     * @requires context
                     * @requires dispatcher
                     * @requires util
                     */
                    var __createBinding =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (o, m, k, k2) {
                                  if (k2 === undefined) k2 = k;
                                  Object.defineProperty(o, k2, {
                                      enumerable: true,
                                      get: function () {
                                          return m[k];
                                      },
                                  });
                              }
                            : function (o, m, k, k2) {
                                  if (k2 === undefined) k2 = k;
                                  o[k2] = m[k];
                              });
                    var __exportStar =
                        (this && this.__exportStar) ||
                        function (m, exports) {
                            for (var p in m)
                                if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
                                    __createBinding(exports, m, p);
                        };
                    Object.defineProperty(exports, '__esModule', { value: true });
                    __exportStar(__webpack_require__(1), exports);
                    __exportStar(__webpack_require__(5), exports);
                    __exportStar(__webpack_require__(7), exports);

                    /***/
                },
                /* 1 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    var __extends =
                        (this && this.__extends) ||
                        (function () {
                            var extendStatics = function (d, b) {
                                extendStatics =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (d, b) {
                                            d.__proto__ = b;
                                        }) ||
                                    function (d, b) {
                                        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
                                    };
                                return extendStatics(d, b);
                            };
                            return function (d, b) {
                                if (typeof b !== 'function' && b !== null)
                                    throw new TypeError(
                                        'Class extends value ' + String(b) + ' is not a constructor or null'
                                    );
                                extendStatics(d, b);
                                function __() {
                                    this.constructor = d;
                                }
                                d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
                            };
                        })();
                    var __awaiter =
                        (this && this.__awaiter) ||
                        function (thisArg, _arguments, P, generator) {
                            function adopt(value) {
                                return value instanceof P
                                    ? value
                                    : new P(function (resolve) {
                                          resolve(value);
                                      });
                            }
                            return new (P || (P = Promise))(function (resolve, reject) {
                                function fulfilled(value) {
                                    try {
                                        step(generator.next(value));
                                    } catch (e) {
                                        reject(e);
                                    }
                                }
                                function rejected(value) {
                                    try {
                                        step(generator['throw'](value));
                                    } catch (e) {
                                        reject(e);
                                    }
                                }
                                function step(result) {
                                    result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
                                }
                                step((generator = generator.apply(thisArg, _arguments || [])).next());
                            });
                        };
                    var __generator =
                        (this && this.__generator) ||
                        function (thisArg, body) {
                            var _ = {
                                    label: 0,
                                    sent: function () {
                                        if (t[0] & 1) throw t[1];
                                        return t[1];
                                    },
                                    trys: [],
                                    ops: [],
                                },
                                f,
                                y,
                                t,
                                g;
                            return (
                                (g = { next: verb(0), throw: verb(1), return: verb(2) }),
                                typeof Symbol === 'function' &&
                                    (g[Symbol.iterator] = function () {
                                        return this;
                                    }),
                                g
                            );
                            function verb(n) {
                                return function (v) {
                                    return step([n, v]);
                                };
                            }
                            function step(op) {
                                if (f) throw new TypeError('Generator is already executing.');
                                while (_)
                                    try {
                                        if (
                                            ((f = 1),
                                            y &&
                                                (t =
                                                    op[0] & 2
                                                        ? y['return']
                                                        : op[0]
                                                          ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                                                          : y.next) &&
                                                !(t = t.call(y, op[1])).done)
                                        )
                                            return t;
                                        if (((y = 0), t)) op = [op[0] & 2, t.value];
                                        switch (op[0]) {
                                            case 0:
                                            case 1:
                                                t = op;
                                                break;
                                            case 4:
                                                _.label++;
                                                return { value: op[1], done: false };
                                            case 5:
                                                _.label++;
                                                y = op[1];
                                                op = [0];
                                                continue;
                                            case 7:
                                                op = _.ops.pop();
                                                _.trys.pop();
                                                continue;
                                            default:
                                                if (
                                                    !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                                    (op[0] === 6 || op[0] === 2)
                                                ) {
                                                    _ = 0;
                                                    continue;
                                                }
                                                if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                                    _.label = op[1];
                                                    break;
                                                }
                                                if (op[0] === 6 && _.label < t[1]) {
                                                    _.label = t[1];
                                                    t = op;
                                                    break;
                                                }
                                                if (t && _.label < t[2]) {
                                                    _.label = t[2];
                                                    _.ops.push(op);
                                                    break;
                                                }
                                                if (t[2]) _.ops.pop();
                                                _.trys.pop();
                                                continue;
                                        }
                                        op = body.call(thisArg, _);
                                    } catch (e) {
                                        op = [6, e];
                                        y = 0;
                                    } finally {
                                        f = t = 0;
                                    }
                                if (op[0] & 5) throw op[1];
                                return { value: op[0] ? op[1] : void 0, done: true };
                            }
                        };
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.GenericDomainComponent = void 0;
                    var core_1 = __webpack_require__(2);
                    var context_1 = __webpack_require__(3);
                    var util_1 = __webpack_require__(4);
                    var defineProperty = Reflect.defineProperty,
                        deleteProperty = Reflect.deleteProperty,
                        initializeData = util_1.curryN(1, function (component, value, key) {
                            component.model.set(key, value);
                            defineProperty(component, key, {
                                get: function () {
                                    return component.model.get(key, { isolate: true });
                                },
                                set: function () {},
                                configurable: true,
                                enumerable: true,
                                writable: false,
                            });
                        });
                    var uuid = 0;
                    /**
                     * @class module:component.GenericDomainComponent
                     */
                    var GenericDomainComponent = /** @class */ (function (_super) {
                        __extends(GenericDomainComponent, _super);
                        function GenericDomainComponent() {
                            var _this = _super.call(this) || this;
                            var id = ++uuid;
                            defineProperty(_this, 'id', {
                                get: function () {
                                    return id;
                                },
                                configurable: true,
                                enumerable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(GenericDomainComponent.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'DomainComponent:' + this.name;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(GenericDomainComponent.prototype, 'data', {
                            set: function (newData) {
                                var initData = initializeData(this);
                                util_1.forEachObjIndexed(initData, newData);
                                deleteProperty(this, 'data');
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        GenericDomainComponent.prototype.init = function (name) {
                            defineProperty(this, 'name', {
                                get: function () {
                                    return name;
                                },
                                configurable: true,
                                enumerable: false,
                            });
                        };
                        GenericDomainComponent.prototype.validate = function (property) {
                            throw new Error('Method not implemented.');
                        };
                        GenericDomainComponent.prototype.destroy = function () {
                            return __awaiter(this, void 0, Promise, function () {
                                return __generator(this, function (_a) {
                                    throw new Error('Method not implemented.');
                                });
                            });
                        };
                        GenericDomainComponent.prototype.toJSON = function () {
                            var json = core_1.createNull();
                            json.name = this.name;
                            json.id = this.id;
                            return json;
                        };
                        GenericDomainComponent.prototype.toString = function () {
                            return this.name;
                        };
                        return GenericDomainComponent;
                    })(context_1.AsEventEmitter(core_1.Null));
                    exports.GenericDomainComponent = GenericDomainComponent;

                    /***/
                },
                /* 2 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

                    /***/
                },
                /* 3 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

                    /***/
                },
                /* 4 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

                    /***/
                },
                /* 5 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    /**
                     * @author Jeff Rose
                     */
                    var __extends =
                        (this && this.__extends) ||
                        (function () {
                            var extendStatics = function (d, b) {
                                extendStatics =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (d, b) {
                                            d.__proto__ = b;
                                        }) ||
                                    function (d, b) {
                                        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
                                    };
                                return extendStatics(d, b);
                            };
                            return function (d, b) {
                                if (typeof b !== 'function' && b !== null)
                                    throw new TypeError(
                                        'Class extends value ' + String(b) + ' is not a constructor or null'
                                    );
                                extendStatics(d, b);
                                function __() {
                                    this.constructor = d;
                                }
                                d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
                            };
                        })();
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.ComponentAndView = void 0;
                    var dispatcher_1 = __webpack_require__(6);
                    /**
                     * @class module:component.ComponentAndView
                     * @extends module:dispatcher.ModelAndView
                     */
                    var ComponentAndView = /** @class */ (function (_super) {
                        __extends(ComponentAndView, _super);
                        function ComponentAndView() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(ComponentAndView.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'ComponentAndView:' + this.viewName;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return ComponentAndView;
                    })(dispatcher_1.ModelAndView);
                    exports.ComponentAndView = ComponentAndView;

                    /***/
                },
                /* 6 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__6__;

                    /***/
                },
                /* 7 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    /**
                     * @author Jeff Rose
                     */
                    var __extends =
                        (this && this.__extends) ||
                        (function () {
                            var extendStatics = function (d, b) {
                                extendStatics =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (d, b) {
                                            d.__proto__ = b;
                                        }) ||
                                    function (d, b) {
                                        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
                                    };
                                return extendStatics(d, b);
                            };
                            return function (d, b) {
                                if (typeof b !== 'function' && b !== null)
                                    throw new TypeError(
                                        'Class extends value ' + String(b) + ' is not a constructor or null'
                                    );
                                extendStatics(d, b);
                                function __() {
                                    this.constructor = d;
                                }
                                d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
                            };
                        })();
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.DomainError = void 0;
                    var core_1 = __webpack_require__(2);
                    var setPrototypeOf = Reflect.setPrototypeOf;
                    var DomainError = /** @class */ (function (_super) {
                        __extends(DomainError, _super);
                        function DomainError(message) {
                            var _newTarget = this.constructor;
                            var _this = _super.call(this, message) || this;
                            setPrototypeOf(_this, _newTarget.prototype);
                            return _this;
                        }
                        Object.defineProperty(DomainError.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'DomainError';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return DomainError;
                    })(core_1.AsSerializableError(Error));
                    exports.DomainError = DomainError;

                    /***/
                },
                /******/
            ];
            /************************************************************************/
            /******/ // The module cache
            /******/ var __webpack_module_cache__ = {};
            /******/
            /******/ // The require function
            /******/ function __webpack_require__(moduleId) {
                /******/ // Check if module is in cache
                /******/ var cachedModule = __webpack_module_cache__[moduleId];
                /******/ if (cachedModule !== undefined) {
                    /******/ return cachedModule.exports;
                    /******/
                }
                /******/ // Create a new module (and put it into the cache)
                /******/ var module = (__webpack_module_cache__[moduleId] = {
                    /******/ // no module.id needed
                    /******/ // no module.loaded needed
                    /******/ exports: {},
                    /******/
                });
                /******/
                /******/ // Execute the module function
                /******/ __webpack_modules__[moduleId].call(
                    module.exports,
                    module,
                    module.exports,
                    __webpack_require__
                );
                /******/
                /******/ // Return the exports of the module
                /******/ return module.exports;
                /******/
            }
            /******/
            /************************************************************************/
            /******/
            /******/ // startup
            /******/ // Load entry module and return exports
            /******/ // This entry module is referenced by other modules so it can't be inlined
            /******/ var __webpack_exports__ = __webpack_require__(0);
            /******/
            /******/ return __webpack_exports__;
            /******/
        })();
    }
);
