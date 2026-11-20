/**
 * TC39 decorator metadata access helpers.
 */
import '@tsmetadata/polyfill';

/**
 * Reads the TC39 `Symbol.metadata` record for a class or instance.
 *
 * The lookup supports both constructors and values created from them so callers can inspect metadata without
 * caring which form they received.
 *
 * @param target - Class constructor, prototype, or instance.
 * @returns The metadata record, or an empty object when no metadata is present.
 */
type MetadataCarrier = { [Symbol.metadata]?: unknown; constructor?: MetadataCarrier };

/**
 * Reads the TC39 `Symbol.metadata` record a class carries (the carrier set up
 * by `@tsmetadata/polyfill`), accepting either the class or an instance — an
 * instance is unwrapped through its constructor. Targets that never received
 * metadata yield an empty record rather than throwing, so callers can read a
 * missing key without a guard.
 *
 * @param target - A class constructor or instance.
 * @returns The metadata record, or an empty object when none is present.
 *
 * @example
 * ```ts
 * class Foo {}
 * getSymbolMetadata(Foo); // {}
 * ```
 */
// oxlint-disable-next-line typescript/no-explicit-any -- callers (ndigo-dispatcher, ndigo-telemetry) return values read from this record as their own typed payloads; `unknown` values would break those returns.
export function getSymbolMetadata(target: unknown): Record<string, any> {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as MetadataCarrier | undefined;
    const meta = carrier?.[Symbol.metadata];

    if (meta) {
        return meta;
    }

    return {};
}

/**
 * Returns the metadata record for a target, creating it on the constructor
 * when the class has none yet.
 *
 * {@link getSymbolMetadata} returns a fresh empty object for an unadorned
 * class, so writing to it would silently discard the write. Imperative
 * writers — `ViewMapping.define` and its peers — use this instead.
 *
 * @param target - A class constructor or instance.
 * @returns The class's metadata record, created when absent.
 * @throws When the target has no constructor to attach metadata to.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- same record shape as getSymbolMetadata: callers read values back as their own typed payloads.
export function ensureSymbolMetadata(target: unknown): Record<string, any> {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as
        | (Function & MetadataCarrier)
        | undefined;

    if (typeof carrier !== 'function') {
        throw new TypeError('ensureSymbolMetadata requires a class constructor or an instance of one.');
    }

    return (carrier[Symbol.metadata] ??= {});
}
