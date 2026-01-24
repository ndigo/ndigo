(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/util"), require("@blue/factory"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/util", "@blue/factory"], factory);
	else if(typeof exports === 'object')
		exports["blue-content"] = factory(require("@blue/util"), require("@blue/factory"));
	else
		root["blue-content"] = factory(root["@blue/util"], root["@blue/factory"]);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__3__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsContentSourceAware": () => (/* binding */ AsContentSourceAware),
/* harmony export */   "likeContentSource": () => (/* binding */ likeContentSource),
/* harmony export */   "likeContentSourceAware": () => (/* binding */ likeContentSourceAware)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


/**
 * Strategy interface for resolving content.
 * @interface module:content.ContentSource
 */
/**
 * @function module:content.ContentSource#getContent
 * @param {external:string} key
 * @param {external:string} language
 * @returns {external:string}
 */
/**
 * @interface module:content.ContentSourceAware
 * @extends module:content.Aware
 */
/**
 * @mixin module:content.AsContentSourceAware
 * @implements module:content.ContentSourceAware
 * @returns {module:content.Constructable<module:content.ContentSourceAware>}
 */
const AsContentSourceAware = (superclass) => class extends (0,_blue_factory__WEBPACK_IMPORTED_MODULE_1__.AsAware)(superclass) {
    setContentSource(contentSource) {
        Reflect.defineProperty(this, 'contentSource', {
            value: contentSource,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
};
/**
 * @function module:content.likeContentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSource|ContentSource}
 */
const likeContentSource = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ getContent: Function });
/**
 * @function module:content.likeContentSourceAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSourceAware|ContentSourceAware}
 */
const likeContentSourceAware = (0,_blue_factory__WEBPACK_IMPORTED_MODULE_1__.likeAwareAnd)((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ setContentSource: Function }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFFLFlBQVksRUFBUyxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFVN0Q7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBMkIsVUFBYSxFQUEwQyxFQUFFLENBQUMsS0FBTSxTQUFRLE9BQU8sQ0FBRSxVQUFVLENBQUU7SUFHeEosZ0JBQWdCLENBQUUsYUFBNEI7UUFDMUMsT0FBTyxDQUFDLGNBQWMsQ0FBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzNDLEtBQUssRUFBRSxhQUFhO1lBQ3BCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7Q0FDSixDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBeUMsQ0FBQztBQUV6Rzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsWUFBWSxDQUFFLElBQUksQ0FBRSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxDQUFFLENBQThDLENBQUMifQ==

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/**
 * @author Jeff Rose
 */

/**
 * @interface module:content.Theme
 */
/**
 * @member {external:string} module:content.Theme#name
 */
/**
 * @member {module:content.ContentSource} module:content.Theme#contentSource
 */
/**
 * @interface module:content.ThemeSource
 */
/**
 * @member {module:content.Theme} module:content.ThemeSource#theme
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOztBQWFIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUcifQ==

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsContentSourceAware": () => (/* reexport safe */ _content__WEBPACK_IMPORTED_MODULE_0__.AsContentSourceAware),
/* harmony export */   "likeContentSource": () => (/* reexport safe */ _content__WEBPACK_IMPORTED_MODULE_0__.likeContentSource),
/* harmony export */   "likeContentSourceAware": () => (/* reexport safe */ _content__WEBPACK_IMPORTED_MODULE_0__.likeContentSourceAware)
/* harmony export */ });
/* harmony import */ var _content__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _theme__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/**
 * @author Jeff Rose
 * @module content
 * @requires core
 * @requires factory
 * @requires util
 */


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7R0FPRztBQUVILGNBQWMsV0FBVyxDQUFDO0FBQzFCLGNBQWMsU0FBUyxDQUFDIn0=
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
