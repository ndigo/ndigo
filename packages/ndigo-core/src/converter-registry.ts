/**
 * Converter registry: maps source/target type pairs to converter instances.
 */

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
 *
 * @example
 * ```ts
 * const registry = new ConverterRegistry();
 * registry.register(new UUIDConverter(), String, String);
 * const converter = registry.getConverter(String, String);
 * converter?.convert('123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export class ConverterRegistry {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ConverterRegistry".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ConverterRegistry]"
     */
    get [Symbol.toStringTag](): string {
        return 'ConverterRegistry';
    }

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
