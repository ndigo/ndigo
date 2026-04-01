/**
 * @author Jeff Rose
 */

import { ParameterValueConversionContext, ParameterValueConverterReference } from '@blue/dispatcher';
import { Route } from '@blue/router';

/**
 * Conversion context passed to argument-value converters.
 *
 * Extends the dispatcher conversion context with the current route so browser
 * converters can resolve values from route-scoped data.
 */
export type ArgumentValueConversionContext = ParameterValueConversionContext & {
    route: Route;
};

/** Converts a raw argument value into the target parameter type. */
export type ArgumentValueConverter = (value: any, context: ArgumentValueConversionContext) => any;

/** Registry of named converters available to resolver configuration. */
export type ArgumentValueConverterRegistry = Record<string, ArgumentValueConverter>;

/** Options that control how named converters are resolved. */
export type ConverterResolutionOptions = {
    strictNamedLookup?: boolean;
};

/** A direct converter, a named converter reference, or an optional wrapper. */
export type ResolverConverterOption =
    | ArgumentValueConverter
    | keyof typeof argumentValueConverters
    | {
          optional?: boolean;
          use: ArgumentValueConverter | keyof typeof argumentValueConverters;
      };

/** Identity converter used when no conversion is required. */
export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;

const toLowerString = (value: any): string => `${value}`.toLowerCase();

/** Converts a value to a number using JavaScript's built-in coercion rules. */
export function toNumberValue(value: any): number {
    return Number(value);
}

/** Converts common string and boolean inputs into a boolean value. */
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

/** Converts a value to a `Date` instance. */
export function toDateValue(value: any): Date {
    return new Date(value);
}

/** Parses a JSON string into a JavaScript value. */
export function toJSONStringValue(value: any): any {
    return JSON.parse(value);
}

/** Creates a converter that splits a string into list items. */
export function createStringSplitConverter(separator: string | RegExp = ','): ArgumentValueConverter {
    return (value) => `${value}`.split(separator);
}

/** Wraps a converter so `null` and `undefined` are preserved. */
export function createOptionalConverter(converter: ArgumentValueConverter): ArgumentValueConverter {
    return (value, context) => {
        if (value === null || value === undefined) {
            return value;
        }

        return converter(value, context);
    };
}

/** Built-in converters available by name. */
export const argumentValueConverters: Record<string, ArgumentValueConverter> = {
    identity: identityArgumentValueConverter,
    number: (value) => toNumberValue(value),
    boolean: (value) => toBooleanValue(value),
    date: (value) => toDateValue(value),
    json: (value) => toJSONStringValue(value),
};

/** Resolves a converter reference to an executable converter function. */
export function resolveConverter(
    option: ParameterValueConverterReference | ResolverConverterOption | undefined,
    registry: ArgumentValueConverterRegistry = argumentValueConverters,
    options: ConverterResolutionOptions = {}
): ArgumentValueConverter {
    if (!option) {
        return identityArgumentValueConverter;
    }

    if (typeof option === 'function') {
        return option;
    }

    if (typeof option === 'string') {
        const converter = registry[option] ?? argumentValueConverters[option];

        if (!converter && options.strictNamedLookup) {
            throw new TypeError(`Unknown converter reference: ${option}`);
        }

        return converter ?? identityArgumentValueConverter;
    }

    const baseConverter = resolveConverter(option.use, registry, options);

    return option.optional ? createOptionalConverter(baseConverter) : baseConverter;
}
