(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(
            require('@blue/util'),
            require('@blue/core'),
            require('@blue/view'),
            require('@blue/router'),
            require('@blue/factory'),
            require('@blue/context')
        );
    else if (typeof define === 'function' && define.amd)
        define(['@blue/util', '@blue/core', '@blue/view', '@blue/router', '@blue/factory', '@blue/context'], factory);
    else if (typeof exports === 'object')
        exports['blue-dispatcher'] = factory(
            require('@blue/util'),
            require('@blue/core'),
            require('@blue/view'),
            require('@blue/router'),
            require('@blue/factory'),
            require('@blue/context')
        );
    else
        root['blue-dispatcher'] = factory(
            root['@blue/util'],
            root['@blue/core'],
            root['@blue/view'],
            root['@blue/router'],
            root['@blue/factory'],
            root['@blue/context']
        );
})(
    globalThis,
    function (
        __WEBPACK_EXTERNAL_MODULE__4__,
        __WEBPACK_EXTERNAL_MODULE__5__,
        __WEBPACK_EXTERNAL_MODULE__8__,
        __WEBPACK_EXTERNAL_MODULE__9__,
        __WEBPACK_EXTERNAL_MODULE__15__,
        __WEBPACK_EXTERNAL_MODULE__18__
    ) {
        return /******/ (() => {
            // webpackBootstrap
            /******/ var __webpack_modules__ = [
                /* 0 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     * @module dispatcher
                     * @requires core
                     * @requires util
                     * @requires router
                     * @requires view
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
                    __exportStar(__webpack_require__(6), exports);
                    __exportStar(__webpack_require__(10), exports);
                    __exportStar(__webpack_require__(11), exports);
                    __exportStar(__webpack_require__(14), exports);
                    __exportStar(__webpack_require__(31), exports);
                    __exportStar(__webpack_require__(12), exports);
                    __exportStar(__webpack_require__(20), exports);
                    __exportStar(__webpack_require__(25), exports);
                    __exportStar(__webpack_require__(35), exports);
                    __exportStar(__webpack_require__(7), exports);
                    __exportStar(__webpack_require__(23), exports);
                    __exportStar(__webpack_require__(17), exports);
                    __exportStar(__webpack_require__(22), exports);
                    __exportStar(__webpack_require__(2), exports);
                    __exportStar(__webpack_require__(27), exports);
                    __exportStar(__webpack_require__(29), exports);

                    /***/
                },
                /* 1 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    var __classPrivateFieldSet =
                        (this && this.__classPrivateFieldSet) ||
                        function (receiver, privateMap, value) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to set private field on non-instance');
                            }
                            privateMap.set(receiver, value);
                            return value;
                        };
                    var _factory;
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.QueryValueMethodArgumentResolver =
                        exports.MatrixValueMethodArgumentResolver =
                        exports.AbstractNamedValueMethodArgumentResolver =
                            void 0;
                    var route_parameter_1 = __webpack_require__(2);
                    var util_1 = __webpack_require__(4);
                    /**
                     * Strategy interface for resolving method parameters into argument values in the context of a given route.
                     * @interface module:dispatcher.HandlerMethodArgumentResolver
                     */
                    /**
                     * Whether the given {@link module:RouteParameter|route parameter} is supported by this resolver.
                     * @function module:dispatcher.HandlerMethodArgumentResolver#supportsParameter
                     * @param {*} parameter The method parameter to check.
                     * @returns {external:boolean} Whether or not the given method parameter is supported by this resolver.
                     */
                    /**
                     * Resolves a method parameter into an argument value from a given route.
                     * @function module:dispatcher.HandlerMethodArgumentResolver#resolveArgument
                     * @returns {*} The resolved argument value, or `null` if not resolvable.
                     */
                    var AbstractNamedValueMethodArgumentResolver = /** @class */ (function () {
                        function AbstractNamedValueMethodArgumentResolver(factory) {
                            _factory.set(this, void 0);
                            __classPrivateFieldSet(this, _factory, factory);
                        }
                        AbstractNamedValueMethodArgumentResolver.prototype.handleMissingValue = function (name) {
                            throw TypeError('"' + name + '" cannot be undefined or null');
                        };
                        return AbstractNamedValueMethodArgumentResolver;
                    })();
                    exports.AbstractNamedValueMethodArgumentResolver = AbstractNamedValueMethodArgumentResolver;
                    _factory = new WeakMap();
                    /**
                     * Abstract base class for resolving method arguments from a named value.
                     *
                     * Subclasses define how to:
                     * * Obtain named value information for a method parameter
                     * * Resolve names into argument values
                     * * Handle missing argument values when argument values are required
                     * * Optionally handle a resolved value
                     *
                     * A {@linkcode module:factory.Factory|Factory} must be supplied to the class constructor.
                     * @abstract
                     * @class module:dispatcher.AbstractNamedValueMethodArgumentResolver
                     * @implements module:dispatcher.HandlerMethodArgumentResolver
                     * @param {module:factory.Factory} factory A factory for resolving values
                     */
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractCookieValueMethodArgumentResolver
                     * @implements module:dispatcher.HandlerMethodArgumentResolver
                     */
                    /**
                     * @class module:dispatcher.MatrixParameterMethodArgumentResolver
                     * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
                     */
                    var MatrixValueMethodArgumentResolver = /** @class */ (function (_super) {
                        __extends(MatrixValueMethodArgumentResolver, _super);
                        function MatrixValueMethodArgumentResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        MatrixValueMethodArgumentResolver.prototype.resolveArgument = function (
                            parameter,
                            route,
                            mapping
                        ) {
                            var resolveValue = util_1.defaultTo(parameter.defaultValue);
                            var index = -1,
                                name = mapping.value.slice(1),
                                segment,
                                value;
                            while ((segment = route[++index])) {
                                if (!segment) {
                                    break;
                                }
                                // @ts-ignore: ¯\_(ツ)_/¯
                                if (segment.name === name) {
                                    value = segment.data[parameter.name];
                                    if (!util_1.isNil(value)) {
                                        break;
                                    }
                                }
                            }
                            if (util_1.isNil(value)) {
                                value = resolveValue(route.data[parameter.name]);
                            }
                            util_1.isNil(value) && parameter.required && this.handleMissingValue(parameter.name);
                            return value;
                        };
                        MatrixValueMethodArgumentResolver.prototype.supportsParameter = function (parameter) {
                            return route_parameter_1.MethodParameterType.MATRIX.equals(parameter.type);
                        };
                        return MatrixValueMethodArgumentResolver;
                    })(AbstractNamedValueMethodArgumentResolver);
                    exports.MatrixValueMethodArgumentResolver = MatrixValueMethodArgumentResolver;
                    /**
                     * @class module:dispatcher.QueryValueMethodArgumentResolver
                     * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
                     */
                    var QueryValueMethodArgumentResolver = /** @class */ (function (_super) {
                        __extends(QueryValueMethodArgumentResolver, _super);
                        function QueryValueMethodArgumentResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        QueryValueMethodArgumentResolver.prototype.resolveArgument = function (
                            parameter,
                            route,
                            mapping
                        ) {
                            var resolveValue = util_1.defaultTo(parameter.defaultValue),
                                value = resolveValue(route.data[parameter.name]);
                            util_1.isNil(value) && parameter.required && this.handleMissingValue(parameter.name);
                            return value;
                        };
                        QueryValueMethodArgumentResolver.prototype.supportsParameter = function (parameter) {
                            return route_parameter_1.MethodParameterType.QUERY.equals(parameter.type);
                        };
                        return QueryValueMethodArgumentResolver;
                    })(AbstractNamedValueMethodArgumentResolver);
                    exports.QueryValueMethodArgumentResolver = QueryValueMethodArgumentResolver;

                    /***/
                },
                /* 2 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.queryValue =
                        exports.matrixValue =
                        exports.cookieValue =
                        exports.defineQueryValue =
                        exports.defineMatrixValue =
                        exports.defineCookieValue =
                        exports.MethodParameter =
                        exports.hasMethodParameter =
                        exports.getMethodParameter =
                        exports.MethodParameterType =
                            void 0;
                    __webpack_require__(3);
                    var util_1 = __webpack_require__(4);
                    var core_1 = __webpack_require__(5);
                    /**
                     * @typedef {external:Object} module:dispatcher.MethodParameterInfo
                     */
                    var METHOD_PARAMETER = 'method:parameter',
                        assign = Object.assign,
                        keys = Object.keys,
                        defineMetadata = Reflect.defineMetadata,
                        defineProperty = Reflect.defineProperty,
                        getMetadata = Reflect.getMetadata,
                        hasMetadata = Reflect.hasMetadata,
                        defaultMethodParameterInfo = {
                            name: null,
                            mapping: null,
                            required: false,
                            defaultValue: null,
                        },
                        defineMethodParameter = function (type, info, parameterIndex, target, propertyKey) {
                            var parameters = exports.hasMethodParameter(target, propertyKey)
                                ? exports.getMethodParameter(target, propertyKey)
                                : [];
                            parameters[parameterIndex] = new MethodParameter(
                                type,
                                info.name,
                                info.required,
                                info.defaultValue
                            );
                            console.log('defineMethodParameter::parameters', parameters);
                            defineMetadata(METHOD_PARAMETER, parameters, target, propertyKey);
                        },
                        likeMethodParameterInfo = util_1.like({
                            name: String,
                            mapping: String,
                            required: Boolean,
                            defaultValue: String,
                        }),
                        isStringOrLikeMethodParameterInfo = util_1.either(util_1.isString, likeMethodParameterInfo),
                        isNotString = util_1.complement(util_1.isString),
                        namedObj = util_1.objOf('name'),
                        // TODO NEED TO ALLOW FOR DIFFERENT DEFAULT INFO
                        toMethodParameterInfo = util_1.pipe(
                            util_1.when(util_1.isString, namedObj),
                            util_1.mergeRight(defaultMethodParameterInfo)
                        );
                    var MethodParameterType = /** @class */ (function () {
                        function MethodParameterType(type) {
                            defineProperty(this, 'type', {
                                value: type,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        MethodParameterType.fromType = function (type) {
                            var types = keys(this),
                                length = types.length;
                            for (var index = 0; index < length; index++) {
                                var key = types[index],
                                    parameterType = MethodParameterType[key];
                                if (parameterType.type === type) {
                                    return parameterType;
                                }
                            }
                            return null;
                        };
                        Object.defineProperty(MethodParameterType.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'MethodParameterType:' + this.type;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MethodParameterType.prototype.equals = function (value) {
                            return value instanceof MethodParameterType && value.type === this.type;
                        };
                        MethodParameterType.prototype.toJSON = function () {
                            return this.toString();
                        };
                        MethodParameterType.prototype.toString = function () {
                            return this.type;
                        };
                        return MethodParameterType;
                    })();
                    exports.MethodParameterType = MethodParameterType;
                    MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
                    MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
                    MethodParameterType.QUERY = new MethodParameterType('query:value');
                    var getMethodParameter = function (target, propertyKey) {
                        return getMetadata(METHOD_PARAMETER, target, propertyKey);
                    };
                    exports.getMethodParameter = getMethodParameter;
                    var hasMethodParameter = function (target, propertyKey) {
                        return hasMetadata(METHOD_PARAMETER, target, propertyKey);
                    };
                    exports.hasMethodParameter = hasMethodParameter;
                    var MethodParameter = /** @class */ (function () {
                        function MethodParameter(type, name, required, defaultValue) {
                            if (required === void 0) {
                                required = false;
                            }
                            if (defaultValue === void 0) {
                                defaultValue = null;
                            }
                            if (isNotString(name)) {
                                throw new TypeError('"name" must be a string but was ' + name);
                            }
                            defineProperty(this, 'type', {
                                value: type,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'name', {
                                value: name,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'required', {
                                value: required,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'defaultValue', {
                                value: defaultValue,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        MethodParameter.prototype.toJSON = function () {
                            var json = core_1.createNull();
                            json.name = this.name;
                            json.type = this.type;
                            json.required = this.required;
                            json.defaultValue = this.defaultValue;
                            return json;
                        };
                        MethodParameter.prototype.toString = function () {
                            return this.name;
                        };
                        return MethodParameter;
                    })();
                    exports.MethodParameter = MethodParameter;
                    /**
                     * @function module:dispatcher.defineCookieValue
                     * @param {module:dispatcher.MethodParameterInfo} info
                     * @param {external:number} parameterIndex
                     * @param {external:Object} target
                     * @param {external:string|external:symbol} propertyKey
                     */
                    var defineCookieValue = function (info, parameterIndex, target, propertyKey) {
                        return defineMethodParameter(
                            MethodParameterType.COOKIE,
                            info,
                            parameterIndex,
                            target,
                            propertyKey
                        );
                    };
                    exports.defineCookieValue = defineCookieValue;
                    /**
                     * @function module:dispatcher.defineMatrixValue
                     * @param {module:dispatcher.MethodParameterInfo} info
                     * @param {external:number} parameterIndex
                     * @param {external:Object} target
                     * @param {external:string|external:symbol} propertyKey
                     */
                    var defineMatrixValue = function (info, parameterIndex, target, propertyKey) {
                        return defineMethodParameter(
                            MethodParameterType.MATRIX,
                            info,
                            parameterIndex,
                            target,
                            propertyKey
                        );
                    };
                    exports.defineMatrixValue = defineMatrixValue;
                    /**
                     * @function module:dispatcher.defineQueryValue
                     * @param {module:dispatcher.MethodParameterInfo} info
                     * @param {external:number} parameterIndex
                     * @param {external:Object} target
                     * @param {external:string|external:symbol} propertyKey
                     */
                    var defineQueryValue = function (info, parameterIndex, target, propertyKey) {
                        return defineMethodParameter(
                            MethodParameterType.QUERY,
                            info,
                            parameterIndex,
                            target,
                            propertyKey
                        );
                    };
                    exports.defineQueryValue = defineQueryValue;
                    /**
                     * @function module:dispatcher.cookieValue(1)
                     * @param {external:string|module:dispatcher.MethodParameterInfo} info
                     * @returns {external:ParameterDecorator}
                     */
                    /**
                     * @const {external:ParameterDecorator} module:dispatcher.cookieValue(2)
                     */
                    var cookieValue = function (infoOrTarget, propertyKey, parameterIndex) {
                        // Called as Function
                        if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
                            var info_1 = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
                            return function (target, propertyKey, parameterIndex) {
                                exports.defineCookieValue(info_1, parameterIndex, target, propertyKey);
                                console.log('@cookieValue', info_1, parameterIndex, target, propertyKey);
                            };
                            // Called as ParameterDecorator
                        } else {
                            var info = assign({}, defaultMethodParameterInfo);
                            exports.defineCookieValue(info, parameterIndex, infoOrTarget, propertyKey);
                            console.log('@cookieValue', info, parameterIndex, infoOrTarget, propertyKey);
                        }
                    };
                    exports.cookieValue = cookieValue;
                    /**
                     * @function module:dispatcher.matrixValue(1)
                     * @param {external:string|module:dispatcher.matrixValueInfo} info
                     * @returns {external:ParameterDecorator}
                     */
                    /**
                     * @const {external:ParameterDecorator} module:dispatcher.matrixValue(2)
                     */
                    var matrixValue = function (infoOrTarget, propertyKey, parameterIndex) {
                        // Called as Function
                        if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
                            var info_2 = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
                            return function (target, propertyKey, parameterIndex) {
                                exports.defineMatrixValue(info_2, parameterIndex, target, propertyKey);
                                console.log('@matrixValue', info_2, parameterIndex, target, propertyKey);
                            };
                            // Called as ParameterDecorator
                        } else {
                            var info = assign({}, defaultMethodParameterInfo);
                            exports.defineMatrixValue(info, parameterIndex, infoOrTarget, propertyKey);
                            console.log('@matrixValue', info, parameterIndex, infoOrTarget, propertyKey);
                        }
                    };
                    exports.matrixValue = matrixValue;
                    /**
                     * @function module:dispatcher.queryValue(1)
                     * @param {external:string|module:dispatcher.MethodParameterInfo} info
                     * @returns {external:ParameterDecorator}
                     */
                    /**
                     * @const {external:ParameterDecorator} module:dispatcher.queryValue(2)
                     */
                    var queryValue = function (infoOrTarget, propertyKey, parameterIndex) {
                        // Called as Function
                        if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
                            var info_3 = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
                            return function (target, propertyKey, parameterIndex) {
                                exports.defineQueryValue(info_3, parameterIndex, target, propertyKey);
                                console.log('@queryValue', info_3, parameterIndex, target, propertyKey);
                            };
                            // Called as ParameterDecorator
                        } else {
                            var info = assign({}, defaultMethodParameterInfo);
                            exports.defineQueryValue(info, parameterIndex, infoOrTarget, propertyKey);
                            console.log('@queryValue', info, parameterIndex, infoOrTarget, propertyKey);
                        }
                    };
                    exports.queryValue = queryValue;

                    /***/
                },
                /* 3 */
                /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
                    /*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
                    var Reflect;
                    (function (Reflect) {
                        // Metadata Proposal
                        // https://rbuckton.github.io/reflect-metadata/
                        (function (factory) {
                            var root =
                                typeof __webpack_require__.g === 'object'
                                    ? __webpack_require__.g
                                    : typeof self === 'object'
                                      ? self
                                      : typeof this === 'object'
                                        ? this
                                        : Function('return this;')();
                            var exporter = makeExporter(Reflect);
                            if (typeof root.Reflect === 'undefined') {
                                root.Reflect = Reflect;
                            } else {
                                exporter = makeExporter(root.Reflect, exporter);
                            }
                            factory(exporter);
                            function makeExporter(target, previous) {
                                return function (key, value) {
                                    if (typeof target[key] !== 'function') {
                                        Object.defineProperty(target, key, {
                                            configurable: true,
                                            writable: true,
                                            value: value,
                                        });
                                    }
                                    if (previous) previous(key, value);
                                };
                            }
                        })(function (exporter) {
                            var hasOwn = Object.prototype.hasOwnProperty;
                            // feature test for Symbol support
                            var supportsSymbol = typeof Symbol === 'function';
                            var toPrimitiveSymbol =
                                supportsSymbol && typeof Symbol.toPrimitive !== 'undefined'
                                    ? Symbol.toPrimitive
                                    : '@@toPrimitive';
                            var iteratorSymbol =
                                supportsSymbol && typeof Symbol.iterator !== 'undefined'
                                    ? Symbol.iterator
                                    : '@@iterator';
                            var supportsCreate = typeof Object.create === 'function'; // feature test for Object.create support
                            var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
                            var downLevel = !supportsCreate && !supportsProto;
                            var HashMap = {
                                // create an object in dictionary mode (a.k.a. "slow" mode in v8)
                                create: supportsCreate
                                    ? function () {
                                          return MakeDictionary(Object.create(null));
                                      }
                                    : supportsProto
                                      ? function () {
                                            return MakeDictionary({ __proto__: null });
                                        }
                                      : function () {
                                            return MakeDictionary({});
                                        },
                                has: downLevel
                                    ? function (map, key) {
                                          return hasOwn.call(map, key);
                                      }
                                    : function (map, key) {
                                          return key in map;
                                      },
                                get: downLevel
                                    ? function (map, key) {
                                          return hasOwn.call(map, key) ? map[key] : undefined;
                                      }
                                    : function (map, key) {
                                          return map[key];
                                      },
                            };
                            // Load global or shim versions of Map, Set, and WeakMap
                            var functionPrototype = Object.getPrototypeOf(Function);
                            var usePolyfill =
                                typeof process === 'object' &&
                                process.env &&
                                process.env['REFLECT_METADATA_USE_MAP_POLYFILL'] === 'true';
                            var _Map =
                                !usePolyfill && typeof Map === 'function' && typeof Map.prototype.entries === 'function'
                                    ? Map
                                    : CreateMapPolyfill();
                            var _Set =
                                !usePolyfill && typeof Set === 'function' && typeof Set.prototype.entries === 'function'
                                    ? Set
                                    : CreateSetPolyfill();
                            var _WeakMap =
                                !usePolyfill && typeof WeakMap === 'function' ? WeakMap : CreateWeakMapPolyfill();
                            // [[Metadata]] internal slot
                            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
                            var Metadata = new _WeakMap();
                            /**
                             * Applies a set of decorators to a property of a target object.
                             * @param decorators An array of decorators.
                             * @param target The target object.
                             * @param propertyKey (Optional) The property key to decorate.
                             * @param attributes (Optional) The property descriptor for the target key.
                             * @remarks Decorators are applied in reverse order.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     Example = Reflect.decorate(decoratorsArray, Example);
                             *
                             *     // property (on constructor)
                             *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     Object.defineProperty(Example, "staticMethod",
                             *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
                             *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
                             *
                             *     // method (on prototype)
                             *     Object.defineProperty(Example.prototype, "method",
                             *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
                             *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
                             *
                             */
                            function decorate(decorators, target, propertyKey, attributes) {
                                if (!IsUndefined(propertyKey)) {
                                    if (!IsArray(decorators)) throw new TypeError();
                                    if (!IsObject(target)) throw new TypeError();
                                    if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                                        throw new TypeError();
                                    if (IsNull(attributes)) attributes = undefined;
                                    propertyKey = ToPropertyKey(propertyKey);
                                    return DecorateProperty(decorators, target, propertyKey, attributes);
                                } else {
                                    if (!IsArray(decorators)) throw new TypeError();
                                    if (!IsConstructor(target)) throw new TypeError();
                                    return DecorateConstructor(decorators, target);
                                }
                            }
                            exporter('decorate', decorate);
                            // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
                            // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
                            /**
                             * A default metadata decorator factory that can be used on a class, class member, or parameter.
                             * @param metadataKey The key for the metadata entry.
                             * @param metadataValue The value for the metadata entry.
                             * @returns A decorator function.
                             * @remarks
                             * If `metadataKey` is already defined for the target and target key, the
                             * metadataValue for that key will be overwritten.
                             * @example
                             *
                             *     // constructor
                             *     @Reflect.metadata(key, value)
                             *     class Example {
                             *     }
                             *
                             *     // property (on constructor, TypeScript only)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         static staticProperty;
                             *     }
                             *
                             *     // property (on prototype, TypeScript only)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         property;
                             *     }
                             *
                             *     // method (on constructor)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         static staticMethod() { }
                             *     }
                             *
                             *     // method (on prototype)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         method() { }
                             *     }
                             *
                             */
                            function metadata(metadataKey, metadataValue) {
                                function decorator(target, propertyKey) {
                                    if (!IsObject(target)) throw new TypeError();
                                    if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError();
                                    OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
                                }
                                return decorator;
                            }
                            exporter('metadata', metadata);
                            /**
                             * Define a unique metadata entry on the target.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param metadataValue A value that contains attached metadata.
                             * @param target The target object on which to define metadata.
                             * @param propertyKey (Optional) The property key for the target.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     Reflect.defineMetadata("custom:annotation", options, Example);
                             *
                             *     // property (on constructor)
                             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
                             *
                             *     // decorator factory as metadata-producing annotation.
                             *     function MyAnnotation(options): Decorator {
                             *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
                             *     }
                             *
                             */
                            function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
                            }
                            exporter('defineMetadata', defineMetadata);
                            /**
                             * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.hasMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function hasMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryHasMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('hasMetadata', hasMetadata);
                            /**
                             * Gets a value indicating whether the target object has the provided metadata key defined.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function hasOwnMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('hasOwnMetadata', hasOwnMetadata);
                            /**
                             * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function getMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryGetMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('getMetadata', getMetadata);
                            /**
                             * Gets the metadata value for the provided metadata key on the target object.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function getOwnMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('getOwnMetadata', getOwnMetadata);
                            /**
                             * Gets the metadata keys defined on the target object or its prototype chain.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns An array of unique metadata keys.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getMetadataKeys(Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getMetadataKeys(Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getMetadataKeys(Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getMetadataKeys(Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getMetadataKeys(Example.prototype, "method");
                             *
                             */
                            function getMetadataKeys(target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryMetadataKeys(target, propertyKey);
                            }
                            exporter('getMetadataKeys', getMetadataKeys);
                            /**
                             * Gets the unique metadata keys defined on the target object.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns An array of unique metadata keys.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getOwnMetadataKeys(Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
                             *
                             */
                            function getOwnMetadataKeys(target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryOwnMetadataKeys(target, propertyKey);
                            }
                            exporter('getOwnMetadataKeys', getOwnMetadataKeys);
                            /**
                             * Deletes the metadata entry from the target object with the provided key.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata entry was found and deleted; otherwise, false.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.deleteMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function deleteMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return false;
                                if (!metadataMap.delete(metadataKey)) return false;
                                if (metadataMap.size > 0) return true;
                                var targetMetadata = Metadata.get(target);
                                targetMetadata.delete(propertyKey);
                                if (targetMetadata.size > 0) return true;
                                Metadata.delete(target);
                                return true;
                            }
                            exporter('deleteMetadata', deleteMetadata);
                            function DecorateConstructor(decorators, target) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i];
                                    var decorated = decorator(target);
                                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                                        if (!IsConstructor(decorated)) throw new TypeError();
                                        target = decorated;
                                    }
                                }
                                return target;
                            }
                            function DecorateProperty(decorators, target, propertyKey, descriptor) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i];
                                    var decorated = decorator(target, propertyKey, descriptor);
                                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                                        if (!IsObject(decorated)) throw new TypeError();
                                        descriptor = decorated;
                                    }
                                }
                                return descriptor;
                            }
                            function GetOrCreateMetadataMap(O, P, Create) {
                                var targetMetadata = Metadata.get(O);
                                if (IsUndefined(targetMetadata)) {
                                    if (!Create) return undefined;
                                    targetMetadata = new _Map();
                                    Metadata.set(O, targetMetadata);
                                }
                                var metadataMap = targetMetadata.get(P);
                                if (IsUndefined(metadataMap)) {
                                    if (!Create) return undefined;
                                    metadataMap = new _Map();
                                    targetMetadata.set(P, metadataMap);
                                }
                                return metadataMap;
                            }
                            // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
                            function OrdinaryHasMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return true;
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
                                return false;
                            }
                            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
                            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return false;
                                return ToBoolean(metadataMap.has(MetadataKey));
                            }
                            // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
                            function OrdinaryGetMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
                                return undefined;
                            }
                            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
                            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return undefined;
                                return metadataMap.get(MetadataKey);
                            }
                            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
                            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
                                metadataMap.set(MetadataKey, MetadataValue);
                            }
                            // 3.1.6.1 OrdinaryMetadataKeys(O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
                            function OrdinaryMetadataKeys(O, P) {
                                var ownKeys = OrdinaryOwnMetadataKeys(O, P);
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (parent === null) return ownKeys;
                                var parentKeys = OrdinaryMetadataKeys(parent, P);
                                if (parentKeys.length <= 0) return ownKeys;
                                if (ownKeys.length <= 0) return parentKeys;
                                var set = new _Set();
                                var keys = [];
                                for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                                    var key = ownKeys_1[_i];
                                    var hasKey = set.has(key);
                                    if (!hasKey) {
                                        set.add(key);
                                        keys.push(key);
                                    }
                                }
                                for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                                    var key = parentKeys_1[_a];
                                    var hasKey = set.has(key);
                                    if (!hasKey) {
                                        set.add(key);
                                        keys.push(key);
                                    }
                                }
                                return keys;
                            }
                            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
                            function OrdinaryOwnMetadataKeys(O, P) {
                                var keys = [];
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return keys;
                                var keysObj = metadataMap.keys();
                                var iterator = GetIterator(keysObj);
                                var k = 0;
                                while (true) {
                                    var next = IteratorStep(iterator);
                                    if (!next) {
                                        keys.length = k;
                                        return keys;
                                    }
                                    var nextValue = IteratorValue(next);
                                    try {
                                        keys[k] = nextValue;
                                    } catch (e) {
                                        try {
                                            IteratorClose(iterator);
                                        } finally {
                                            throw e;
                                        }
                                    }
                                    k++;
                                }
                            }
                            // 6 ECMAScript Data Typ0es and Values
                            // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
                            function Type(x) {
                                if (x === null) return 1 /* Null */;
                                switch (typeof x) {
                                    case 'undefined':
                                        return 0 /* Undefined */;
                                    case 'boolean':
                                        return 2 /* Boolean */;
                                    case 'string':
                                        return 3 /* String */;
                                    case 'symbol':
                                        return 4 /* Symbol */;
                                    case 'number':
                                        return 5 /* Number */;
                                    case 'object':
                                        return x === null ? 1 /* Null */ : 6 /* Object */;
                                    default:
                                        return 6 /* Object */;
                                }
                            }
                            // 6.1.1 The Undefined Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
                            function IsUndefined(x) {
                                return x === undefined;
                            }
                            // 6.1.2 The Null Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
                            function IsNull(x) {
                                return x === null;
                            }
                            // 6.1.5 The Symbol Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
                            function IsSymbol(x) {
                                return typeof x === 'symbol';
                            }
                            // 6.1.7 The Object Type
                            // https://tc39.github.io/ecma262/#sec-object-type
                            function IsObject(x) {
                                return typeof x === 'object' ? x !== null : typeof x === 'function';
                            }
                            // 7.1 Type Conversion
                            // https://tc39.github.io/ecma262/#sec-type-conversion
                            // 7.1.1 ToPrimitive(input [, PreferredType])
                            // https://tc39.github.io/ecma262/#sec-toprimitive
                            function ToPrimitive(input, PreferredType) {
                                switch (Type(input)) {
                                    case 0 /* Undefined */:
                                        return input;
                                    case 1 /* Null */:
                                        return input;
                                    case 2 /* Boolean */:
                                        return input;
                                    case 3 /* String */:
                                        return input;
                                    case 4 /* Symbol */:
                                        return input;
                                    case 5 /* Number */:
                                        return input;
                                }
                                var hint =
                                    PreferredType === 3 /* String */
                                        ? 'string'
                                        : PreferredType === 5 /* Number */
                                          ? 'number'
                                          : 'default';
                                var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
                                if (exoticToPrim !== undefined) {
                                    var result = exoticToPrim.call(input, hint);
                                    if (IsObject(result)) throw new TypeError();
                                    return result;
                                }
                                return OrdinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
                            }
                            // 7.1.1.1 OrdinaryToPrimitive(O, hint)
                            // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
                            function OrdinaryToPrimitive(O, hint) {
                                if (hint === 'string') {
                                    var toString_1 = O.toString;
                                    if (IsCallable(toString_1)) {
                                        var result = toString_1.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                    var valueOf = O.valueOf;
                                    if (IsCallable(valueOf)) {
                                        var result = valueOf.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                } else {
                                    var valueOf = O.valueOf;
                                    if (IsCallable(valueOf)) {
                                        var result = valueOf.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                    var toString_2 = O.toString;
                                    if (IsCallable(toString_2)) {
                                        var result = toString_2.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                }
                                throw new TypeError();
                            }
                            // 7.1.2 ToBoolean(argument)
                            // https://tc39.github.io/ecma262/2016/#sec-toboolean
                            function ToBoolean(argument) {
                                return !!argument;
                            }
                            // 7.1.12 ToString(argument)
                            // https://tc39.github.io/ecma262/#sec-tostring
                            function ToString(argument) {
                                return '' + argument;
                            }
                            // 7.1.14 ToPropertyKey(argument)
                            // https://tc39.github.io/ecma262/#sec-topropertykey
                            function ToPropertyKey(argument) {
                                var key = ToPrimitive(argument, 3 /* String */);
                                if (IsSymbol(key)) return key;
                                return ToString(key);
                            }
                            // 7.2 Testing and Comparison Operations
                            // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
                            // 7.2.2 IsArray(argument)
                            // https://tc39.github.io/ecma262/#sec-isarray
                            function IsArray(argument) {
                                return Array.isArray
                                    ? Array.isArray(argument)
                                    : argument instanceof Object
                                      ? argument instanceof Array
                                      : Object.prototype.toString.call(argument) === '[object Array]';
                            }
                            // 7.2.3 IsCallable(argument)
                            // https://tc39.github.io/ecma262/#sec-iscallable
                            function IsCallable(argument) {
                                // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
                                return typeof argument === 'function';
                            }
                            // 7.2.4 IsConstructor(argument)
                            // https://tc39.github.io/ecma262/#sec-isconstructor
                            function IsConstructor(argument) {
                                // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
                                return typeof argument === 'function';
                            }
                            // 7.2.7 IsPropertyKey(argument)
                            // https://tc39.github.io/ecma262/#sec-ispropertykey
                            function IsPropertyKey(argument) {
                                switch (Type(argument)) {
                                    case 3 /* String */:
                                        return true;
                                    case 4 /* Symbol */:
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                            // 7.3 Operations on Objects
                            // https://tc39.github.io/ecma262/#sec-operations-on-objects
                            // 7.3.9 GetMethod(V, P)
                            // https://tc39.github.io/ecma262/#sec-getmethod
                            function GetMethod(V, P) {
                                var func = V[P];
                                if (func === undefined || func === null) return undefined;
                                if (!IsCallable(func)) throw new TypeError();
                                return func;
                            }
                            // 7.4 Operations on Iterator Objects
                            // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
                            function GetIterator(obj) {
                                var method = GetMethod(obj, iteratorSymbol);
                                if (!IsCallable(method)) throw new TypeError(); // from Call
                                var iterator = method.call(obj);
                                if (!IsObject(iterator)) throw new TypeError();
                                return iterator;
                            }
                            // 7.4.4 IteratorValue(iterResult)
                            // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
                            function IteratorValue(iterResult) {
                                return iterResult.value;
                            }
                            // 7.4.5 IteratorStep(iterator)
                            // https://tc39.github.io/ecma262/#sec-iteratorstep
                            function IteratorStep(iterator) {
                                var result = iterator.next();
                                return result.done ? false : result;
                            }
                            // 7.4.6 IteratorClose(iterator, completion)
                            // https://tc39.github.io/ecma262/#sec-iteratorclose
                            function IteratorClose(iterator) {
                                var f = iterator['return'];
                                if (f) f.call(iterator);
                            }
                            // 9.1 Ordinary Object Internal Methods and Internal Slots
                            // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
                            // 9.1.1.1 OrdinaryGetPrototypeOf(O)
                            // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
                            function OrdinaryGetPrototypeOf(O) {
                                var proto = Object.getPrototypeOf(O);
                                if (typeof O !== 'function' || O === functionPrototype) return proto;
                                // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
                                // Try to determine the superclass constructor. Compatible implementations
                                // must either set __proto__ on a subclass constructor to the superclass constructor,
                                // or ensure each class has a valid `constructor` property on its prototype that
                                // points back to the constructor.
                                // If this is not the same as Function.[[Prototype]], then this is definately inherited.
                                // This is the case when in ES6 or when using __proto__ in a compatible browser.
                                if (proto !== functionPrototype) return proto;
                                // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
                                var prototype = O.prototype;
                                var prototypeProto = prototype && Object.getPrototypeOf(prototype);
                                if (prototypeProto == null || prototypeProto === Object.prototype) return proto;
                                // If the constructor was not a function, then we cannot determine the heritage.
                                var constructor = prototypeProto.constructor;
                                if (typeof constructor !== 'function') return proto;
                                // If we have some kind of self-reference, then we cannot determine the heritage.
                                if (constructor === O) return proto;
                                // we have a pretty good guess at the heritage.
                                return constructor;
                            }
                            // naive Map shim
                            function CreateMapPolyfill() {
                                var cacheSentinel = {};
                                var arraySentinel = [];
                                var MapIterator = /** @class */ (function () {
                                    function MapIterator(keys, values, selector) {
                                        this._index = 0;
                                        this._keys = keys;
                                        this._values = values;
                                        this._selector = selector;
                                    }
                                    MapIterator.prototype['@@iterator'] = function () {
                                        return this;
                                    };
                                    MapIterator.prototype[iteratorSymbol] = function () {
                                        return this;
                                    };
                                    MapIterator.prototype.next = function () {
                                        var index = this._index;
                                        if (index >= 0 && index < this._keys.length) {
                                            var result = this._selector(this._keys[index], this._values[index]);
                                            if (index + 1 >= this._keys.length) {
                                                this._index = -1;
                                                this._keys = arraySentinel;
                                                this._values = arraySentinel;
                                            } else {
                                                this._index++;
                                            }
                                            return { value: result, done: false };
                                        }
                                        return { value: undefined, done: true };
                                    };
                                    MapIterator.prototype.throw = function (error) {
                                        if (this._index >= 0) {
                                            this._index = -1;
                                            this._keys = arraySentinel;
                                            this._values = arraySentinel;
                                        }
                                        throw error;
                                    };
                                    MapIterator.prototype.return = function (value) {
                                        if (this._index >= 0) {
                                            this._index = -1;
                                            this._keys = arraySentinel;
                                            this._values = arraySentinel;
                                        }
                                        return { value: value, done: true };
                                    };
                                    return MapIterator;
                                })();
                                return /** @class */ (function () {
                                    function Map() {
                                        this._keys = [];
                                        this._values = [];
                                        this._cacheKey = cacheSentinel;
                                        this._cacheIndex = -2;
                                    }
                                    Object.defineProperty(Map.prototype, 'size', {
                                        get: function () {
                                            return this._keys.length;
                                        },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                    Map.prototype.has = function (key) {
                                        return this._find(key, /*insert*/ false) >= 0;
                                    };
                                    Map.prototype.get = function (key) {
                                        var index = this._find(key, /*insert*/ false);
                                        return index >= 0 ? this._values[index] : undefined;
                                    };
                                    Map.prototype.set = function (key, value) {
                                        var index = this._find(key, /*insert*/ true);
                                        this._values[index] = value;
                                        return this;
                                    };
                                    Map.prototype.delete = function (key) {
                                        var index = this._find(key, /*insert*/ false);
                                        if (index >= 0) {
                                            var size = this._keys.length;
                                            for (var i = index + 1; i < size; i++) {
                                                this._keys[i - 1] = this._keys[i];
                                                this._values[i - 1] = this._values[i];
                                            }
                                            this._keys.length--;
                                            this._values.length--;
                                            if (key === this._cacheKey) {
                                                this._cacheKey = cacheSentinel;
                                                this._cacheIndex = -2;
                                            }
                                            return true;
                                        }
                                        return false;
                                    };
                                    Map.prototype.clear = function () {
                                        this._keys.length = 0;
                                        this._values.length = 0;
                                        this._cacheKey = cacheSentinel;
                                        this._cacheIndex = -2;
                                    };
                                    Map.prototype.keys = function () {
                                        return new MapIterator(this._keys, this._values, getKey);
                                    };
                                    Map.prototype.values = function () {
                                        return new MapIterator(this._keys, this._values, getValue);
                                    };
                                    Map.prototype.entries = function () {
                                        return new MapIterator(this._keys, this._values, getEntry);
                                    };
                                    Map.prototype['@@iterator'] = function () {
                                        return this.entries();
                                    };
                                    Map.prototype[iteratorSymbol] = function () {
                                        return this.entries();
                                    };
                                    Map.prototype._find = function (key, insert) {
                                        if (this._cacheKey !== key) {
                                            this._cacheIndex = this._keys.indexOf((this._cacheKey = key));
                                        }
                                        if (this._cacheIndex < 0 && insert) {
                                            this._cacheIndex = this._keys.length;
                                            this._keys.push(key);
                                            this._values.push(undefined);
                                        }
                                        return this._cacheIndex;
                                    };
                                    return Map;
                                })();
                                function getKey(key, _) {
                                    return key;
                                }
                                function getValue(_, value) {
                                    return value;
                                }
                                function getEntry(key, value) {
                                    return [key, value];
                                }
                            }
                            // naive Set shim
                            function CreateSetPolyfill() {
                                return /** @class */ (function () {
                                    function Set() {
                                        this._map = new _Map();
                                    }
                                    Object.defineProperty(Set.prototype, 'size', {
                                        get: function () {
                                            return this._map.size;
                                        },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                    Set.prototype.has = function (value) {
                                        return this._map.has(value);
                                    };
                                    Set.prototype.add = function (value) {
                                        return this._map.set(value, value), this;
                                    };
                                    Set.prototype.delete = function (value) {
                                        return this._map.delete(value);
                                    };
                                    Set.prototype.clear = function () {
                                        this._map.clear();
                                    };
                                    Set.prototype.keys = function () {
                                        return this._map.keys();
                                    };
                                    Set.prototype.values = function () {
                                        return this._map.values();
                                    };
                                    Set.prototype.entries = function () {
                                        return this._map.entries();
                                    };
                                    Set.prototype['@@iterator'] = function () {
                                        return this.keys();
                                    };
                                    Set.prototype[iteratorSymbol] = function () {
                                        return this.keys();
                                    };
                                    return Set;
                                })();
                            }
                            // naive WeakMap shim
                            function CreateWeakMapPolyfill() {
                                var UUID_SIZE = 16;
                                var keys = HashMap.create();
                                var rootKey = CreateUniqueKey();
                                return /** @class */ (function () {
                                    function WeakMap() {
                                        this._key = CreateUniqueKey();
                                    }
                                    WeakMap.prototype.has = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? HashMap.has(table, this._key) : false;
                                    };
                                    WeakMap.prototype.get = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? HashMap.get(table, this._key) : undefined;
                                    };
                                    WeakMap.prototype.set = function (target, value) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                                        table[this._key] = value;
                                        return this;
                                    };
                                    WeakMap.prototype.delete = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? delete table[this._key] : false;
                                    };
                                    WeakMap.prototype.clear = function () {
                                        // NOTE: not a real clear, just makes the previous data unreachable
                                        this._key = CreateUniqueKey();
                                    };
                                    return WeakMap;
                                })();
                                function CreateUniqueKey() {
                                    var key;
                                    do key = '@@WeakMap@@' + CreateUUID();
                                    while (HashMap.has(keys, key));
                                    keys[key] = true;
                                    return key;
                                }
                                function GetOrCreateWeakMapTable(target, create) {
                                    if (!hasOwn.call(target, rootKey)) {
                                        if (!create) return undefined;
                                        Object.defineProperty(target, rootKey, { value: HashMap.create() });
                                    }
                                    return target[rootKey];
                                }
                                function FillRandomBytes(buffer, size) {
                                    for (var i = 0; i < size; ++i) buffer[i] = (Math.random() * 0xff) | 0;
                                    return buffer;
                                }
                                function GenRandomBytes(size) {
                                    if (typeof Uint8Array === 'function') {
                                        if (typeof crypto !== 'undefined')
                                            return crypto.getRandomValues(new Uint8Array(size));
                                        if (typeof msCrypto !== 'undefined')
                                            return msCrypto.getRandomValues(new Uint8Array(size));
                                        return FillRandomBytes(new Uint8Array(size), size);
                                    }
                                    return FillRandomBytes(new Array(size), size);
                                }
                                function CreateUUID() {
                                    var data = GenRandomBytes(UUID_SIZE);
                                    // mark as random - RFC 4122 § 4.4
                                    data[6] = (data[6] & 0x4f) | 0x40;
                                    data[8] = (data[8] & 0xbf) | 0x80;
                                    var result = '';
                                    for (var offset = 0; offset < UUID_SIZE; ++offset) {
                                        var byte = data[offset];
                                        if (offset === 4 || offset === 6 || offset === 8) result += '-';
                                        if (byte < 16) result += '0';
                                        result += byte.toString(16).toLowerCase();
                                    }
                                    return result;
                                }
                            }
                            // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
                            function MakeDictionary(obj) {
                                obj.__ = undefined;
                                delete obj.__;
                                return obj;
                            }
                        });
                    })(Reflect || (Reflect = {}));

                    /***/
                },
                /* 4 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

                    /***/
                },
                /* 5 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

                    /***/
                },
                /* 6 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    var __classPrivateFieldGet =
                        (this && this.__classPrivateFieldGet) ||
                        function (receiver, privateMap) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to get private field on non-instance');
                            }
                            return privateMap.get(receiver);
                        };
                    var __classPrivateFieldSet =
                        (this && this.__classPrivateFieldSet) ||
                        function (receiver, privateMap, value) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to set private field on non-instance');
                            }
                            privateMap.set(receiver, value);
                            return value;
                        };
                    var _prefix, _suffix;
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.PathViewController = exports.AbstractPathViewController = void 0;
                    var model_and_view_1 = __webpack_require__(7);
                    var router_1 = __webpack_require__(9);
                    /**
                     * @interface module:dispatcher.Controller
                     */
                    /**
                     * @function module:dispatcher.Controller#handleRoute
                     * @param {module:router.Route} route
                     * @returns {module:dispatcher.ModelAndView}
                     */
                    var AbstractPathViewController = /** @class */ (function () {
                        function AbstractPathViewController() {}
                        Object.defineProperty(AbstractPathViewController.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'Controller';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        AbstractPathViewController.prototype.handleRoute = function (route) {
                            var viewName = this._getViewNameForRoute(route);
                            return new model_and_view_1.ModelAndView(viewName);
                        };
                        return AbstractPathViewController;
                    })();
                    exports.AbstractPathViewController = AbstractPathViewController;
                    /**
                     * ! Changing PathViewController._viewNameCache to PathViewController.#viewNameCache breaks unit tests. -JBR
                     */
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractPathViewController
                     * @implements module:dispatcher.Controller
                     */
                    /**
                     * @function module:dispatcher.AbstractPathViewController#handleRoute
                     * @param {module:router.Route} route
                     * @returns {module:dispatcher.ModelAndView}
                     */
                    /**
                     * @abstract
                     * @protected
                     * @function module:dispatcher.AbstractPathViewController#_getViewNameForRoute
                     * @param {module:router.Route} route
                     * @returns {external:string}
                     */
                    /**
                     * Simple {@linkcode module:dispatcher.Controller|Controller} implementation that transforms the path of a route into a view name.
                     * Can optionaly prepend a prefix and/or append a suffix a build the view name from the path.
                     * @class module:dispatcher.PathViewController
                     * @extends module:dispatcher.AbstractPathViewController
                     */
                    var PathViewController = /** @class */ (function (_super) {
                        __extends(PathViewController, _super);
                        function PathViewController() {
                            var _this = _super.call(this) || this;
                            _prefix.set(_this, void 0);
                            _suffix.set(_this, void 0);
                            _this._viewNameCache = new Map();
                            /**
                             * @member {external:string} module:dispatcher.PathViewController#prefix=''
                             */
                            _this.prefix = '';
                            /**
                             * @member {external:string} module:dispatcher.PathViewController#suffix=''
                             */
                            _this.suffix = '';
                            return _this;
                        }
                        Object.defineProperty(PathViewController.prototype, 'prefix', {
                            get: function () {
                                return __classPrivateFieldGet(this, _prefix);
                            },
                            set: function (newPrefix) {
                                this._viewNameCache.size && this._viewNameCache.clear();
                                __classPrivateFieldSet(this, _prefix, newPrefix);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(PathViewController.prototype, 'suffix', {
                            get: function () {
                                return __classPrivateFieldGet(this, _suffix);
                            },
                            set: function (newSuffix) {
                                this._viewNameCache.size && this._viewNameCache.clear();
                                __classPrivateFieldSet(this, _suffix, newSuffix);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @protected
                         * @function module:dispatcher.PathViewController#_getViewNameForRoute
                         * @param {module:router.Route} route
                         * @returns {external:string}
                         */
                        PathViewController.prototype._getViewNameForRoute = function (route) {
                            return this._getViewNameForPath(route.path);
                        };
                        /**
                         * @protected
                         * @function module:dispatcher.PathViewController#_getViewNameForPath
                         * @param {external:string} path
                         * @returns {external:string}
                         */
                        PathViewController.prototype._getViewNameForPath = function (path) {
                            var viewName = this._viewNameCache.get(path);
                            if (!viewName) {
                                var route = new router_1.PathRoute(path);
                                viewName = '' + this.prefix + route.path + this.suffix;
                                this._viewNameCache.set(path, viewName);
                            }
                            return viewName;
                        };
                        return PathViewController;
                    })(AbstractPathViewController);
                    exports.PathViewController = PathViewController;
                    (_prefix = new WeakMap()), (_suffix = new WeakMap());

                    /***/
                },
                /* 7 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.ModelAndView = void 0;
                    var view_1 = __webpack_require__(8);
                    /**
                     * @class module:dispatcher.ModelAndView
                     */
                    var ModelAndView = /** @class */ (function () {
                        function ModelAndView(view, model) {
                            if (model === void 0) {
                                model = null;
                            }
                            if (typeof view === 'string') {
                                this.viewName = view;
                                this.view = null;
                            } else {
                                this.view = view;
                                if (view instanceof view_1.AbstractView) {
                                    this.viewName = view.name;
                                }
                            }
                            if (model) {
                                this.model = model;
                            }
                            /**
                             * @member {external:boolean} module:dispatcher.ModelAndView#hasView
                             */
                            /**
                             * @member {*} module:dispatcher.ModelAndView#model
                             */
                            /**
                             * @member {external:string} module:dispatcher.ModelAndView#viewName
                             */
                            /**
                             * @member {module:view.View} module:dispatcher.ModelAndView#view
                             */
                        }
                        Object.defineProperty(ModelAndView.prototype, 'hasView', {
                            get: function () {
                                return typeof this.viewName === 'string' || typeof this.view !== 'undefined';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(ModelAndView.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'ModelAndView:' + this.viewName;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return ModelAndView;
                    })();
                    exports.ModelAndView = ModelAndView;

                    /***/
                },
                /* 8 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__8__;

                    /***/
                },
                /* 9 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__9__;

                    /***/
                },
                /* 10 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.BrowserDispatcher = void 0;
                    var core_1 = __webpack_require__(5);
                    var error_1 = __webpack_require__(11);
                    var route_handler_execution_chain_1 = __webpack_require__(12);
                    var route_handler_adapter_strategy_1 = __webpack_require__(13);
                    var route_handler_mapping_strategy_1 = __webpack_require__(19);
                    var language_resolver_strategy_1 = __webpack_require__(24);
                    var route_to_view_name_translator_strategy_1 = __webpack_require__(26);
                    var theme_resolver_strategy_1 = __webpack_require__(28);
                    var route_error_resolver_strategy_1 = __webpack_require__(30);
                    var view_resolver_strategy_1 = __webpack_require__(33);
                    var strategy_initializer_1 = __webpack_require__(34);
                    /**
                     * An interface for creating application dispatchers. Dispatches to registered handlers for processing a route, providing convenient mapping and exception handling facilities.
                     *
                     * It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.
                     * @interface module:router.RouteDispatcher
                     */
                    /**
                     * Initialize the strategy objects that this dispatcher uses.
                     * @function module:router.RouteDispatcher#initStrategies
                     * @param {module:core.ApplicationContext} context
                     */
                    /**
                     * Process the route by dispatching to the handler.
                     * @function module:router.RouteDispatcher#dispatch
                     * @param {module:router.Route} route
                     * @returns {external:Promise}
                     */
                    /**
                     * @interface module:router.RouteRenderer
                     */
                    /**
                     * @function module:router.RouteRenderer#render
                     * @param {module:dispatcher.ModelAndView} mv
                     * @param {module:router.Route} route
                     * @returns {external:Promise}
                     */
                    /**
                     * Dispatcher for brower-based handlers.
                     * * It can use any {@linkcode module:router.RouteHandlerMapping|RouteHandlerMapping} implementation - pre-built or provided as part of an application - to control the routing of routes to handlers. Default is {@linkcode module:dispatcher.NamePathHandlerMapping|NamePathHandlerMapping} and {@linkcode module:dispatcher.MetadataHandlerMapping|MetadataHandlerMapping}. HandlerMapping objects can be defined as values in the application context, implementing the HandlerMapping interface, overriding the default HandlerMapping if present. HandlerMappings can be given any value name.
                     * * It can use any {@linkcode module:dispatcher.HandlerAdapter|HandlerAdapter}; this allows for using any handler interface. Default adapters are {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter}, {@linkcode module:dispatcher.ControllerHandlerAdapter|ControllerHandlerAdapter}, for {@linkcode module:router.RouteMappingHandler|RouteMappingHandler} and {@linkcode module:dispatcher.Controller|Controller} interfaces, respectively. A default {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter} will be registered as well. RouteHandlerAdapter objects can be added as values in the application context, overriding the default RouteHandlerAdapters. Like HandlerMappings, RouteHandlerAdapters can be given any name.
                     * * The dispatcher's error resolution strategy can be specified via a {@linkcode module:router.RouteHandlerErrorResolver|HandlerErrorResolver}, for example mapping certain exceptions to error pages. Default is {@linkcode module:dispatcher.DefaultRouteHandlerErrorResolver|DefaultRouteHandlerErrorResolver}. HandlerErrorResolvers can be overridden through the application context. HandlerErrorResolver can be given any name.
                     * * Its view resolution strategy can be specified via a {@linkcode module:view.ViewResolver|ViewResolver} implementation, resolving symbolic view names into {@linkcode module:view.View|View} objects. Default is {@linkcode module:dispatcher.InternalResourceViewResolver|InternalResourceViewResolver}. ViewResolver objects can be added as values in the application context, overriding the default ViewResolver. ViewResolvers can be given any name.
                     * * Its language resolution strategy is determined by a {@linkcode module:dispatcher.LanguageResolver|LanguageResolver}. The out-of-the-box implementation works via {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Navigator|navigator} object. The LanguageResolver name is "languageResolver"; default is {@linkcode module:dispatcher.NavigatorLanguageResolver|NavigatorLanguageResolver}.
                     * * Its theme resolution strategy is determined by a {@linkcode module:dispatcher.ThemeResolver|ThemeResolver}. Implementations for a fixed theme and cookie resolved theme are included. The ThemeResolver name is "themeResolver"; default is {@linkcode module:dispatcher.FixedThemeResolver|FixedThemeResolver}.
                     * @class module:dispatcher.BrowserDispatcher
                     * @implements module:router.RouteDispatcher
                     * @implements module:router.RouteRenderer
                     * @mixes module:dispatcher.AsRouteHandlerAdapterStrategy
                     * @mixes module:dispatcher.AsRouteHandlerMappingStrategy
                     * @mixes module:dispatcher.AsRouteErrorResolverStrategy
                     * @mixes module:dispatcher.AsLanguageResolverStrategy
                     * @mixes module:dispatcher.AsRouteToViewNameTranslatorStrategy
                     * @mixes module:dispatcher.AsThemeResolverStrategy
                     * @mixes module:dispatcher.AsViewMappingStrategy
                     * @mixes module:dispatcher.AsViewResolverStrategy
                     */
                    var BrowserDispatcher = /** @class */ (function (_super) {
                        __extends(BrowserDispatcher, _super);
                        function BrowserDispatcher() {
                            var _this = (_super !== null && _super.apply(this, arguments)) || this;
                            _this.defaultViewName = 'index';
                            return _this;
                        }
                        Object.defineProperty(BrowserDispatcher.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'BrowserDispatcher';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        BrowserDispatcher.prototype.dispatch = function (route) {
                            return __awaiter(this, void 0, Promise, function () {
                                var dispatchError, mappedHandler, mv, handlerAdapter, error_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            (dispatchError = null), (mappedHandler = null), (mv = null);
                                            console.log('Dispatcher::dispatch', route);
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            mappedHandler = this.getHandler(route);
                                            console.log('- Dispatcher::Mapped Handler', mappedHandler);
                                            if (!mappedHandler) {
                                                throw new error_1.NoHandlerFoundError(route);
                                            }
                                            handlerAdapter = this.getHandlerAdapter(mappedHandler.handler);
                                            console.log('- Dispatcher::Handler Adapter', handlerAdapter);
                                            if (mappedHandler.applyPreHandle(route) === false) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, handlerAdapter.handle(route, mappedHandler.handler)];
                                        case 2:
                                            mv = _a.sent();
                                            this._applyDefaultViewName(route, mv);
                                            mappedHandler.applyPostHandle(route, mv);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_2 = _a.sent();
                                            dispatchError = error_2;
                                            return [3 /*break*/, 4];
                                        case 4:
                                            return [
                                                2 /*return*/,
                                                this._processDispatchResult(
                                                    route,
                                                    mappedHandler,
                                                    mv,
                                                    dispatchError
                                                ).catch(function (error) {
                                                    mappedHandler === null || mappedHandler === void 0
                                                        ? void 0
                                                        : mappedHandler.triggerCompleteHandle(route, error);
                                                    // TODO Using logging system
                                                    console.log(error);
                                                }),
                                            ];
                                    }
                                });
                            });
                        };
                        /**
                         * Render the given `ModelAndView`. This is the last stage of handling a route.
                         * @function module:dispatcher.BrowserDispatcher#render
                         * @param {module:dispatcher.ModelAndView} mv
                         * @param {module:router.Route} route
                         * @returns {external:Promise}
                         */
                        BrowserDispatcher.prototype.render = function (mv, route) {
                            return __awaiter(this, void 0, Promise, function () {
                                var language, viewName, view;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('Dispatcher::render', mv, route);
                                            (language = this.languageResolver
                                                ? this.languageResolver.resolveLanguage(route)
                                                : ''),
                                                (viewName = mv.viewName);
                                            if (!viewName) return [3 /*break*/, 2];
                                            console.log('Dispatcher::render::viewName', viewName);
                                            return [4 /*yield*/, this._resolveViewName(viewName, language)];
                                        case 1:
                                            view = _a.sent();
                                            if (!view) {
                                                throw new error_1.NoViewFoundError(viewName, route);
                                            }
                                            return [3 /*break*/, 3];
                                        case 2:
                                            view = mv.view;
                                            if (!view) {
                                                throw new error_1.NoViewFoundError(viewName, route);
                                            }
                                            _a.label = 3;
                                        case 3:
                                            try {
                                                view.render(mv, route);
                                            } catch (e) {
                                                // TODO ADD A REAL CATCH BLOCK
                                                console.log('UNABLE TO RENDER');
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        BrowserDispatcher.prototype._processHandlerError = function (route, handler, error) {
                            var mav = null;
                            console.log('Dispatcher::_processHandlerError', route, handler, error.message);
                            this.errorResolvers.some(function (resolver) {
                                mav = resolver.resolveError(route, handler, error);
                                console.log('Dispatcher::_processHandlerError::resolver', resolver, mav);
                                return !!mav;
                            });
                            if (mav) {
                                if (!mav.view && !mav.viewName) {
                                    mav.viewName = this.defaultViewName;
                                }
                                return mav;
                            }
                            throw new TypeError('view name is undefined');
                        };
                        BrowserDispatcher.prototype._resolveViewName = function (viewName, language) {
                            return __awaiter(this, void 0, Promise, function () {
                                var index, view, length;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('Dispatcher::resolveViewName', viewName, language);
                                            (index = 0), (view = null);
                                            length = this.viewResolvers.length;
                                            _a.label = 1;
                                        case 1:
                                            if (!(index < length)) return [3 /*break*/, 4];
                                            return [
                                                4 /*yield*/,
                                                this.viewResolvers[index].resolveViewName(viewName, language),
                                            ];
                                        case 2:
                                            view = _a.sent();
                                            if (view) {
                                                return [2 /*return*/, view];
                                            }
                                            _a.label = 3;
                                        case 3:
                                            index++;
                                            return [3 /*break*/, 1];
                                        case 4:
                                            return [2 /*return*/, view];
                                    }
                                });
                            });
                        };
                        BrowserDispatcher.prototype._applyDefaultViewName = function (route, mv) {
                            console.log('Dispatcher::_applyDefaultViewName', route, mv);
                            if (mv && !mv.hasView) {
                                var defaultViewName = this.getDefaultViewName(route);
                                if (defaultViewName) {
                                    mv.viewName = defaultViewName;
                                }
                            }
                        };
                        BrowserDispatcher.prototype._processDispatchResult = function (
                            route,
                            mappedHandler,
                            mv,
                            error
                        ) {
                            return __awaiter(this, void 0, Promise, function () {
                                var handler, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log(
                                                'Dispatcher::_processDispatchResult',
                                                route,
                                                mappedHandler,
                                                mv,
                                                error && error.message
                                            );
                                            if (error) {
                                                handler =
                                                    mappedHandler instanceof route_handler_execution_chain_1.default
                                                        ? mappedHandler.handler
                                                        : null;
                                                mv = this._processHandlerError(route, handler, error);
                                            }
                                            if (!mv) return [3 /*break*/, 4];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, this.render(mv, route)];
                                        case 2:
                                            _a.sent();
                                            mappedHandler !== null && mappedHandler !== void 0
                                                ? mappedHandler
                                                : mappedHandler.triggerCompleteHandle(route, null);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_1 = _a.sent();
                                            // TODO Better error handling. Use logger.
                                            console.error(e_1);
                                            return [3 /*break*/, 4];
                                        case 4:
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return BrowserDispatcher;
                    })(
                        view_resolver_strategy_1.AsViewResolverStrategy(
                            route_error_resolver_strategy_1.AsRouteErrorResolverStrategy(
                                theme_resolver_strategy_1.AsThemeResolverStrategy(
                                    route_to_view_name_translator_strategy_1.AsRouteToViewNameTranslatorStrategy(
                                        language_resolver_strategy_1.AsLanguageResolverStrategy(
                                            route_handler_mapping_strategy_1.AsRouteHandlerMappingStrategy(
                                                route_handler_adapter_strategy_1.AsRouteHandlerAdapterStrategy(
                                                    strategy_initializer_1.AsStrategyInitializer(core_1.Null)
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    );
                    exports.BrowserDispatcher = BrowserDispatcher;
                    /**
                     * * Developer Notes
                     * ? Should abstract classes be created?
                     * Two abstract classes could be derived from BrowserDispatcher, an AbstractRouteDispatcher and an AbstractRouteRenderer. Then BrowserDispatcher would extend those two classes and provide
                     * an implementation of _processDispatchResult which would unify the two abstract classes.
                     *
                     * ? Should EventEmitter be used?
                     * There should either be an Event-based implementation of Dispatcher that mixes in AsEventEmitter or that should be intrisic to BrowserDispatcher itself. This would allow Dispatcher to emit
                     * lifecycle events similar to today's sysytem. There could even be an event-based implementation of RouteHandlerInterceptors; however currently if a RouteHandlerInterceptor preHandle returns false, handler
                     * execution stops. That may not be possible with an event based system without enhancements to Emitter.
                     */

                    /***/
                },
                /* 11 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.RouteBindingError = exports.NoViewFoundError = exports.NoHandlerFoundError = void 0;
                    var core_1 = __webpack_require__(5);
                    var util_1 = __webpack_require__(4);
                    var defineProperty = Reflect.defineProperty;
                    /**
                     * @class module:dispatcher.NoHandlerFoundError
                     * @extends module:core.FrameworkError
                     */
                    var NoHandlerFoundError = /** @class */ (function (_super) {
                        __extends(NoHandlerFoundError, _super);
                        function NoHandlerFoundError(route) {
                            var _this = _super.call(this, 'No handler found for route "' + route.path + '"') || this;
                            defineProperty(_this, 'route', {
                                value: route,
                                configurable: false,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(NoHandlerFoundError.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'NoHandlerFoundError';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return NoHandlerFoundError;
                    })(core_1.FrameworkError);
                    exports.NoHandlerFoundError = NoHandlerFoundError;
                    /**
                     * @class module:dispatcher.NoViewFoundError
                     * @extends module:core.FrameworkError
                     */
                    var NoViewFoundError = /** @class */ (function (_super) {
                        __extends(NoViewFoundError, _super);
                        function NoViewFoundError(viewName, route) {
                            var _this =
                                _super.call(
                                    this,
                                    'Could not resolve view with name "' + viewName + '" for route "' + route.path + '"'
                                ) || this;
                            defineProperty(_this, 'route', {
                                value: route,
                                configurable: false,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(_this, 'viewName', {
                                value: viewName,
                                configurable: false,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(NoViewFoundError.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'NoViewFoundError';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return NoViewFoundError;
                    })(core_1.FrameworkError);
                    exports.NoViewFoundError = NoViewFoundError;
                    /**
                     * An error that represents a failure to retrieve a required {@linkcode module:router.Route|Route} property.
                     * @class module:dispatcher.RouteBindingError
                     * @extends module:core.FrameworkError
                     */
                    var RouteBindingError = /** @class */ (function (_super) {
                        __extends(RouteBindingError, _super);
                        function RouteBindingError(routeOrMessage, name) {
                            var _this = this;
                            if (util_1.isString(routeOrMessage)) {
                                _this = _super.call(this, routeOrMessage) || this;
                                defineProperty(_this, 'route', {
                                    value: null,
                                    configurable: false,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(_this, 'name', {
                                    value: null,
                                    configurable: false,
                                    enumerable: false,
                                    writable: false,
                                });
                            } else {
                                _this =
                                    _super.call(
                                        this,
                                        'Unable to bind "' + name + '" for route "' + routeOrMessage.path + '"'
                                    ) || this;
                                defineProperty(_this, 'route', {
                                    value: routeOrMessage,
                                    configurable: false,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(_this, 'name', {
                                    value: name,
                                    configurable: false,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                            return _this;
                        }
                        Object.defineProperty(RouteBindingError.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'RouteBindingError';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return RouteBindingError;
                    })(core_1.FrameworkError);
                    exports.RouteBindingError = RouteBindingError;

                    /***/
                },
                /* 12 */
                /***/ function (__unused_webpack_module, exports) {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldSet =
                        (this && this.__classPrivateFieldSet) ||
                        function (receiver, privateMap, value) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to set private field on non-instance');
                            }
                            privateMap.set(receiver, value);
                            return value;
                        };
                    var __classPrivateFieldGet =
                        (this && this.__classPrivateFieldGet) ||
                        function (receiver, privateMap) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to get private field on non-instance');
                            }
                            return privateMap.get(receiver);
                        };
                    var _interceptors;
                    Object.defineProperty(exports, '__esModule', { value: true });
                    /**
                     * @class module:dispatcher.RouteHandlerExecutionChain
                     */
                    var RouteHandlerExecutionChain = /** @class */ (function () {
                        function RouteHandlerExecutionChain(handler, interceptors) {
                            if (interceptors === void 0) {
                                interceptors = null;
                            }
                            _interceptors.set(this, void 0);
                            __classPrivateFieldSet(this, _interceptors, null);
                            if (handler instanceof RouteHandlerExecutionChain) {
                                var chain = handler;
                                this.handler = chain.handler;
                                interceptors && this.addInterceptors(chain.interceptors);
                            } else {
                                this.handler = handler;
                                interceptors && this.addInterceptors(interceptors);
                            }
                            this.interceptorIndex = -1;
                        }
                        Object.defineProperty(
                            RouteHandlerExecutionChain.prototype,
                            ((_interceptors = new WeakMap()), Symbol.toStringTag),
                            {
                                get: function () {
                                    return 'HandlerExecutionChain';
                                },
                                enumerable: false,
                                configurable: true,
                            }
                        );
                        Object.defineProperty(RouteHandlerExecutionChain.prototype, 'interceptors', {
                            get: function () {
                                return __classPrivateFieldGet(this, _interceptors);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptor
                         * @param {module:router.RouteHandlerInterceptor} interceptor
                         */
                        RouteHandlerExecutionChain.prototype.addInterceptor = function (interceptor) {
                            if (interceptor) {
                                if (!__classPrivateFieldGet(this, _interceptors)) {
                                    __classPrivateFieldSet(this, _interceptors, []);
                                }
                                __classPrivateFieldGet(this, _interceptors).push(interceptor);
                            }
                        };
                        /**
                         * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptors
                         * @param {external:Array<module:router.RouteHandlerInterceptor>} interceptors
                         */
                        RouteHandlerExecutionChain.prototype.addInterceptors = function (interceptors) {
                            var length =
                                interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
                            if (length) {
                                for (var index = 0; index < length; index++) {
                                    this.addInterceptor(interceptors[index]);
                                }
                            }
                        };
                        /**
                         * @function module:dispatcher.RouteHandlerExecutionChain#applyPostHandle
                         * @param {module:router.Route} route
                         * @param {module:dispatcher.ModelAndView} mv
                         */
                        RouteHandlerExecutionChain.prototype.applyPostHandle = function (route, mv) {
                            var interceptors = __classPrivateFieldGet(this, _interceptors),
                                length =
                                    interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
                            var index = 0;
                            if (length) {
                                for (; index < length; index++) {
                                    interceptors[index].postHandle(route, this.handler, mv);
                                }
                            }
                        };
                        /**
                         * @function module:dispatcher.RouteHandlerExecutionChain#applyPreHandle
                         * @param {module:router.Route} route
                         */
                        RouteHandlerExecutionChain.prototype.applyPreHandle = function (route) {
                            var interceptors = __classPrivateFieldGet(this, _interceptors),
                                length =
                                    interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
                            var index = 0;
                            if (length) {
                                for (; index < length; index++) {
                                    if (interceptors[index].preHandle(route, this.handler) === false) {
                                        return false;
                                    }
                                    this.interceptorIndex = index;
                                }
                            }
                            return true;
                        };
                        /**
                         * @function module:dispatcher.RouteHandlerExecutionChain#triggerCompleteHandle
                         * @param {module:router.Route} route
                         * @param {external:Error} error
                         */
                        RouteHandlerExecutionChain.prototype.triggerCompleteHandle = function (route, error) {
                            if (error === void 0) {
                                error = null;
                            }
                            var interceptors = __classPrivateFieldGet(this, _interceptors),
                                length =
                                    interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
                            var index = 0;
                            if (length) {
                                for (; index < length; index++) {
                                    try {
                                        interceptors[index].completeHandle(route, this.handler, error);
                                    } catch (e) {
                                        // Handle this
                                    }
                                }
                            }
                        };
                        return RouteHandlerExecutionChain;
                    })();
                    exports.default = RouteHandlerExecutionChain;

                    /***/
                },
                /* 13 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsRouteHandlerAdapterStrategy = void 0;
                    var route_handler_adapter_1 = __webpack_require__(14);
                    /**
                     * @interface module:dispatcher.RouteHandlerAdapterStrategy
                     */
                    /**
                     * @member {external:Array<module:dispatcher.HandlerAdapter>} module:dispatcher.RouteHandlerAdapterStrategy#handlerAdapters
                     */
                    /**
                     * Initialize the handler adapters used by the class. If no handler adapters are defined, it defaults to {@linkcode module:dispatcher.ControllerHandlerAdapter|ControllerHandlerAdapter}.
                     * @function module:dispatcher.RouteHandlerAdapterStrategy#initHandlerAdapters
                     * @param {module:core.ApplicationContext} context
                     */
                    /**
                     * Return the handler adapter for the given handler.
                     * @function module:dispatcher.RouteHandlerAdapterStrategy#getHandlerAdapter
                     * @param {module:dispatcher.MaybeHandler} handler The handler to find an adapter for.
                     * @returns {module:dispatcher.HandlerAdapter} The adapter for the handler.
                     * @throws {external:Error} If no adapter can be found for the handler.
                     */
                    var defineProperty = Reflect.defineProperty,
                        HANDLER_ADAPTER = 'handlerAdapter',
                        HANDLER_ADAPTERS = HANDLER_ADAPTER + 's',
                        defaultRouteHandlerAdapters = [
                            new route_handler_adapter_1.ControllerHandlerAdapter(),
                            new route_handler_adapter_1.MetadataHandlerAdapter(),
                        ];
                    var AsRouteHandlerAdapterStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'handlerAdapterKey', {
                                    get: function () {
                                        return HANDLER_ADAPTER;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                defineProperty(_this, 'handlerAdapterCollectionKey', {
                                    get: function () {
                                        return HANDLER_ADAPTERS;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(HANDLER_ADAPTERS);
                                return _this;
                            }
                            class_1.prototype.initHandlerAdapters = function (context) {
                                var _a = this,
                                    handlerAdapterKey = _a.handlerAdapterKey,
                                    handlerAdapterCollectionKey = _a.handlerAdapterCollectionKey;
                                this.initCollectionStrategy(
                                    context,
                                    handlerAdapterCollectionKey,
                                    handlerAdapterKey,
                                    HANDLER_ADAPTERS,
                                    defaultRouteHandlerAdapters
                                );
                                console.log('Dispatcher::initHandlerAdapters', this.handlerAdapters);
                            };
                            class_1.prototype.getHandlerAdapter = function (handler) {
                                var handlerAdapter = this.handlerAdapters.find(function (handlerAdapter) {
                                    return handlerAdapter.supports(handler);
                                });
                                console.log('Dispatcher::getHandlerAdapter', handlerAdapter);
                                if (!handlerAdapter) {
                                    throw new Error('No handler adapter found for handler');
                                }
                                return handlerAdapter;
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsRouteHandlerAdapterStrategy = AsRouteHandlerAdapterStrategy;

                    /***/
                },
                /* 14 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.MetadataHandlerAdapter =
                        exports.ControllerHandlerAdapter =
                        exports.AbstractHandlerMethodAdapter =
                        exports.likeController =
                            void 0;
                    var util_1 = __webpack_require__(4);
                    var core_1 = __webpack_require__(5);
                    var factory_1 = __webpack_require__(15);
                    var route_handler_method_1 = __webpack_require__(16);
                    var context_1 = __webpack_require__(18);
                    var route_mapping_1 = __webpack_require__(17);
                    var argument_resolver_1 = __webpack_require__(1);
                    /**
                     * Interface that must be implemented for each handler type to handle a route. This interface is used to allow the {@link module:dispatcher.Dispatcher} to be extensible. The `Dispatcher` accesses all installed handlers through this interface, meaning that it does not contain code specific to any handler type.
                     *
                     * This interface is not intended for application developers. It is available to developers who want to create their own workflow.
                     * @interface module:dispatcher.HandlerAdapter
                     */
                    /**
                     * Use the given handler to handle this route.
                     * @function module:dispatcher.HandlerAdapter#handle
                     * @param {module:router.Route} route
                     * @param {*} handler The handler to use. It must have previously been passed to the `supports` method of this interface, which must have returned `true`.
                     * @returns {external:Promise<module:dispatcher.ModelAndView>}
                     */
                    /**
                     * Given a handler instance, return whether or not this `HandlerAdapter` can support it. Typical RouteHandlerAdapters will base the decision on the handler type. RouteHandlerAdapters will usually only support one handler type each.
                     * @function module:dispatcher.HandlerAdapter#supports
                     * @param {*} handler The handler to check
                     * @returns {external:boolean} Whether or not the given handler is supported
                     * @example
                     * class MyHandlerAdapter {
                     *  supports( handler ){
                     *      return handler instanceof MyHandler;
                     *  }
                     * }
                     */
                    var getPrototypeOf = Reflect.getPrototypeOf,
                        assign = Object.assign,
                        keys = Object.keys,
                        isNotArray = util_1.complement(Array.isArray);
                    /**
                     * @function module:dispatcher.likeController
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:dispatcher.Controller|Controller}
                     */
                    exports.likeController = util_1.like({ handleRoute: Function });
                    var AbstractHandlerMethodAdapter = /** @class */ (function (_super) {
                        __extends(AbstractHandlerMethodAdapter, _super);
                        function AbstractHandlerMethodAdapter() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(AbstractHandlerMethodAdapter.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'HandlerMethodAdapter';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        AbstractHandlerMethodAdapter.prototype.supports = function (handler) {
                            return (
                                handler instanceof route_handler_method_1.RouteHandlerMethod && this._supports(handler)
                            );
                        };
                        return AbstractHandlerMethodAdapter;
                    })(context_1.AsApplicationContextAware(core_1.Null));
                    exports.AbstractHandlerMethodAdapter = AbstractHandlerMethodAdapter;
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractHandlerMethodAdapter
                     * @implements module:dispatcher.HandlerAdapter
                     */
                    /**
                     * This implementation expects the handler to be a {@linkcode module:dispatcher.HandlerMethod|HandlerMethod}.
                     * @function module:dispatcher.AbstractHandlerMethodAdapter#supports
                     * @param handler The handler instance to check
                     * @returns Whether or not this adapter can adapt the given handler
                     */
                    /**
                     * @class module:dispatcher.ControllerHandlerAdapter
                     * @implements module:dispatcher.HandlerAdapter
                     */
                    var ControllerHandlerAdapter = /** @class */ (function () {
                        function ControllerHandlerAdapter() {}
                        Object.defineProperty(ControllerHandlerAdapter.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'ControllerHandlerAdapter';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        ControllerHandlerAdapter.prototype.handle = function (route, handler) {
                            return __awaiter(this, void 0, Promise, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            return [4 /*yield*/, handler.handleRoute(route)];
                                        case 1:
                                            return [2 /*return*/, _a.sent()];
                                    }
                                });
                            });
                        };
                        ControllerHandlerAdapter.prototype.supports = function (handler) {
                            return exports.likeController(handler);
                        };
                        return ControllerHandlerAdapter;
                    })();
                    exports.ControllerHandlerAdapter = ControllerHandlerAdapter;
                    /**
                     * Implementation of {@link module:dispatcher.AbstractHandlerMethodAdapter} that supports {@linkcode module:dispatcher.HandlerMethod|HandlerMethods} decorated with `route:mapping` metadata. This is usually applied using {@linkcode module:router.RouteMapping|@RouteMapping}.
                     * @class module:dispatcher.MetadataHandlerAdapter
                     * @extends module:dispatcher.AbstractHandlerMethodAdapter
                     * @implements module:core.Initializable
                     */
                    var MetadataHandlerAdapter = /** @class */ (function (_super) {
                        __extends(MetadataHandlerAdapter, _super);
                        function MetadataHandlerAdapter() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(MetadataHandlerAdapter.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'MetadataHandlerAdapter';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(MetadataHandlerAdapter.prototype, 'defaultArgumentResolvers', {
                            get: function () {
                                return [
                                    new argument_resolver_1.MatrixValueMethodArgumentResolver(),
                                    new argument_resolver_1.QueryValueMethodArgumentResolver(),
                                ];
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(MetadataHandlerAdapter.prototype, factory_1.$aware, {
                            get: function () {
                                return true;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MetadataHandlerAdapter.prototype.handle = function (route, handler) {
                            return __awaiter(this, void 0, Promise, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log('MetadataHandlerAdapter::handle', route, handler);
                                            handler.argumentResolvers = this.argumentResolvers;
                                            return [4 /*yield*/, handler.invoke(route)];
                                        case 1:
                                            return [2 /*return*/, _a.sent()];
                                    }
                                });
                            });
                        };
                        MetadataHandlerAdapter.prototype.init = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var applicationContext = this.applicationContext,
                                contextKeys = keys(applicationContext),
                                contextKeysLength = contextKeys.length,
                                handlers = [];
                            if (contextKeysLength) {
                                for (var contextKeyIndex = 0; contextKeyIndex < contextKeysLength; contextKeyIndex++) {
                                    var contextKey = contextKeys[contextKeyIndex],
                                        contextValue = applicationContext.getValue(contextKey);
                                    if (core_1.isNotPrimitive(contextValue)) {
                                        var valuePrototype = getPrototypeOf(contextValue),
                                            valueConstructor = valuePrototype.constructor;
                                        if (route_mapping_1.hasRouteMapping(valueConstructor)) {
                                            var constructorMapping = route_mapping_1.getRouteMapping(valueConstructor),
                                                valueKeys = keys(valuePrototype),
                                                valueKeysLength = valueKeys.length;
                                            if (valueKeysLength) {
                                                for (
                                                    var valueKeyIndex = 0;
                                                    valueKeyIndex < valueKeysLength;
                                                    valueKeyIndex++
                                                ) {
                                                    var valueKey = valueKeys[valueKeyIndex];
                                                    if (route_mapping_1.hasRouteMapping(valuePrototype, valueKey)) {
                                                        var methodMapping = route_mapping_1.getRouteMapping(
                                                                valuePrototype,
                                                                valueKey
                                                            ),
                                                            mapping = assign({}, constructorMapping, methodMapping);
                                                        mapping.path =
                                                            '' + constructorMapping.value + methodMapping.value;
                                                        handlers.push(mapping);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (isNotArray(this.argumentResolvers)) {
                                this.argumentResolvers = this.defaultArgumentResolvers;
                            }
                            this.handlers = handlers;
                        };
                        MetadataHandlerAdapter.prototype._supports = function (handler) {
                            return handler instanceof route_handler_method_1.RouteHandlerMethod;
                        };
                        return MetadataHandlerAdapter;
                    })(AbstractHandlerMethodAdapter);
                    exports.MetadataHandlerAdapter = MetadataHandlerAdapter;

                    /***/
                },
                /* 15 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__15__;

                    /***/
                },
                /* 16 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.ErrorHandlerMethod = exports.RouteHandlerMethod = void 0;
                    var factory_1 = __webpack_require__(15);
                    var util_1 = __webpack_require__(4);
                    var route_mapping_1 = __webpack_require__(17);
                    /**
                     * @interface module:dispatcher.Invocable
                     */
                    /**
                     * Encapsulates information about a handler method consisting of a `method` and `handler`.
                     * @interface module:dispatcher.HandlerMethod
                     * @extends module:dispatcher.Invocable
                     */
                    /**
                     * A strategy for assigning a name to a route handler method's mapping.
                     *
                     * The strategy can be configured on {@linkcode module:dispatcher.AbstractHandlerMethodMapping|AbstractHandlerMethodMapping}.
                     * It is used to assign a name to the mapping of every registered handler method.
                     * @interface module:dispatcher.RouteHandlerMethodMappingNamingStrategy
                     */
                    /**
                     * @function module:dispatcher.RouteHandlerMethodMappingNamingStrategy#getName
                     * @param {*} handlerMethod
                     * @param {*} mapping
                     * @returns {external:string} The name
                     */
                    var defineProperty = Reflect.defineProperty;
                    /**
                     * @class module:router.RouteHandlerMethod
                     * @implements module:dispatcher.HandlerMethod
                     * @implements module:core.Serializable
                     */
                    var RouteHandlerMethod = /** @class */ (function () {
                        function RouteHandlerMethod(factoryOrHandler, nameOrMethod) {
                            /**
                             * @member {module:factory.Factory} module:router.RouteHandlerMethod#factory
                             */
                            var args = [];
                            for (var _i = 2; _i < arguments.length; _i++) {
                                args[_i - 2] = arguments[_i];
                            }
                            /**
                             * @member {external:string} module:router.RouteHandlerMethod#name
                             */
                            /**
                             * @member {*} module:router.RouteHandlerMethod#handler
                             */
                            /**
                             * @member {external:string} module:router.RouteHandlerMethod#method
                             */
                            /**
                             * @member {external:Array<*>} module:router.RouteHandlerMethod#parameters
                             */
                            if (factory_1.likeFactory(factoryOrHandler)) {
                                defineProperty(this, 'factory', {
                                    value: factoryOrHandler,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'name', {
                                    value: nameOrMethod,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'handler', {
                                    value: this.factory.getInstance(this.name),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'method', {
                                    value: args.shift(),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            } else {
                                defineProperty(this, 'factory', {
                                    value: null,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'name', {
                                    value: null,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'handler', {
                                    value: factoryOrHandler,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'method', {
                                    value: nameOrMethod,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                            defineProperty(this, 'parameters', {
                                value: args.length ? args : [],
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                        }
                        /**
                         * @function module:router.RouteHandlerMethod#invoke
                         * @param {module:router.Request} route
                         * @returns {module:dispatcher.ModelAndView}
                         */
                        RouteHandlerMethod.prototype.invoke = function (route) {
                            /**
                             * * Hardcoding route as a parameter is a bit of a cop-out. It would be better to allow them to pick parameters, etc. as arguments. -JBR
                             */
                            var _a;
                            var foo = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                foo[_i - 1] = arguments[_i];
                            }
                            var _b = this,
                                argumentResolvers = _b.argumentResolvers,
                                parameters = _b.parameters,
                                parametersLength = parameters.length,
                                args = new Array(parametersLength),
                                mapping = route_mapping_1.getRouteMapping(this.handler, this.method);
                            console.log(
                                'RouteHandlerMethod::invoke',
                                this.method,
                                route_mapping_1.getRouteMapping(this.handler, this.method),
                                parametersLength,
                                parameters,
                                argumentResolvers
                            );
                            if (parametersLength) {
                                var _loop_1 = function (index) {
                                    var parameter = parameters[index],
                                        resolver = argumentResolvers.find(function (resolver) {
                                            return resolver.supportsParameter(parameter);
                                        });
                                    args[index] = resolver
                                        ? resolver.resolveArgument(parameter, route, mapping)
                                        : void 0;
                                    console.log(
                                        'RouteHandlerMethod::invoke::parameter',
                                        index,
                                        parameter.type,
                                        argumentResolvers.find(function (resolver) {
                                            return resolver.supportsParameter(parameter);
                                        })
                                    );
                                };
                                for (var index = 0; index < parametersLength; index++) {
                                    _loop_1(index);
                                }
                            }
                            return (_a = this.handler)[this.method].apply(_a, args);
                        };
                        /**
                         * @function module:router.RouteHandlerMethod#toString
                         * @returns {external:string}
                         */
                        RouteHandlerMethod.prototype.toString = function () {
                            return (
                                util_1.type(this.handler) +
                                '#' +
                                this.method +
                                '( ' +
                                JSON.stringify(this.parameters) +
                                ' )'
                            );
                        };
                        return RouteHandlerMethod;
                    })();
                    exports.RouteHandlerMethod = RouteHandlerMethod;
                    /**
                     * @class module:dispatcher.ErrorHandlerMethod
                     * @extends module:router.RouteHandlerMethod
                     */
                    var ErrorHandlerMethod = /** @class */ (function (_super) {
                        __extends(ErrorHandlerMethod, _super);
                        function ErrorHandlerMethod() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        ErrorHandlerMethod.prototype.invoke = function (route, error, handlerMethod) {
                            return _super.prototype.invoke.call(this, route, error, handlerMethod);
                        };
                        return ErrorHandlerMethod;
                    })(RouteHandlerMethod);
                    exports.ErrorHandlerMethod = ErrorHandlerMethod;

                    /***/
                },
                /* 17 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.privateMapping =
                        exports.publicMapping =
                        exports.routeMapping =
                        exports.hasRouteMapping =
                        exports.getRouteMapping =
                        exports.defineRouteMapping =
                            void 0;
                    __webpack_require__(3);
                    var util_1 = __webpack_require__(4);
                    var ROUTE_MAPPING = 'route:mapping',
                        defaultMapping = {
                            value: '/**',
                            private: false,
                        },
                        defineMetadata = Reflect.defineMetadata,
                        getMetadata = Reflect.getMetadata,
                        hasMetadata = Reflect.hasMetadata,
                        withDefaults = util_1.mergeRight(defaultMapping),
                        configurationOf = util_1.objOf('value'),
                        toRouteMappingConfiguration = util_1.when(
                            util_1.isString,
                            util_1.compose(withDefaults, configurationOf)
                        );
                    /**
                     * @function module:dispatcher.defineRouteMapping
                     * @param {*} value
                     * @param {*} target
                     * @param {external:string|external:symbol} [propertyKey]
                     */
                    var defineRouteMapping = function (value, target, propertyKey) {
                        if (propertyKey === void 0) {
                            propertyKey = void 0;
                        }
                        return defineMetadata(ROUTE_MAPPING, value, target, propertyKey);
                    };
                    exports.defineRouteMapping = defineRouteMapping;
                    /**
                     * @function module:dispatcher.getRouteMapping
                     * @param {*} target
                     * @param {external:string|external:symbol} [propertyKey]
                     * @returns {*}
                     */
                    var getRouteMapping = function (target, propertyKey) {
                        if (propertyKey === void 0) {
                            propertyKey = void 0;
                        }
                        return getMetadata(ROUTE_MAPPING, target, propertyKey);
                    };
                    exports.getRouteMapping = getRouteMapping;
                    /**
                     * @function module:dispatcher.hasRouteMapping
                     * @param {*} target
                     * @param {external:string|external:symbol} [propertyKey]
                     * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
                     */
                    var hasRouteMapping = function (target, propertyKey) {
                        if (propertyKey === void 0) {
                            propertyKey = void 0;
                        }
                        return hasMetadata(ROUTE_MAPPING, target, propertyKey);
                    };
                    exports.hasRouteMapping = hasRouteMapping;
                    /**
                     * @function module:router.RouteMapping
                     * @param {external:string} route
                     */
                    var routeMapping = function (route) {
                        if (route === void 0) {
                            route = defaultMapping;
                        }
                        var conf = toRouteMappingConfiguration(route);
                        return function (target, propertyKey, descriptor) {
                            if (propertyKey) {
                                exports.defineRouteMapping(conf, target, propertyKey);
                                descriptor.enumerable = true;
                                console.log('@RouteMapping', conf, target, propertyKey);
                                return descriptor;
                            } else {
                                exports.defineRouteMapping(conf, target);
                                console.log('@RouteMapping', conf, target);
                                return target;
                            }
                        };
                    };
                    exports.routeMapping = routeMapping;
                    var publicMapping = function (route) {
                        return exports.routeMapping({ value: route, private: false });
                    };
                    exports.publicMapping = publicMapping;
                    var privateMapping = function (route) {
                        return exports.routeMapping({ value: route, private: true });
                    };
                    exports.privateMapping = privateMapping;

                    /***/
                },
                /* 18 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__18__;

                    /***/
                },
                /* 19 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsRouteHandlerMappingStrategy = void 0;
                    var route_handler_mapping_1 = __webpack_require__(20);
                    var defineProperty = Reflect.defineProperty,
                        HANDLER_MAPPING = 'handlerMapping',
                        HANDLER_MAPPINGS = HANDLER_MAPPING + 's',
                        defaultRouteHandlerMappings = [
                            new route_handler_mapping_1.NamePathHandlerMapping(),
                            new route_handler_mapping_1.MetadataHandlerMapping(),
                        ];
                    /**
                     * @interface module:dispatcher.RouteHandlerMappingStrategy
                     */
                    var AsRouteHandlerMappingStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'handlerMappingKey', {
                                    get: function () {
                                        return HANDLER_MAPPING;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                defineProperty(_this, 'handlerMappingCollectionKey', {
                                    get: function () {
                                        return HANDLER_MAPPINGS;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(HANDLER_MAPPINGS);
                                return _this;
                            }
                            class_1.prototype.initHandlerMappings = function (context) {
                                var _a = this,
                                    handlerMappingKey = _a.handlerMappingKey,
                                    handlerMappingCollectionKey = _a.handlerMappingCollectionKey;
                                this.initCollectionStrategy(
                                    context,
                                    handlerMappingCollectionKey,
                                    handlerMappingKey,
                                    HANDLER_MAPPINGS,
                                    defaultRouteHandlerMappings
                                );
                                console.log('Dispatcher::initHandlerMappings', this.handlerMappings);
                            };
                            class_1.prototype.getHandler = function (route) {
                                var handlerMappings = this.handlerMappings,
                                    length = handlerMappings.length;
                                console.log('Dispatcher::getHandler', route);
                                for (var index = 0; index < length; index++) {
                                    var handler = handlerMappings[index].getHandler(route);
                                    if (handler) {
                                        return handler;
                                    }
                                }
                                return null;
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsRouteHandlerMappingStrategy = AsRouteHandlerMappingStrategy;

                    /***/
                },
                /* 20 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    var __classPrivateFieldGet =
                        (this && this.__classPrivateFieldGet) ||
                        function (receiver, privateMap) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to get private field on non-instance');
                            }
                            return privateMap.get(receiver);
                        };
                    var __classPrivateFieldSet =
                        (this && this.__classPrivateFieldSet) ||
                        function (receiver, privateMap, value) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to set private field on non-instance');
                            }
                            privateMap.set(receiver, value);
                            return value;
                        };
                    var _registry, _mappingLookup, _pathLookup, _nameLookup_1, _handlers_1;
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.SimplePathHandlerMapping =
                        exports.RouteMatchResult =
                        exports.MetadataHandlerMapping =
                        exports.NamePathHandlerMapping =
                        exports.AbstractDetectingPathHandlerMapping =
                        exports.AbstractPathHandlerMapping =
                        exports.AbstractHandlerMethodMapping =
                        exports.AbstractHandlerMapping =
                            void 0;
                    var core_1 = __webpack_require__(5);
                    var factory_1 = __webpack_require__(15);
                    var context_1 = __webpack_require__(18);
                    var util_1 = __webpack_require__(4);
                    var route_handler_interceptor_1 = __webpack_require__(21);
                    var route_handler_execution_chain_1 = __webpack_require__(12);
                    var route_handler_method_1 = __webpack_require__(16);
                    var route_mapping_info_1 = __webpack_require__(22);
                    var route_mapping_1 = __webpack_require__(17);
                    var route_parameter_1 = __webpack_require__(2);
                    /**
                     * @typedef {string:external | T} module:dispatcher.Maybe<T>
                     */
                    /**
                     * @typedef {module:dispatcher.Maybe<*>} module:dispatcher.MaybeHandler
                     */
                    /**
                     * Interface to be implemented by objects that define a mapping between routes and handler objects.
                     * A handler will always be wrapped in a {@linkcode module:dispatcher.HandlerExecutionChain|HandlerExecutionChain} instance.
                     * @interface module:router.RouteHandlerMapping
                     */
                    /**
                     * Return a handler for this route. The choice may be made on any factor the implementing class chooses.
                     * Returns `null` if no match was found.
                     * @function module:router.RouteHandlerMapping#getHandler
                     * @param {module:dispatcher.Request} route The current route
                     * @returns {module:dispatcher.HandlerExecutionChain} A HandlerExecutionChain instance containing handler object or `null` if no mapping
                     */
                    /**
                     * Additional interface that a {@linkcode module:router.RouteHandlerMapping|HandlerMapping} can implement to expose a route matching API aligned with its internal route matching configuration and implementation.
                     * @interface module:dispatcher.MatchableHandlerMapping
                     * @extends module:router.RouteHandlerMapping
                     */
                    /**
                     * Determine whether the given route matches the route criteria.
                     * @function module:dispatcher.MatchableHandlerMapping#match
                     * @param {module:dispatcher.Request} route The current route
                     * @param {external:string} pattern
                     * @returns {module:dispatcher.HandlerExecutionChain}
                     */
                    var from = Array.from,
                        isArray = Array.isArray,
                        defineProperty = Reflect.defineProperty,
                        getPrototypeOf = Reflect.getPrototypeOf,
                        keys = Object.keys,
                        toString = Object.prototype.toString,
                        doesNotStartWithSlash = util_1.complement(util_1.startsWith('/')),
                        kind = /^\[object (.+)\]$/,
                        kindOf = function (value) {
                            return kind.exec(toString.call(value))[1];
                        },
                        resolveHandlerWithContext = function (context) {
                            return function (handler) {
                                return util_1.when(util_1.isString, function (key) {
                                    return context.getValue(key);
                                })(handler);
                            };
                        };
                    /**
                     * @class module:dispatcher~MappingEntry
                     */
                    var MappingEntry = /** @class */ (function () {
                        function MappingEntry(mapping, handlerMethod, mappingName, directPaths) {
                            if (directPaths === void 0) {
                                directPaths = [];
                            }
                            /**
                             * @member {T} module:dispatcher~MappingEntry#mapping
                             */
                            defineProperty(this, 'mapping', {
                                value: mapping,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            /**
                             * @member {module:dispatcher.HandlerMethod} module:dispatcher~MappingEntry#handlerMethod
                             */
                            defineProperty(this, 'handlerMethod', {
                                value: handlerMethod,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            /**
                             * @member {external:string} module:dispatcher~MappingEntry#mappingName
                             */
                            defineProperty(this, 'mappingName', {
                                value: mappingName,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            /**
                             * @member {external:Array<external:string>} module:dispatcher~MappingEntry#directPaths
                             */
                            defineProperty(this, 'directPaths', {
                                value: directPaths,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        Object.defineProperty(MappingEntry.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'MappingEntry';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return MappingEntry;
                    })();
                    /**
                     * A registry that maintains all mappings to handler methods, exposing methods to perform lookups.
                     * @class module:dispatcher~MappingRegistry
                     */
                    var MappingRegistry = /** @class */ (function () {
                        function MappingRegistry() {
                            _registry.set(this, new Map());
                            _mappingLookup.set(this, new Map());
                            _pathLookup.set(this, new core_1.MultiValueMap());
                            _nameLookup_1.set(this, new core_1.MultiValueMap());
                        }
                        Object.defineProperty(
                            MappingRegistry.prototype,
                            ((_registry = new WeakMap()),
                            (_mappingLookup = new WeakMap()),
                            (_pathLookup = new WeakMap()),
                            (_nameLookup_1 = new WeakMap()),
                            Symbol.toStringTag),
                            {
                                get: function () {
                                    return 'MappingRegistry';
                                },
                                enumerable: false,
                                configurable: true,
                            }
                        );
                        Object.defineProperty(MappingRegistry.prototype, 'mappings', {
                            get: function () {
                                return __classPrivateFieldGet(this, _mappingLookup);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MappingRegistry.prototype.getMappingsByPath = function (path) {
                            return __classPrivateFieldGet(this, _pathLookup).get(path);
                        };
                        MappingRegistry.prototype.getHandlerMethodsByMappingName = function (name) {
                            return __classPrivateFieldGet(this, _nameLookup_1).get(name);
                        };
                        MappingRegistry.prototype.register = function (mapping, handlerMethod) {
                            __classPrivateFieldGet(this, _mappingLookup).set(mapping, handlerMethod);
                            var name;
                            __classPrivateFieldGet(this, _registry).set(
                                mapping,
                                new MappingEntry(mapping, handlerMethod, name)
                            );
                        };
                        MappingRegistry.prototype.unregister = function (mapping) {
                            if (!__classPrivateFieldGet(this, _registry).has(mapping)) {
                                return;
                            } else {
                                var entry = __classPrivateFieldGet(this, _registry).get(mapping),
                                    directPaths = entry.directPaths,
                                    length = directPaths.length;
                                __classPrivateFieldGet(this, _registry).delete(mapping);
                                __classPrivateFieldGet(this, _mappingLookup).delete(entry.mapping);
                                for (var index = 0; index < length; index++) {
                                    var path = directPaths[index];
                                    if (__classPrivateFieldGet(this, _pathLookup).has(path)) {
                                        var list = __classPrivateFieldGet(this, _pathLookup).get(path),
                                            index_1 = list.indexOf(entry.mapping);
                                        index_1 !== -1 && list.splice(index_1, 1);
                                    }
                                }
                                this._removeMappingName(entry);
                            }
                        };
                        MappingRegistry.prototype._removeMappingName = function (_a) {
                            var mappingName = _a.mappingName,
                                handlerMethod = _a.handlerMethod;
                            if (!mappingName) {
                                return;
                            }
                            var _nameLookup = __classPrivateFieldGet(this, _nameLookup_1),
                                oldList = _nameLookup.get(mappingName);
                            if (!oldList) {
                                return;
                            }
                            if (oldList.length <= 1) {
                                _nameLookup.delete(mappingName);
                                return;
                            }
                            var newList = oldList.filter(function (hm) {
                                return hm !== handlerMethod;
                            });
                            _nameLookup.set(mappingName, newList);
                        };
                        return MappingRegistry;
                    })();
                    /**
                     * @class module:dispatcher~Match
                     * @implements module:core.Serializable
                     */
                    var Match = /** @class */ (function () {
                        function Match(mapping, handlerMethod) {
                            /**
                             * @member {T} module:dispatcher~Match#mapping
                             */
                            defineProperty(this, 'mapping', {
                                value: mapping,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            /**
                             * @member {module:dispatcher.HandlerMethod} module:dispatcher~Match#handlerMethod
                             */
                            defineProperty(this, 'handlerMethod', {
                                value: handlerMethod,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        Object.defineProperty(Match.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'Match';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @function module:dispatcher~Match#toString
                         * @returns {external:string}
                         */
                        Match.prototype.toString = function () {
                            return this.mapping.toString();
                        };
                        return Match;
                    })();
                    /**
                     * @class module:dispatcher~MatchComparator
                     * @implements module:core.Comparator<module:dispatcher~Match>
                     */
                    var MatchComparator = /** @class */ (function () {
                        function MatchComparator(comparator) {
                            defineProperty(this, 'comparator', {
                                value: comparator,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        Object.defineProperty(MatchComparator.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'MatchComparator';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @function module:dispatcher~MatchComparator#compare
                         * @param {module:dispatcher~Match} match1
                         * @param {module:dispatcher~Match} match2
                         * @returns {external:number}
                         */
                        MatchComparator.prototype.compare = function (match1, match2) {
                            return this.comparator.compare(match1.mapping, match2.mapping);
                        };
                        return MatchComparator;
                    })();
                    var AbstractHandlerMapping = /** @class */ (function (_super) {
                        __extends(AbstractHandlerMapping, _super);
                        function AbstractHandlerMapping() {
                            var _this = _super.call(this) || this;
                            defineProperty(_this, 'defaultHandler', {
                                value: null,
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                            defineProperty(_this, 'interceptors', {
                                value: [],
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(_this, 'pathMatcher', {
                                value: new core_1.GlobPathMatcher(),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(AbstractHandlerMapping.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'HandlerMapping';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        AbstractHandlerMapping.prototype.getHandler = function (route) {
                            var handler = this._getHandler(route);
                            if (!handler) {
                                handler = this.defaultHandler;
                            }
                            if (!handler) {
                                return null;
                            }
                            handler = resolveHandlerWithContext(this.applicationContext)(handler);
                            return this._getHandlerExecutionChain(handler, route);
                        };
                        AbstractHandlerMapping.prototype._getHandlerExecutionChain = function (handler, route) {
                            var chain =
                                    handler instanceof route_handler_execution_chain_1.default
                                        ? handler
                                        : new route_handler_execution_chain_1.default(handler),
                                _a = this,
                                interceptors = _a.interceptors,
                                pathMatcher = _a.pathMatcher,
                                length =
                                    interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
                            if (length) {
                                for (var index = 0; index < length; index++) {
                                    var interceptor = interceptors[index];
                                    if (interceptor instanceof route_handler_interceptor_1.MappedHandlerInterceptor) {
                                        if (interceptor.matches(route.path, pathMatcher)) {
                                            chain.addInterceptor(interceptor.interceptor);
                                        }
                                    } else {
                                        chain.addInterceptor(interceptor);
                                    }
                                }
                            }
                            return chain;
                        };
                        return AbstractHandlerMapping;
                    })(factory_1.AsNameAware(context_1.AsApplicationContextAware(core_1.Null)));
                    exports.AbstractHandlerMapping = AbstractHandlerMapping;
                    var AbstractHandlerMethodMapping = /** @class */ (function (_super) {
                        __extends(AbstractHandlerMethodMapping, _super);
                        function AbstractHandlerMethodMapping() {
                            var _this = _super.call(this) || this;
                            defineProperty(_this, 'mappingRegistry', {
                                value: new MappingRegistry(),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        AbstractHandlerMethodMapping.prototype.init = function () {
                            var _this = this;
                            var applicationContext = this.applicationContext;
                            keys(applicationContext).forEach(function (name) {
                                var value = applicationContext.getValue(name);
                                _this._isHandler(value) && _this._detectHandlerMethods(value);
                            });
                        };
                        AbstractHandlerMethodMapping.prototype.getHandlerMethods = function () {
                            return this.mappingRegistry.mappings;
                        };
                        AbstractHandlerMethodMapping.prototype.getHandlerMethodsForMappingName = function (name) {
                            return this.mappingRegistry.getHandlerMethodsByMappingName(name);
                        };
                        AbstractHandlerMethodMapping.prototype.registerMapping = function (mapping, handler, method) {
                            this.mappingRegistry.register(mapping, this._createRequestHandlerMethod(handler, method));
                        };
                        AbstractHandlerMethodMapping.prototype.unregisterMapping = function (mapping) {
                            this.mappingRegistry.unregister(mapping);
                        };
                        AbstractHandlerMethodMapping.prototype._createRequestHandlerMethod = function (
                            handler,
                            method
                        ) {
                            handler = resolveHandlerWithContext(this.applicationContext)(handler);
                            var handlerMethod = new route_handler_method_1.RouteHandlerMethod(handler, method);
                            if (route_parameter_1.hasMethodParameter(handler, method)) {
                                handlerMethod.parameters = route_parameter_1.getMethodParameter(handler, method);
                            }
                            return handlerMethod;
                        };
                        /**
                         * Look for methods in the specified handler.
                         * @param {*} handler Either a name or an actual handler instance.
                         * @see {@link module:dispatcher.AbstractHandlerMethodMapping#_getMappingForMethod}
                         */
                        AbstractHandlerMethodMapping.prototype._detectHandlerMethods = function (handler) {
                            var _this = this;
                            handler = resolveHandlerWithContext(this.applicationContext)(handler);
                            if (handler) {
                                var handlerPrototype_1 = getPrototypeOf(handler);
                                keys(handlerPrototype_1).forEach(function (key) {
                                    if (
                                        util_1.isFunction(handlerPrototype_1[key]) &&
                                        route_mapping_1.hasRouteMapping(handler, key)
                                    ) {
                                        var info = _this._getMappingForMethod(key, handlerPrototype_1);
                                        _this._registerHandlerMethod(handler, key, info);
                                    }
                                });
                            }
                        };
                        AbstractHandlerMethodMapping.prototype._getHandler = function (route) {
                            var path = route.path;
                            return this._lookupHandlerMethod(path, route);
                        };
                        AbstractHandlerMethodMapping.prototype._lookupHandlerMethod = function (path, route) {
                            var mappingRegistry = this.mappingRegistry,
                                matches = [],
                                directPathMatches = mappingRegistry.getMappingsByPath(path);
                            if (directPathMatches && directPathMatches.length) {
                                this._addMatchingMappings(directPathMatches, matches, route);
                            }
                            if (!matches.length) {
                                this._addMatchingMappings(from(mappingRegistry.mappings.keys()), matches, route);
                            }
                            if (matches.length) {
                                var comparator = new MatchComparator(this._getMappingComparator(route));
                                matches.sort(comparator.compare);
                                var bestMatch = matches[0];
                                if (matches.length > 1) {
                                    var nextMatch = matches[1];
                                    if (comparator.compare(bestMatch, nextMatch) === 0) {
                                        var m1 = bestMatch.handlerMethod.method,
                                            m2 = nextMatch.handlerMethod.method;
                                        throw new Error(
                                            'Ambiguous handler methods mapped for "' +
                                                path +
                                                '": { ' +
                                                m1 +
                                                ', ' +
                                                m2 +
                                                ' }'
                                        );
                                    }
                                }
                                this._handleMatch(bestMatch.mapping, path, route);
                                return bestMatch.handlerMethod;
                            }
                            return null;
                        };
                        AbstractHandlerMethodMapping.prototype._handleMatch = function (mapping, path, route) {
                            // TODO Put this in a categorized spot?
                            route[kindOf(this)] = path;
                        };
                        AbstractHandlerMethodMapping.prototype._registerHandlerMethod = function (
                            handler,
                            method,
                            mapping
                        ) {
                            this.registerMapping(mapping, handler, method);
                        };
                        AbstractHandlerMethodMapping.prototype._addMatchingMappings = function (
                            mappings,
                            matches,
                            route
                        ) {
                            var length = mappings.length;
                            for (var index = 0; index < length; index++) {
                                var match = this._getMatchingMapping(mappings[index], route);
                                if (match) {
                                    matches.push(new Match(match, this.mappingRegistry.mappings.get(mappings[index])));
                                }
                            }
                        };
                        return AbstractHandlerMethodMapping;
                    })(AbstractHandlerMapping);
                    exports.AbstractHandlerMethodMapping = AbstractHandlerMethodMapping;
                    var AbstractPathHandlerMapping = /** @class */ (function (_super) {
                        __extends(AbstractPathHandlerMapping, _super);
                        function AbstractPathHandlerMapping() {
                            var _this = _super.call(this) || this;
                            _handlers_1.set(_this, void 0);
                            _this.rootHandler = null;
                            _this.useTrailingSlashMatch = false;
                            __classPrivateFieldSet(_this, _handlers_1, new Map());
                            return _this;
                        }
                        AbstractPathHandlerMapping.prototype.lookUpHandler = function (path, route) {
                            var _a = this,
                                applicationContext = _a.applicationContext,
                                pathMatcher = _a.pathMatcher,
                                useTrailingSlashMatch = _a.useTrailingSlashMatch,
                                _handlers = __classPrivateFieldGet(this, _handlers_1);
                            var handler;
                            if (_handlers.has(path)) {
                                handler = _handlers.get(path);
                                handler = resolveHandlerWithContext(applicationContext)(handler);
                                return new route_handler_execution_chain_1.default(handler);
                            }
                            var matchingPatterns = [];
                            for (var _i = 0, _b = _handlers.keys(); _i < _b.length; _i++) {
                                var pattern = _b[_i];
                                if (pathMatcher.match(pattern, path)) {
                                    matchingPatterns.push(pattern);
                                } else if (useTrailingSlashMatch) {
                                    if (!pattern.endsWith('/') && pathMatcher.match(pattern + '/', path)) {
                                        matchingPatterns.push(pattern + '/');
                                    }
                                }
                            }
                            var bestMatch = null;
                            //const patternComparator: Comparator<string> = this.pathMatcher.getPatternComparator( path );
                            if (matchingPatterns.length) {
                                // TODO provide sorting function
                                matchingPatterns.sort();
                                bestMatch = matchingPatterns[0];
                            }
                            if (bestMatch) {
                                handler = _handlers.get(bestMatch);
                                if (!handler) {
                                    if (bestMatch.endsWith('/')) {
                                        handler = _handlers.get(bestMatch.substring(0, bestMatch.length - 1));
                                    }
                                    if (!handler) {
                                        throw new Error('Could not find handler for pattern "' + bestMatch + '"');
                                    }
                                }
                                handler = resolveHandlerWithContext(this.applicationContext)(handler);
                                return new route_handler_execution_chain_1.default(handler);
                            }
                            return null;
                        };
                        AbstractPathHandlerMapping.prototype.match = function (route, pattern) {
                            var _a = this,
                                pathMatcher = _a.pathMatcher,
                                useTrailingSlashMatch = _a.useTrailingSlashMatch,
                                path = route.path;
                            if (pathMatcher.match(pattern, path)) {
                                return new RouteMatchResult(pattern, path);
                            } else if (useTrailingSlashMatch) {
                                var patternSlash = pattern + '/';
                                if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                                    return new RouteMatchResult(patternSlash, path);
                                }
                            }
                            return null;
                        };
                        AbstractPathHandlerMapping.prototype._getHandler = function (route) {
                            var path = route.path,
                                handler = this.lookUpHandler(path, route);
                            if (!handler) {
                                var rawHandler = null;
                                if ('/' === path) {
                                    rawHandler = this.rootHandler;
                                }
                                if (!rawHandler) {
                                    rawHandler = this.defaultHandler;
                                }
                                if (rawHandler) {
                                    rawHandler = resolveHandlerWithContext(this.applicationContext)(rawHandler);
                                    handler = new route_handler_execution_chain_1.default(rawHandler);
                                }
                            }
                            return handler;
                        };
                        AbstractPathHandlerMapping.prototype._registerHandler = function (path, handler) {
                            var _this = this;
                            if (!isArray(path)) {
                                path = [path];
                            }
                            path.forEach(function (p) {
                                if (typeof p !== 'string') {
                                    throw new TypeError('Path must be a string');
                                }
                                if (typeof handler === 'undefined') {
                                    throw new TypeError('Handler must be defined');
                                }
                                var resolvedHandler = resolveHandlerWithContext(_this.applicationContext)(handler);
                                var mappedHandler = __classPrivateFieldGet(_this, _handlers_1).get(p);
                                if (mappedHandler) {
                                    if (mappedHandler !== resolvedHandler) {
                                        throw new Error(
                                            'Cannot map handler ' +
                                                handler +
                                                ' to path "' +
                                                p +
                                                '". There is already ' +
                                                mappedHandler +
                                                ' mapped.'
                                        );
                                    }
                                } else {
                                    switch (p) {
                                        case '/':
                                            _this.rootHandler = resolvedHandler;
                                            break;
                                        case '/*':
                                            _this.defaultHandler = resolvedHandler;
                                            break;
                                        default:
                                            __classPrivateFieldGet(_this, _handlers_1).set(p, resolvedHandler);
                                            break;
                                    }
                                }
                            });
                        };
                        return AbstractPathHandlerMapping;
                    })(AbstractHandlerMapping);
                    exports.AbstractPathHandlerMapping = AbstractPathHandlerMapping;
                    _handlers_1 = new WeakMap();
                    var AbstractDetectingPathHandlerMapping = /** @class */ (function (_super) {
                        __extends(AbstractDetectingPathHandlerMapping, _super);
                        function AbstractDetectingPathHandlerMapping() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        AbstractDetectingPathHandlerMapping.prototype.setApplicationContext = function (context) {
                            _super.prototype.setApplicationContext.call(this, context);
                            this._detectHandlers();
                        };
                        AbstractDetectingPathHandlerMapping.prototype._detectHandlers = function () {
                            var _this = this;
                            var names = keys(this.applicationContext);
                            names.forEach(function (name) {
                                var paths = _this._determinePathsForHandler(name);
                                paths.length && _this._registerHandler(paths, name);
                            });
                        };
                        return AbstractDetectingPathHandlerMapping;
                    })(AbstractPathHandlerMapping);
                    exports.AbstractDetectingPathHandlerMapping = AbstractDetectingPathHandlerMapping;
                    /**
                     * Abstract base class for {@linkcode module:router.RouteHandlerMapping|HandlerMapping} implementations.
                     * @abstract
                     * @class module:dispatcher.AbstractHandlerMapping
                     * @implements module:router.RouteHandlerMapping
                     */
                    /**
                     * @member {module:core.ApplicationContext} module:dispatcher.AbstractHandlerMapping#context
                     */
                    /**
                     * @member {*} module:dispatcher.AbstractHandlerMapping#defaultHandler
                     */
                    /**
                     * Look up a handler for the given route, returning null if no specific one is found.
                     * @protected
                     * @abstract
                     * @function module:dispatcher.AbstractHandlerMapping#_getHandler
                     * @param {module:dispatcher.Request} route The current route
                     * @returns {module:dispatcher.HandlerExecutionChain}
                     */
                    /**
                     * Abstract base class for path-mapped {@linkcode module:router.RouteHandlerMapping|HandlerMapping} implementations. Provides infrastructure for mapping handlers to paths.
                     * @abstract
                     * @class module:dispatcher.AbstractPathHandlerMapping
                     * @extends module:dispatcher.AbstractHandlerMapping
                     * @implements module:dispatcher.MatchableHandlerMapping
                     */
                    /**
                     * Abstract implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface, detecting path mappings for handlers.
                     * @abstract
                     * @class module:dispatcher.AbstractDetectingPathHandlerMapping
                     * @extends module:dispatcher.AbstractPathHandlerMapping
                     */
                    /**
                     * Register all handlers found in the current Context.
                     * The actual path determination for a handler is up to the {@linkcode module:dispatcher.AbstractDetectingPathHandlerMapping#_determinePathsForHandler|_determinePathsForHandler} implementation.
                     * @protected
                     * @function module:dispatcher.AbstractDetectingPathHandlerMapping#_detectHandlers
                     */
                    /**
                     * Determine the paths for the given handler.
                     * @protected
                     * @abstract
                     * @function module:dispatcher.AbstractDetectingPathHandlerMapping#_determinePathsForHandler
                     * @param {external:string} name
                     * @returns {external:Array<external:string>} The paths determined for the handler or an empty array if none found
                     */
                    /**
                     * Implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface that map from paths to handlers with names that start with slash ("/").
                     * <p>This is the default implementation used by {@link module:dispatcher.Dispatcher|the dispatcher} along with {@linkcode module:dispatcher.MetadataHandlerMapping|MetadataHandlerMapping}.
                     * <p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
                     * <p>Supports direct matches and wildcard matches.
                     * @class module:dispatcher.NamePathHandlerMapping
                     * @extends module:dispatcher.AbstractDetectingPathHandlerMapping
                     */
                    var NamePathHandlerMapping = /** @class */ (function (_super) {
                        __extends(NamePathHandlerMapping, _super);
                        function NamePathHandlerMapping() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(NamePathHandlerMapping.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'NamePathHandlerMapping';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        NamePathHandlerMapping.prototype._determinePathsForHandler = function (name) {
                            var paths = [];
                            name.startsWith('/') && paths.push.apply(paths, name.split(' '));
                            return paths;
                        };
                        return NamePathHandlerMapping;
                    })(AbstractDetectingPathHandlerMapping);
                    exports.NamePathHandlerMapping = NamePathHandlerMapping;
                    /**
                     * Creates {@linkcode module:dispatcher.RequestMappingInfo|RequestMappingInfo} instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using {@linkcode module:dispatcher.RequestMapping|@RequestHandler} and {@linkcode module:dispatcher.RequestMapping|@RequestMapping} decorators.
                     * @class module:dispatcher.MetadataHandlerMapping
                     * @extends module:dispatcher.AbstractHandlerMethodMapping<module:dispatcher.RequestMappingInfo>
                     * @implements module:dispatcher.MatchableHandlerMapping
                     */
                    var MetadataHandlerMapping = /** @class */ (function (_super) {
                        __extends(MetadataHandlerMapping, _super);
                        function MetadataHandlerMapping() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(MetadataHandlerMapping.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'MetadataHandlerMapping';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MetadataHandlerMapping.prototype.match = function (route, pattern) {
                            var info = new route_mapping_info_1.RouteMappingInfo(pattern),
                                matchingInfo = info.getMatchingCondition(route);
                            if (!matchingInfo) {
                                return null;
                            }
                            var patterns = matchingInfo.patternsCondition.patterns;
                            return new RouteMatchResult(patterns[Symbol.iterator]().next().value, route.path);
                        };
                        MetadataHandlerMapping.prototype._getMappingForMethod = function (method, handler) {
                            var methodMapping = route_mapping_1.getRouteMapping(handler, method);
                            var methodInfo;
                            if (methodMapping) {
                                methodInfo = new route_mapping_info_1.RouteMappingInfo(
                                    methodMapping.value,
                                    new route_mapping_info_1.PatternsRouteCondition(methodMapping.value)
                                );
                                var handlerMapping = route_mapping_1.getRouteMapping(handler.constructor);
                                if (handlerMapping) {
                                    var handlerInfo = new route_mapping_info_1.RouteMappingInfo(
                                        handlerMapping.value,
                                        new route_mapping_info_1.PatternsRouteCondition(handlerMapping.value)
                                    );
                                    methodInfo = handlerInfo.merge(methodInfo);
                                }
                            }
                            return methodInfo;
                        };
                        MetadataHandlerMapping.prototype._getMappingComparator = function (route) {
                            return {
                                compare: function (info1, info2) {
                                    return info1.compareTo(info2, route);
                                },
                            };
                        };
                        MetadataHandlerMapping.prototype._getMatchingMapping = function (mapping, route) {
                            return mapping.getMatchingCondition(route);
                        };
                        MetadataHandlerMapping.prototype._handleMatch = function (mapping, path, route) {
                            _super.prototype._handleMatch.call(this, mapping, path, route);
                            var bestPattern;
                            var patterns = mapping.patternsCondition.patterns;
                            if (!patterns.size) {
                                bestPattern = path;
                            } else {
                                bestPattern = patterns[Symbol.iterator]().next().value;
                            }
                            defineProperty(route, 'pattern', {
                                value: bestPattern,
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                        };
                        MetadataHandlerMapping.prototype._handleNoMatch = function (mappings, path, route) {
                            return null;
                        };
                        MetadataHandlerMapping.prototype._isHandler = function (value) {
                            return (
                                route_mapping_1.hasRouteMapping(value) ||
                                ('constructor' in value && route_mapping_1.hasRouteMapping(value.constructor))
                            );
                        };
                        return MetadataHandlerMapping;
                    })(AbstractHandlerMethodMapping);
                    exports.MetadataHandlerMapping = MetadataHandlerMapping;
                    /**
                     * @class module:router.RouteMatchResult
                     */
                    var RouteMatchResult = /** @class */ (function () {
                        function RouteMatchResult(pattern, path) {
                            /**
                             * @member {external:string} module:router.RouteMatchResult#pattern
                             */
                            defineProperty(this, 'pattern', {
                                value: pattern,
                                configurable: true,
                                enumerable: true,
                                writable: false,
                            });
                            /**
                             * @member {external:string} module:router.RouteMatchResult#path
                             */
                            defineProperty(this, 'path', {
                                value: path,
                                configurable: true,
                                enumerable: true,
                                writable: false,
                            });
                        }
                        Object.defineProperty(RouteMatchResult.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'RouteMatchResult';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        RouteMatchResult.prototype.toJSON = function () {
                            var json = core_1.createNull();
                            json.pattern = this.pattern;
                            json.path = this.path;
                            return json;
                        };
                        return RouteMatchResult;
                    })();
                    exports.RouteMatchResult = RouteMatchResult;
                    /**
                     * Implementation of the {@linkcode module:router.RouteHandlerMapping|HandlerMapping} interface to map from paths to handlers.
                     * @class module:dispatcher.SimplePathHandlerMapping
                     * @extends module:dispatcher.AbstractPathHandlerMapping
                     * @param {module:core.ApplicationContext} [context]
                     * @param {external:Map<external:string, module:dispatcher.MaybeHandler>} [mappings]
                     */
                    var SimplePathHandlerMapping = /** @class */ (function (_super) {
                        __extends(SimplePathHandlerMapping, _super);
                        function SimplePathHandlerMapping() {
                            var _this = _super.call(this) || this;
                            /**
                             * @member {external:Map<external:string,module:dispatcher.MaybeHandler>} module:dispatcher.SimplePathHandlerMapping#mappings
                             */
                            _this.mappings = new Map();
                            return _this;
                        }
                        Object.defineProperty(SimplePathHandlerMapping.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'SimplePathHandlerMapping';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @function module:dispatcher.SimplePathHandlerMapping#setApplicationContext
                         * @param {module:core.ApplicationContext} context The application context to be set.
                         */
                        SimplePathHandlerMapping.prototype.setApplicationContext = function (context) {
                            _super.prototype.setApplicationContext.call(this, context);
                            var mappings = this.mappings;
                            this.registerHandlers(mappings);
                        };
                        /**
                         * Map paths to handlers or handler names, merging it into the existing mappings if any.
                         * @function module:dispatcher.SimplePathHandlerMapping#setMappings
                         * @param {external:Object} mappings The path mappings
                         */
                        SimplePathHandlerMapping.prototype.setMappings = function (mappings) {
                            var _this = this;
                            keys(mappings).forEach(function (path) {
                                return _this.mappings.set(path, mappings[path]);
                            });
                        };
                        /**
                         * @function module:dispatcher.SimplePathHandlerMapping#registerHandlers
                         * @param {external:Map<external:string,module:dispatcher.MaybeHandler>} mappings
                         */
                        SimplePathHandlerMapping.prototype.registerHandlers = function (mappings) {
                            var _this = this;
                            mappings &&
                                mappings.size &&
                                mappings.forEach(function (handler, path) {
                                    path = util_1.when(doesNotStartWithSlash, function (p) {
                                        return '/' + p;
                                    })(path);
                                    handler = util_1.when(util_1.isString, util_1.trim)(handler);
                                    _this._registerHandler(path, handler);
                                });
                        };
                        return SimplePathHandlerMapping;
                    })(AbstractPathHandlerMapping);
                    exports.SimplePathHandlerMapping = SimplePathHandlerMapping;

                    /***/
                },
                /* 21 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    var __classPrivateFieldSet =
                        (this && this.__classPrivateFieldSet) ||
                        function (receiver, privateMap, value) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to set private field on non-instance');
                            }
                            privateMap.set(receiver, value);
                            return value;
                        };
                    var __classPrivateFieldGet =
                        (this && this.__classPrivateFieldGet) ||
                        function (receiver, privateMap) {
                            if (!privateMap.has(receiver)) {
                                throw new TypeError('attempted to get private field on non-instance');
                            }
                            return privateMap.get(receiver);
                        };
                    var _interceptor;
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.MappedHandlerInterceptor = void 0;
                    var core_1 = __webpack_require__(5);
                    /**
                     * Workflow interface that allows for customized handler execution chains.
                     * Applications can register any number of existing or custom interceptors
                     * for certain groups of handlers, to add common preprocessing behavior
                     * without needing to modify each handler implementation.
                     *
                     * A `RouteHandlerInterceptor` gets called before the appropriate `RouteHandlerAdapter`
                     * triggers the execution of the handler itself. This mechanism can be used
                     * for a large field of preprocessing aspects, e.g. for authorization checks,
                     * or common handler behavior like locale or theme changes. Its main purpose
                     * is to allow for factoring out repetitive handler code.
                     *
                     * @interface module:router.RouteHandlerInterceptor
                     */
                    /**
                     * Callback after completion of route processing, that is, after rendering the view. Will be called on any outcome of handler execution, thus allows for proper resource cleanup.
                     * @function module:router.RouteHandlerInterceptor#completeHandle
                     */
                    /**
                     * Intercept the execution of a handler. Called after RouteHandlerAdapter actually invoked the handler, but before the Dispatcher renders the view.
                     * @function module:router.RouteHandlerInterceptor#postHandle
                     */
                    /**
                     * Intercept the execution of a handler. Called after HandlerMapping determined
                     * an appropriate handler object, but before RouteHandlerAdapter invokes the handler.
                     * @function module:router.RouteHandlerInterceptor#preHandle
                     */
                    /**
                     * @class module:dispatcher.MappedHandlerInterceptor
                     * @implements module:router.RouteHandlerInterceptor
                     */
                    var MappedHandlerInterceptor = /** @class */ (function (_super) {
                        __extends(MappedHandlerInterceptor, _super);
                        function MappedHandlerInterceptor(interceptor, includePatterns, excludePatterns) {
                            var _this = _super.call(this) || this;
                            _interceptor.set(_this, void 0);
                            __classPrivateFieldSet(_this, _interceptor, interceptor);
                            _this.setExcludePatterns(excludePatterns);
                            _this.setIncludePatterns(includePatterns);
                            return _this;
                        }
                        Object.defineProperty(MappedHandlerInterceptor.prototype, 'interceptor', {
                            get: function () {
                                return __classPrivateFieldGet(this, _interceptor);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MappedHandlerInterceptor.prototype.completeHandle = function (route, handler, error) {
                            if (error === void 0) {
                                error = null;
                            }
                            __classPrivateFieldGet(this, _interceptor).completeHandle(route, handler, error);
                        };
                        MappedHandlerInterceptor.prototype.postHandle = function (route, handler, modelAndView) {
                            __classPrivateFieldGet(this, _interceptor).postHandle(route, handler, modelAndView);
                        };
                        MappedHandlerInterceptor.prototype.preHandle = function (route, handler) {
                            return __classPrivateFieldGet(this, _interceptor).preHandle(route, handler);
                        };
                        return MappedHandlerInterceptor;
                    })(core_1.AsPathMatcherFilter(core_1.Null));
                    exports.MappedHandlerInterceptor = MappedHandlerInterceptor;
                    _interceptor = new WeakMap();
                    /**
                     * * Developers Notes
                     * ? Should we rename pre-, post-, and complete- handle? before-, after-, complete-?
                     */

                    /***/
                },
                /* 22 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.RouteMappingInfoHandlerMethodMappingNamingStrategy =
                        exports.RouteMappingInfo =
                        exports.PatternsRouteCondition =
                        exports.ParamsRouteCondition =
                        exports.ParamExpression =
                            void 0;
                    var core_1 = __webpack_require__(5);
                    var route_condition_1 = __webpack_require__(23);
                    var defineProperty = Reflect.defineProperty,
                        isArray = Array.isArray,
                        preprendPeriod = function (value) {
                            return value[0] === '.' ? value : '.' + value;
                        },
                        prependSlash = function (value) {
                            return value[0] === '/' ? value : '/' + value;
                        },
                        separator = '';
                    /*
export class AccessExpression extends AbstractNameValueExpression<boolean> {
    isCaseSensitiveName: boolean;

    matchName( route: Route ): boolean {
        return 'private' in route && route.private;
    }

    matchValue( route: Route ): boolean {
        return this.value === route.private;
    }

    parseValue( valueExpression: string ): boolean {
        throw new Error( "Method not implemented." );
    }
}
*/
                    /**
                     * Parses and matches a single param expression to a route.
                     * @class module:dispatcher.ParamExpression
                     * @extends module:dispatcher.AbstractNameValueExpression<external:string>
                     * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
                     */
                    var ParamExpression = /** @class */ (function (_super) {
                        __extends(ParamExpression, _super);
                        function ParamExpression(expression) {
                            var _this = _super.call(this, expression) || this;
                            defineProperty(_this, 'namesToMatch', {
                                value: new Set(),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            _this.namesToMatch.add(_this.name);
                            return _this;
                        }
                        Object.defineProperty(ParamExpression.prototype, 'isCaseSensitiveName', {
                            get: function () {
                                return true;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        ParamExpression.prototype.matchName = function (route) {
                            for (var _i = 0, _a = this.namesToMatch; _i < _a.length; _i++) {
                                var name = _a[_i];
                                if ('data' in route && name in route.data) {
                                    return true;
                                }
                            }
                            return 'data' in route && this.name in route.data;
                        };
                        ParamExpression.prototype.matchValue = function (route) {
                            return this.value === route.data[this.name];
                        };
                        ParamExpression.prototype.parseValue = function (valueExpression) {
                            return valueExpression;
                        };
                        return ParamExpression;
                    })(route_condition_1.AbstractNameValueExpression);
                    exports.ParamExpression = ParamExpression;
                    /**
                     * A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in {@linkcode module:dispatcher.RouteMapping|RouteMapping}.
                     * @class module:dispatcher.ParamsRouteCondition
                     * @extends module:dispatcher.AbstractRouteCondition
                     */
                    var ParamsRouteCondition = /** @class */ (function (_super) {
                        __extends(ParamsRouteCondition, _super);
                        function ParamsRouteCondition(paramOrConditions) {
                            var params = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                params[_i - 1] = arguments[_i];
                            }
                            var _this = _super.call(this) || this;
                            defineProperty(_this, 'expressions', {
                                value:
                                    typeof paramOrConditions === 'string'
                                        ? _this._parseExpressions([paramOrConditions].concat(params))
                                        : new Set(paramOrConditions),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(ParamsRouteCondition.prototype, 'content', {
                            get: function () {
                                return Array.from(this.expressions);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(ParamsRouteCondition.prototype, 'infix', {
                            get: function () {
                                return ' && ';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * Returns a new instance with the union of the param expressions from _this_ and the value provided.
                         */
                        ParamsRouteCondition.prototype.merge = function (value) {
                            var expressions = new Set(this.expressions);
                            for (var _i = 0, _a = value.expressions; _i < _a.length; _i++) {
                                var expression = _a[_i];
                                expressions.add(expression);
                            }
                            return new ParamsRouteCondition(expressions);
                        };
                        /**
                         * Returns `this` instance if the route matches all param expressions or `null` otherwise.
                         */
                        ParamsRouteCondition.prototype.getMatchingCondition = function (route) {
                            for (var _i = 0, _a = this.expressions; _i < _a.length; _i++) {
                                var expression = _a[_i];
                                if (!expression.match(route)) {
                                    return null;
                                }
                            }
                            return this;
                        };
                        /**
                         * Compare to another condition based on parameter expressions. A condition is considered to be a more specific match, if it has:
                         * - A greater number of expressions.
                         * - A greater number of non-negated expressions with a concrete value.
                         * @function module:dispatcher.ParamsRouteCondition#compareTo
                         * @param {module:dispatcher.ParamsRouteCondition} value
                         * @returns {external:number}
                         */
                        ParamsRouteCondition.prototype.compareTo = function (value, route) {
                            var result = value.expressions.size - this.expressions.size;
                            if (result !== 0) {
                                return result;
                            }
                            return (
                                this._getValueMatchCount(value.expressions) - this._getValueMatchCount(this.expressions)
                            );
                        };
                        ParamsRouteCondition.prototype._getValueMatchCount = function (expressions) {
                            var count = 0;
                            for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
                                var expression = expressions_1[_i];
                                if (expression.value !== void 0 && !expression.isNegated) {
                                    count++;
                                }
                            }
                            return count;
                        };
                        ParamsRouteCondition.prototype._parseExpressions = function (params) {
                            var expressions = new Set();
                            params.forEach(function (param) {
                                return expressions.add(new ParamExpression(param));
                            });
                            return expressions;
                        };
                        return ParamsRouteCondition;
                    })(route_condition_1.AbstractRouteCondition);
                    exports.ParamsRouteCondition = ParamsRouteCondition;
                    /**
                     * Creates a new instance with the given route patterns. Each pattern that is not empty and does not start with "/" is prepended with "/".
                     * @class module:dispatcher.PatternsRouteCondition
                     * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
                     * @param {...external:string} [patterns] 0 or more route patterns; if 0 the condition will match to every route.
                     */
                    /**
                     * @class module:dispatcher.PatternsRouteCondition
                     * @extends module:dispatcher.AbstractRouteCondition<module:dispatcher.PatternsRouteConditionPatternsRouteCondition>
                     * @param {external:Array<external:string>} patterns the route patterns to use; if 0, the condition will match to every route.
                     * @param {module:core.PathMatcher} pathMatcher
                     * @param {external:boolean} useTrailingSlashMatch whether to match irrespective of a trailing slash
                     * @param {external:Array<external:string>} [fileExtensions] a list of file extensions to consider for path matching
                     */
                    var PatternsRouteCondition = /** @class */ (function (_super) {
                        __extends(PatternsRouteCondition, _super);
                        function PatternsRouteCondition(
                            patterns,
                            pathMatcherOrRouteCondition,
                            useTrailingSlashMatch,
                            fileExtensions
                        ) {
                            if (patterns === void 0) {
                                patterns = '';
                            }
                            var morePatterns = [];
                            for (var _i = 4; _i < arguments.length; _i++) {
                                morePatterns[_i - 4] = arguments[_i];
                            }
                            var _this = _super.call(this) || this;
                            // TODO Clean up this logic
                            if (typeof patterns === 'string') {
                                patterns = [patterns];
                                if (typeof pathMatcherOrRouteCondition === 'string') {
                                    patterns.push(pathMatcherOrRouteCondition);
                                    pathMatcherOrRouteCondition = new core_1.GlobPathMatcher();
                                }
                                if (typeof useTrailingSlashMatch === 'string') {
                                    patterns.push(useTrailingSlashMatch);
                                    useTrailingSlashMatch = true;
                                }
                                if (typeof fileExtensions === 'string') {
                                    patterns.push(fileExtensions);
                                    fileExtensions = [];
                                }
                                if (isArray(morePatterns) && morePatterns.length) {
                                    patterns = patterns.concat(morePatterns);
                                }
                            }
                            if (isArray(patterns)) {
                                var discretePatterns_1 = new Set();
                                patterns.forEach(function (pattern) {
                                    if (pattern.length > 0) {
                                        pattern = prependSlash(pattern);
                                    }
                                    discretePatterns_1.add(pattern);
                                });
                                defineProperty(_this, 'patterns', {
                                    value: discretePatterns_1,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            } else {
                                defineProperty(_this, 'patterns', {
                                    value: patterns,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                            if (core_1.likePathMatcher(pathMatcherOrRouteCondition)) {
                                defineProperty(_this, 'pathMatcher', {
                                    value: pathMatcherOrRouteCondition,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(_this, 'useTrailingSlashMatch', {
                                    value: useTrailingSlashMatch,
                                    configurable: true,
                                    enumerable: false,
                                    writable: true,
                                });
                            } else if (route_condition_1.likeRouteCondition(pathMatcherOrRouteCondition)) {
                                var pathMatcher = pathMatcherOrRouteCondition.pathMatcher;
                                useTrailingSlashMatch = pathMatcherOrRouteCondition.useTrailingSlashMatch;
                                fileExtensions = pathMatcherOrRouteCondition.fileExtensions;
                                defineProperty(_this, 'pathMatcher', {
                                    value: pathMatcher,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(_this, 'useTrailingSlashMatch', {
                                    value: useTrailingSlashMatch,
                                    configurable: true,
                                    enumerable: false,
                                    writable: true,
                                });
                            } else {
                                defineProperty(_this, 'pathMatcher', {
                                    value: new core_1.GlobPathMatcher(),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(_this, 'useTrailingSlashMatch', {
                                    value: true,
                                    configurable: true,
                                    enumerable: false,
                                    writable: true,
                                });
                            }
                            defineProperty(_this, 'fileExtensions', {
                                value:
                                    isArray(fileExtensions) && fileExtensions.length
                                        ? fileExtensions.map(preprendPeriod)
                                        : [],
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                            return _this;
                        }
                        Object.defineProperty(PatternsRouteCondition.prototype, 'content', {
                            get: function () {
                                return Array.from(this.patterns);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(PatternsRouteCondition.prototype, 'infix', {
                            get: function () {
                                return ' || ';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        PatternsRouteCondition.prototype.merge = function (value) {
                            var result = new Set(),
                                thisSize = this.patterns.size,
                                valueSize = value.patterns.size;
                            if (thisSize > 0 && valueSize > 0) {
                                for (var _i = 0, _a = this.patterns; _i < _a.length; _i++) {
                                    var pattern1 = _a[_i];
                                    for (var _b = 0, _c = value.patterns; _b < _c.length; _b++) {
                                        var pattern2 = _c[_b];
                                        result.add(this.pathMatcher.merge(pattern1, pattern2));
                                    }
                                }
                            } else if (thisSize > 0) {
                                for (var _d = 0, _e = this.patterns; _d < _e.length; _d++) {
                                    var pattern = _e[_d];
                                    result.add(pattern);
                                }
                            } else if (valueSize > 0) {
                                for (var _f = 0, _g = value.patterns; _f < _g.length; _f++) {
                                    var pattern = _g[_f];
                                    result.add(pattern);
                                }
                            } else {
                                result.add('');
                            }
                            return new PatternsRouteCondition(result, this);
                        };
                        PatternsRouteCondition.prototype.getMatchingCondition = function (route) {
                            if (this.patterns.size === 0) {
                                return this;
                            }
                            var matches = this.getMatchingPatterns(route.path);
                            return matches.length ? new PatternsRouteCondition(new Set(matches), this) : null;
                        };
                        PatternsRouteCondition.prototype.getMatchingPatterns = function (path) {
                            var _this = this;
                            var matches = [];
                            this.patterns.forEach(function (pattern) {
                                var match = _this._getMatchingPattern(pattern, path);
                                if (match) {
                                    matches.push(match);
                                }
                            }, this);
                            if (matches.length > 1) {
                                // TODO Use pattern comparator
                                matches.sort();
                            }
                            return matches;
                        };
                        PatternsRouteCondition.prototype.compareTo = function (value, route) {
                            var path = route.path,
                                patternComparator = this.pathMatcher.getPatternComparator(path),
                                iterator1 = this.patterns.values(),
                                iterator2 = value.patterns.values();
                            for (
                                var item1 = void 0, item2 = void 0;
                                !(item1 = iterator1.next()).done && !(item2 = iterator2.next()).done;

                            ) {
                                var result = patternComparator.compare(item1, item2);
                                if (result !== 0) {
                                    return result;
                                }
                            }
                            if (!iterator1.next().done) {
                                return -1;
                            } else if (!iterator2.next().done) {
                                return 1;
                            } else {
                                return 0;
                            }
                        };
                        PatternsRouteCondition.prototype._getMatchingPattern = function (pattern, path) {
                            if (pattern === path) {
                                return pattern;
                            }
                            var _a = this,
                                pathMatcher = _a.pathMatcher,
                                useTrailingSlashMatch = _a.useTrailingSlashMatch;
                            if (pathMatcher.match(pattern, path)) {
                                return pattern;
                            }
                            if (useTrailingSlashMatch) {
                                var patternSlash = pattern + '/';
                                if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                                    return patternSlash;
                                }
                            }
                            return null;
                        };
                        return PatternsRouteCondition;
                    })(route_condition_1.AbstractRouteCondition);
                    exports.PatternsRouteCondition = PatternsRouteCondition;
                    var RouteMappingInfo = /** @class */ (function () {
                        function RouteMappingInfo(name, patterns, params, custom) {
                            if (name === void 0) {
                                name = null;
                            }
                            if (patterns === void 0) {
                                patterns = new PatternsRouteCondition();
                            }
                            if (params === void 0) {
                                params = new ParamsRouteCondition();
                            }
                            if (custom === void 0) {
                                custom = null;
                            }
                            defineProperty(this, 'name', {
                                value: name,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'patternsCondition', {
                                value: patterns,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'paramsCondition', {
                                value: params,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'customConditionHolder', {
                                value: new route_condition_1.RouteConditionHolder(custom),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        RouteMappingInfo.prototype.merge = function (value) {
                            var name = this._mergeNames(value),
                                params = this.paramsCondition.merge(value.paramsCondition),
                                patterns = this.patternsCondition.merge(value.patternsCondition),
                                custom = this.customConditionHolder.merge(value.customConditionHolder);
                            return new RouteMappingInfo(name, patterns, params, custom.condition);
                        };
                        RouteMappingInfo.prototype.getMatchingCondition = function (route) {
                            console.log('RouteMappingInfo::getMatchingCondition', this.name, route);
                            var params = this.paramsCondition.getMatchingCondition(route);
                            if (!params) {
                                return null;
                            }
                            var patterns = this.patternsCondition.getMatchingCondition(route);
                            if (!patterns) {
                                return null;
                            }
                            var custom = this.customConditionHolder.getMatchingCondition(route);
                            if (!custom) {
                                return null;
                            }
                            return new RouteMappingInfo(this.name, patterns, params, custom.condition);
                        };
                        RouteMappingInfo.prototype.compareTo = function (value, route) {
                            var result;
                            result = this.paramsCondition.compareTo(value.paramsCondition, route);
                            if (result !== 0) {
                                return result;
                            }
                            result = this.patternsCondition.compareTo(value.patternsCondition, route);
                            if (result !== 0) {
                                return result;
                            }
                            result = this.customConditionHolder.compareTo(value.customConditionHolder, route);
                            if (result !== 0) {
                                return result;
                            }
                            return 0;
                        };
                        RouteMappingInfo.prototype._mergeNames = function (value) {
                            console.log('RouteMappingInfo::_mergeName', this.name, value.name);
                            if (this.name && value.name) {
                                return ('' + this.name + separator + value.name).replace(/\/\//g, '/');
                            } else if (this.name) {
                                return this.name;
                            } else {
                                return value.name;
                            }
                        };
                        return RouteMappingInfo;
                    })();
                    exports.RouteMappingInfo = RouteMappingInfo;
                    var RouteMappingInfoHandlerMethodMappingNamingStrategy = /** @class */ (function () {
                        function RouteMappingInfoHandlerMethodMappingNamingStrategy() {}
                        RouteMappingInfoHandlerMethodMappingNamingStrategy.prototype.getName = function (
                            handlerMethod,
                            mapping
                        ) {
                            if (mapping.name) {
                                return mapping.name;
                            }
                            return '' + handlerMethod.name + separator + handlerMethod.method;
                        };
                        return RouteMappingInfoHandlerMethodMappingNamingStrategy;
                    })();
                    exports.RouteMappingInfoHandlerMethodMappingNamingStrategy =
                        RouteMappingInfoHandlerMethodMappingNamingStrategy;
                    defineProperty(RouteMappingInfoHandlerMethodMappingNamingStrategy, 'separator', {
                        value: separator,
                        configurable: true,
                        enumerable: false,
                        writable: false,
                    });
                    /**
                     * * Developer Notes
                     * TODO Create a condition for public vs. private routes if that's still going to be a thing in BlueJS3
                     * ? Should we grab cookies and put them on the Route so developers don't need to touch document? If so a condition needs to be made.
                     */

                    /***/
                },
                /* 23 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    var __spreadArray =
                        (this && this.__spreadArray) ||
                        function (to, from) {
                            for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];
                            return to;
                        };
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.CompositeRouteCondition =
                        exports.RouteConditionHolder =
                        exports.AbstractRouteCondition =
                        exports.AbstractNameValueExpression =
                        exports.likeRouteCondition =
                            void 0;
                    var util_1 = __webpack_require__(4);
                    /**
                     * A contract for `"name!=value"` style expression used to specify route parameters.
                     * @interface module:dispatcher.NameValueExpression
                     */
                    /**
                     * @member {external:boolean} module:dispatcher.NameValueExpression#isNegated
                     */
                    /**
                     * @member {external:string} module:dispatcher.NameValueExpression#name
                     */
                    /**
                     * @member {*} module:dispatcher.NameValueExpression#value
                     */
                    /**
                     * Contract for route mapping conditions.
                     *
                     * Request conditions can be combined via {@linkcode module:router.RouteCondition#merge|merge()}, matched to a route via {@linkcode module:router.RouteCondition#getMatchingCondition|getMatchingCondition()}, and compared to each other via {@linkcode module:router.RouteCondition#compareTo|compareTo()} to determine which is a closer match to the given route.
                     * @interface module:router.RouteCondition
                     */
                    /**
                     * Merge this condition with another such as conditions from a type-level and method-level `RequestMapping` decorator.
                     * @function module:router.RouteCondition#merge
                     * @param {*} value
                     * @return {*}
                     */
                    /**
                     * Check if the condition matches the route returning a potentially new instance created for the current route.
                     *
                     * For example a condition with multiple path patterns may return a new instance only with those patterns that match the route.
                     * @function module:router.RouteCondition#getMatchingCondition
                     * @param {module:dispatcher.Request} route
                     * @return {*} A condition instance in case of a match or `null` otherwise.
                     */
                    /**
                     * Compare this condition to another condition, optionally in the context of a specific route. This method assumes both instances have been obtained via `getMatchingCondition`.
                     * @function module:router.RouteCondition#compareTo
                     * @param {*} value
                     * @param {module:dispatcher.Request} [route]
                     * @return {external:number}
                     */
                    var defineProperty = Reflect.defineProperty;
                    /**
                     * @function module:dispatcher.likeRouteCondition
                     * @param {*} value
                     * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:router.RouteCondition|RouteCondition}.
                     */
                    exports.likeRouteCondition = util_1.like({ merge: Function, getMatchingCondition: Function });
                    var AbstractNameValueExpression = /** @class */ (function () {
                        function AbstractNameValueExpression(expression) {
                            var index = expression.indexOf('=');
                            if (index === -1) {
                                defineProperty(this, 'isNegated', {
                                    value: expression.startsWith('!'),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'name', {
                                    value: this.isNegated ? expression.substring(1) : expression,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            } else {
                                defineProperty(this, 'isNegated', {
                                    value: index > 0 && expression[index - 1] === '!',
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'name', {
                                    value: this.isNegated
                                        ? expression.substring(0, index - 1)
                                        : expression.substring(0, index),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'value', {
                                    value: this.parseValue(expression.substring(index + 1)),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                        }
                        AbstractNameValueExpression.prototype.match = function (route) {
                            var isMatch = this.value ? this.matchValue(route) : this.matchName(route);
                            return this.isNegated !== isMatch;
                        };
                        AbstractNameValueExpression.prototype.toJSON = function () {
                            return this.toString();
                        };
                        AbstractNameValueExpression.prototype.toString = function () {
                            var negate = this.isNegated ? '!' : '';
                            return this.value !== void 0
                                ? '' + this.name + negate + '=' + this.value
                                : '' + negate + this.name;
                        };
                        return AbstractNameValueExpression;
                    })();
                    exports.AbstractNameValueExpression = AbstractNameValueExpression;
                    var AbstractRouteCondition = /** @class */ (function () {
                        function AbstractRouteCondition() {}
                        Object.defineProperty(AbstractRouteCondition.prototype, 'isEmpty', {
                            get: function () {
                                return this.content.length === 0;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        AbstractRouteCondition.prototype.equals = function (value) {
                            if (this === value) {
                                return true;
                            }
                            if (value === void 0 || this.constructor !== value.constructor) {
                                return false;
                            }
                            return this.toString() === value.toString();
                        };
                        AbstractRouteCondition.prototype.toJSON = function () {
                            return this.toString();
                        };
                        AbstractRouteCondition.prototype.toString = function () {
                            return '[' + this.content.join(this.infix) + ']';
                        };
                        return AbstractRouteCondition;
                    })();
                    exports.AbstractRouteCondition = AbstractRouteCondition;
                    /**
                     * Supports "name=value" style expressions.
                     * @abstract
                     * @class module:dispatcher.AbstractNameValueExpression
                     * @implements module:dispatcher.NameValueExpression
                     * @see {@link module:dispatcher.ParamExpression}
                     */
                    /**
                     * A base class for {@linkcode module:router.RouteCondition|RouteCondition} types.
                     * @abstract
                     * @class module:dispatcher.AbstractRouteCondition
                     * @implements module:router.RouteCondition
                     */
                    /**
                     * The discrete items a route condition is composed of, e.g. URL patterns, param expressions, etc.
                     * @abstract
                     * @member module:dispatcher.AbstractRouteCondition#content
                     */
                    /**
                     * @class module:router.RouteConditionHolder
                     * @extends module:dispatcher.AbstractRouteCondition<module:router.RouteConditionHolder>
                     */
                    var RouteConditionHolder = /** @class */ (function (_super) {
                        __extends(RouteConditionHolder, _super);
                        function RouteConditionHolder(routeCondition) {
                            if (routeCondition === void 0) {
                                routeCondition = null;
                            }
                            var _this = _super.call(this) || this;
                            defineProperty(_this, 'condition', {
                                value: routeCondition,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(RouteConditionHolder.prototype, 'content', {
                            get: function () {
                                return this.condition ? [this.condition] : [];
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(RouteConditionHolder.prototype, 'infix', {
                            get: function () {
                                return ' ';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * Combine the route conditions held by the two RouteConditionHolder instances after making sure the conditions are of the same type. Or if one holder is empty, the other holder is returned.
                         * @function module:router.RouteConditionHolder#merge
                         * @param {module:router.RouteConditionHolder} other
                         * @returns {module:router.RouteConditionHolder}
                         */
                        RouteConditionHolder.prototype.merge = function (other) {
                            if (!this.condition && !other.condition) {
                                return this;
                            } else if (!this.condition) {
                                return other;
                            } else if (!other.condition) {
                                return this;
                            } else {
                                var combined = this.condition.merge(other.condition);
                                return new RouteConditionHolder(combined);
                            }
                        };
                        RouteConditionHolder.prototype.getMatchingCondition = function (route) {
                            if (!this.condition) {
                                return this;
                            }
                            var match = this.condition.getMatchingCondition(route);
                            return match ? new RouteConditionHolder(match) : null;
                        };
                        RouteConditionHolder.prototype.compareTo = function (value, route) {
                            if (!this.condition && !value.condition) {
                                return 0;
                            } else if (!this.condition) {
                                return 1;
                            } else if (!value.condition) {
                                return -1;
                            } else {
                                return this.condition.compareTo(value.condition, route);
                            }
                        };
                        return RouteConditionHolder;
                    })(AbstractRouteCondition);
                    exports.RouteConditionHolder = RouteConditionHolder;
                    /**
                     * Implements the {@linkcode module:router.RouteCondition|RouteCondition} contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.
                     *
                     * When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.
                     * @class module:dispatcher.CompositeRouteCondition
                     */
                    var CompositeRouteCondition = /** @class */ (function (_super) {
                        __extends(CompositeRouteCondition, _super);
                        function CompositeRouteCondition() {
                            var routeConditions = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                routeConditions[_i] = arguments[_i];
                            }
                            var _this = _super.call(this) || this;
                            if (routeConditions.length) {
                                if (exports.likeRouteCondition(routeConditions[0])) {
                                    defineProperty(_this, 'routeConditions', {
                                        value: _this._wrap.apply(_this, routeConditions),
                                        configurable: true,
                                        enumerable: false,
                                        writable: false,
                                    });
                                } else {
                                    defineProperty(_this, 'routeConditions', {
                                        value: routeConditions,
                                        configurable: true,
                                        enumerable: false,
                                        writable: false,
                                    });
                                }
                            }
                            return _this;
                        }
                        Object.defineProperty(CompositeRouteCondition.prototype, 'infix', {
                            get: function () {
                                return ' && ';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(CompositeRouteCondition.prototype, 'isEmpty', {
                            get: function () {
                                return this.length === 0;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(CompositeRouteCondition.prototype, 'length', {
                            get: function () {
                                return this.routeConditions.length;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(CompositeRouteCondition.prototype, 'conditions', {
                            get: function () {
                                return this._unwrap.apply(this, this.routeConditions);
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        Object.defineProperty(CompositeRouteCondition.prototype, 'content', {
                            get: function () {
                                return !this.isEmpty ? this.conditions : [];
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * If one instance is empty, return the other. If both instances have conditions, combine the individual conditions after ensuring they are of the same type and number.
                         * @function module:dispatcher.CompositeRouteCondition#merge
                         * @param {module:dispatcher.CompositeRouteCondition} other
                         * @returns {module:dispatcher.CompositeRouteCondition}
                         */
                        CompositeRouteCondition.prototype.merge = function (other) {
                            if (this.isEmpty && other.isEmpty) {
                                return this;
                            } else if (other.isEmpty) {
                                return this;
                            } else if (this.isEmpty) {
                                return other;
                            } else {
                                var length = this.length,
                                    combinedConditions = new Array(length);
                                for (var index = 0; index < length; index++) {
                                    combinedConditions[index] = this.routeConditions[index].merge(
                                        other.routeConditions[index]
                                    );
                                }
                                return new (CompositeRouteCondition.bind.apply(
                                    CompositeRouteCondition,
                                    __spreadArray([void 0], combinedConditions)
                                ))();
                            }
                        };
                        CompositeRouteCondition.prototype.getMatchingCondition = function (route) {
                            if (this.isEmpty) {
                                return this;
                            }
                            var length = this.length,
                                matchingConditions = new Array(length);
                            for (var index = 0; index < length; index++) {
                                matchingConditions[index] = this.routeConditions[index].getMatchingCondition(route);
                                if (matchingConditions[index] === null) {
                                    return null;
                                }
                            }
                            return new (CompositeRouteCondition.bind.apply(
                                CompositeRouteCondition,
                                __spreadArray([void 0], matchingConditions)
                            ))();
                        };
                        CompositeRouteCondition.prototype.compareTo = function (value, route) {
                            if (this.isEmpty && value.isEmpty) {
                                return 0;
                            } else if (this.isEmpty) {
                                return 1;
                            } else if (value.isEmpty) {
                                return -1;
                            } else {
                                var length = this.length;
                                var index = 0;
                                for (; index < length; index++) {
                                    var result = this.routeConditions[index].compareTo(
                                        value.routeConditions[index],
                                        route
                                    );
                                    if (result !== 0) {
                                        return result;
                                    }
                                }
                                return 0;
                            }
                        };
                        CompositeRouteCondition.prototype._wrap = function () {
                            var conditions = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                conditions[_i] = arguments[_i];
                            }
                            return conditions.map(function (condition) {
                                return new RouteConditionHolder(condition);
                            });
                        };
                        CompositeRouteCondition.prototype._unwrap = function () {
                            var wrappedConditions = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                wrappedConditions[_i] = arguments[_i];
                            }
                            return wrappedConditions.map(function (wrappedCondition) {
                                return wrappedCondition.condition;
                            });
                        };
                        return CompositeRouteCondition;
                    })(AbstractRouteCondition);
                    exports.CompositeRouteCondition = CompositeRouteCondition;

                    /***/
                },
                /* 24 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsLanguageResolverStrategy = void 0;
                    var language_resolver_1 = __webpack_require__(25);
                    /**
                     * @interface module:dispatcher.LanguageResolverStrategy
                     */
                    var defineProperty = Reflect.defineProperty,
                        LANGUAGE_RESOLVER = 'languageResolver',
                        defaultLanguageResolver = new language_resolver_1.NavigatorLanguageResolver('en-US');
                    var AsLanguageResolverStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'languageResolverKey', {
                                    get: function () {
                                        return LANGUAGE_RESOLVER;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(LANGUAGE_RESOLVER);
                                return _this;
                            }
                            class_1.prototype.initLanguageResolver = function (context) {
                                var languageResolverKey = this.languageResolverKey;
                                this.initStrategy(
                                    context,
                                    languageResolverKey,
                                    LANGUAGE_RESOLVER,
                                    defaultLanguageResolver
                                );
                                console.log('Dispatcher::initLanguageResolver', this.languageResolver);
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsLanguageResolverStrategy = AsLanguageResolverStrategy;

                    /***/
                },
                /* 25 */
                /***/ function (__unused_webpack_module, exports) {
                    'use strict';

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
                    exports.NavigatorLanguageResolver = exports.AbstractLanguageResolver = void 0;
                    var AbstractLanguageResolver = /** @class */ (function () {
                        function AbstractLanguageResolver(defaultLanguage) {
                            Reflect.defineProperty(this, 'defaultLanguage', {
                                value: defaultLanguage,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        return AbstractLanguageResolver;
                    })();
                    exports.AbstractLanguageResolver = AbstractLanguageResolver;
                    /**
                     * @interface module:dispatcher.LanguageResolver
                     */
                    /**
                     * @function module:dispatcher.LanguageResolver#resolveLanguage
                     */
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractLanguageResolver
                     * @implements {module:dispatcher.LanguageResolver}
                     */
                    /**
                     * @class module:dispatcher.NavigatorLanguageResolver
                     * @extends {module:dispatcher.AbstractLanguageResolver}
                     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage}
                     */
                    var NavigatorLanguageResolver = /** @class */ (function (_super) {
                        __extends(NavigatorLanguageResolver, _super);
                        function NavigatorLanguageResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(NavigatorLanguageResolver.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'NavigatorLanguageResolver';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * @function module:dispatcher.resolveLanguage
                         * @param {module:router.Route} route
                         */
                        NavigatorLanguageResolver.prototype.resolveLanguage = function (route) {
                            var lang;
                            if (navigator) {
                                if (navigator.language) {
                                    lang = navigator.language;
                                } else if (navigator.languages && navigator.languages.length) {
                                    lang = navigator.languages[0];
                                }
                            } else {
                                lang = this.defaultLanguage;
                            }
                            // * I think this is the Optional Chaining equivalent to the logic above.
                            //lang = navigator?.language || navigator?.languages?.length ? navigator.languages[ 0 ] : this.defaultLanguage;
                            return lang;
                        };
                        return NavigatorLanguageResolver;
                    })(AbstractLanguageResolver);
                    exports.NavigatorLanguageResolver = NavigatorLanguageResolver;
                    /**
                     * * Developer Notes
                     * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
                     */

                    /***/
                },
                /* 26 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsRouteToViewNameTranslatorStrategy = void 0;
                    var route_to_view_name_translator_1 = __webpack_require__(27);
                    /**
                     * @interface module:dispatcher.RequestToViewNameTranslatorStrategy
                     */
                    var defineProperty = Reflect.defineProperty,
                        ROUTE_TO_VIEW_NAME_TRANSLATOR = 'routeToViewNameTranslator',
                        defaultRouteToViewNameTranslator =
                            new route_to_view_name_translator_1.DefaultRouteToViewNameTranslator();
                    var AsRouteToViewNameTranslatorStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'routeToViewNameTranslatorKey', {
                                    get: function () {
                                        return ROUTE_TO_VIEW_NAME_TRANSLATOR;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(ROUTE_TO_VIEW_NAME_TRANSLATOR);
                                return _this;
                            }
                            class_1.prototype.initRouteToViewNameTranslator = function (context) {
                                var routeToViewNameTranslatorKey = this.routeToViewNameTranslatorKey;
                                this.initStrategy(
                                    context,
                                    routeToViewNameTranslatorKey,
                                    ROUTE_TO_VIEW_NAME_TRANSLATOR,
                                    defaultRouteToViewNameTranslator
                                );
                                console.log(
                                    'Dispatcher::initRouteToViewNameTranslator',
                                    this.routeToViewNameTranslator
                                );
                            };
                            /**
                             * Translate the supplied route into a default view name.
                             * @function module:dispatcher.RouteToViewNameTranslatorStrategy#getDefaultViewName
                             * @param {module:router.Route} route The current route
                             * @returns {external:string} The view name or `null` if no default found.
                             */
                            class_1.prototype.getDefaultViewName = function (route) {
                                return this.routeToViewNameTranslator
                                    ? this.routeToViewNameTranslator.getViewName(route)
                                    : null;
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsRouteToViewNameTranslatorStrategy = AsRouteToViewNameTranslatorStrategy;

                    /***/
                },
                /* 27 */
                /***/ (__unused_webpack_module, exports) => {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.DefaultRouteToViewNameTranslator = void 0;
                    /**
                     * @interface module:router.RouteToViewNameTranslator
                     */
                    /**
                     * @function module:router.RouteToViewNameTranslator#getViewName
                     * @param {module:router.Route} route
                     * @returns {external:string}
                     */
                    var defineProperty = Reflect.defineProperty,
                        slash = '/';
                    /**
                     * @class module:dispatcher.DefaultRouteToViewNameTranslator
                     * @implements module:router.RouteToViewNameTranslator
                     */
                    var DefaultRouteToViewNameTranslator = /** @class */ (function () {
                        function DefaultRouteToViewNameTranslator() {
                            defineProperty(this, 'prefix', {
                                value: '',
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                            defineProperty(this, 'separator', {
                                value: slash,
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                            defineProperty(this, 'suffix', {
                                value: '',
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                        }
                        /**
                         * @function module:dispatcher.DefaultRouteToViewNameTranslator#getViewName
                         * @param {module:router.Route} route
                         */
                        DefaultRouteToViewNameTranslator.prototype.getViewName = function (route) {
                            console.log('DefaultRouteToViewNameTranslator::getViewName', route);
                            var viewName = '' + this.prefix + route.path + this.suffix;
                            if (this.separator !== slash) {
                                viewName = viewName.replace(slash, this.separator);
                            }
                            return viewName;
                        };
                        return DefaultRouteToViewNameTranslator;
                    })();
                    exports.DefaultRouteToViewNameTranslator = DefaultRouteToViewNameTranslator;
                    /**
                     * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#prefix=''
                     */
                    /**
                     * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#separator='/'
                     */
                    /**
                     * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#suffix=''
                     */

                    /***/
                },
                /* 28 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsThemeResolverStrategy = void 0;
                    var theme_resolver_1 = __webpack_require__(29);
                    /**
                     * @interface module:dispatcher.ThemeResolverStrategy
                     */
                    var defineProperty = Reflect.defineProperty,
                        THEME_RESOLVER = 'themeResolver',
                        defaultThemeResolver = new theme_resolver_1.FixedThemeResolver('');
                    var AsThemeResolverStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'themeResolverKey', {
                                    get: function () {
                                        return THEME_RESOLVER;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(THEME_RESOLVER);
                                return _this;
                            }
                            class_1.prototype.initThemeResolver = function (context) {
                                var themeResolverKey = this.themeResolverKey;
                                this.initStrategy(context, themeResolverKey, THEME_RESOLVER, defaultThemeResolver);
                                console.log('Dispatcher::initThemeResolver', this.themeResolver);
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsThemeResolverStrategy = AsThemeResolverStrategy;

                    /***/
                },
                /* 29 */
                /***/ function (__unused_webpack_module, exports) {
                    'use strict';

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
                    exports.FixedThemeResolver = exports.AbstractThemeResolver = void 0;
                    /**
                     * @interface module:dispatcher.ThemeResolver
                     */
                    /**
                     * @function module:dispatcher.ThemeResolver#resolveTheme
                     * @param {module:dispatcher.Route} route
                     * @returns {external:string} The theme name
                     */
                    var defineProperty = Reflect.defineProperty;
                    var AbstractThemeResolver = /** @class */ (function () {
                        function AbstractThemeResolver(defaultThemeName) {
                            defineProperty(this, 'defaultThemeName', {
                                value: defaultThemeName,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        Object.defineProperty(AbstractThemeResolver.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'ThemeResolver';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        return AbstractThemeResolver;
                    })();
                    exports.AbstractThemeResolver = AbstractThemeResolver;
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractThemeResolver
                     * @implements {module:dispatcher.ThemeResolver}
                     */
                    /**
                     * @member {external:string} module:dispatcher.AbstractThemeResolver#defaultThemeName
                     */
                    /**
                     * @abstract
                     * @function module:dispatcher.AbstractThemeResolver#resolveTheme
                     * @param {module:dispatcher.Route} route
                     * @returns {external:string} The theme name
                     */
                    /**
                     * @class module:dispatcher.FixedThemeResolver
                     * @extends {module:dispatcher.AbstractThemeResolver}
                     */
                    var FixedThemeResolver = /** @class */ (function (_super) {
                        __extends(FixedThemeResolver, _super);
                        function FixedThemeResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        FixedThemeResolver.prototype.resolveTheme = function (route) {
                            return this.defaultThemeName;
                        };
                        return FixedThemeResolver;
                    })(AbstractThemeResolver);
                    exports.FixedThemeResolver = FixedThemeResolver;

                    /***/
                },
                /* 30 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsRouteErrorResolverStrategy = void 0;
                    var route_error_resolver_1 = __webpack_require__(31);
                    /**
                     * @interface module:dispatcher.ErrorResolverStrategy
                     */
                    var defineProperty = Reflect.defineProperty,
                        ERROR_RESOLVER = 'errorResolver',
                        ERROR_RESOLVERS = ERROR_RESOLVER + 's',
                        defaultRouteErrorResolvers = [new route_error_resolver_1.MetadataErrorResolver()];
                    var AsRouteErrorResolverStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'errorResolverKey', {
                                    get: function () {
                                        return ERROR_RESOLVER;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                defineProperty(_this, 'errorResolverCollectionKey', {
                                    get: function () {
                                        return ERROR_RESOLVERS;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(ERROR_RESOLVERS);
                                return _this;
                            }
                            class_1.prototype.initErrorResolvers = function (context) {
                                var _a = this,
                                    errorResolverKey = _a.errorResolverKey,
                                    errorResolverCollectionKey = _a.errorResolverCollectionKey;
                                this.initCollectionStrategy(
                                    context,
                                    errorResolverCollectionKey,
                                    errorResolverKey,
                                    ERROR_RESOLVERS,
                                    defaultRouteErrorResolvers
                                );
                                console.log('Dispatcher::initRouteErrorResolvers', this.errorResolvers);
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsRouteErrorResolverStrategy = AsRouteErrorResolverStrategy;

                    /***/
                },
                /* 31 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.SimpleMappingErrorResolver =
                        exports.MetadataErrorResolver =
                        exports.DefaultRouteErrorResolver =
                        exports.AbstractHandlerMethodErrorResolver =
                        exports.AbstractRouteErrorResolver =
                            void 0;
                    var core_1 = __webpack_require__(5);
                    var model_and_view_1 = __webpack_require__(7);
                    var route_handler_method_1 = __webpack_require__(16);
                    var error_mapping_1 = __webpack_require__(32);
                    var factory_1 = __webpack_require__(15);
                    /**
                     * Interface to be implemented by classes that can resolve errors thrown during route mapping or execution. Implementors are typically registered as values in the application context.
                     * @interface module:router.RouteErrorResolver
                     */
                    /**
                     * Try to resolve the error that was thrown during route handler execution, returning a {@linkcode module:dispatcher.ModelAndView|ModelAndView} that represents the specific error page, if appropriate.
                     * The returned `ModelAndView` may be empty to indicate the error has been resolved but that no view should be rendered.
                     * @function module:router.RouteErrorResolver#resolveError
                     * @param {module:router.Route} route The current route
                     * @param {*} handler The executed route handler or `null` if none chosen at the time of the error.
                     * @param {external:Error} error
                     * @returns {module:dispatcher.ModelAndView} A corresponding `ModelAndView` to forward to or `null`.
                     */
                    var defineProperty = Reflect.defineProperty,
                        getPrototypeOf = Reflect.getPrototypeOf,
                        keys = Object.keys,
                        getErrorHandlerMethodForError = function (errorHandler, error) {
                            var /**
                                 * ! THIS DID NOT WORK UNLESS getPrototypeOf WAS USED!!!!
                                 */
                                handlerKeys = keys(getPrototypeOf(errorHandler)),
                                length = handlerKeys.length;
                            if (length) {
                                for (var index = 0; index < length; index++) {
                                    var key = handlerKeys[index];
                                    if (error_mapping_1.errorMapping.has(errorHandler, key)) {
                                        var errorClasses = error_mapping_1.errorMapping.get(errorHandler, key);
                                        if (
                                            errorClasses.some(function (errorClass) {
                                                return error instanceof errorClass;
                                            })
                                        ) {
                                            return new route_handler_method_1.ErrorHandlerMethod(errorHandler, key);
                                        }
                                    }
                                }
                            }
                            return null;
                        };
                    var AbstractRouteErrorResolver = /** @class */ (function () {
                        function AbstractRouteErrorResolver() {
                            this.mappedHandlers = null;
                            this.mappedHandlerClasses = [Object];
                        }
                        Object.defineProperty(AbstractRouteErrorResolver.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'HandlerErrorResolver';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        AbstractRouteErrorResolver.prototype.resolveError = function (route, handler, error) {
                            if (this._shouldApplyTo(route, handler)) {
                                var result = this._resolveError(route, handler, error);
                                return result;
                            } else {
                                return null;
                            }
                        };
                        AbstractRouteErrorResolver.prototype._shouldApplyTo = function (route, handler) {
                            var _a = this,
                                mappedHandlers = _a.mappedHandlers,
                                mappedHandlerClasses = _a.mappedHandlerClasses;
                            if (handler) {
                                if (mappedHandlers && mappedHandlers.indexOf(handler) !== -1) {
                                    return true;
                                }
                                if (mappedHandlerClasses) {
                                    var length = mappedHandlerClasses.length;
                                    if (length) {
                                        for (var index = 0; index < length; index++) {
                                            var mappedHandlerClass = mappedHandlerClasses[index];
                                            if (handler instanceof mappedHandlerClass) {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                            return !mappedHandlers && !mappedHandlerClasses;
                        };
                        return AbstractRouteErrorResolver;
                    })();
                    exports.AbstractRouteErrorResolver = AbstractRouteErrorResolver;
                    var AbstractHandlerMethodErrorResolver = /** @class */ (function (_super) {
                        __extends(AbstractHandlerMethodErrorResolver, _super);
                        function AbstractHandlerMethodErrorResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        AbstractHandlerMethodErrorResolver.prototype._shouldApplyTo = function (route, handler) {
                            if (!handler) {
                                return _super.prototype._shouldApplyTo.call(this, route, null);
                            } else if (handler instanceof route_handler_method_1.RouteHandlerMethod) {
                                return _super.prototype._shouldApplyTo.call(this, route, handler.handler);
                            }
                            return false;
                        };
                        AbstractHandlerMethodErrorResolver.prototype._resolveError = function (route, handler, error) {
                            return this._resolveHandlerMethodError(route, handler, error);
                        };
                        return AbstractHandlerMethodErrorResolver;
                    })(AbstractRouteErrorResolver);
                    exports.AbstractHandlerMethodErrorResolver = AbstractHandlerMethodErrorResolver;
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractRouteErrorResolver
                     * @implements module:router.RouteErrorResolver
                     */
                    /**
                     * @abstract
                     * @protected
                     * @function module:dispatcher.AbstractRouteErrorResolver#_resolveError
                     */
                    /**
                     * @abstract
                     * @class module:dispatcher.AbstractHandlerMethodErrorResolver
                     * @extends module:dispatcher.AbstractRouteErrorResolver
                     */
                    /**
                     * The default implementation of the {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} interface, resolving standard BlueJS exceptions.
                     *
                     * This error resolver is enabled by default in the {@linkcode module:dispatcher.WebDispatcher|WebDispatcher}.
                     * @class module:dispatcher.DefaultRouteErrorResolver
                     * @extends module:dispatcher.AbstractRouteErrorResolver
                     */
                    var DefaultRouteErrorResolver = /** @class */ (function (_super) {
                        __extends(DefaultRouteErrorResolver, _super);
                        function DefaultRouteErrorResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        DefaultRouteErrorResolver.prototype._resolveError = function (route, handler, error) {
                            try {
                                switch (error.constructor) {
                                    case core_1.FrameworkError: {
                                        // TODO provide real implementation
                                        return new model_and_view_1.ModelAndView('default');
                                    }
                                    case core_1.ApplicationError: {
                                        // TODO provide real implementation
                                        return new model_and_view_1.ModelAndView('default');
                                    }
                                    default: {
                                        // TODO provide real implementation
                                        return new model_and_view_1.ModelAndView('default');
                                    }
                                }
                            } catch (e) {
                                // TODO Use real logger
                                console.warn('Failure while trying to resolve error', e);
                            }
                            return null;
                        };
                        return DefaultRouteErrorResolver;
                    })(AbstractRouteErrorResolver);
                    exports.DefaultRouteErrorResolver = DefaultRouteErrorResolver;
                    /**
                     * An {@linkcode module:dispatcher.AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
                     * @class module:dispatcher.MetadataErrorResolver
                     * @extends module:dispatcher.AbstractRouteErrorResolver
                     * @implements module:context.ApplicationContextAware
                     * @implements module:context.Initializable
                     */
                    var MetadataErrorResolver = /** @class */ (function (_super) {
                        __extends(MetadataErrorResolver, _super);
                        function MetadataErrorResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        Object.defineProperty(MetadataErrorResolver.prototype, factory_1.$aware, {
                            get: function () {
                                return true;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        MetadataErrorResolver.prototype.setApplicationContext = function (applicationContext) {
                            defineProperty(this, 'applicationContext', {
                                value: applicationContext,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        };
                        MetadataErrorResolver.prototype._getErrorHandlerMethod = function (handlerMethod, error) {
                            var errorHandlerMethod = null;
                            if (handlerMethod) {
                                errorHandlerMethod = getErrorHandlerMethodForError(handlerMethod.handler, error);
                            }
                            if (!errorHandlerMethod) {
                                var applicationContext = this.applicationContext;
                                if (applicationContext) {
                                    var contextKeys = keys(applicationContext),
                                        length = contextKeys.length;
                                    if (length) {
                                        for (var index = 0; index < length; index++) {
                                            var key = contextKeys[index],
                                                value = applicationContext.getValue(key);
                                            if (error_mapping_1.likeErrorHandler(value)) {
                                                errorHandlerMethod = getErrorHandlerMethodForError(value, error);
                                                if (errorHandlerMethod) {
                                                    return errorHandlerMethod;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return errorHandlerMethod;
                        };
                        MetadataErrorResolver.prototype._resolveHandlerMethodError = function (
                            route,
                            handlerMethod,
                            error
                        ) {
                            var errorHandlerMethod = this._getErrorHandlerMethod(handlerMethod, error);
                            if (!errorHandlerMethod) {
                                return null;
                            }
                            try {
                                return errorHandlerMethod.invoke(route, error, handlerMethod);
                            } catch (e) {
                                return null;
                            }
                        };
                        return MetadataErrorResolver;
                    })(AbstractHandlerMethodErrorResolver);
                    exports.MetadataErrorResolver = MetadataErrorResolver;
                    /**
                     * {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the {@linkcode module:dispatcher.Dispatcher|Dispatcher}.
                     * @class module:dispatcher.SimpleMappingErrorResolver
                     * @extends module:dispatcher.AbstractRouteErrorResolver
                     * @see {@link module:dispatcher.Dispatcher}
                     */
                    var SimpleMappingErrorResolver = /** @class */ (function (_super) {
                        __extends(SimpleMappingErrorResolver, _super);
                        function SimpleMappingErrorResolver(defaultErrorView) {
                            var _this = _super.call(this) || this;
                            /**
                             * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#defaultErrorView
                             */
                            defineProperty(_this, 'defaultErrorView', {
                                value: defaultErrorView || null,
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                            /**
                             * Set the mappings between error class names and error view names. The error class name can be a substring, with no wildcard support.
                             *
                             * Consider carefully how specific the pattern is. For example, "Error" will match nearly anything, and will probably hide other rules.
                             * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#errorMappings
                             */
                            defineProperty(_this, 'errorMappings', {
                                value: new Map(),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(SimpleMappingErrorResolver.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'SimpleMappingErrorResolver';
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        /**
                         * Actually resolve the given error that got thrown during on handler execution, returning a `ModelAndView` that represents a specific error page if appropriate.
                         *
                         * May be overridden in subclasses, in order to apply specific error checks.
                         * @protected
                         * @function module:dispatcher.SimpleMappingErrorResolver#_resolveError
                         * @param {module:router.Route} route The current route.
                         * @param {*} handler The executed handler or `null` if none chosen at the time of the error.
                         * @param {external:Error} error The error that was thrown during execution.
                         * @returns {module:dispatcher.ModelAndView} The corresponding `ModelAndView` to forward to or `null` for default processing in the resolution chain.
                         */
                        SimpleMappingErrorResolver.prototype._resolveError = function (route, handler, error) {
                            var errorMappings = this.errorMappings,
                                errorView = errorMappings.has(error.name)
                                    ? errorMappings.get(error.name)
                                    : this.defaultErrorView;
                            if (errorView) {
                                var mv = new model_and_view_1.ModelAndView(errorView);
                                //mv.error = error;
                                return mv;
                            }
                            return null;
                        };
                        return SimpleMappingErrorResolver;
                    })(AbstractRouteErrorResolver);
                    exports.SimpleMappingErrorResolver = SimpleMappingErrorResolver;

                    /***/
                },
                /* 32 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    'use strict';

                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.errorMapping = exports.likeErrorHandler = exports.errorHandler = void 0;
                    __webpack_require__(3);
                    var util_1 = __webpack_require__(4);
                    var ERROR_HANDLER = 'error:handler',
                        ERROR_MAPPING = 'error:mapping',
                        assign = Object.assign,
                        defineMetadata = Reflect.defineMetadata,
                        deleteMetadata = Reflect.deleteMetadata,
                        getMetadata = Reflect.getMetadata,
                        getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor,
                        hasMetadata = Reflect.hasMetadata,
                        hasFunction = util_1.propIs(Function),
                        defineErrorHandler = function (target) {
                            return defineMetadata(ERROR_HANDLER, true, target);
                        },
                        defineErrorMapping = function (value, target, propertyKey) {
                            return defineMetadata(ERROR_MAPPING, value, target, propertyKey);
                        },
                        deleteErrorHandler = function (target) {
                            return deleteMetadata(ERROR_HANDLER, target);
                        },
                        deleteErrorMapping = function (target, propertyKey) {
                            return deleteMetadata(ERROR_MAPPING, target, propertyKey);
                        },
                        getErrorHandler = function (target) {
                            return getMetadata(ERROR_HANDLER, target);
                        },
                        getErrorMapping = function (target, propertyKey) {
                            return getMetadata(ERROR_MAPPING, target, propertyKey);
                        },
                        hasErrorHandler = function (target) {
                            return hasMetadata(ERROR_HANDLER, target);
                        },
                        hasErrorMapping = function (target, propertyKey) {
                            return hasMetadata(ERROR_MAPPING, target, propertyKey);
                        },
                        eh = function (target) {
                            return defineErrorHandler(target);
                        },
                        em = function (errorClass) {
                            if (errorClass === void 0) {
                                errorClass = Error;
                            }
                            return function (target, propertyKey, descriptor) {
                                defineErrorMapping(
                                    Array.isArray(errorClass) ? errorClass : [errorClass],
                                    target,
                                    propertyKey
                                );
                                if (!descriptor) {
                                    descriptor = getOwnPropertyDescriptor(target, propertyKey);
                                }
                                descriptor.enumerable = true;
                                return descriptor;
                            };
                        };
                    /**
                     * @function module:dispatcher.errorHandler
                     * @param {external:Error} errorClass
                     * @returns {external:Function}
                     */
                    /**
                     * @const {external:ClassDecorator} module:dispatcher.errorHandler(2)
                     */
                    exports.errorHandler = assign(eh, {
                        /**
                         * @function module:dispatcher.errorHandler.define
                         * @param {*} target
                         */
                        define: defineErrorHandler,
                        /**
                         * @function module:dispatcher.errorHandler.delete
                         * @param {*} target
                         */
                        delete: deleteErrorHandler,
                        /**
                         * @function module:dispatcher.errorHandler.get
                         * @param {*} target
                         * @returns {external:boolean}
                         */
                        get: getErrorHandler,
                        /**
                         * @function module:dispatcher.errorHandler.has
                         * @param {*} target
                         * @returns {external:boolean} Whether or not the `target` is defined as an error handler.
                         */
                        has: hasErrorHandler,
                    });
                    var isDefined = util_1.complement(util_1.isNil),
                        hasConstructor = hasFunction('constructor'),
                        constructorIsErrorHandler = util_1.propSatisfies(hasErrorHandler, 'constructor');
                    exports.likeErrorHandler = util_1.both(
                        isDefined,
                        util_1.either(hasErrorHandler, util_1.both(hasConstructor, constructorIsErrorHandler))
                    );
                    /**
                     * @function module:dispatcher.errorMapping
                     * @param {external:Error} errorClass
                     * @returns {external:Function}
                     */
                    /**
                     * @const {external:ClassDecorator} module:dispatcher.errorMapping(2)
                     */
                    exports.errorMapping = assign(em, {
                        /**
                         * @function module:dispatcher.errorMapping.define
                         * @param {*} value
                         * @param {*} target
                         * @param {external:string|external:symbol} propertyKey
                         */
                        define: defineErrorMapping,
                        /**
                         * @function module:dispatcher.errorMapping.delete
                         * @param {*} target
                         * @param {external:string|external:symbol} propertyKey
                         */
                        delete: deleteErrorMapping,
                        /**
                         * @function module:dispatcher.errorMapping.get
                         * @param {*} target
                         * @param {external:string|external:symbol} propertyKey
                         * @returns {external:Array<module:core.Constructable<external:Error>>}
                         */
                        get: getErrorMapping,
                        /**
                         * @function module:dispatcher.errorMapping.has
                         * @param {*} target
                         * @param {external:string|external:symbol} propertyKey
                         * @returns {external:boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
                         */
                        has: hasErrorMapping,
                    });

                    /***/
                },
                /* 33 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsViewResolverStrategy = void 0;
                    var view_1 = __webpack_require__(8);
                    /**
                     * @interface module:dispatcher.ViewResolverStrategy
                     */
                    var defineProperty = Reflect.defineProperty,
                        VIEW_RESOLVER = 'viewResolver',
                        VIEW_RESOLVERS = VIEW_RESOLVER + 's',
                        defaultViewResolvers = [new view_1.ImportViewResolver()];
                    var AsViewResolverStrategy = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var _this = _super.apply(this, args) || this;
                                defineProperty(_this, 'viewResolverKey', {
                                    get: function () {
                                        return VIEW_RESOLVER;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                defineProperty(_this, 'viewResolverCollectionKey', {
                                    get: function () {
                                        return VIEW_RESOLVERS;
                                    },
                                    configurable: true,
                                    enumerable: true,
                                });
                                _this.addStrategy(VIEW_RESOLVERS);
                                return _this;
                            }
                            class_1.prototype.initViewResolvers = function (context) {
                                var _a = this,
                                    viewResolverKey = _a.viewResolverKey,
                                    viewResolverCollectionKey = _a.viewResolverCollectionKey;
                                this.initCollectionStrategy(
                                    context,
                                    viewResolverCollectionKey,
                                    viewResolverKey,
                                    VIEW_RESOLVERS,
                                    defaultViewResolvers
                                );
                                console.log('Dispatcher::initViewResolvers', this.viewResolvers);
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsViewResolverStrategy = AsViewResolverStrategy;

                    /***/
                },
                /* 34 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    'use strict';

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
                    exports.AsStrategyInitializer = void 0;
                    var core_1 = __webpack_require__(5);
                    var util_1 = __webpack_require__(4);
                    var isArray = Array.isArray;
                    var AsStrategyInitializer = function (superclass) {
                        return /** @class */ (function (_super) {
                            __extends(class_1, _super);
                            function class_1() {
                                return (_super !== null && _super.apply(this, arguments)) || this;
                            }
                            class_1.prototype.addStrategy = function (name) {
                                if (this.initialized) {
                                    throw new core_1.IllegalStateError('Cannot add strategy after initialization');
                                }
                                if (!this.strategies) {
                                    this.strategies = [];
                                }
                                name && this.strategies.push(name);
                            };
                            class_1.prototype.getDefaultStrategy = function (context, key, strategy) {
                                context.setValue(key, strategy);
                                return context.getValue(key);
                            };
                            class_1.prototype.initStrategies = function (context) {
                                if (!this.initialized) {
                                    this.initialized = true;
                                    var length = this.strategies.length;
                                    var index = 0,
                                        initializer = void 0,
                                        strategy = void 0;
                                    for (; index < length; index++) {
                                        strategy = this.strategies[index];
                                        initializer = 'init' + util_1.toPascal(strategy);
                                        if (typeof this[initializer] !== 'function') {
                                            throw new TypeError(
                                                'Strategy ' +
                                                    strategy +
                                                    ' initializer ' +
                                                    initializer +
                                                    ' is not implemented'
                                            );
                                        }
                                        this[initializer](context);
                                    }
                                    console.log('StrategyInitializer::Initialized');
                                }
                            };
                            class_1.prototype.initCollectionStrategy = function (
                                context,
                                collectionStrategyKey,
                                strategyKey,
                                name,
                                defaultStrategy
                            ) {
                                var _this = this;
                                if (context.hasValue(collectionStrategyKey)) {
                                    var collection = context.getValue(collectionStrategyKey);
                                    if (isArray(collection)) {
                                        this[name] = collection;
                                    } else {
                                        this[name] = [];
                                        collection.forEach(function (value) {
                                            return _this[name].push(value);
                                        });
                                    }
                                } else if (context.hasValue(strategyKey)) {
                                    this[name] = [context.getValue(strategyKey)];
                                }
                                // Fall back to default strategy
                                if (!this[name]) {
                                    this[name] = this.getDefaultStrategy(
                                        context,
                                        collectionStrategyKey,
                                        defaultStrategy
                                    );
                                }
                            };
                            class_1.prototype.initStrategy = function (context, strategyKey, name, defaultStrategy) {
                                if (context.hasValue(strategyKey)) {
                                    this[name] = context.getValue(strategyKey);
                                }
                                // Fall back to default strategy
                                if (!this[name]) {
                                    this[name] = this.getDefaultStrategy(context, strategyKey, defaultStrategy);
                                }
                            };
                            return class_1;
                        })(superclass);
                    };
                    exports.AsStrategyInitializer = AsStrategyInitializer;

                    /***/
                },
                /* 35 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    'use strict';

                    /**
                     * @author David Ensinger
                     * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.MetadataScanner = void 0;
                    __webpack_require__(3);
                    var core_1 = __webpack_require__(5);
                    var defineProperty = Reflect.defineProperty,
                        getMetadata = Reflect.getMetadata,
                        getMetadataKeys = Reflect.getMetadataKeys;
                    /**
                     * ! Changing the "private" properties to truly private, i.e. prepending #, breaks the unit tests - JBR
                     */
                    /**
                     * Create a new MetadataScanner for a given target.
                     * @class module:dispatcher.MetadataScanner
                     * @classdesc Scan an object for metadata defined on the object’s values and cache the resulting property names for subsequent scans.
                     * @param {external:Record} target
                     */
                    var MetadataScanner = /** @class */ (function () {
                        function MetadataScanner(target) {
                            this._cache = new core_1.MultiValueMap();
                            /**
                             * @private
                             * @member {external:Record} module:dispatcher.MetadataScanner#_target
                             */
                            defineProperty(this, '_target', {
                                value: target,
                                configurable: false,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        /**
                         * @private
                         * @function module:dispatcher.MetadataScanner#_primeCache
                         * @param {external:string} metadataKey
                         * @returns {external:Array<external:string>} The property names on the target that have metadata.
                         */
                        MetadataScanner.prototype._primeCache = function (metadataKey) {
                            var target = this._target;
                            var cache = this._cache;
                            var targetProps = Object.keys(target);
                            for (var i = 0; i < targetProps.length; i++) {
                                var prop = targetProps[i];
                                var metadataKeys = getMetadataKeys(target, prop);
                                for (var j = 0; j < metadataKeys.length; j++) {
                                    var key = metadataKeys[j];
                                    if (typeof getMetadata(key, target, prop) !== 'undefined') {
                                        cache.add(key, prop);
                                    }
                                }
                            }
                            return cache.get(metadataKey);
                        };
                        /**
                         * Get the property names of the target object that have the requested metadata.
                         * @function module:dispatcher.MetadataScanner#get
                         * @param {external:string} metadataKey
                         * @returns {external:Array<external:string>} The property names on the target that have metadata.
                         */
                        MetadataScanner.prototype.get = function (metadataKey) {
                            var cache = this._cache;
                            if (Boolean(cache.size)) {
                                if (cache.has(metadataKey)) {
                                    return cache.get(metadataKey);
                                }
                                cache.clear();
                            }
                            return this._primeCache(metadataKey);
                        };
                        /**
                         * Clear the metadata cache for the target object.
                         * @function module:dispatcher.MetadataScanner#clear
                         */
                        MetadataScanner.prototype.clear = function () {
                            this._cache.clear();
                        };
                        return MetadataScanner;
                    })();
                    exports.MetadataScanner = MetadataScanner;
                    /**
                     * Create a WeakMap to store instances of Metadata Scanners
                     * @class module:dispatcher.MetadataManager
                     * @classdesc Store Metadata Scanners for performant retrieval across an entire application
                     */
                    var MetadataManager = /** @class */ (function () {
                        function MetadataManager() {
                            this._scannerMap = new WeakMap();
                        }
                        /**
                         * Get the property names of the target object that have the requested metadata.
                         * Look first for a metadataScanner instance for the target object in the scanner map.
                         * If an instance is not found then make one, add that to the scanner map, and return
                         * the properties with the requested metadata.
                         * @function module:dispatcher.MetadataManager#get
                         * @param {external:Record} target
                         * @param {string} metadataKey
                         * @returns {external:Array<external:string>} The property names on the target that have metadata.
                         */
                        MetadataManager.prototype.get = function (target, metadataKey) {
                            var scannerMap = this._scannerMap;
                            if (scannerMap.has(target)) {
                                var scanner = scannerMap.get(target);
                                return scanner.get(metadataKey);
                            }
                            var targetScanner = new MetadataScanner(target);
                            scannerMap.set(target, targetScanner);
                            return targetScanner.get(metadataKey);
                        };
                        return MetadataManager;
                    })();
                    exports.default = new MetadataManager();

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
            /******/ /* webpack/runtime/global */
            /******/ (() => {
                /******/ __webpack_require__.g = (function () {
                    /******/ if (typeof globalThis === 'object') return globalThis;
                    /******/ try {
                        /******/ return this || new Function('return this')();
                        /******/
                    } catch (e) {
                        /******/ if (typeof window === 'object') return window;
                        /******/
                    }
                    /******/
                })();
                /******/
            })();
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
