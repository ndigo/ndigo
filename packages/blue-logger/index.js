(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/core"), require("@blue/util"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/core", "@blue/util"], factory);
	else if(typeof exports === 'object')
		exports["blue-logger"] = factory(require("@blue/core"), require("@blue/util"));
	else
		root["blue-logger"] = factory(root["@blue/core"], root["@blue/util"]);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__5__, __WEBPACK_EXTERNAL_MODULE__9__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractAppender": () => (/* reexport safe */ _appender__WEBPACK_IMPORTED_MODULE_0__.AbstractAppender),
/* harmony export */   "AbstractBatchAppender": () => (/* reexport safe */ _appender__WEBPACK_IMPORTED_MODULE_0__.AbstractBatchAppender),
/* harmony export */   "AlertAppender": () => (/* reexport safe */ _appenders_alert_appender__WEBPACK_IMPORTED_MODULE_1__.AlertAppender),
/* harmony export */   "BrowserConsoleAppender": () => (/* reexport safe */ _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_2__.BrowserConsoleAppender),
/* harmony export */   "FetchAppender": () => (/* reexport safe */ _appenders_fetch_appender__WEBPACK_IMPORTED_MODULE_3__.FetchAppender)
/* harmony export */ });
/* harmony import */ var _appender__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _appenders_alert_appender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _appenders_fetch_appender__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
/**
 * @author Jeff Rose
 */




//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcGVuZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxjQUFjLFlBQVksQ0FBQztBQUMzQixjQUFjLDRCQUE0QixDQUFDO0FBQzNDLGNBQWMsc0NBQXNDLENBQUM7QUFDckQsY0FBYyw0QkFBNEIsQ0FBQyJ9

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractAppender": () => (/* binding */ AbstractAppender),
/* harmony export */   "AbstractBatchAppender": () => (/* binding */ AbstractBatchAppender)
/* harmony export */ });
/* harmony import */ var _layouts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


const { defineProperty } = Reflect;
class AbstractAppender extends _blue_core__WEBPACK_IMPORTED_MODULE_1__.Null {
    constructor() {
        super();
        this.layout = new _layouts__WEBPACK_IMPORTED_MODULE_0__.NullLayout();
    }
}
class AbstractBatchAppender extends AbstractAppender {
    constructor() {
        super();
        this.batchSize = 1;
        defineProperty(this, 'entries', {
            value: [],
            configurable: true,
            enumerable: true,
            writable: false
        });
    }
    append(entry) {
        this.entries.push(entry);
        const length = this.entries.length;
        if (length >= this.batchSize) {
            const batch = new Array(length);
            for (let index = 0; index < length; index++) {
                batch[index] = this.entries.shift();
            }
            this.appendBatch(batch);
        }
    }
}
/**
 * @interface module:logger.Appender
 */
/**
 * @member {module:logger.ErrorHandler} module:logger.Appender#errorHandler
 */
/**
 * @member {module:logger.Layout} module:logger.Appender#layout
 */
/**
 * @function module:logger.Appender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @interface module:logger.AsyncAppender
 * @extends module:logger.Appender
 */
/**
 * @function module:logger.AsyncAppender#append
 * @param {module:logger.Entry} entry
 * @returns {external:Promise}
 */
/**
 * @interface module:logger.BatchAppender
 * @extends module:logger.Appender
 */
/**
 * @member {external:number} module:logger.BatchAppender#batchSize
 */
/**
 * @member {module:logger.BatchLayout} module:logger.BatchAppender#layout
 */
/**
 * @abstract
 * @class module:logger.AbstractAppender
 * @implements module:logger.Appender
 * @param {external:string} name
 */
/**
 * @abstract
 * @function module:logger.AbstractAppender#append
 * @param {module:logger.Entry} entry
 */
/**
 * @abstract
 * @class module:logger.AbstractBatchAppender
 * @extends module:logger.AbstractAppender
 * @implements module:logger.BatchAppender
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBR0gsT0FBTyxFQUF1QixVQUFVLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDNUQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQThCbEMsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQWdCLGdCQUFpQixTQUFRLElBQUk7SUFJL0M7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0NBR0o7QUFFRCxNQUFNLE9BQWdCLHFCQUFzQixTQUFRLGdCQUFnQjtJQUtoRTtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsY0FBYyxDQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDN0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7SUFDUixDQUFDO0lBRUQsTUFBTSxDQUFFLEtBQVk7UUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7UUFFM0IsTUFBTSxNQUFNLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFM0MsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMxQixNQUFNLEtBQUssR0FBWSxJQUFJLEtBQUssQ0FBRSxNQUFNLENBQUUsQ0FBQztZQUUzQyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUN6QyxLQUFLLENBQUUsS0FBSyxDQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxXQUFXLENBQUUsS0FBSyxDQUFFLENBQUM7U0FDN0I7SUFDTCxDQUFDO0NBR0o7QUFFRDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHIn0=

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractBatchLayout": () => (/* reexport safe */ _layout__WEBPACK_IMPORTED_MODULE_0__.AbstractBatchLayout),
/* harmony export */   "AbstractLayout": () => (/* reexport safe */ _layout__WEBPACK_IMPORTED_MODULE_0__.AbstractLayout),
/* harmony export */   "JSONLayout": () => (/* reexport safe */ _layouts_json_layout__WEBPACK_IMPORTED_MODULE_1__.JSONLayout),
/* harmony export */   "NullLayout": () => (/* reexport safe */ _layouts_null_layout__WEBPACK_IMPORTED_MODULE_2__.NullLayout),
/* harmony export */   "PatternLayout": () => (/* reexport safe */ _layouts_pattern_layout__WEBPACK_IMPORTED_MODULE_3__.PatternLayout),
/* harmony export */   "XMLLayout": () => (/* reexport safe */ _layouts_xml_layout__WEBPACK_IMPORTED_MODULE_4__.XMLLayout)
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _layouts_json_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _layouts_null_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _layouts_pattern_layout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);
/* harmony import */ var _layouts_xml_layout__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
/**
 * @author Jeff Rose
 */





//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sYXlvdXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILGNBQWMsVUFBVSxDQUFDO0FBQ3pCLGNBQWMsdUJBQXVCLENBQUM7QUFDdEMsY0FBYyx1QkFBdUIsQ0FBQztBQUN0QyxjQUFjLDBCQUEwQixDQUFDO0FBQ3pDLGNBQWMsc0JBQXNCLENBQUMifQ==

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractBatchLayout": () => (/* binding */ AbstractBatchLayout),
/* harmony export */   "AbstractLayout": () => (/* binding */ AbstractLayout)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

class AbstractLayout {
    constructor() {
        this.mediaType = _blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_PLAIN;
    }
}
class AbstractBatchLayout extends AbstractLayout {
    constructor() {
        super();
        this.batchFooter = '';
        this.batchHeader = '';
        this.batchSeparator = '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFHSCxPQUFPLEVBQWEsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZ0JuRCxNQUFNLE9BQWdCLGNBQWM7SUFHaEM7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7SUFDM0MsQ0FBQztDQUdKO0FBRUQsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxjQUFjO0lBSzVEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDO0NBR0oifQ==

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JSONLayout": () => (/* binding */ JSONLayout)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _null_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/**
 * @author Jeff Rose
 */


const defineProperty = Reflect.defineProperty;
class JSONLayout extends _null_layout__WEBPACK_IMPORTED_MODULE_1__.NullLayout {
    constructor() {
        super();
        defineProperty(this, 'mediaType', {
            value: _blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.APPLICATION_JSON,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'batchFooter', {
            value: ']',
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'batchHeader', {
            value: '[',
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    format(entry) {
        const formatted = Object.assign((0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)(), entry);
        formatted.message = entry.message.join(' ');
        return JSON.stringify(formatted);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF5b3V0cy9qc29uLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsVUFBVSxFQUFhLFVBQVUsRUFBYyxNQUFNLFlBQVksQ0FBQztBQUUzRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFFOUMsTUFBTSxPQUFPLFVBQVcsU0FBUSxVQUFVO0lBTXRDO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFFUixjQUFjLENBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUMvQixLQUFLLEVBQUUsVUFBVSxDQUFDLGdCQUFnQjtZQUNsQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7UUFDSixjQUFjLENBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqQyxLQUFLLEVBQUUsR0FBRztZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztRQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2pDLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO1FBQ0osY0FBYyxDQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNwQyxLQUFLLEVBQUUsR0FBRztZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7SUFFRCxNQUFNLENBQUUsS0FBWTtRQUNoQixNQUFNLFNBQVMsR0FBZSxNQUFNLENBQUMsTUFBTSxDQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ25FLFNBQVMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQ3ZDLENBQUM7Q0FDSiJ9

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NullLayout": () => (/* binding */ NullLayout)
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/**
 * @author Jeff Rose
 */

class NullLayout extends _layout__WEBPACK_IMPORTED_MODULE_0__.AbstractBatchLayout {
    constructor() {
        super();
        Reflect.defineProperty(this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    format(entry) {
        return entry.message.join(' ');
    }
    formatBatch(entries) {
        const formatted = this.formatEntries(entries);
        return `${this.batchHeader}${formatted.join(this.batchSeparator)}${this.batchFooter}`;
    }
    formatEntries(entries) {
        const length = entries.length, formatted = new Array(length);
        let index = 0;
        for (; index < length; index++) {
            formatted[index] = this.format(entries[index]);
        }
        return formatted;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbC1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF5b3V0cy9udWxsLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFHSCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFaEQsTUFBTSxPQUFPLFVBQVcsU0FBUSxtQkFBbUI7SUFHL0M7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUVSLE9BQU8sQ0FBQyxjQUFjLENBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzVDLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztJQUVELE1BQU0sQ0FBRSxLQUFZO1FBQ2hCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELFdBQVcsQ0FBRSxPQUFnQjtRQUN6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQ2hELE9BQU8sR0FBSSxJQUFJLENBQUMsV0FBWSxHQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBRyxHQUFJLElBQUksQ0FBQyxXQUFZLEVBQUUsQ0FBQztJQUNsRyxDQUFDO0lBRVMsYUFBYSxDQUFFLE9BQWdCO1FBQ3JDLE1BQ0ksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQ3ZCLFNBQVMsR0FBYSxJQUFJLEtBQUssQ0FBRSxNQUFNLENBQUUsQ0FBQztRQUM5QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDNUIsU0FBUyxDQUFFLEtBQUssQ0FBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUM7U0FDeEQ7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0oifQ==

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PatternLayout": () => (/* binding */ PatternLayout)
/* harmony export */ });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


const { defineProperty } = Reflect, regex = /%(-?[0-9]+)?(\.?[0-9]+)?([cdmnp%])(\{([^\}]+)\})?|([^%]+)/;
class PatternLayout extends _layout__WEBPACK_IMPORTED_MODULE_0__.AbstractLayout {
    constructor(pattern) {
        super();
        defineProperty(this, 'pattern', {
            value: pattern,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'categorySeparator', {
            value: '.',
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, 'newline', {
            value: '\r\n',
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    format({ category, level, message, timestamp }) {
        let formatted = '', searchString = this.pattern, result;
        while ((result = regex.exec(searchString))) {
            const matchedString = result[0], padding = result[1], truncation = result[2], conversionCharacter = result[3], specifier = result[5], text = result[6];
            // Check if the pattern matched was just normal text
            if (text) {
                formatted += '' + text;
            }
            else {
                const { categorySeparator, newline } = this;
                // Create a raw replacement string based on the conversion
                // character and specifier
                let replacement = '';
                switch (conversionCharacter) {
                    case 'm': // Message
                        replacement = message.join(' ');
                        break;
                    case 'c': // Category
                        const loggerName = category;
                        if (specifier) {
                            const precision = parseInt(specifier, 10), parts = category.split(categorySeparator);
                            replacement = precision >= parts.length ?
                                loggerName :
                                parts.slice(parts.length - precision).join(categorySeparator);
                        }
                        else {
                            replacement = loggerName;
                        }
                        break;
                    case 'd': // Date
                        replacement = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.format)(specifier || null, new Date(timestamp));
                        break;
                    case 'n': // New line
                        replacement = newline;
                        break;
                    case 'p': // Level
                        replacement = level.name;
                        break;
                    case '%': // Literal % signs
                        replacement = '%';
                        break;
                    default: // Should only happen if a new directive is added to the regex but not added to the case statement
                        replacement = matchedString;
                        break;
                }
                // Format the replacement according to any padding or
                // truncation specified
                let l;
                // Truncation
                if (truncation) {
                    l = parseInt(truncation.substr(1), 10);
                    const strLen = replacement.length;
                    if (l < strLen) {
                        replacement = replacement.substring(strLen - l, strLen);
                    }
                }
                // Padding
                if (padding) {
                    // Right padding
                    if (padding[0] === '-') {
                        l = parseInt(padding.substr(1), 10);
                        while (replacement.length < l) {
                            replacement += ' ';
                        }
                        // Left padding
                    }
                    else {
                        l = parseInt(padding, 10);
                        while (replacement.length < l) {
                            replacement = ' ' + replacement;
                        }
                    }
                }
                formatted += replacement;
            }
            searchString = searchString.substr(result.index + result[0].length);
        }
        return formatted;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybi1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGF5b3V0cy9wYXR0ZXJuLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFHSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWxELE1BQ0ksRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLEtBQUssR0FBRywyREFBMkQsQ0FBQztBQUV4RSxNQUFNLE9BQU8sYUFBYyxTQUFRLGNBQWM7SUFLN0MsWUFBYSxPQUFlO1FBQ3hCLEtBQUssRUFBRSxDQUFDO1FBRVIsY0FBYyxDQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDN0IsS0FBSyxFQUFFLE9BQU87WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7UUFDSixjQUFjLENBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZDLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBRSxDQUFDO1FBQ0osY0FBYyxDQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDN0IsS0FBSyxFQUFFLE1BQU07WUFDYixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFFLENBQUM7SUFDUixDQUFDO0lBRUQsTUFBTSxDQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFTO1FBQ2xELElBQUksU0FBUyxHQUFHLEVBQUUsRUFDZCxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFDM0IsTUFBdUIsQ0FBQztRQUU1QixPQUFPLENBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUUsWUFBWSxDQUFFLENBQUUsRUFBRTtZQUM1QyxNQUNJLGFBQWEsR0FBUyxNQUFNLENBQUUsQ0FBQyxDQUFFLEVBQ2pDLE9BQU8sR0FBZSxNQUFNLENBQUUsQ0FBQyxDQUFFLEVBQ2pDLFVBQVUsR0FBWSxNQUFNLENBQUUsQ0FBQyxDQUFFLEVBQ2pDLG1CQUFtQixHQUFHLE1BQU0sQ0FBRSxDQUFDLENBQUUsRUFDakMsU0FBUyxHQUFhLE1BQU0sQ0FBRSxDQUFDLENBQUUsRUFDakMsSUFBSSxHQUFrQixNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUM7WUFFdEMsb0RBQW9EO1lBQ3BELElBQUksSUFBSSxFQUFFO2dCQUNOLFNBQVMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO2FBQzFCO2lCQUFNO2dCQUNILE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBRTVDLDBEQUEwRDtnQkFDMUQsMEJBQTBCO2dCQUMxQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Z0JBRXJCLFFBQVEsbUJBQW1CLEVBQUU7b0JBQ3pCLEtBQUssR0FBRyxFQUFFLFVBQVU7d0JBQ2hCLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO3dCQUNsQyxNQUFNO29CQUNWLEtBQUssR0FBRyxFQUFFLFdBQVc7d0JBQ2pCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQzt3QkFDNUIsSUFBSSxTQUFTLEVBQUU7NEJBQ1gsTUFDSSxTQUFTLEdBQUcsUUFBUSxDQUFFLFNBQVMsRUFBRSxFQUFFLENBQUUsRUFDckMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUUsaUJBQWlCLENBQUUsQ0FBQzs0QkFDaEQsV0FBVyxHQUFHLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ3JDLFVBQVUsQ0FBQyxDQUFDO2dDQUNaLEtBQUssQ0FBQyxLQUFLLENBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUUsQ0FBQyxJQUFJLENBQUUsaUJBQWlCLENBQUUsQ0FBQzt5QkFDekU7NkJBQU07NEJBQ0gsV0FBVyxHQUFHLFVBQVUsQ0FBQzt5QkFDNUI7d0JBQ0QsTUFBTTtvQkFDVixLQUFLLEdBQUcsRUFBRSxPQUFPO3dCQUNiLFdBQVcsR0FBRyxVQUFVLENBQUUsU0FBUyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBRSxDQUFDO3dCQUNyRSxNQUFNO29CQUNWLEtBQUssR0FBRyxFQUFFLFdBQVc7d0JBQ2pCLFdBQVcsR0FBRyxPQUFPLENBQUM7d0JBQ3RCLE1BQU07b0JBQ1YsS0FBSyxHQUFHLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQzt3QkFDekIsTUFBTTtvQkFDVixLQUFLLEdBQUcsRUFBRSxrQkFBa0I7d0JBQ3hCLFdBQVcsR0FBRyxHQUFHLENBQUM7d0JBQ2xCLE1BQU07b0JBQ1YsU0FBUyxrR0FBa0c7d0JBQ3ZHLFdBQVcsR0FBRyxhQUFhLENBQUM7d0JBQzVCLE1BQU07aUJBQ2I7Z0JBQ0QscURBQXFEO2dCQUNyRCx1QkFBdUI7Z0JBQ3ZCLElBQUksQ0FBUyxDQUFDO2dCQUVkLGFBQWE7Z0JBQ2IsSUFBSSxVQUFVLEVBQUU7b0JBQ1osQ0FBQyxHQUFHLFFBQVEsQ0FBRSxVQUFVLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO29CQUMzQyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO29CQUNsQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUU7d0JBQ1osV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUUsQ0FBQztxQkFDN0Q7aUJBQ0o7Z0JBRUQsVUFBVTtnQkFDVixJQUFJLE9BQU8sRUFBRTtvQkFDVCxnQkFBZ0I7b0JBQ2hCLElBQUksT0FBTyxDQUFFLENBQUMsQ0FBRSxLQUFLLEdBQUcsRUFBRTt3QkFDdEIsQ0FBQyxHQUFHLFFBQVEsQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO3dCQUN4QyxPQUFPLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUMzQixXQUFXLElBQUksR0FBRyxDQUFDO3lCQUN0Qjt3QkFDTCxlQUFlO3FCQUNkO3lCQUFNO3dCQUNILENBQUMsR0FBRyxRQUFRLENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBRSxDQUFDO3dCQUM1QixPQUFPLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUMzQixXQUFXLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQzt5QkFDbkM7cUJBQ0o7aUJBQ0o7Z0JBRUQsU0FBUyxJQUFJLFdBQVcsQ0FBQzthQUM1QjtZQUVELFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1NBQzNFO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKIn0=

/***/ }),
/* 9 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__9__;

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XMLLayout": () => (/* binding */ XMLLayout)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _null_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/**
 * @author Jeff Rose
 */


const defineProperty = Reflect.defineProperty;
class XMLLayout extends _null_layout__WEBPACK_IMPORTED_MODULE_1__.NullLayout {
    constructor() {
        super();
        defineProperty(this, 'mediaType', {
            value: _blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_XML,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'batchFooter', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, 'batchHeader', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, 'batchSeparator', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    format({ category, error, level, message, timestamp }) {
        return `${this.batchHeader}<Entry category="${category}" level="${level}" timestamp="${timestamp}">${error ? this.formatError(message[0]) : this.formatMessage(message)}</Entry>${this.batchFooter}`;
    }
    formatBatch(entries) {
        const formatted = this.formatEntries(entries);
        return `<Entries size="${entries.length}">${formatted.join(this.batchSeparator)}</Entries>`;
    }
    formatError(error) {
        // TODO escape error
        // TODO use stracktrace-js?
        return error ?
            `<Error name="${error.name}"><![CDATA[${error.message}]]></Error>` :
            '';
    }
    formatMessage(message) {
        // TODO escape message
        return `<Message><![CDATA[${message.join(' ')}]]></Message>`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLWxheW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sYXlvdXRzL3htbC1sYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFhLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFFOUMsTUFBTSxPQUFPLFNBQVUsU0FBUSxVQUFVO0lBTXJDO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFFUixjQUFjLENBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUMvQixLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDMUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO1FBQ0osY0FBYyxDQUFFLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDakMsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFFLENBQUM7UUFDSixjQUFjLENBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqQyxLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUUsQ0FBQztRQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDcEMsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFFLENBQUM7SUFDUixDQUFDO0lBRUQsTUFBTSxDQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBUztRQUN6RCxPQUFPLEdBQUksSUFBSSxDQUFDLFdBQVksb0JBQXFCLFFBQVMsWUFBYSxLQUFNLGdCQUFpQixTQUFVLEtBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQVcsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLE9BQU8sQ0FBRyxXQUFZLElBQUksQ0FBQyxXQUFZLEVBQUUsQ0FBQztJQUNwTyxDQUFDO0lBRUQsV0FBVyxDQUFFLE9BQWdCO1FBQ3pCLE1BQU0sU0FBUyxHQUFhLElBQUksQ0FBQyxhQUFhLENBQUUsT0FBTyxDQUFFLENBQUM7UUFDMUQsT0FBTyxrQkFBbUIsT0FBTyxDQUFDLE1BQU8sS0FBTSxTQUFTLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxjQUFjLENBQUcsWUFBWSxDQUFDO0lBQ3RHLENBQUM7SUFFRCxXQUFXLENBQUUsS0FBYTtRQUN0QixvQkFBb0I7UUFDcEIsMkJBQTJCO1FBQzNCLE9BQU8sS0FBSyxDQUFDLENBQUM7WUFDVixnQkFBaUIsS0FBSyxDQUFDLElBQUssY0FBZSxLQUFLLENBQUMsT0FBUSxhQUFhLENBQUMsQ0FBQztZQUN4RSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRUQsYUFBYSxDQUFFLE9BQW1CO1FBQzlCLHNCQUFzQjtRQUN0QixPQUFPLHFCQUFzQixPQUFPLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRyxlQUFlLENBQUM7SUFDckUsQ0FBQztDQUNKIn0=

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AlertAppender": () => (/* binding */ AlertAppender)
/* harmony export */ });
/* harmony import */ var _appender__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */

class AlertAppender extends _appender__WEBPACK_IMPORTED_MODULE_0__.AbstractAppender {
    append(entry) {
        alert(this.layout.format(entry));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwZW5kZXJzL2FsZXJ0LWFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUcvQyxNQUFNLE9BQU8sYUFBYyxTQUFRLGdCQUFnQjtJQUMvQyxNQUFNLENBQUUsS0FBWTtRQUNoQixLQUFLLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztJQUN6QyxDQUFDO0NBQ0oifQ==

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BrowserConsoleAppender": () => (/* binding */ BrowserConsoleAppender)
/* harmony export */ });
/* harmony import */ var _appender__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */

const { defineProperty } = Reflect;
class BrowserConsoleAppender extends _appender__WEBPACK_IMPORTED_MODULE_0__.AbstractAppender {
    constructor(levelMapping = {}) {
        super();
        defineProperty(this, 'levelMapping', {
            value: levelMapping,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'levels', {
            value: ['debug', 'error', 'info', 'warn'],
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    append(entry) {
        this.appendMessage(entry.level, this.layout.format(entry));
    }
    appendMessage(level, message) {
        let mappedLevel = this.levelMapping[level.name];
        if (!mappedLevel) {
            mappedLevel = this.levels.indexOf(level.name) !== -1 ? level.name : 'log';
        }
        switch (mappedLevel) {
            case 'debug':
                console.debug(message);
                break;
            case 'error':
                console.error(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1jb25zb2xlLWFwcGVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcGVuZGVycy9icm93c2VyLWNvbnNvbGUtYXBwZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSS9DLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGdCQUFnQjtJQUl4RCxZQUFhLFlBQVksR0FBRyxFQUFFO1FBQzFCLEtBQUssRUFBRSxDQUFDO1FBRVIsY0FBYyxDQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbEMsS0FBSyxFQUFFLFlBQVk7WUFDbkIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO1FBRUosY0FBYyxDQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDNUIsS0FBSyxFQUFFLENBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFFO1lBQzNDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7SUFFRCxNQUFNLENBQUUsS0FBWTtRQUNoQixJQUFJLENBQUMsYUFBYSxDQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztJQUNuRSxDQUFDO0lBRUQsYUFBYSxDQUFFLEtBQVksRUFBRSxPQUFlO1FBQ3hDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBRSxDQUFDO1FBRWxELElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDL0U7UUFFRCxRQUFRLFdBQVcsRUFBRTtZQUNqQixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDekIsTUFBTTtZQUNWLEtBQUssT0FBTztnQkFDUixPQUFPLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDO2dCQUN6QixNQUFNO1lBQ1YsS0FBSyxNQUFNO2dCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3hCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsT0FBTyxDQUFDLElBQUksQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDeEIsTUFBTTtZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3ZCLE1BQU07U0FDYjtJQUNMLENBQUM7Q0FDSiJ9

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FetchAppender": () => (/* binding */ FetchAppender)
/* harmony export */ });
/* harmony import */ var _appender__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */

const defaults = {
    method: 'POST',
    timeout: -1
};
class FetchAppender extends _appender__WEBPACK_IMPORTED_MODULE_0__.AbstractBatchAppender {
    constructor(url, options = {}) {
        super();
        this.appending = Promise.resolve(null);
        this.url = url;
        this.options = options;
    }
    appendBatch(entries) {
        const url = this.url, content = this.layout.formatBatch(entries), settings = Object.assign({}, defaults, this.options, {
            body: content,
            headers: new Headers({
                'Content-Type': this.layout.mediaType.withCharset('utf-8').toString(),
                'Content-Length': String(content.length)
            })
        });
        this.appending = new Promise(function (resolve, reject) {
            const timeout = settings.timeout;
            let timedOut = false, timerId = null;
            if (timeout > 0) {
                timerId = window.setTimeout(function () {
                    timedOut = true;
                    reject(new Error(`Appender timed out`));
                }, timeout);
            }
            fetch(url, settings)
                .then(function (response) {
                timerId !== null && clearTimeout(timerId);
                !timedOut && resolve(response);
            })
                .catch(function (error) {
                if (timedOut) {
                    return;
                }
                reject(error);
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwZW5kZXJzL2ZldGNoLWFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQU9wRCxNQUFNLFFBQVEsR0FBMEI7SUFDcEMsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsQ0FBQyxDQUFDO0NBQ2QsQ0FBQztBQUVGLE1BQU0sT0FBTyxhQUFjLFNBQVEscUJBQXFCO0lBS3BELFlBQWEsR0FBVyxFQUFFLFVBQWlDLEVBQUU7UUFDekQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRUQsV0FBVyxDQUFFLE9BQWdCO1FBQ3pCLE1BQ0ksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQ2QsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFFLE9BQU8sQ0FBRSxFQUM1QyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEQsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSSxPQUFPLENBQUU7Z0JBQ2xCLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUUsT0FBTyxDQUFFLENBQUMsUUFBUSxFQUFFO2dCQUN2RSxnQkFBZ0IsRUFBRSxNQUFNLENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBRTthQUM3QyxDQUFFO1NBQ04sQ0FBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLE9BQU8sQ0FBWSxVQUFVLE9BQU8sRUFBRSxNQUFNO1lBQzdELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDakMsSUFBSSxRQUFRLEdBQUcsS0FBSyxFQUNoQixPQUFPLEdBQVcsSUFBSSxDQUFDO1lBRTNCLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRTtnQkFDYixPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBRTtvQkFDekIsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsTUFBTSxDQUFFLElBQUksS0FBSyxDQUFFLG9CQUFvQixDQUFFLENBQUUsQ0FBQztnQkFDaEQsQ0FBQyxFQUFFLE9BQU8sQ0FBRSxDQUFDO2FBQ2hCO1lBRUQsS0FBSyxDQUFFLEdBQUcsRUFBRSxRQUFRLENBQUU7aUJBQ2pCLElBQUksQ0FBRSxVQUFVLFFBQWtCO2dCQUMvQixPQUFPLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBRSxPQUFPLENBQUUsQ0FBQztnQkFDNUMsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFFLFFBQVEsQ0FBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBRTtpQkFDRixLQUFLLENBQUUsVUFBVSxLQUFZO2dCQUMxQixJQUFJLFFBQVEsRUFBRTtvQkFDVixPQUFPO2lCQUNWO2dCQUNELE1BQU0sQ0FBRSxLQUFLLENBQUUsQ0FBQztZQUNwQixDQUFDLENBQUUsQ0FBQztRQUNaLENBQUMsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztDQUNKIn0=

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "newEntry": () => (/* binding */ newEntry)
/* harmony export */ });
/**
 * @author Jeff Rose
 */
/**
 * @function module:logger.newEntry
 * @param {external:string} category
 * @param {module:logger.Level} level
 * @param {external:Array<module:logger.loggable>} message
 * @param {external:string} [source]
 */
const newEntry = (category, level, message, source) => ({
    message: message,
    error: message[0] instanceof Error,
    level: level,
    category: category,
    source: source,
    timestamp: Date.now()
});
/**
 * @typedef {module:core.serializable | external:Error} module:logger.loggable
 */
/**
 * @typedef {external:Object} module:logger.Entry
 * @property {external:string} category
 * @property {external:boolean} [error]
 * @property {module:logger.Level} level
 * @property {external:Array<module:logger.loggable>} message
 * @property {external:string} [source]
 * @property {external:number} timestamp
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBZ0JIOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFFLFFBQWdCLEVBQUUsS0FBWSxFQUFFLE9BQW1CLEVBQUUsTUFBZSxFQUFVLEVBQUUsQ0FBQyxDQUFFO0lBQ3pHLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQyxDQUFFLFlBQVksS0FBSztJQUNwQyxLQUFLLEVBQUUsS0FBSztJQUNaLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7Q0FDeEIsQ0FBRSxDQUFDO0FBRUo7O0dBRUc7QUFFSDs7Ozs7Ozs7R0FRRyJ9

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StackTraceErrorHandler": () => (/* binding */ StackTraceErrorHandler),
/* harmony export */   "WindowErrorHandler": () => (/* binding */ WindowErrorHandler)
/* harmony export */ });
/* harmony import */ var _node_modules_stacktrace_js_stacktrace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);
/* harmony import */ var _node_modules_stacktrace_js_stacktrace__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_stacktrace_js_stacktrace__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


/**
 * @interface module:logger.ErrorHandler
 */
/**
 * @function module:logger.ErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 */
/**
 * @interface module:logger.AsyncErrorHandler
 * @extends module:logger.ErrorHandler
 */
/**
 * @function module:logger.AsyncErrorHandler#handleError
 * @param {module:Logger.Entry} entry
 * @returns {external:Promise<external:void>}
 */
const { defineProperty } = Reflect, joinOnEmptyString = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.join)(''), serializeFrame = (({ source, fileName, functionName, lineNumber, columnNumber }) => `\tat ${functionName} (${fileName}:${lineNumber}:${columnNumber})\r\n`), serializeFrames = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.pipe)((0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.map)(serializeFrame), joinOnEmptyString);
/**
 * @class module:logger.StackTraceErrorHandler
 * @implements module:logger.AsyncErrorHandler
 */
class StackTraceErrorHandler {
    constructor(appender) {
        defineProperty(this, 'appender', {
            value: appender,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    async handleError(entry) {
        const error = entry.message[0], stackframes = await (0,_node_modules_stacktrace_js_stacktrace__WEBPACK_IMPORTED_MODULE_0__.fromError)(error), message = `${error.name}: ${error.message}\r\n${serializeFrames(stackframes)}`;
        entry.message = [message];
        this.appender.append(entry);
    }
}
/**
 * @class module:logger.WindowErrorHandler
 * @implements module:logger.ErrorHandler
 */
class WindowErrorHandler {
    handleError(entry) {
        const event = new ErrorEvent('error', entry.message[0]);
        window.dispatchEvent(event);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxTQUFTLEVBQWMsTUFBTSwwQ0FBMEMsQ0FBQztBQUdqRixPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFVN0M7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUgsTUFDSSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsaUJBQWlCLEdBQUcsSUFBSSxDQUFFLEVBQUUsQ0FBRSxFQUM5QixjQUFjLEdBQUcsQ0FBRSxDQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxFQUFHLEVBQUUsQ0FBQyxRQUFTLFlBQWEsS0FBTSxRQUFTLElBQUssVUFBVyxJQUFLLFlBQWEsT0FBTyxDQUFFLEVBQ3ZLLGVBQWUsR0FBRyxJQUFJLENBQUUsR0FBRyxDQUFFLGNBQWMsQ0FBRSxFQUFFLGlCQUFpQixDQUF3QyxDQUFDO0FBRTdHOzs7R0FHRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFHL0IsWUFBYSxRQUFrQjtRQUMzQixjQUFjLENBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM5QixLQUFLLEVBQUUsUUFBUTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFFLEtBQVk7UUFDM0IsTUFDSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQVcsRUFDbkMsV0FBVyxHQUFpQixNQUFNLFNBQVMsQ0FBRSxLQUFLLENBQUUsRUFDcEQsT0FBTyxHQUFHLEdBQUksS0FBSyxDQUFDLElBQUssS0FBTSxLQUFLLENBQUMsT0FBUSxPQUFRLGVBQWUsQ0FBRSxXQUFXLENBQUcsRUFBRSxDQUFDO1FBQzNGLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBRSxLQUFLLENBQUUsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzNCLFdBQVcsQ0FBRSxLQUFZO1FBQ3JCLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBVyxDQUFFLENBQUM7UUFDckUsTUFBTSxDQUFDLGFBQWEsQ0FBRSxLQUFLLENBQUUsQ0FBQztJQUNsQyxDQUFDO0NBQ0oifQ==

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(17), __webpack_require__(19), __webpack_require__(20)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function StackTrace(ErrorStackParser, StackGenerator, StackTraceGPS) {
    var _options = {
        filter: function(stackframe) {
            // Filter out stackframes for this library by default
            return (stackframe.functionName || '').indexOf('StackTrace$$') === -1 &&
                (stackframe.functionName || '').indexOf('ErrorStackParser$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackTraceGPS$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackGenerator$$') === -1;
        },
        sourceCache: {}
    };

    var _generateError = function StackTrace$$GenerateError() {
        try {
            // Error must be thrown to get stack in IE
            throw new Error();
        } catch (err) {
            return err;
        }
    };

    /**
     * Merge 2 given Objects. If a conflict occurs the second object wins.
     * Does not do deep merges.
     *
     * @param {Object} first base object
     * @param {Object} second overrides
     * @returns {Object} merged first and second
     * @private
     */
    function _merge(first, second) {
        var target = {};

        [first, second].forEach(function(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    target[prop] = obj[prop];
                }
            }
            return target;
        });

        return target;
    }

    function _isShapedLikeParsableError(err) {
        return err.stack || err['opera#sourceloc'];
    }

    function _filtered(stackframes, filter) {
        if (typeof filter === 'function') {
            return stackframes.filter(filter);
        }
        return stackframes;
    }

    return {
        /**
         * Get a backtrace from invocation point.
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        get: function StackTrace$$get(opts) {
            var err = _generateError();
            return _isShapedLikeParsableError(err) ? this.fromError(err, opts) : this.generateArtificially(opts);
        },

        /**
         * Get a backtrace from invocation point.
         * IMPORTANT: Does not handle source maps or guess function names!
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        getSync: function StackTrace$$getSync(opts) {
            opts = _merge(_options, opts);
            var err = _generateError();
            var stack = _isShapedLikeParsableError(err) ? ErrorStackParser.parse(err) : StackGenerator.backtrace(opts);
            return _filtered(stack, opts.filter);
        },

        /**
         * Given an error object, parse it.
         *
         * @param {Error} error object
         * @param {Object} opts
         * @returns {Promise} for Array[StackFrame}
         */
        fromError: function StackTrace$$fromError(error, opts) {
            opts = _merge(_options, opts);
            var gps = new StackTraceGPS(opts);
            return new Promise(function(resolve) {
                var stackframes = _filtered(ErrorStackParser.parse(error), opts.filter);
                resolve(Promise.all(stackframes.map(function(sf) {
                    return new Promise(function(resolve) {
                        function resolveOriginal() {
                            resolve(sf);
                        }

                        gps.pinpoint(sf).then(resolve, resolveOriginal)['catch'](resolveOriginal);
                    });
                })));
            }.bind(this));
        },

        /**
         * Use StackGenerator to generate a backtrace.
         *
         * @param {Object} opts
         * @returns {Promise} of Array[StackFrame]
         */
        generateArtificially: function StackTrace$$generateArtificially(opts) {
            opts = _merge(_options, opts);
            var stackFrames = StackGenerator.backtrace(opts);
            if (typeof opts.filter === 'function') {
                stackFrames = stackFrames.filter(opts.filter);
            }
            return Promise.resolve(stackFrames);
        },

        /**
         * Given a function, wrap it such that invocations trigger a callback that
         * is called with a stack trace.
         *
         * @param {Function} fn to be instrumented
         * @param {Function} callback function to call with a stack trace on invocation
         * @param {Function} errback optional function to call with error if unable to get stack trace.
         * @param {Object} thisArg optional context object (e.g. window)
         */
        instrument: function StackTrace$$instrument(fn, callback, errback, thisArg) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                // Already instrumented, return given Function
                return fn;
            }

            var instrumented = function StackTrace$$instrumented() {
                try {
                    this.get().then(callback, errback)['catch'](errback);
                    return fn.apply(thisArg || this, arguments);
                } catch (e) {
                    if (_isShapedLikeParsableError(e)) {
                        this.fromError(e).then(callback, errback)['catch'](errback);
                    }
                    throw e;
                }
            }.bind(this);
            instrumented.__stacktraceOriginalFn = fn;

            return instrumented;
        },

        /**
         * Given a function that has been instrumented,
         * revert the function to it's original (non-instrumented) state.
         *
         * @param {Function} fn to de-instrument
         */
        deinstrument: function StackTrace$$deinstrument(fn) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot de-instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                return fn.__stacktraceOriginalFn;
            } else {
                // Function not instrumented, return original
                return fn;
            }
        },

        /**
         * Given an error message and Array of StackFrames, serialize and POST to given URL.
         *
         * @param {Array} stackframes
         * @param {String} url
         * @param {String} errorMsg
         * @param {Object} requestOptions
         */
        report: function StackTrace$$report(stackframes, url, errorMsg, requestOptions) {
            return new Promise(function(resolve, reject) {
                var req = new XMLHttpRequest();
                req.onerror = reject;
                req.onreadystatechange = function onreadystatechange() {
                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 400) {
                            resolve(req.responseText);
                        } else {
                            reject(new Error('POST to ' + url + ' failed with status: ' + req.status));
                        }
                    }
                };
                req.open('post', url);

                // Set request headers
                req.setRequestHeader('Content-Type', 'application/json');
                if (requestOptions && typeof requestOptions.headers === 'object') {
                    var headers = requestOptions.headers;
                    for (var header in headers) {
                        if (Object.prototype.hasOwnProperty.call(headers, header)) {
                            req.setRequestHeader(header, headers[header]);
                        }
                    }
                }

                var reportPayload = {stack: stackframes};
                if (errorMsg !== undefined && errorMsg !== null) {
                    reportPayload.message = errorMsg;
                }

                req.send(JSON.stringify(reportPayload));
            });
        }
    };
}));


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(18)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[()]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
                }
                var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').replace(/^.*?\s+/, '');

                // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
                // case it has spaces in it, as the string is split on \s+ later on
                var location = sanitizedLine.match(/ (\(.+\)$)/);

                // remove the parenthesized location from the line, if it was matched
                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;

                // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
                // because this line doesn't have function name
                var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
                var functionName = location && sanitizedLine || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    var matches = line.match(functionNameRegex);
                    var functionName = matches && matches[1] ? matches[1] : undefined;
                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                    .replace(/<anonymous function(: (\w+))?>/, '$2')
                    .replace(/\([^)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));


/***/ }),
/* 18 */
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];
    var objectProps = ['evalOrigin'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);

    function StackFrame(obj) {
        if (!obj) return;
        for (var i = 0; i < props.length; i++) {
            if (obj[props[i]] !== undefined) {
                this['set' + _capitalize(props[i])](obj[props[i]]);
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var fileName = this.getFileName() || '';
            var lineNumber = this.getLineNumber() || '';
            var columnNumber = this.getColumnNumber() || '';
            var functionName = this.getFunctionName() || '';
            if (this.getIsEval()) {
                if (fileName) {
                    return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
                }
                return '[eval]:' + lineNumber + ':' + columnNumber;
            }
            if (functionName) {
                return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
            }
            return fileName + ':' + lineNumber + ':' + columnNumber;
        }
    };

    StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf('(');
        var argsEndIndex = str.lastIndexOf(')');

        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
        var locationString = str.substring(argsEndIndex + 1);

        if (locationString.indexOf('@') === 0) {
            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
            var fileName = parts[1];
            var lineNumber = parts[2];
            var columnNumber = parts[3];
        }

        return new StackFrame({
            functionName: functionName,
            args: args || undefined,
            fileName: fileName,
            lineNumber: lineNumber || undefined,
            columnNumber: columnNumber || undefined
        });
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(18)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function(StackFrame) {
    return {
        backtrace: function StackGenerator$$backtrace(opts) {
            var stack = [];
            var maxStackSize = 10;

            if (typeof opts === 'object' && typeof opts.maxStackSize === 'number') {
                maxStackSize = opts.maxStackSize;
            }

            var curr = arguments.callee;
            while (curr && stack.length < maxStackSize && curr['arguments']) {
                // Allow V8 optimizations
                var args = new Array(curr['arguments'].length);
                for (var i = 0; i < args.length; ++i) {
                    args[i] = curr['arguments'][i];
                }
                if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) {
                    stack.push(new StackFrame({functionName: RegExp.$1 || undefined, args: args}));
                } else {
                    stack.push(new StackFrame({args: args}));
                }

                try {
                    curr = curr.caller;
                } catch (e) {
                    break;
                }
            }
            return stack;
        }
    };
}));


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(21), __webpack_require__(18)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function(SourceMap, StackFrame) {
    'use strict';

    /**
     * Make a X-Domain request to url and callback.
     *
     * @param {String} url
     * @returns {Promise} with response text if fulfilled
     */
    function _xdr(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('get', url);
            req.onerror = reject;
            req.onreadystatechange = function onreadystatechange() {
                if (req.readyState === 4) {
                    if ((req.status >= 200 && req.status < 300) ||
                        (url.substr(0, 7) === 'file://' && req.responseText)) {
                        resolve(req.responseText);
                    } else {
                        reject(new Error('HTTP status: ' + req.status + ' retrieving ' + url));
                    }
                }
            };
            req.send();
        });

    }

    /**
     * Convert a Base64-encoded string into its original representation.
     * Used for inline sourcemaps.
     *
     * @param {String} b64str Base-64 encoded string
     * @returns {String} original representation of the base64-encoded string.
     */
    function _atob(b64str) {
        if (typeof window !== 'undefined' && window.atob) {
            return window.atob(b64str);
        } else {
            throw new Error('You must supply a polyfill for window.atob in this environment');
        }
    }

    function _parseJson(string) {
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(string);
        } else {
            throw new Error('You must supply a polyfill for JSON.parse in this environment');
        }
    }

    function _findFunctionName(source, lineNumber/*, columnNumber*/) {
        var syntaxes = [
            // {name} = function ({args}) TODO args capture
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/,
            // function {name}({args}) m[1]=name m[2]=args
            /function\s+([^('"`]*?)\s*\(([^)]*)\)/,
            // {name} = eval()
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/,
            // fn_name() {
            /\b(?!(?:if|for|switch|while|with|catch)\b)(?:(?:static)\s+)?(\S+)\s*\(.*?\)\s*\{/,
            // {name} = () => {
            /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*\(.*?\)\s*=>/
        ];
        var lines = source.split('\n');

        // Walk backwards in the source lines until we find the line which matches one of the patterns above
        var code = '';
        var maxLines = Math.min(lineNumber, 20);
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            var line = lines[lineNumber - i - 1];
            var commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }

            if (line) {
                code = line + code;
                var len = syntaxes.length;
                for (var index = 0; index < len; index++) {
                    var m = syntaxes[index].exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
        }
        return undefined;
    }

    function _ensureSupportedEnvironment() {
        if (typeof Object.defineProperty !== 'function' || typeof Object.create !== 'function') {
            throw new Error('Unable to consume source maps in older browsers');
        }
    }

    function _ensureStackFrameIsLegit(stackframe) {
        if (typeof stackframe !== 'object') {
            throw new TypeError('Given StackFrame is not an object');
        } else if (typeof stackframe.fileName !== 'string') {
            throw new TypeError('Given file name is not a String');
        } else if (typeof stackframe.lineNumber !== 'number' ||
            stackframe.lineNumber % 1 !== 0 ||
            stackframe.lineNumber < 1) {
            throw new TypeError('Given line number must be a positive integer');
        } else if (typeof stackframe.columnNumber !== 'number' ||
            stackframe.columnNumber % 1 !== 0 ||
            stackframe.columnNumber < 0) {
            throw new TypeError('Given column number must be a non-negative integer');
        }
        return true;
    }

    function _findSourceMappingURL(source) {
        var sourceMappingUrlRegExp = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/mg;
        var lastSourceMappingUrl;
        var matchSourceMappingUrl;
        // eslint-disable-next-line no-cond-assign
        while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) {
            lastSourceMappingUrl = matchSourceMappingUrl[1];
        }
        if (lastSourceMappingUrl) {
            return lastSourceMappingUrl;
        } else {
            throw new Error('sourceMappingURL not found');
        }
    }

    function _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache) {
        return new Promise(function(resolve, reject) {
            var loc = sourceMapConsumer.originalPositionFor({
                line: stackframe.lineNumber,
                column: stackframe.columnNumber
            });

            if (loc.source) {
                // cache mapped sources
                var mappedSource = sourceMapConsumer.sourceContentFor(loc.source);
                if (mappedSource) {
                    sourceCache[loc.source] = mappedSource;
                }

                resolve(
                    // given stackframe and source location, update stackframe
                    new StackFrame({
                        functionName: loc.name || stackframe.functionName,
                        args: stackframe.args,
                        fileName: loc.source,
                        lineNumber: loc.line,
                        columnNumber: loc.column
                    }));
            } else {
                reject(new Error('Could not get original source for given stackframe and source map'));
            }
        });
    }

    /**
     * @constructor
     * @param {Object} opts
     *      opts.sourceCache = {url: "Source String"} => preload source cache
     *      opts.sourceMapConsumerCache = {/path/file.js.map: SourceMapConsumer}
     *      opts.offline = True to prevent network requests.
     *              Best effort without sources or source maps.
     *      opts.ajax = Promise returning function to make X-Domain requests
     */
    return function StackTraceGPS(opts) {
        if (!(this instanceof StackTraceGPS)) {
            return new StackTraceGPS(opts);
        }
        opts = opts || {};

        this.sourceCache = opts.sourceCache || {};
        this.sourceMapConsumerCache = opts.sourceMapConsumerCache || {};

        this.ajax = opts.ajax || _xdr;

        this._atob = opts.atob || _atob;

        this._get = function _get(location) {
            return new Promise(function(resolve, reject) {
                var isDataUrl = location.substr(0, 5) === 'data:';
                if (this.sourceCache[location]) {
                    resolve(this.sourceCache[location]);
                } else if (opts.offline && !isDataUrl) {
                    reject(new Error('Cannot make network requests in offline mode'));
                } else {
                    if (isDataUrl) {
                        // data URLs can have parameters.
                        // see http://tools.ietf.org/html/rfc2397
                        var supportedEncodingRegexp =
                            /^data:application\/json;([\w=:"-]+;)*base64,/;
                        var match = location.match(supportedEncodingRegexp);
                        if (match) {
                            var sourceMapStart = match[0].length;
                            var encodedSource = location.substr(sourceMapStart);
                            var source = this._atob(encodedSource);
                            this.sourceCache[location] = source;
                            resolve(source);
                        } else {
                            reject(new Error('The encoding of the inline sourcemap is not supported'));
                        }
                    } else {
                        var xhrPromise = this.ajax(location, {method: 'get'});
                        // Cache the Promise to prevent duplicate in-flight requests
                        this.sourceCache[location] = xhrPromise;
                        xhrPromise.then(resolve, reject);
                    }
                }
            }.bind(this));
        };

        /**
         * Creating SourceMapConsumers is expensive, so this wraps the creation of a
         * SourceMapConsumer in a per-instance cache.
         *
         * @param {String} sourceMappingURL = URL to fetch source map from
         * @param {String} defaultSourceRoot = Default source root for source map if undefined
         * @returns {Promise} that resolves a SourceMapConsumer
         */
        this._getSourceMapConsumer = function _getSourceMapConsumer(sourceMappingURL, defaultSourceRoot) {
            return new Promise(function(resolve) {
                if (this.sourceMapConsumerCache[sourceMappingURL]) {
                    resolve(this.sourceMapConsumerCache[sourceMappingURL]);
                } else {
                    var sourceMapConsumerPromise = new Promise(function(resolve, reject) {
                        return this._get(sourceMappingURL).then(function(sourceMapSource) {
                            if (typeof sourceMapSource === 'string') {
                                sourceMapSource = _parseJson(sourceMapSource.replace(/^\)\]\}'/, ''));
                            }
                            if (typeof sourceMapSource.sourceRoot === 'undefined') {
                                sourceMapSource.sourceRoot = defaultSourceRoot;
                            }

                            resolve(new SourceMap.SourceMapConsumer(sourceMapSource));
                        }).catch(reject);
                    }.bind(this));
                    this.sourceMapConsumerCache[sourceMappingURL] = sourceMapConsumerPromise;
                    resolve(sourceMapConsumerPromise);
                }
            }.bind(this));
        };

        /**
         * Given a StackFrame, enhance function name and use source maps for a
         * better StackFrame.
         *
         * @param {StackFrame} stackframe object
         * @returns {Promise} that resolves with with source-mapped StackFrame
         */
        this.pinpoint = function StackTraceGPS$$pinpoint(stackframe) {
            return new Promise(function(resolve, reject) {
                this.getMappedLocation(stackframe).then(function(mappedStackFrame) {
                    function resolveMappedStackFrame() {
                        resolve(mappedStackFrame);
                    }

                    this.findFunctionName(mappedStackFrame)
                        .then(resolve, resolveMappedStackFrame)
                        // eslint-disable-next-line no-unexpected-multiline
                        ['catch'](resolveMappedStackFrame);
                }.bind(this), reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, guess function name from location information.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.findFunctionName = function StackTraceGPS$$findFunctionName(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureStackFrameIsLegit(stackframe);
                this._get(stackframe.fileName).then(function getSourceCallback(source) {
                    var lineNumber = stackframe.lineNumber;
                    var columnNumber = stackframe.columnNumber;
                    var guessedFunctionName = _findFunctionName(source, lineNumber, columnNumber);
                    // Only replace functionName if we found something
                    if (guessedFunctionName) {
                        resolve(new StackFrame({
                            functionName: guessedFunctionName,
                            args: stackframe.args,
                            fileName: stackframe.fileName,
                            lineNumber: lineNumber,
                            columnNumber: columnNumber
                        }));
                    } else {
                        resolve(stackframe);
                    }
                }, reject)['catch'](reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, seek source-mapped location and return new enhanced StackFrame.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.getMappedLocation = function StackTraceGPS$$getMappedLocation(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureSupportedEnvironment();
                _ensureStackFrameIsLegit(stackframe);

                var sourceCache = this.sourceCache;
                var fileName = stackframe.fileName;
                this._get(fileName).then(function(source) {
                    var sourceMappingURL = _findSourceMappingURL(source);
                    var isDataUrl = sourceMappingURL.substr(0, 5) === 'data:';
                    var defaultSourceRoot = fileName.substring(0, fileName.lastIndexOf('/') + 1);

                    if (sourceMappingURL[0] !== '/' && !isDataUrl && !(/^https?:\/\/|^\/\//i).test(sourceMappingURL)) {
                        sourceMappingURL = defaultSourceRoot + sourceMappingURL;
                    }

                    return this._getSourceMapConsumer(sourceMappingURL, defaultSourceRoot)
                        .then(function(sourceMapConsumer) {
                            return _extractLocationInfoFromSourceMapSource(stackframe, sourceMapConsumer, sourceCache)
                                .then(resolve)['catch'](function() {
                                    resolve(stackframe);
                                });
                        });
                }.bind(this), reject)['catch'](reject);
            }.bind(this));
        };
    };
}));


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = __webpack_require__(22).SourceMapGenerator;
exports.SourceMapConsumer = __webpack_require__(28).SourceMapConsumer;
exports.SourceNode = __webpack_require__(31).SourceNode;


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = __webpack_require__(23);
var util = __webpack_require__(25);
var ArraySet = (__webpack_require__(26).ArraySet);
var MappingList = (__webpack_require__(27).MappingList);

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = __webpack_require__(24);

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(25);
var has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = util.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  var sStr = util.toSetString(aStr);
  return has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = util.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(25);

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(25);
var binarySearch = __webpack_require__(29);
var ArraySet = (__webpack_require__(26).ArraySet);
var base64VLQ = __webpack_require__(23);
var quickSort = (__webpack_require__(30).quickSort);

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = (__webpack_require__(22).SourceMapGenerator);
var util = __webpack_require__(25);

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are removed from this array, by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var shiftNextLine = function() {
      var lineContents = remainingLines.shift();
      // The last line of a file might not have a newline.
      var newLine = remainingLines.shift() || "";
      return lineContents + newLine;
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[0];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[0];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[0] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLines.length > 0) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsLevelComparator": () => (/* binding */ AsLevelComparator),
/* harmony export */   "Level": () => (/* binding */ Level)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

const { defineProperty } = Reflect;
/**
 * @class module:logger.Level
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {external:string} name
 * @param {external:number} value
 */
class Level {
    constructor(name, value) {
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    get [Symbol.toStringTag]() {
        return `Level:${this.name}`;
    }
    /**
     * @function module:logger.Level#compareTo
     * @param {module:logger.Level} value
     * @returns {external:number}
     */
    compareTo(value) {
        if (!isLevel(value)) {
            throw new TypeError('value must be an instance of Level');
        }
        if (this.value < value.value) {
            return -1;
        }
        else if (this.value > value.value) {
            return 1;
        }
        else {
            return 0;
        }
    }
    /**
     * @function module:logger.Level#toJSON
     * @returns {external:string}
     */
    toJSON() {
        return this.toString();
    }
    /**
     * @function module:logger.Level#toString
     * @returns {external:string} The string representation of the level
     */
    toString() {
        return this.name;
    }
}
/**
 * @member {module:logger.Level} module:logger.Level.OFF
 */
Level.OFF = new Level('off', 0);
/**
 * @member {module:logger.Level} module:logger.Level.ALL
 */
Level.ALL = new Level('all', Number.MAX_VALUE);
const isLevel = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Level);
// Setting the return type to "Constructable<LevelComparator> & T" forces importing modules to also import LevelComparator
/**
 * @function module:logger.AsLevelComparator
 * @param {T} superclass
 * @returns {module:core.Constructable<module:logger.AsLevelComparator>}
 */
const AsLevelComparator = (superclass) => class extends superclass {
    compare(level1, level2) {
        if (!isLevel(level1)) {
            throw new TypeError('level1 must be an instance of Level');
        }
        if (!isLevel(level2)) {
            throw new TypeError('level2 must be an instance of Level');
        }
        if (level1.value < level2.value) {
            return -1;
        }
        else if (level1.value > level2.value) {
            return 1;
        }
        else {
            return 0;
        }
    }
};
/**
 * @interface module:logger.LevelComparator
 * @extends {module:core.Comparator}
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBR0gsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVoQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBS25DOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBMkJkLFlBQWEsSUFBWSxFQUFFLEtBQWE7UUFDcEMsY0FBYyxDQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDMUIsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7UUFFSixjQUFjLENBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMzQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7SUFsQkQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxTQUFVLElBQUksQ0FBQyxJQUFLLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBa0JEOzs7O09BSUc7SUFDSCxTQUFTLENBQUUsS0FBWTtRQUNuQixJQUFJLENBQUMsT0FBTyxDQUFFLEtBQUssQ0FBRSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUUsb0NBQW9DLENBQUUsQ0FBQztTQUMvRDtRQUVELElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjthQUFNLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFBTTtZQUNILE9BQU8sQ0FBQyxDQUFDO1NBQ1o7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTTtRQUNGLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7O0FBM0VEOztHQUVHO0FBQ0ksU0FBRyxHQUFHLElBQUksS0FBSyxDQUFFLEtBQUssRUFBRSxDQUFDLENBQUUsQ0FBQztBQUVuQzs7R0FFRztBQUNJLFNBQUcsR0FBRyxJQUFJLEtBQUssQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBRSxDQUFDO0FBd0V0RCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUUsS0FBSyxDQUFFLENBQUM7QUFFNUIsMEhBQTBIO0FBQzFIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxDQUEyQixVQUFhLEVBQXVDLEVBQUUsQ0FBQyxLQUFNLFNBQVEsVUFBVTtJQUN2SSxPQUFPLENBQUUsTUFBYSxFQUFFLE1BQWE7UUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsRUFBRTtZQUNwQixNQUFNLElBQUksU0FBUyxDQUFFLHFDQUFxQyxDQUFFLENBQUM7U0FDaEU7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFFLE1BQU0sQ0FBRSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxTQUFTLENBQUUscUNBQXFDLENBQUUsQ0FBQztTQUNoRTtRQUVELElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjthQUFNLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFBTTtZQUNILE9BQU8sQ0FBQyxDQUFDO1NBQ1o7SUFDTCxDQUFDO0NBQ0osQ0FBQztBQUVGOzs7R0FHRyJ9

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractLogger": () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_0__.AbstractLogger),
/* harmony export */   "SimpleLogger": () => (/* reexport safe */ _loggers_simple_logger__WEBPACK_IMPORTED_MODULE_1__.SimpleLogger),
/* harmony export */   "likeLogger": () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_0__.likeLogger)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(34);
/* harmony import */ var _loggers_simple_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(35);
/**
 * @author Jeff Rose
 */


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2Vycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILGNBQWMsVUFBVSxDQUFDO0FBQ3pCLGNBQWMseUJBQXlCLENBQUMifQ==

/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractLogger": () => (/* binding */ AbstractLogger),
/* harmony export */   "likeLogger": () => (/* binding */ likeLogger)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(32);
/* harmony import */ var _entry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_3__);
/**
 * @author Jeff Rose
 */




const { defineProperty } = Reflect;
class AbstractLogger extends (0,_level__WEBPACK_IMPORTED_MODULE_1__.AsLevelComparator)(_blue_core__WEBPACK_IMPORTED_MODULE_0__.Null) {
    constructor(name = null) {
        super();
        defineProperty(this, 'name', {
            value: name,
            configurable: false,
            enumerable: true,
            writable: true
        });
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_1__.Level.ALL;
    }
    get [Symbol.toStringTag]() {
        return 'Logger';
    }
    log(level, message) {
        if (this.compare(this.threshold, level) >= 0) {
            const entry = (0,_entry__WEBPACK_IMPORTED_MODULE_2__.newEntry)(this.name, level, message);
            this._logEntry(entry);
        }
    }
}
const likeLogger = (0,_blue_util__WEBPACK_IMPORTED_MODULE_3__.allPass)([_blue_core__WEBPACK_IMPORTED_MODULE_0__.likeComparator, (0,_blue_util__WEBPACK_IMPORTED_MODULE_3__.like)({ threshold: _level__WEBPACK_IMPORTED_MODULE_1__.Level, log: Function })]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFtQixNQUFNLFNBQVMsQ0FBQztBQUNwRSxPQUFPLEVBQW1CLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQW9CM0MsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQWdCLGNBQWUsU0FBUSxpQkFBaUIsQ0FBRSxJQUFJLENBQUU7SUFRbEUsWUFBYSxPQUFlLElBQUk7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFDUixjQUFjLENBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUMxQixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxLQUFLO1lBQ25CLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUUsQ0FBQztRQUNKLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBYkQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQWFELEdBQUcsQ0FBRSxLQUFZLEVBQUUsT0FBbUI7UUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFFLElBQUksQ0FBQyxFQUFFO1lBQzVDLE1BQU0sS0FBSyxHQUFVLFFBQVEsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztZQUUzRCxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssQ0FBRSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztDQUdKO0FBRUQsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBRSxDQUFFLGNBQWMsRUFBRSxJQUFJLENBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBUyxDQUFFLENBQWtDLENBQUMifQ==

/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SimpleLogger": () => (/* binding */ SimpleLogger)
/* harmony export */ });
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);
/**
 * @author Jeff Rose
 */


const defineProperty = Reflect.defineProperty;
class SimpleLogger extends _logger__WEBPACK_IMPORTED_MODULE_1__.AbstractLogger {
    constructor(name, appenders = []) {
        super();
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'appenders', {
            value: appenders,
            configurable: true,
            enumerable: false,
            writable: false
        });
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
    }
    addAppender(appender) {
        this.appenders.push(appender);
    }
    clearAppenders() {
        let index = this.appenders.length;
        while (index--) {
            this.appenders.pop();
        }
    }
    _logEntry(entry) {
        const length = this.appenders.length;
        let index = 0;
        for (; index < length; index++) {
            this.appenders[index].append(entry);
        }
    }
    removeAppender(appender) {
        const index = this.appenders.indexOf(appender);
        if (index !== -1) {
            this.appenders.splice(index, 1);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWxvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXJzL3NpbXBsZS1sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBSUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNqQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTNDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFFOUMsTUFBTSxPQUFPLFlBQWEsU0FBUSxjQUFjO0lBSzVDLFlBQWEsSUFBWSxFQUFFLFlBQXdCLEVBQUU7UUFDakQsS0FBSyxFQUFFLENBQUM7UUFFUixjQUFjLENBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUMxQixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztRQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQy9CLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztRQUVKLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBRUQsV0FBVyxDQUFFLFFBQWtCO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxjQUFjO1FBQ1YsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsT0FBTyxLQUFLLEVBQUUsRUFBRTtZQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRVMsU0FBUyxDQUFFLEtBQVk7UUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDckMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxDQUFFLENBQUMsTUFBTSxDQUFFLEtBQUssQ0FBRSxDQUFDO1NBQzNDO0lBQ0wsQ0FBQztJQUVELGNBQWMsQ0FBRSxRQUFrQjtRQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBRSxRQUFRLENBQUUsQ0FBQztRQUNqRCxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFFLEtBQUssRUFBRSxDQUFDLENBQUUsQ0FBQztTQUNyQztJQUNMLENBQUM7Q0FDSiJ9

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ApacheBrowserConsoleAppender": () => (/* binding */ ApacheBrowserConsoleAppender),
/* harmony export */   "ApacheBrowserConsoleLevelMapping": () => (/* binding */ ApacheBrowserConsoleLevelMapping),
/* harmony export */   "ApacheColor": () => (/* binding */ ApacheColor),
/* harmony export */   "ApacheLevel": () => (/* binding */ ApacheLevel),
/* harmony export */   "AsApacheLogger": () => (/* binding */ AsApacheLogger),
/* harmony export */   "likeApacheLogger": () => (/* binding */ likeApacheLogger)
/* harmony export */ });
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
/**
 * @author Jeff Rose
 */



class ApacheLevel extends _level__WEBPACK_IMPORTED_MODULE_0__.Level {
}
ApacheLevel.FATAL = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('fatal', 10000);
ApacheLevel.ERROR = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('error', 20000);
ApacheLevel.WARN = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('warn', 30000);
ApacheLevel.INFO = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('info', 40000);
ApacheLevel.DEBUG = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('debug', 50000);
ApacheLevel.TRACE = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('trace', 60000);
const ApacheColor = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    trace: 'grey'
};
const ApacheBrowserConsoleLevelMapping = {
    fatal: 'error',
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
    trace: 'debug'
};
class ApacheBrowserConsoleAppender extends _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__.BrowserConsoleAppender {
    constructor() {
        super(ApacheBrowserConsoleLevelMapping);
    }
}
const likeApacheLogger = (0,_blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ fatal: Function, error: Function, warn: Function, info: Function, debug: Function, trace: Function });
const AsApacheLogger = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
    }
    fatal(...message) {
        this.log(ApacheLevel.FATAL, message);
    }
    error(...message) {
        this.log(ApacheLevel.ERROR, message);
    }
    warn(...message) {
        this.log(ApacheLevel.WARN, message);
    }
    info(...message) {
        this.log(ApacheLevel.INFO, message);
    }
    debug(...message) {
        this.log(ApacheLevel.DEBUG, message);
    }
    trace(...message) {
        this.log(ApacheLevel.TRACE, message);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBhY2hlLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBhY2hlLWxvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVoQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU5RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBS2xDLE1BQU0sT0FBTyxXQUFZLFNBQVEsS0FBSzs7QUFDM0IsaUJBQUssR0FBRyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDcEMsaUJBQUssR0FBRyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDcEMsZ0JBQUksR0FBSSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUcsS0FBSyxDQUFFLENBQUM7QUFDcEMsZ0JBQUksR0FBSSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUcsS0FBSyxDQUFFLENBQUM7QUFDcEMsaUJBQUssR0FBRyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDcEMsaUJBQUssR0FBRyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFHL0MsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHO0lBQ3ZCLEtBQUssRUFBRyxLQUFLO0lBQ2IsS0FBSyxFQUFHLEtBQUs7SUFDYixJQUFJLEVBQUksUUFBUTtJQUNoQixJQUFJLEVBQUksT0FBTztJQUNmLEtBQUssRUFBRyxNQUFNO0lBQ2QsS0FBSyxFQUFHLE1BQU07Q0FDakIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHO0lBQzVDLEtBQUssRUFBRyxPQUFPO0lBQ2YsS0FBSyxFQUFHLE9BQU87SUFDZixJQUFJLEVBQUksTUFBTTtJQUNkLElBQUksRUFBSSxNQUFNO0lBQ2QsS0FBSyxFQUFHLE9BQU87SUFDZixLQUFLLEVBQUcsT0FBTztDQUNsQixDQUFDO0FBRUYsTUFBTSxPQUFPLDRCQUE2QixTQUFRLHNCQUFzQjtJQUNwRTtRQUNJLEtBQUssQ0FBRSxnQ0FBZ0MsQ0FBRSxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQVdELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUUsQ0FBQztBQUUvSSxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsQ0FBbUMsVUFBYSxFQUFvQyxFQUFFLENBQUMsS0FBTSxTQUFRLFVBQVU7SUFBeEI7O1FBQ2pILGNBQVMsR0FBZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQXlCdkMsQ0FBQztJQXZCRyxLQUFLLENBQUUsR0FBRyxPQUFtQjtRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQUcsT0FBbUI7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxJQUFJLENBQUUsR0FBRyxPQUFtQjtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsS0FBSyxDQUFFLEdBQUcsT0FBbUI7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzNDLENBQUM7Q0FDSixDQUFDIn0=

/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsCLILogger": () => (/* binding */ AsCLILogger),
/* harmony export */   "CLIBrowserConsoleAppender": () => (/* binding */ CLIBrowserConsoleAppender),
/* harmony export */   "CLIBrowserConsoleLevelMapping": () => (/* binding */ CLIBrowserConsoleLevelMapping),
/* harmony export */   "CLIColor": () => (/* binding */ CLIColor),
/* harmony export */   "CLILevel": () => (/* binding */ CLILevel)
/* harmony export */ });
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/**
 * @author Jeff Rose
 */


class CLILevel extends _level__WEBPACK_IMPORTED_MODULE_0__.Level {
}
CLILevel.ERROR = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('error', 10000);
CLILevel.WARN = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('warn', 20000);
CLILevel.HELP = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('help', 30000);
CLILevel.DATA = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('data', 40000);
CLILevel.INFO = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('info', 50000);
CLILevel.DEBUG = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('debug', 60000);
CLILevel.PROMPT = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('prompt', 70000);
CLILevel.VERBOSE = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('verbose', 80000);
CLILevel.INPUT = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('input', 90000);
CLILevel.SILLY = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('silly', 100000);
;
const CLIColor = {
    error: 'red',
    warn: 'yellow',
    help: 'cyan',
    data: 'grey',
    info: 'green',
    debug: 'blue',
    prompt: 'grey',
    verbose: 'cyan',
    input: 'grey',
    silly: 'magenta'
};
const CLIBrowserConsoleLevelMapping = {
    error: 'error',
    warn: 'warn',
    help: 'info',
    data: 'info',
    info: 'info',
    debug: 'debug',
    prompt: 'info',
    verbose: 'debug',
    input: 'debug',
    silly: 'debug'
};
class CLIBrowserConsoleAppender extends _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__.BrowserConsoleAppender {
    constructor() {
        super(CLIBrowserConsoleLevelMapping);
    }
}
const AsCLILogger = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
    }
    error(...message) {
        this.log(CLILevel.ERROR, message);
    }
    warn(...message) {
        this.log(CLILevel.WARN, message);
    }
    help(...message) {
        this.log(CLILevel.HELP, message);
    }
    data(...message) {
        this.log(CLILevel.DATA, message);
    }
    info(...message) {
        this.log(CLILevel.INFO, message);
    }
    debug(...message) {
        this.log(CLILevel.DEBUG, message);
    }
    prompt(...message) {
        this.log(CLILevel.PROMPT, message);
    }
    verbose(...message) {
        this.log(CLILevel.VERBOSE, message);
    }
    input(...message) {
        this.log(CLILevel.INPUT, message);
    }
    silly(...message) {
        this.log(CLILevel.SILLY, message);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY2xpLWxvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVoQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQU05RSxNQUFNLE9BQU8sUUFBUyxTQUFRLEtBQUs7O0FBQ3hCLGNBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFDeEMsYUFBSSxHQUFNLElBQUksS0FBSyxDQUFFLE1BQU0sRUFBSyxLQUFLLENBQUUsQ0FBQztBQUN4QyxhQUFJLEdBQU0sSUFBSSxLQUFLLENBQUUsTUFBTSxFQUFLLEtBQUssQ0FBRSxDQUFDO0FBQ3hDLGFBQUksR0FBTSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUssS0FBSyxDQUFFLENBQUM7QUFDeEMsYUFBSSxHQUFNLElBQUksS0FBSyxDQUFFLE1BQU0sRUFBSyxLQUFLLENBQUUsQ0FBQztBQUN4QyxjQUFLLEdBQUssSUFBSSxLQUFLLENBQUUsT0FBTyxFQUFJLEtBQUssQ0FBRSxDQUFDO0FBQ3hDLGVBQU0sR0FBSSxJQUFJLEtBQUssQ0FBRSxRQUFRLEVBQUcsS0FBSyxDQUFFLENBQUM7QUFDeEMsZ0JBQU8sR0FBRyxJQUFJLEtBQUssQ0FBRSxTQUFTLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDeEMsY0FBSyxHQUFLLElBQUksS0FBSyxDQUFFLE9BQU8sRUFBSSxLQUFLLENBQUUsQ0FBQztBQUN4QyxjQUFLLEdBQUssSUFBSSxLQUFLLENBQUUsT0FBTyxFQUFJLE1BQU0sQ0FBRSxDQUFDO0FBQ25ELENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUc7SUFDcEIsS0FBSyxFQUFLLEtBQUs7SUFDZixJQUFJLEVBQU0sUUFBUTtJQUNsQixJQUFJLEVBQU0sTUFBTTtJQUNoQixJQUFJLEVBQU0sTUFBTTtJQUNoQixJQUFJLEVBQU0sT0FBTztJQUNqQixLQUFLLEVBQUssTUFBTTtJQUNoQixNQUFNLEVBQUksTUFBTTtJQUNoQixPQUFPLEVBQUcsTUFBTTtJQUNoQixLQUFLLEVBQUssTUFBTTtJQUNoQixLQUFLLEVBQUssU0FBUztDQUN0QixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUc7SUFDekMsS0FBSyxFQUFLLE9BQU87SUFDakIsSUFBSSxFQUFNLE1BQU07SUFDaEIsSUFBSSxFQUFNLE1BQU07SUFDaEIsSUFBSSxFQUFNLE1BQU07SUFDaEIsSUFBSSxFQUFNLE1BQU07SUFDaEIsS0FBSyxFQUFLLE9BQU87SUFDakIsTUFBTSxFQUFJLE1BQU07SUFDaEIsT0FBTyxFQUFHLE9BQU87SUFDakIsS0FBSyxFQUFLLE9BQU87SUFDakIsS0FBSyxFQUFLLE9BQU87Q0FDcEIsQ0FBQztBQUVGLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxzQkFBc0I7SUFDakU7UUFDSSxLQUFLLENBQUUsNkJBQTZCLENBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0o7QUFlRCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBbUMsVUFBYSxFQUFpQyxFQUFFLENBQUMsS0FBTSxTQUFRLFVBQVU7SUFBeEI7O1FBQzNHLGNBQVMsR0FBYSxLQUFLLENBQUMsR0FBRyxDQUFDO0lBeUNwQyxDQUFDO0lBdkNHLEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQUcsT0FBbUI7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLENBQUUsR0FBRyxPQUFtQjtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksQ0FBRSxHQUFHLE9BQW1CO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQUcsT0FBbUI7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUUsR0FBRyxPQUFtQjtRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBRSxHQUFHLE9BQW1CO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsT0FBTyxDQUFFLEdBQUcsT0FBbUI7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxLQUFLLENBQUUsR0FBRyxPQUFtQjtRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN4QyxDQUFDO0NBQ0osQ0FBQyJ9

/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsNPMLogger": () => (/* binding */ AsNPMLogger),
/* harmony export */   "NPMBrowserConsoleAppender": () => (/* binding */ NPMBrowserConsoleAppender),
/* harmony export */   "NPMBrowserConsoleLevelMapping": () => (/* binding */ NPMBrowserConsoleLevelMapping),
/* harmony export */   "NPMColor": () => (/* binding */ NPMColor),
/* harmony export */   "NPMLevel": () => (/* binding */ NPMLevel),
/* harmony export */   "likeNPMLogger": () => (/* binding */ likeNPMLogger)
/* harmony export */ });
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
/**
 * @author Jeff Rose
 */



class NPMLevel extends _level__WEBPACK_IMPORTED_MODULE_0__.Level {
}
NPMLevel.ERROR = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('error', 10000);
NPMLevel.WARN = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('warn', 20000);
NPMLevel.INFO = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('info', 30000);
NPMLevel.HTTP = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('http', 40000);
NPMLevel.VERBOSE = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('verbose', 50000);
NPMLevel.DEBUG = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('debug', 60000);
NPMLevel.SILLY = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('silly', 70000);
const NPMColor = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'green',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'magenta'
};
const NPMBrowserConsoleLevelMapping = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    http: 'info',
    verbose: 'debug',
    debug: 'debug',
    silly: 'debug'
};
class NPMBrowserConsoleAppender extends _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__.BrowserConsoleAppender {
    constructor() {
        super(NPMBrowserConsoleLevelMapping);
    }
}
const likeNPMLogger = (0,_blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ error: Function, warn: Function, info: Function, http: Function, verbose: Function, debug: Function, silly: Function });
const AsNPMLogger = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
    }
    error(...message) {
        this.log(NPMLevel.ERROR, message);
    }
    warn(...message) {
        this.log(NPMLevel.WARN, message);
    }
    info(...message) {
        this.log(NPMLevel.INFO, message);
    }
    http(...message) {
        this.log(NPMLevel.HTTP, message);
    }
    verbose(...message) {
        this.log(NPMLevel.VERBOSE, message);
    }
    debug(...message) {
        this.log(NPMLevel.DEBUG, message);
    }
    silly(...message) {
        this.log(NPMLevel.SILLY, message);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbnBtLWxvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVoQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU5RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBS2xDLE1BQU0sT0FBTyxRQUFTLFNBQVEsS0FBSzs7QUFDeEIsY0FBSyxHQUFLLElBQUksS0FBSyxDQUFFLE9BQU8sRUFBSSxLQUFLLENBQUUsQ0FBQztBQUN4QyxhQUFJLEdBQU0sSUFBSSxLQUFLLENBQUUsTUFBTSxFQUFLLEtBQUssQ0FBRSxDQUFDO0FBQ3hDLGFBQUksR0FBTSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUssS0FBSyxDQUFFLENBQUM7QUFDeEMsYUFBSSxHQUFNLElBQUksS0FBSyxDQUFFLE1BQU0sRUFBSyxLQUFLLENBQUUsQ0FBQztBQUN4QyxnQkFBTyxHQUFHLElBQUksS0FBSyxDQUFFLFNBQVMsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUN4QyxjQUFLLEdBQUssSUFBSSxLQUFLLENBQUUsT0FBTyxFQUFJLEtBQUssQ0FBRSxDQUFDO0FBQ3hDLGNBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFHbkQsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHO0lBQ3BCLEtBQUssRUFBSyxLQUFLO0lBQ2YsSUFBSSxFQUFNLFFBQVE7SUFDbEIsSUFBSSxFQUFNLE9BQU87SUFDakIsSUFBSSxFQUFNLE9BQU87SUFDakIsT0FBTyxFQUFHLE1BQU07SUFDaEIsS0FBSyxFQUFLLE1BQU07SUFDaEIsS0FBSyxFQUFLLFNBQVM7Q0FDdEIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLDZCQUE2QixHQUFHO0lBQ3pDLEtBQUssRUFBSyxPQUFPO0lBQ2pCLElBQUksRUFBTSxNQUFNO0lBQ2hCLElBQUksRUFBTSxNQUFNO0lBQ2hCLElBQUksRUFBTSxNQUFNO0lBQ2hCLE9BQU8sRUFBRyxPQUFPO0lBQ2pCLEtBQUssRUFBSyxPQUFPO0lBQ2pCLEtBQUssRUFBSyxPQUFPO0NBQ3BCLENBQUM7QUFFRixNQUFNLE9BQU8seUJBQTBCLFNBQVEsc0JBQXNCO0lBQ2pFO1FBQ0ksS0FBSyxDQUFFLDZCQUE2QixDQUFFLENBQUM7SUFDM0MsQ0FBQztDQUNKO0FBWUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBRSxDQUFDO0FBRTlKLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFtQyxVQUFhLEVBQWlDLEVBQUUsQ0FBQyxLQUFNLFNBQVEsVUFBVTtJQUF4Qjs7UUFDM0csY0FBUyxHQUFhLEtBQUssQ0FBQyxHQUFHLENBQUM7SUE2QnBDLENBQUM7SUEzQkcsS0FBSyxDQUFFLEdBQUcsT0FBbUI7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxJQUFJLENBQUUsR0FBRyxPQUFtQjtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksQ0FBRSxHQUFHLE9BQW1CO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQUcsT0FBbUI7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPLENBQUUsR0FBRyxPQUFtQjtRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsS0FBSyxDQUFFLEdBQUcsT0FBbUI7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3hDLENBQUM7Q0FDSixDQUFDIn0=

/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsSyslogLogger": () => (/* binding */ AsSyslogLogger),
/* harmony export */   "SyslogBrowserConsoleAppender": () => (/* binding */ SyslogBrowserConsoleAppender),
/* harmony export */   "SyslogBrowserConsoleLevelMapping": () => (/* binding */ SyslogBrowserConsoleLevelMapping),
/* harmony export */   "SyslogColor": () => (/* binding */ SyslogColor),
/* harmony export */   "SyslogLevel": () => (/* binding */ SyslogLevel),
/* harmony export */   "likeSyslogLogger": () => (/* binding */ likeSyslogLogger)
/* harmony export */ });
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
/**
 * @author Jeff Rose
 */



class SyslogLevel extends _level__WEBPACK_IMPORTED_MODULE_0__.Level {
}
SyslogLevel.EMERG = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('emerg', 10000);
SyslogLevel.ALERT = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('alert', 20000);
SyslogLevel.CRIT = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('crit', 30000);
SyslogLevel.ERROR = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('error', 40000);
SyslogLevel.WARNING = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('warning', 50000);
SyslogLevel.NOTICE = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('notice', 60000);
SyslogLevel.INFO = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('info', 70000);
SyslogLevel.DEBUG = new _level__WEBPACK_IMPORTED_MODULE_0__.Level('debug', 80000);
const SyslogColor = {
    emerg: 'red',
    alert: 'yellow',
    crit: 'red',
    error: 'red',
    warning: 'red',
    notice: 'yellow',
    info: 'green',
    debug: 'blue'
};
const SyslogBrowserConsoleLevelMapping = {
    emerg: 'error',
    alert: 'warn',
    crit: 'error',
    error: 'error',
    warning: 'error',
    notice: 'warn',
    info: 'info',
    debug: 'debug'
};
class SyslogBrowserConsoleAppender extends _appenders_browser_console_appender__WEBPACK_IMPORTED_MODULE_1__.BrowserConsoleAppender {
    constructor() {
        super(SyslogBrowserConsoleLevelMapping);
    }
}
const likeSyslogLogger = (0,_blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ emerg: Function, alert: Function, crit: Function, error: Function, warning: Function, notice: Function, info: Function, debug: Function });
const AsSyslogLogger = (superclass) => class extends superclass {
    constructor() {
        super(...arguments);
        this.threshold = _level__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
    }
    emerg(...message) {
        this.log(SyslogLevel.EMERG, message);
    }
    alert(...message) {
        this.log(SyslogLevel.ALERT, message);
    }
    crit(...message) {
        this.log(SyslogLevel.CRIT, message);
    }
    error(...message) {
        this.log(SyslogLevel.ERROR, message);
    }
    warning(...message) {
        this.log(SyslogLevel.WARNING, message);
    }
    notice(...message) {
        this.log(SyslogLevel.NOTICE, message);
    }
    info(...message) {
        this.log(SyslogLevel.INFO, message);
    }
    debug(...message) {
        this.log(SyslogLevel.DEBUG, message);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzbG9nLWxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3lzbG9nLWxvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVoQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU5RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBS2xDLE1BQU0sT0FBTyxXQUFZLFNBQVEsS0FBSzs7QUFDM0IsaUJBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFDeEMsaUJBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFDeEMsZ0JBQUksR0FBTSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUssS0FBSyxDQUFFLENBQUM7QUFDeEMsaUJBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFDeEMsbUJBQU8sR0FBRyxJQUFJLEtBQUssQ0FBRSxTQUFTLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDeEMsa0JBQU0sR0FBSSxJQUFJLEtBQUssQ0FBRSxRQUFRLEVBQUcsS0FBSyxDQUFFLENBQUM7QUFDeEMsZ0JBQUksR0FBTSxJQUFJLEtBQUssQ0FBRSxNQUFNLEVBQUssS0FBSyxDQUFFLENBQUM7QUFDeEMsaUJBQUssR0FBSyxJQUFJLEtBQUssQ0FBRSxPQUFPLEVBQUksS0FBSyxDQUFFLENBQUM7QUFHbkQsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHO0lBQ3ZCLEtBQUssRUFBSyxLQUFLO0lBQ2YsS0FBSyxFQUFLLFFBQVE7SUFDbEIsSUFBSSxFQUFNLEtBQUs7SUFDZixLQUFLLEVBQUssS0FBSztJQUNmLE9BQU8sRUFBRyxLQUFLO0lBQ2YsTUFBTSxFQUFJLFFBQVE7SUFDbEIsSUFBSSxFQUFNLE9BQU87SUFDakIsS0FBSyxFQUFLLE1BQU07Q0FDbkIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHO0lBQzVDLEtBQUssRUFBSyxPQUFPO0lBQ2pCLEtBQUssRUFBSyxNQUFNO0lBQ2hCLElBQUksRUFBTSxPQUFPO0lBQ2pCLEtBQUssRUFBSyxPQUFPO0lBQ2pCLE9BQU8sRUFBRyxPQUFPO0lBQ2pCLE1BQU0sRUFBSSxNQUFNO0lBQ2hCLElBQUksRUFBTSxNQUFNO0lBQ2hCLEtBQUssRUFBSyxPQUFPO0NBQ3BCLENBQUM7QUFFRixNQUFNLE9BQU8sNEJBQTZCLFNBQVEsc0JBQXNCO0lBQ3BFO1FBQ0ksS0FBSyxDQUFFLGdDQUFnQyxDQUFFLENBQUM7SUFDOUMsQ0FBQztDQUNKO0FBYUQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUUsQ0FBQztBQUVwTCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsQ0FBbUMsVUFBYSxFQUFvQyxFQUFFLENBQUMsS0FBTSxTQUFRLFVBQVU7SUFBeEI7O1FBQ2pILGNBQVMsR0FBZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQWlDdkMsQ0FBQztJQS9CRyxLQUFLLENBQUUsR0FBRyxPQUFtQjtRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSSxDQUFFLEdBQUcsT0FBbUI7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxLQUFLLENBQUUsR0FBRyxPQUFtQjtRQUN6QixJQUFJLENBQUMsR0FBRyxDQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELE9BQU8sQ0FBRSxHQUFHLE9BQW1CO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFFLEdBQUcsT0FBbUI7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBRSxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzVDLENBQUM7SUFFRCxJQUFJLENBQUUsR0FBRyxPQUFtQjtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBRSxHQUFHLE9BQW1CO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0osQ0FBQyJ9

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractAppender": () => (/* reexport safe */ _appenders__WEBPACK_IMPORTED_MODULE_0__.AbstractAppender),
/* harmony export */   "AbstractBatchAppender": () => (/* reexport safe */ _appenders__WEBPACK_IMPORTED_MODULE_0__.AbstractBatchAppender),
/* harmony export */   "AbstractBatchLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.AbstractBatchLayout),
/* harmony export */   "AbstractLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.AbstractLayout),
/* harmony export */   "AbstractLogger": () => (/* reexport safe */ _loggers__WEBPACK_IMPORTED_MODULE_5__.AbstractLogger),
/* harmony export */   "AlertAppender": () => (/* reexport safe */ _appenders__WEBPACK_IMPORTED_MODULE_0__.AlertAppender),
/* harmony export */   "ApacheBrowserConsoleAppender": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.ApacheBrowserConsoleAppender),
/* harmony export */   "ApacheBrowserConsoleLevelMapping": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.ApacheBrowserConsoleLevelMapping),
/* harmony export */   "ApacheColor": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.ApacheColor),
/* harmony export */   "ApacheLevel": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.ApacheLevel),
/* harmony export */   "AsApacheLogger": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.AsApacheLogger),
/* harmony export */   "AsCLILogger": () => (/* reexport safe */ _cli_logging__WEBPACK_IMPORTED_MODULE_7__.AsCLILogger),
/* harmony export */   "AsLevelComparator": () => (/* reexport safe */ _level__WEBPACK_IMPORTED_MODULE_4__.AsLevelComparator),
/* harmony export */   "AsNPMLogger": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.AsNPMLogger),
/* harmony export */   "AsSyslogLogger": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.AsSyslogLogger),
/* harmony export */   "BrowserConsoleAppender": () => (/* reexport safe */ _appenders__WEBPACK_IMPORTED_MODULE_0__.BrowserConsoleAppender),
/* harmony export */   "CLIBrowserConsoleAppender": () => (/* reexport safe */ _cli_logging__WEBPACK_IMPORTED_MODULE_7__.CLIBrowserConsoleAppender),
/* harmony export */   "CLIBrowserConsoleLevelMapping": () => (/* reexport safe */ _cli_logging__WEBPACK_IMPORTED_MODULE_7__.CLIBrowserConsoleLevelMapping),
/* harmony export */   "CLIColor": () => (/* reexport safe */ _cli_logging__WEBPACK_IMPORTED_MODULE_7__.CLIColor),
/* harmony export */   "CLILevel": () => (/* reexport safe */ _cli_logging__WEBPACK_IMPORTED_MODULE_7__.CLILevel),
/* harmony export */   "FetchAppender": () => (/* reexport safe */ _appenders__WEBPACK_IMPORTED_MODULE_0__.FetchAppender),
/* harmony export */   "JSONLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.JSONLayout),
/* harmony export */   "Level": () => (/* reexport safe */ _level__WEBPACK_IMPORTED_MODULE_4__.Level),
/* harmony export */   "NPMBrowserConsoleAppender": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.NPMBrowserConsoleAppender),
/* harmony export */   "NPMBrowserConsoleLevelMapping": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.NPMBrowserConsoleLevelMapping),
/* harmony export */   "NPMColor": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.NPMColor),
/* harmony export */   "NPMLevel": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.NPMLevel),
/* harmony export */   "NullLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.NullLayout),
/* harmony export */   "PatternLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.PatternLayout),
/* harmony export */   "SimpleLogger": () => (/* reexport safe */ _loggers__WEBPACK_IMPORTED_MODULE_5__.SimpleLogger),
/* harmony export */   "StackTraceErrorHandler": () => (/* reexport safe */ _error_handler__WEBPACK_IMPORTED_MODULE_2__.StackTraceErrorHandler),
/* harmony export */   "SyslogBrowserConsoleAppender": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.SyslogBrowserConsoleAppender),
/* harmony export */   "SyslogBrowserConsoleLevelMapping": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.SyslogBrowserConsoleLevelMapping),
/* harmony export */   "SyslogColor": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.SyslogColor),
/* harmony export */   "SyslogLevel": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.SyslogLevel),
/* harmony export */   "WindowErrorHandler": () => (/* reexport safe */ _error_handler__WEBPACK_IMPORTED_MODULE_2__.WindowErrorHandler),
/* harmony export */   "XMLLayout": () => (/* reexport safe */ _layouts__WEBPACK_IMPORTED_MODULE_3__.XMLLayout),
/* harmony export */   "likeApacheLogger": () => (/* reexport safe */ _apache_logging__WEBPACK_IMPORTED_MODULE_6__.likeApacheLogger),
/* harmony export */   "likeLogger": () => (/* reexport safe */ _loggers__WEBPACK_IMPORTED_MODULE_5__.likeLogger),
/* harmony export */   "likeNPMLogger": () => (/* reexport safe */ _npm_logging__WEBPACK_IMPORTED_MODULE_8__.likeNPMLogger),
/* harmony export */   "likeSyslogLogger": () => (/* reexport safe */ _syslog_logging__WEBPACK_IMPORTED_MODULE_9__.likeSyslogLogger),
/* harmony export */   "newEntry": () => (/* reexport safe */ _entry__WEBPACK_IMPORTED_MODULE_1__.newEntry)
/* harmony export */ });
/* harmony import */ var _appenders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _entry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(14);
/* harmony import */ var _error_handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15);
/* harmony import */ var _layouts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var _level__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(32);
/* harmony import */ var _loggers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(33);
/* harmony import */ var _apache_logging__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(36);
/* harmony import */ var _cli_logging__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(37);
/* harmony import */ var _npm_logging__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(38);
/* harmony import */ var _syslog_logging__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(39);
/**
 * @author Jeff Rose
 * @module logger
 * @requires core
 * @requires util
 */










//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsY0FBYyxhQUFhLENBQUM7QUFDNUIsY0FBYyxTQUFTLENBQUM7QUFDeEIsY0FBYyxpQkFBaUIsQ0FBQztBQUNoQyxjQUFjLFdBQVcsQ0FBQztBQUMxQixjQUFjLFNBQVMsQ0FBQztBQUN4QixjQUFjLFdBQVcsQ0FBQztBQUMxQixjQUFjLGtCQUFrQixDQUFDO0FBQ2pDLGNBQWMsZUFBZSxDQUFDO0FBQzlCLGNBQWMsZUFBZSxDQUFDO0FBQzlCLGNBQWMsa0JBQWtCLENBQUMifQ==
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
