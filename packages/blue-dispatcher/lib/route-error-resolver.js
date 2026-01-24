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
 * @interface module:router.RouteErrorResolver
 */
/**
 * Try to resolve the error that was thrown during route handler execution, returning a {@linkcode module:dispatcher.ModelAndView|ModelAndView} that represents the specific error page, if appropriate.
 * The returned `ModelAndView` may be empty to indicate the error has been resolved but that no view should be rendered.
 * @function module:router.RouteErrorResolver#resolveError
 * @param {module:router.Route} route The current route
 * @param {*} handler The executed route handler or `null` if none chosen at the time of the error.
 * @param {external:Error} error
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
 * @class module:dispatcher.AbstractRouteErrorResolver
 * @implements module:router.RouteErrorResolver
 */
/**
 * @abstract
 * @protected
 * @function module:dispatcher.AbstractRouteErrorResolver#_resolveError
 */
/**
 * @abstract
 * @class module:dispatcher.AbstractHandlerMethodErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 */
/**
 * The default implementation of the {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} interface, resolving standard BlueJS exceptions.
 *
 * This error resolver is enabled by default in the {@linkcode module:dispatcher.WebDispatcher|WebDispatcher}.
 * @class module:dispatcher.DefaultRouteErrorResolver
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
 * An {@linkcode module:dispatcher.AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
 * @class module:dispatcher.MetadataErrorResolver
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
 * {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the {@linkcode module:dispatcher.Dispatcher|Dispatcher}.
 * @class module:dispatcher.SimpleMappingErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @see {@link module:dispatcher.Dispatcher}
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
         * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#defaultErrorView
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
         * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#errorMappings
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
     * @function module:dispatcher.SimpleMappingErrorResolver#_resolveError
     * @param {module:router.Route} route The current route.
     * @param {*} handler The executed handler or `null` if none chosen at the time of the error.
     * @param {external:Error} error The error that was thrown during execution.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtZXJyb3ItcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtZXJyb3ItcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQWlCLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM3RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFNdkM7OztHQUdHO0FBRUg7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ2pCLDZCQUE2QixHQUFHLFVBQVUsWUFBWSxFQUFFLEtBQUs7SUFDekQsTUFBTTs7V0FFQyxDQUNILFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ2hELE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2hDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDVCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDMUMsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsR0FB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