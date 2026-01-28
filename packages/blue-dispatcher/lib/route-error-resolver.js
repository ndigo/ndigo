/**
 * @author Jeff Rose
 */
import { FrameworkError, ApplicationError } from '@blue/core';
import { ModelAndView } from './model-and-view';
import { RouteHandlerMethod, ErrorHandlerMethod } from './route-handler-method';
import { errorMapping, likeErrorHandler } from './error-mapping';
import { $aware } from '@blue/factory';
/**
 * Interface to be implemented by classes that can resolve errors thrown during route mapping or execution. Implementors are typically registered as values in the application context.
 */
/**
 * Try to resolve the error that was thrown during route handler execution, returning a {@link ModelAndView|ModelAndView} that represents the specific error page, if appropriate.
 * The returned `ModelAndView` may be empty to indicate the error has been resolved but that no view should be rendered.
 * @param {module:router.Route} route The current route
 * @param {*} handler The executed route handler or `null` if none chosen at the time of the error.
 * @param {Error} error
 * @returns {module:dispatcher.ModelAndView} A corresponding `ModelAndView` to forward to or `null`.
 */
const { defineProperty, getPrototypeOf } = Reflect, { keys } = Object, getErrorHandlerMethodForError = function (errorHandler, error) {
    const /**
         * ! THIS DID NOT WORK UNLESS getPrototypeOf WAS USED!!!!
         */ handlerKeys = keys(getPrototypeOf(errorHandler)), length = handlerKeys.length;
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
export class AbstractRouteErrorResolver {
    mappedHandlers;
    mappedHandlerClasses;
    get [Symbol.toStringTag]() {
        return 'HandlerErrorResolver';
    }
    constructor() {
        this.mappedHandlers = null;
        this.mappedHandlerClasses = [Object];
    }
    resolveError(route, handler, error) {
        if (this._shouldApplyTo(route, handler)) {
            const result = this._resolveError(route, handler, error);
            return result;
        }
        else {
            return null;
        }
    }
    _shouldApplyTo(route, handler) {
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
}
export class AbstractHandlerMethodErrorResolver extends AbstractRouteErrorResolver {
    _shouldApplyTo(route, handler) {
        if (!handler) {
            return super._shouldApplyTo(route, null);
        }
        else if (handler instanceof RouteHandlerMethod) {
            return super._shouldApplyTo(route, handler.handler);
        }
        return false;
    }
    _resolveError(route, handler, error) {
        return this._resolveHandlerMethodError(route, handler, error);
    }
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
    _resolveError(route, handler, error) {
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
        }
        catch (e) {
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
export class MetadataErrorResolver extends AbstractHandlerMethodErrorResolver {
    applicationContext;
    get [$aware]() {
        return true;
    }
    setApplicationContext(applicationContext) {
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    _getErrorHandlerMethod(handlerMethod, error) {
        let errorHandlerMethod = null;
        if (handlerMethod) {
            errorHandlerMethod = getErrorHandlerMethodForError(handlerMethod.handler, error);
        }
        if (!errorHandlerMethod) {
            const { applicationContext } = this;
            if (applicationContext) {
                const contextKeys = keys(applicationContext), length = contextKeys.length;
                if (length) {
                    for (let index = 0; index < length; index++) {
                        const key = contextKeys[index], value = applicationContext.getValue(key);
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
    _resolveHandlerMethodError(route, handlerMethod, error) {
        const errorHandlerMethod = this._getErrorHandlerMethod(handlerMethod, error);
        if (!errorHandlerMethod) {
            return null;
        }
        try {
            return errorHandlerMethod.invoke(route, error, handlerMethod);
        }
        catch (e) {
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
    defaultErrorView;
    errorMappings;
    get [Symbol.toStringTag]() {
        return 'SimpleMappingErrorResolver';
    }
    constructor(defaultErrorView) {
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
            value: new Map(),
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
    _resolveError(route, handler, error) {
        const { errorMappings } = this, errorView = errorMappings.has(error.name) ? errorMappings.get(error.name) : this.defaultErrorView;
        if (errorView) {
            const mv = new ModelAndView(errorView);
            //mv.error = error;
            return mv;
        }
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtZXJyb3ItcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtZXJyb3ItcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQWlCLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM3RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFNdkM7O0dBRUc7QUFFSDs7Ozs7OztHQU9HO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlDLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUNqQiw2QkFBNkIsR0FBRyxVQUFVLFlBQVksRUFBRSxLQUFLO0lBQ3pELE1BQU07O1dBRUMsQ0FDSCxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUNoRCxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ1QsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcs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