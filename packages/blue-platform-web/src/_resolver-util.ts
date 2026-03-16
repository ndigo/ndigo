/**
 * @author Jeff Rose
 */

import { MethodParameter, ParameterConversionError } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ArgumentValueConversionContext, ArgumentValueConverter } from './argument-value-converter';

function getParameterTypeName(parameter: MethodParameter): string {
    return parameter.type?.toString?.() || 'unknown';
}

export function convertArgumentValue(
    converter: ArgumentValueConverter,
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
        return converter(value, context);
    } catch (error) {
        throw new ParameterConversionError(parameter.name, getParameterTypeName(parameter), error as Error);
    }
}
