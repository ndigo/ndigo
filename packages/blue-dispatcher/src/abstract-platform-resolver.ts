import { isNil } from '@blue/util/types';
import { Route } from '@blue/router';
import { AbstractNamedValueMethodArgumentResolver } from './argument-resolver';
import { MethodParameter } from './parameters';

/**
 * Function signature for platform-specific argument value conversion.
 *
 * Each platform provides its own implementation (backed by ConversionService)
 * so that the shared `resolveArgument` pipeline can remain platform-agnostic.
 */
export type ConvertArgumentValueFn = (
    convertType: { source: unknown; target: unknown } | undefined,
    value: unknown,
    parameter: MethodParameter,
    route: Route,
    mapping: unknown,
    registry?: unknown,
    options?: unknown
) => unknown;

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
     * Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → extractor validation → nil check.
     *
     * The `parameter.convert` hook (installed by `validatedBy` for Zod
     * validation, AD-7) runs after type conversion so schemas see coerced
     * values. Without this invocation the hook was dead on every resolver
     * extending this base — only the BIND path invoked it.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        const resolveValue = (v: unknown) => v ?? parameter.defaultValue,
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            convertedValue = this.#convertFn(parameter.convertType, value, parameter, route, mapping),
            validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        if (isNil(validatedValue) && parameter.required) {
            this.handleMissingValue(parameter.name);
        }

        return validatedValue;
    }
}
