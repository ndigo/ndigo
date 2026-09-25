/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
import { conversionService } from '@blue/core';
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

// ---------------------------------------------------------------------------
// Built-in converters (backward compatible)
// ---------------------------------------------------------------------------

/** Identity converter used when no conversion is required. */
export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;

const toLowerString = (value: unknown): string => `${value}`.toLowerCase();

/** Converts a value to a number using JavaScript's built-in coercion rules. */
export function toNumberValue(value: unknown): number {
    return Number(value);
}

/** Converts common string and boolean inputs into a boolean value. */
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

/** Converts a value to a `Date` instance. */
export function toDateValue(value: unknown): Date {
    // Date's constructor accepts any coercible input (ISO strings, timestamps, Date).
    return new Date(value as string | number | Date);
}

/** Parses a JSON string into a JavaScript value. */
export function toJSONStringValue(value: unknown): unknown {
    // JSON.parse coerces its argument to a string before parsing.
    return JSON.parse(value as string);
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
function resolveTypeConverter(sourceType: unknown, targetType: unknown): ArgumentValueConverter | undefined {
    if (!conversionService.canConvert(sourceType, targetType)) {
        return undefined;
    }

    // Get the underlying Converter<S,T> from ConversionService
    const converter = conversionService.registry.getConverter(sourceType, targetType);

    return (value: unknown, _context: ArgumentValueConversionContext) => {
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

/** Converts a resolved argument value and wraps conversion failures. */
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
