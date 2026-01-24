(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/core"), require("@blue/util"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/core", "@blue/util"], factory);
	else if(typeof exports === 'object')
		exports["blue-router"] = factory(require("@blue/core"), require("@blue/util"));
	else
		root["blue-router"] = factory(root["@blue/core"], root["@blue/util"]);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__4__, __WEBPACK_EXTERNAL_MODULE__5__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

/**
 * @interface module:router.RouteSegment
 * @extends module:core.Serializable
 */
/**
 * @member {external:string} module:router.RouteSegment#name
 */
/**
 * @member {module:core.JSONObject} module:router.RouteSegment#data
 */
/**
 * @member {external:string} [module:router.RouteSegment#dataString]
 */
/**
 * @member {external:string} module:router.RouteSegment#raw
 */
/**
 * @interface module:router.Route
 * @extends external:ArrayLike<router.RouteSegment>
 * @extends module:core.Serializable
 */
/**
 * @member {module:core.JSONObject} module:router.Route#data
 */
/**
 * @member {external:string} [module:router.Route#dataString]
 */
/**
 * @member {external:string} module:router.Route#path
 */
/**
 * @member {external:string} module:router.Route#raw
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW1CQTs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRyJ9

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractRouter": () => (/* binding */ AbstractRouter)
/* harmony export */ });
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractRouter_interceptors;
class AbstractRouter {
    constructor() {
        _AbstractRouter_interceptors.set(this, void 0);
    }
    addInterceptor(interceptor) {
        if (__classPrivateFieldGet(this, _AbstractRouter_interceptors, "f").indexOf(interceptor) === -1) {
            __classPrivateFieldGet(this, _AbstractRouter_interceptors, "f").push(interceptor);
        }
    }
}
_AbstractRouter_interceptors = new WeakMap();
/**
 * @interface module:router.Router
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFTQSxNQUFNLE9BQWdCLGNBQWM7SUFBcEM7UUFDSSwrQ0FBbUM7SUFVdkMsQ0FBQztJQUxHLGNBQWMsQ0FBRSxXQUE4QjtRQUMxQyxJQUFJLHVCQUFBLElBQUksb0NBQWMsQ0FBQyxPQUFPLENBQUUsV0FBVyxDQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbEQsdUJBQUEsSUFBSSxvQ0FBYyxDQUFDLElBQUksQ0FBRSxXQUFXLENBQUUsQ0FBQztTQUMxQztJQUNMLENBQUM7Q0FDSjs7QUFFRDs7R0FFRyJ9

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PathRoute": () => (/* binding */ PathRoute),
/* harmony export */   "PathRouteSegment": () => (/* binding */ PathRouteSegment)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _from_matrix_string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _to_matrix_string__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);
/* harmony import */ var _to_query_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
/* harmony import */ var _from_query_string__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);






const questionMark = '?', semicolon = ';', slash = '/', { defineProperty } = Reflect, isNotEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_1__.isEmpty), isNotNil = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_1__.isNil), isNotNilAndNotEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.both)(isNotNil, isNotEmpty), joinOnSlash = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.join)(slash), leadingSlash = new RegExp(`^${slash}`), removeLeadingSlash = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.replace)(leadingSlash, ''), splitOnQuestionMark = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.split)(questionMark), splitOnSlash = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.split)(slash), splitPathIntoSegments = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.pipe)(splitOnSlash, (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.filter)(isNotNilAndNotEmpty)), splitRouteIntoParts = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.pipe)(_blue_util__WEBPACK_IMPORTED_MODULE_1__.trim, removeLeadingSlash, splitOnQuestionMark);
let routeId = 0;
/**
 * @function module:router~nextRouteId
 * @returns {external:number} The next route id
 */
function nextRouteId() {
    return ++routeId;
}
/**
 * @class module:router.PathRouteSegment
 */
class PathRouteSegment {
    constructor(segment) {
        const index = segment.indexOf(semicolon);
        defineProperty(this, 'raw', {
            value: segment,
            configurable: true,
            enumerable: false,
            writable: false
        });
        if (index > -1) {
            defineProperty(this, 'name', {
                value: segment.slice(0, index),
                configurable: true,
                enumerable: false,
                writable: false
            });
            const dataString = segment.slice(index);
            if (dataString === semicolon) {
                defineProperty(this, 'data', {
                    value: null,
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
                defineProperty(this, 'dataString', {
                    value: '',
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
            }
            else {
                defineProperty(this, 'data', {
                    value: (0,_from_matrix_string__WEBPACK_IMPORTED_MODULE_2__["default"])(dataString),
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
                defineProperty(this, 'dataString', {
                    value: (0,_to_matrix_string__WEBPACK_IMPORTED_MODULE_3__["default"])(this.data),
                    configurable: true,
                    enumerable: false,
                    writable: false
                });
            }
        }
        else {
            defineProperty(this, 'name', {
                value: segment,
                configurable: true,
                enumerable: false,
                writable: false
            });
            defineProperty(this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            });
        }
    }
    toJSON() {
        const json = (0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)();
        json.name = this.name;
        json.data = this.data;
        return json;
    }
    toString() {
        const { data, dataString, name } = this, matrixString = data && !dataString ?
            (0,_to_matrix_string__WEBPACK_IMPORTED_MODULE_3__["default"])(data) :
            dataString;
        return matrixString ? `${name}${semicolon}${matrixString}` : name;
    }
}
/**
 * @class module:router.PathRoute
 * @implements module:router.Route
 * @implements module:core.Serializable
 */
class PathRoute {
    constructor(route) {
        defineProperty(this, 'raw', {
            value: route,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, 'id', {
            value: nextRouteId(),
            configurable: true,
            enumerable: false,
            writable: false
        });
        const parts = splitRouteIntoParts(route), segments = splitPathIntoSegments(parts[0]), queryString = parts[1], length = segments.length;
        let index = 0, path = new Array(length);
        for (; index < length; index++) {
            defineProperty(this, index, {
                value: new PathRouteSegment(segments[index]),
                configurable: true,
                enumerable: true,
                writable: false
            });
            path[index] = this[index].name;
        }
        defineProperty(this, 'path', {
            value: joinOnSlash(path),
            configurable: true,
            enumerable: false,
            writable: false
        });
        if (queryString) {
            defineProperty(this, 'data', {
                value: (0,_from_query_string__WEBPACK_IMPORTED_MODULE_5__["default"])(queryString),
                configurable: true,
                enumerable: false,
                writable: false
            });
            defineProperty(this, 'dataString', {
                value: (0,_to_query_string__WEBPACK_IMPORTED_MODULE_4__["default"])(this.data),
                configurable: true,
                enumerable: false,
                writable: false
            });
        }
        else {
            defineProperty(this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            });
            defineProperty(this, 'dataString', {
                value: '',
                configurable: true,
                enumerable: false,
                writable: false
            });
        }
    }
    get length() {
        return (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.pipe)(_blue_util__WEBPACK_IMPORTED_MODULE_1__.keys, (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.map)(parseInt), (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.reduce)(_blue_util__WEBPACK_IMPORTED_MODULE_1__.max, -1))(this) + 1;
        /*
        return Object.keys( this ).reduce( function( maxIndex: number, key: string ){
            index = key === '' ? NaN : Number( key );
            if( !Number.isNaN( index ) && index > maxIndex ){
                return index;
            }
            return maxIndex;
        }, -1 ) + 1;
        */
    }
    toJSON() {
        const json = (0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)(), length = this.length;
        let index = 0;
        json.id = this.id;
        json.data = this.data;
        json.length = length;
        for (; index < length; index++) {
            json[index] = this[index].toJSON();
        }
        return json;
    }
    toString() {
        const { data, dataString, length } = this, segments = [], queryString = data && !dataString ?
            (0,_to_query_string__WEBPACK_IMPORTED_MODULE_4__["default"])(data) :
            dataString;
        let index = 0, output = '';
        for (; index < length; index++) {
            segments[index] = this[index].toString();
        }
        output = `${slash}${segments.join(slash)}`;
        return queryString ? `${output}${questionMark}${queryString}` : output;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC1yb3V0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLXJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBdUMsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzdFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hJLE9BQU8sZ0JBQWdCLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxhQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxlQUFlLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsTUFDSSxZQUFZLEdBQUcsR0FBRyxFQUNsQixTQUFTLEdBQUcsR0FBRyxFQUNmLEtBQUssR0FBRyxHQUFHLEVBRVgsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBRTVCLFVBQVUsR0FBRyxVQUFVLENBQUUsT0FBTyxDQUFFLEVBQ2xDLFFBQVEsR0FBRyxVQUFVLENBQUUsS0FBSyxDQUFFLEVBQzlCLG1CQUFtQixHQUFHLElBQUksQ0FBRSxRQUFRLEVBQUUsVUFBVSxDQUFFLEVBQ2xELFdBQVcsR0FBRyxJQUFJLENBQUUsS0FBSyxDQUFFLEVBQzNCLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBRSxJQUFLLEtBQU0sRUFBRSxDQUFFLEVBQzFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBRSxZQUFZLEVBQUUsRUFBRSxDQUFFLEVBQ2hELG1CQUFtQixHQUFHLEtBQUssQ0FBRSxZQUFZLENBQUUsRUFDM0MsWUFBWSxHQUFHLEtBQUssQ0FBRSxLQUFLLENBQUUsRUFDN0IscUJBQXFCLEdBQUcs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

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

const commaMatcher = /,/, plusMatcher = /\+/g, prefixMatcher = /^[;]/, createNull = Object.create.bind(Object, null), formatter = (key, value, accumulator) => {
    if (commaMatcher.exec(value)) {
        accumulator[key] = value.split(',');
    }
    else {
        accumulator[key] = value;
    }
}, parseParameterList = (parse, delimiter, text) => text
    .split(delimiter)
    .reduce(function (accumulator, parameter) {
    const parts = parameter.replace(plusMatcher, ' ').split('='), key = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent)(parts.shift());
    let value = parts.length > 0 ? parts.join('=') : undefined;
    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value = value === undefined ? null : (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent)(value);
    parse(key, value, accumulator);
    return accumulator;
}, createNull()),
/**
 * Parses a matrix string into an object.
 * @function module:router.fromMatrixString
 * @param {external:string} text The matrix string
 * @returns {external:Object} The parsed matrix string.
 * @category String
 */
fromMatrixString = (text) => {
    let parsed = createNull();
    text = text.trim().replace(prefixMatcher, '');
    if (!text) {
        return parsed;
    }
    parsed = parseParameterList(formatter, ';', text);
    return Object
        .keys(parsed)
        .reduce(function (result, key) {
        result[key] = parsed[key];
        return result;
    }, createNull());
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fromMatrixString);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1tYXRyaXgtc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Zyb20tbWF0cml4LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsa0JBQWtCLElBQUksTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSTFELE1BQ0ksWUFBWSxHQUFHLEdBQUcsRUFDbEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLE1BQU0sRUFFdEIsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLE1BQU0sRUFBRSxJQUFJLENBQUUsRUFFL0MsU0FBUyxHQUFHLENBQUUsR0FBVyxFQUFFLEtBQWEsRUFBRSxXQUFnQixFQUFTLEVBQUU7SUFDakUsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxFQUFHO1FBQzdCLFdBQVcsQ0FBRSxHQUFHLENBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDO0tBQzNDO1NBQU07UUFDSCxXQUFXLENBQUUsR0FBRyxDQUFFLEdBQUcsS0FBSyxDQUFDO0tBQzlCO0FBQ0wsQ0FBQyxFQUVELGtCQUFrQixHQUFHLENBQUUsS0FBaUIsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBUSxFQUFFLENBQUMsSUFBSTtLQUNuRixLQUFLLENBQUUsU0FBUyxDQUFFO0tBQ2xCLE1BQU0sQ0FBRSxVQUFVLFdBQWdCLEVBQUUsU0FBaUI7SUFDbEQsTUFDSSxLQUFLLEdBQWEsU0FBUyxDQUFDLE9BQU8sQ0FBRSxXQUFXLEVBQUUsR0FBRyxDQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsQ0FBRSxFQUNwRSxHQUFHLEdBQVcsTUFBTSxDQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDO0lBQzFDLElBQUksS0FBSyxHQUFXLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFckUsZ0NBQWdDO0lBQ2hDLGdFQUFnRTtJQUNoRSxLQUFLLEdBQUcsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUUsS0FBSyxDQUFFLENBQUM7SUFFckQsS0FBSyxDQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFFLENBQUM7SUFFakMsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFFO0FBRXJCOzs7Ozs7R0FNRztBQUNILGdCQUFnQixHQUFHLENBQUUsSUFBWSxFQUFnQyxFQUFFO0lBQy9ELElBQUksTUFBTSxHQUFRLFVBQVUsRUFBRSxDQUFDO0lBRS9CLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFFLGFBQWEsRUFBRSxFQUFFLENBQUUsQ0FBQztJQUVoRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTyxNQUFNLENBQUM7S0FDakI7SUFFRCxNQUFNLEdBQUcsa0JBQWtCLENBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUUsQ0FBQztJQUVwRCxPQUFPLE1BQU07U0FDUixJQUFJLENBQUUsTUFBTSxDQUFFO1NBQ2QsTUFBTSxDQUFFLFVBQVUsTUFBVyxFQUFFLEdBQVc7UUFDdkMsTUFBTSxDQUFFLEdBQUcsQ0FBRSxHQUFHLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBQztRQUM5QixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUUsQ0FBQztBQUMxQixDQUFDLENBQUM7QUFFTixlQUFlLGdCQUFnQixDQUFDIn0=

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

const alwaysEmptyString = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.always)(''), isNull = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.equals)(null), isUndefined = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.equals)(undefined), isDefined = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(isUndefined), isNotEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isEmpty),
// ["a","b","c","#"] -> ["a","b","c","%23"]
encodeValues = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.map)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent),
// ["a","",{},"b",[],"c"] -> ["a","b","c"]
filterEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.filter)(isNotEmpty),
// ["a",undefined,"b","c",undefined] -> ["a","b","c"]
filterUndefined = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.filter)(isDefined),
// ["a","b","c"] ->  "a,b,c"
joinOnComma = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.join)(','),
// ["a","b","c"] ->  "a=b=c"
joinOnEqual = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.join)('='),
// ["a","b","c"] ->  "a;b;c"
joinOnSemicolon = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.join)(';'),
// ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
encodeList = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(filterUndefined, encodeValues, joinOnComma), encodeParam = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.curryN)(2, (object, key) => (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
    [isUndefined, alwaysEmptyString],
    [isNull, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.always)((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key))],
    [Array.isArray, (list) => joinOnEqual([(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key), encodeList(list)])],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, (value) => joinOnEqual([(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key), (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(value)])]
])(object[key])), naturalComparator = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.comparator)((a, b) => a < b), naturalSort = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.sort)(naturalComparator), toMatrixString = (object) => {
    // @ts-ignore: ¯\_(ツ)_/¯
    const encodeParams = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.map)(encodeParam(object));
    return object ? (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.keys, naturalSort, encodeParams, filterEmpty, joinOnSemicolon)(object) : '';
};
/**
 * Parses an object to matrix string.
 * @function module:router.toMatrixString
 * @category Object
 * @param {external:Object} object
 * @returns {external:string}
 * @example
 * toMatrixString( { e:6, a:1, b:2, c:[ 3,4 ], d:5 } );
 * //=> "a=1;b=2;c=3,4;d=5;e=6"
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (toMatrixString);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tbWF0cml4LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90by1tYXRyaXgtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsa0JBQWtCLElBQUksV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdEssTUFDSSxpQkFBaUIsR0FBRyxNQUFNLENBQUUsRUFBRSxDQUFFLEVBQ2hDLE1BQU0sR0FBRyxNQUFNLENBQUUsSUFBSSxDQUFFLEVBQ3ZCLFdBQVcsR0FBRyxNQUFNLENBQUUsU0FBUyxDQUFFLEVBRWpDLFNBQVMsR0FBRyxVQUFVLENBQUUsV0FBVyxDQUFFLEVBQ3JDLFVBQVUsR0FBRyxVQUFVLENBQUUsT0FBTyxDQUFFO0FBRWxDLDJDQUEyQztBQUMzQyxZQUFZLEdBQUcsR0FBRyxDQUFFLFdBQVcsQ0FBRTtBQUVqQywwQ0FBMEM7QUFDMUMsV0FBVyxHQUFHLE1BQU0sQ0FBRSxVQUFVLENBQUU7QUFFbEMscURBQXFEO0FBQ3JELGVBQWUsR0FBRyxNQUFNLENBQUUsU0FBUyxDQUFFO0FBRXJDLDRCQUE0QjtBQUM1QixXQUFXLEdBQUcsSUFBSSxDQUFFLEdBQUcsQ0FBRTtBQUV6Qiw0QkFBNEI7QUFDNUIsV0FBVyxHQUFHLElBQUksQ0FBRSxHQUFHLENBQUU7QUFFekIsNEJBQTRCO0FBQzVCLGVBQWUsR0FBRyxJQUFJLENBQUUsR0FBRyxDQUFFO0FBRTdCLHVEQUF1RDtBQUN2RCxVQUFVLEdBQUcsSUFBSSxDQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFFLEVBRS9ELFdBQVcsR0FBRyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsTUFBVyxFQUFFLEdBQVcsRUFBVyxFQUFFLENBQUMsSUFBSSxDQUFFO0lBQ25FLENBQUUsV0FBVyxFQUFLLGlCQUFpQixDQUFFO0lBQ3JDLENBQUUsTUFBTSxFQUFVLE1BQU0sQ0FBRSxXQUFXLENBQUUsR0FBRyxDQUFFLENBQUUsQ0FBRTtJQUNoRCxDQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUcsQ0FBRSxJQUFJLEVBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBRSxDQUFFLFdBQVcsQ0FBRSxHQUFHLENBQUUsRUFBRSxVQUFVLENBQUUsSUFBSSxDQUFFLENBQUUsQ0FBRSxDQUFFO0lBQ3pGLENBQUUsQ0FBQyxFQUFlLENBQUUsS0FBYSxFQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUUsQ0FBRSxXQUFXLENBQUUsR0FBRyxDQUFFLEVBQUUsV0FBVyxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUUsQ0FBRTtDQUN2RyxDQUFFLENBQUUsTUFBTSxDQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUUsRUFFdEIsaUJBQWlCLEdBQUcsVUFBVSxDQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBWSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRSxFQUNqRSxXQUFXLEdBQUcsSUFBSSxDQUFFLGlCQUFpQixDQUFFLEVBRXZDLGNBQWMsR0FBRyxDQUFFLE1BQU0sRUFBVyxFQUFFO0lBQ2xDLHdCQUF3QjtJQUN4QixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUUsV0FBVyxDQUFFLE1BQU0sQ0FBRSxDQUFFLENBQUM7SUFDbEQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFFLENBQUUsTUFBTSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6RyxDQUFDLENBQUM7QUFFTjs7Ozs7Ozs7O0dBU0c7QUFDSCxlQUFlLGNBQWMsQ0FBQyJ9

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

//import { JSONValue, DelegatingTransformer, Reduced, Transformer } from '@blue/core';
/*
import { addIndex, complement, cond, equals, ifElse, isEmpty, filter, pipe, join, keys, map, sort, T } from 'ramda';

const
    //bracketMatcher: RegExp = /(\[\])$/,
    //indexMatcher: RegExp = /\[(\d*)\]$/,

    alphabeticalAscending = ( a, b ) => a.codePointAt( 0 ) - b.codePointAt( 0 ),
    indexedMap = addIndex( map ),
    isNotEmpty = complement( isEmpty ),
    isNull = equals( null ),
    isUndefined = equals( undefined ),
    joinOnAmpersand = join( '&' ),
    removeEmpty = filter( isNotEmpty ),

    // ?foo[]=bar&foo[]=baz
    createBracketParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }[]=${ encode( value ) }`
    )( value ),

    // ?foo=bar&foo=baz
    createParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }=${ encode( value ) }`
    )( value ),

    // ?foo[0]=bar&foo[1]=baz
    createIndexParameter = ( key, value, index ) => ifElse(
        isNull,
        () => `${ encode( key ) }[${ index }]`,
        () => `${ encode( key ) }[${ encode( String( index ) ) }]=${ encode( value ) }`
    )( value ),

    getListParameterStringifier = ( format ) => cond( [
        [ equals( 'bracket' ) , () => createBracketParameter ],
        [ equals( 'index' )   , () => createIndexParameter ],
        [ T                   , () => createParameter ]
    ] )( format ),

    encodeValueList = ( key, list ) => pipe(
        indexedMap( ( value, index ) => createParameter( key, value, index ) ),
        removeEmpty,
        joinOnAmpersand
    )( list ),

    toQueryString = ( object ) => pipe(
        keys,
        sort( alphabeticalAscending ),
        map( ( key ) => cond( [
            [ isUndefined   , () => '' ],
            [ Array.isArray , () => encodeValueList( key, object[ key ] ) ],
            [ T             , () => createParameter( key, object[ key ] ) ]
        ] ) ),
        removeEmpty,
        joinOnAmpersand
    )( object );

//toQueryString( { e:6, a:1, b:2, c:[3,4], d: 5} ); // a=1&b=2&c=3&c=4&d=5&e=6

export default toQueryString;
*/
const isNotEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isEmpty), arrayStringifier = (key, value, index) => value === null ? (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key) : `${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key)}=${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(value)}`, toQueryString = (object) => object ? Object
    .keys(object)
    .sort()
    .map(function (key) {
    const value = object[key];
    if (value === undefined) {
        return '';
    }
    if (value === null) {
        return (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key);
    }
    if (Array.isArray(value)) {
        const result = [];
        value.slice().forEach(function (val) {
            if (val === undefined) {
                return;
            }
            result.push(arrayStringifier(key, val, result.length));
        });
        return result.join('&');
    }
    return `${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key)}=${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(value)}`;
})
    .filter(isNotEmpty)
    .join('&') : '';
/**
 * Parses an object to query string.
 * @function module:router.toQueryString
 * @category Object
 * @param {external:Object} object
 * @returns {external:string}
 * @example
 * toQueryString( { e:6, a:1, b:2, c:[3,4], d:5 } );
 * //=> "a=1&b=2&c=3&c=4&d=5&e=6"
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (toQueryString);
/*
export class XToQueryString extends DelegatingTransformer<JSONValue,string> {
    constructor( readonly f: Function, xf: Transformer<JSONValue, string> ){
        super( xf );
    }

    [ '@@transducer/step' ]( result: JSONValue, input: string ): JSONValue | Reduced<JSONValue> {
        if( typeof this.f === 'function' ){
            return toQueryString( input );
        }
        return super[ '@@transducer/step' ]( result, input );
    }
}

export const xToQueryString: CurriedFunction2<Function, Transformer<JSONValue, string>, XToQueryString> = curry( ( f, xf ) => new XToQueryString( f, xf ) );

export const qs = curry( ( f: Function, xf: Transformer<JSONValue, string> ) => xToQueryString( f, xf ) );

//export default curry( toQueryString ) as CurriedFunction2<( key: string, value: string, index?: number ) => string, JSONValue, string>;
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tcXVlcnktc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RvLXF1ZXJ5LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLElBQUksTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRS9FLHNGQUFzRjtBQUV0Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBK0RFO0FBRUYsTUFDSSxVQUFVLEdBQUcsVUFBVSxDQUFFLE9BQU8sQ0FBRSxFQUVsQyxnQkFBZ0IsR0FBRyxDQUFFLEdBQVcsRUFBRSxLQUFhLEVBQUUsS0FBYyxFQUFXLEVBQUUsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUUsR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUksTUFBTSxDQUFFLEdBQUcsQ0FBRyxJQUFLLE1BQU0sQ0FBRSxLQUFLLENBQUcsRUFBRSxFQUV2SixhQUFhLEdBQUcsQ0FBRSxNQUFNLEVBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTTtLQUNoRCxJQUFJLENBQUUsTUFBTSxDQUFFO0tBQ2QsSUFBSSxFQUFFO0tBQ04sR0FBRyxDQUFFLFVBQVUsR0FBVztJQUN2QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUUsR0FBRyxDQUFFLENBQUM7SUFFNUIsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQ3JCLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFFRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7UUFDaEIsT0FBTyxNQUFNLENBQUUsR0FBRyxDQUFFLENBQUM7S0FDeEI7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLEVBQUU7UUFDeEIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUUsVUFBVSxHQUFXO1lBQ3hDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDbkIsT0FBTzthQUNWO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBRSxnQkFBZ0IsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUUsQ0FBRSxDQUFDO1FBQy9ELENBQUMsQ0FBRSxDQUFDO1FBRUosT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO0tBQzdCO0lBRUQsT0FBTyxHQUFJLE1BQU0sQ0FBRSxHQUFHLENBQUcsSUFBSyxNQUFNLENBQUUsS0FBSyxDQUFHLEVBQUUsQ0FBQztBQUNyRCxDQUFDLENBQUU7S0FDRixNQUFNLENBQUUsVUFBVSxDQUFFO0tBQ3BCLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBRTFCOzs7Ozs7Ozs7R0FTRztBQUNILGVBQWUsYUFBYSxDQUFDO0FBRTdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUJFIn0=

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

const
/*
bracketMatcher: RegExp = /(\[\])$/,
indexMatcher: RegExp = /\[(\d*)\]$/,


// ?foo[0]=bar&foo[1]=baz
indexArrayParser = ( key: string, value: string, accumulator: JSONValue ): void => {
    const result: RegExpExecArray = indexMatcher.exec( key );
    key = key.replace( indexMatcher, '' );

    if( !result ){
        accumulator[ key ] = value;
    } else {
        if( accumulator[ key ] === undefined ){
            accumulator[ key ] = {};
        }

        accumulator[ key ][ result[ 1 ] ] = value;
    }
},

// ?foo[]=bar&foo[]=baz
bracketArrayParser = ( key: string, value: string, accumulator: JSONValue ): void => {
    const result: RegExpExecArray = bracketMatcher.exec( key );
    key = key.replace( bracketMatcher, '' );

    if( !result ){
        accumulator[ key ] = value;
    } else if( accumulator[ key ] === undefined ){
        accumulator[ key ] = [ value ];
    } else {
        accumulator[ key ] = [].concat( accumulator[ key ], value );
    }
},
*/
// ?foo=bar&foo=baz
defaultArrayParser = (key, value, accumulator) => {
    if (accumulator[key] === undefined) {
        accumulator[key] = value;
        return;
    }
    accumulator[key] = [].concat(accumulator[key], value);
};
const isArray = Array.isArray, createNull = Object.create.bind(Object, null), plusMatcher = /\+/g, prefixMatcher = /^[?#&]/, removePrefix = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.replace)(prefixMatcher, ''), replacePlusWithSpace = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.replace)(plusMatcher, ' '), splitOnAmpersand = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.split)('&'), splitOnEquals = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.split)('='), replacePlusWithSpaceAndSplitOnEquals = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(replacePlusWithSpace, splitOnEquals), trimAndRemovePrefix = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.trim, removePrefix), keyCompare = (a, b) => Number(a) - Number(b), keysSorter = (input) => {
    if (isArray(input)) {
        return input.sort();
    }
    else if (typeof input === 'object') {
        return keysSorter(Object.keys(input))
            .sort(keyCompare)
            .map(function (key) {
            return input[key];
        });
    }
},
/**
 * Parses a query string into an object.
 * @function module:router.fromQueryString
 * @param {external:string} text The query string
 * @returns {external:Object} The parsed query string.
 * @category String
 */
fromQueryString = (text) => {
    const formatter = defaultArrayParser;
    let parsed = createNull();
    text = trimAndRemovePrefix(text);
    if (!text) {
        return parsed;
    }
    parsed = splitOnAmpersand(text)
        .reduce(function (accum, param) {
        const parts = replacePlusWithSpaceAndSplitOnEquals(param), key = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent)(parts.shift());
        let value = parts.length > 0 ? parts.join('=') : undefined;
        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        value = value === undefined ? null : (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent)(value);
        formatter(key, value, accum);
        return accum;
    }, parsed);
    const accumulateResult = function (result, key) {
        const value = parsed[key];
        if (Boolean(value) && typeof value === 'object' && !isArray(value)) {
            // Sort object keys, not values
            result[key] = keysSorter(value);
        }
        else {
            result[key] = value;
        }
        return result;
    };
    return Object
        .keys(parsed)
        .sort()
        .reduce(accumulateResult, createNull());
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fromQueryString);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1xdWVyeS1zdHJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnJvbS1xdWVyeS1zdHJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJdEY7QUFFSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtDRTtBQUVGLG1CQUFtQjtBQUNuQixrQkFBa0IsR0FBRyxDQUFFLEdBQVcsRUFBRSxLQUFhLEVBQUUsV0FBZ0IsRUFBUyxFQUFFO0lBQzFFLElBQUksV0FBVyxDQUFFLEdBQUcsQ0FBRSxLQUFLLFNBQVMsRUFBRTtRQUNsQyxXQUFXLENBQUUsR0FBRyxDQUFFLEdBQUcsS0FBSyxDQUFDO1FBQzNCLE9BQU87S0FDVjtJQUVELFdBQVcsQ0FBRSxHQUFHLENBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFFLFdBQVcsQ0FBRSxHQUFHLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUNoRSxDQUFDLENBQUM7QUFFTixNQUNJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxFQUV2QixVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsTUFBTSxFQUFFLElBQUksQ0FBRSxFQUUvQyxXQUFXLEdBQUcsS0FBSyxFQUNuQixhQUFhLEdBQUcsUUFBUSxFQUV4QixZQUFZLEdBQUcsT0FBTyxDQUFFLGFBQWEsRUFBRSxFQUFFLENBQUUsRUFDM0Msb0JBQW9CLEdBQUcsT0FBTyxDQUFFLFdBQVcsRUFBRSxHQUFHLENBQUUsRUFDbEQsZ0JBQWdCLEdBQUcsS0FBSyxDQUFFLEdBQUcsQ0FBRSxFQUMvQixhQUFhLEdBQUcsS0FBSyxDQUFFLEdBQUcsQ0FBRSxFQUU1QixvQ0FBb0MsR0FBRyxJQUFJLENBQUUsb0JB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

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HashRouter)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _path_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _router_execution_chain__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HashRouter_handler, _HashRouter_history, _HashRouter_interceptors, _HashRouter_route;




var RouteAccess;
(function (RouteAccess) {
    RouteAccess[RouteAccess["PUBLIC"] = 0] = "PUBLIC";
    RouteAccess[RouteAccess["PRIVATE"] = 1] = "PRIVATE";
})(RouteAccess || (RouteAccess = {}));
;
var RouteSource;
(function (RouteSource) {
    RouteSource[RouteSource["EXTERNAL"] = 0] = "EXTERNAL";
    RouteSource[RouteSource["INTERNAL"] = 1] = "INTERNAL";
})(RouteSource || (RouteSource = {}));
const { defineProperty } = Reflect, constructURL = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.constructN)(1, URL), getHashProperty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.prop)('hash'), removeFirstCharacter = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.slice)(1, Infinity), extractRouteFromURL = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(constructURL, getHashProperty, removeFirstCharacter);
class RouteTransaction {
    constructor(route, access, source) {
        defineProperty(this, 'route', {
            value: route,
            configurable: true,
            enumerable: true,
            writable: false
        });
        defineProperty(this, 'access', {
            value: access,
            configurable: true,
            enumerable: true,
            writable: false
        });
        defineProperty(this, 'source', {
            value: source,
            configurable: true,
            enumerable: true,
            writable: false
        });
    }
}
/**
 * ? Implement factory.Destroyable? It seems excessive to include @blue/factory just for the interface. Move factory.Destroyable to @blue/core? -JBR
 */
class HashRouter {
    constructor(callback) {
        _HashRouter_handler.set(this, void 0);
        _HashRouter_history.set(this, void 0);
        _HashRouter_interceptors.set(this, void 0);
        _HashRouter_route.set(this, void 0);
        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false
        });
        __classPrivateFieldSet(this, _HashRouter_handler, (event) => this._onHashChange(event), "f");
        __classPrivateFieldSet(this, _HashRouter_history, new _blue_core__WEBPACK_IMPORTED_MODULE_2__.RingBuffer(256), "f");
        __classPrivateFieldSet(this, _HashRouter_interceptors, [], "f");
        const currentRoute = removeFirstCharacter(location.hash) || '/', routeTx = new RouteTransaction(currentRoute, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
        __classPrivateFieldSet(this, _HashRouter_route, new _path_route__WEBPACK_IMPORTED_MODULE_1__.PathRoute(currentRoute), "f");
        __classPrivateFieldGet(this, _HashRouter_history, "f").put(routeTx);
        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false
        });
        addEventListener('hashchange', __classPrivateFieldGet(this, _HashRouter_handler, "f"));
    }
    get route() {
        var _a;
        return ((_a = __classPrivateFieldGet(this, _HashRouter_route, "f")) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    }
    get history() {
        return __classPrivateFieldGet(this, _HashRouter_history, "f");
    }
    addInterceptor(interceptor) {
        // TODO Check for duplicates and deny?
        __classPrivateFieldGet(this, _HashRouter_interceptors, "f").push(interceptor);
    }
    destroy() {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false
            });
            removeEventListener('hashchange', __classPrivateFieldGet(this, _HashRouter_handler, "f"));
        }
    }
    setRoute(newRoute, isPublic = true) {
        if (this._setRoute(newRoute)) {
            const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE, routeTx = new RouteTransaction(this.route, routeAccess, RouteSource.INTERNAL);
            __classPrivateFieldGet(this, _HashRouter_history, "f").put(routeTx);
            this.callback(this.route);
        }
    }
    _onHashChange(event) {
        const newRoute = extractRouteFromURL(event.newURL);
        if (this._setRoute(newRoute)) {
            const route = this.route, routeTx = new RouteTransaction(route, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
            __classPrivateFieldGet(this, _HashRouter_history, "f").put(routeTx);
            this.callback(route);
        }
    }
    _setRoute(newRoute) {
        const route = new _path_route__WEBPACK_IMPORTED_MODULE_1__.PathRoute(newRoute), chain = new _router_execution_chain__WEBPACK_IMPORTED_MODULE_3__["default"](__classPrivateFieldGet(this, _HashRouter_interceptors, "f"));
        let isCompleted = false;
        try {
            if (chain.applyPreRoute(route) === false) {
                const oldRoute = this.route;
                if (location.hash !== oldRoute) {
                    location.hash = oldRoute;
                }
                return isCompleted;
            }
            __classPrivateFieldSet(this, _HashRouter_route, route, "f");
            chain.applyPostRoute(route);
            isCompleted = true;
        }
        catch (e) { }
        return isCompleted;
    }
}
_HashRouter_handler = new WeakMap(), _HashRouter_history = new WeakMap(), _HashRouter_interceptors = new WeakMap(), _HashRouter_route = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC1yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaGFzaC1yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMzRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDeEMsT0FBTyxvQkFBb0IsTUFBTSwwQkFBMEIsQ0FBQztBQVM1RCxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWixpREFBTSxDQUFBO0lBQ04sbURBQU8sQ0FBQTtBQUNYLENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBQUEsQ0FBQztBQUVGLElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNaLHFEQUFRLENBQUE7SUFDUixxREFBUSxDQUFBO0FBQ1osQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFFRCxNQUNJLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUU1QixZQUFZLEdBQUcsVUFBVSxDQUFFLENBQUMsRUFBRSxHQUFHLENBQThCLEVBQy9ELGVBQWUsR0FBRyxJQUFJLENBQUUsTUFBTSxDQUFpQyxFQUMvRCxvQkFBb0IsR0FBRyxLQUFLLENBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBaUMsRUFDMUUsbUJBQW1CLEdBQUcsSUFBSSxDQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsb0JBQW9CLENBQUUsQ0FBQztBQUV0RixNQUFNLGdCQUFnQjtJQUtsQixZQUFhLEtBQWEsRUFBRSxNQUFtQixFQUFFLE1BQW1CO1FBQ2hFLGNBQWMsQ0FBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzNCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElB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

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RouterExecutionChain)
/* harmony export */ });
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RouterExecutionChain_interceptors;
/**
 * @class module:router.RouterExecutionChain
 * @implements module:core.Serializable
 */
class RouterExecutionChain {
    constructor(chain = null) {
        _RouterExecutionChain_interceptors.set(this, void 0);
        __classPrivateFieldSet(this, _RouterExecutionChain_interceptors, null, "f");
        if (chain instanceof RouterExecutionChain) {
            chain && this.addInterceptors(chain.interceptors);
        }
        else {
            chain && this.addInterceptors(chain);
        }
        this.interceptorIndex = -1;
    }
    get [(_RouterExecutionChain_interceptors = new WeakMap(), Symbol.toStringTag)]() {
        return 'RouterExecutionChain';
    }
    get interceptors() {
        return __classPrivateFieldGet(this, _RouterExecutionChain_interceptors, "f");
    }
    /**
     * @function module:router.RouterExecutionChain#addInterceptor
     * @param {module:router.RouterInterceptor} interceptor
     */
    addInterceptor(interceptor) {
        if (interceptor) {
            if (!__classPrivateFieldGet(this, _RouterExecutionChain_interceptors, "f")) {
                __classPrivateFieldSet(this, _RouterExecutionChain_interceptors, [], "f");
            }
            __classPrivateFieldGet(this, _RouterExecutionChain_interceptors, "f").push(interceptor);
        }
    }
    /**
     * @function module:router.RouterExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouterInterceptor>} interceptors
     */
    addInterceptors(interceptors) {
        const length = interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }
    /**
     * @function module:router.RouterExecutionChain#applyPostRoute
     * @param {module:router.Route} route
     */
    applyPostRoute(route) {
        const interceptors = __classPrivateFieldGet(this, _RouterExecutionChain_interceptors, "f"), length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                interceptors[index].postRoute(route);
            }
        }
    }
    /**
     * @function module:router.RouterExecutionChain#applyPreRoute
     * @param {module:router.Route} route
     */
    applyPreRoute(route) {
        const interceptors = __classPrivateFieldGet(this, _RouterExecutionChain_interceptors, "f"), length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                if (interceptors[index].preRoute(route) === false) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLWV4ZWN1dGlvbi1jaGFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXItZXhlY3V0aW9uLWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUtIOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sb0JBQW9CO0lBYXJDLFlBQWEsUUFBb0QsSUFBSTtRQVpyRSxxREFBbUM7UUFhL0IsdUJBQUEsSUFBSSxzQ0FBaUIsSUFBSSxNQUFBLENBQUM7UUFFMUIsSUFBSSxLQUFLLFlBQVksb0JBQW9CLEVBQUU7WUFDdkMsS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUUsS0FBSyxDQUFDLFlBQVksQ0FBRSxDQUFDO1NBQ3ZEO2FBQU07WUFDSCxLQUFLLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBRSxLQUFLLENBQUUsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBbEJELElBQUksc0RBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRTtRQUN0QixPQUFPLHNCQUFzQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLHVCQUFBLElBQUksMENBQWMsQ0FBQztJQUM5QixDQUFDO0lBY0Q7OztPQUdHO0lBQ0gsY0FBYyxDQUFFLFdBQThCO1FBQzFDLElBQUksV0FBVyxFQUFFO1lBQ2IsSUFBSSxDQUFDLHVCQUFBLElBQUksMENBQWMsRUFBRTtnQkFDckIsdUJBQUEsSUFBSSxzQ0FBaUIsRUFBRSxNQUFBLENBQUM7YUFDM0I7WUFDRCx1QkFBQSxJQUFJLDBDQUFjLENBQUMsSUFBSSxDQUFFLFdBQVcsQ0FBRSxDQUFDO1NBQzFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWUsQ0FBRSxZQUFpQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsTUFBTSxDQUFDO1FBQ3BDLElBQUksTUFBTSxFQUFFO1lBQ1IsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDekMsSUFBSSxDQUFDLGNBQWMsQ0FBRSxZQUFZLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQzthQUNoRDtTQUNKO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBRSxLQUFZO1FBQ3hCLE1BQ0ksWUFBWSxHQUFHLHVCQUFBLElBQUksMENBQWMsRUFDakMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzVCLFlBQVksQ0FBRSxLQUFLLENBQUUsQ0FBQyxTQUFTLENBQUUsS0FBSyxDQUFFLENBQUM7YUFDNUM7U0FDSjtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxhQUFhLENBQUUsS0FBWTtRQUN2QixNQUNJLFlBQVksR0FBRyx1QkFBQSxJQUFJLDBDQUFjLEVBQ2pDLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM1QixJQUFJLFlBQVksQ0FBRSxLQUFLLENBQUUsQ0FBQyxRQUFRLENBQUUsS0FBSyxDQUFFLEtBQUssS0FBSyxFQUFFO29CQUNuRCxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQzthQUNqQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=

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
/* harmony export */   "AbstractRouter": () => (/* reexport safe */ _router__WEBPACK_IMPORTED_MODULE_1__.AbstractRouter),
/* harmony export */   "HashRouter": () => (/* reexport safe */ _hash_router__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "PathRoute": () => (/* reexport safe */ _path_route__WEBPACK_IMPORTED_MODULE_2__.PathRoute),
/* harmony export */   "PathRouteSegment": () => (/* reexport safe */ _path_route__WEBPACK_IMPORTED_MODULE_2__.PathRouteSegment),
/* harmony export */   "fromMatrixString": () => (/* reexport safe */ _from_matrix_string__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "fromQueryString": () => (/* reexport safe */ _from_query_string__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   "toMatrixString": () => (/* reexport safe */ _to_matrix_string__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   "toQueryString": () => (/* reexport safe */ _to_query_string__WEBPACK_IMPORTED_MODULE_7__["default"])
/* harmony export */ });
/* harmony import */ var _route__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _path_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _hash_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony import */ var _from_matrix_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _from_query_string__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);
/* harmony import */ var _to_matrix_string__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(7);
/* harmony import */ var _to_query_string__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(8);
/**
 * @author Jeff Rose
 * @module router
 * @requires core
 * @requires util
 */








//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsY0FBYyxTQUFTLENBQUM7QUFDeEIsY0FBYyxVQUFVLENBQUM7QUFDekIsY0FBYyxjQUFjLENBQUM7QUFDN0IsT0FBTyxFQUFFLE9BQU8sSUFBSSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxPQUFPLElBQUksZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakUsT0FBTyxFQUFFLE9BQU8sSUFBSSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsT0FBTyxJQUFJLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDIn0=
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
