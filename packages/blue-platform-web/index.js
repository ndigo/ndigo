(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(
            require('@blue/context'),
            require('@blue/core'),
            require('@blue/dispatcher'),
            require('@blue/parser'),
            require('@blue/util')
        );
    else if (typeof define === 'function' && define.amd)
        define(['@blue/context', '@blue/core', '@blue/dispatcher', '@blue/parser', '@blue/util'], factory);
    else if (typeof exports === 'object')
        exports['blue-platform-web'] = factory(
            require('@blue/context'),
            require('@blue/core'),
            require('@blue/dispatcher'),
            require('@blue/parser'),
            require('@blue/util')
        );
    else
        root['blue-platform-web'] = factory(
            root['@blue/context'],
            root['@blue/core'],
            root['@blue/dispatcher'],
            root['@blue/parser'],
            root['@blue/util']
        );
})(
    globalThis,
    function (
        __WEBPACK_EXTERNAL_MODULE__2__,
        __WEBPACK_EXTERNAL_MODULE__7__,
        __WEBPACK_EXTERNAL_MODULE__4__,
        __WEBPACK_EXTERNAL_MODULE__9__,
        __WEBPACK_EXTERNAL_MODULE__10__
    ) {
        return /******/ (() => {
            // webpackBootstrap
            /******/ 'use strict';
            /******/ var __webpack_modules__ = [
                /* 0 */
                /***/ function (__unused_webpack_module, exports, __webpack_require__) {
                    /**
                     * @author Jeff Rose
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
                    __exportStar(__webpack_require__(3), exports);
                    __exportStar(__webpack_require__(5), exports);
                    __exportStar(__webpack_require__(6), exports);

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
                    Object.defineProperty(exports, '__esModule', { value: true });
                    exports.BrowserEnvironment = void 0;
                    var context_1 = __webpack_require__(2);
                    var BrowserEnvironment = /** @class */ (function (_super) {
                        __extends(BrowserEnvironment, _super);
                        function BrowserEnvironment() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        return BrowserEnvironment;
                    })(context_1.StandardEnvironment);
                    exports.BrowserEnvironment = BrowserEnvironment;

                    /***/
                },
                /* 2 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

                    /***/
                },
                /* 3 */
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
                    exports.AbstractCookieValueMethodArgumentResolver = void 0;
                    var dispatcher_1 = __webpack_require__(4);
                    var AbstractCookieValueMethodArgumentResolver = /** @class */ (function (_super) {
                        __extends(AbstractCookieValueMethodArgumentResolver, _super);
                        function AbstractCookieValueMethodArgumentResolver() {
                            return (_super !== null && _super.apply(this, arguments)) || this;
                        }
                        return AbstractCookieValueMethodArgumentResolver;
                    })(dispatcher_1.AbstractNamedValueMethodArgumentResolver);
                    exports.AbstractCookieValueMethodArgumentResolver = AbstractCookieValueMethodArgumentResolver;

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
                    exports.CookieThemeResolver = void 0;
                    var dispatcher_1 = __webpack_require__(4);
                    var cookies_1 = __webpack_require__(6);
                    /**
                     * @class module:dispatcher.CookieThemeResolver
                     * @extends module:dispatcher.AbstractThemeResolver
                     */
                    var CookieThemeResolver = /** @class */ (function (_super) {
                        __extends(CookieThemeResolver, _super);
                        function CookieThemeResolver(cookieName, defaultThemeName) {
                            var _this = _super.call(this, defaultThemeName) || this;
                            /**
                             * @member {external:string} module:dispatcher.CookieThemeResolver#cookieName
                             */
                            Reflect.defineProperty(_this, 'cookieName', {
                                value: cookieName,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            return _this;
                        }
                        Object.defineProperty(CookieThemeResolver.prototype, Symbol.toStringTag, {
                            get: function () {
                                return 'CookieThemeResolver:' + this.cookieName;
                            },
                            enumerable: false,
                            configurable: true,
                        });
                        CookieThemeResolver.prototype.resolveTheme = function (route) {
                            // @ts-ignore: ¯\_(ツ)_/¯
                            var themeName = cookies_1.default.get(this.cookieName) || this.defaultThemeName;
                            return themeName;
                        };
                        return CookieThemeResolver;
                    })(dispatcher_1.AbstractThemeResolver);
                    exports.CookieThemeResolver = CookieThemeResolver;

                    /***/
                },
                /* 6 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    /**
                     * @author Jeff Rose
                     */
                    Object.defineProperty(exports, '__esModule', { value: true });
                    var core_1 = __webpack_require__(7);
                    var cookie_expression_1 = __webpack_require__(8);
                    var assign = Object.assign;
                    function init(converter) {
                        var api = core_1.createNull();
                        function set(key, value, attributes) {
                            if (typeof document === 'undefined') {
                                return;
                            }
                            attributes = assign({ path: '/' }, api.defaults, attributes);
                            if (typeof attributes.expires === 'number') {
                                attributes.expires = new Date(Date.now() * 1 + attributes.expires * 864e5);
                            }
                            // We're using "expires" because "max-age" is not supported by IE
                            attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
                            try {
                                var result = JSON.stringify(value);
                                if (/^[\{\[]/.test(result)) {
                                    value = result;
                                }
                            } catch (e) {}
                            value = converter.write
                                ? converter.write(value, key)
                                : encodeURIComponent(String(value)).replace(
                                      /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                                      decodeURIComponent
                                  );
                            key = encodeURIComponent(String(key))
                                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                                .replace(/[\(\)]/g, escape);
                            var stringifiedAttributes = '';
                            for (var attributeName in attributes) {
                                if (!attributes[attributeName]) {
                                    continue;
                                }
                                stringifiedAttributes += '; ' + attributeName;
                                if (attributes[attributeName] === true) {
                                    continue;
                                }
                                // Considers RFC 6265 section 5.2:
                                // ...
                                // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                                //     character:
                                // Consume the characters of the unparsed-attributes up to,
                                // not including, the first %x3B (";") character.
                                // ...
                                stringifiedAttributes += '=' + attributes[attributeName].split(' ;')[0];
                            }
                            return (document.cookie = key + '=' + value + stringifiedAttributes);
                        }
                        function get(key, json) {
                            var jar = cookie_expression_1.default.run(document.cookie);
                            return key ? (json ? JSON.parse(jar[key]) : jar[key]) : jar;
                        }
                        api.set = set;
                        api.get = function (key) {
                            return get(key, false /* read as raw */);
                        };
                        api.getJSON = function (key) {
                            return get(key, true /* read as json */);
                        };
                        api.remove = function (key, attributes) {
                            return set(key, '', assign(attributes, { expires: -1 }));
                        };
                        api.defaults = {};
                        api.withConverter = init;
                        return api;
                    }
                    exports.default = init(function () {});

                    /***/
                },
                /* 7 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__7__;

                    /***/
                },
                /* 8 */
                /***/ (__unused_webpack_module, exports, __webpack_require__) => {
                    Object.defineProperty(exports, '__esModule', { value: true });
                    /**
                     * @author Jeff Rose
                     * @see {@link https://stackoverflow.com/questions/1969232/allowed-characters-in-cookies}
                     * @see {@link https://curl.haxx.se/rfc/cookie_spec.html}
                     * @see {@link https://www.ietf.org/rfc/rfc2109.txt}
                     * @see {@link https://www.ietf.org/rfc/rfc2616.txt}
                     * @see {@link https://www.ietf.org/rfc/rfc2965.txt}
                     * @see {@link https://www.ietf.org/rfc/rfc6265.txt}
                     * @see {@link https://github.com/francisrstokes/arcsecond}
                     * @see {@link https://ramdajs.com/docs/#fromPairs}
                     */
                    var parser_1 = __webpack_require__(9);
                    var util_1 = __webpack_require__(10);
                    var validCharacters = /^[^;,\s]*/,
                        percentEncoded = /(%[0-9A-Za-z]{2})+/g,
                        percentDecode = function (value) {
                            return value.replace(percentEncoded, decodeURIComponent);
                        },
                        equalsSign = parser_1.char('='),
                        cookie = parser_1.sequenceOf([
                            parser_1.everyCharUntil(equalsSign).map(percentDecode),
                            parser_1.takeRight(equalsSign)(parser_1.regex(validCharacters)).map(percentDecode),
                        ]),
                        cookies = parser_1.sepByN(0)(parser_1.str('; '))(cookie).map(util_1.fromPairs);
                    exports.default = cookies;

                    /***/
                },
                /* 9 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__9__;

                    /***/
                },
                /* 10 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__10__;

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
