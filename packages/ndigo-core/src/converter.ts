/**
 * Type conversion contracts and the `ConversionService`.
 */
import { Parser, Stringifier } from './parser';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Converter<S, T> — Single-direction class-based converter
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
 * @typeParam S - The source type.
 * @typeParam T - The target type.
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
    sourceType: unknown;
    targetType: unknown;
    converter: unknown;
}

function makeKey(sourceId: unknown, targetId: unknown): string {
    const sourceName = (sourceId as { name?: string } | undefined)?.name;
    const targetName = (targetId as { name?: string } | undefined)?.name;
    return `${sourceName ?? 'unknown'}→${targetName ?? 'unknown'}`;
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
    register(converter: unknown, sourceType: unknown, targetType: unknown): void {
        const key = makeKey(sourceType, targetType);

        this.#entries.set(key, { sourceType, targetType, converter });
    }

    /**
     * Retrieves the converter for a given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns The converter instance, or `undefined` if none is registered.
     */
    // oxlint-disable-next-line typescript/no-explicit-any -- callers (ndigo-platform-node/web) call `.convert(value)` on the result without narrowing; `unknown` would break those call sites.
    getConverter(sourceType: unknown, targetType: unknown): any | undefined {
        return this.#entries.get(makeKey(sourceType, targetType))?.converter;
    }

    /**
     * Checks whether a converter exists for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns `true` if a converter is registered.
     */
    hasConverter(sourceType: unknown, targetType: unknown): boolean {
        return this.#entries.has(makeKey(sourceType, targetType));
    }

    /**
     * Removes the converter for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     */
    unregister(sourceType: unknown, targetType: unknown): void {
        this.#entries.delete(makeKey(sourceType, targetType));
    }

    /**
     * Returns all registered converters as an array of entries.
     */
    getAll(): Array<{ sourceType: unknown; targetType: unknown; converter: unknown }> {
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
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Converts string values to lowercase UUID strings (validation + normalization).
 */
export class UUIDConverter implements Converter<string, string> {
    /** Converts a string to a normalized lowercase UUID. @param value - The UUID string to normalize. @returns The normalized UUID. */
    convert(value: string): string {
        const normalized = value.trim().toLowerCase();

        if (!uuidPattern.test(normalized)) {
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
    /** Parses a string into a `Date`. @param value - The date string. @returns The parsed date. */
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
export class JSONConverter implements Converter<string, unknown> {
    /** Parses a string as JSON. @param value - The JSON string. @returns The parsed value. */
    convert(value: string): unknown {
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
    /** Parses a string as a number. @param value - The numeric string. @returns The parsed number (may be `NaN`). */
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
    /** Parses a string as a boolean. @param value - The boolean string. @returns The parsed boolean. */
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
    /** Splits a string into an array. @param value - The string to split. @param separator - Split separator (default `','`). @returns The resulting array. */
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
    converters?: Array<{ converter: unknown; sourceType: unknown; targetType: unknown }>;
}

/**
 * The registry key for a value's runtime source type, used by the
 * source-aware lookup in {@link ConversionService.convert}: primitives key
 * by their wrapper constructor, objects by their constructor, and
 * `undefined`/`null` have no key (the String fallback applies — the
 * environment/config binding convention).
 */
function sourceTypeOf(source: unknown): unknown {
    if (typeof source === 'string') return String;
    if (typeof source === 'number') return Number;
    if (typeof source === 'boolean') return Boolean;
    if (source !== null && typeof source === 'object' && 'constructor' in source) return source.constructor;
    return undefined;
}

/**
 * Central type-conversion service (modelled on the classic `ConversionService`,
 * extended with schema targets — AD-38).
 *
 * Provides a unified API for registering, looking up, and executing type
 * conversions at runtime: leaf conversions (string ↔ typed, constructor
 * keyed) and contract-enforced object projection (zod schema targets) share
 * one method. Built-in converters are registered automatically when the
 * service is created with default options.
 *
 * @example
 * ```typescript
 * import { conversionService } from '@ndigo/core';
 *
 * const date = conversionService.convert('2024-01-15', Date);      // leaf: registered converter
 * const dto = conversionService.convert(entity, noteDtoSchema);    // shape: schema parse (fail-fast)
 * const dtos = conversionService.convert(entities, noteDtoSchema.array()); // arrays: schema-defined
 * ```
 */
export interface ConversionService {
    /**
     * Checks whether a converter exists for the given source/target type
     * pair, mirroring {@link convert}'s lookup: a pair is convertible when
     * an exactly-registered converter exists, or a String-source converter
     * is registered for the target type (the environment/config binding
     * fallback `convert` applies). Schema targets are always convertible.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type or zod schema.
     * @returns `true` when a converter can handle the pair.
     */
    canConvert(sourceType: unknown, targetType: unknown): boolean;

    /**
     * Converts a value to a target type or shape.
     *
     * Two target kinds:
     * - **Zod schema** — contract-enforced projection: the value is parsed
     *   through the schema (fail-fast `ZodError` on any mismatch, no partial
     *   result), producing the `z.infer` shape. Covers object/entity → DTO
     *   projection; arrays convert via `schema.array()`.
     * - **Constructor** — leaf conversion through the registered converter
     *   (e.g. `Date`, `Number`), looked up by the value's runtime source
     *   type with a String fallback (the environment/config binding
     *   convention).
     *
     * @param source - The value to convert.
     * @param targetType - The target zod schema or type constructor.
     * @returns The converted value; throws when no converter is registered
     *   (constructor targets) or the schema rejects the value (`ZodError`).
     */
    convert<T>(source: unknown, targetType: z.ZodType<T>): T;
    /** @param source - The value to convert. @param targetType - The target type. @returns The converted value. */
    convert(source: unknown, targetType: unknown): unknown;

    /**
     * Registers a converter for a source/target type pair.
     * @param converter - The converter instance.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     */
    register<S, T>(converter: Converter<S, T>, sourceType: unknown, targetType: unknown): void;

    /**
     * Removes the converter for a source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     */
    unregister(sourceType: unknown, targetType: unknown): void;

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
        canConvert(sourceType: unknown, targetType: unknown): boolean {
            return (
                targetType instanceof z.ZodType ||
                registry.hasConverter(sourceType, targetType) ||
                // convert() falls back to String-source converters (the
                // environment/config binding convention) — canConvert agrees
                // so the two never disagree (COR-23).
                registry.hasConverter(String, targetType)
            );
        },

        // Schema target → contract-enforced parse (fail-fast); constructor
        // target → source-aware registry lookup with the String fallback
        // (the environment/config binding convention).
        convert(source: unknown, targetType: unknown): unknown {
            if (targetType instanceof z.ZodType) {
                return targetType.parse(source);
            }

            const sourceType = sourceTypeOf(source);
            const converter =
                registry.getConverter(sourceType, targetType) ?? registry.getConverter(String, targetType);

            if (!converter) {
                const sourceName =
                    sourceType !== null &&
                    (typeof sourceType === 'function' || typeof sourceType === 'object') &&
                    'name' in sourceType
                        ? String(sourceType.name)
                        : typeof source;
                const targetName =
                    targetType !== null &&
                    (typeof targetType === 'function' || typeof targetType === 'object') &&
                    'name' in targetType
                        ? String(targetType.name)
                        : 'unknown';
                throw new TypeError(`No converter registered for ${sourceName} → ${targetName}`);
            }

            return converter.convert(source);
        },

        register<S, T>(converter: Converter<S, T>, sourceType: unknown, targetType: unknown): void {
            registry.register(converter, sourceType, targetType);
        },

        unregister(sourceType: unknown, targetType: unknown): void {
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
