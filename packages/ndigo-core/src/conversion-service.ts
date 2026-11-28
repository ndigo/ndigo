/**
 * The ConversionService facade: registry-backed conversion and schema projection.
 */
import { z } from 'zod';
import type { Converter } from './converter.js';
import { ConverterRegistry } from './converter-registry.js';
import {
    ArrayConverter,
    BooleanConverter,
    DateConverter,
    JSONConverter,
    NumberConverter,
    UUIDConverter,
} from './primitive-converters.js';

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
 *
 * @example
 * ```ts
 * const service = createConversionService({ converters: [customConverter] });
 * ```
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
 * extended with schema targets).
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
 *
 * @example
 * ```ts
 * const service = createConversionService();
 * service.convert('42', Number); // 42
 * ```
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
                // so the two never disagree.
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
