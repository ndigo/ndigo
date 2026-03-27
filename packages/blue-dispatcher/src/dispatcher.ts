/**
 * @author Jeff Rose
 */

import { Null } from '@blue/core';
import { View, ViewTarget } from '@blue/view';
import { Route } from '@blue/router';
import { ApplicationContext, likeApplicationContextAware } from '@blue/context';

import { NoHandlerFoundError, NoViewFoundError } from './error';
import { RouteHandlerAdapter } from './route-handler-adapter';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { ModelAndView } from './model-and-view';
import { RouteErrorResolver } from './route-error-resolver';
import { AsRouteHandlerAdapterStrategy } from './strategies/route-handler-adapter-strategy';
import { AsRouteHandlerMappingStrategy } from './strategies/route-handler-mapping-strategy';
import { AsLanguageResolverStrategy } from './strategies/language-resolver-strategy';
import { AsRouteToViewNameTranslatorStrategy } from './strategies/route-to-view-name-translator-strategy';
import { AsThemeResolverStrategy } from './strategies/theme-resolver-strategy';
import { AsRouteErrorResolverStrategy } from './strategies/route-error-resolver-strategy';
import { AsViewResolverStrategy } from './strategies/view-resolver-strategy';
import { AsStrategyInitializer } from './strategies/strategy-initializer';

export interface RouteDispatcher {
    dispatch(route: Route): Promise<void>;
}

export interface RouteRenderer {
    render(mv: ModelAndView, route: Route): Promise<void>;
}

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
export class BrowserDispatcher
    extends AsViewResolverStrategy(
        AsRouteErrorResolverStrategy(
            AsThemeResolverStrategy(
                AsRouteToViewNameTranslatorStrategy(
                    AsLanguageResolverStrategy(
                        AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null)))
                    )
                )
            )
        )
    )
    implements RouteDispatcher, RouteRenderer
{
    applicationContext: ApplicationContext;
    defaultViewName: string = 'index';
    #activeView: View = null;

    get [Symbol.toStringTag](): string {
        return 'BrowserDispatcher';
    }

    private _isDestroyableView(view: View): view is View & { destroy(): void | Promise<void> } {
        return !!view && typeof (view as any).destroy === 'function';
    }

    async dispatch(route: Route): Promise<void> {
        let dispatchError: Error = null,
            mappedHandler: RouteHandlerExecutionChain = null,
            mv: ModelAndView = null;
        try {
            mappedHandler = this.getHandler(route);
            if (!mappedHandler) {
                throw new NoHandlerFoundError(route);
            }

            const handlerAdapter: RouteHandlerAdapter = this.getHandlerAdapter(mappedHandler.handler);

            if ((await mappedHandler.applyPreHandle(route)) === false) {
                await this._processDispatchResult(route, mappedHandler, null, null);
                return;
            }

            mv = await handlerAdapter.handle(route, mappedHandler.handler);
            this._applyDefaultViewName(route, mv);
            await mappedHandler.applyPostHandle(route, mv);
        } catch (error) {
            dispatchError = error as Error;
        }

        await this._processDispatchResult(route, mappedHandler, mv, dispatchError);
    }

    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {Promise}
     */
    async render(mv: ModelAndView, route: Route): Promise<void> {
        const language = this.languageResolver ? this.languageResolver.resolveLanguage(route) : '',
            viewName = mv.viewName;

        let view: View;

        if (viewName) {
            view = await this._resolveViewName(viewName, language);
            if (!view) {
                throw new NoViewFoundError(viewName, route);
            }
        } else {
            view = mv.view;
            if (!view) {
                throw new NoViewFoundError(viewName, route);
            }
        }

        if (likeApplicationContextAware(view)) {
            view.setApplicationContext(this.applicationContext);
        }

        const viewTarget = this.applicationContext.getValue<ViewTarget>('viewTarget');
        await view.render(mv.model, route, viewTarget);

        const previousView = this.#activeView;
        this.#activeView = view;

        if (previousView && previousView !== view && this._isDestroyableView(previousView)) {
            try {
                await previousView.destroy();
            } catch {
                // cleanup failures should not fail route rendering
            }
        }
    }

    protected _processHandlerError(route: Route, handler, error: Error): ModelAndView {
        let mav: ModelAndView = null;
        this.errorResolvers.some(function (resolver: RouteErrorResolver): boolean {
            mav = resolver.resolveError(route, handler, error);
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

    protected async _resolveViewName(viewName: string, language: string): Promise<View> {
        let index = 0,
            view: View = null;
        const length = this.viewResolvers.length;

        for (; index < length; index++) {
            view = await this.viewResolvers[index].resolveViewName(viewName, language);
            if (view) {
                return view;
            }
        }

        return view;
    }

    private _applyDefaultViewName(route: Route, mv: ModelAndView) {
        if (mv && !mv.hasView) {
            const defaultViewName = this.getDefaultViewName(route);
            if (defaultViewName) {
                mv.viewName = defaultViewName;
            }
        }
    }

    private async _processDispatchResult(
        route: Route,
        mappedHandler: RouteHandlerExecutionChain,
        mv: ModelAndView,
        error: Error
    ): Promise<void> {
        let dispatchError = error;

        if (dispatchError) {
            const handler = mappedHandler instanceof RouteHandlerExecutionChain ? mappedHandler.handler : null;
            try {
                mv = this._processHandlerError(route, handler, dispatchError);
            } catch (err) {
                dispatchError = err as Error;
            }
        }

        if (mv) {
            try {
                await this.render(mv, route);
            } catch (err) {
                dispatchError = err as Error;
            }
        }

        await mappedHandler?.triggerCompleteHandle(route, dispatchError);
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
