/**
 * @author Jeff Rose
 */

import { MethodParameter } from '@blue/dispatcher';
import { Route } from '@blue/router';

export interface ArgumentValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: Route;
    mapping: any;
}

export type ArgumentValueConverter = (value: any, context: ArgumentValueConversionContext) => any;

export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;

const toLowerString = (value: any): string => `${value}`.toLowerCase();

export function toNumberValue(value: any): number {
    return Number(value);
}

export function toBooleanValue(value: any): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = toLowerString(value);

    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
        return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
        return false;
    }

    return Boolean(value);
}

export function toDateValue(value: any): Date {
    return new Date(value);
}

export function toJSONStringValue(value: any): any {
    return JSON.parse(value);
}

export function createStringSplitConverter(separator: string | RegExp = ','): ArgumentValueConverter {
    return (value) => `${value}`.split(separator);
}

export function createOptionalConverter(converter: ArgumentValueConverter): ArgumentValueConverter {
    return (value, context) => {
        if (value === null || value === undefined) {
            return value;
        }

        return converter(value, context);
    };
}

export const argumentValueConverters: Record<string, ArgumentValueConverter> = {
    identity: identityArgumentValueConverter,
    number: (value) => toNumberValue(value),
    boolean: (value) => toBooleanValue(value),
    date: (value) => toDateValue(value),
    json: (value) => toJSONStringValue(value),
};
