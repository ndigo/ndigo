/**
 * @author Jeff Rose
 */

import { isNil } from '@blue/util/types';
import { Route } from '@blue/router';
import { AbstractNamedValueMethodArgumentResolver } from './argument-resolver';
import { MethodParameter } from './route-parameter';

/**
 * Function signature for platform-specific argument value conversion.
 *
 * Each platform provides its own implementation (backed by ConversionService)
 * so that the shared `resolveArgument` pipeline can remain platform-agnostic.
 */
export type ConvertArgumentValueFn = (
    convertType: { source: any; target: any } | undefined,
    value: any,
    parameter: MethodParameter,
    route: Route,
    mapping: any,
    registry?: any,
    options?: any
) => any;

/**
 * Shared base class for platform argument resolvers.
 *
 * Eliminates the 11 copies of the `resolveArgument` converter pipeline
 * that were previously duplicated across `@blue/platform-web` and
 * `@blue/platform-node`.
 *
 * Subclasses only need to implement:
 * - `resolveName()` — where to fetch the raw value
 * - `supportsParameter()` — which `MethodParameterType` to match
 */
export abstract class AbstractPlatformArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #convertFn: ConvertArgumentValueFn;

    /**
     * Creates a platform argument resolver.
     *
     * @param convertFn - Platform-specific `convertArgumentValue` function.
     */
    constructor(convertFn: ConvertArgumentValueFn) {
        super();
        this.#convertFn = convertFn;
    }

    /**
     * Resolves and converts a method argument value.
     *
     * Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → nil check.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any {
        const resolveValue = (v: any) => v ?? parameter.defaultValue,
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            convertedValue = this.#convertFn(parameter.convertType, value, parameter, route, mapping);

        if (isNil(convertedValue) && parameter.required) {
            this.handleMissingValue(parameter.name);
        }

        return convertedValue;
    }
}
