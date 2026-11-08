/**
 * Argument value conversion registry.
 */

import { Route } from '@ndigo/router';
import { conversionService } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';
import { MethodParameter, ParameterValueConversionContext } from './parameters';
import { ParameterConversionError } from './error';

// ---------------------------------------------------------------------------
// Conversion context and types
// ---------------------------------------------------------------------------

/**
 * Conversion context passed to argument-value converters.
 *
 * Extends the dispatcher conversion context with the current route so platform
 * converters can resolve values from route-scoped data.
 */
export type ArgumentValueConversionContext = ParameterValueConversionContext & {
    route: Route;
};

/** Converts a raw argument value into the target parameter type. */
export type ArgumentValueConverter = (value: unknown, context: ArgumentValueConversionContext) => unknown;

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

// Built-in converters

/** Identity converter used when no conversion is required. */
export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;

const toLowerString = (value: unknown): string => `${value}`.toLowerCase();

/**
 * Converts a value to a number using JavaScript's built-in coercion rules.
 *
 * @param value - The value to convert.
 * @returns The numeric value (`NaN` when not coercible).
 */
export function toNumberValue(value: unknown): number {
    return Number(value);
}

/**
 * Converts common string and boolean inputs into a boolean value.
 *
 * @param value - The value to convert.
 * @returns The converted boolean.
 */
export function toBooleanValue(value: unknown): boolean {
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

/**
 * Converts a value to a `Date` instance.
 *
 * @param value - A date string, timestamp, or `Date`.
 * @returns The parsed date.
 */
export function toDateValue(value: unknown): Date {
    // Date's constructor accepts any coercible input (ISO strings, timestamps, Date).
    return new Date(value as string | number | Date);
}

/**
 * Parses a JSON string into a JavaScript value.
 *
 * @param value - The JSON text.
 * @returns The parsed value.
 */
export function toJSONStringValue(value: unknown): unknown {
    // JSON.parse coerces its argument to a string before parsing.
    return JSON.parse(value as string);
}

/**
 * Creates a converter that splits a string into list items.
 *
 * @param separator - The separator to split on (default `,`).
 * @returns The split converter.
 */
export function createStringSplitConverter(separator: string | RegExp = ','): ArgumentValueConverter {
    return (value) => `${value}`.split(separator);
}

/**
 * Wraps a converter so `null` and `undefined` are preserved.
 *
 * @param converter - The converter to wrap.
 * @returns The optional-aware converter.
 */
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
function resolveTypeConverter(sourceType: unknown, targetType: unknown): ArgumentValueConverter | undefined {
    if (!conversionService.canConvert(sourceType, targetType)) {
        return undefined;
    }

    // Get the underlying Converter<S,T> from ConversionService. canConvert() mirrors
    // the String-source fallback (ndigo-core COR-23), so resolve with the same fallback
    // the service's convert() uses; skip conversion (identity) only when both are absent.
    const converter =
        conversionService.registry.getConverter(sourceType, targetType) ??
        conversionService.registry.getConverter(String, targetType);

    if (!converter) {
        return undefined;
    }

    return (value: unknown, _context: ArgumentValueConversionContext) => {
        try {
            return converter.convert(value);
        } catch (error) {
            throw new TypeError(`Conversion failed: ${getErrorMessage(error)}`, {
                cause: error,
            });
        }
    };
}

// ---------------------------------------------------------------------------
// Main resolver function
// ---------------------------------------------------------------------------

/**
 * Resolves a converter based on convertType using ConversionService.
 *
 * @param convertType - The source/target type pair.
 * @returns The matching converter, or an identity converter.
 */
export function resolveConverter(convertType?: { source: unknown; target: unknown }): ArgumentValueConverter {
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

function getParameterTypeName(parameter: MethodParameter): string {
    return parameter.type?.toString?.() || 'unknown';
}

/**
 * Converts a resolved argument value and wraps conversion failures.
 *
 * @param convertType - The source/target type pair.
 * @param value - The resolved raw value.
 * @param parameter - The method parameter descriptor.
 * @param route - The route being resolved.
 * @param mapping - The method's route mapping.
 * @returns The converted value.
 */
export function convertArgumentValue(
    convertType: { source: unknown; target: unknown } | undefined,
    value: unknown,
    parameter: MethodParameter,
    route: Route,
    mapping: unknown
): unknown {
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

/**
 * Passes a resolved value through unchanged.
 *
 * Used by resolvers whose values are already final (e.g. uploaded file parts),
 * so the shared required/default-value handling still runs without any type
 * conversion.
 *
 * @param _convertType - Ignored; present to match the converter signature.
 * @param value - The resolved value.
 * @returns The value unchanged.
 */
export function passthroughArgumentValue(
    _convertType: { source: unknown; target: unknown } | undefined,
    value: unknown
): unknown {
    return value;
}
