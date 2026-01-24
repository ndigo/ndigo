(globalThis['webpackChunkblue_fill'] = globalThis['webpackChunkblue_fill'] || []).push([
    [97],
    {
        /***/ 491: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(492);

            module.exports = parent;

            /***/
        },

        /***/ 493: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            __webpack_require__(494);
            var path = __webpack_require__(116);

            module.exports = path.Object.getOwnPropertyDescriptors;

            /***/
        },

        /***/ 235: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            'use strict';

            var toPropertyKey = __webpack_require__(46);
            var definePropertyModule = __webpack_require__(73);
            var createPropertyDescriptor = __webpack_require__(39);

            module.exports = function (object, key, value) {
                var propertyKey = toPropertyKey(key);
                if (propertyKey in object)
                    definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
                else object[propertyKey] = value;
            };

            /***/
        },

        /***/ 116: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var global = __webpack_require__(32);

            module.exports = global;

            /***/
        },

        /***/ 494: /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
            var $ = __webpack_require__(31);
            var DESCRIPTORS = __webpack_require__(34);
            var ownKeys = __webpack_require__(85);
            var toIndexedObject = __webpack_require__(40);
            var getOwnPropertyDescriptorModule = __webpack_require__(33);
            var createProperty = __webpack_require__(235);

            // `Object.getOwnPropertyDescriptors` method
            // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
            $(
                { target: 'Object', stat: true, sham: !DESCRIPTORS },
                {
                    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
                        var O = toIndexedObject(object);
                        var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
                        var keys = ownKeys(O);
                        var result = {};
                        var index = 0;
                        var key, descriptor;
                        while (keys.length > index) {
                            descriptor = getOwnPropertyDescriptor(O, (key = keys[index++]));
                            if (descriptor !== undefined) createProperty(result, key, descriptor);
                        }
                        return result;
                    },
                }
            );

            /***/
        },

        /***/ 492: /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var parent = __webpack_require__(493);

            module.exports = parent;

            /***/
        },
    },
]);
