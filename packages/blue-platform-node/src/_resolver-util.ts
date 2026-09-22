/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, ParameterConversionError } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ArgumentValueConversionContext, ArgumentValueConverter, resolveConverter } from './argument-value-converter';

function getParameterTypeName(parameter: MethodParameter): string {
    return parameter.type?.toString?.() || 'unknown';
}

/** Converts a resolved argument value and wraps conversion failures. */
export function convertArgumentValue(
    convertType: { source: unknown; target: unknown } | undefined,
    value: unknown,
    parameter: MethodParameter,
    route: Route,
    mapping: unknown
): unknown {
    const context: ArgumentValueConversionContext = { name: parameter.name, parameter, route, mapping };
    try {
        // Use ConversionService to look up converter based on convertType
        const converter: ArgumentValueConverter = resolveConverter(convertType);
        return converter(value, context);
    } catch (error) {
        throw new ParameterConversionError(parameter.name, getParameterTypeName(parameter), error as Error);
    }
}

/**
 * Passes a resolved value through unchanged. Used by resolvers whose values are
 * already final (e.g. uploaded file parts), so the shared required/default-value
 * handling still runs without any type conversion.
 */
export function passthroughArgumentValue(
    _convertType: { source: unknown; target: unknown } | undefined,
    value: unknown
): unknown {
    return value;
}
