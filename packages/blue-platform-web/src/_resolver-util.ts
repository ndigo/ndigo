/**
 * @author Jeff Rose
 */

import { MethodParameter, ParameterConversionError, ParameterValueConverterReference } from '@blue/dispatcher';
import { Route } from '@blue/router';
import {
    ArgumentValueConversionContext,
    ArgumentValueConverter,
    ArgumentValueConverterRegistry,
    ConverterResolutionOptions,
    resolveConverter,
} from './argument-value-converter';

function getParameterTypeName(parameter: MethodParameter): string {
    return parameter.type?.toString?.() || 'unknown';
}

export function convertArgumentValue(
    converterReference: ParameterValueConverterReference,
    value: any,
    parameter: MethodParameter,
    route: Route,
    mapping: any,
    registry?: ArgumentValueConverterRegistry,
    options?: ConverterResolutionOptions
): any {
    const context: ArgumentValueConversionContext = {
        name: parameter.name,
        parameter,
        route,
        mapping,
    };

    try {
        const converter: ArgumentValueConverter = resolveConverter(converterReference, registry, options);
        return converter(value, context);
    } catch (error) {
        throw new ParameterConversionError(parameter.name, getParameterTypeName(parameter), error as Error);
    }
}
