/**
 * @author Jeff Rose
 */
import { Parser, Stringifier } from './parser';
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
/**
 * A registry that maps source/target type pairs to converter instances.
 *
 * Converters are looked up by the runtime identity of their source and target
 * types (e.g., `String`, `Date`). This enables the dispatch layer to resolve
 * conversions dynamically without hard-coded switch statements.
 */
export declare class ConverterRegistry {
    #private;
    /**
     * Registers a converter for the given source/target type pair.
     * @param converter - The converter instance (must have a `convert` method).
     * @param sourceType - Runtime identity of the source type (e.g., `String`, `Date`).
     * @param targetType - Runtime identity of the target type (e.g., `UUID`, `Number`).
     */
    register(converter: any, sourceType: any, targetType: any): void;
    /**
     * Retrieves the converter for a given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns The converter instance, or `undefined` if none is registered.
     */
    getConverter(sourceType: any, targetType: any): any | undefined;
    /**
     * Checks whether a converter exists for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     * @returns `true` if a converter is registered.
     */
    hasConverter(sourceType: any, targetType: any): boolean;
    /**
     * Removes the converter for the given source/target type pair.
     * @param sourceType - Runtime identity of the source type.
     * @param targetType - Runtime identity of the target type.
     */
    unregister(sourceType: any, targetType: any): void;
    /**
     * Returns all registered converters as an array of entries.
     */
    getAll(): Array<{
        sourceType: any;
        targetType: any;
        converter: any;
    }>;
    /**
     * Clears all registered converters.
     */
    clear(): void;
}
/**
 * Converts string values to lowercase UUID strings (validation + normalization).
 */
export declare class UUIDConverter implements Converter<string, string> {
    convert(value: string): string;
}
/**
 * Converts strings to `Date` instances.
 *
 * Accepts any input that `new Date()` accepts (ISO 8601, timestamps, relative dates).
 * Validates the date is actually valid (not a normalized invalid date like Feb 29 in non-leap years).
 */
export declare class DateConverter implements Converter<string, Date> {
    convert(value: string): Date;
}
/**
 * Converts strings to parsed JSON values via `JSON.parse`.
 */
export declare class JSONConverter implements Converter<string, any> {
    convert(value: string): any;
}
/**
 * Converts strings to numbers via `parseFloat`.
 *
 * Returns `NaN` for non-numeric input — callers should check with `Number.isFinite()`.
 */
export declare class NumberConverter implements Converter<string, number> {
    convert(value: string): number;
}
/**
 * Converts strings to booleans using common truthy/falsy conventions.
 *
 * Truthy values (case-insensitive): `true`, `1`, `yes`, `on`
 * Falsy values (case-insensitive): `false`, `0`, `no`, `off`
 */
export declare class BooleanConverter implements Converter<string, boolean> {
    convert(value: string): boolean;
}
/**
 * Converts strings to arrays by splitting on a separator.
 */
export declare class ArrayConverter implements Converter<string, string[]> {
    convert(value: string, separator?: string | RegExp): string[];
}
/**
 * Options for creating a {@link ConversionService}.
 */
export interface ConversionServiceOptions {
    /** Pre-populated converters to register. */
    converters?: Array<{
        converter: any;
        sourceType: any;
        targetType: any;
    }>;
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
export declare function createConversionService(options?: ConversionServiceOptions): ConversionService;
/** The default ConversionService singleton. */
export declare const conversionService: ConversionService;
export type { Parser, Stringifier };
