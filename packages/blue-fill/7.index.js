"use strict";
(globalThis["webpackChunkblue_fill"] = globalThis["webpackChunkblue_fill"] || []).push([[7],{

/***/ 11:
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
(0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('es6_collections', function () {
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('map', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(65), __webpack_require__.e(80), __webpack_require__.e(45), __webpack_require__.e(155), __webpack_require__.e(160)]).then(__webpack_require__.t.bind(__webpack_require__, 266, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('set', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(65), __webpack_require__.e(80), __webpack_require__.e(45), __webpack_require__.e(155), __webpack_require__.e(161)]).then(__webpack_require__.t.bind(__webpack_require__, 287, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('weakmap', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(65), __webpack_require__.e(80), __webpack_require__.e(45), __webpack_require__.e(135), __webpack_require__.e(162)]).then(__webpack_require__.t.bind(__webpack_require__, 292, 23))));
    (0,_fill__WEBPACK_IMPORTED_MODULE_0__["default"])('weakset', () => modules.push(Promise.all(/* import() */[__webpack_require__.e(25), __webpack_require__.e(24), __webpack_require__.e(65), __webpack_require__.e(80), __webpack_require__.e(45), __webpack_require__.e(135), __webpack_require__.e(163)]).then(__webpack_require__.t.bind(__webpack_require__, 298, 23))));
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (modules.length ? Promise.all(modules) : Promise.resolve());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29sbGVjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLElBQUksTUFBTSxRQUFRLENBQUM7QUFFMUIsTUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztBQUVuQyxJQUFJLENBQUUsaUJBQWlCLEVBQUU7SUFDckIsSUFBSSxDQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxvQkFBb0IsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUNwRSxJQUFJLENBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLG9CQUFvQixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3BFLElBQUksQ0FBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUseUJBQXlCLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDN0UsSUFBSSxDQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSx5QkFBeUIsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUNqRixDQUFDLENBQUUsQ0FBQztBQUVKLGVBQWUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDIn0=

/***/ }),

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

/***/ })

}]);