(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(
            require('@blue/core'),
            require('@blue/content'),
            require('@blue/util'),
            require('@blue/factory'),
            require('@blue/parser'),
            require('@blue/logger')
        );
    else if (typeof define === 'function' && define.amd)
        define(['@blue/core', '@blue/content', '@blue/util', '@blue/factory', '@blue/parser', '@blue/logger'], factory);
    else if (typeof exports === 'object')
        exports['blue-context'] = factory(
            require('@blue/core'),
            require('@blue/content'),
            require('@blue/util'),
            require('@blue/factory'),
            require('@blue/parser'),
            require('@blue/logger')
        );
    else
        root['blue-context'] = factory(
            root['@blue/core'],
            root['@blue/content'],
            root['@blue/util'],
            root['@blue/factory'],
            root['@blue/parser'],
            root['@blue/logger']
        );
})(
    globalThis,
    (
        __WEBPACK_EXTERNAL_MODULE__2__,
        __WEBPACK_EXTERNAL_MODULE__3__,
        __WEBPACK_EXTERNAL_MODULE__4__,
        __WEBPACK_EXTERNAL_MODULE__6__,
        __WEBPACK_EXTERNAL_MODULE__9__,
        __WEBPACK_EXTERNAL_MODULE__15__
    ) => {
        return /******/ (() => {
            // webpackBootstrap
            /******/ var __webpack_modules__ = [
                ,
                /* 0 */ /* 1 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ $ChildContext: () => /* binding */ $ChildContext,
                        /* harmony export */ ApplicationContextAwareProcessor: () =>
                            /* binding */ ApplicationContextAwareProcessor,
                        /* harmony export */ AsApplicationContextAware: () => /* binding */ AsApplicationContextAware,
                        /* harmony export */ GenericApplicationContext: () => /* binding */ GenericApplicationContext,
                        /* harmony export */ ProxiedGenericApplicationContext: () =>
                            /* binding */ ProxiedGenericApplicationContext,
                        /* harmony export */ likeApplicationContext: () => /* binding */ likeApplicationContext,
                        /* harmony export */ likeApplicationContextAware: () =>
                            /* binding */ likeApplicationContextAware,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_content__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
                    /* harmony import */ var _blue_content__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_content__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
                    /* harmony import */ var _event_emitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_4___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_4__);
                    /* harmony import */ var _environment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
                    /* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(10);
                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldSet =
                        (undefined && undefined.__classPrivateFieldSet) ||
                        function (receiver, state, value, kind, f) {
                            if (kind === 'm') throw new TypeError('Private method is not writable');
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a setter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot write private member to an object whose class did not declare it'
                                );
                            return (
                                kind === 'a'
                                    ? f.call(receiver, value)
                                    : f
                                      ? (f.value = value)
                                      : state.set(receiver, value),
                                value
                            );
                        };
                    var __classPrivateFieldGet =
                        (undefined && undefined.__classPrivateFieldGet) ||
                        function (receiver, state, kind, f) {
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a getter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot read private member from an object whose class did not declare it'
                                );
                            return kind === 'm'
                                ? f
                                : kind === 'a'
                                  ? f.call(receiver)
                                  : f
                                    ? f.value
                                    : state.get(receiver);
                        };
                    var _GenericApplicationContext_environment,
                        _GenericApplicationContext_id,
                        _GenericApplicationContext_name,
                        _GenericApplicationContext_parent;

                    /**
                     * Central interface to provide configuration for an application.
                     * An ApplicationContext provides:
                     * * Factory methods for accessing application components.
                     * * The ability to load file resources in a generic fashion.
                     * * The ability to emit events to registered listeners.
                     * * The ability to resolve content.
                     * * Inheritance from a parent context unless it is the root context.
                     *
                     * In addition to standard {@linkcode module:factory.Factory|Factory} lifecycle capabilities, `ApplicationContext` implementations detect and invoke {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} values as well as {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}.
                     * @interface module:context.ApplicationContext
                     * @extends module:factory.ConfigurableFactory
                     * @extends module:content.ContentSource
                     * @extends module:core.Destroyable
                     * @extends module:context.EventEmitter
                     * @extends module:context.EnvironmentSource
                     * @extends module:context.ResourceLoader
                     */
                    /**
                     * Interface to be implemented by any object that wishes to be notified of the {@linkcode module:context.ApplicationContext|ApplicationContext} that it runs in.
                     *
                     * Implementing this interface makes sense for example when an object requires access to a set of collaborating values.
                     *
                     * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@linkcode module:context.ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@linkcode module:context.ContentSource|ContentSource}. However, it is preferable to implement the more specific {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}, {@linkcode module:context.ApplicationEventEmitterAware|ApplicationEventEmitterAware} or {@linkcode module:context.ContentSourceAware|ContentSourceAware} interface in such a specific scenario.
                     *
                     * {@linkcode module:context.AsApplicationContextAware|AsApplicationContextAware} is a convenience mixin for application objects, implementing this interface.
                     * @interface module:context.ApplicationContextAware
                     */
                    /**
                     * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
                     *
                     * Invoked after population of normal value properties but before an `init` callback.
                     * @function module:context.ApplicationContextAware#setApplicationContext
                     * @param {module:context.ApplicationContext} context The ApplicationContext to be used by this object.
                     */
                    const { defineProperty } = Reflect;
                    let uuid = 0;
                    const $ChildContext = Symbol('@@context/child');
                    /**
                     * @function module:context.likeApplicationContext
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContext|ApplicationContext}
                     */
                    const likeApplicationContext = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.allPass)([
                        _blue_content__WEBPACK_IMPORTED_MODULE_1__.likeContentSource,
                        _blue_factory__WEBPACK_IMPORTED_MODULE_4__.likeDestroyable,
                        _environment__WEBPACK_IMPORTED_MODULE_5__.likeEnvironmentSource,
                        _event_emitter__WEBPACK_IMPORTED_MODULE_3__.likeEventEmitter,
                        _blue_factory__WEBPACK_IMPORTED_MODULE_4__.likeFactory,
                        _blue_factory__WEBPACK_IMPORTED_MODULE_4__.likeRegistry,
                        _resource__WEBPACK_IMPORTED_MODULE_6__.likeResourceLoader,
                    ]);
                    /**
                     * @function module:context.likeApplicationContextAware
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContextAware|ApplicationContextAware}
                     */
                    const likeApplicationContextAware = (0, _blue_factory__WEBPACK_IMPORTED_MODULE_4__.likeAwareAnd)(
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({ setApplicationContext: Function })
                    );
                    /**
                     * @class module:context.GenericApplicationContext
                     * @implements module:context.ConfigurableApplicationContext
                     * @extends module:factory.DefaultFactory
                     * @mixes module:context.AsEventEmitter
                     * @mixes module:context.AsModuleResourceLoader
                     */
                    class GenericApplicationContext extends (0,
                    _event_emitter__WEBPACK_IMPORTED_MODULE_3__.AsEventEmitter)(
                        (0, _resource__WEBPACK_IMPORTED_MODULE_6__.AsModuleResourceLoader)(
                            _blue_factory__WEBPACK_IMPORTED_MODULE_4__.DefaultFactory
                        )
                    ) {
                        constructor(name, data) {
                            super();
                            _GenericApplicationContext_environment.set(this, void 0);
                            _GenericApplicationContext_id.set(this, void 0);
                            _GenericApplicationContext_name.set(this, void 0);
                            _GenericApplicationContext_parent.set(this, void 0);
                            __classPrivateFieldSet(this, _GenericApplicationContext_environment, null, 'f');
                            __classPrivateFieldSet(
                                this,
                                _GenericApplicationContext_name,
                                name !== null && name !== void 0 ? name : null,
                                'f'
                            );
                            __classPrivateFieldSet(this, _GenericApplicationContext_parent, null, 'f');
                            this.setId(++uuid);
                            defineProperty(this, 'createdTimestamp', {
                                value: Date.now(),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'root', {
                                value: this,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'destroyed', {
                                value: false,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'destroyedTimestamp', {
                                value: -1,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            if (data) {
                                for (const key in data) {
                                    this.setValue(key, data[key]);
                                }
                            }
                        }
                        get environment() {
                            if (!__classPrivateFieldGet(this, _GenericApplicationContext_environment, 'f')) {
                                __classPrivateFieldSet(
                                    this,
                                    _GenericApplicationContext_environment,
                                    this._createEnvironment(),
                                    'f'
                                );
                            }
                            return __classPrivateFieldGet(this, _GenericApplicationContext_environment, 'f');
                        }
                        get id() {
                            return __classPrivateFieldGet(this, _GenericApplicationContext_id, 'f');
                        }
                        get name() {
                            return __classPrivateFieldGet(this, _GenericApplicationContext_name, 'f');
                        }
                        get parent() {
                            return __classPrivateFieldGet(this, _GenericApplicationContext_parent, 'f');
                        }
                        get path() {
                            const path = [];
                            let ctx = this;
                            this.name && path.unshift(this.name);
                            while (ctx.parent) {
                                ctx = ctx.parent;
                                path.unshift(ctx.name);
                            }
                            return path.join('/');
                        }
                        /*
    broadcast( type: EventType, ...data: any[] ): void {
        direct<ApplicationContext>( this, ( parentContext ) => parentContext.emit( type, ...data ), true );
    }
    */
                        bubble(type, ...data) {
                            (0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.escalate)(
                                this,
                                (parentContext) => parentContext.emit(type, ...data),
                                true
                            );
                        }
                        destroy() {
                            if (!this.destroyed) {
                                defineProperty(this, 'destroyed', {
                                    value: true,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                defineProperty(this, 'destroyedTimestamp', {
                                    value: Date.now(),
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                                // Destroy things
                            }
                        }
                        getContent(key, language) {
                            throw new Error('Method not implemented.');
                        }
                        setEnvironment(environment) {
                            __classPrivateFieldSet(this, _GenericApplicationContext_environment, environment, 'f');
                        }
                        setId(id) {
                            __classPrivateFieldSet(this, _GenericApplicationContext_id, id, 'f');
                        }
                        setName(name) {
                            __classPrivateFieldSet(this, _GenericApplicationContext_name, name, 'f');
                        }
                        setParent(parent) {
                            __classPrivateFieldSet(this, _GenericApplicationContext_parent, parent, 'f');
                        }
                        _createEnvironment() {
                            return new _environment__WEBPACK_IMPORTED_MODULE_5__.StandardEnvironment();
                        }
                    }
                    (_GenericApplicationContext_environment = new WeakMap()),
                        (_GenericApplicationContext_id = new WeakMap()),
                        (_GenericApplicationContext_name = new WeakMap()),
                        (_GenericApplicationContext_parent = new WeakMap());
                    /**
                     * @class module:context.ProxiedGenericApplicationContext
                     * @implements external:Record
                     * @extends module:context.GenericApplicationContext
                     */
                    class ProxiedGenericApplicationContext extends GenericApplicationContext {
                        constructor(name, data) {
                            super(name, data);
                            return new Proxy(
                                this,
                                new _blue_factory__WEBPACK_IMPORTED_MODULE_4__.RegistryProxyHandler()
                            );
                        }
                    }
                    /**
                     * @mixin module:context.AsApplicationContextAware
                     * @implements module:context.ApplicationContextAware
                     */
                    const AsApplicationContextAware = (superclass) =>
                        class extends (0, _blue_factory__WEBPACK_IMPORTED_MODULE_4__.AsAware)(superclass) {
                            /**
                             * @function module:context.AsApplicationContextAware#setApplicationContext
                             * @param {module:context.ApplicationContext} applicationContext The application context to be set.
                             */
                            setApplicationContext(applicationContext) {
                                /**
                                 * @readonly
                                 * @member {module:context.ApplicationContext} module:context.AsApplicationContextAware#applicationContext
                                 */
                                defineProperty(this, 'applicationContext', {
                                    value: applicationContext,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                        };
                    /**
                     * Create a new ApplicationContextAwareProcessor for the given context.
                     * @classdesc
                     * An {@linkcode module:factory.InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the {@linkcode module:context.EnvironmentAware|EnvironmentAware}, {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}, {@linkcode module:context.ApplicationEventEmitterAware|ApplicationEventEmitterAware}, {@linkcode module:context.ContentSourceAware|ContentSourceAware}, and/or {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} interfaces.
                     *
                     * Implemented interfaces are satisfied in order of their mention above.
                     * @class module:context.ApplicationContextAwareProcessor
                     * @implements module:factory.InitializationAwareProcessor
                     * @param {module:context.ApplicationContext} applicationContext
                     * @see {@link module:context.EnvironmentAware}
                     * @see {@link module:context.ResourceLoaderAware}
                     * @see {@link module:context.ApplicationEventEmitterAware}
                     * @see {@link module:context.ContentSourceAware}
                     * @see {@link module:context.ApplicationContextAware}
                     */
                    class ApplicationContextAwareProcessor {
                        constructor(applicationContext) {
                            /**
                             * @readonly
                             * @member {module:context.ApplicationContext} module:context.ApplicationContextAwareProcessor#applicationContext
                             */
                            defineProperty(this, 'applicationContext', {
                                value: applicationContext,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        processAfterInitialization(name, value) {
                            return value;
                        }
                        processBeforeInitialization(name, value) {
                            if ((0, _blue_factory__WEBPACK_IMPORTED_MODULE_4__.likeAware)(value)) {
                                const { applicationContext } = this;
                                (0, _environment__WEBPACK_IMPORTED_MODULE_5__.likeEnvironmentAware)(value) &&
                                    value.setEnvironment(applicationContext.environment);
                                (0, _resource__WEBPACK_IMPORTED_MODULE_6__.likeResourceLoaderAware)(value) &&
                                    value.setResourceLoader(applicationContext);
                                (0, _event_emitter__WEBPACK_IMPORTED_MODULE_3__.likeApplicationEventEmitterAware)(
                                    value
                                ) && value.setApplicationEventEmitter(applicationContext);
                                (0, _blue_content__WEBPACK_IMPORTED_MODULE_1__.likeContentSourceAware)(value) &&
                                    value.setContentSource(applicationContext);
                                likeApplicationContextAware(value) && value.setApplicationContext(applicationContext);
                            }
                            return value;
                        }
                    }
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUVILE9BQU8sRUFBNkIsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2pFLE9BQU8sRUFBaUIsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekYsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDM0MsT0FBTyxFQUFFLGNBQWMsRUFBZ0IsZ0NBQWdDLEVBQUUsZ0JBQWdCLEVBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM5SCxPQUFPLEVBQW9DLGVBQWUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxvQkFBb0IsRUFBZ0MsWUFBWSxFQUFTLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMU4sT0FBTyxFQUFxQixxQkFBcUIsRUFBZSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBMkIsTUFBTSxlQUFlLENBQUM7QUFDMUosT0FBTyxFQUFrQixrQkFBa0IsRUFBRSxzQkFBc0IsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQXdCakg7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBRUg7Ozs7Ozs7OztHQVNHO0FBRUg7Ozs7OztHQU1HO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFFYixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQWtCLE1BQU0sQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO0FBRXhFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUUsQ0FBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsQ0FBRSxDQUE4QyxDQUFDO0FBRTVOOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxZQUFZLENBQUUsSUFBSSxDQUFFLEVBQUUscUJBQXFCLEVBQUUsUUFBUSxFQUFFLENBQUUsQ0FBbUQsQ0FBQztBQUV4Sjs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8seUJBQTBCLFNBQVEsY0FBYyxDQUFFLHNCQUFzQixDQUFFLGNBQWMsQ0FBRSxDQUFFO0lBMkNyRyxZQUFhLElBQWEsRUFBRSxJQUFpQjtRQUN6QyxLQUFLLEVBQUUsQ0FBQztRQTNDWix5REFBMEI7UUFDMUIsZ0RBQVk7UUFDWixrREFBYztRQUNkLG9EQUE0QjtRQTBDeEIsdUJBQUEsSUFBSSwwQ0FBZ0IsSUFBSSxNQUFBLENBQUM7UUFDekIsdUJBQUEsSUFBSSxtQ0FBUyxJQUFJLGFBQUosSUFBSSxjQUFKLElBQUksR0FBSSxJQUFJLE1BQUEsQ0FBQztRQUMxQix1QkFBQSxJQUFJLHFDQUFXLElBQUksTUFBQSxDQUFDO1FBRXBCLElBQUksQ0FBQyxLQUFLLENBQUUsRUFBRSxJQUFJLENBQUUsQ0FBQztRQUVyQixjQUFjLENBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3RDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztRQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQzFCLEtBQUssRUFBRSxJQUFJO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO1FBQ0osY0FBYyxDQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDL0IsS0FBSyxFQUFFLEtBQUs7WUFDWixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7UUFDSixjQUFjLENBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7UUFFSixJQUFJLElBQUksRUFBRTtZQUNOLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNwQixJQUFJLENBQUMsUUFBUSxDQUFFLEdBQUcsRUFBRSxJQUFJLENBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQzthQUNyQztTQUNKO0lBQ0wsQ0FBQztJQXhFRCxJQUFJLFdBQVc7UUFDWCxJQUFJLENBQUMsdUJBQUEsSUFBSSw4Q0FBYSxFQUFFO1lBQ3BCLHVCQUFBLElBQUksMENBQWdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFBLENBQUM7U0FDakQ7UUFDRCxPQUFPLHVCQUFBLElBQUksOENBQWEsQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyx1QkFBQSxJQUFJLHFDQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sdUJBQUEsSUFBSSx1Q0FBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLHVCQUFBLElBQUkseUNBQVEsQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO1FBQzFCLElBQUksR0FBRyxHQUF1QixJQUFJLENBQUM7UUFFbkMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQztRQUV2QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDZixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQztTQUM1QjtRQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBQztJQUM1QixDQUFDO0lBMkNEOzs7O01BSUU7SUFFRixNQUFNLENBQUUsSUFBZSxFQUFFLEdBQUcsSUFBVztRQUNuQyxRQUFRLENBQXNCLElBQUksRUFBRSxDQUFFLGFBQWEsRUFBRyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUUsRUFBRSxJQUFJLENBQUUsQ0FBQztJQUN6RyxDQUFDO0lBRUQsT0FBTztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pCLGNBQWMsQ0FBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUMvQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2xCLENBQUUsQ0FBQztZQUNKLGNBQWMsQ0FBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7Z0JBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNqQixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2xCLENBQUUsQ0FBQztZQUVKLGlCQUFpQjtTQUNwQjtJQUNMLENBQUM7SUFFRCxVQUFVLENBQUUsR0FBVyxFQUFFLFFBQWdCO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUUseUJBQXlCLENBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQsY0FBYyxDQUFFLFdBQW9DO1FBQ2hELHVCQUFBLElBQUksMENBQWdCLFdBQVcsTUFBQSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxLQUFLLENBQUUsRUFBVTtRQUNiLHVCQUFBLElBQUksaUNBQU8sRUFBRSxNQUFBLENBQUM7SUFDbEIsQ0FBQztJQUVELE9BQU8sQ0FBRSxJQUFZO1FBQ2pCLHVCQUFBLElBQUksbUNBQVMsSUFBSSxNQUFBLENBQUM7SUFDdEIsQ0FBQztJQUVELFNBQVMsQ0FBRSxNQUEwQjtRQUNqQyx1QkFBQSxJQUFJLHFDQUFXLE1BQU0sTUFBQSxDQUFDO0lBQzFCLENBQUM7SUFFUyxrQkFBa0I7UUFDeEIsT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7SUFDckMsQ0FBQztDQUNKOztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sZ0NBQWlDLFNBQVEseUJBQXlCO0lBRzNFLFlBQWEsSUFBWSxFQUFFLElBQWlCO1FBQ3hDLEtBQUssQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFDcEIsT0FBTyxJQUFJLEtBQUssQ0FBRSxJQUFJLEVBQUUsSUFBSSxvQkFBb0IsRUFBUSxDQUFFLENBQUM7SUFDL0QsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsQ0FBMkIsVUFBYSxFQUErQyxFQUFFLENBQUMsS0FBTSxTQUFRLE9BQU8sQ0FBRSxVQUFVLENBQUU7SUFHbEs7OztPQUdHO0lBQ0gscUJBQXFCLENBQUUsa0JBQXNDO1FBQ3pEOzs7V0FHRztRQUNILGNBQWMsQ0FBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDeEMsS0FBSyxFQUFFLGtCQUFrQjtZQUN6QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7SUFDUixDQUFDO0NBQ0osQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxPQUFPLGdDQUFnQztJQUd6QyxZQUFhLGtCQUFzQztRQUMvQzs7O1dBR0c7UUFDSCxjQUFjLENBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ3hDLEtBQUssRUFBRSxrQkFBa0I7WUFDekIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztJQUVELDBCQUEwQixDQUFXLElBQVksRUFBRSxLQUFRO1FBQ3ZELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCwyQkFBMkIsQ0FBVyxJQUFZLEVBQUUsS0FBUTtRQUN4RCxJQUFJLFNBQVMsQ0FBRSxLQUFLLENBQUUsRUFBRTtZQUNwQixNQUFNLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDcEMsb0JBQW9CLENBQUUsS0FBSyxDQUFFLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBRSxrQkFBa0IsQ0FBQyxXQUFXLENBQUUsQ0FBQztZQUN4Rix1QkFBdUIsQ0FBRSxLQUFLLENBQUUsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUUsa0JBQWtCLENBQUUsQ0FBQztZQUNsRixnQ0FBZ0MsQ0FBRSxLQUFLLENBQUUsSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUUsa0JBQWtCLENBQUUsQ0FBQztZQUNwRyxzQkFBc0IsQ0FBRSxLQUFLLENBQUUsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUUsa0JBQWtCLENBQUUsQ0FBQztZQUNoRiwyQkFBMkIsQ0FBRSxLQUFLLENBQUUsSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUUsa0JBQWtCLENBQUUsQ0FBQztTQUM3RjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSiJ9

                    /***/
                },
                /* 2 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

                    /***/
                },
                /* 3 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

                    /***/
                },
                /* 4 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

                    /***/
                },
                /* 5 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ AsEventEmitter: () => /* binding */ AsEventEmitter,
                        /* harmony export */ likeApplicationEventEmitterAware: () =>
                            /* binding */ likeApplicationEventEmitterAware,
                        /* harmony export */ likeEventEmitter: () => /* binding */ likeEventEmitter,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_2___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_2__);
                    /**
                     * @author Jeff Rose
                     * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
                     * @see {@link https://github.com/jeffrose/emitter}
                     */

                    /**
                     * A {@link external:Function| function} bound to an emitter {@link module:context.EventType|event type}. Any data transmitted with the event will be passed into the listener as arguments.
                     * @callback module:context.EventListener
                     * @param {...*} data The arguments passed by the `emit`.
                     */
                    /**
                     * An {@link module:context.EventListener| event listener} or a list of event listeners.
                     * @callback module:context.EventHandler
                     */
                    /**
                     * An {@link external:Object|object} that maps {@link module:context.EventType|event types} to an {@link module:context.EventHandler|event handler}.
                     * @typedef {external:Object} module:context.EventHandlers
                     */
                    /**
                     * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
                     * @typedef {external:string|external:symbol} module:context.EventType
                     */
                    /**
                     * @interface module:context.EventEmitter
                     */
                    /**
                     * @function module:context.EventEmitter#emit
                     * @param {module:context.EventType} type
                     * @param {...*} data
                     * @returns {external:boolean}
                     */
                    /**
                     * @function module:context.EventEmitter#eventTypes
                     * @returns {external:Array<module:context.EventType>}
                     */
                    /**
                     * @function module:context.EventEmitter#listenerCount
                     * @param {module:context.EventType} type
                     * @returns {external:number}
                     */
                    /**
                     * @function module:context.EventEmitter#listeners
                     * @param {module:context.EventType} type
                     * @returns {external:Array<external:Function>}
                     */
                    /**
                     * @function module:context.EventEmitter#on
                     * @param {module:context.EventType} type
                     * @param {external:Function} listener
                     * @returns {module:context.EventEmitter}
                     */
                    /**
                     * @function module:context.EventEmitter#off
                     * @param {module:context.EventType} type
                     * @param {external:Function} listener
                     * @returns {module:context.EventEmitter}
                     */
                    const $events = '@@emitter/events',
                        $every = '@@emitter/every',
                        { defineProperty, deleteProperty, getPrototypeOf } = Reflect,
                        { hasOwnProperty } = Object.prototype,
                        { keys } = Object,
                        { isArray } = Array,
                        onMatcher = /^on(.+)$/,
                        hasFunction = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.propIs)(Function),
                        hasListener = hasFunction('listener'),
                        lastIndexOfColon = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.lastIndexOf)(':');
                    /**
                     * @function module:context.likeApplicationEventEmitterAware
                     */
                    const likeApplicationEventEmitterAware = (0,
                    _blue_factory__WEBPACK_IMPORTED_MODULE_2__.likeAwareAnd)(
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ setApplicationEventEmitter: Function })
                    );
                    /**
                     * @function module:context.likeEventEmitter
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EventEmitter|EventEmitter}
                     */
                    const likeEventEmitter = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({
                        emit: Function,
                        eventTypes: Function,
                        listener: Function,
                        listenerCount: Function,
                        listeners: Function,
                        off: Function,
                        on: Function,
                    });
                    /**
                     * @function module:core~addEventHandler
                     * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
                     * @param {module:context.EventType} type The event type.
                     * @param {module:context.EventHandler} handler The event handler.
                     */
                    const addEventHandler = (emitter, type, handler) => {
                        let index, length;
                        // List of listeners
                        if (isArray(handler)) {
                            index = 0;
                            length = handler.length;
                            for (; index < length; index += 1) {
                                addEventListener(emitter, type, handler[index], NaN);
                            }
                            // Single listener
                        } else {
                            addEventListener(emitter, type, handler, NaN);
                        }
                    };
                    /**
                     * @function module:core~addEventHandlers
                     * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
                     * @param {module:context.EventHandlers} mappings The event mapping.
                     */
                    const addEventHandlers = (emitter, mappings, prefixed = false) => {
                        let handler, parts, type;
                        /**
                         * Intentionally using a for-in loop without a hasOwnProperty check in order to
                         * check the prototype chain for mappings
                         */
                        for (const key in mappings) {
                            if (!prefixed) {
                                type = key;
                            } else if ((parts = onMatcher.exec(key))) {
                                // Example: if key = "onChange" then parts = [ "onChange", "Change" ] and type = "change"
                                const capitalizedType = parts[1];
                                type = `${capitalizedType[0].toLowerCase()}${capitalizedType.slice(1)}`;
                            }
                            if (type) {
                                handler = mappings[type];
                                isEventHandler(handler) && addEventHandler(emitter, type, handler);
                            }
                        }
                    };
                    /**
                     * @function module:core~addEventListener
                     * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
                     * @param {module:context.EventType} type The event type.
                     * @param {module:context.EventListener} listener The event callback.
                     * @param {external:number} index
                     */
                    const addEventListener = (emitter, type, listener, index) => {
                        // Define the event registry if it does not exist
                        defineEventsProperty(emitter, (0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)());
                        const _events = emitter[$events];
                        if (_events[':on']) {
                            emitEvent(
                                emitter,
                                ':on',
                                [type, hasListener(listener) ? listener.listener : listener],
                                false
                            );
                            // Emitting "on" may have changed the registry.
                            _events[':on'] = emitter[$events][':on'];
                        }
                        // Single listener
                        if (!_events[type]) {
                            _events[type] = listener;
                            // Multiple listeners
                        } else if (isArray(_events[type])) {
                            switch (isNaN(index) || index) {
                                case true:
                                    _events[type].push(listener);
                                    break;
                                case 0:
                                    _events[type].unshift(listener);
                                    break;
                                default:
                                    _events[type].splice(index, 0, listener);
                                    break;
                            }
                            // Transition from single to multiple listeners
                        } else {
                            _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
                        }
                        emitter[$events] = _events;
                    };
                    /**
                     * @function module:core~defineEventsProperty
                     * @param {*} target The target on which the property will be created.
                     * @param {module:context.EventHandlers} value The initial value of the event map.
                     */
                    const defineEventsProperty = (target, value) => {
                        const hasEvents = hasOwnProperty.call(target, $events),
                            targetPrototype = getPrototypeOf(target);
                        if (!hasEvents || (targetPrototype && target[$events] === targetPrototype[$events])) {
                            defineProperty(target, $events, {
                                value: value,
                                configurable: true,
                                enumerable: false,
                                writable: true,
                            });
                        }
                    };
                    /**
                     * @function module:core~emitAllEvents
                     * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
                     * @param {module:context.EventType} type The event type.
                     * @param {external:Array} data The data to be passed with the event.
                     * @return {external:boolean} Whether or not a listener for the given event type was executed.
                     * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
                     */
                    const emitAllEvents = (emitter, type, data) => {
                        let executed = false,
                            index = typeof type === 'string' ? lastIndexOfColon(type) : -1;
                        // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
                        while (index > 0) {
                            executed = (type && emitEvent(emitter, type, data, false)) || executed;
                            type = type.substring(0, index);
                            index = lastIndexOfColon(type);
                        }
                        // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
                        executed = (type && emitEvent(emitter, type, data, type !== $every)) || executed;
                        return executed;
                    };
                    /**
                     * @function module:core~emitErrors
                     * @param {module:context.EventEmitter} emitter The emitter on which the `errors` will be emitted.
                     * @param {external:Array<Error>} errors The array of errors to be emitted.
                     */
                    const emitErrors = (emitter, errors) => {
                        const length = errors.length;
                        for (let index = 0; index < length; index += 1) {
                            emitEvent(emitter, 'error', [errors[index]], false);
                        }
                    };
                    /**
                     * @function module:core~emitEvent
                     * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
                     * @param {module:context.EventType} type The event type.
                     * @param {external:Array} data The data to be passed with the event.
                     * @param {external:boolean} emitEvery Whether or not listeners for all types will be executed.
                     * @return {external:boolean} Whether or not a listener for the given event type was executed.
                     * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
                     */
                    const emitEvent = (emitter, type, data, emitEvery) => {
                        const _events = emitter[$events],
                            isDefined = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.complement)(
                                _blue_util__WEBPACK_IMPORTED_MODULE_1__.isNil
                            );
                        let executed = false,
                            listener;
                        if (isDefined(_events)) {
                            if (type === 'error' && !_events.error) {
                                if (data[0] instanceof Error) {
                                    throw data[0];
                                } else {
                                    throw new Error('Uncaught, unspecified "error" event.');
                                }
                            }
                            // Execute listeners for the given type of event
                            listener = _events[type];
                            if (isDefined(listener)) {
                                executeHandler(listener, data, emitter);
                                executed = true;
                            }
                            // Execute listeners listening for all types of events
                            if (emitEvery) {
                                listener = _events[$every];
                                if (isDefined(listener)) {
                                    executeHandler(listener, data, emitter);
                                    executed = true;
                                }
                            }
                        }
                        return executed;
                    };
                    /**
                     * @function module:core~eventListenerEquals
                     * @param {module:context.EventListener} l1
                     * @param {module:context.EventListener} l2
                     * @returns {external:boolean} Whether or not the listeners are equal
                     */
                    const eventListenerEquals = (l1, l2) =>
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.either)(
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.equals)(l2),
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.propEq)('listener', l2)
                        )(l1);
                    /**
                     * Executes a listener using the internal `execute*` functions based on the number of arguments.
                     * @function module:core~executeHandler
                     * @param {module:context.EventHandler} handler
                     * @param {external:Array} data
                     * @param {*} scope
                     */
                    const executeHandler = (handler, data, scope) => {
                        const isFn = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.isFunction)(handler);
                        switch (data.length) {
                            case 0:
                                handleEmpty(handler, isFn, scope);
                                break;
                            case 1:
                                handleOne(handler, isFn, scope, data[0]);
                                break;
                            case 2:
                                handleTwo(handler, isFn, scope, data[0], data[1]);
                                break;
                            case 3:
                                handleThree(handler, isFn, scope, data[0], data[1], data[2]);
                                break;
                            default:
                                handleMany(handler, isFn, scope, data);
                                break;
                        }
                    };
                    /**
                     * @function module:core~getEventTypes
                     * @param {module:context.EventEmitter} emitter The emitter on which event types will be retrieved.
                     * @return {external:Array<module:context.EventType>} The list of event types registered to the emitter.
                     */
                    const getEventTypes = (emitter) => keys(emitter[$events]);
                    /**
                     * Execute a listener with no arguments.
                     * @function module:core~handleMany
                     * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
                     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
                     * @param {module:context.EventEmitter} emitter The emitter.
                     */
                    const handleEmpty = (handler, isFunction, emitter) => {
                        const errors = [];
                        if (isFunction) {
                            try {
                                handler.call(emitter);
                            } catch (error) {
                                errors.push(error);
                            }
                        } else {
                            const length = handler.length,
                                listeners = handler.slice();
                            let index = 0;
                            for (; index < length; index += 1) {
                                try {
                                    listeners[index].call(emitter);
                                } catch (error) {
                                    errors.push(error);
                                }
                            }
                        }
                        if (errors.length) {
                            emitErrors(emitter, errors);
                        }
                    };
                    /**
                     * Execute a listener with one argument.
                     * @function module:core~handleOne
                     * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
                     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
                     * @param {module:context.EventEmitter} emitter The emitter.
                     * @param {*} arg1 The first argument.
                     */
                    const handleOne = (handler, isFunction, emitter, arg1) => {
                        const errors = [];
                        if (isFunction) {
                            try {
                                handler.call(emitter, arg1);
                            } catch (error) {
                                errors.push(error);
                            }
                        } else {
                            const length = handler.length,
                                listeners = handler.slice();
                            let index = 0;
                            for (; index < length; index += 1) {
                                try {
                                    listeners[index].call(emitter, arg1);
                                } catch (error) {
                                    errors.push(error);
                                }
                            }
                        }
                        if (errors.length) {
                            emitErrors(emitter, errors);
                        }
                    };
                    /**
                     * Execute a listener with two arguments.
                     * @function module:core~handleTwo
                     * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
                     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
                     * @param {module:context.EventEmitter} emitter The emitter.
                     * @param {*} arg1 The first argument.
                     * @param {*} arg2 The second argument.
                     */
                    const handleTwo = (handler, isFunction, emitter, arg1, arg2) => {
                        const errors = [];
                        if (isFunction) {
                            try {
                                handler.call(emitter, arg1, arg2);
                            } catch (error) {
                                errors.push(error);
                            }
                        } else {
                            const length = handler.length,
                                listeners = handler.slice();
                            let index = 0;
                            for (; index < length; index += 1) {
                                try {
                                    listeners[index].call(emitter, arg1, arg2);
                                } catch (error) {
                                    errors.push(error);
                                }
                            }
                        }
                        if (errors.length) {
                            emitErrors(emitter, errors);
                        }
                    };
                    /**
                     * Execute a listener with three arguments.
                     * @function module:core~handleThree
                     * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
                     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
                     * @param {module:context.EventEmitter} emitter The emitter.
                     * @param {*} arg1 The first argument.
                     * @param {*} arg2 The second argument.
                     * @param {*} arg3 The third argument.
                     */
                    const handleThree = (handler, isFunction, emitter, arg1, arg2, arg3) => {
                        const errors = [];
                        if (isFunction) {
                            try {
                                handler.call(emitter, arg1, arg2, arg3);
                            } catch (error) {
                                errors.push(error);
                            }
                        } else {
                            const length = handler.length,
                                listeners = handler.slice();
                            let index = 0;
                            for (; index < length; index += 1) {
                                try {
                                    listeners[index].call(emitter, arg1, arg2, arg3);
                                } catch (error) {
                                    errors.push(error);
                                }
                            }
                        }
                        if (errors.length) {
                            emitErrors(emitter, errors);
                        }
                    };
                    /**
                     * Execute a listener with four or more arguments.
                     * @function module:core~handleMany
                     * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
                     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
                     * @param {module:context.EventEmitter} emitter The emitter.
                     * @param {external:Array} args Four or more arguments.
                     */
                    const handleMany = (handler, isFunction, emitter, args) => {
                        const errors = [];
                        if (isFunction) {
                            try {
                                handler.apply(emitter, args);
                            } catch (error) {
                                errors.push(error);
                            }
                        } else {
                            const length = handler.length,
                                listeners = handler.slice();
                            let index = 0;
                            for (; index < length; index += 1) {
                                try {
                                    listeners[index].apply(emitter, args);
                                } catch (error) {
                                    errors.push(error);
                                }
                            }
                        }
                        if (errors.length) {
                            emitErrors(emitter, errors);
                        }
                    };
                    /**
                     * Checks whether or not a value is an event handler.
                     * @function module:core~isEventHandler
                     * @param {*} value The value to be tested.
                     * @return {external:boolean} Whether or not the value is an event handler.
                     */
                    const isEventHandler = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.either)(
                        _blue_util__WEBPACK_IMPORTED_MODULE_1__.isFunction,
                        isArray
                    );
                    /**
                     * @function module:core~removeEventListener
                     * @param {module:context.EventEmitter} emitter The emitter from which the listener would be removed.
                     * @param {module:context.EventType} type The event type.
                     * @param {module:context.EventListener} listener The event callback.
                     */
                    const removeEventListener = (emitter, type, listener) => {
                        const handler = emitter[$events][type];
                        if (eventListenerEquals(handler, listener)) {
                            deleteProperty(emitter[$events], type);
                            if (emitter[$events][':off']) {
                                emitEvent(emitter, ':off', [type, listener], false);
                            }
                        } else if (isArray(handler)) {
                            let index = -1;
                            for (let i = handler.length; i-- > 0; ) {
                                if (eventListenerEquals(handler[i], listener)) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1) {
                                if (handler.length === 1) {
                                    handler.length = 0;
                                    deleteProperty(emitter[$events], type);
                                } else {
                                    spliceList(handler, index);
                                }
                                if (emitter[$events][':off']) {
                                    emitEvent(emitter, ':off', [type, listener], false);
                                }
                            }
                        }
                    };
                    /**
                     * Faster than `Array.prototype.splice`
                     * @function module:core~spliceList
                     * @param {external:Array} list
                     * @param {external:number} index
                     */
                    const spliceList = (list, index) => {
                        const length = list.length;
                        let i = index,
                            j = i + 1;
                        for (; j < length; i += 1, j += 1) {
                            list[i] = list[j];
                        }
                        list.pop();
                    };
                    /**
                     * @mixin module:context.AsEventEmitter
                     * @implements module:context.EventEmitter
                     * @returns {module:core.Constructable<module:context.EventEmitter>}
                     * @example
                     * const
                     *  MyEmitter = AsEventEmitter( {} ),
                     *  greeter = new MyEmitter();
                     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
                     * greeter.emtest( 'hello' ); // true
                     * // Hello!
                     */
                    const AsEventEmitter = (superclass) =>
                        class extends superclass {
                            get [Symbol.toStringTag]() {
                                return 'EventEmitter';
                            }
                            /**
                             * Execute the listeners for the specified event `type` with the supplied arguments.
                             *
                             * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
                             *
                             * Returns `true` if the event had listeners, `false` otherwise.
                             * @function module:context.AsEventEmitter#emit
                             * @param {module:context.EventType} type The event type.
                             * @param {...*} [data] The data passed into the listeners.
                             * @return {external:boolean} Whether or not the event had listeners.
                             * @since 1.0.0
                             * @example <caption>Emitting an event</caption>
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', () => console.log( 'Hello!' ) );
                             * greeter.emtest( 'hello' );     // true
                             * // Hello!
                             * greeter.emtest( 'goodbye' );   // false
                             * @example <caption>Emitting an event with data</caption>
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
                             * greeter.emtest( 'hello', 'World' );
                             * // Hello, World!
                             * @example <caption>Emitting a namespaced event</caption>
                             * const greeter = new Emitter();
                             * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
                             * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
                             * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
                             *
                             * // This event will not be triggered by emitting "greeting:hello"
                             * greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );
                             *
                             * greeter.emtest( 'greeting:hi', 'Mark' );
                             * // Hi, Mark!
                             * // Mark was greeted.
                             *
                             * greeter.emtest( 'greeting:hello', 'Jeff' );
                             * // Hello, Jeff!
                             * // Jeff was greeted.
                             */
                            emit(type, ...data) {
                                return emitAllEvents(this, type, data);
                            }
                            /**
                             * @function module:context.AsEventEmitter#eventTypes
                             * @return {external:Array<module:context.EventType>} The list of event types registered to the emitter.
                             * @since 2.0.0
                             * @example
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', () => console.log( `Hello` ) );
                             * greeter.on( 'hi', () => console.log( `Hi` ) );
                             *
                             * console.log( greeter.eventTypes() );
                             * // [ 'hello', 'hi' ]
                             */
                            eventTypes() {
                                return getEventTypes(this);
                            }
                            /**
                             * @function module:context.AsEventEmitter#listenerCount
                             * @param {module:context.EventType} type The event type.
                             * @return {external:number} The number of listeners for that event type within the given emitter.
                             * @since 1.0.0
                             * @example
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', () => console.log( 'Hello!' ) );
                             * console.log( greeter.listenerCount( 'hello' ) );
                             * // 1
                             * console.log( greeter.listenerCount( 'goodbye' ) );
                             * // 0
                             */
                            listenerCount(type) {
                                let count;
                                // Empty
                                if (!this[$events] || !this[$events][type]) {
                                    count = 0;
                                    // Function
                                } else if (typeof this[$events][type] === 'function') {
                                    count = 1;
                                    // Array
                                } else {
                                    count = this[$events][type].length;
                                }
                                return count;
                            }
                            /**
                             * @function module:context.AsEventEmitter#listeners
                             * @param {module:context.EventType} type The event type.
                             * @return {external:number} The number of listeners for that event type within the given emitter.
                             * @since 1.0.0
                             * @example
                             * const hello = function(){
                             *  console.log( 'Hello!' );
                             * },
                             *  greeter = new Emitter();
                             *
                             * greeter.on( 'hello', hello );
                             * greeter.emtest( 'hello' );
                             * // Hello!
                             *
                             * console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
                             * // true
                             */
                            listeners(type) {
                                let listeners;
                                if (!this[$events] || !this[$events][type]) {
                                    listeners = [];
                                } else {
                                    const handler = this[$events][type];
                                    if (typeof handler === 'undefined') {
                                        listeners = [];
                                    } else if (typeof handler === 'function') {
                                        listeners = [handler];
                                    } else {
                                        listeners = handler.slice();
                                    }
                                }
                                return listeners;
                            }
                            /**
                             * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
                             *
                             * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
                             * @function module:context.AsEventEmitter#on
                             * @param {module:context.EventType} [type] The event type.
                             * @param {module:context.EventListener} listener The event callback.
                             * @return {module:context.EventEmitter} The emitter.
                             * @since 1.0.0
                             * @emits {:on} when listeners are added
                             * @example <caption>Listen to all event types</caption>
                             * const greeter = new Emitter();
                             * greeter.on( () => console.log( 'Greeted' ) );
                             * greeter.emtest( 'hello' );
                             * // Greeted
                             * greeter.emtest( 'goodbye' );
                             * // Greeted
                             * @example <caption>Listener to a specified event type</caption>
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
                             * greeter.emtest( 'hello', 'World' );
                             * // Hello, World!
                             * greeter.emtest( 'hi', 'World' );
                             */
                            on(type = $every, listener) {
                                if (typeof listener === 'undefined') {
                                    // Type not provided, fall back to "$every"
                                    if (typeof type === 'function') {
                                        listener = type;
                                        type = $every;
                                        // Plain object of event bindings
                                    } else if (typeof type === 'object') {
                                        addEventHandlers(this, type, false);
                                        return this;
                                    }
                                }
                                addEventListener(this, type, listener, NaN);
                                return this;
                            }
                            /**
                             * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
                             *
                             * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
                             * @function module:context.AsEventEmitter#off
                             * @param {module:context.EventType} type The event type.
                             * @param {module:context.EventListener} listener The event callback.
                             * @return {module:context.EventEmitter} The emitter.
                             * @since 1.0.0
                             * @emits {:off} when listeners are removed
                             * @example <caption>Remove a listener from any event type</caption>
                             * function greet( name ){
                             *  console.log( `Greetings, ${ name }!` );
                             * }
                             *
                             * const greeter = new Emitter();
                             * greeter.on( greet );
                             * greeter.emtest( 'hello' 'Jeff' );
                             * // Greetings, Jeff!
                             * greeter.emtest( 'hi' 'Jeff' );
                             * // Greetings, Jeff!
                             * greeter.off( greet );
                             * greeter.emtest( 'yo', 'Jeff' );
                             * @example <caption>Remove a listener from a specified event type</caption>
                             * function hello( name ){
                             *  console.log( `Hello, ${ name }!` );
                             * }
                             *
                             * const greeter = new Emitter();
                             * greeter.on( 'hello', hello );
                             * greeter.emtest( 'hello', 'Jeff' );
                             * // Hello, Jeff!
                             * greeter.off( 'hello', hello );
                             * greeter.emtest( 'hello', 'Jeff' );
                             */
                            off(type, listener) {
                                // Shift arguments if type is not provided
                                if (typeof type === 'function' && typeof listener === 'undefined') {
                                    listener = type;
                                    type = $every;
                                }
                                if (typeof listener !== 'function') {
                                    throw new TypeError('listener must be a function');
                                }
                                if (!this[$events] || !this[$events][type]) {
                                    return this;
                                }
                                removeEventListener(this, type, listener);
                                return this;
                            }
                        };
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBRUgsT0FBTyxFQUFpQixVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzlHLE9BQU8sRUFBUyxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUF1QnBEOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVGOzs7O0VBSUU7QUFFSDs7Ozs7R0FLRztBQUVIOzs7OztHQUtHO0FBRUgsTUFDSSxPQUFPLEdBQUcsa0JBQWtCLEVBQzVCLE1BQU0sR0FBSSxpQkFBaUIsRUFFM0IsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUQsRUFBRSxjQUFjLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUNyQyxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sRUFDakIsRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBRW5CLFNBQVMsR0FBRyxVQUFVLEVBRXRCLFdBQVcsR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFFLEVBQ2hDLFdBQVcsR0FBRyxXQUFXLENBQUUsVUFBVSxDQUFFLEVBRXZDLGdCQUFnQixHQUFHLFdBQVcsQ0FBRSxHQUFHLENBQWlDLENBQUM7QUFFekU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxZQUFZLENBQUUsSUFBSSxDQUFFLEVBQUUsMEJBQTBCLEVBQUUsUUFB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

                    /***/
                },
                /* 6 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__6__;

                    /***/
                },
                /* 7 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ AbstractEnvironment: () => /* binding */ AbstractEnvironment,
                        /* harmony export */ AsEnvironmentAware: () => /* binding */ AsEnvironmentAware,
                        /* harmony export */ MockEnvironment: () => /* binding */ MockEnvironment,
                        /* harmony export */ StandardEnvironment: () => /* binding */ StandardEnvironment,
                        /* harmony export */ likeEnvironment: () => /* binding */ likeEnvironment,
                        /* harmony export */ likeEnvironmentAware: () => /* binding */ likeEnvironmentAware,
                        /* harmony export */ likeEnvironmentSource: () => /* binding */ likeEnvironmentSource,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _property_resolver__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldSet =
                        (undefined && undefined.__classPrivateFieldSet) ||
                        function (receiver, state, value, kind, f) {
                            if (kind === 'm') throw new TypeError('Private method is not writable');
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a setter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot write private member to an object whose class did not declare it'
                                );
                            return (
                                kind === 'a'
                                    ? f.call(receiver, value)
                                    : f
                                      ? (f.value = value)
                                      : state.set(receiver, value),
                                value
                            );
                        };
                    var __classPrivateFieldGet =
                        (undefined && undefined.__classPrivateFieldGet) ||
                        function (receiver, state, kind, f) {
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a getter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot read private member from an object whose class did not declare it'
                                );
                            return kind === 'm'
                                ? f
                                : kind === 'a'
                                  ? f.call(receiver)
                                  : f
                                    ? f.value
                                    : state.get(receiver);
                        };
                    var _AbstractEnvironment_propertyResolver,
                        _AbstractEnvironment_activeProfiles,
                        _AbstractEnvironment_defaultProfiles;

                    /**
                     * Interface representing the environment in which the current application is running.
                     * Two key aspects of the application environment: **profiles** and **properties**.
                     * A **profile** is a named, logical group of values to be registered with the container only if the given profile is **active**.
                     * The role of the `Environment` with relation to profiles is in determining which profiles (if any) are currently {@link module:context.Environment#activeProfiles|active}, and which profiles (if any) should be {@link module:context.Environment#defaultProfiles|active by default}.
                     * **Properties** may originate from a variety of sources. The role of the environment object with relation to properties is to provide a convenient interface for configuring property sources and resolving properties from them.
                     * Values managed within an {@linkcode module:context.ApplicationContext|ApplicationContext} may register to be {@linkcode module:context.EnvironmentAware|EnvironmentAware} in order to get the profile state and resolve properties directly.
                     * @interface module:context.Environment
                     * @extends module:context.PropertyResolver
                     */
                    /**
                     * The set of profiles explicitly made active for this environment. Profiles are used for creating logical groupings of bean definitions to be registered conditionally, for example based on deployment environment.
                     * If no profiles have explicitly been specified as active, then any {@link module:context.Environment#defaultProfiles|default profiles} will be activated.
                     * @member {external:Array<external:string>} module:context.Environment#activeProfiles
                     * @see {@link module:context.Environment#defaultProfiles}
                     */
                    /**
                     * The set of profiles to be active by default when no active profiles have been set explicitly.
                     * @member {external:Array<external:string>} module:context.Environment#defaultProfiles
                     * @see {@link module:context.Environment#activeProfiles}
                     */
                    /**
                     * @interface module:context.EnvironmentAware
                     * @extends module:factory.Aware
                     */
                    /**
                     * @function module:context.EnvironmentAware#setEnvironment
                     * @param {module:context.Environment} environment The {@linkcode module:context.Environment|Environment} to be set.
                     */
                    /**
                     * @interface module:context.EnvironmentSource
                     */
                    /**
                     * @member {module:context.Environment} module:context.EnvironmentSource#environment
                     */
                    const { defineProperty } = Reflect;
                    class AbstractEnvironment {
                        constructor(propertySources = []) {
                            _AbstractEnvironment_propertyResolver.set(this, void 0);
                            _AbstractEnvironment_activeProfiles.set(this, void 0);
                            _AbstractEnvironment_defaultProfiles.set(this, void 0);
                            __classPrivateFieldSet(this, _AbstractEnvironment_activeProfiles, new Set(), 'f');
                            __classPrivateFieldSet(this, _AbstractEnvironment_defaultProfiles, new Set(), 'f');
                            __classPrivateFieldSet(
                                this,
                                _AbstractEnvironment_propertyResolver,
                                new _property_resolver__WEBPACK_IMPORTED_MODULE_2__.PrototypalPropertyResolver(
                                    propertySources
                                ),
                                'f'
                            );
                        }
                        get propertySources() {
                            return __classPrivateFieldGet(this, _AbstractEnvironment_propertyResolver, 'f')
                                .propertySources;
                        }
                        set propertySources(propertySources) {
                            __classPrivateFieldGet(this, _AbstractEnvironment_propertyResolver, 'f').propertySources =
                                propertySources;
                        }
                        get [((_AbstractEnvironment_propertyResolver = new WeakMap()),
                        (_AbstractEnvironment_activeProfiles = new WeakMap()),
                        (_AbstractEnvironment_defaultProfiles = new WeakMap()),
                        Symbol.toStringTag)]() {
                            return `Environment:${[...__classPrivateFieldGet(this, _AbstractEnvironment_activeProfiles, 'f')].join(',')}`;
                        }
                        get activeProfiles() {
                            return [...__classPrivateFieldGet(this, _AbstractEnvironment_activeProfiles, 'f')];
                        }
                        set activeProfiles(profiles) {
                            const activeProfiles = __classPrivateFieldGet(
                                this,
                                _AbstractEnvironment_activeProfiles,
                                'f'
                            );
                            activeProfiles.size && activeProfiles.clear();
                            profiles.forEach(activeProfiles.add, activeProfiles);
                        }
                        get defaultProfiles() {
                            return [...__classPrivateFieldGet(this, _AbstractEnvironment_defaultProfiles, 'f')];
                        }
                        set defaultProfiles(profiles) {
                            const defaultProfiles = __classPrivateFieldGet(
                                this,
                                _AbstractEnvironment_defaultProfiles,
                                'f'
                            );
                            defaultProfiles.size && defaultProfiles.clear();
                            profiles.forEach(defaultProfiles.add, defaultProfiles);
                        }
                        addActiveProfile(profile) {
                            __classPrivateFieldGet(this, _AbstractEnvironment_activeProfiles, 'f').add(profile);
                        }
                        hasProperty(key) {
                            return __classPrivateFieldGet(this, _AbstractEnvironment_propertyResolver, 'f').hasProperty(
                                key
                            );
                        }
                        getProperty(key, defaultValue) {
                            return __classPrivateFieldGet(this, _AbstractEnvironment_propertyResolver, 'f').getProperty(
                                key,
                                defaultValue
                            );
                        }
                        getRequiredProperty(key) {
                            return __classPrivateFieldGet(
                                this,
                                _AbstractEnvironment_propertyResolver,
                                'f'
                            ).getRequiredProperty(key);
                        }
                        merge(environment) {
                            if (environment.propertySources.length) {
                                const propertySources = this.propertySources.concat(environment.propertySources);
                                this.propertySources = propertySources;
                            }
                            environment.activeProfiles.length &&
                                environment.activeProfiles.forEach((profile) => this.addActiveProfile(profile));
                            environment.defaultProfiles.length &&
                                environment.defaultProfiles.forEach((profile) => this.defaultProfiles.push(profile));
                        }
                        _isActiveProfile(profile) {
                            return __classPrivateFieldGet(this, _AbstractEnvironment_activeProfiles, 'f').has(profile);
                        }
                    }
                    /**
                     * Base class for {@linkcode module:context.Environment|Environment} implementations.
                     * @abstract
                     * @class module:context.AbstractEnvironment
                     * @implements module:context.Environment
                     */
                    /**
                     * @mixin module:context.AsEnvironmentAware
                     * @implements module:context.EnvironmentAware
                     * @returns {module:context.Constructable<module:context.EnvironmentAware>}
                     */
                    const AsEnvironmentAware = (superclass) =>
                        class extends (0, _blue_factory__WEBPACK_IMPORTED_MODULE_1__.AsAware)(superclass) {
                            setEnvironment(environment) {
                                defineProperty(this, 'environment', {
                                    value: environment,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                        };
                    /**
                     * @function module:context.likeEnvironment
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Environment|Environment}
                     */
                    const likeEnvironment = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.both)(
                        _property_resolver__WEBPACK_IMPORTED_MODULE_2__.likePropertyResolver,
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
                            activeProfiles: Array,
                            defaultProfiles: Array,
                            addActiveProfile: Function,
                        })
                    );
                    /**
                     * @function module:context.likeEnvironmentAware
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentAware|EnvironmentAware}
                     */
                    const likeEnvironmentAware = (0, _blue_factory__WEBPACK_IMPORTED_MODULE_1__.likeAwareAnd)(
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ setEnvironment: Function })
                    );
                    const hasEnvironmentProperty = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.propSatisfies)(
                        likeEnvironment,
                        'environment'
                    );
                    /**
                     * @function module:context.likeEnvironmentSource
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentSource|EnvironmentSource}
                     */
                    const likeEnvironmentSource = (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.both)(
                        (0, _blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_0__.isNil
                        ),
                        hasEnvironmentProperty
                    );
                    class MockEnvironment extends AbstractEnvironment {}
                    class StandardEnvironment extends AbstractEnvironment {}
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7O0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDMUUsT0FBTyxFQUFFLE9BQU8sRUFBUyxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFnQyxvQkFBb0IsRUFBb0IsMEJBQTBCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQXNCdkk7Ozs7Ozs7OztHQVNHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFnQixtQkFBbUI7SUFxQ3JDLFlBQWEsa0JBQWdDLEVBQUU7UUFwQy9DLHdEQUFnRDtRQUNoRCxzREFBNkI7UUFDN0IsdURBQThCO1FBbUMxQix1QkFBQSxJQUFJLHVDQUFtQixJQUFJLEdBQUcsRUFBVSxNQUFBLENBQUM7UUFDekMsdUJBQUEsSUFBSSx3Q0FBb0IsSUFBSSxHQUFHLEVBQVUsTUFBQSxDQUFDO1FBQzFDLHVCQUFBLElBQUkseUNBQXFCLElBQUksMEJBQTBCLENBQUUsZUFBZSxDQUFFLE1BQUEsQ0FBQztJQUMvRSxDQUFDO0lBcENELElBQUksZUFBZTtRQUNmLE9BQU8sdUJBQUEsSUFBSSw2Q0FBa0IsQ0FBQyxlQUFlLENBQUM7SUFDbEQsQ0FBQztJQUVELElBQUksZUFBZSxDQUFFLGVBQWU7UUFDaEMsdUJBQUEsSUFBSSw2Q0FBa0IsQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLG9LQUFFLE1BQU0sQ0FBQyxX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

                    /***/
                },
                /* 8 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ PrototypalPropertyResolver: () => /* binding */ PrototypalPropertyResolver,
                        /* harmony export */ likePropertyResolver: () => /* binding */ likePropertyResolver,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
                    /* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_parser__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_2___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_2__);
                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldGet =
                        (undefined && undefined.__classPrivateFieldGet) ||
                        function (receiver, state, kind, f) {
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a getter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot read private member from an object whose class did not declare it'
                                );
                            return kind === 'm'
                                ? f
                                : kind === 'a'
                                  ? f.call(receiver)
                                  : f
                                    ? f.value
                                    : state.get(receiver);
                        };
                    var __classPrivateFieldSet =
                        (undefined && undefined.__classPrivateFieldSet) ||
                        function (receiver, state, value, kind, f) {
                            if (kind === 'm') throw new TypeError('Private method is not writable');
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a setter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot write private member to an object whose class did not declare it'
                                );
                            return (
                                kind === 'a'
                                    ? f.call(receiver, value)
                                    : f
                                      ? (f.value = value)
                                      : state.set(receiver, value),
                                value
                            );
                        };
                    var _PrototypalPropertyResolver_propertySources;

                    /**
                     * Interface for resolving properties against any underlying source.
                     * @interface module:context.PropertyResolver
                     */
                    /**
                     * Return whether the given property key is available for resolution.
                     * @function module:context.PropertyResolver#hasProperty
                     * @param {external:string} key The property name to resolve
                     * @returns {external:boolean}
                     */
                    /**
                     * Return the property value associated with the given `key` or `defaultValue`, if provided, and the key cannot be resolved.
                     * @function module:context.PropertyResolver#getProperty
                     * @param {external:string} key The property name to resolve
                     * @param {T} [defaultValue] The default value to return if no value is found
                     * @returns {T}
                     */
                    /**
                     * Return the property value associated with the given `key` or throw an error if it cannot be resolved.
                     * @function module:context.PropertyResolver#getRequiredProperty
                     * @param {external:string} key The property name to resolve
                     * @returns {T}
                     * @throws {external:Error} If the property cannot be resolved.
                     */
                    /**
                     * @interface module:context.ConfigurablePropertyResolver
                     * @extends module:context.PropertyResolver
                     */
                    const { defineProperty, getPrototypeOf, setPrototypeOf } = Reflect,
                        pathIsDefined = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.pathSatisfies)(
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.complement)(
                                _blue_util__WEBPACK_IMPORTED_MODULE_2__.isNil
                            )
                        ),
                        linkPrototype = (current, next) => {
                            setPrototypeOf(next, null);
                            setPrototypeOf(current, next);
                            return getPrototypeOf(current);
                        },
                        toPrototypeChain = (list) => {
                            const data = (0, _blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)();
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.reduce)(linkPrototype, data)(list);
                            return data;
                        };
                    /**
                     * @function module:context.likePropertyResolver
                     * @param {*} value The value to be tested.
                     * @return {external:boolean} Whether or not the value is like a {@linkcode module:context.PropertyResolver|PropertyResolver}.
                     */
                    const likePropertyResolver = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.like)({
                        getProperty: Function,
                        getRequiredProperty: Function,
                        hasProperty: Function,
                    });
                    /**
                     * @class module:context.PrototypalPropertyResolver
                     * @implements module:context.PropertyResolver
                     */
                    class PrototypalPropertyResolver {
                        constructor(propertySources) {
                            /**
                             * @member {module:core.JSONObject} module:context.PrototypalPropertyResolver#properties
                             */
                            _PrototypalPropertyResolver_propertySources.set(this, void 0);
                            this.propertySources = propertySources;
                        }
                        /**
                         * @member {external:Array<module:core.JSONObject>} module:context.PrototypalPropertyResolver#propertySources
                         */
                        get propertySources() {
                            return __classPrivateFieldGet(this, _PrototypalPropertyResolver_propertySources, 'f');
                        }
                        set propertySources(propertySources) {
                            __classPrivateFieldSet(
                                this,
                                _PrototypalPropertyResolver_propertySources,
                                propertySources,
                                'f'
                            );
                            defineProperty(this, 'properties', {
                                value:
                                    propertySources.length === 1
                                        ? propertySources[0]
                                        : toPrototypeChain(propertySources),
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        /**
                         * @function module:context.PrototypalPropertyResolver#getProperty
                         * @param {external:string} key
                         * @param {module:core.JSONValue} [defaultValue]
                         * @returns {module:core.JSONValue}
                         */
                        getProperty(key, defaultValue) {
                            var _a;
                            const keypath = _blue_parser__WEBPACK_IMPORTED_MODULE_1__.keypathExpression.run(key).result;
                            return keypath
                                ? (_a = (0, _blue_util__WEBPACK_IMPORTED_MODULE_2__.path)(keypath, this.properties)) !==
                                      null && _a !== void 0
                                    ? _a
                                    : defaultValue
                                : defaultValue;
                        }
                        /**
                         * @function module:context.PrototypalPropertyResolver#getRequiredProperty
                         * @param {external:string} key
                         * @returns {module:core.JSONValue}
                         */
                        getRequiredProperty(key) {
                            const value = this.getProperty(key);
                            if (typeof value === 'undefined') {
                                throw new Error(`Required property "${key}" missing`);
                            }
                            return value;
                        }
                        /**
                         * @function module:context.PrototypalPropertyResolver#hasProperty
                         * @param {external:string} key
                         * @returns {external:boolean}
                         */
                        hasProperty(key) {
                            const keypath = _blue_parser__WEBPACK_IMPORTED_MODULE_1__.keypathExpression.run(key).result;
                            return keypath ? pathIsDefined(keypath, this.properties) : false;
                        }
                    }
                    _PrototypalPropertyResolver_propertySources = new WeakMap();
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvcGVydHktcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7O0FBRUgsT0FBTyxFQUF5QixVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDL0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ2pELE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxNQUFNLFlBQVksQ0FBQztBQVlsRjs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7R0FHRztBQUVILE1BQ0ksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUQsYUFBYSxHQUFHLGFBQWEsQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLENBQUUsRUFFcEQsYUFBYSxHQUFHLENBQUUsT0FBTyxFQUFFLElBQUksRUFBRyxFQUFFO0lBQ2hDLGNBQWMsQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFFLENBQUM7SUFDN0IsY0FBYyxDQUFFLE9BQU8sRUFBRSxJQUFJLENBQUUsQ0FBQztJQUNoQyxPQUFPLGNBQWMsQ0FBRSxPQUFPLENBQUUsQ0FBQztBQUNyQyxDQUFDLEVBRUQsZ0JBQWdCLEdBQUcsQ0FBRSxJQUFrQixFQUFlLEVBQUU7SUFDcEQsTUFBTSxJQUFJLEdBQWUsVUFBVSxFQUFFLENBQUM7SUFDdEMsTUFBTSxDQUFFLGFBQWEsRUFBRSxJQUFJLENBQUUsQ0FBRSxJQUFJLENBQUUsQ0FBQztJQUN0QyxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDLENBQUM7QUFFTjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFFLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUE0QyxDQUFDO0FBRXRLOzs7R0FHRztBQUNILE1BQU0sT0FBTywwQkFBMEI7SUFxQm5DLFlBQWEsZUFBNkI7UUFDdEM7O1dBRUc7UUF2QlAsOERBQStCO1FBeUIzQixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztJQUMzQyxDQUFDO0lBdkJEOztPQUVHO0lBQ0gsSUFBSSxlQUFlO1FBQ2YsT0FBTyx1QkFBQSxJQUFJLG1EQUFpQixDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLGVBQWUsQ0FBRSxlQUFlO1FBQ2hDLHVCQUFBLElBQUksK0NBQW9CLGVBQWUsTUFBQSxDQUFDO1FBQ3hDLGNBQWMsQ0FBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBRSxlQUFlLENBQUU7WUFDaEcsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztJQVVEOzs7OztPQUtHO0lBQ0gsV0FBVyxDQUFFLEdBQVcsRUFBRSxZQUF3Qjs7UUFDOUMsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFFLEdBQUcsQ0FBRSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBQSxJQUFJLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUUsbUNBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDckYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxtQkFBbUIsQ0FBRSxHQUFXO1FBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsR0FBRyxDQUFFLENBQUM7UUFDdEMsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBRSxzQkFBdUIsR0FBSSxXQUFXLENBQUUsQ0FBQztTQUM3RDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFFLEdBQVc7UUFDcEIsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFFLEdBQUcsQ0FBRSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN2RSxDQUFDO0NBQ0oifQ==

                    /***/
                },
                /* 9 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__9__;

                    /***/
                },
                /* 10 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ AsModuleResourceLoader: () => /* binding */ AsModuleResourceLoader,
                        /* harmony export */ AsResourceLoaderAware: () => /* binding */ AsResourceLoaderAware,
                        /* harmony export */ DefaultResourceLoader: () => /* binding */ DefaultResourceLoader,
                        /* harmony export */ URLResource: () => /* binding */ URLResource,
                        /* harmony export */ UnresolvedResource: () => /* binding */ UnresolvedResource,
                        /* harmony export */ likeResource: () => /* binding */ likeResource,
                        /* harmony export */ likeResourceLoader: () => /* binding */ likeResourceLoader,
                        /* harmony export */ likeResourceLoaderAware: () => /* binding */ likeResourceLoaderAware,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_2__);
                    /**
                     * @author Jeff Rose
                     */

                    /**
                     * Interface for a resource descriptor that abstracts from the actual type of underlying resource, such as a file.
                     * @interface module:context.Resource
                     */
                    /**
                     * Strategy interface for loading resources (e.g. file system resources). An {@linkcode module:context.ApplicationContext|ApplicationContext} is required to provide this functionality.
                     *
                     * Value properties of type Resource and Resource array can be populated from Strings when running in an ApplicationContext, using the particular context's resource loading strategy.
                     * @interface module:context.ResourceLoader
                     */
                    /**
                     * Interface to be implemented by any object that wishes to be notified of the {@linkcode module:context.ResourceLoader|ResourceLoader} (typically the {@linkcode module:context.ApplicationContext|ApplicationContext}) that it runs in. This is an alternative to a full ApplicationContext dependency via the {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} interface.
                     *
                     * You typically need a ResourceLoader when your application object has to access a variety of file resources whose names are calculated. A good strategy is to make the object use a {@linkcode module:context.DefaultResourceLoader|DefaultResourceLoader} but still implement ResourceLoaderAware to allow for overriding when running in an ApplicationContext.
                     * @interface module:context.ResourceLoaderAware
                     * @extends module:context.Aware
                     */
                    /**
                     * Return a Resource handle for the specified resource location.
                     *
                     * Note that a Resource handle does not imply an existing resource; you need to invoke {@linkcode module:context.Resource#exists|Resource#exists} to check for existence.
                     * @function module:context.ResourceLoader#getResource
                     * @param {external:string} location The resource location
                     * @returns {module:context.Resource} A resource handle for the specified resource location.
                     */
                    const { defineProperty } = Reflect,
                        startsWithProtocol = /^(?:[a-z]+:)?\/\//i,
                        isAbsoluteURL = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.test)(startsWithProtocol);
                    /**
                     * @mixin module:context.AsResourceLoaderAware
                     * @implements module:context.ResourceLoaderAware
                     * @returns {module:context.Constructable<module:context.ResourceLoaderAware>}
                     */
                    const AsResourceLoaderAware = (superclass) =>
                        class extends (0, _blue_factory__WEBPACK_IMPORTED_MODULE_0__.AsAware)(superclass) {
                            setResourceLoader(loader) {
                                defineProperty(this, 'loader', {
                                    value: loader,
                                    configurable: true,
                                    enumerable: false,
                                    writable: false,
                                });
                            }
                        };
                    /**
                     * @function module:context.likeResource
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Resource|Resource}
                     */
                    const likeResource = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ exists: Boolean });
                    /**
                     * @function module:context.likeResourceLoader
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoader|ResourceLoader}
                     */
                    const likeResourceLoader = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({
                        getResource: Function,
                    });
                    /**
                     * @function module:context.likeResourceLoaderAware
                     * @param {*} value The value to be tested
                     * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}
                     */
                    const likeResourceLoaderAware = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({
                        setResourceLoader: Function,
                    });
                    /**
                     * @class module:context.URLResource
                     */
                    class URLResource {
                        constructor(path, value) {
                            const url = isAbsoluteURL(path) ? new URL(path) : new URL(path, location.href);
                            // If there is no file extension, assume it's JavaScript
                            if (url.pathname.lastIndexOf('.') === -1) {
                                url.pathname += '.js';
                            }
                            defineProperty(this, 'url', {
                                value: url,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'value', {
                                value: value,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        get exists() {
                            return true;
                        }
                    }
                    /**
                     * @class module:context.UnresolvedResource
                     * @implements module:context.Resource
                     */
                    class UnresolvedResource {
                        constructor(path, value) {
                            defineProperty(this, 'path', {
                                value: path,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'value', {
                                value: value,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        get exists() {
                            return false;
                        }
                    }
                    /**
                     * @mixin module:context.AsModuleResourceLoader
                     * @implements module:context.ResourceLoader
                     */
                    const AsModuleResourceLoader = (superclass) =>
                        class extends superclass {
                            async getResource(location) {
                                try {
                                    const value = await __webpack_require__(11)(location);
                                    return new URLResource(location, value);
                                } catch (error) {
                                    throw new UnresolvedResource(location, error);
                                }
                            }
                        };
                    /**
                     * @class module:context.DefaultResourceLoader
                     * @mixes module:context.AsModuleResourceLoader
                     */
                    class DefaultResourceLoader extends AsModuleResourceLoader(
                        _blue_core__WEBPACK_IMPORTED_MODULE_2__.Null
                    ) {}
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLE9BQU8sRUFBUyxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUV4QyxPQUFPLEVBQWlCLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQWVqRDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7Ozs7O0dBT0c7QUFFSCxNQUNJLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUU1QixrQkFBa0IsR0FBRyxvQkFBb0IsRUFFekMsYUFBYSxHQUFHLElBQUksQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRS9DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxDQUEyQixVQUFhLEVBQTJDLEVBQUUsQ0FBQyxLQUFNLFNBQVEsT0FBTyxDQUFFLFVBQVUsQ0FBRTtJQUcxSixpQkFBaUIsQ0FBRSxNQUFzQjtRQUNyQyxjQUFjLENBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUM1QixLQUFLLEVBQUUsTUFBTTtZQUNiLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7Q0FDSixDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQW9DLENBQUM7QUFFMUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBRSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBMEMsQ0FBQztBQUU1Rzs7OztHQUlHO0FBQ0gsTUFBTSxD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

                    /***/
                },
                /* 11 */
                /***/ (module) => {
                    function webpackEmptyAsyncContext(req) {
                        // Here Promise.resolve().then() is used instead of new Promise() to prevent
                        // uncaught exception popping up in devtools
                        return Promise.resolve().then(() => {
                            var e = new Error("Cannot find module '" + req + "'");
                            e.code = 'MODULE_NOT_FOUND';
                            throw e;
                        });
                    }
                    webpackEmptyAsyncContext.keys = () => [];
                    webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
                    webpackEmptyAsyncContext.id = 11;
                    module.exports = webpackEmptyAsyncContext;

                    /***/
                },
                /* 12 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ ConfigurationProcessor: () => /* binding */ ConfigurationProcessor,
                        /* harmony export */ MetadataConfigApplicationContext: () =>
                            /* binding */ MetadataConfigApplicationContext,
                        /* harmony export */ configuration: () => /* binding */ configuration,
                        /* harmony export */ entry: () => /* binding */ entry,
                        /* harmony export */ profile: () => /* binding */ profile,
                        /* harmony export */ property: () => /* binding */ property,
                        /* harmony export */ propertySource: () => /* binding */ propertySource,
                        /* harmony export */
                    });
                    /* harmony import */ var _node_modules_reflect_metadata_Reflect__WEBPACK_IMPORTED_MODULE_0__ =
                        __webpack_require__(13);
                    /* harmony import */ var _node_modules_reflect_metadata_Reflect__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(
                            _node_modules_reflect_metadata_Reflect__WEBPACK_IMPORTED_MODULE_0__
                        );
                    /* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
                    /* harmony import */ var _environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
                    /* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_4___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_4__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_5___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_5__);
                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldSet =
                        (undefined && undefined.__classPrivateFieldSet) ||
                        function (receiver, state, value, kind, f) {
                            if (kind === 'm') throw new TypeError('Private method is not writable');
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a setter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot write private member to an object whose class did not declare it'
                                );
                            return (
                                kind === 'a'
                                    ? f.call(receiver, value)
                                    : f
                                      ? (f.value = value)
                                      : state.set(receiver, value),
                                value
                            );
                        };
                    var __classPrivateFieldGet =
                        (undefined && undefined.__classPrivateFieldGet) ||
                        function (receiver, state, kind, f) {
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a getter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot read private member from an object whose class did not declare it'
                                );
                            return kind === 'm'
                                ? f
                                : kind === 'a'
                                  ? f.call(receiver)
                                  : f
                                    ? f.value
                                    : state.get(receiver);
                        };
                    var _MetadataConfigApplicationContext_configurationParser;

                    const { defineMetadata, defineProperty, getMetadata, getOwnPropertyDescriptor, hasMetadata } =
                            Reflect,
                        { isArray } = Array,
                        CONFIG_CONSTRUCTOR = 'config:constructor',
                        CONFIG_PROFILE = 'config:profile',
                        CONFIG_PROPERTY = 'config:property',
                        CONFIG_PROPERTY_SOURCE = 'config:property:source',
                        CONFIG_ENTRY = 'config:entry',
                        defineConfigurationMetadata = (target) => defineMetadata(CONFIG_CONSTRUCTOR, true, target),
                        defineProfileMetadata = (value, target, propertyKey) =>
                            defineMetadata(
                                CONFIG_PROFILE,
                                isArray(value) ? value : value.split(','),
                                target,
                                propertyKey
                            ),
                        definePropertyMetadata = (value, target, propertyKey) =>
                            defineMetadata(CONFIG_PROPERTY, value, target, propertyKey),
                        definePropertySourceMetadata = (value, target) => {
                            if (isArray(value)) {
                                defineMetadata(CONFIG_PROPERTY_SOURCE, value, target);
                            } else {
                                throw new TypeError('value must be an array of JSON objects');
                            }
                        },
                        defineEntryMetadata = (value, target, propertyKey) =>
                            defineMetadata(CONFIG_ENTRY, value, target, propertyKey),
                        getProfileMetadata = (target, propertyKey) => getMetadata(CONFIG_PROFILE, target, propertyKey),
                        getPropertyMetadata = (target, propertyKey) =>
                            getMetadata(CONFIG_PROPERTY, target, propertyKey),
                        getPropertySourceMetadata = (target) => getMetadata(CONFIG_PROPERTY_SOURCE, target),
                        getEntryMetadata = (target, propertyKey) => getMetadata(CONFIG_ENTRY, target, propertyKey),
                        hasConfigurationMetadata = (target) => hasMetadata(CONFIG_CONSTRUCTOR, target),
                        hasProfileMetadata = (target, propertyKey) => hasMetadata(CONFIG_PROFILE, target, propertyKey),
                        hasPropertyMetadata = (target, propertyKey) =>
                            hasMetadata(CONFIG_PROPERTY, target, propertyKey),
                        hasPropertySourceMetadata = (target) => hasMetadata(CONFIG_PROPERTY_SOURCE, target),
                        hasEntryMetadata = (target, propertyKey) => hasMetadata(CONFIG_ENTRY, target, propertyKey),
                        splitOnComma = (0, _blue_util__WEBPACK_IMPORTED_MODULE_5__.split)(','),
                        toUniqueArray = (0, _blue_util__WEBPACK_IMPORTED_MODULE_5__.pipe)(
                            splitOnComma,
                            _blue_util__WEBPACK_IMPORTED_MODULE_5__.uniq
                        );
                    /**
                     * Indicates that a class declares one or more {@linkcode module:context.@entry|@entry} methods and may be processed to provide the method results at runtime. For example:
                     * ```javascript
                     * &#064;Configuration
                     * class FooBarConfig {
                     *  &#064;Value
                     *  foo(){
                     *      return 'foo';
                     *  }
                     *  &#064;Value
                     *  bar(){
                     *      return new Bar();
                     *  }
                     * }
                     * ```
                     * {@linkcode module:context.@configuration|@configuration} classes are bootstrapped using the {@linkcode module:context.MetadataConfigApplicationContext|MetadataConfigApplicationContext}.
                     * ```javascript
                     * const context = new MetadataConfigApplicationContext( 'foobar' );
                     * context.register( FooBarConfig );
                     * context.getValue( 'foo' ); // "foo"
                     * ```
                     * @const {external:ClassDecorator} module:context.@configuration
                     * @see {@linkcode module:context.MetadataConfigApplicationContext|MetadataConfigApplicationContext}
                     */
                    const configuration = (target) => {
                        if (!hasConfigurationMetadata(target)) {
                            defineConfigurationMetadata(target);
                        }
                        return target;
                    };
                    /**
                     * @function module:context.@profile
                     * @param {external:string} name
                     * @returns {external:ClassDecorator}
                     */
                    const profile = (name) => (target, propertyKey, descriptor) => {
                        defineProfileMetadata(toUniqueArray(name), target, propertyKey);
                        if (propertyKey && !descriptor) {
                            descriptor = getOwnPropertyDescriptor(target, propertyKey);
                        }
                        return propertyKey ? descriptor : target;
                    };
                    /**
                     * @function module:context.@property
                     * @param {external:string} path
                     * @returns {external:ClassDecorator}
                     */
                    const property = (path) => (target, propertyKey) => {
                        definePropertyMetadata(path, target, propertyKey);
                        defineProperty(target, propertyKey, {
                            value: null,
                            configurable: true,
                            enumerable: true,
                            writable: false,
                        });
                    };
                    /**
                     * @function module:context.@propertySource
                     * @param {module:core.JSONObject | module:core.Enumerable<external:string,module:core.JSONValue>} propertySource
                     * @returns {external:ClassDecorator}
                     */
                    const propertySource = (propertySource) => (target) => {
                        let ps;
                        if ((0, _blue_core__WEBPACK_IMPORTED_MODULE_4__.likeEnumerable)(propertySource)) {
                            ps = (0, _blue_core__WEBPACK_IMPORTED_MODULE_4__.createNull)();
                            propertySource.forEach((value, key) => (ps[key] = value));
                        } else {
                            ps = propertySource;
                        }
                        if (hasPropertySourceMetadata(target)) {
                            const propertySources = getPropertySourceMetadata(target);
                            propertySources.unshift(ps);
                            definePropertySourceMetadata(propertySources, target);
                        } else {
                            definePropertySourceMetadata([ps], target);
                        }
                        return target;
                    };
                    /**
                     * @const {external:MethodDecorator | external:Function} module:context.@entry
                     */
                    const entry = (targetOrKey, propertyKey, descriptor) => {
                        // Called as a Function
                        if (typeof targetOrKey === 'string') {
                            return (target, propertyKey, descriptor) => {
                                defineEntryMetadata(targetOrKey, target, propertyKey);
                                if (!descriptor) {
                                    descriptor = getOwnPropertyDescriptor(target, propertyKey);
                                }
                                if (!descriptor.enumerable) {
                                    descriptor.enumerable = true;
                                }
                                return descriptor;
                            };
                            // Called as a Decorator
                        } else {
                            defineEntryMetadata(propertyKey, targetOrKey, propertyKey);
                            if (!descriptor) {
                                descriptor = getOwnPropertyDescriptor(targetOrKey, propertyKey);
                            }
                            if (!descriptor.enumerable) {
                                descriptor.enumerable = true;
                            }
                            return descriptor;
                        }
                    };
                    /**
                     * @classdesc
                     * Parses a {@linkcode module:context.@configuration|@configuration} class definition.
                     * @class module:context~ConfigurationClassParser
                     * @see {@link module:context.MetadataConfigApplicationContext}
                     */
                    class ConfigurationParser {
                        constructor(registry, environment) {
                            defineProperty(this, 'registry', {
                                value: registry,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                            defineProperty(this, 'environment', {
                                value: environment,
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            });
                        }
                        parse(candidates) {
                            const length = candidates.length;
                            let index = 0;
                            for (; index < length; index++) {
                                const configClass = candidates[index];
                                if (hasConfigurationMetadata(configClass)) {
                                    if (
                                        !hasProfileMetadata(configClass) ||
                                        this._isActiveProfile(getProfileMetadata(configClass))
                                    ) {
                                        const config = new configClass();
                                        if (hasPropertySourceMetadata(configClass)) {
                                            const propertySource = getPropertySourceMetadata(configClass);
                                            this.processPropertySource(propertySource);
                                            this.processProperty(config);
                                        }
                                        this.processConfiguration(config);
                                    }
                                }
                            }
                        }
                        /**
                         * Process the given `@configuration` decorator metadata.
                         * @function module:context~ConfigurationClassParser#processConfiguration
                         */
                        processConfiguration(configuration) {
                            for (const key in configuration) {
                                if (
                                    !hasProfileMetadata(configuration, key) ||
                                    this._isActiveProfile(getProfileMetadata(configuration, key))
                                ) {
                                    if (hasEntryMetadata(configuration, key)) {
                                        const name = getEntryMetadata(configuration, key);
                                        this.processEntry(name, configuration[key].bind(configuration));
                                    }
                                }
                            }
                        }
                        /**
                         * Process the given `@property` decorator metadata.
                         * @function module:context~ConfigurationClassParser#processProperty
                         */
                        processProperty(configuration) {
                            for (const key in configuration) {
                                if (hasPropertyMetadata(configuration, key)) {
                                    const path = getPropertyMetadata(configuration, key),
                                        value = this.environment.getProperty(path);
                                    defineProperty(configuration, key, {
                                        value: value,
                                        configurable: true,
                                        enumerable: false,
                                        writable: false,
                                    });
                                }
                            }
                        }
                        /**
                         * Process the given `@propertySource` decorator metadata.
                         * @function module:context~ConfigurationClassParser#processPropertySource
                         */
                        processPropertySource(propertySource) {
                            this.environment.propertySources = propertySource;
                        }
                        /**
                         * Process the given `@entry` decorator metadata.
                         * @function module:context~ConfigurationClassParser#processValue
                         */
                        processEntry(name, value) {
                            this.registry.setValue(name, value());
                        }
                        /**
                         * @private
                         * @function module:context~ConfigurationClassParser#_isActiveProfile
                         * @param {external:Array<external:string>} profiles
                         * @returns {external:boolean} Whether or not the profiles provided are active
                         */
                        _isActiveProfile(profiles) {
                            const activeProfiles = this.environment.activeProfiles,
                                length = profiles.length;
                            let index = 0;
                            for (; index < length; index++) {
                                if (activeProfiles.indexOf(profiles[index]) !== -1) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }
                    /**
                     * @classdesc
                     * A {@linkcode module:factory.EntryRegistryProcessor|EntryRegistryProcessor} used for processing of {@linkcode module:context.@configuration|@configuration} classes.
                     * This processor should be prioritized as it is important that any {@linkcode module:context.@entry|@entry} methods declared in the `@configuration` classes have their values registered before any other {@linkcode module:factory.EntryProcessor|EntryProcessor} executes.
                     * @class module:context.ConfigurationProcessor
                     * @mixes module:context.AsEnvironmentAware
                     * @mixes module:context.AsResourceLoaderAware
                     * @implements module:factory.EntryRegistryProcessor
                     * @implements module:context.EnvironmentAware
                     * @implements module:context.ResourceLoaderAware
                     */
                    class ConfigurationProcessor extends (0,
                    _resource__WEBPACK_IMPORTED_MODULE_3__.AsResourceLoaderAware)(
                        (0, _environment__WEBPACK_IMPORTED_MODULE_2__.AsEnvironmentAware)(
                            _blue_core__WEBPACK_IMPORTED_MODULE_4__.Null
                        )
                    ) {
                        processEntryRegistry(registry) {
                            if (!this.environment) {
                                this.environment = new _environment__WEBPACK_IMPORTED_MODULE_2__.StandardEnvironment();
                            }
                            const parser = new ConfigurationParser(registry, this.environment);
                            parser.parse([registry]);
                        }
                    }
                    /**
                     * @class module:context.MetadataConfigApplicationContext
                     * @extends module:context.GenericApplicationContext
                     */
                    class MetadataConfigApplicationContext extends _context__WEBPACK_IMPORTED_MODULE_1__.GenericApplicationContext {
                        constructor(name) {
                            super(name);
                            _MetadataConfigApplicationContext_configurationParser.set(this, void 0);
                            __classPrivateFieldSet(
                                this,
                                _MetadataConfigApplicationContext_configurationParser,
                                new ConfigurationParser(this, this.environment),
                                'f'
                            );
                        }
                        /**
                         * @function module:context.MetadataConfigApplicationContext#register
                         * @param {Object} configClass The configuration class
                         */
                        register(configClass) {
                            __classPrivateFieldGet(
                                this,
                                _MetadataConfigApplicationContext_configurationParser,
                                'f'
                            ).parse([configClass]);
                        }
                    }
                    _MetadataConfigApplicationContext_configurationParser = new WeakMap();
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUVILE9BQU8sMENBQTBDLENBQUM7QUFDbEQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3RELE9BQU8sRUFBZSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBMkIsTUFBTSxlQUFlLENBQUM7QUFFOUcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25ELE9BQU8sRUFBYyxJQUFJLEVBQWMsY0FBYyxFQUFFLFVBQVUsRUFBYSxNQUFNLFlBQVksQ0FBQztBQUNqRyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJL0MsTUFDSSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxHQUFHLE9BQU8sRUFDaEcsRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ25CLGtCQUFrQixHQUFHLG9CQUFvQixFQUN6QyxjQUFjLEdBQUcsZ0JBQWdCLEVBQ2pDLGVBQWUsR0FBRyxpQkFBaUIsRUFDbkMsc0JBQXNCLEdBQUcsd0JBQXdCLEVBQ2pELFlBQVksR0FBRyxjQUFjLEVBRTdCLDJCQUEyQixHQUFHLENBQUUsTUFBTSxFQUFTLEVBQUUsQ0FBQyxjQUFjLENBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBRSxFQUNwRyxxQkFBcUIsR0FBRyxDQUFFLEtBQXdCLEVBQUUsTUFBTSxFQUFFLFdBQTZCLEVBQVMsRUFBRSxDQUFDLGNBQWMsQ0FBRSxjQUFjLEVBQUUsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsR0FB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

                    /***/
                },
                /* 13 */
                /***/ (__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
                    /*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
                    var Reflect;
                    (function (Reflect) {
                        // Metadata Proposal
                        // https://rbuckton.github.io/reflect-metadata/
                        (function (factory) {
                            var root =
                                typeof __webpack_require__.g === 'object'
                                    ? __webpack_require__.g
                                    : typeof self === 'object'
                                      ? self
                                      : typeof this === 'object'
                                        ? this
                                        : Function('return this;')();
                            var exporter = makeExporter(Reflect);
                            if (typeof root.Reflect === 'undefined') {
                                root.Reflect = Reflect;
                            } else {
                                exporter = makeExporter(root.Reflect, exporter);
                            }
                            factory(exporter);
                            function makeExporter(target, previous) {
                                return function (key, value) {
                                    if (typeof target[key] !== 'function') {
                                        Object.defineProperty(target, key, {
                                            configurable: true,
                                            writable: true,
                                            value: value,
                                        });
                                    }
                                    if (previous) previous(key, value);
                                };
                            }
                        })(function (exporter) {
                            var hasOwn = Object.prototype.hasOwnProperty;
                            // feature test for Symbol support
                            var supportsSymbol = typeof Symbol === 'function';
                            var toPrimitiveSymbol =
                                supportsSymbol && typeof Symbol.toPrimitive !== 'undefined'
                                    ? Symbol.toPrimitive
                                    : '@@toPrimitive';
                            var iteratorSymbol =
                                supportsSymbol && typeof Symbol.iterator !== 'undefined'
                                    ? Symbol.iterator
                                    : '@@iterator';
                            var supportsCreate = typeof Object.create === 'function'; // feature test for Object.create support
                            var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
                            var downLevel = !supportsCreate && !supportsProto;
                            var HashMap = {
                                // create an object in dictionary mode (a.k.a. "slow" mode in v8)
                                create: supportsCreate
                                    ? function () {
                                          return MakeDictionary(Object.create(null));
                                      }
                                    : supportsProto
                                      ? function () {
                                            return MakeDictionary({ __proto__: null });
                                        }
                                      : function () {
                                            return MakeDictionary({});
                                        },
                                has: downLevel
                                    ? function (map, key) {
                                          return hasOwn.call(map, key);
                                      }
                                    : function (map, key) {
                                          return key in map;
                                      },
                                get: downLevel
                                    ? function (map, key) {
                                          return hasOwn.call(map, key) ? map[key] : undefined;
                                      }
                                    : function (map, key) {
                                          return map[key];
                                      },
                            };
                            // Load global or shim versions of Map, Set, and WeakMap
                            var functionPrototype = Object.getPrototypeOf(Function);
                            var usePolyfill =
                                typeof process === 'object' &&
                                process.env &&
                                process.env['REFLECT_METADATA_USE_MAP_POLYFILL'] === 'true';
                            var _Map =
                                !usePolyfill && typeof Map === 'function' && typeof Map.prototype.entries === 'function'
                                    ? Map
                                    : CreateMapPolyfill();
                            var _Set =
                                !usePolyfill && typeof Set === 'function' && typeof Set.prototype.entries === 'function'
                                    ? Set
                                    : CreateSetPolyfill();
                            var _WeakMap =
                                !usePolyfill && typeof WeakMap === 'function' ? WeakMap : CreateWeakMapPolyfill();
                            // [[Metadata]] internal slot
                            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
                            var Metadata = new _WeakMap();
                            /**
                             * Applies a set of decorators to a property of a target object.
                             * @param decorators An array of decorators.
                             * @param target The target object.
                             * @param propertyKey (Optional) The property key to decorate.
                             * @param attributes (Optional) The property descriptor for the target key.
                             * @remarks Decorators are applied in reverse order.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     Example = Reflect.decorate(decoratorsArray, Example);
                             *
                             *     // property (on constructor)
                             *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     Object.defineProperty(Example, "staticMethod",
                             *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
                             *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
                             *
                             *     // method (on prototype)
                             *     Object.defineProperty(Example.prototype, "method",
                             *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
                             *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
                             *
                             */
                            function decorate(decorators, target, propertyKey, attributes) {
                                if (!IsUndefined(propertyKey)) {
                                    if (!IsArray(decorators)) throw new TypeError();
                                    if (!IsObject(target)) throw new TypeError();
                                    if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                                        throw new TypeError();
                                    if (IsNull(attributes)) attributes = undefined;
                                    propertyKey = ToPropertyKey(propertyKey);
                                    return DecorateProperty(decorators, target, propertyKey, attributes);
                                } else {
                                    if (!IsArray(decorators)) throw new TypeError();
                                    if (!IsConstructor(target)) throw new TypeError();
                                    return DecorateConstructor(decorators, target);
                                }
                            }
                            exporter('decorate', decorate);
                            // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
                            // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
                            /**
                             * A default metadata decorator factory that can be used on a class, class member, or parameter.
                             * @param metadataKey The key for the metadata entry.
                             * @param metadataValue The value for the metadata entry.
                             * @returns A decorator function.
                             * @remarks
                             * If `metadataKey` is already defined for the target and target key, the
                             * metadataValue for that key will be overwritten.
                             * @example
                             *
                             *     // constructor
                             *     @Reflect.metadata(key, value)
                             *     class Example {
                             *     }
                             *
                             *     // property (on constructor, TypeScript only)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         static staticProperty;
                             *     }
                             *
                             *     // property (on prototype, TypeScript only)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         property;
                             *     }
                             *
                             *     // method (on constructor)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         static staticMethod() { }
                             *     }
                             *
                             *     // method (on prototype)
                             *     class Example {
                             *         @Reflect.metadata(key, value)
                             *         method() { }
                             *     }
                             *
                             */
                            function metadata(metadataKey, metadataValue) {
                                function decorator(target, propertyKey) {
                                    if (!IsObject(target)) throw new TypeError();
                                    if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError();
                                    OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
                                }
                                return decorator;
                            }
                            exporter('metadata', metadata);
                            /**
                             * Define a unique metadata entry on the target.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param metadataValue A value that contains attached metadata.
                             * @param target The target object on which to define metadata.
                             * @param propertyKey (Optional) The property key for the target.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     Reflect.defineMetadata("custom:annotation", options, Example);
                             *
                             *     // property (on constructor)
                             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
                             *
                             *     // decorator factory as metadata-producing annotation.
                             *     function MyAnnotation(options): Decorator {
                             *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
                             *     }
                             *
                             */
                            function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
                            }
                            exporter('defineMetadata', defineMetadata);
                            /**
                             * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.hasMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function hasMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryHasMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('hasMetadata', hasMetadata);
                            /**
                             * Gets a value indicating whether the target object has the provided metadata key defined.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function hasOwnMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('hasOwnMetadata', hasOwnMetadata);
                            /**
                             * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function getMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryGetMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('getMetadata', getMetadata);
                            /**
                             * Gets the metadata value for the provided metadata key on the target object.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function getOwnMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
                            }
                            exporter('getOwnMetadata', getOwnMetadata);
                            /**
                             * Gets the metadata keys defined on the target object or its prototype chain.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns An array of unique metadata keys.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getMetadataKeys(Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getMetadataKeys(Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getMetadataKeys(Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getMetadataKeys(Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getMetadataKeys(Example.prototype, "method");
                             *
                             */
                            function getMetadataKeys(target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryMetadataKeys(target, propertyKey);
                            }
                            exporter('getMetadataKeys', getMetadataKeys);
                            /**
                             * Gets the unique metadata keys defined on the target object.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns An array of unique metadata keys.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.getOwnMetadataKeys(Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
                             *
                             */
                            function getOwnMetadataKeys(target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                return OrdinaryOwnMetadataKeys(target, propertyKey);
                            }
                            exporter('getOwnMetadataKeys', getOwnMetadataKeys);
                            /**
                             * Deletes the metadata entry from the target object with the provided key.
                             * @param metadataKey A key used to store and retrieve metadata.
                             * @param target The target object on which the metadata is defined.
                             * @param propertyKey (Optional) The property key for the target.
                             * @returns `true` if the metadata entry was found and deleted; otherwise, false.
                             * @example
                             *
                             *     class Example {
                             *         // property declarations are not part of ES6, though they are valid in TypeScript:
                             *         // static staticProperty;
                             *         // property;
                             *
                             *         constructor(p) { }
                             *         static staticMethod(p) { }
                             *         method(p) { }
                             *     }
                             *
                             *     // constructor
                             *     result = Reflect.deleteMetadata("custom:annotation", Example);
                             *
                             *     // property (on constructor)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
                             *
                             *     // property (on prototype)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
                             *
                             *     // method (on constructor)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
                             *
                             *     // method (on prototype)
                             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
                             *
                             */
                            function deleteMetadata(metadataKey, target, propertyKey) {
                                if (!IsObject(target)) throw new TypeError();
                                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
                                var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return false;
                                if (!metadataMap.delete(metadataKey)) return false;
                                if (metadataMap.size > 0) return true;
                                var targetMetadata = Metadata.get(target);
                                targetMetadata.delete(propertyKey);
                                if (targetMetadata.size > 0) return true;
                                Metadata.delete(target);
                                return true;
                            }
                            exporter('deleteMetadata', deleteMetadata);
                            function DecorateConstructor(decorators, target) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i];
                                    var decorated = decorator(target);
                                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                                        if (!IsConstructor(decorated)) throw new TypeError();
                                        target = decorated;
                                    }
                                }
                                return target;
                            }
                            function DecorateProperty(decorators, target, propertyKey, descriptor) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i];
                                    var decorated = decorator(target, propertyKey, descriptor);
                                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                                        if (!IsObject(decorated)) throw new TypeError();
                                        descriptor = decorated;
                                    }
                                }
                                return descriptor;
                            }
                            function GetOrCreateMetadataMap(O, P, Create) {
                                var targetMetadata = Metadata.get(O);
                                if (IsUndefined(targetMetadata)) {
                                    if (!Create) return undefined;
                                    targetMetadata = new _Map();
                                    Metadata.set(O, targetMetadata);
                                }
                                var metadataMap = targetMetadata.get(P);
                                if (IsUndefined(metadataMap)) {
                                    if (!Create) return undefined;
                                    metadataMap = new _Map();
                                    targetMetadata.set(P, metadataMap);
                                }
                                return metadataMap;
                            }
                            // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
                            function OrdinaryHasMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return true;
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
                                return false;
                            }
                            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
                            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return false;
                                return ToBoolean(metadataMap.has(MetadataKey));
                            }
                            // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
                            function OrdinaryGetMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
                                return undefined;
                            }
                            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
                            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return undefined;
                                return metadataMap.get(MetadataKey);
                            }
                            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
                            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
                                metadataMap.set(MetadataKey, MetadataValue);
                            }
                            // 3.1.6.1 OrdinaryMetadataKeys(O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
                            function OrdinaryMetadataKeys(O, P) {
                                var ownKeys = OrdinaryOwnMetadataKeys(O, P);
                                var parent = OrdinaryGetPrototypeOf(O);
                                if (parent === null) return ownKeys;
                                var parentKeys = OrdinaryMetadataKeys(parent, P);
                                if (parentKeys.length <= 0) return ownKeys;
                                if (ownKeys.length <= 0) return parentKeys;
                                var set = new _Set();
                                var keys = [];
                                for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                                    var key = ownKeys_1[_i];
                                    var hasKey = set.has(key);
                                    if (!hasKey) {
                                        set.add(key);
                                        keys.push(key);
                                    }
                                }
                                for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                                    var key = parentKeys_1[_a];
                                    var hasKey = set.has(key);
                                    if (!hasKey) {
                                        set.add(key);
                                        keys.push(key);
                                    }
                                }
                                return keys;
                            }
                            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
                            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
                            function OrdinaryOwnMetadataKeys(O, P) {
                                var keys = [];
                                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                                if (IsUndefined(metadataMap)) return keys;
                                var keysObj = metadataMap.keys();
                                var iterator = GetIterator(keysObj);
                                var k = 0;
                                while (true) {
                                    var next = IteratorStep(iterator);
                                    if (!next) {
                                        keys.length = k;
                                        return keys;
                                    }
                                    var nextValue = IteratorValue(next);
                                    try {
                                        keys[k] = nextValue;
                                    } catch (e) {
                                        try {
                                            IteratorClose(iterator);
                                        } finally {
                                            throw e;
                                        }
                                    }
                                    k++;
                                }
                            }
                            // 6 ECMAScript Data Typ0es and Values
                            // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
                            function Type(x) {
                                if (x === null) return 1 /* Null */;
                                switch (typeof x) {
                                    case 'undefined':
                                        return 0 /* Undefined */;
                                    case 'boolean':
                                        return 2 /* Boolean */;
                                    case 'string':
                                        return 3 /* String */;
                                    case 'symbol':
                                        return 4 /* Symbol */;
                                    case 'number':
                                        return 5 /* Number */;
                                    case 'object':
                                        return x === null ? 1 /* Null */ : 6 /* Object */;
                                    default:
                                        return 6 /* Object */;
                                }
                            }
                            // 6.1.1 The Undefined Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
                            function IsUndefined(x) {
                                return x === undefined;
                            }
                            // 6.1.2 The Null Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
                            function IsNull(x) {
                                return x === null;
                            }
                            // 6.1.5 The Symbol Type
                            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
                            function IsSymbol(x) {
                                return typeof x === 'symbol';
                            }
                            // 6.1.7 The Object Type
                            // https://tc39.github.io/ecma262/#sec-object-type
                            function IsObject(x) {
                                return typeof x === 'object' ? x !== null : typeof x === 'function';
                            }
                            // 7.1 Type Conversion
                            // https://tc39.github.io/ecma262/#sec-type-conversion
                            // 7.1.1 ToPrimitive(input [, PreferredType])
                            // https://tc39.github.io/ecma262/#sec-toprimitive
                            function ToPrimitive(input, PreferredType) {
                                switch (Type(input)) {
                                    case 0 /* Undefined */:
                                        return input;
                                    case 1 /* Null */:
                                        return input;
                                    case 2 /* Boolean */:
                                        return input;
                                    case 3 /* String */:
                                        return input;
                                    case 4 /* Symbol */:
                                        return input;
                                    case 5 /* Number */:
                                        return input;
                                }
                                var hint =
                                    PreferredType === 3 /* String */
                                        ? 'string'
                                        : PreferredType === 5 /* Number */
                                          ? 'number'
                                          : 'default';
                                var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
                                if (exoticToPrim !== undefined) {
                                    var result = exoticToPrim.call(input, hint);
                                    if (IsObject(result)) throw new TypeError();
                                    return result;
                                }
                                return OrdinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
                            }
                            // 7.1.1.1 OrdinaryToPrimitive(O, hint)
                            // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
                            function OrdinaryToPrimitive(O, hint) {
                                if (hint === 'string') {
                                    var toString_1 = O.toString;
                                    if (IsCallable(toString_1)) {
                                        var result = toString_1.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                    var valueOf = O.valueOf;
                                    if (IsCallable(valueOf)) {
                                        var result = valueOf.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                } else {
                                    var valueOf = O.valueOf;
                                    if (IsCallable(valueOf)) {
                                        var result = valueOf.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                    var toString_2 = O.toString;
                                    if (IsCallable(toString_2)) {
                                        var result = toString_2.call(O);
                                        if (!IsObject(result)) return result;
                                    }
                                }
                                throw new TypeError();
                            }
                            // 7.1.2 ToBoolean(argument)
                            // https://tc39.github.io/ecma262/2016/#sec-toboolean
                            function ToBoolean(argument) {
                                return !!argument;
                            }
                            // 7.1.12 ToString(argument)
                            // https://tc39.github.io/ecma262/#sec-tostring
                            function ToString(argument) {
                                return '' + argument;
                            }
                            // 7.1.14 ToPropertyKey(argument)
                            // https://tc39.github.io/ecma262/#sec-topropertykey
                            function ToPropertyKey(argument) {
                                var key = ToPrimitive(argument, 3 /* String */);
                                if (IsSymbol(key)) return key;
                                return ToString(key);
                            }
                            // 7.2 Testing and Comparison Operations
                            // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
                            // 7.2.2 IsArray(argument)
                            // https://tc39.github.io/ecma262/#sec-isarray
                            function IsArray(argument) {
                                return Array.isArray
                                    ? Array.isArray(argument)
                                    : argument instanceof Object
                                      ? argument instanceof Array
                                      : Object.prototype.toString.call(argument) === '[object Array]';
                            }
                            // 7.2.3 IsCallable(argument)
                            // https://tc39.github.io/ecma262/#sec-iscallable
                            function IsCallable(argument) {
                                // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
                                return typeof argument === 'function';
                            }
                            // 7.2.4 IsConstructor(argument)
                            // https://tc39.github.io/ecma262/#sec-isconstructor
                            function IsConstructor(argument) {
                                // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
                                return typeof argument === 'function';
                            }
                            // 7.2.7 IsPropertyKey(argument)
                            // https://tc39.github.io/ecma262/#sec-ispropertykey
                            function IsPropertyKey(argument) {
                                switch (Type(argument)) {
                                    case 3 /* String */:
                                        return true;
                                    case 4 /* Symbol */:
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                            // 7.3 Operations on Objects
                            // https://tc39.github.io/ecma262/#sec-operations-on-objects
                            // 7.3.9 GetMethod(V, P)
                            // https://tc39.github.io/ecma262/#sec-getmethod
                            function GetMethod(V, P) {
                                var func = V[P];
                                if (func === undefined || func === null) return undefined;
                                if (!IsCallable(func)) throw new TypeError();
                                return func;
                            }
                            // 7.4 Operations on Iterator Objects
                            // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
                            function GetIterator(obj) {
                                var method = GetMethod(obj, iteratorSymbol);
                                if (!IsCallable(method)) throw new TypeError(); // from Call
                                var iterator = method.call(obj);
                                if (!IsObject(iterator)) throw new TypeError();
                                return iterator;
                            }
                            // 7.4.4 IteratorValue(iterResult)
                            // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
                            function IteratorValue(iterResult) {
                                return iterResult.value;
                            }
                            // 7.4.5 IteratorStep(iterator)
                            // https://tc39.github.io/ecma262/#sec-iteratorstep
                            function IteratorStep(iterator) {
                                var result = iterator.next();
                                return result.done ? false : result;
                            }
                            // 7.4.6 IteratorClose(iterator, completion)
                            // https://tc39.github.io/ecma262/#sec-iteratorclose
                            function IteratorClose(iterator) {
                                var f = iterator['return'];
                                if (f) f.call(iterator);
                            }
                            // 9.1 Ordinary Object Internal Methods and Internal Slots
                            // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
                            // 9.1.1.1 OrdinaryGetPrototypeOf(O)
                            // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
                            function OrdinaryGetPrototypeOf(O) {
                                var proto = Object.getPrototypeOf(O);
                                if (typeof O !== 'function' || O === functionPrototype) return proto;
                                // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
                                // Try to determine the superclass constructor. Compatible implementations
                                // must either set __proto__ on a subclass constructor to the superclass constructor,
                                // or ensure each class has a valid `constructor` property on its prototype that
                                // points back to the constructor.
                                // If this is not the same as Function.[[Prototype]], then this is definately inherited.
                                // This is the case when in ES6 or when using __proto__ in a compatible browser.
                                if (proto !== functionPrototype) return proto;
                                // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
                                var prototype = O.prototype;
                                var prototypeProto = prototype && Object.getPrototypeOf(prototype);
                                if (prototypeProto == null || prototypeProto === Object.prototype) return proto;
                                // If the constructor was not a function, then we cannot determine the heritage.
                                var constructor = prototypeProto.constructor;
                                if (typeof constructor !== 'function') return proto;
                                // If we have some kind of self-reference, then we cannot determine the heritage.
                                if (constructor === O) return proto;
                                // we have a pretty good guess at the heritage.
                                return constructor;
                            }
                            // naive Map shim
                            function CreateMapPolyfill() {
                                var cacheSentinel = {};
                                var arraySentinel = [];
                                var MapIterator = /** @class */ (function () {
                                    function MapIterator(keys, values, selector) {
                                        this._index = 0;
                                        this._keys = keys;
                                        this._values = values;
                                        this._selector = selector;
                                    }
                                    MapIterator.prototype['@@iterator'] = function () {
                                        return this;
                                    };
                                    MapIterator.prototype[iteratorSymbol] = function () {
                                        return this;
                                    };
                                    MapIterator.prototype.next = function () {
                                        var index = this._index;
                                        if (index >= 0 && index < this._keys.length) {
                                            var result = this._selector(this._keys[index], this._values[index]);
                                            if (index + 1 >= this._keys.length) {
                                                this._index = -1;
                                                this._keys = arraySentinel;
                                                this._values = arraySentinel;
                                            } else {
                                                this._index++;
                                            }
                                            return { value: result, done: false };
                                        }
                                        return { value: undefined, done: true };
                                    };
                                    MapIterator.prototype.throw = function (error) {
                                        if (this._index >= 0) {
                                            this._index = -1;
                                            this._keys = arraySentinel;
                                            this._values = arraySentinel;
                                        }
                                        throw error;
                                    };
                                    MapIterator.prototype.return = function (value) {
                                        if (this._index >= 0) {
                                            this._index = -1;
                                            this._keys = arraySentinel;
                                            this._values = arraySentinel;
                                        }
                                        return { value: value, done: true };
                                    };
                                    return MapIterator;
                                })();
                                return /** @class */ (function () {
                                    function Map() {
                                        this._keys = [];
                                        this._values = [];
                                        this._cacheKey = cacheSentinel;
                                        this._cacheIndex = -2;
                                    }
                                    Object.defineProperty(Map.prototype, 'size', {
                                        get: function () {
                                            return this._keys.length;
                                        },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                    Map.prototype.has = function (key) {
                                        return this._find(key, /*insert*/ false) >= 0;
                                    };
                                    Map.prototype.get = function (key) {
                                        var index = this._find(key, /*insert*/ false);
                                        return index >= 0 ? this._values[index] : undefined;
                                    };
                                    Map.prototype.set = function (key, value) {
                                        var index = this._find(key, /*insert*/ true);
                                        this._values[index] = value;
                                        return this;
                                    };
                                    Map.prototype.delete = function (key) {
                                        var index = this._find(key, /*insert*/ false);
                                        if (index >= 0) {
                                            var size = this._keys.length;
                                            for (var i = index + 1; i < size; i++) {
                                                this._keys[i - 1] = this._keys[i];
                                                this._values[i - 1] = this._values[i];
                                            }
                                            this._keys.length--;
                                            this._values.length--;
                                            if (key === this._cacheKey) {
                                                this._cacheKey = cacheSentinel;
                                                this._cacheIndex = -2;
                                            }
                                            return true;
                                        }
                                        return false;
                                    };
                                    Map.prototype.clear = function () {
                                        this._keys.length = 0;
                                        this._values.length = 0;
                                        this._cacheKey = cacheSentinel;
                                        this._cacheIndex = -2;
                                    };
                                    Map.prototype.keys = function () {
                                        return new MapIterator(this._keys, this._values, getKey);
                                    };
                                    Map.prototype.values = function () {
                                        return new MapIterator(this._keys, this._values, getValue);
                                    };
                                    Map.prototype.entries = function () {
                                        return new MapIterator(this._keys, this._values, getEntry);
                                    };
                                    Map.prototype['@@iterator'] = function () {
                                        return this.entries();
                                    };
                                    Map.prototype[iteratorSymbol] = function () {
                                        return this.entries();
                                    };
                                    Map.prototype._find = function (key, insert) {
                                        if (this._cacheKey !== key) {
                                            this._cacheIndex = this._keys.indexOf((this._cacheKey = key));
                                        }
                                        if (this._cacheIndex < 0 && insert) {
                                            this._cacheIndex = this._keys.length;
                                            this._keys.push(key);
                                            this._values.push(undefined);
                                        }
                                        return this._cacheIndex;
                                    };
                                    return Map;
                                })();
                                function getKey(key, _) {
                                    return key;
                                }
                                function getValue(_, value) {
                                    return value;
                                }
                                function getEntry(key, value) {
                                    return [key, value];
                                }
                            }
                            // naive Set shim
                            function CreateSetPolyfill() {
                                return /** @class */ (function () {
                                    function Set() {
                                        this._map = new _Map();
                                    }
                                    Object.defineProperty(Set.prototype, 'size', {
                                        get: function () {
                                            return this._map.size;
                                        },
                                        enumerable: true,
                                        configurable: true,
                                    });
                                    Set.prototype.has = function (value) {
                                        return this._map.has(value);
                                    };
                                    Set.prototype.add = function (value) {
                                        return this._map.set(value, value), this;
                                    };
                                    Set.prototype.delete = function (value) {
                                        return this._map.delete(value);
                                    };
                                    Set.prototype.clear = function () {
                                        this._map.clear();
                                    };
                                    Set.prototype.keys = function () {
                                        return this._map.keys();
                                    };
                                    Set.prototype.values = function () {
                                        return this._map.values();
                                    };
                                    Set.prototype.entries = function () {
                                        return this._map.entries();
                                    };
                                    Set.prototype['@@iterator'] = function () {
                                        return this.keys();
                                    };
                                    Set.prototype[iteratorSymbol] = function () {
                                        return this.keys();
                                    };
                                    return Set;
                                })();
                            }
                            // naive WeakMap shim
                            function CreateWeakMapPolyfill() {
                                var UUID_SIZE = 16;
                                var keys = HashMap.create();
                                var rootKey = CreateUniqueKey();
                                return /** @class */ (function () {
                                    function WeakMap() {
                                        this._key = CreateUniqueKey();
                                    }
                                    WeakMap.prototype.has = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? HashMap.has(table, this._key) : false;
                                    };
                                    WeakMap.prototype.get = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? HashMap.get(table, this._key) : undefined;
                                    };
                                    WeakMap.prototype.set = function (target, value) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                                        table[this._key] = value;
                                        return this;
                                    };
                                    WeakMap.prototype.delete = function (target) {
                                        var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                                        return table !== undefined ? delete table[this._key] : false;
                                    };
                                    WeakMap.prototype.clear = function () {
                                        // NOTE: not a real clear, just makes the previous data unreachable
                                        this._key = CreateUniqueKey();
                                    };
                                    return WeakMap;
                                })();
                                function CreateUniqueKey() {
                                    var key;
                                    do key = '@@WeakMap@@' + CreateUUID();
                                    while (HashMap.has(keys, key));
                                    keys[key] = true;
                                    return key;
                                }
                                function GetOrCreateWeakMapTable(target, create) {
                                    if (!hasOwn.call(target, rootKey)) {
                                        if (!create) return undefined;
                                        Object.defineProperty(target, rootKey, { value: HashMap.create() });
                                    }
                                    return target[rootKey];
                                }
                                function FillRandomBytes(buffer, size) {
                                    for (var i = 0; i < size; ++i) buffer[i] = (Math.random() * 0xff) | 0;
                                    return buffer;
                                }
                                function GenRandomBytes(size) {
                                    if (typeof Uint8Array === 'function') {
                                        if (typeof crypto !== 'undefined')
                                            return crypto.getRandomValues(new Uint8Array(size));
                                        if (typeof msCrypto !== 'undefined')
                                            return msCrypto.getRandomValues(new Uint8Array(size));
                                        return FillRandomBytes(new Uint8Array(size), size);
                                    }
                                    return FillRandomBytes(new Array(size), size);
                                }
                                function CreateUUID() {
                                    var data = GenRandomBytes(UUID_SIZE);
                                    // mark as random - RFC 4122 § 4.4
                                    data[6] = (data[6] & 0x4f) | 0x40;
                                    data[8] = (data[8] & 0xbf) | 0x80;
                                    var result = '';
                                    for (var offset = 0; offset < UUID_SIZE; ++offset) {
                                        var byte = data[offset];
                                        if (offset === 4 || offset === 6 || offset === 8) result += '-';
                                        if (byte < 16) result += '0';
                                        result += byte.toString(16).toLowerCase();
                                    }
                                    return result;
                                }
                            }
                            // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
                            function MakeDictionary(obj) {
                                obj.__ = undefined;
                                delete obj.__;
                                return obj;
                            }
                        });
                    })(Reflect || (Reflect = {}));

                    /***/
                },
                /* 14 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    'use strict';
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ EventLogger: () => /* binding */ EventLogger,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15);
                    /* harmony import */ var _blue_logger__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_logger__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _event_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_2___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_2__);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
                    /* harmony import */ var _blue_factory__WEBPACK_IMPORTED_MODULE_3___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_factory__WEBPACK_IMPORTED_MODULE_3__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_4___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_4__);
                    /**
                     * @author Jeff Rose
                     */
                    var __classPrivateFieldGet =
                        (undefined && undefined.__classPrivateFieldGet) ||
                        function (receiver, state, kind, f) {
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a getter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot read private member from an object whose class did not declare it'
                                );
                            return kind === 'm'
                                ? f
                                : kind === 'a'
                                  ? f.call(receiver)
                                  : f
                                    ? f.value
                                    : state.get(receiver);
                        };
                    var __classPrivateFieldSet =
                        (undefined && undefined.__classPrivateFieldSet) ||
                        function (receiver, state, value, kind, f) {
                            if (kind === 'm') throw new TypeError('Private method is not writable');
                            if (kind === 'a' && !f)
                                throw new TypeError('Private accessor was defined without a setter');
                            if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
                                throw new TypeError(
                                    'Cannot write private member to an object whose class did not declare it'
                                );
                            return (
                                kind === 'a'
                                    ? f.call(receiver, value)
                                    : f
                                      ? (f.value = value)
                                      : state.set(receiver, value),
                                value
                            );
                        };
                    var _EventLogger_threshold;

                    const isLevel = (0, _blue_util__WEBPACK_IMPORTED_MODULE_4__.is)(
                        _blue_logger__WEBPACK_IMPORTED_MODULE_0__.Level
                    );
                    /**
                     * @class module:context.EventLogger
                     * @implements module:context.EventEmitter
                     * @implements module:logger.Logger
                     * @implements module:logger.LevelComparator
                     * @extends module:core.Null
                     */
                    class EventLogger extends (0, _blue_logger__WEBPACK_IMPORTED_MODULE_0__.AsLevelComparator)(
                        (0, _event_emitter__WEBPACK_IMPORTED_MODULE_1__.AsEventEmitter)(
                            (0, _blue_factory__WEBPACK_IMPORTED_MODULE_3__.AsNameAware)(
                                _blue_core__WEBPACK_IMPORTED_MODULE_2__.Null
                            )
                        )
                    ) {
                        constructor() {
                            super();
                            _EventLogger_threshold.set(this, void 0);
                            this.threshold = _blue_logger__WEBPACK_IMPORTED_MODULE_0__.Level.ALL;
                        }
                        get threshold() {
                            return __classPrivateFieldGet(this, _EventLogger_threshold, 'f');
                        }
                        set threshold(newThreshold) {
                            if (isLevel(newThreshold)) {
                                this.emit(
                                    'change',
                                    __classPrivateFieldGet(this, _EventLogger_threshold, 'f'),
                                    newThreshold
                                );
                                __classPrivateFieldSet(this, _EventLogger_threshold, newThreshold, 'f');
                            }
                        }
                        log(level, message) {
                            if (this.compare(this.threshold, level) >= 0) {
                                const entry = (0, _blue_logger__WEBPACK_IMPORTED_MODULE_0__.newEntry)(
                                    this.name,
                                    level,
                                    message
                                );
                                this.emit(`log:${level.name}`, entry);
                            }
                        }
                    }
                    _EventLogger_threshold = new WeakMap();
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7QUFFSCxPQUFPLEVBQW9CLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQW1CLE1BQU0sY0FBYyxDQUFDO0FBQ3JHLE9BQU8sRUFBRSxjQUFjLEVBQWdCLE1BQU0saUJBQWlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFaEMsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFFLEtBQUssQ0FBaUMsQ0FBQztBQUUzRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8sV0FBWSxTQUFRLGlCQUFpQixDQUFFLGNBQWMsQ0FBRSxXQUFXLENBQUUsSUFBSSxDQUFFLENBQUUsQ0FBRTtJQWdCdkY7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQWRaLHlDQUFrQjtRQWVkLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBZEQsSUFBSSxTQUFTO1FBQ1QsT0FBTyx1QkFBQSxJQUFJLDhCQUFXLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksU0FBUyxDQUFFLFlBQW1CO1FBQzlCLElBQUksT0FBTyxDQUFFLFlBQVksQ0FBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUUsUUFBUSxFQUFFLHVCQUFBLElBQUksOEJBQVcsRUFBRSxZQUFZLENBQUUsQ0FBQztZQUNyRCx1QkFBQSxJQUFJLDBCQUFjLFlBQVksTUFBQSxDQUFDO1NBQ2xDO0lBQ0wsQ0FBQztJQU9ELEdBQUcsQ0FBRSxLQUFZLEVBQUUsT0FBbUI7UUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFFLElBQUksQ0FBQyxFQUFFO1lBQzVDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFFLE9BQVEsS0FBSyxDQUFDLElBQUssRUFBRSxFQUFFLEtBQUssQ0FBRSxDQUFDO1NBQzdDO0lBQ0wsQ0FBQztDQUVKIn0=

                    /***/
                },
                /* 15 */
                /***/ (module) => {
                    'use strict';
                    module.exports = __WEBPACK_EXTERNAL_MODULE__15__;

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
            /******/ /* webpack/runtime/global */
            /******/ (() => {
                /******/ __webpack_require__.g = (function () {
                    /******/ if (typeof globalThis === 'object') return globalThis;
                    /******/ try {
                        /******/ return this || new Function('return this')();
                        /******/
                    } catch (e) {
                        /******/ if (typeof window === 'object') return window;
                        /******/
                    }
                    /******/
                })();
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
            // This entry need to be wrapped in an IIFE because it need to be in strict mode.
            (() => {
                'use strict';
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ $ChildContext: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.$ChildContext,
                    /* harmony export */ AbstractEnvironment: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.AbstractEnvironment,
                    /* harmony export */ ApplicationContextAwareProcessor: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.ApplicationContextAwareProcessor,
                    /* harmony export */ AsApplicationContextAware: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.AsApplicationContextAware,
                    /* harmony export */ AsEnvironmentAware: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.AsEnvironmentAware,
                    /* harmony export */ AsEventEmitter: () =>
                        /* reexport safe */ _event_emitter__WEBPACK_IMPORTED_MODULE_3__.AsEventEmitter,
                    /* harmony export */ AsModuleResourceLoader: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.AsModuleResourceLoader,
                    /* harmony export */ AsResourceLoaderAware: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.AsResourceLoaderAware,
                    /* harmony export */ ConfigurationProcessor: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.ConfigurationProcessor,
                    /* harmony export */ DefaultResourceLoader: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.DefaultResourceLoader,
                    /* harmony export */ EventLogger: () =>
                        /* reexport safe */ _event_logger__WEBPACK_IMPORTED_MODULE_4__.EventLogger,
                    /* harmony export */ GenericApplicationContext: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.GenericApplicationContext,
                    /* harmony export */ MetadataConfigApplicationContext: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.MetadataConfigApplicationContext,
                    /* harmony export */ MockEnvironment: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.MockEnvironment,
                    /* harmony export */ PrototypalPropertyResolver: () =>
                        /* reexport safe */ _property_resolver__WEBPACK_IMPORTED_MODULE_5__.PrototypalPropertyResolver,
                    /* harmony export */ ProxiedGenericApplicationContext: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.ProxiedGenericApplicationContext,
                    /* harmony export */ StandardEnvironment: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.StandardEnvironment,
                    /* harmony export */ URLResource: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.URLResource,
                    /* harmony export */ UnresolvedResource: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.UnresolvedResource,
                    /* harmony export */ configuration: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.configuration,
                    /* harmony export */ entry: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.entry,
                    /* harmony export */ likeApplicationContext: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.likeApplicationContext,
                    /* harmony export */ likeApplicationContextAware: () =>
                        /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.likeApplicationContextAware,
                    /* harmony export */ likeApplicationEventEmitterAware: () =>
                        /* reexport safe */ _event_emitter__WEBPACK_IMPORTED_MODULE_3__.likeApplicationEventEmitterAware,
                    /* harmony export */ likeEnvironment: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.likeEnvironment,
                    /* harmony export */ likeEnvironmentAware: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.likeEnvironmentAware,
                    /* harmony export */ likeEnvironmentSource: () =>
                        /* reexport safe */ _environment__WEBPACK_IMPORTED_MODULE_2__.likeEnvironmentSource,
                    /* harmony export */ likeEventEmitter: () =>
                        /* reexport safe */ _event_emitter__WEBPACK_IMPORTED_MODULE_3__.likeEventEmitter,
                    /* harmony export */ likePropertyResolver: () =>
                        /* reexport safe */ _property_resolver__WEBPACK_IMPORTED_MODULE_5__.likePropertyResolver,
                    /* harmony export */ likeResource: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.likeResource,
                    /* harmony export */ likeResourceLoader: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.likeResourceLoader,
                    /* harmony export */ likeResourceLoaderAware: () =>
                        /* reexport safe */ _resource__WEBPACK_IMPORTED_MODULE_6__.likeResourceLoaderAware,
                    /* harmony export */ profile: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.profile,
                    /* harmony export */ property: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.property,
                    /* harmony export */ propertySource: () =>
                        /* reexport safe */ _configuration__WEBPACK_IMPORTED_MODULE_1__.propertySource,
                    /* harmony export */
                });
                /* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
                /* harmony import */ var _configuration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
                /* harmony import */ var _environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
                /* harmony import */ var _event_emitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
                /* harmony import */ var _event_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(14);
                /* harmony import */ var _property_resolver__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
                /* harmony import */ var _resource__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(10);
                /**
                 * @author Jeff Rose
                 * @module context
                 * @requires content
                 * @requires core
                 * @requires factory
                 * @requires util
                 */

                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0dBUUc7QUFFSCxjQUFjLFdBQVcsQ0FBQztBQUMxQixjQUFjLGlCQUFpQixDQUFDO0FBQ2hDLGNBQWMsZUFBZSxDQUFDO0FBQzlCLGNBQWMsaUJBQWlCLENBQUM7QUFDaEMsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLHFCQUFxQixDQUFDO0FBQ3BDLGNBQWMsWUFBWSxDQUFDIn0=
            })();

            /******/ return __webpack_exports__;
            /******/
        })();
    }
);
