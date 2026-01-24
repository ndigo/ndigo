'use strict';
(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [14],
    {
        /***/ 5: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
                /* harmony export */
            });
            /* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
            /* harmony import */ var _blue_has__WEBPACK_IMPORTED_MODULE_0___default =
                /*#__PURE__*/ __webpack_require__.n(_blue_has__WEBPACK_IMPORTED_MODULE_0__);
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
                const hasId = id.reduce(
                    (sum, value) => sum && _blue_has__WEBPACK_IMPORTED_MODULE_0___default()[value],
                    true
                );
                if (!hasId) {
                    onMissing();
                    const length = id.length;
                    for (let index = 0; index < length; index++) {
                        _fills__WEBPACK_IMPORTED_MODULE_1__['default'].push(id[index]);
                        (0, _blue_has__WEBPACK_IMPORTED_MODULE_0__.resetDetector)(id[index]);
                    }
                } else if (onFound) {
                    onFound();
                }
            };
            /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = fill;
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDL0MsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBRTVCOzs7OztHQUtHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBRSxFQUFxQixFQUFFLFNBQW1CLEVBQUUsVUFBb0IsSUFBSSxFQUFHLEVBQUU7SUFDcEYsK0ZBQStGO0lBQy9GLDZGQUE2RjtJQUM3RiwwRkFBMEY7SUFDMUYsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7UUFDeEIsRUFBRSxHQUFHLENBQUUsRUFBRSxDQUFFLENBQUM7S0FDZjtJQUVELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBRSxHQUFHLEVBQUUsS0FBSyxFQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFFLEtBQUssQ0FBRSxFQUFFLElBQUksQ0FBRSxDQUFDO0lBRXZFLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixTQUFTLEVBQUUsQ0FBQztRQUVaLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDekIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFFLEVBQUUsQ0FBRSxLQUFLLENBQUUsQ0FBRSxDQUFDO1lBQzFCLGFBQWEsQ0FBRSxFQUFFLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztTQUNoQztLQUNKO1NBQU0sSUFBSSxPQUFPLEVBQUU7UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDYjtBQUNMLENBQUMsQ0FBQztBQUVGLGVBQWUsSUFBSSxDQUFDIn0=

            /***/
        },

        /***/ 18: /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
                /* harmony export */
            });
            /* harmony import */ var _fill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
            /**
             * @author Jeff Rose
             */

            const modules = [];
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es5_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_trim', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(137),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 606, 23))
                    )
                );
            });
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es6_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_codepointat', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(136),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 611, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_endswith', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(50),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 615, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_fromcodepoint', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(131),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 622, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_includes', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(146),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 626, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_normalize', () =>
                    modules.push(
                        __webpack_require__
                            .e(/* import() */ 169)
                            .then(__webpack_require__.t.bind(__webpack_require__, 630, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_raw', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(79),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 631, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_repeat', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(143),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 635, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_startswith', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(51),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 639, 23))
                    )
                );
            });
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es7_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_trimleft', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(138),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 643, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_trimright', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(140),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 649, 23))
                    )
                );
            });
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es8_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_padend', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(144),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 655, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_padstart', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(145),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 661, 23))
                    )
                );
            });
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es10_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_trimend', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(141),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 665, 23))
                    )
                );
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_trimstart', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(139),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 668, 23))
                    )
                );
            });
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('es11_string', function () {
                (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_matchall', () =>
                    modules.push(
                        Promise.all(
                            /* import() */ [
                                __webpack_require__.e(25),
                                __webpack_require__.e(24),
                                __webpack_require__.e(65),
                                __webpack_require__.e(49),
                            ]
                        ).then(__webpack_require__.t.bind(__webpack_require__, 671, 23))
                    )
                );
            });
            // TODO Move this behind an ES check once it's standardized
            (0, _fill__WEBPACK_IMPORTED_MODULE_0__['default'])('string_replaceall', () =>
                modules.push(
                    Promise.all(
                        /* import() */ [
                            __webpack_require__.e(25),
                            __webpack_require__.e(24),
                            __webpack_require__.e(48),
                            __webpack_require__.e(60),
                        ]
                    ).then(__webpack_require__.t.bind(__webpack_require__, 682, 23))
                )
            );
            /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = modules.length
                ? Promise.all(modules)
                : Promise.resolve();
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUUxQixNQUFNLE9BQU8sR0FBbUIsRUFBRSxDQUFDO0FBRW5DLElBQUksQ0FBRSxZQUFZLEVBQUU7SUFDaEIsSUFBSSxDQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSw0QkFBNEIsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUN4RixDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxZQUFZLEVBQUU7SUFDaEIsSUFBSSxDQUFFLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLHFDQUFxQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3BHLElBQUksQ0FBRSxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxpQ0FBaUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUM3RixJQUFJLENBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsdUNBQXVDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDeEcsSUFBSSxDQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLGdDQUFnQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQzVGLElBQUksQ0FBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxpQ0FBaUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztJQUM5RixJQUFJLENBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLDJCQUEyQixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ2xGLElBQUksQ0FBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsOEJBQThCLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDeEYsSUFBSSxDQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLG1DQUFtQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0FBQ3JHLENBQUMsQ0FBRSxDQUFDO0FBRUosSUFBSSxDQUFFLFlBQVksRUFBRTtJQUNoQixJQUFJLENBQUUsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxNQUFNLENBQUUsaUNBQWlDLENBQUUsQ0FBRSxDQUFFLENBQUM7SUFDN0YsSUFBSSxDQUFFLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLGtDQUFrQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0FBQ25HLENBQUMsQ0FBRSxDQUFDO0FBRUosSUFBSSxDQUFFLFlBQVksRUFBRTtJQUNoQixJQUFJLENBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLCtCQUErQixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ3pGLElBQUksQ0FBRSxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxpQ0FBaUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUNqRyxDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxhQUFhLEVBQUU7SUFDakIsSUFBSSxDQUFFLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLGdDQUFnQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQzNGLElBQUksQ0FBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUNuRyxDQUFDLENBQUUsQ0FBQztBQUVKLElBQUksQ0FBRSxhQUFhLEVBQUU7SUFDakIsSUFBSSxDQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUFFLGlDQUFpQyxDQUFFLENBQUUsQ0FBRSxDQUFDO0FBQ2pHLENBQUMsQ0FBRSxDQUFDO0FBRUosMkRBQTJEO0FBQzNELElBQUksQ0FBRSxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxtQ0FBbUMsQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUVqRyxlQUFlLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyJ9

            /***/
        },
    },
]);
