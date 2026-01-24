(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();
    else if (typeof define === 'function' && define.amd) define([], factory);
    else if (typeof exports === 'object') exports['blue-view-ractive'] = factory();
    else root['blue-view-ractive'] = factory();
})(globalThis, function () {
    return /******/ (() => {
        // webpackBootstrap
        /******/ 'use strict';
        /******/ var __webpack_modules__ = [
            /* 0 */
            /***/ function (__unused_webpack_module, exports, __webpack_require__) {
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
                //export * from './ractive-view';

                /***/
            },
            /* 1 */
            /***/ (__unused_webpack_module, exports) => {
                Object.defineProperty(exports, '__esModule', { value: true });
                exports.RactiveBridge = void 0;
                //import * as Ractive from 'ractive';
                var uid = 0;
                var RactiveBridge = /** @class */ (function () {
                    function RactiveBridge(spec) {
                        this.name = spec.name || 'ANONYMOUS BRIDGE';
                        this.id = uid++;
                        this.spec = spec;
                    }
                    RactiveBridge.prototype.disable = function () {
                        throw new Error('Method not implemented.');
                    };
                    RactiveBridge.prototype.enable = function () {
                        throw new Error('Method not implemented.');
                    };
                    RactiveBridge.prototype.on = function () {
                        throw new Error('Method not implemented.');
                    };
                    return RactiveBridge;
                })();
                exports.RactiveBridge = RactiveBridge;

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
            /******/ __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
});
