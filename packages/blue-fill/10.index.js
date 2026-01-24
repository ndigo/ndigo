"use strict";
(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[10],{

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

/***/ 14:
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
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('es5_object', function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_create', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(63)]).then(__webpack_require__.t.bind(__webpack_require__, 420, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_defineproperty', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(122)]).then(__webpack_require__.t.bind(__webpack_require__, 424, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_defineproperties', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(81)]).then(__webpack_require__.t.bind(__webpack_require__, 428, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_freeze', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(93)]).then(__webpack_require__.t.bind(__webpack_require__, 432, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_getownpropertydescriptor', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(123)]).then(__webpack_require__.t.bind(__webpack_require__, 436, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_getownpropertynames', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(96)]).then(__webpack_require__.t.bind(__webpack_require__, 440, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_getprototypeof', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(86)]).then(__webpack_require__.t.bind(__webpack_require__, 444, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_isextensible', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(98)]).then(__webpack_require__.t.bind(__webpack_require__, 448, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_isfrozen', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(100)]).then(__webpack_require__.t.bind(__webpack_require__, 452, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_issealed', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(101)]).then(__webpack_require__.t.bind(__webpack_require__, 456, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_keys', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(82)]).then(__webpack_require__.t.bind(__webpack_require__, 460, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_preventextensions', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(94)]).then(__webpack_require__.t.bind(__webpack_require__, 464, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_seal', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(95)]).then(__webpack_require__.t.bind(__webpack_require__, 468, 23))));
});
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('es6_object', function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_assign', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(83)]).then(__webpack_require__.t.bind(__webpack_require__, 472, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_is', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(124)]).then(__webpack_require__.t.bind(__webpack_require__, 477, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_setprototypeof', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(90)]).then(__webpack_require__.t.bind(__webpack_require__, 482, 23))));
});
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('es8_object', function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_assign', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(84)]).then(__webpack_require__.t.bind(__webpack_require__, 486, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_getownpropertydescriptors', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(97)]).then(__webpack_require__.t.bind(__webpack_require__, 491, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_values', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(85)]).then(__webpack_require__.t.bind(__webpack_require__, 495, 23))));
});
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('es10_object', function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('object_fromentries', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(65), __webpack_require__.e(80), __webpack_require__.e(47)]).then(__webpack_require__.t.bind(__webpack_require__, 499, 23))));
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (modules.length ? Promise.all(modules) : Promise.resolve());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29iamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUUxQixNQUFNLE9BQU8sR0FBbUIsRUFBRSxDQUFDO0FBRW5DLElBQUksQ0FBRSxZQUFZLEVBQUU7SUFDaEIsSUFBSSxDQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4QkFBOEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUN4RixJQUFJLENBQUUsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsdUNBQXVDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDekcsSUFBSSxDQUFFLHlCQUF5QixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLHlDQUF5QyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQzdHLElBQUksQ0FBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsOEJBQThCLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDeEYsSUFBSSxDQUFFLGlDQUFpQyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLG1EQUFtRCxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQy9ILElBQUksQ0FBRSw0QkFBNEIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4Q0FBOEMsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNySCxJQUFJLENBQUUsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsd0NBQXdDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDMUcsSUFBSSxDQUFFLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLHFDQUFxQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3JHLElBQUksQ0FBRSxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxpQ0FBaUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUM3RixJQUFJLENBQUUsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsaUNBQWlDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDN0YsSUFBSSxDQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw0QkFBNEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNwRixJQUFJLENBQUUsMEJBQTBCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsMENBQTBDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDL0csSUFBSSxDQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw0QkFBNEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUN4RixDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxZQUFZLEVBQUU7SUFDaEIsSUFBSSxDQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4QkFBOEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUN4RixJQUFJLENBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLDBCQUEwQixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ2hGLElBQUksQ0FBRSx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSx3Q0FBd0MsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUM5RyxDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxZQUFZLEVBQUU7SUFDaEIsSUFBSSxDQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSwrQkFBK0IsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUN6RixJQUFJLENBQUUsa0NBQWtDLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsb0RBQW9ELENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDakksSUFBSSxDQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw4QkFBOEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUM1RixDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxhQUFhLEVBQUU7SUFDakIsSUFBSSxDQUFFLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLG9DQUFvQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0FBQ3ZHLENBQUMsQ0FBRSxDQUFDO0FBRUosZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMifQ==

/***/ })

}]);