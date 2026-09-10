import { ParameterValueConversionContext } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { conversionService } from '@blue/core';

// ---------------------------------------------------------------------------
// Conversion context and types
// ---------------------------------------------------------------------------

export type ArgumentValueConversionContext = ParameterValueConversionContext & { route: Route };
export type ArgumentValueConverter = (value: unknown, context: ArgumentValueConversionContext) => unknown;
export type ArgumentValueConverterRegistry = Record<string, ArgumentValueConverter>;
export type ConverterResolutionOptions = { strictNamedLookup?: boolean };
export type ResolverConverterOption =
    | ArgumentValueConverter
    | keyof typeof argumentValueConverters
    | { optional?: boolean; use: ArgumentValueConverter | keyof typeof argumentValueConverters };

// ---------------------------------------------------------------------------
// Built-in converters (backward compatible)
// ---------------------------------------------------------------------------

export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;

const toLowerString = (value: unknown): string => `${value}`.toLowerCase();

export function toNumberValue(value: unknown): number {
    return Number(value);
}
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
export function toDateValue(value: unknown): Date {
    // new Date coerces any input (ToNumber for non-strings) and never throws;
    // the cast is erased, so behavior is identical to the former `any` param.
    return new Date(value as number | string);
}
export function toJSONStringValue(value: unknown): unknown {
    // JSON.parse ToString-coerces its argument; the cast is erased.
    return JSON.parse(value as string);
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
