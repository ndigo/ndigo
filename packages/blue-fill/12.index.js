"use strict";
(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[12],{

/***/ 5:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_has__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fills__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */


/**
 * @function module:fill.fill
 * @param {external:string|exteral:Array<external:string>} id
 * @param {external:Function} onMissing
 * @param {external:Function} [onFound=null]
 */
const fill = (id, onMissing, onFound = null) => {
    // * This code block written with convenience, not efficiency or performance, in mind. It would
    // * likely be more efficient to have different code paths based on whether id is a string or
    // * array of strings instead of just converting everything into an array of strings. -JBR
    if (typeof id === 'string') {
        id = [id];
    }
    const hasId = id.reduce((sum, value) => sum && (_blue_has__WEBPACK_IMPORTED_MODULE_0___default())[value], true);
    if (!hasId) {
        onMissing();
        const length = id.length;
        for (let index = 0; index < length; index++) {
            _fills__WEBPACK_IMPORTED_MODULE_1__["default"].push(id[index]);
            (0,_blue_has__WEBPACK_IMPORTED_MODULE_0__.resetDetector)(id[index]);
        }
    }
    else if (onFound) {
        onFound();
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fill);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDL0MsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBRTVCOzs7OztHQUtHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBRSxFQUFxQixFQUFFLFNBQW1CLEVBQUUsVUFBb0IsSUFBSSxFQUFHLEVBQUU7SUFDcEYsK0ZBQStGO0lBQy9GLDZGQUE2RjtJQUM3RiwwRkFBMEY7SUFDMUYsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7UUFDeEIsRUFBRSxHQUFHLENBQUUsRUFBRSxDQUFFLENBQUM7S0FDZjtJQUVELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBRSxHQUFHLEVBQUUsS0FBSyxFQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFFLEtBQUssQ0FBRSxFQUFFLElBQUksQ0FBRSxDQUFDO0lBRXZFLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixTQUFTLEVBQUUsQ0FBQztRQUVaLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDekIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFFLEVBQUUsQ0FBRSxLQUFLLENBQUUsQ0FBRSxDQUFDO1lBQzFCLGFBQWEsQ0FBRSxFQUFFLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztTQUNoQztLQUNKO1NBQU0sSUFBSSxPQUFPLEVBQUU7UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDYjtBQUNMLENBQUMsQ0FBQztBQUVGLGVBQWUsSUFBSSxDQUFDIn0=

/***/ }),

/***/ 16:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _fill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */

const modules = [];
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(53), __webpack_require__.e(153)]).then(__webpack_require__.t.bind(__webpack_require__, 540, 23))), function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_apply', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(58)]).then(__webpack_require__.t.bind(__webpack_require__, 559, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_construct', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(53), __webpack_require__.e(167)]).then(__webpack_require__.t.bind(__webpack_require__, 562, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_defineproperty', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(126)]).then(__webpack_require__.t.bind(__webpack_require__, 565, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_deleteproperty', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(127)]).then(__webpack_require__.t.bind(__webpack_require__, 568, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_get', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(87)]).then(__webpack_require__.t.bind(__webpack_require__, 571, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_getownpropertydescriptor', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(128)]).then(__webpack_require__.t.bind(__webpack_require__, 574, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_getprototypeof', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(89)]).then(__webpack_require__.t.bind(__webpack_require__, 577, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_has', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(129)]).then(__webpack_require__.t.bind(__webpack_require__, 580, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_isextensible', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(99)]).then(__webpack_require__.t.bind(__webpack_require__, 583, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_ownkeys', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(130)]).then(__webpack_require__.t.bind(__webpack_require__, 586, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_preventextensions', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(102)]).then(__webpack_require__.t.bind(__webpack_require__, 589, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_set', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(88)]).then(__webpack_require__.t.bind(__webpack_require__, 592, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_setprototypeof', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(91)]).then(__webpack_require__.t.bind(__webpack_require__, 595, 23))));
});
// @ts-ignore: ¯\_(ツ)_/¯
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('reflect_metadata_api', () => modules.push(__webpack_require__.e(/* import() */ 168).then(__webpack_require__.t.bind(__webpack_require__, 598, 23))));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (modules.length ? Promise.all(modules) : Promise.resolve());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWZsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLE1BQU0sT0FBTyxHQUFtQixFQUFFLENBQUM7QUFFbkMsSUFBSSxDQUFFLFNBQVMsRUFDWCxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4QkFBOEIsQ0FBRSxDQUFFLEVBQzlEO0lBQ0ksSUFBSSxDQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4QkFBOEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUN4RixJQUFJLENBQUUsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsa0NBQWtDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDaEcsSUFBSSxDQUFFLHdCQUF3QixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLHdDQUF3QyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQzNHLElBQUksQ0FBRSx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSx3Q0FBd0MsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUMzRyxJQUFJLENBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLDRCQUE0QixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3BGLElBQUksQ0FBRSxrQ0FBa0MsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxvREFBb0QsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNqSSxJQUFJLENBQUUsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUseUNBQXlDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDNUcsSUFBSSxDQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw0QkFBNEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNwRixJQUFJLENBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsc0NBQXNDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDdkcsSUFBSSxDQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLGlDQUFpQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQzdGLElBQUksQ0FBRSwyQkFBMkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSwyQ0FBMkMsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNqSCxJQUFJLENBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLDRCQUE0QixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3BGLElBQUksQ0FBRSx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSx5Q0FBeUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUNoSCxDQUFDLENBQUUsQ0FBQztBQUVSLHdCQUF3QjtBQUN4QixJQUFJLENBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsMENBQTBDLENBQUUsQ0FBRSxDQUFFLENBQUM7QUFFM0csZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMifQ==

/***/ })

}]);