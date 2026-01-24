/**
 * @author Jeff Rose
 */
import { Null } from '@blue/core';
import { View } from '@blue/view';
import { Route } from '@blue/router';
import { ModelAndView } from './model-and-view';
export interface RouteDispatcher {
    dispatch(route: Route): Promise<void>;
}
export interface RouteRenderer {
    render(mv: ModelAndView, route: Route): Promise<void>;
}
declare const BrowserDispatcher_base: import("@blue/core").Constructable<import("./strategies/view-resolver-strategy").ViewResolverStrategy> & import("@blue/core").Constructable<import("./strategies/route-error-resolver-strategy").RouteErrorResolverStrategy> & import("@blue/core").Constructable<import("./strategies/theme-resolver-strategy").ThemeResolverStrategy> & import("@blue/core").Constructable<import("./strategies/route-to-view-name-translator-strategy").RouteToViewNameTranslatorStrategy> & import("@blue/core").Constructable<import("./strategies/language-resolver-strategy").LanguageResolverStrategy> & import("@blue/core").Constructable<import("./strategies/route-handler-mapping-strategy").RouteHandlerMappingStrategy> & import("@blue/core").Constructable<import("./strategies/route-handler-adapter-strategy").RouteHandlerAdapterStrategy> & import("@blue/core").Constructable<import("./strategies/strategy-initializer").StrategyInitializer> & typeof Null;
/**
 * An interface for creating application dispatchers. Dispatches to registered handlers for processing a route, providing convenient mapping and exception handling facilities.
 *
 * It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.
 * @interface module:router.RouteDispatcher
 */
/**
 * Initialize the strategy objects that this dispatcher uses.
 * @function module:router.RouteDispatcher#initStrategies
 * @param {module:core.ApplicationContext} context
 */
/**
 * Process the route by dispatching to the handler.
 * @function module:router.RouteDispatcher#dispatch
 * @param {module:router.Route} route
 * @returns {external:Promise}
 */
/**
 * @interface module:router.RouteRenderer
 */
/**
 * @function module:router.RouteRenderer#render
 * @param {module:dispatcher.ModelAndView} mv
 * @param {module:router.Route} route
 * @returns {external:Promise}
 */
/**
 * Dispatcher for brower-based handlers.
 * * It can use any {@linkcode module:router.RouteHandlerMapping|RouteHandlerMapping} implementation - pre-built or provided as part of an application - to control the routing of routes to handlers. Default is {@linkcode module:dispatcher.NamePathHandlerMapping|NamePathHandlerMapping} and {@linkcode module:dispatcher.MetadataHandlerMapping|MetadataHandlerMapping}. HandlerMapping objects can be defined as values in the application context, implementing the HandlerMapping interface, overriding the default HandlerMapping if present. HandlerMappings can be given any value name.
 * * It can use any {@linkcode module:dispatcher.HandlerAdapter|HandlerAdapter}; this allows for using any handler interface. Default adapters are {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter}, {@linkcode module:dispatcher.ControllerHandlerAdapter|ControllerHandlerAdapter}, for {@linkcode module:router.RouteMappingHandler|RouteMappingHandler} and {@linkcode module:dispatcher.Controller|Controller} interfaces, respectively. A default {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter} will be registered as well. RouteHandlerAdapter objects can be added as values in the application context, overriding the default RouteHandlerAdapters. Like HandlerMappings, RouteHandlerAdapters can be given any name.
 * * The dispatcher's error resolution strategy can be specified via a {@linkcode module:router.RouteHandlerErrorResolver|HandlerErrorResolver}, for example mapping certain exceptions to error pages. Default is {@linkcode module:dispatcher.DefaultRouteHandlerErrorResolver|DefaultRouteHandlerErrorResolver}. HandlerErrorResolvers can be overridden through the application context. HandlerErrorResolver can be given any name.
 * * Its view resolution strategy can be specified via a {@linkcode module:view.ViewResolver|ViewResolver} implementation, resolving symbolic view names into {@linkcode module:view.View|View} objects. Default is {@linkcode module:dispatcher.InternalResourceViewResolver|InternalResourceViewResolver}. ViewResolver objects can be added as values in the application context, overriding the default ViewResolver. ViewResolvers can be given any name.
 * * Its language resolution strategy is determined by a {@linkcode module:dispatcher.LanguageResolver|LanguageResolver}. The out-of-the-box implementation works via {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Navigator|navigator} object. The LanguageResolver name is "languageResolver"; default is {@linkcode module:dispatcher.NavigatorLanguageResolver|NavigatorLanguageResolver}.
 * * Its theme resolution strategy is determined by a {@linkcode module:dispatcher.ThemeResolver|ThemeResolver}. Implementations for a fixed theme and cookie resolved theme are included. The ThemeResolver name is "themeResolver"; default is {@linkcode module:dispatcher.FixedThemeResolver|FixedThemeResolver}.
 * @class module:dispatcher.BrowserDispatcher
 * @implements module:router.RouteDispatcher
 * @implements module:router.RouteRenderer
 * @mixes module:dispatcher.AsRouteHandlerAdapterStrategy
 * @mixes module:dispatcher.AsRouteHandlerMappingStrategy
 * @mixes module:dispatcher.AsRouteErrorResolverStrategy
 * @mixes module:dispatcher.AsLanguageResolverStrategy
 * @mixes module:dispatcher.AsRouteToViewNameTranslatorStrategy
 * @mixes module:dispatcher.AsThemeResolverStrategy
 * @mixes module:dispatcher.AsViewMappingStrategy
 * @mixes module:dispatcher.AsViewResolverStrategy
 */
export declare class BrowserDispatcher extends BrowserDispatcher_base implements RouteDispatcher, RouteRenderer {
    defaultViewName: string;
    get [Symbol.toStringTag](): string;
    dispatch(route: Route): Promise<void>;
    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @function module:dispatcher.BrowserDispatcher#render
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {external:Promise}
     */
    render(mv: ModelAndView, route: Route): Promise<void>;
    protected _processHandlerError(route: Route, handler: any, error: Error): ModelAndView;
    protected _resolveViewName(viewName: string, language: string): Promise<View>;
    private _applyDefaultViewName;
    private _processDispatchResult;
}
export {};
/**
 * * Developer Notes
 * ? Should abstract classes be created?
 * Two abstract classes could be derived from BrowserDispatcher, an AbstractRouteDispatcher and an AbstractRouteRenderer. Then BrowserDispatcher would extend those two classes and provide
 * an implementation of _processDispatchResult which would unify the two abstract classes.
 *
 * ? Should EventEmitter be used?
 * There should either be an Event-based implementation of Dispatcher that mixes in AsEventEmitter or that should be intrisic to BrowserDispatcher itself. This would allow Dispatcher to emit
 * lifecycle events similar to today's sysytem. There could even be an event-based implementation of RouteHandlerInterceptors; however currently if a RouteHandlerInterceptor preHandle returns false, handler
 * execution stops. That may not be possible with an event based system without enhancements to Emitter.
 */
//# sourceMappingURL=dispatcher.d.ts.map