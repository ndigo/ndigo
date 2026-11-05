/**
 * @since 1.0.0
 * @author Jeff Rose
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
 */
export abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
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
     * conversions exactly like every platform (COR-11).
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
            // The Zod `convert` hook (installed by validatedBy, AD-07) then
            // sees the converted value.
            convertedValue = this.convertValue(parameter, value, route, mapping),
            validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        if (isNil(validatedValue) && parameter.required) {
            this.handleMissingValue(parameter);
        }

        return validatedValue;
    }

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
 */
export class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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
 */
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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
 */
export class PathValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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
 */
export class AttributeValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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
 */
export class RouteValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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
 */
export function registerArgumentResolvers(
    applicationContext: ApplicationContext,
    resolvers: HandlerMethodArgumentResolver[]
): HandlerMethodArgumentResolver[] {
    applicationContext.setValue(ARGUMENT_RESOLVERS, resolvers);

    return resolvers;
}
