/**
 * @author Jeff Rose
 */

import { isNil } from '@blue/util/types';
import { Route } from '@blue/router';
import { AbstractNamedValueMethodArgumentResolver } from './argument-resolver';
import { MethodParameter, ParameterValueConverterReference } from './route-parameter';

/**
 * Function signature for platform-specific argument value conversion.
 *
 * Each platform provides its own implementation (backed by its converter
 * registry) so that the shared `resolveArgument` pipeline can remain
 * platform-agnostic.
 */
export type ConvertArgumentValueFn = (
    converterReference: ParameterValueConverterReference,
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
    #converter: ParameterValueConverterReference;
    #registry: any;
    #options: any;
    #convertFn: ConvertArgumentValueFn;

    /**
     * Creates a platform argument resolver.
     *
     * @param converter - Default converter to apply to resolved values.
     * @param registry - Platform-specific converter registry.
     * @param options - Converter resolution options.
     * @param convertFn - Platform-specific `convertArgumentValue` function.
     */
    constructor(
        converter: ParameterValueConverterReference,
        registry: any,
        options: any,
        convertFn: ConvertArgumentValueFn
    ) {
        super();
        this.#converter = converter;
        this.#registry = registry;
        this.#options = options;
        this.#convertFn = convertFn;
    }

    /**
     * Resolves and converts a method argument value.
     *
     * Pipeline: resolveName → defaultValue fallback → convert → nil check.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any {
        const resolveValue = (v: any) => v ?? parameter.defaultValue,
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            converter = parameter.convert ?? this.#converter,
            convertedValue = this.#convertFn(converter, value, parameter, route, mapping, this.#registry, this.#options);

        isNil(convertedValue) && parameter.required && this.handleMissingValue(parameter.name);

        return convertedValue;
    }
}