(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(require('@blue/util'), require('@blue/core'));
    else if (typeof define === 'function' && define.amd) define(['@blue/util', '@blue/core'], factory);
    else if (typeof exports === 'object')
        exports['blue-factory'] = factory(require('@blue/util'), require('@blue/core'));
    else root['blue-factory'] = factory(root['@blue/util'], root['@blue/core']);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__5__) => {
    return /******/ (() => {
        // webpackBootstrap
        /******/ 'use strict';
        /******/ var __webpack_modules__ = [
            ,
            /* 0 */ /* 1 */
            /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ $aware: () => /* binding */ $aware,
                    /* harmony export */ AsAware: () => /* binding */ AsAware,
                    /* harmony export */ AsNameAware: () => /* binding */ AsNameAware,
                    /* harmony export */ likeAware: () => /* binding */ likeAware,
                    /* harmony export */ likeAwareAnd: () => /* binding */ likeAwareAnd,
                    /* harmony export */ likeNameAware: () => /* binding */ likeNameAware,
                    /* harmony export */
                });
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
                /**
                 * @author Jeff Rose
                 */

                /**
                 * @const {external:symbol} module:factory.$aware
                 */
                const $aware = Symbol.for('@@aware');
                /**
                 * An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.
                 *
                 * Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an {@linkcode module:factory.EntryProcessor|EntryProcessor}. Refer to {@linkcode module:context.ApplicationContextAwareProcessor|ApplicationContextAwareProcessor} for an example of processing specific `*Aware` interface callbacks
                 * @interface module:factory.Aware
                 */
                /**
                 * @member {external:boolean} module:factory.Aware#@@aware
                 */
                /**
                 * Interface to be implemented by values that want to be aware of their value name in a factory.
                 * @interface module:factory.NameAware
                 * @extends module:factory.Aware
                 */
                /**
                 * Set the name of the value in the factory that created it.
                 *
                 * Invoked after population of normal value properties but before an `init` callback.
                 * @function module:factory.NameAware#setName
                 * @param {external:string} name The name of the value in the factory.
                 */
                /**
                 * @mixin module:factory.AsAware
                 * @implements module:factory.Aware
                 * @returns {module:factory.Constructable<module:factory.Aware>}
                 */
                const AsAware = (superclass) =>
                    class extends superclass {
                        get [$aware]() {
                            return true;
                        }
                    };
                /**
                 * @readonly
                 * @member {external:boolean} module:factory.AsAware#@@aware=true
                 */
                /**
                 * @mixin module:factory.AsNameAware
                 * @implements module:factory.NameAware
                 * @returns {module:factory.Constructable<module:factory.NameAware>}
                 */
                const AsNameAware = (superclass) =>
                    class extends AsAware(superclass) {
                        /**
                         * @function module:factory.AsNameAware#setName
                         * @param {external:string} name
                         */
                        setName(name) {
                            Reflect.defineProperty(this, 'name', {
                                get: () => name,
                                configurable: true,
                                enumerable: true,
                            });
                        }
                    };
                /**
                 * @readonly
                 * @member {external:string} module:factory.AsNameAware#name
                 */
                /**
                 * @readonly
                 * @member {external:boolean} module:factory.AsNameAware#@@aware=true
                 */
                /**
                 * Determines whether or not the `value` is aware. i.e. implements the {@linkcode module:factory.Aware|Aware} interface.
                 * @function module:factory.likeAware
                 * @param {*} value
                 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Aware|Aware}.
                 */
                const likeAware = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ [$aware]: Boolean });
                /**
                 * @function module:factory.likeAwareAnd
                 * @param {external:Function} predicate
                 * @returns {external:Function} A function that will test whether a `value` is both {@linkcode module:factory.Aware|Aware} and matches the the given `predicate`.
                 * @example
                 * const
                 *  isYellow = ( value ) => 'color' in value && value.color === 'yellow',
                 *  likeAwareAndYellow = likeAwareAnd( isYellow );
                 * likeAwareAndYellow( { color: 'yellow' } ); // false
                 * likeAwareAndYellow( { '@@aware': true, color: 'yellow' } ); // true
                 */
                const likeAwareAnd = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.both)(likeAware);
                /**
                 * @function module:factory.likeNameAware
                 * @param {*} value
                 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.NameAware|NameAware}.
                 */
                const likeNameAware = likeAwareAnd(
                    (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ setName: Function })
                );
                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFNeEM7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQWtCLE1BQU0sQ0FBQyxHQUFHLENBQUUsU0FBUyxDQUFFLENBQUM7QUFXN0Q7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQTJCLFVBQWEsRUFBNkIsRUFBRSxDQUFDLEtBQU0sU0FBUSxVQUFVO0lBQ25ILElBQUksQ0FBRSxNQUFNLENBQUU7UUFDVixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0osQ0FBQztBQUVGOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBMkIsVUFBYSxFQUFpQyxFQUFFLENBQUMsS0FBTSxTQUFRLE9BQU8sQ0FBRSxVQUFVLENBQUU7SUFHdEk7OztPQUdHO0lBQ0gsT0FBTyxDQUFFLElBQVk7UUFDakIsT0FBTyxDQUFDLGNBQWMsQ0FBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ2xDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1lBQ2YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztDQUNKLENBQUM7QUFFRjs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUUsRUFBRSxDQUFFLE1BQU0sQ0FBRSxFQUFFLE9BQU8sRUFBRSxDQUFpQyxDQUFDO0FBRXhGOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFFLFNBQVMsQ0FBMkMsQ0FBQztBQUV2Rjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBRSxJQUFJLENBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUUsQ0FBcUMsQ0FBQyJ9

                /***/
            },
            /* 2 */
            /***/ (module) => {
                module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

                /***/
            },
            /* 3 */
            /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ likeConstructionAwareProcessor: () =>
                        /* binding */ likeConstructionAwareProcessor,
                    /* harmony export */ likeDestructionAwareProcessor: () =>
                        /* binding */ likeDestructionAwareProcessor,
                    /* harmony export */ likeEntryProcessor: () => /* binding */ likeEntryProcessor,
                    /* harmony export */ likeEntryRegistryProcessor: () => /* binding */ likeEntryRegistryProcessor,
                    /* harmony export */ likeInitializationAwareProcessor: () =>
                        /* binding */ likeInitializationAwareProcessor,
                    /* harmony export */
                });
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
                /**
                 * @author Jeff Rose
                 */

                /**
                 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
                 * @interface module:factory.InitializationAwareProcessor
                 */
                /**
                 * Apply this {@link module:factory.EntryProcessor} to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
                 *
                 * The default implementation returns the given instance as-is.
                 * @function module:factory.InitializationAwareProcessor#processBeforeInitialization
                 * @param {external:string} name The name of instance
                 * @param {T} instance The instance
                 * @returns {T} The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
                 */
                /**
                 * Apply this {@link module:factory.EntryProcessor} to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
                 *
                 * The default implementation returns the given instance as-is.
                 * @function module:factory.InitializationAwareProcessor#processAfterInitialization
                 * @param {external:string} name The name of instance
                 * @param {T} instance The instance
                 * @returns {T}
                 */
                /**
                 * Subinterface of {@link module:factory.EntryProcessor} that adds a before-construction callback, and a callback after construction but before explicit properties are set.
                 *
                 * Typically used to suppress default construction for specific values.
                 *
                 * *Note:* This interface is mainly for internal use within the framework.
                 * @interface module:factory.ConstructionAwareProcessor
                 */
                /**
                 * Apply this EntryProcessor _before the target value gets constructed_. The returned value may be a proxy instead of the target instance, effectively supressing default construction.
                 *
                 * The default implementation returns `null`.
                 * @function module:factory.ConstructionAwareProcessor#processBeforeConstruction
                 * @param {external:string} name The name of instance
                 * @param {external:Function} constructor The constructor
                 * @param {external:Array} [argumentsList=[]] The list of arguments supplied to the `constructor`.
                 * @returns {T | null} The instance to expose instead of a default instance, or `null` to proceed with default construction.
                 */
                /**
                 * Perform operations after the instance has constructed, but before property population occurs.
                 *
                 * This is the ideal callback for performing custom field injection on the given instance.
                 *
                 * The default implementation returns `true`.
                 * @function module:factory.ConstructionAwareProcessor#processAfterConstruction
                 * @param {external:string} name The name of instance
                 * @param {T} instance The instance without properties having been set yet.
                 * @returns {external:boolean} `true` if properties should be set on the instance; `false` if property population should be skipped. Normal implementations should return `true`. Returning `false` will also prevent any subsequent ConstructionAwarePostProcessors being invoked on this instance.
                 */
                /**
                 * Process the given property values before the factory applies them to the given instance.
                 *
                 * The default implementation returns the properties as-is.
                 * @function module:factory.ConstructionAwareProcessor#processProperties
                 * @param {external:PropertyDescriptorMap} properties The name of instance
                 * @param {external:string} name The name of instance
                 * @param {T} instance The instance without properties having been set yet.
                 * @returns {external:PropertyDescriptorMap} The property values to apply to the given instance.
                 */
                /**
                 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
                 * @interface module:factory.DestructionAwareProcessor
                 */
                /**
                 * Apply this EntryProcessor to the given instance before its destruction.
                 * @function module:factory.DestructionAwareProcessor#processBeforeDestruction
                 * @param {external:string} name The name of instance
                 * @param {T} instance The instance to be destroyed.
                 */
                /**
                 * Factory hook that allows for modification of an application context's values.
                 * @interface module:factory.EntryRegistryProcessor
                 */
                /**
                 * @function module:factory.EntryRegistryProcessor#processEntryRegistry
                 * @param {module:factory.Registry} registry
                 */
                /**
                 * @interface module:factory.FactoryPostProcessor
                 */
                /**
                 * @function module:factory.FactoryPostProcessor#postProcessFactory
                 * @param {module:Factory.Factory} factory
                 */
                /**
                 * @typedef {module:factory.InitializationAwareProcessor | module:factory.ConstructionAwareProcessor | module:factory.DestructionAwareProcessor | module:factory.EntryRegistryProcessor} module:factory.EntryProcessor
                 */
                /**
                 * @function module:factory.likeInitializationAwareProcessor
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is an {@linkcode module:factory.InitializationAwareProcessor|InitializationAwareProcessor}.
                 */
                const likeInitializationAwareProcessor = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    processAfterInitialization: Function,
                    processBeforeInitialization: Function,
                });
                /**
                 * @function module:factory.likeConstructionAwareProcessor
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.ConstructionAwareProcessor|ConstructionAwareProcessor}.
                 */
                const likeConstructionAwareProcessor = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    processAfterConstruction: Function,
                    processBeforeConstruction: Function,
                    processProperties: Function,
                });
                /**
                 * @function module:factory.likeDestructionAwareProcessor
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.DestructionAwareProcessor|DestructionAwareProcessor}.
                 */
                const likeDestructionAwareProcessor = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    processBeforeDestruction: Function,
                });
                /**
                 * @function module:factory.likeEntryRegistryProcessor
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.EntryRegistryProcessor|EntryRegistryProcessor}.
                 */
                const likeEntryRegistryProcessor = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    processEntryRegistry: Function,
                });
                /**
                 * @function module:factory.likeEntryProcessor
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is an {@linkcode module:factory.EntryProcessor|EntryProcessor}.
                 */
                const likeEntryProcessor = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.anyPass)([
                    likeConstructionAwareProcessor,
                    likeInitializationAwareProcessor,
                    likeDestructionAwareProcessor,
                    likeEntryRegistryProcessor,
                ]);
                /*
export class InjectDecoratorEntryProcessor extends AsFactoryAware( Null ) implements ConstructionAwareProcessor {
    processAfterConstruction<T = any>( name: string, instance: T ): boolean {
        return true;
    }

    processBeforeConstruction<T = any>( name: string, constructor: Function, argumentsList?: any[] ): T {
        return null;
    }

    processProperties<T = any>( properties: PropertyDescriptorMap, name: string, instance: T ): PropertyDescriptorMap {
        return properties;
    }

    processAfterInitialization<T>( name: string, instance: T ): T {
        return instance;
    }

    processBeforeInitialization<T>( name: string, instance: T ): T {
        return instance;
    }
}
*/
                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnktcHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VudHJ5LXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFHSCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQTZCM0M7OztHQUdHO0FBRUg7Ozs7Ozs7O0dBUUc7QUFFSDs7Ozs7Ozs7R0FRRztBQUdIOzs7Ozs7O0dBT0c7QUFFSDs7Ozs7Ozs7O0dBU0c7QUFFSDs7Ozs7Ozs7OztHQVVHO0FBRUg7Ozs7Ozs7OztHQVNHO0FBRUg7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksQ0FBRSxFQUFFLDBCQUEwQixFQUFFLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsQ0FBd0QsQ0FBQztBQUU5TDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFFLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLHlCQUF5QixFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsQ0FBc0QsQ0FBQztBQUNuTjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxDQUFFLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLENBQXFELENBQUM7QUFFL0k7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLElBQUksQ0FBRSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxDQUFrRCxDQUFDO0FBRXJJOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUUsQ0FBRSw4QkFBOEIsRUFBRSxnQ0FBZ0MsRUFBRSw2QkFBNkIsRUFBRSwwQkFBMEIsQ0FBRSxDQUEwQyxDQUFDO0FBRXJOOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBc0JFIn0=

                /***/
            },
            /* 4 */
            /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ AbstractFactory: () => /* binding */ AbstractFactory,
                    /* harmony export */ AsFactoryAware: () => /* binding */ AsFactoryAware,
                    /* harmony export */ DefaultFactory: () => /* binding */ DefaultFactory,
                    /* harmony export */ ProxiedFactory: () => /* binding */ ProxiedFactory,
                    /* harmony export */ likeConfigurableFactory: () => /* binding */ likeConfigurableFactory,
                    /* harmony export */ likeFactory: () => /* binding */ likeFactory,
                    /* harmony export */ likeFactoryAware: () => /* binding */ likeFactoryAware,
                    /* harmony export */ likeHierarchicalFactory: () => /* binding */ likeHierarchicalFactory,
                    /* harmony export */
                });
                /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
                /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
                /* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
                /* harmony import */ var _aware__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1);
                /* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
                /* harmony import */ var _entry_processor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3);
                /**
                 * @author Jeff Rose
                 */
                var __classPrivateFieldGet =
                    (undefined && undefined.__classPrivateFieldGet) ||
                    function (receiver, state, kind, f) {
                        if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a getter');
                        if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                            throw new TypeError(
                                'Cannot read private member from an object whose class did not declare it'
                            );
                        return kind === 'm' ? f : kind === 'a' ? f.call(receiver) : f ? f.value : state.get(receiver);
                    };
                var __classPrivateFieldSet =
                    (undefined && undefined.__classPrivateFieldSet) ||
                    function (receiver, state, value, kind, f) {
                        if (kind === 'm') throw new TypeError('Private method is not writable');
                        if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a setter');
                        if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                            throw new TypeError(
                                'Cannot write private member to an object whose class did not declare it'
                            );
                        return (
                            kind === 'a' ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value),
                            value
                        );
                    };
                var _AbstractFactory_parent;

                /**
                 * This interface is implemented by objects that hold a number of value definitions, each uniquely identified by a {@link external:string|string} name.
                 *
                 * The point of this approach is that the `Factory` is a central registry of application components and centralizes configuration.
                 *! THIS NEEDS TO BE UPDATED. IT'S MISSING LIFECYCLE HOOKS.
                 * `Factory` implementations should support the standard lifecycle as much as possible. The full set of initialization methods and their standard order is:
                 * 1. NameAware's `setName`
                 * 2. FactoryAware's `setFactory`
                 * 3. EnvironmentAware's `setEnvironment`
                 * 4. ApplicationEventEmitterAware's `setApplicationEventEmitter`
                 * 5. ContentSourceAware's `setContentSource`
                 * 6. ApplicationContextAware's `setApplicationContext`
                 * 7. `processBeforeInitialization`
                 * 8. `init`
                 * 9. `processAfterInitialization`
                 *
                 * On teardown, the follow lfecycle should apply:
                 * 1. `processBeforeDestruction`
                 * 2. `destroy`
                 * @interface module:factory.Factory
                 * @see {@link module:factory.NameAware}
                 * @see {@link module:factory.FactoryAware}
                 * @see {@link module:context.EnvironmentAware}
                 * @see {@link module:context.ApplicationEventEmitterAware}
                 * @see {@link module:content.ContentSourceAware}
                 * @see {@link module:context.ApplicationContextAware}
                 */
                /**
                 * Return an instance of the specified value.
                 * @function module:factory.Factory#getInstance
                 * @param {external:string} name The name of the value.
                 * @returns {*} An instance of the value specified by the `name`.
                 */
                /**
                 * @interface module:factory.HierarchicalFactory
                 * @extends module:factory.Factory
                 */
                /**
                 * @interface module:factory.ConfigurableFactory
                 * @extends module:factory.HierarchicalFactory
                 * @extends module:factory.Registry
                 */
                /**
                 * Interface to be implemented by values that wish to be aware of their owning {@linkcode module:factory.Factory|Factory}.
                 * @interface module:factory.FactoryAware
                 */
                /**
                 * Setter that supplies the owning factory to the instance.
                 * @function module:factory.FactoryAware#setFactory
                 * @param {module:factory.Factory} factory
                 */
                const { create, keys } = Object,
                    { construct, defineProperty, deleteProperty } = Reflect;
                /**
                 * @mixin module:factory.AsFactoryAware
                 * @implements module:factory.FactoryAware
                 * @returns {module:factory.Constructable<module:factory.FactoryAware>}
                 */
                const AsFactoryAware = (superclass) =>
                    class extends (0, _aware__WEBPACK_IMPORTED_MODULE_3__.AsAware)(superclass) {
                        /**
                         * @function module:factory.AsFactoryAware#setFactory
                         * @param {module:factory.Factory} factory
                         */
                        setFactory(factory) {
                            /**
                             * @member {module:factory.Factory} module:factory.AsFactoryAware#factory
                             */
                            defineProperty(this, 'factory', {
                                get: () => factory,
                                configurable: true,
                                enumerable: false,
                            });
                        }
                    };
                /**
                 * @function module:factory.likeFactory
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.Factory|Factory}.
                 */
                const likeFactory = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ getInstance: Function });
                /**
                 * @function module:factory.likeFactoryAware
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.FactoryAware|FactoryAware}.
                 */
                const likeFactoryAware = (0, _aware__WEBPACK_IMPORTED_MODULE_3__.likeAwareAnd)(
                    (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ setFactory: Function })
                );
                /**
                 * @function module:factory.likeHierarchicalFactory
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.HierarchicalFactory|HierarchicalFactory}.
                 */
                const likeHierarchicalFactory = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.both)(
                    likeFactory,
                    (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ parent: true, hasOwnValue: Function })
                );
                /**
                 * @function module:factory.likeConfigurableFactory
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.ConfigurableFactory|ConfigurableFactory}.
                 */
                const likeConfigurableFactory = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.both)(
                    likeHierarchicalFactory,
                    (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ addProcessor: Function, setParent: Function })
                );
                class AbstractFactory {
                    constructor() {
                        _AbstractFactory_parent.set(this, void 0);
                        this.processors = [];
                        defineProperty(this, 'hasConstructionAwareProcessors', {
                            value: false,
                            configurable: true,
                            enumerable: false,
                            writable: false,
                        });
                        defineProperty(this, 'hasDestructionAwareProcessors', {
                            value: false,
                            configurable: true,
                            enumerable: false,
                            writable: false,
                        });
                        defineProperty(this, 'hasInitializationAwareProcessors', {
                            value: false,
                            configurable: true,
                            enumerable: false,
                            writable: false,
                        });
                    }
                    get [((_AbstractFactory_parent = new WeakMap()), Symbol.toStringTag)]() {
                        return 'Factory';
                    }
                    get parent() {
                        return __classPrivateFieldGet(this, _AbstractFactory_parent, 'f');
                    }
                    addProcessor(processor) {
                        const index = this.processors.indexOf(processor);
                        if (index !== -1) {
                            this.processors.splice(index, 1);
                        }
                        if (
                            !this.hasConstructionAwareProcessors &&
                            (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeConstructionAwareProcessor)(processor)
                        ) {
                            defineProperty(this, 'hasConstructionAwareProcessors', {
                                value: true,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        if (
                            !this.hasDestructionAwareProcessors &&
                            (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeDestructionAwareProcessor)(processor)
                        ) {
                            defineProperty(this, 'hasDestructionAwareProcessors', {
                                value: true,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        if (
                            !this.hasInitializationAwareProcessors &&
                            (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeInitializationAwareProcessor)(
                                processor
                            )
                        ) {
                            defineProperty(this, 'hasInitializationAwareProcessors', {
                                value: true,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        this.processors.push(processor);
                    }
                    destroyValue(name) {
                        if (this.hasValue(name)) {
                            const value = this.getValue(name);
                            if ((0, _lifecycle__WEBPACK_IMPORTED_MODULE_1__.likeDestroyable)(value)) {
                                this._applyProcessorsBeforeDestruction(name, value);
                                value.destroy();
                            }
                            deleteProperty(this, name);
                        }
                    }
                    getInstance(name, argumentsList = []) {
                        return this.hasConstructor(name) ? this._create(name, argumentsList) : create(this[name]);
                    }
                    getValue(name, argumentsList = []) {
                        if (!this.hasInstance(name) && this.hasConstructor(name)) {
                            defineProperty(this, name, {
                                value: this._create(name, argumentsList),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        return this[name];
                    }
                    hasConstructor(name) {
                        return `$${name}` in this;
                    }
                    hasInstance(name) {
                        return name in this;
                    }
                    hasOwnValue(name) {
                        return (
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.has)(name, this) ||
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.has)(`$${name}`, this)
                        );
                    }
                    hasValue(name) {
                        return this.hasInstance(name) || this.hasConstructor(name);
                    }
                    setParent(parent) {
                        __classPrivateFieldSet(this, _AbstractFactory_parent, parent, 'f');
                    }
                    setValue(name, value) {
                        // Constructor
                        if ((0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.isConstructor)(value)) {
                            defineProperty(this, `$${name}`, {
                                value: value,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            // Instance
                        } else {
                            defineProperty(this, name, {
                                value: value,
                                configurable: true,
                                enumerable: true,
                                writable: false,
                            });
                            if ((0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.likeEnumerable)(this[name])) {
                                const alwaysName = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.always)(name),
                                    entries = (0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.entriesIterator)(this[name]);
                                for (const [key, value] of entries) {
                                    // Do not process an enumerable of primitives
                                    if ((0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.isPrimitive)(value)) {
                                        break;
                                    }
                                    const instanceName = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.cond)([
                                        // Simple Collection, e.g. Set, where entry is [ value, value ]
                                        [(0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.equals)(value), alwaysName],
                                        // Indexed Collection, e.g. Array, where entry is [ index, value ]
                                        [
                                            _blue_util__WEBPACK_IMPORTED_MODULE_2__.isNumber,
                                            () => `${name}[${String(key)}]`,
                                        ],
                                        // Keyed Collection, e.g. Map, where entry is [ key, value ]
                                        [
                                            _blue_util__WEBPACK_IMPORTED_MODULE_2__.isString,
                                            _blue_util__WEBPACK_IMPORTED_MODULE_2__.identity,
                                        ],
                                        [_blue_util__WEBPACK_IMPORTED_MODULE_2__.T, alwaysName],
                                    ])(key);
                                    this._configure(instanceName, value);
                                }
                            } else {
                                this._configure(name, this[name]);
                            }
                        }
                    }
                    _applyProcessorsAfterConstruction(name, instance) {
                        let populateProperties = true;
                        if (this.hasConstructionAwareProcessors) {
                            const length = this.processors.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeConstructionAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    populateProperties = processor.processAfterConstruction(name, instance);
                                    if (!populateProperties) {
                                        break;
                                    }
                                }
                            }
                        }
                        return populateProperties;
                    }
                    _applyProcessorsAfterInitialization(name, instance) {
                        let result = instance;
                        if (this.hasInitializationAwareProcessors) {
                            const length = this.processors.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeInitializationAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    const processed = processor.processAfterInitialization(name, result);
                                    if (!processed) {
                                        return result;
                                    }
                                    result = processed;
                                }
                            }
                        }
                        return result;
                    }
                    _applyProcessorsBeforeConstruction(name, constructor, argumentsList = []) {
                        let result = null;
                        if (this.hasConstructionAwareProcessors) {
                            const length = this.processors.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeConstructionAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    result = processor.processBeforeConstruction(name, constructor, argumentsList);
                                    if (!result) {
                                        return result;
                                    }
                                }
                            }
                        }
                        return result;
                    }
                    _applyProcessorsBeforeDestruction(name, instance) {
                        if (this.hasDestructionAwareProcessors) {
                            const length = this.processors.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeDestructionAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    processor.processBeforeDestruction(name, instance);
                                }
                            }
                        }
                    }
                    _applyProcessorsBeforeInitialization(name, instance) {
                        let result = instance;
                        if (this.hasInitializationAwareProcessors) {
                            const length = this.processors.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeInitializationAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    const processed = processor.processBeforeInitialization(name, result);
                                    if (!processed) {
                                        return result;
                                    }
                                    result = processed;
                                }
                            }
                        }
                        return result;
                    }
                    _configure(name, instance) {
                        try {
                            this._populate(name, instance);
                            if ((0, _aware__WEBPACK_IMPORTED_MODULE_3__.likeAware)(instance)) {
                                instance = this._invokeAware(name, instance);
                            }
                            instance = this._initialize(name, instance);
                        } catch (e) {
                            // TODO Do proper error handling
                            console.error(e);
                        }
                        return instance;
                    }
                    _create(name, argumentsList = []) {
                        let constructor = this[`$${name}`],
                            instance = null;
                        try {
                            instance = this._applyProcessorsBeforeConstruction(name, constructor, argumentsList);
                            if (!instance && (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.isFunction)(constructor)) {
                                instance = construct(constructor, argumentsList);
                            }
                        } catch (e) {
                            // TODO Do proper error handling
                            console.error(e);
                        }
                        return this._configure(name, instance);
                    }
                    _initialize(name, instance) {
                        instance = this._applyProcessorsBeforeInitialization(name, instance);
                        try {
                            if ((0, _lifecycle__WEBPACK_IMPORTED_MODULE_1__.likeInitializable)(instance)) {
                                this._invokeInit(name, instance);
                            }
                        } catch (e) {}
                        instance = this._applyProcessorsAfterInitialization(name, instance);
                        return instance;
                    }
                    _populate(name, instance, properties = {}) {
                        if (instance === null) {
                            return;
                        }
                        let populateProperties = true,
                            processedValue = instance,
                            processedProperties,
                            index;
                        const { hasConstructionAwareProcessors } = this,
                            length = this.processors.length;
                        if (hasConstructionAwareProcessors) {
                            populateProperties = this._applyProcessorsAfterConstruction(name, instance);
                        }
                        if (!populateProperties) {
                            return;
                        }
                        if (hasConstructionAwareProcessors) {
                            index = 0;
                            for (; index < length; index++) {
                                const processor = this.processors[index];
                                if (
                                    (0, _entry_processor__WEBPACK_IMPORTED_MODULE_5__.likeConstructionAwareProcessor)(
                                        processor
                                    )
                                ) {
                                    processedProperties = processor.processProperties(properties, name, processedValue);
                                }
                            }
                        }
                        // TODO Add better handling of empty processedProperties
                        processedProperties &&
                            keys(processedProperties).forEach(function (key) {
                                defineProperty(processedValue, key, processedProperties[key]);
                            });
                    }
                    _invokeAware(name, instance) {
                        if ((0, _aware__WEBPACK_IMPORTED_MODULE_3__.likeNameAware)(instance)) {
                            instance.setName(name);
                        }
                        if (likeFactoryAware(instance)) {
                            instance.setFactory(this);
                        }
                        return instance;
                    }
                    _invokeInit(name, instance) {
                        try {
                            instance.init();
                        } catch (e) {
                            // TODO Do proper error handling
                            console.error(e);
                        }
                    }
                }
                /**
                 * @abstract
                 * @class module:factory.AbstractFactory
                 * @implements module:factory.ConfigurableFactory
                 */
                /**
                 * @member {external:Array<module:factory.EntryProcessor>} module:factory.AbstractFactory#processors
                 */
                /**
                 * @function module:factory.AbstractFactory#addProcessor
                 * @param {module:factory.EntryProcessor} processor
                 */
                /**
                 * @class module:factory.DefaultFactory
                 * @extends module:factory.AbstractFactory
                 * @example
                 * const factory = new DefaultFactory();
                 * factory.setValue( 'foo', 123 );
                 * factory.getValue( 'foo' );
                 * //=> 123
                 * factory.hasValue( 'foo' );
                 * //=> true
                 * factory.deleteValue( 'foo' );
                 * factory.hasValue( 'foo' );
                 * //=> false
                 */
                class DefaultFactory extends AbstractFactory {}
                /**
                 * @class module:factory.ProxiedFactory
                 * @extends module:factory.DefaultFactory
                 * @implements external:Record
                 * @example
                 * const factory = new ProxiedFactory();
                 * factory.foo = 123;
                 * 'foo' in factory;
                 * //=> true
                 * delete factory.foo
                 * 'foo' in factory;
                 * //=> false
                 * @see {@link module:factory.DefaultFactory}
                 */
                class ProxiedFactory extends DefaultFactory {
                    constructor() {
                        super();
                        return new Proxy(this, new _registry__WEBPACK_IMPORTED_MODULE_4__.RegistryProxyHandler());
                    }
                }
                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUVILE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM3RixPQUFPLEVBQThCLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM3RixPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDL0gsT0FBTyxFQUFTLE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNqRixPQUFPLEVBQVksb0JBQW9CLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFNUQsT0FBTyxFQUFrQiw4QkFBOEIsRUFBRSw2QkFBNkIsRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBcUJwSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUgsTUFDSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ3pCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFLNUQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxDQUEyQixVQUFhLEVBQW9DLEVBQUUsQ0FBQyxLQUFNLFNBQVEsT0FBTyxDQUFFLFVBQVUsQ0FBRTtJQUc1STs7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

                /***/
            },
            /* 5 */
            /***/ (module) => {
                module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

                /***/
            },
            /* 6 */
            /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ likeDestroyable: () => /* binding */ likeDestroyable,
                    /* harmony export */ likeInitializable: () => /* binding */ likeInitializable,
                    /* harmony export */
                });
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
                /**
                 * @author Jeff Rose
                 */

                /**
                 * @interface module:factory.Destroyable
                 * @property {external:boolean} destroyed
                 */
                /**
                 * @function module:factory.Destroyable#destroy
                 */
                /**
                 * @interface module:factory.AsyncDestroyable
                 * @extends module:factory.Destroyable
                 */
                /**
                 * @function module:factory.AsyncDestroyable#destroy
                 * @returns {external:Promise}
                 */
                /**
                 * @interface module:factory.Initializable
                 */
                /**
                 * @function module:factory.Initializable#init
                 */
                /**
                 * @function module:factory.likeDestroyable
                 * @param {*} value
                 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Destroyable|Destroyable}.
                 */
                const likeDestroyable = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    destroy: Function,
                    destroyed: Boolean,
                });
                /**
                 * @function module:factory.likeInitializable
                 * @param {*} value
                 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Initializable|Initializable}.
                 */
                const likeInitializable = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ init: Function });
                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZWxDOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFFLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQXVDLENBQUM7QUFFdEg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBeUMsQ0FBQyJ9

                /***/
            },
            /* 7 */
            /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ RegistryProxyHandler: () => /* binding */ RegistryProxyHandler,
                    /* harmony export */ likeRegistry: () => /* binding */ likeRegistry,
                    /* harmony export */
                });
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default =
                    /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
                /**
                 * @author Jeff Rose
                 */

                /**
                 * Interface that defines a registry for shared instances
                 * @interface module:factory.Registry
                 */
                /**
                 * @function module:factory.likeRegistry
                 * @param {*} value The value to be tested
                 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.Registry|Registry}.
                 */
                const likeRegistry = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                    destroyValue: Function,
                    getValue: Function,
                    hasValue: Function,
                    setValue: Function,
                });
                /**
                 * A handler implementation that when applied to a {@linkcode module:factory.Registry|Registry} instance via {@linkcode external:Proxy|Proxy} causes the registry
                 * to behave like a plain object. This is used to implement {@linkcode module:factory.ProxiedFactory|ProxiedFactory}.
                 * @class module:factory.RegistryProxyHandler
                 * @implements external:ProxyHandler
                 * @see {@link module:factory.ProxiedFactory}
                 */
                class RegistryProxyHandler {
                    deleteProperty(target, key) {
                        try {
                            target.destroyValue(key);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    }
                    get(target, key) {
                        return target.getValue(key);
                    }
                    has(target, key) {
                        return target.hasValue(key);
                    }
                    set(target, key, value) {
                        try {
                            target.setValue(key, value);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    }
                }
                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVNsQzs7O0dBR0c7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBRSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBb0MsQ0FBQztBQUU3Sjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8sb0JBQW9CO0lBQzdCLGNBQWMsQ0FBRSxNQUFTLEVBQUUsR0FBZ0I7UUFDdkMsSUFBSTtZQUNBLE1BQU0sQ0FBQyxZQUFZLENBQUUsR0FBYSxDQUFFLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsR0FBRyxDQUFXLE1BQVMsRUFBRSxHQUFnQjtRQUNyQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUssR0FBYSxDQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELEdBQUcsQ0FBRSxNQUFTLEVBQUUsR0FBZ0I7UUFDNUIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFFLEdBQWEsQ0FBRSxDQUFDO0lBQzVDLENBQUM7SUFFRCxHQUFHLENBQVcsTUFBUyxFQUFFLEdBQWdCLEVBQUUsS0FBUTtRQUMvQyxJQUFJO1lBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBSyxHQUFhLEVBQUUsS0FBSyxDQUFFLENBQUM7WUFDM0MsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0oifQ==

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
            /******/ __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
            /******/
            /******/ // Return the exports of the module
            /******/ return module.exports;
            /******/
        }
        /******/
        /************************************************************************/
        /******/ /* webpack/runtime/compat get default export */
        /******/ (() => {
            /******/ // getDefaultExport function for compatibility with non-harmony modules
            /******/ __webpack_require__.n = (module) => {
                /******/ var getter =
                    module && module.__esModule ? /******/ () => module['default'] : /******/ () => module;
                /******/ __webpack_require__.d(getter, { a: getter });
                /******/ return getter;
                /******/
            };
            /******/
        })();
        /******/
        /******/ /* webpack/runtime/define property getters */
        /******/ (() => {
            /******/ // define getter functions for harmony exports
            /******/ __webpack_require__.d = (exports, definition) => {
                /******/ for (var key in definition) {
                    /******/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                        /******/ Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                        /******/
                    }
                    /******/
                }
                /******/
            };
            /******/
        })();
        /******/
        /******/ /* webpack/runtime/hasOwnProperty shorthand */
        /******/ (() => {
            /******/ __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
            /******/
        })();
        /******/
        /******/ /* webpack/runtime/make namespace object */
        /******/ (() => {
            /******/ // define __esModule on exports
            /******/ __webpack_require__.r = (exports) => {
                /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                    /******/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
                    /******/
                }
                /******/ Object.defineProperty(exports, '__esModule', { value: true });
                /******/
            };
            /******/
        })();
        /******/
        /************************************************************************/
        var __webpack_exports__ = {};
        // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
        (() => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                /* harmony export */ $aware: () => /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.$aware,
                /* harmony export */ AbstractFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.AbstractFactory,
                /* harmony export */ AsAware: () => /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.AsAware,
                /* harmony export */ AsFactoryAware: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.AsFactoryAware,
                /* harmony export */ AsNameAware: () =>
                    /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.AsNameAware,
                /* harmony export */ DefaultFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.DefaultFactory,
                /* harmony export */ ProxiedFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.ProxiedFactory,
                /* harmony export */ RegistryProxyHandler: () =>
                    /* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.RegistryProxyHandler,
                /* harmony export */ likeAware: () => /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.likeAware,
                /* harmony export */ likeAwareAnd: () =>
                    /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.likeAwareAnd,
                /* harmony export */ likeConfigurableFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.likeConfigurableFactory,
                /* harmony export */ likeConstructionAwareProcessor: () =>
                    /* reexport safe */ _entry_processor__WEBPACK_IMPORTED_MODULE_1__.likeConstructionAwareProcessor,
                /* harmony export */ likeDestroyable: () =>
                    /* reexport safe */ _lifecycle__WEBPACK_IMPORTED_MODULE_3__.likeDestroyable,
                /* harmony export */ likeDestructionAwareProcessor: () =>
                    /* reexport safe */ _entry_processor__WEBPACK_IMPORTED_MODULE_1__.likeDestructionAwareProcessor,
                /* harmony export */ likeEntryProcessor: () =>
                    /* reexport safe */ _entry_processor__WEBPACK_IMPORTED_MODULE_1__.likeEntryProcessor,
                /* harmony export */ likeEntryRegistryProcessor: () =>
                    /* reexport safe */ _entry_processor__WEBPACK_IMPORTED_MODULE_1__.likeEntryRegistryProcessor,
                /* harmony export */ likeFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.likeFactory,
                /* harmony export */ likeFactoryAware: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.likeFactoryAware,
                /* harmony export */ likeHierarchicalFactory: () =>
                    /* reexport safe */ _factory__WEBPACK_IMPORTED_MODULE_2__.likeHierarchicalFactory,
                /* harmony export */ likeInitializable: () =>
                    /* reexport safe */ _lifecycle__WEBPACK_IMPORTED_MODULE_3__.likeInitializable,
                /* harmony export */ likeInitializationAwareProcessor: () =>
                    /* reexport safe */ _entry_processor__WEBPACK_IMPORTED_MODULE_1__.likeInitializationAwareProcessor,
                /* harmony export */ likeNameAware: () =>
                    /* reexport safe */ _aware__WEBPACK_IMPORTED_MODULE_0__.likeNameAware,
                /* harmony export */ likeRegistry: () =>
                    /* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.likeRegistry,
                /* harmony export */
            });
            /* harmony import */ var _aware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
            /* harmony import */ var _entry_processor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
            /* harmony import */ var _factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
            /* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
            /* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
            /**
             * @author Jeff Rose
             * @module factory
             * @requires core
             * @requires util
             */

            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsY0FBYyxTQUFTLENBQUM7QUFDeEIsY0FBYyxtQkFBbUIsQ0FBQztBQUNsQyxjQUFjLFdBQVcsQ0FBQztBQUMxQixjQUFjLGFBQWEsQ0FBQztBQUM1QixjQUFjLFlBQVksQ0FBQyJ9
        })();

        /******/ return __webpack_exports__;
        /******/
    })();
});
