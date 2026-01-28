/**
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
import { ApplicationContextAware, ApplicationContext } from '@blue/context';
import { RouteHandlerMethod, ErrorHandlerMethod } from './route-handler-method';
import { $aware } from '@blue/factory';
export interface RouteErrorResolver {
    resolveError(route: Route, handler: any, error: Error): ModelAndView;
}
export declare abstract class AbstractRouteErrorResolver implements RouteErrorResolver {
    mappedHandlers: any[];
    mappedHandlerClasses: Constructable[];
    get [Symbol.toStringTag](): string;
    constructor();
    resolveError(route: Route, handler: any, error: Error): ModelAndView;
    protected _shouldApplyTo(route: Route, handler: object): boolean;
    protected abstract _resolveError(route: Route, handler: object, error: Error): ModelAndView;
}
export declare abstract class AbstractHandlerMethodErrorResolver extends AbstractRouteErrorResolver {
    protected _shouldApplyTo(route: Route, handler: object): boolean;
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView;
    protected abstract _resolveHandlerMethodError(route: Route, handlerMethod: RouteHandlerMethod, error: Error): ModelAndView;
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
export declare class DefaultRouteErrorResolver extends AbstractRouteErrorResolver {
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView;
}
/**
 * An {@link AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @implements module:context.ApplicationContextAware
 * @implements module:context.Initializable
 */
export declare class MetadataErrorResolver extends AbstractHandlerMethodErrorResolver implements ApplicationContextAware {
    applicationContext: ApplicationContext;
    get [$aware](): boolean;
    setApplicationContext(applicationContext: ApplicationContext): void;
    protected _getErrorHandlerMethod(handlerMethod: RouteHandlerMethod, error: Error): ErrorHandlerMethod;
    protected _resolveHandlerMethodError(route: Route, handlerMethod: RouteHandlerMethod, error: Error): ModelAndView;
}
/**
 * {@link RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the {@link Dispatcher|Dispatcher}.
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @see {@link Dispatcher}
 */
export declare class SimpleMappingErrorResolver extends AbstractRouteErrorResolver {
    defaultErrorView: string;
    errorMappings: Map<string, string>;
    get [Symbol.toStringTag](): string;
    constructor(defaultErrorView?: string);
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
    protected _resolveError(route: Route, handler: object, error: Error): ModelAndView;
}
//# sourceMappingURL=route-error-resolver.d.ts.map