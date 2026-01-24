/**
 * @author Jeff Rose
 */
import { Factory } from '@blue/factory';
import { Route } from '@blue/router';
import { MethodParameter } from './route-parameter';
export interface HandlerMethodArgumentResolver {
    supportsParameter(parameter: MethodParameter): boolean;
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any;
}
/**
 * Strategy interface for resolving method parameters into argument values in the context of a given route.
 * @interface module:dispatcher.HandlerMethodArgumentResolver
 */
/**
 * Whether the given {@link module:RouteParameter|route parameter} is supported by this resolver.
 * @function module:dispatcher.HandlerMethodArgumentResolver#supportsParameter
 * @param {*} parameter The method parameter to check.
 * @returns {external:boolean} Whether or not the given method parameter is supported by this resolver.
 */
/**
 * Resolves a method parameter into an argument value from a given route.
 * @function module:dispatcher.HandlerMethodArgumentResolver#resolveArgument
 * @returns {*} The resolved argument value, or `null` if not resolvable.
 */
export declare abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    #private;
    constructor(factory?: Factory);
    handleMissingValue(name: string): void;
    abstract resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any;
    abstract supportsParameter(parameter: MethodParameter): boolean;
}
/**
 * Abstract base class for resolving method arguments from a named value.
 *
 * Subclasses define how to:
 * * Obtain named value information for a method parameter
 * * Resolve names into argument values
 * * Handle missing argument values when argument values are required
 * * Optionally handle a resolved value
 *
 * A {@linkcode module:factory.Factory|Factory} must be supplied to the class constructor.
 * @abstract
 * @class module:dispatcher.AbstractNamedValueMethodArgumentResolver
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 * @param {module:factory.Factory} factory A factory for resolving values
 */
/**
 * @abstract
 * @class module:dispatcher.AbstractCookieValueMethodArgumentResolver
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 */
/**
 * @class module:dispatcher.MatrixParameterMethodArgumentResolver
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export declare class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any;
    supportsParameter(parameter: MethodParameter): boolean;
}
/**
 * @class module:dispatcher.QueryValueMethodArgumentResolver
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export declare class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any;
    supportsParameter(parameter: MethodParameter): boolean;
}
//# sourceMappingURL=argument-resolver.d.ts.map