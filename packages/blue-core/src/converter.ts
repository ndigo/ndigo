/**
 * @author Jeff Rose
 */

import { Parser, Stringifier } from './parser';

// ---------------------------------------------------------------------------
// Converter<S, T> — Spring-style single-direction class-based converter
// ---------------------------------------------------------------------------

/**
 * A general-purpose type conversion from source `S` to target `T`.
 *
 * Unlike {@link Parser} (string → T) and {@link Stringifier} (T → string),
 * this interface handles arbitrary source-to-target conversions. It is the
 * class-based form used by {@link ConverterRegistry} and {@link ConversionService}.
 *
 * For simple one-off conversions, use a plain function typed as
 * `Converter<S, T>` directly — the registry accepts any object with a `convert` method:
 *
 * @example
 * ```typescript
 * // Class-based converter (for registration)
 * class MyIdConverter implements Converter<string, MyId> {
 *     convert(value: string): MyId { return new MyId(value); }
 * }
 * registry.register(new MyIdConverter(), String, MyId);
 *
 * // Function-based converter (directly usable)
 * const parseHex: Converter<string, number> = (s) => parseInt(s, 16);
 * ```
 *
 * @template S The source type.
 * @template T The target type.
 */
export interface Converter<S, T> {
    /**
     * Converts a value of type `S` to type `T`.
     * @param source - The source value.
     * @returns The converted target value.
     */
    convert(source: S): T;
}

// ---------------------------------------------------------------------------
// ConverterRegistry — Maps (sourceType, targetType) pairs to converters
// ---------------------------------------------------------------------------

/** Internal entry stored in the converter map. */
interface ConverterEntry {
    sourceType: any;
    targetType: any;
    converter: any;
}

function makeKey(sourceId: any, targetId: any): string {
    return `${sourceId?.name ?? 'unknown'}→${targetId?.name ?? 'unknown'}`;
}

/**
 * A registry that maps source/target type pairs to converter instances.
 *
 * Converters are looked up by the runtime identity of their source and target
 * types (e.g., `String`, `Date`). This enables the dispatch layer to resolve
 * conversions dynamically without hard-coded switch statements.
 */
export class ConverterRegistry {
    #entries = new Map<string, ConverterEntry>();

    /**
     * Registers a converter for the given source/target type pair.
     * @param converter - The converter instance (must have a `convert` method).
     * @param sourceType - Runtime identity of the source type (e.g., `String`, `Date`).
     * @param targetType - Runtime identity of the target type (e.g., `UUID`, `Number`).
     */
    register(converter: any, sourceType: any, targetType: any): void {
        const key = makeKey(sourceType, targetType);

        this.#entries.set(key, { sourceType, targetType, converter });
    }

    /**
     * Retrieves the converter for a given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns The converter instance, or `undefined` if none is registered.
     */
    getConverter(sourceType: any, targetType: any): any | undefined {
        return this.#entries.get(makeKey(sourceType, targetType))?.converter;
    }

    /**
     * Checks whether a converter exists for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns `true` if a converter is registered.
     */
    hasConverter(sourceType: any, targetType: any): boolean {
        return this.#entries.has(makeKey(sourceType, targetType));
    }

    /**
     * Removes the converter for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     */
    unregister(sourceType: any, targetType: any): void {
        this.#entries.delete(makeKey(sourceType, targetType));
    }

    /**
     * Returns all registered converters as an array of entries.
     */
    getAll(): Array<{ sourceType: any; targetType: any; converter: any }> {
        return Array.from(this.#entries.values());
    }

    /**
     * Clears all registered converters.
     */
    clear(): void {
        this.#entries.clear();
    }
}

// ---------------------------------------------------------------------------
// Built-in Converter Implementations
// ---------------------------------------------------------------------------

/** UUID v4 format: xxxxxxxx-xxxx-Vxxx-Yxxx-xxxxxxxxxxxx where V is version (0-f), Y is variant (8/b) */
const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Converts string values to lowercase UUID strings (validation + normalization).
 */
export class UUIDConverter implements Converter<string, string> {
    convert(value: string): string {
        const normalized = value.trim().toLowerCase();

        if (!UUID_PATTERN.test(normalized)) {
            throw new TypeError(`Invalid UUID format: ${value}`);
        }

        return normalized;
    }
}

/**
 * Converts strings to `Date` instances.
 *
 * Accepts any input that `new Date()` accepts (ISO 8601, timestamps, relative dates).
 * Validates the date is actually valid (not a normalized invalid date like Feb 29 in non-leap years).
 */
export class DateConverter implements Converter<string, Date> {
    convert(value: string): Date {
        const date = new Date(value);

        // JavaScript silently normalizes invalid dates (e.g., "2023-02-29" becomes March 1)
        if (isNaN(date.getTime())) {
            throw new TypeError(`Invalid date value: ${value}`);
        }

        return date;
    }
}

/**
 * Converts strings to parsed JSON values via `JSON.parse`.
 */
export class JSONConverter implements Converter<string, any> {
    convert(value: string): any {
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new TypeError(`Invalid JSON value: ${value}`, { cause: error });
        }
    }
}

/**
 * Converts strings to numbers via `parseFloat`.
 *
 * Returns `NaN` for non-numeric input — callers should check with `Number.isFinite()`.
 */
export class NumberConverter implements Converter<string, number> {
    convert(value: string): number {
        return parseFloat(value);
    }
}

/**
 * Converts strings to booleans using common truthy/falsy conventions.
 *
 * Truthy values (case-insensitive): `true`, `1`, `yes`, `on`
 * Falsy values (case-insensitive): `false`, `0`, `no`, `off`
 */
export class BooleanConverter implements Converter<string, boolean> {
    convert(value: string): boolean {
        const normalized = value.trim().toLowerCase();

        switch (normalized) {
            case 'true':
            case '1':
            case 'yes':
            case 'on':
                return true;
            case 'false':
            case '0':
            case 'no':
            case 'off':
                return false;
            default:
                throw new TypeError(`Invalid boolean value: ${value}`);
        }
    }
}

/**
 * Converts strings to arrays by splitting on a separator.
 */
export class ArrayConverter implements Converter<string, string[]> {
    convert(value: string, separator: string | RegExp = ','): string[] {
        return `${value}`
            .split(separator)
            .map((item) => item.trim())
            .filter(Boolean);
    }
}

// ---------------------------------------------------------------------------
// ConversionService — Central facade for type conversion
// ---------------------------------------------------------------------------

/** Built-in converters shipped with every ConversionService instance. */
const defaultConverters = [
    { converter: new UUIDConverter(), sourceType: String, targetType: String },
    { converter: new DateConverter(), sourceType: String, targetType: Date },
    { converter: new JSONConverter(), sourceType: String, targetType: Object },
    { converter: new NumberConverter(), sourceType: String, targetType: Number },
    { converter: new BooleanConverter(), sourceType: String, targetType: Boolean },
    { converter: new ArrayConverter(), sourceType: String, targetType: Array },
];

/**
 * Options for creating a {@link ConversionService}.
 */
export interface ConversionServiceOptions {
    /** Pre-populated converters to register. */
    converters?: Array<{ converter: any; sourceType: any; targetType: any }>;
}

/**
 * Central type-conversion service (modelled on Spring's `ConversionService`).
 *
 * Provides a unified API for registering, looking up, and executing type
 * conversions at runtime. Built-in converters are registered automatically
 * when the service is created with default options.
 *
 * @example
 * ```typescript
 * // Get the shared singleton instance
 * import { conversionService } from '@blue/core';
 *
 * const date = conversionService.convert('2024-01-15', Date);
 * const uuid = conversionService.convert('a1b2c3d4-e5f6-7890-abcd-ef1234567890', String);
 * ```
 */
export interface ConversionService {
    /**
     * Checks whether a converter exists for the given source/target type pair.
     */
    canConvert(sourceType: any, targetType: any): boolean;

    /**
     * Converts a value from one type to another using the registered converter.
     * @param source - The value to convert.
     * @param targetType - The target type constructor (e.g., `Date`, `Number`).
     * @returns The converted value, or throws if no converter is found.
     */
    convert(source: any, targetType: any): any;

    /**
     * Registers a converter for a source/target type pair.
     */
    register<S, T>(converter: Converter<S, T>, sourceType: any, targetType: any): void;

    /**
     * Removes the converter for a source/target type pair.
     */
    unregister(sourceType: any, targetType: any): void;

    /**
     * Returns the underlying converter registry.
     */
    readonly registry: ConverterRegistry;
}

/**
 * Creates a new ConversionService instance with built-in converters registered.
 * @param options - Optional configuration for customizing the service.
 * @returns A configured {@link ConversionService}.
 */
export function createConversionService(options: ConversionServiceOptions = {}): ConversionService {
    const registry = new ConverterRegistry();

    // Register built-in converters
    for (const entry of defaultConverters) {
        registry.register(entry.converter, entry.sourceType, entry.targetType);
    }

    // Register user-provided converters on top
    if (options.converters) {
        for (const entry of options.converters) {
            registry.register(entry.converter, entry.sourceType, entry.targetType);
        }
    }

    const service: ConversionService = {
        canConvert(sourceType: any, targetType: any): boolean {
            return registry.hasConverter(sourceType, targetType);
        },

        convert(source: any, targetType: any): any {
            const converter = registry.getConverter(String, targetType);

            if (!converter) {
                throw new TypeError(`No converter registered for String → ${targetType?.name ?? 'unknown'}`);
            }

            return converter.convert(source);
        },

        register<S, T>(converter: Converter<S, T>, sourceType: any, targetType: any): void {
            registry.register(converter as any, sourceType, targetType);
        },

        unregister(sourceType: any, targetType: any): void {
            registry.unregister(sourceType, targetType);
        },

        get registry(): ConverterRegistry {
            return registry;
        },
    };

    return service;
}

// ---------------------------------------------------------------------------
// Singleton instance — shared across the application
// ---------------------------------------------------------------------------

/** The default ConversionService singleton. */
export const conversionService = createConversionService();

// ---------------------------------------------------------------------------
// Re-exports for convenience — Parser and Stringifier are string-specific
// utilities that complement Converter<S,T> (general-purpose conversions)
// ---------------------------------------------------------------------------

export type { Parser, Stringifier };
