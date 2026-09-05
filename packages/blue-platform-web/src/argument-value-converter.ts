/**
 * @author Jeff Rose
 */

import { ParameterValueConversionContext } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { conversionService } from '@blue/core';

// ---------------------------------------------------------------------------
// Conversion context and types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Built-in converters (backward compatible)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Type-based converter resolution via ConversionService
// ---------------------------------------------------------------------------

/**
 * Resolves a type-based converter from the ConversionService.
 * If no converter is found, returns undefined.
 */
function resolveTypeConverter(sourceType: any, targetType: any): ArgumentValueConverter | undefined {
    if (!conversionService.canConvert(sourceType, targetType)) {
        return undefined;
    }

    // Get the underlying Converter<S,T> from ConversionService
    const converter = conversionService.registry.getConverter(sourceType, targetType);

    return (value: any, _context: ArgumentValueConversionContext) => {
        try {
            return converter.convert(value);
        } catch (error) {
            throw new TypeError(`Conversion failed: ${error instanceof Error ? error.message : String(error)}`, {
                cause: error,
            });
        }
    };
}

// ---------------------------------------------------------------------------
// Main resolver function
// ---------------------------------------------------------------------------

/** Resolves a converter based on convertType using ConversionService. */
export function resolveConverter(convertType?: { source: any; target: any }): ArgumentValueConverter {
    // Use type-based conversion via ConversionService
    if (convertType && convertType.source && convertType.target) {
        const typeConverter = resolveTypeConverter(convertType.source, convertType.target);

        if (typeConverter) {
            return typeConverter;
        }
    }

    // Default to identity converter when no conversion is needed
    return identityArgumentValueConverter;
}
