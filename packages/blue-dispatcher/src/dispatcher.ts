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

/**
 * Interface for dispatching routes.
 */
export interface RouteDispatcher {
    /**
     * Dispatches the given route for processing.
     * @param route - The route to dispatch.
     */
    dispatch(route: Route): Promise<void>;
}

/**
 * Interface for rendering a {@link ModelAndView}.
 */
export interface RouteRenderer {
    /**
     * Renders the given {@link ModelAndView} for the specified route.
     * @param mv - The {@link ModelAndView} to render.
     * @param route - The route associated with the {@link ModelAndView}.
     */
    render(mv: ModelAndView, route: Route): Promise<void>;
}

/**
 * An interface for creating application dispatchers. Dispatches to registered handlers for processing a route, providing convenient mapping and exception handling facilities.
 *
 * It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.
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
    /**
     * The application context.
     */
    applicationContext!: ApplicationContext;
    /**
     * The default view name to use if none is specified.
     */
    defaultViewName: string = 'index';
    #activeView: View | null = null;

    /**
     * Returns the string tag for this dispatcher.
     */
    get [Symbol.toStringTag](): string {
        return 'BrowserDispatcher';
    }

    private _isDestroyableView(view: View): view is View & { destroy(): void | Promise<void> } {
        return !!view && typeof (view as any).destroy === 'function';
    }

    /**
     * Dispatches the given route for processing.
     * @param route - The route to dispatch.
     */
    async dispatch(route: Route): Promise<void> {
        let dispatchError: Error | null = null,
            mappedHandler: RouteHandlerExecutionChain | null = null,
            mv: ModelAndView | null = null;
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

        await this._processDispatchResult(route, mappedHandler ?? null, mv, dispatchError);
    }

    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @param mv - The {@link ModelAndView} to render.
     * @param route - The route associated with the {@link ModelAndView}.
     */
    async render(mv: ModelAndView, route: Route): Promise<void> {
        const language = this.languageResolver ? this.languageResolver.resolveLanguage(route) : '',
            viewName = mv.viewName;

        let view: View | null = null;

        if (viewName) {
            view = await this._resolveViewName(viewName, language);
            if (!view) {
                throw new NoViewFoundError(viewName as string, route);
            }
        } else {
            view = mv?.view;
            if (!view) {
                throw new NoViewFoundError(viewName ?? '', route);
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

    /**
     * Processes a handler error by attempting to resolve it with registered error resolvers.
     * @param route - The current route.
     * @param handler - The handler that caused the error.
     * @param error - The error that occurred.
     * @returns A {@link ModelAndView} if the error was resolved, otherwise throws a TypeError.
     * @throws {TypeError} If no view name can be determined for the error.
     */
    protected _processHandlerError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        // Handle the case where handler might be null
        const safeHandler = handler || {};
        
        for (const resolver of this.errorResolvers) {
            const mav = resolver.resolveError(route, safeHandler, error);
            if (mav) {
                if (!mav.view && !mav.viewName) {
                    mav.viewName = this.defaultViewName;
                }
                return mav;
            }
        }

        throw new TypeError('view name is undefined');
    }

    /**
     * Resolves a view name into a {@link View} object using registered view resolvers.
     * @param viewName - The name of the view to resolve.
     * @param language - The language to use for view resolution.
     * @returns A Promise that resolves to the {@link View} object, or `null` if not found.
     */
    protected async _resolveViewName(viewName: string, language: string): Promise<View | null> {
        let index = 0,
            view: View | null = null;
        const length = this.viewResolvers.length;

        for (; index < length; index++) {
            view = await this.viewResolvers[index].resolveViewName(viewName, language);
            if (view) {
                return view;
            }
        }

        return view;
    }

    /**
     * Applies the default view name to the {@link ModelAndView} if no view is already set.
     * @param route - The current route.
     * @param mv - The {@link ModelAndView} to apply the default view name to.
     */
    private _applyDefaultViewName(route: Route, mv: ModelAndView) {
        // Only real ModelAndView returns get a default view name — a plain object
        // return is a JSON API response and must not be mutated with view metadata.
        if (mv instanceof ModelAndView && !mv.hasView) {
            const defaultViewName = this.getDefaultViewName(route);
            if (defaultViewName) {
                mv.viewName = defaultViewName;
            }
        }
    }

    /**
     * Processes the result of the dispatch operation, handling errors and rendering the view.
     * @param route - The current route.
     * @param mappedHandler - The mapped route handler execution chain.
     * @param mv - The {@link ModelAndView} produced by the handler.
     * @param error - Any error that occurred during dispatch.
     */
    private async _processDispatchResult(
        route: Route,
        mappedHandler: RouteHandlerExecutionChain | null,
        mv: ModelAndView | null,
        error: Error | null
    ): Promise<void> {
        let dispatchError = error;

        if (dispatchError) {
            const handler = mappedHandler instanceof RouteHandlerExecutionChain ? mappedHandler.handler : null;
            try {
                mv = this._processHandlerError(route, handler as object | null, dispatchError);
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

        await mappedHandler?.triggerCompleteHandle(route, dispatchError ?? undefined);
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
