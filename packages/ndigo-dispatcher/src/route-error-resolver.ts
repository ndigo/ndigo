/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable } from '@ndigo/core';
import { ModelAndView } from './model-and-view';
import { Route } from '@ndigo/router';
import { ApplicationContextAware, ApplicationContext } from '@ndigo/context';
import { RouteHandlerMethod, ErrorHandlerMethod } from './route-handler-method';
import { errorMapping, likeErrorHandler } from './error-mapping';
import { $aware } from '@ndigo/factory';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-dispatcher:route-error-resolver');

/**
 * Collects the class names along an error's constructor prototype chain,
 * most-derived first (the error's own class, then each base class), skipping
 * anonymous mixin frames. Used to match an error against mappings keyed by any
 * of its ancestor class names.
 *
 * @param error - The thrown error.
 * @returns The non-empty class names, subclass before base.
 */
const collectErrorClassNames = (error: Error): string[] => {
    const names: string[] = [];
    let ctor: unknown = error.constructor;
    while (typeof ctor === 'function' && ctor !== Function.prototype) {
        const name = ctor.name;
        if (name) names.push(name);
        const parent: unknown = Object.getPrototypeOf(ctor);
        if (parent === Function.prototype || parent === null) break;
        ctor = parent;
    }
    return names;
};

/**
 * Returns the depth (0 = the error's own class) of the first class along the
 * error's prototype chain whose name *contains* the mapping key, or `-1` when
 * no class matches. Mirrors the `SimpleMappingExceptionResolver` depth
 * search so the most specific (deepest) substring mapping wins.
 *
 * @param mapping - The substring mapping key.
 * @param error - The thrown error.
 * @returns The matched depth, or `-1`.
 */
const errorClassMatchDepth = (mapping: string, error: Error): number => {
    let ctor: unknown = error.constructor,
        depth = 0;
    while (typeof ctor === 'function' && ctor !== Function.prototype) {
        if (ctor.name.includes(mapping)) return depth;
        const parent: unknown = Object.getPrototypeOf(ctor);
        if (parent === Function.prototype || parent === null) break;
        ctor = parent;
        depth++;
    }
    return -1;
};

/**
 * Resolves exceptions into a route-specific response.
 */
export interface RouteErrorResolver {
    /**
     * Resolve a route handler error into a model and view.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred, or `null`.
     * @param error - The thrown error.
     * @returns A model and view to render, or `null` when the error should continue through the chain.
     */
    resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null;
}

const { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object,
    getErrorHandlerMethodForError = function (errorHandler: object, error: Error): ErrorHandlerMethod | null {
        // Walk the whole prototype chain: a base-class-declared error handler
        // is an own enumerable property of the base prototype, not of the
        // instance's immediate prototype. Each key is checked once, at the
        // nearest prototype level where it is declared.
        let errorHandlerPrototype: object | null = getPrototypeOf(errorHandler) as object | null;
        const checkedKeys = new Set<string>();
        while (errorHandlerPrototype !== null) {
            const handlerKeys = keys(errorHandlerPrototype),
                length = handlerKeys.length;
            for (let index = 0; index < length; index++) {
                const key = handlerKeys[index];
                if (checkedKeys.has(key)) {
                    continue;
                }
                checkedKeys.add(key);
                if (errorMapping.has(errorHandler, key)) {
                    const errorClasses = errorMapping.get(errorHandler, key);
                    if (errorClasses.some((errorClass) => error instanceof errorClass)) {
                        return new ErrorHandlerMethod(errorHandler, key);
                    }
                }
            }
            errorHandlerPrototype = getPrototypeOf(errorHandlerPrototype) as object | null;
        }

        return null;
    };

export abstract class AbstractRouteErrorResolver implements RouteErrorResolver {
    /**
     * Handlers explicitly targeted by this resolver, if any.
     */
    mappedHandlers: object[] | null;

    /**
     * Handler classes explicitly targeted by this resolver, if any.
     */
    mappedHandlerClasses: Constructable[];

    get [Symbol.toStringTag](): string {
        return 'HandlerErrorResolver';
    }

    constructor() {
        this.mappedHandlers = null;
        this.mappedHandlerClasses = [];
    }

    /**
     * Resolve an error only when this resolver applies to the current handler.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A resolved model and view, or `null` when this resolver does not apply.
     */
    resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        if (this._shouldApplyTo(route, handler)) {
            const result: ModelAndView | null = this._resolveError(route, handler, error);
            return result;
        } else {
            return null;
        }
    }

    /**
     * Determine whether this resolver should be applied to the given handler.
     *
     * @param route - The current route.
     * @param handler - The candidate handler.
     * @returns `true` when the resolver should handle the error.
     */
    protected _shouldApplyTo(route: Route, handler: object | null): boolean {
        const { mappedHandlers, mappedHandlerClasses } = this;
        if (handler) {
            if (mappedHandlers && mappedHandlers.indexOf(handler) !== -1) {
                return true;
            }
            if (mappedHandlerClasses) {
                const length = mappedHandlerClasses.length;
                if (length) {
                    for (let index = 0; index < length; index++) {
                        const mappedHandlerClass = mappedHandlerClasses[index];
                        if (handler instanceof mappedHandlerClass) {
                            return true;
                        }
                    }
                }
            }
        }

        return !mappedHandlers && (!mappedHandlerClasses || mappedHandlerClasses.length === 0);
    }

    /**
     * Resolve the error once applicability has been established.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A resolved model and view, or `null` to continue resolution.
     */
    protected abstract _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null;
}

export abstract class AbstractHandlerMethodErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Narrow applicability to wrapped route handler methods.
     *
     * @param route - The current route.
     * @param handler - The candidate handler.
     * @returns `true` when the wrapped handler method should be considered.
     */
    protected _shouldApplyTo(route: Route, handler: object | null): boolean {
        if (!handler) {
            return super._shouldApplyTo(route, null);
        } else if (handler instanceof RouteHandlerMethod) {
            return super._shouldApplyTo(route, (handler as RouteHandlerMethod).handler);
        }

        return false;
    }

    /**
     * Delegate resolution to the wrapped handler method.
     *
     * @param route - The current route.
     * @param handler - The wrapped handler method's target.
     * @param error - The thrown error.
     * @returns A resolved model and view, or `null`.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        return this._resolveHandlerMethodError(route, handler as RouteHandlerMethod, error);
    }

    /**
     * Resolve an error for a specific handler method.
     *
     * @param route - The current route.
     * @param handlerMethod - The handler method that failed.
     * @param error - The thrown error.
     * @returns A model and view, or `null` when the error is not handled.
     */
    protected _resolveHandlerMethodError(
        route: Route,
        handlerMethod: RouteHandlerMethod,
        error: Error
    ): ModelAndView | null {
        const errorHandlerMethod = this._getErrorHandlerMethod(handlerMethod, error);

        if (!errorHandlerMethod) {
            return null;
        }

        try {
            return errorHandlerMethod.invoke(route, error, handlerMethod);
        } catch {
            return null;
        }
    }

    /**
     * Find the first error handler method that matches the thrown error.
     *
     * @param handlerMethod - The handler method that failed.
     * @param error - The thrown error.
     * @returns A matching error handler method, or `null`.
     */
    protected _getErrorHandlerMethod(handlerMethod: RouteHandlerMethod, error: Error): ErrorHandlerMethod | null {
        // This method is defined in the subclass
        return null;
    }
}

/**
 * The default implementation of the {@link RouteErrorResolver|RouteErrorResolver} interface, resolving standard Ndigo exceptions.
 *
 * This error resolver is enabled by default in the `WebDispatcher`.
 *
 * Error classes are mapped to view names via `errorMappings`.  Out of the box it
 * maps `FrameworkError` to `'error/framework'` and `ApplicationError`
 * to `'error/application'`.  Additional mappings can be added through
 * {@link setErrorMapping}.
 *
 * Mapping keys match a class name *exactly*, but the lookup walks the thrown
 * error's prototype chain most-derived first, so a base-class mapping (e.g.
 * `'FrameworkError'`) also covers its subclasses while a subclass-specific
 * key takes precedence.  Unmapped errors fall back to
 * {@link defaultErrorView}.
 */
export class DefaultRouteErrorResolver extends AbstractRouteErrorResolver {
    /**
     * View name used when no specific error mapping matches.
     */
    defaultErrorView!: string;

    /**
     * Error-name-to-view-name mappings.
     */
    errorMappings!: Map<string, string>;

    get [Symbol.toStringTag](): string {
        return 'DefaultRouteErrorResolver';
    }

    /**
     * Create a resolver with sensible defaults for framework and application errors.
     *
     * @param defaultErrorView - The fallback view name (defaults to `'error/default'`).
     */
    constructor(defaultErrorView: string = 'error/default') {
        super();

        defineProperty(this, 'defaultErrorView', {
            value: defaultErrorView,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, 'errorMappings', {
            value: new Map<string, string>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        // Pre-configure standard framework error mappings.
        this.errorMappings.set('FrameworkError', 'error/framework');
        this.errorMappings.set('ApplicationError', 'error/application');
    }

    /**
     * Register an additional error-class-name-to-view-name mapping.
     *
     * The key is matched exactly against each class name on the error's
     * prototype chain, most-derived first (see the class docs).
     *
     * @param errorName - The error class name (e.g. `'IllegalStateError'`).
     * @param viewName - The view name to render for this error.
     */
    setErrorMapping(errorName: string, viewName: string): void {
        this.errorMappings.set(errorName, viewName);
    }

    /**
     * Resolve built-in framework errors to configured error views.
     *
     * Looks up the error's constructor name in {@link errorMappings}.
     * Falls back to {@link defaultErrorView} when no mapping is found.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A model and view for the error, or `null` on failure.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        try {
            // Exact key match, but against EVERY class name on the error's
            // prototype chain (most-derived first): the preconfigured
            // `FrameworkError`/`ApplicationError` mappings therefore apply to
            // their subclasses, and a subclass-specific key still wins.
            let errorView: string | undefined;
            const errorNames = collectErrorClassNames(error),
                length = errorNames.length;
            for (let index = 0; index < length; index++) {
                errorView = this.errorMappings.get(errorNames[index]);
                if (errorView !== undefined) break;
            }

            return new ModelAndView(errorView ?? this.defaultErrorView);
        } catch (e) {
            // @ndigo/telemetry instruments @ndigo/dispatcher, so importing
            // telemetry here would create a circular dependency; @ndigo/log is
            // the lightweight logging core both packages can share
            // (Initiative 1).
            logger.warn('[DefaultRouteErrorResolver] Failure while resolving error:', {
                error: error?.constructor?.name ?? 'Unknown',
                message: error?.message,
                resolutionError: (e as Error)?.message,
            });
        }

        return null;
    }
}

/**
 * An {@link AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
 */
export class MetadataErrorResolver extends AbstractHandlerMethodErrorResolver implements ApplicationContextAware {
    /**
     * Application context used to discover error handlers.
     */
    applicationContext!: ApplicationContext | null;

    get [$aware](): boolean {
        return true;
    }

    /**
     * Store the application context for later error-handler lookup.
     *
     * @param applicationContext - The application context to use.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Find the first error handler method that matches the thrown error.
     *
     * @param handlerMethod - The handler method that failed.
     * @param error - The thrown error.
     * @returns A matching error handler method, or `null`.
     */
    protected _getErrorHandlerMethod(handlerMethod: RouteHandlerMethod, error: Error): ErrorHandlerMethod | null {
        let errorHandlerMethod: ErrorHandlerMethod | null = null;

        if (handlerMethod) {
            errorHandlerMethod = getErrorHandlerMethodForError(handlerMethod.handler, error);
        }

        if (!errorHandlerMethod) {
            const { applicationContext } = this;
            if (applicationContext) {
                const contextKeys = keys(applicationContext),
                    length = contextKeys.length;
                if (length) {
                    for (let index = 0; index < length; index++) {
                        const key = contextKeys[index],
                            value = applicationContext.getValue(key);
                        if (likeErrorHandler(value)) {
                            // likeErrorHandler true implies an object value;
                            // widen only here, at the boundary.
                            errorHandlerMethod = getErrorHandlerMethodForError(value as object, error);
                            if (errorHandlerMethod) {
                                return errorHandlerMethod;
                            }
                        }
                    }
                }
            }
        }

        return errorHandlerMethod;
    }

    /**
     * Resolve an error by invoking a matching error handler method.
     *
     * @param route - The current route.
     * @param handlerMethod - The failed handler method.
     * @param error - The thrown error.
     * @returns The error handler's model and view, or `null`.
     */
    protected _resolveHandlerMethodError(
        route: Route,
        handlerMethod: RouteHandlerMethod,
        error: Error
    ): ModelAndView | null {
        const errorHandlerMethod = this._getErrorHandlerMethod(handlerMethod, error);

        if (!errorHandlerMethod) {
            return null;
        }

        try {
            return errorHandlerMethod.invoke(route, error, handlerMethod);
        } catch {
            return null;
        }
    }
}

/**
 * {@link RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the `Dispatcher`.
 * @see `Dispatcher`
 */
export class SimpleMappingErrorResolver extends AbstractRouteErrorResolver {
    /**
     * View name used when no specific error mapping matches.
     */
    defaultErrorView!: string | null;

    /**
     * Error-name-to-view-name mappings.
     */
    errorMappings!: Map<string, string> | null;

    get [Symbol.toStringTag](): string {
        return 'SimpleMappingErrorResolver';
    }

    /**
     * Create a resolver backed by simple error-name mappings.
     *
     * @param defaultErrorView - The fallback view name to use when no mapping matches.
     */
    constructor(defaultErrorView?: string) {
        super();
        /**
         */
        defineProperty(this, 'defaultErrorView', {
            value: defaultErrorView || null,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        /**
         * Set the mappings between error class names and error view names. The error class name can be a substring, with no wildcard support.
         *
         * Consider carefully how specific the pattern is. For example, "Error" will match nearly anything, and will probably hide other rules.
         */
        defineProperty(this, 'errorMappings', {
            value: new Map<string, string>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Actually resolve the given error that got thrown during on handler execution, returning a `ModelAndView` that represents a specific error page if appropriate.
     *
     * May be overridden in subclasses, in order to apply specific error checks.
     * @protected
     * @param {module:router.Route} route The current route.
     * @param {*} handler The executed handler or `null` if none chosen at the time of the error.
     * @param {Error} error The error that was thrown during execution.
     * @returns {module:dispatcher.ModelAndView} The corresponding `ModelAndView` to forward to or `null` for default processing in the resolution chain.
     */
    /**
     * Resolve an error by matching configured substring mappings against the
     * error's class-name hierarchy (deepest match wins), falling back to
     * {@link defaultErrorView}.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The error that was thrown during execution.
     * @returns The mapped model and view, or `null` when no mapping applies.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        const { errorMappings } = this;
        let errorView: string | null = null;

        if (errorMappings && errorMappings.size) {
            // Documented substring semantics: a mapping key matches when it is
            // a substring of any class name on the error's prototype chain,
            // and the DEEPEST match wins (most specific). Insertion order
            // breaks equal-depth ties (first declared wins).
            let bestDepth = Number.POSITIVE_INFINITY;
            for (const [mapping, view] of errorMappings) {
                const depth = errorClassMatchDepth(mapping, error);
                if (depth >= 0 && depth < bestDepth) {
                    bestDepth = depth;
                    errorView = view;
                }
            }
        }

        errorView ??= this.defaultErrorView;

        if (errorView) {
            const mv = new ModelAndView(errorView);
            //mv.error = error;
            return mv;
        }

        return null;
    }
}
