/**
 * @author Jeff Rose
 */
import { Null } from '@blue/core';
import { NoHandlerFoundError, NoViewFoundError } from './error';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { AsRouteHandlerAdapterStrategy } from './strategies/route-handler-adapter-strategy';
import { AsRouteHandlerMappingStrategy } from './strategies/route-handler-mapping-strategy';
import { AsLanguageResolverStrategy } from './strategies/language-resolver-strategy';
import { AsRouteToViewNameTranslatorStrategy } from './strategies/route-to-view-name-translator-strategy';
import { AsThemeResolverStrategy } from './strategies/theme-resolver-strategy';
import { AsRouteErrorResolverStrategy } from './strategies/route-error-resolver-strategy';
import { AsViewResolverStrategy } from './strategies/view-resolver-strategy';
import { AsStrategyInitializer } from './strategies/strategy-initializer';
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
export class BrowserDispatcher extends AsViewResolverStrategy(AsRouteErrorResolverStrategy(AsThemeResolverStrategy(AsRouteToViewNameTranslatorStrategy(AsLanguageResolverStrategy(AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null)))))))) {
    defaultViewName = 'index';
    get [Symbol.toStringTag]() {
        return 'BrowserDispatcher';
    }
    async dispatch(route) {
        let dispatchError = null, mappedHandler = null, mv = null;
        console.log('Dispatcher::dispatch', route);
        try {
            mappedHandler = this.getHandler(route);
            console.log('- Dispatcher::Mapped Handler', mappedHandler);
            if (!mappedHandler) {
                throw new NoHandlerFoundError(route);
            }
            const handlerAdapter = this.getHandlerAdapter(mappedHandler.handler);
            console.log('- Dispatcher::Handler Adapter', handlerAdapter);
            if (mappedHandler.applyPreHandle(route) === false) {
                return;
            }
            mv = await handlerAdapter.handle(route, mappedHandler.handler);
            this._applyDefaultViewName(route, mv);
            mappedHandler.applyPostHandle(route, mv);
        }
        catch (error) {
            dispatchError = error;
        }
        return this._processDispatchResult(route, mappedHandler, mv, dispatchError).catch(function (error) {
            mappedHandler?.triggerCompleteHandle(route, error);
            // TODO Using logging system
            console.log(error);
        });
    }
    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {Promise}
     */
    async render(mv, route) {
        console.log('Dispatcher::render', mv, route);
        const language = this.languageResolver ? this.languageResolver.resolveLanguage(route) : '', viewName = mv.viewName;
        let view;
        if (viewName) {
            console.log('Dispatcher::render::viewName', viewName);
            view = await this._resolveViewName(viewName, language);
            if (!view) {
                throw new NoViewFoundError(viewName, route);
            }
        }
        else {
            view = mv.view;
            if (!view) {
                throw new NoViewFoundError(viewName, route);
            }
        }
        try {
            view.render(mv, route);
        }
        catch (e) {
            // TODO ADD A REAL CATCH BLOCK
            console.log('UNABLE TO RENDER');
        }
    }
    _processHandlerError(route, handler, error) {
        let mav = null;
        console.log('Dispatcher::_processHandlerError', route, handler, error.message);
        this.errorResolvers.some(function (resolver) {
            mav = resolver.resolveError(route, handler, error);
            console.log('Dispatcher::_processHandlerError::resolver', resolver, mav);
            return !!mav;
        });
        if (mav) {
            if (!mav.view && !mav.viewName) {
                mav.viewName = this.defaultViewName;
            }
            return mav;
        }
        throw new TypeError('view name is undefined');
    }
    async _resolveViewName(viewName, language) {
        console.log('Dispatcher::resolveViewName', viewName, language);
        let index = 0, view = null;
        const length = this.viewResolvers.length;
        for (; index < length; index++) {
            view = await this.viewResolvers[index].resolveViewName(viewName, language);
            if (view) {
                return view;
            }
        }
        return view;
    }
    _applyDefaultViewName(route, mv) {
        console.log('Dispatcher::_applyDefaultViewName', route, mv);
        if (mv && !mv.hasView) {
            const defaultViewName = this.getDefaultViewName(route);
            if (defaultViewName) {
                mv.viewName = defaultViewName;
            }
        }
    }
    async _processDispatchResult(route, mappedHandler, mv, error) {
        console.log('Dispatcher::_processDispatchResult', route, mappedHandler, mv, error && error.message);
        if (error) {
            const handler = mappedHandler instanceof RouteHandlerExecutionChain ? mappedHandler.handler : null;
            mv = this._processHandlerError(route, handler, error);
        }
        if (mv) {
            try {
                await this.render(mv, route);
                mappedHandler ?? mappedHandler.triggerCompleteHandle(route, null);
            }
            catch (e) {
                // TODO Better error handling. Use logger.
                console.error(e);
            }
        }
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUlsQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFaEUsT0FBTywwQkFBMEIsTUFBTSxpQ0FBaUMsQ0FBQztBQUd6RSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUM1RixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUM1RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNyRixPQUFPLEVBQUUsbUNBQW1DLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUMxRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQVUxRTs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sT0FBTyxpQkFDVCxTQUFRLHNCQUFzQixDQUMxQiw0QkFBNEIsQ0FDeEIsdUJBQXVCLENBQ25CLG1DQUFtQyxDQUMvQiwwQkFBMEIsQ0FDdEIsNkJBQTZCLENBQUMsNkJBQTZCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUM1RixDQUNKLENBQ0osQ0FDSixDQUNKO0lBR0QsZUFBZSxHQUFXLE9BQU8sQ0FBQztJ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