/**
 * Argument resolver contracts and built-in resolvers.
 *
 * Argument resolvers bind handler-method parameters from the request, path,
 * query, body, and application context.
 *
 * @example
 * ```ts
 * const resolver = new PathValueMethodArgumentResolver();
 * resolver.resolve(parameter, context);
 * ```
 */

import { ApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import { MethodParameter, MethodParameterType } from './parameters';
import { isNil, like } from '@ndigo/util/types';
import { readDottedValue } from './dotted-read';
import { ARGUMENT_RESOLVERS } from './context-tokens';
import { convertArgumentValue } from './argument-value-converter';
import { MissingParameterError } from './error';

/**
 * Strategy interface for resolving method parameters into argument values in the context of a given route.
 *
 * @example
 * ```ts
 * const resolver: HandlerMethodArgumentResolver = new PathValueMethodArgumentResolver();
 * ```
 */
export interface HandlerMethodArgumentResolver {
    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    supportsParameter(parameter: MethodParameter): boolean;
    /**
     * Resolves a method parameter into an argument value from a given route.
     * @param parameter - The method parameter to resolve.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @returns The resolved argument value, or `null` if not resolvable.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown;
}

/**
 * Type guard for {@link HandlerMethodArgumentResolver}.
 * @param value - The value to check.
 * @returns `true` if the value is a {@link HandlerMethodArgumentResolver}, `false` otherwise.
 */
export const likeArgumentResolver = like({
    supportsParameter: Function,
    resolveArgument: Function,
}) as (value: unknown) => value is HandlerMethodArgumentResolver;

/**
 * Abstract base class for resolving method arguments from a named value.
 *
 * Subclasses define how to:
 * * Obtain named value information for a method parameter
 * * Resolve names into argument values
 * * Handle missing argument values when argument values are required
 * * Optionally handle a resolved value
 *
 * @example
 * ```ts
 * const resolver = new PathValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AbstractNamedValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AbstractNamedValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'AbstractNamedValueMethodArgumentResolver';
    }

    /**
     * Handles a missing argument value by throwing a
     * a MissingParameterError — a ParameterBindingError, so HTTP
     * error resolvers map it to 400 (the reference framework's
     * MissingServletRequestParameterException parity) instead of a 500
     * from a bare TypeError.
     * @param parameter - The method parameter that could not be resolved.
     * @throws if the argument is undefined or null.
     */
    handleMissingValue(parameter: MethodParameter): never {
        throw new MissingParameterError(parameter.name, parameter.type.toString());
    }

    /**
     * Converts a resolved named value through the parameter's `convertType`
     * (type-based conversion installed by `asNumber`/`as*`/`withConversion`).
     *
     * Uses the same shared `convertArgumentValue` the platform resolvers run
     * (`AbstractPlatformArgumentResolver.#convertFn`): ConversionService-backed
     * with an identity default when no `convertType` is set. That keeps the
     * dispatcher resolvers — matrix, query, path, attribute, route — honoring
     * conversions exactly like every platform.
     *
     * @param parameter - The method parameter being resolved.
     * @param value - The resolved (defaulted) value.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @returns The converted value.
     */
    protected convertValue(parameter: MethodParameter, value: unknown, route: Route, mapping: unknown): unknown {
        return convertArgumentValue(parameter.convertType, value, parameter, route, mapping);
    }

    /**
     * Resolves a method parameter into an argument value from a given route.
     * @param parameter - The method parameter to resolve.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @returns The resolved argument value, or `null` if not resolvable.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        const resolveValue = (v: unknown) => v ?? parameter.defaultValue,
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            // convertType conversion (asNumber/as*/withConversion, COR-11)
            // runs after named resolution — mirrors the platform pipeline.
            // The Zod `convert` hook (installed by validatedBy) then
            // sees the converted value.
            convertedValue = this.convertValue(parameter, value, route, mapping),
            validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        if (isNil(validatedValue) && parameter.required) {
            this.handleMissingValue(parameter);
        }

        return validatedValue;
    }

    /**
     * Resolves the raw value for a named parameter.
     *
     * @param name - The parameter name.
     * @param parameter - The method parameter descriptor.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @returns The raw value, before defaulting and conversion.
     */
    protected abstract resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown;

    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    abstract supportsParameter(parameter: MethodParameter): boolean;
}

/**
 * Resolves method arguments from matrix variables in the URL path.
 *
 * @example
 * ```ts
 * const resolver = new MatrixValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MatrixValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MatrixValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'MatrixValueMethodArgumentResolver';
    }

    /**
     * Reads a matrix variable from the matched path segment.
     *
     * @param name - The matrix-variable name.
     * @param parameter - The method parameter descriptor.
     * @param route - The resolved route.
     * @param mapping - The method's route mapping.
     * @returns The variable value, falling back to route data.
     */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        let index = -1,
            segmentName = '',
            segment,
            value;
        // mapping is the method's RouteMappingConfiguration (see invoke()).
        if (mapping && typeof mapping === 'object' && 'value' in mapping && typeof mapping.value === 'string') {
            segmentName = mapping.value.slice(1);
        }
        while ((segment = route[++index])) {
            if (!segment) {
                break;
            }
            if (segment.name === segmentName) {
                value = segment.data[name];
                if (!isNil(value)) {
                    break;
                }
            }
        }
        if (isNil(value)) {
            value = route.data[name];
        }

        return value;
    }

    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MATRIX.equals(parameter.type);
    }
}

/**
 * Resolves method arguments from query parameters.
 *
 * @example
 * ```ts
 * const resolver = new QueryValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "QueryValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object QueryValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'QueryValueMethodArgumentResolver';
    }

    /**
     * Reads a query parameter, or the whole query when unnamed.
     *
     * @param name - The query-parameter name, or `''`.
     * @param parameter - The method parameter descriptor.
     * @param route - The resolved route.
     * @param mapping - The method's route mapping.
     * @returns The parameter value or the query record.
     */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        // No name (`queryValue()`) binds the entire query object — the
        // `*Value(name)` contract: omit the name → the whole source.
        return name === '' ? route.data : route.data[name];
    }

    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.QUERY.equals(parameter.type);
    }
}

/**
 * Resolves method arguments from path variables.
 *
 * @example
 * ```ts
 * const resolver = new PathValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export class PathValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "PathValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object PathValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'PathValueMethodArgumentResolver';
    }

    /**
     * Reads a path variable, or the whole params record when unnamed.
     *
     * @param name - The path-variable name, or `''`.
     * @param parameter - The method parameter descriptor.
     * @param route - The resolved route.
     * @param mapping - The method's route mapping.
     * @returns The parameter value or the params record.
     */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        // `pathVariable()` binds the whole params record; named binds one.
        return name === '' ? route.params : route.params?.[name];
    }

    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.PATH.equals(parameter.type);
    }
}

/**
 * Resolves method arguments from request attributes.
 *
 * @example
 * ```ts
 * const resolver = new AttributeValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export class AttributeValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AttributeValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AttributeValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'AttributeValueMethodArgumentResolver';
    }

    /**
     * Reads a request attribute by dotted path, or the whole bag when unnamed.
     *
     * @param name - The attribute path, or `''`.
     * @param parameter - The method parameter descriptor.
     * @param route - The resolved route.
     * @param mapping - The method's route mapping.
     * @returns The attribute value or the attributes record.
     */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        // `attributeValue()` binds the whole framework-context bag;
        // named binds one value (nested-capable, D-2).
        return name === '' ? route.attributes : readDottedValue(route.attributes, name);
    }

    /**
     * Whether the given method parameter is supported by this resolver.
     * @param parameter - The method parameter to check.
     * @returns Whether or not the given method parameter is supported by this resolver.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.ATTRIBUTE.equals(parameter.type);
    }
}

/**
 * Resolves route meta values: `pathValue()` binds the full matched path,
 * `methodValue()` binds the request HTTP method, and the request id is
 * available via `requestIdValue()`. Reads `route.path`/`route.method`/
 * `route.id` by the extractor's name (the ROUTE meta source).
 *
 * @example
 * ```ts
 * const resolver = new RouteValueMethodArgumentResolver();
 * resolver.resolveArgument(parameter, route, mapping);
 * ```
 */
export class RouteValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RouteValueMethodArgumentResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RouteValueMethodArgumentResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'RouteValueMethodArgumentResolver';
    }

    /**
     * Reads a route meta value: the whole route, a built-in property, or an attribute.
     *
     * @param name - The property name, or `''` for the whole route.
     * @param parameter - The method parameter descriptor.
     * @param route - The resolved route.
     * @param mapping - The method's route mapping.
     * @returns The requested route value.
     */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        // `routeValue()` (no name) binds the whole Route — the `*Value(name)`
        // contract extracts a value *named* `name`, and there is no "route"
        // property. Named calls bind Route properties.
        if (name === '') return route;
        if (name === 'path') return route.path;
        if (name === 'method') return route.method;
        if (name === 'id') return route.id;
        return route.attributes?.[name];
    }

    /**
     * Whether the given method parameter is supported by this resolver.
     *
     * @param parameter - The method parameter to check.
     * @returns Whether the parameter binds a route value.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.ROUTE.equals(parameter.type);
    }
}

/**
 * Registers a collection of argument resolvers into the application context
 * under the {@link ARGUMENT_RESOLVERS} token and returns them.
 *
 * Shared by the platform configuration functions
 * (`configureNodeArgumentResolvers`, `configureBrowserArgumentResolvers`) so
 * resolver registration behaves identically across platforms.
 *
 * @param applicationContext - The application context to register into.
 * @param resolvers - The argument resolvers to register, in priority order.
 * @returns The registered resolvers.
 *
 * @example
 * ```ts
 * const resolvers = registerArgumentResolvers(applicationContext, [new PathValueMethodArgumentResolver()]);
 * ```
 */
export function registerArgumentResolvers(
    applicationContext: ApplicationContext,
    resolvers: HandlerMethodArgumentResolver[]
): HandlerMethodArgumentResolver[] {
    applicationContext.setValue(ARGUMENT_RESOLVERS, resolvers);

    return resolvers;
}
