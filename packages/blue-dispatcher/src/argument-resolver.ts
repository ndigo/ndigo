/**
 * @author Jeff Rose
 */

import { Factory } from '@blue/factory';
import { Route } from '@blue/router';
import { MethodParameter, MethodParameterType } from './route-parameter';
import { defaultTo } from '@blue/util/logic';
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
    resolveArgument(parameter: MethodParameter, route: Route, mapping): any;
}

/**
 * Type guard for {@link HandlerMethodArgumentResolver}.
 * @param value - The value to check.
 * @returns `true` if the value is a {@link HandlerMethodArgumentResolver}, `false` otherwise.
 */
export const likeArgumentResolver = like({
    supportsParameter: Function,
    resolveArgument: Function,
}) as (value) => value is HandlerMethodArgumentResolver;

/**
 * Abstract base class for resolving method arguments from a named value.
 *
 * Subclasses define how to:
 * * Obtain named value information for a method parameter
 * * Resolve names into argument values
 * * Handle missing argument values when argument values are required
 * * Optionally handle a resolved value
 *
 * A {@link Factory} must be supplied to the class constructor.
 */
export abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    #factory: Factory;

    /**
     * Creates an instance of AbstractNamedValueMethodArgumentResolver.
     * @param factory - A factory for resolving values.
     */
    constructor(factory?: Factory) {
        this.#factory = factory;
    }

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
    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping));

        isNil(value) && parameter.required && this.handleMissingValue(parameter.name);

        return value;
    }

    protected abstract resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any;

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
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        let index = -1,
            segmentName = mapping.value.slice(1),
            segment,
            value;
        while ((segment = route[++index])) {
            if (!segment) {
                break;
            }
            // @ts-ignore: ¯\_(ツ)_/¯
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
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        return route.data[name];
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
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
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
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
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
