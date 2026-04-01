/**
 * @author Jeff Rose
 */

import { Constructable, FrameworkError, ApplicationError } from '@blue/core';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
import { ApplicationContextAware, ApplicationContext } from '@blue/context';
import { RouteHandlerMethod, ErrorHandlerMethod } from './route-handler-method';
import { errorMapping, likeErrorHandler } from './error-mapping';
import { $aware } from '@blue/factory';

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
    resolveError(route: Route, handler, error: Error): ModelAndView;
}

const { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object,
    getErrorHandlerMethodForError = function (errorHandler, error): ErrorHandlerMethod {
        const /**
             * ! THIS DID NOT WORK UNLESS getPrototypeOf WAS USED!!!!
             */
            handlerKeys = keys(getPrototypeOf(errorHandler)),
            length = handlerKeys.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const key = handlerKeys[index];
                if (errorMapping.has(errorHandler, key)) {
                    const errorClasses = errorMapping.get(errorHandler, key);
                    if (errorClasses.some((errorClass) => error instanceof errorClass)) {
                        return new ErrorHandlerMethod(errorHandler, key);
                    }
                }
            }
        }

        return null;
    };

export abstract class AbstractRouteErrorResolver implements RouteErrorResolver {
    /**
     * Handlers explicitly targeted by this resolver, if any.
     */
    mappedHandlers: any[];

    /**
     * Handler classes explicitly targeted by this resolver, if any.
     */
    mappedHandlerClasses: Constructable[];

    get [Symbol.toStringTag](): string {
        return 'HandlerErrorResolver';
    }

    constructor() {
        this.mappedHandlers = null;
        this.mappedHandlerClasses = [Object];
    }

    /**
     * Resolve an error only when this resolver applies to the current handler.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A resolved model and view, or `null` when this resolver does not apply.
     */
    resolveError(route: Route, handler, error: Error): ModelAndView {
        if (this._shouldApplyTo(route, handler)) {
            const result: ModelAndView = this._resolveError(route, handler, error);
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
    protected _shouldApplyTo(route: Route, handler: object): boolean {
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

        return !mappedHandlers && !mappedHandlerClasses;
    }

    /**
     * Resolve the error once applicability has been established.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A resolved model and view, or `null` to continue resolution.
     */
    protected abstract _resolveError(route: Route, handler: object, error: Error): ModelAndView;
}

export abstract class AbstractHandlerMethodErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Narrow applicability to wrapped route handler methods.
     *
     * @param route - The current route.
     * @param handler - The candidate handler.
     * @returns `true` when the wrapped handler method should be considered.
     */
    protected _shouldApplyTo(route: Route, handler: object): boolean {
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
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView {
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
    protected abstract _resolveHandlerMethodError(
        route: Route,
        handlerMethod: RouteHandlerMethod,
        error: Error
    ): ModelAndView;
}

/**
 * @abstract
 * @implements module:router.RouteErrorResolver
 */

/**
 * @abstract
 * @protected
 */

/**
 * @abstract
 * @extends module:dispatcher.AbstractRouteErrorResolver
 */

/**
 * The default implementation of the {@link RouteErrorResolver|RouteErrorResolver} interface, resolving standard BlueJS exceptions.
 *
 * This error resolver is enabled by default in the {@link WebDispatcher|WebDispatcher}.
 * @extends module:dispatcher.AbstractRouteErrorResolver
 */
export class DefaultRouteErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Resolve built-in framework errors to the default error view.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns A default model and view when the error is recognized, otherwise `null`.
     */
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView {
        try {
            switch (error.constructor) {
                case FrameworkError: {
                    // TODO provide real implementation
                    return new ModelAndView('default');
                }
                case ApplicationError: {
                    // TODO provide real implementation
                    return new ModelAndView('default');
                }
                default: {
                    // TODO provide real implementation
                    return new ModelAndView('default');
                }
            }
        } catch (e) {
            // TODO Use real logger
            console.warn('Failure while trying to resolve error', e);
        }

        return null;
    }
}

/**
 * An {@link AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @implements module:context.ApplicationContextAware
 * @implements module:context.Initializable
 */
export class MetadataErrorResolver extends AbstractHandlerMethodErrorResolver implements ApplicationContextAware {
    /**
     * Application context used to discover error handlers.
     */
    applicationContext: ApplicationContext;

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
    protected _getErrorHandlerMethod(handlerMethod: RouteHandlerMethod, error: Error): ErrorHandlerMethod {
        let errorHandlerMethod: ErrorHandlerMethod = null;

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
                            errorHandlerMethod = getErrorHandlerMethodForError(value, error);
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
    protected _resolveHandlerMethodError(route: Route, handlerMethod: RouteHandlerMethod, error: Error): ModelAndView {
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
 * {@link RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the {@link Dispatcher|Dispatcher}.
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @see {@link Dispatcher}
 */
export class SimpleMappingErrorResolver extends AbstractRouteErrorResolver {
    /**
     * View name used when no specific error mapping matches.
     */
    defaultErrorView: string;

    /**
     * Error-name-to-view-name mappings.
     */
    errorMappings: Map<string, string>;

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
     * Resolve an error by matching its name against configured view mappings.
     *
     * @param route - The current route.
     * @param handler - The handler that was executing when the error occurred.
     * @param error - The thrown error.
     * @returns The mapped model and view, or `null` when no mapping applies.
     */
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView {
        const { errorMappings } = this,
            errorView: string = errorMappings.has(error.name) ? errorMappings.get(error.name) : this.defaultErrorView;

        if (errorView) {
            const mv = new ModelAndView(errorView);
            //mv.error = error;
            return mv;
        }

        return null;
    }
}
