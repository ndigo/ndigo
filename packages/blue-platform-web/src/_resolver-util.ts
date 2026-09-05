import { MethodParameter, ParameterConversionError } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ArgumentValueConversionContext, ArgumentValueConverter, resolveConverter } from './argument-value-converter';

function getParameterTypeName(parameter: MethodParameter): string {
    return parameter.type?.toString?.() || 'unknown';
}

/** Converts a resolved argument value and wraps conversion failures. */
export function convertArgumentValue(
    convertType: { source: any; target: any } | undefined,
    value: any,
    parameter: MethodParameter,
    route: Route,
    mapping: any
): any {
    const context: ArgumentValueConversionContext = {
        name: parameter.name,
        parameter,
        route,
        mapping,
    };

    try {
        // Use ConversionService to look up converter based on convertType
        const converter: ArgumentValueConverter = resolveConverter(convertType);
        return converter(value, context);
    } catch (error) {
        throw new ParameterConversionError(parameter.name, getParameterTypeName(parameter), error as Error);
    }
}
