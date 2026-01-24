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
     * @function module:dispatcher.BrowserDispatcher#render
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {external:Promise}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNwYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUlsQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFaEUsT0FBTywwQkFBMEIsTUFBTSxpQ0FBaUMsQ0FBQztBQUd6RSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUM1RixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUM1RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNyRixPQUFPLEVBQUUsbUNBQW1DLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUMxRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQVUxRTs7Ozs7R0FLRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE1BQU0sT0FBTyxpQkFDVCxTQUFRLHNCQUFzQixDQUMxQiw0QkFBNEIsQ0FDeEIsdUJBQXVCLENBQ25CLG1DQUFtQyxDQUMvQiwwQkFBMEIsQ0FDdEIsNkJBQTZCLENBQUMsNkJBQTZCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUM1RixDQUNKLENBQ0osQ0FDSixDQUNKO0lBR0QsZUFBZSxHQUFXLE9BQU8sQ0FBQztJQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLG1CQUFtQixDQUFDO0lBQy9CLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQVk7UUFDdkIsSUFBSSxhQUFhLEdBQVUsSUFBSSxFQUMzQixhQUFhLEdBQStCLElBQUksRUFDaEQsRUFBRSxHQUFpQixJQUFJLENBQUM7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUM7WUFDRCxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFFRCxNQUFNLGNBQWMsR0FBd0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRTdELElBQUksYUFBYSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDaEQsT0FBTztZQUNYLENBQUM7WUFFRCxFQUFFLEdBQUcsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0QyxhQUFhLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQVk7WUFDcEcsYUFBYSxFQUFFLHFCQUFxQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCw0QkFBNEI7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQWdCLEVBQUUsS0FBWTtRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDdEYsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7UUFFM0IsSUFBSSxJQUFVLENBQUM7UUFFZixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDUixNQUFNLElBQUksZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNSLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULDhCQUE4QjtZQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNMLENBQUM7SUFFUyxvQkFBb0IsQ0FBQyxLQUFZLEVBQUUsT0FBTyxFQUFFLEtBQVk7UUFDOUQsSUFBSSxHQUFHLEdBQWlCLElBQUksQ0FBQztRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBNEI7WUFDM0QsR0FBRyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6RSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzdCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxJQUFJLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFUyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtRQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQ1QsSUFBSSxHQUFTLElBQUksQ0FBQztRQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUV6QyxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM3QixJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0UsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDUCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxLQUFZLEVBQUUsRUFBZ0I7UUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxzQkFBc0IsQ0FDaEMsS0FBWSxFQUNaLGFBQXlDLEVBQ3pDLEVBQWdCLEVBQ2hCLEtBQVk7UUFFWixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNSLE1BQU0sT0FBTyxHQUFHLGFBQWEsWUFBWSwwQkFBMEIsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25HLEVBQUUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNMLElBQUksQ0FBQztnQkFDRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixhQUFhLElBQUksYUFBYSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCwwQ0FBMEM7Z0JBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFFRDs7Ozs7Ozs7OztHQVVHIn0=