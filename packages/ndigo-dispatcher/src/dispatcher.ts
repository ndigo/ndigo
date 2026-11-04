/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Null } from '@ndigo/core';
import { View } from '@ndigo/view';
import { Route, applyNegotiatedLanguage } from '@ndigo/router';
import { $aware } from '@ndigo/factory';
import { ApplicationContext, likeApplicationContextAware } from '@ndigo/context';
import { VIEW_TARGET } from './context-tokens';

import { NoHandlerFoundError, NoViewFoundError } from './error';
import { RouteHandlerAdapter } from './route-handler-adapter';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { ModelAndView } from './model-and-view';
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
 * Route attribute key under which the dispatcher records a dispatch/render
 * failure that it swallowed (DSV-B1).
 *
 * The dispatcher must not reject `dispatch()` — browser callers invoke
 * `void dispatcher.dispatch(route)` — so a handler-adapter, view-resolution,
 * or render failure that remains after `completeHandle` interceptors have run
 * is written to `route.attributes[DISPATCH_ERROR_ATTRIBUTE]` instead. A
 * platform adapter that owns an HTTP response reads it back with
 * {@link getDispatchError} to finalize a deterministic error response rather
 * than leaving the request open. The value is the `Error` that remained
 * unhandled; the attribute is absent when dispatch completed cleanly (or when
 * a resolved error view / streaming view already produced a response).
 */
export const DISPATCH_ERROR_ATTRIBUTE = '__dispatch:error';

/**
 * Records a swallowed dispatch failure on the route (DSV-B1).
 *
 * @param route - The route the dispatch was processing.
 * @param error - The error that remained unhandled after `completeHandle`.
 */
export function setDispatchError(route: Route, error: Error): void {
    if (route.attributes) {
        route.attributes[DISPATCH_ERROR_ATTRIBUTE] = error;
    }
}

/**
 * Reads the swallowed dispatch failure recorded on the route, if any.
 *
 * @param route - The route the dispatch was processing.
 * @returns The recorded error, or `null` when dispatch completed
 *   without an unhandled failure.
 */
export function getDispatchError(route: Route): Error | null {
    return (route.attributes?.[DISPATCH_ERROR_ATTRIBUTE] as Error | undefined) ?? null;
}

/**
 * An abstract, platform-independent application dispatcher.
 *
 * Dispatches routes to registered handlers, providing mapping, interceptors,
 * error handling, and view rendering. It is DOM-free: the view target is
 * resolved from the application context, so browser and Node specializations
 * extend this base (e.g. `@ndigo/platform-web`'s `BrowserDispatcher` and
 * `@ndigo/platform-node`'s `NodeDispatcher`).
 *
 * It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.
 */
export class AbstractDispatcher
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
     * Marks the value as `Aware` for the factory's aware injection, so the
     * application context is injected when the dispatcher is registered as an
     * entry.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * Injects the owning application context, used by {@link start} to
     * initialize strategies.
     *
     * @param context - The application context that owns this dispatcher.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.applicationContext = context;
    }

    #lifecycleStarted: boolean = false;

    /** `SmartLifecycle` — whether the lifecycle has driven strategy init. */
    get isRunning(): boolean {
        return this.#lifecycleStarted;
    }

    /** `SmartLifecycle` — initialize after the handler mapping, before the server. */
    readonly phase = -90;

    /** `SmartLifecycle` — dispatchers must initialize once the context refreshes. */
    readonly isAutoStartup = true;

    /**
     * `SmartLifecycle` — initialize strategies from the application context.
     * Runs on refresh, after every configuration has registered.
     */
    start(): void {
        this.#lifecycleStarted = true;
        if (this.applicationContext) {
            this.initStrategies(this.applicationContext);
        }
    }

    /**
     * `SmartLifecycle` — strategies are immutable once initialized; nothing to
     * release. Present so this type is a well-behaved lifecycle bean.
     */
    stop(): void {
        this.#lifecycleStarted = false;
    }
    /**
     * Views obtained through the resolver chain. Resolvers cache their
     * instances (singletons owned by the cache), so the dispatcher must not
     * destroy them — only handler-created (ephemeral) views are destroyed
     * when replaced.
     */
    readonly #resolvedViews = new WeakSet<View>();

    /**
     * Returns the string tag for this dispatcher.
     */
    get [Symbol.toStringTag](): string {
        return 'AbstractDispatcher';
    }

    private _isDestroyableView(view: View): view is View & { destroy(): void | Promise<void> } {
        return !!view && typeof view.destroy === 'function';
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

            // Interceptors run BEFORE handler-adapter resolution (standard MVC
            // ordering): a denial (auth, CSRF, CORS preflight short-circuit)
            // must be able to finalize a response even when no adapter
            // supports the handler — e.g. an unmatched-route preflight.
            if ((await mappedHandler.applyPreHandle(route)) === false) {
                await this._processDispatchResult(route, mappedHandler, null, null);
                return;
            }

            const handlerAdapter: RouteHandlerAdapter = this.getHandlerAdapter(mappedHandler.handler);

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

        // Expose the negotiated language to views and templates.
        applyNegotiatedLanguage(route, language);

        let view: View | null = null;

        if (viewName) {
            // Content negotiation reads per-call request data (Accept header,
            // path extension) from the route threaded through resolution.
            view = await this._resolveViewName(viewName, language, route);
            if (!view) {
                throw new NoViewFoundError(viewName as string, route);
            }
            // Resolved views are owned by the resolver chain (cached
            // singletons) — never destroy them when replaced.
            this.#resolvedViews.add(view);
        } else {
            view = mv?.view;
            if (!view) {
                throw new NoViewFoundError(viewName ?? '', route);
            }
        }

        if (likeApplicationContextAware(view)) {
            view.setApplicationContext(this.applicationContext);
        }

        const viewTarget = this.applicationContext.getValue(VIEW_TARGET);
        await view.render(mv.model, route, viewTarget);

        const previousView = this.#activeView;
        this.#activeView = view;

        if (
            previousView &&
            previousView !== view &&
            this._isDestroyableView(previousView) &&
            !this.#resolvedViews.has(previousView)
        ) {
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
     * @returns A {@link ModelAndView} if the error was resolved; when every resolver
     * declines, the original error is rethrown so `completeHandle` interceptors
     * observe the handler failure rather than a synthetic TypeError.
     * @throws {Error} The original handler error when no resolver handles it.
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

        // No resolver claimed the error: surface the original failure (same
        // object, stack and `cause` intact) instead of a synthetic TypeError.
        throw error;
    }

    /**
     * Resolves a view name into a {@link View} object using registered view resolvers.
     * @param viewName - The name of the view to resolve.
     * @param language - The language to use for view resolution.
     * @param request - The request/route carrying negotiation data for this resolution.
     * @returns A Promise that resolves to the {@link View} object, or `null` if not found.
     */
    protected async _resolveViewName(viewName: string, language: string, request?: unknown): Promise<View | null> {
        let index = 0,
            view: View | null = null;
        const length = this.viewResolvers.length;

        for (; index < length; index++) {
            // oxlint-disable-next-line no-await-in-loop -- resolvers run in priority order with first-match-wins; parallelizing would execute every resolver and change which view wins.
            view = await this.viewResolvers[index].resolveViewName(viewName, language, request);
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
        let dispatchError = error,
            // A successful render already produced the response, so a lingering
            // dispatch error (interceptors still observe the original handler
            // failure) must not be recorded as unhandled.
            rendered = false;

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
                rendered = true;
            } catch (err) {
                dispatchError = err as Error;
            }
        }

        await mappedHandler?.triggerCompleteHandle(route, dispatchError ?? undefined);

        // DSV-B1: the dispatcher must not reject `dispatch()` (browser callers
        // invoke it fire-and-forget), so record the failure that remained after
        // `completeHandle` for the platform adapter to finalize. A resolved
        // error view or a completed streaming view already produced a response,
        // so only record when nothing rendered.
        if (dispatchError && !rendered) {
            setDispatchError(route, dispatchError);
        }
    }
}

/**
 * * Developer Notes
 * ? Should abstract classes be created?
 * Two abstract classes could be derived from AbstractDispatcher, an AbstractRouteDispatcher and an AbstractRouteRenderer. Then AbstractDispatcher would extend those two classes and provide
 * an implementation of _processDispatchResult which would unify the two abstract classes.
 *
 * ? Should EventEmitter be used?
 * There should either be an Event-based implementation of Dispatcher that mixes in AsEventEmitter or that should be intrinsic to AbstractDispatcher itself. This would allow Dispatcher to emit
 * lifecycle events similar to today's sysytem. There could even be an event-based implementation of RouteHandlerInterceptors; however currently if a RouteHandlerInterceptor preHandle returns false, handler
 * execution stops. That may not be possible with an event based system without enhancements to Emitter.
 */
