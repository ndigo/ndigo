import { Route } from '@blue/router';
import { MethodParameter, MethodParameterType } from './parameters';
import { isNil, like } from '@blue/util/types';

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
     * Handles a missing argument value by throwing a TypeError.
     * @param name - The name of the missing argument.
     * @throws {TypeError} If the argument is undefined or null.
     */
    handleMissingValue(name: string) {
        throw TypeError(`"${name}" cannot be undefined or null`);
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
            // The convert hook (installed by validatedBy, AD-7) runs after
            // named resolution so Zod schemas see the field value. Mirrors
            // the AbstractPlatformArgumentResolver pipeline.
            validatedValue = parameter.convert ? parameter.convert(value) : value;

        if (isNil(validatedValue) && parameter.required) {
            this.handleMissingValue(parameter.name);
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
        // '*' binds the entire query object (validatedQuery sugar), mirroring
        // the body resolver's '*' convention.
        return name === '*' ? route.data : route.data[name];
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
        return route.params?.[name];
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
        return route.attributes?.[name];
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
        if (name === 'path') return route.path;
        if (name === 'method') return route.method;
        if (name === 'id') return route.id;
        return route.attributes?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.ROUTE.equals(parameter.type);
    }
}
