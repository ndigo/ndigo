/**
 * Type conversion contracts and the `ConversionService`.
 *
 * This module provides the `Converter<S, T>` interface plus a registry-backed
 * `ConversionService` that composes converters for arbitrary source/target type
 * pairs. Use it when values need to be converted at runtime (path parameters,
 * form fields, query strings) instead of hand-written switch statements.
 *
 * @remarks
 * Converters are registered by source/target runtime identity. The service
 * resolves the best match and supports chained conversions through the registry.
 *
 * @example
 * ```ts
 * const service = createConversionService();
 * service.convert('42', Number); // 42
 * service.convert(new Date(), String); // ISO string
 * ```
 */

export type { Parser, Stringifier } from './parser';

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

export * from './converter-registry.js';
export * from './primitive-converters.js';
export * from './conversion-service.js';
