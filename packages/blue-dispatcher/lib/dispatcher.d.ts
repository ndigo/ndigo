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
 */
/**
 * Initialize the strategy objects that this dispatcher uses.
 * @param {module:core.ApplicationContext} context
 */
/**
 * Process the route by dispatching to the handler.
 * @param {module:router.Route} route
 * @returns {Promise}
 */
/**
 */
/**
 * @param {module:dispatcher.ModelAndView} mv
 * @param {module:router.Route} route
 * @returns {Promise}
 */
/**
 * Dispatcher for brower-based handlers.
 * * It can use any {@link RouteHandlerMapping|RouteHandlerMapping} implementation - pre-built or provided as part of an application - to control the routing of routes to handlers. Default is {@link NamePathHandlerMapping|NamePathHandlerMapping} and {@link MetadataHandlerMapping|MetadataHandlerMapping}. HandlerMapping objects can be defined as values in the application context, implementing the HandlerMapping interface, overriding the default HandlerMapping if present. HandlerMappings can be given any value name.
 * * It can use any {@link HandlerAdapter|HandlerAdapter}; this allows for using any handler interface. Default adapters are {@link MetadataHandlerAdapter|MetadataHandlerAdapter}, {@link ControllerHandlerAdapter|ControllerHandlerAdapter}, for {@link RouteMappingHandler|RouteMappingHandler} and {@link Controller|Controller} interfaces, respectively. A default {@link MetadataHandlerAdapter|MetadataHandlerAdapter} will be registered as well. RouteHandlerAdapter objects can be added as values in the application context, overriding the default RouteHandlerAdapters. Like HandlerMappings, RouteHandlerAdapters can be given any name.
 * * The dispatcher's error resolution strategy can be specified via a {@link RouteHandlerErrorResolver|HandlerErrorResolver}, for example mapping certain exceptions to error pages. Default is {@link DefaultRouteHandlerErrorResolver|DefaultRouteHandlerErrorResolver}. HandlerErrorResolvers can be overridden through the application context. HandlerErrorResolver can be given any name.
 * * Its view resolution strategy can be specified via a {@link ViewResolver|ViewResolver} implementation, resolving symbolic view names into {@link View|View} objects. Default is {@link InternalResourceViewResolver|InternalResourceViewResolver}. ViewResolver objects can be added as values in the application context, overriding the default ViewResolver. ViewResolvers can be given any name.
 * * Its language resolution strategy is determined by a {@link LanguageResolver|LanguageResolver}. The out-of-the-box implementation works via {@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator|navigator} object. The LanguageResolver name is "languageResolver"; default is {@link NavigatorLanguageResolver|NavigatorLanguageResolver}.
 * * Its theme resolution strategy is determined by a {@link ThemeResolver|ThemeResolver}. Implementations for a fixed theme and cookie resolved theme are included. The ThemeResolver name is "themeResolver"; default is {@link FixedThemeResolver|FixedThemeResolver}.
 * @implements module:router.RouteDispatcher
 * @implements module:router.RouteRenderer
 * @see module:dispatcher.AsRouteHandlerAdapterStrategy
 * @see module:dispatcher.AsRouteHandlerMappingStrategy
 * @see module:dispatcher.AsRouteErrorResolverStrategy
 * @see module:dispatcher.AsLanguageResolverStrategy
 * @see module:dispatcher.AsRouteToViewNameTranslatorStrategy
 * @see module:dispatcher.AsThemeResolverStrategy
 * @see module:dispatcher.AsViewMappingStrategy
 * @see module:dispatcher.AsViewResolverStrategy
 */
export declare class BrowserDispatcher extends BrowserDispatcher_base implements RouteDispatcher, RouteRenderer {
    defaultViewName: string;
    get [Symbol.toStringTag](): string;
    dispatch(route: Route): Promise<void>;
    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {Promise}
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