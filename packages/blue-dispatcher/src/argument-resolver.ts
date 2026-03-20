/**
 * @author Jeff Rose
 */

import { Factory } from '@blue/factory';
import { Route } from '@blue/router';
import { MethodParameter, MethodParameterType } from './route-parameter';
import { defaultTo } from '@blue/util/logic';
import { isNil, like } from '@blue/util/types';

export interface HandlerMethodArgumentResolver {
    supportsParameter(parameter: MethodParameter): boolean;
    resolveArgument(parameter: MethodParameter, route: Route, mapping): any;
}

export const likeArgumentResolver = like({
    supportsParameter: Function,
    resolveArgument: Function,
}) as (value) => value is HandlerMethodArgumentResolver;

/**
 * Strategy interface for resolving method parameters into argument values in the context of a given route.
 */

/**
 * Whether the given {@link
 * @param {*} parameter The method parameter to check.
 * @returns {boolean} Whether or not the given method parameter is supported by this resolver.
 */

/**
 * Resolves a method parameter into an argument value from a given route.
 * @returns {*} The resolved argument value, or `null` if not resolvable.
 */

export abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    #factory: Factory;

    constructor(factory?: Factory) {
        this.#factory = factory;
    }

    handleMissingValue(name: string) {
        throw TypeError(`"${name}" cannot be undefined or null`);
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping));

        isNil(value) && parameter.required && this.handleMissingValue(parameter.name);

        return value;
    }

    protected abstract resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any;

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
 * A {@link Factory|Factory} must be supplied to the class constructor.
 * @abstract
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 * @param {module:factory.Factory} factory A factory for resolving values
 */

/**
 * @abstract
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 */

/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
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

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MATRIX.equals(parameter.type);
    }
}

/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        return route.data[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.QUERY.equals(parameter.type);
    }
}

/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export class PathValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        return route.params?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.PATH.equals(parameter.type);
    }
}

/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export class AttributeValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        return route.attributes?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.ATTRIBUTE.equals(parameter.type);
    }
}
