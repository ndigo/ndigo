/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
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

// oxlint-disable-next-line typescript/no-explicit-any -- callers (blue-dispatcher, blue-telemetry) return values read from this record as their own typed payloads; `unknown` values would break those returns.
export function getSymbolMetadata(target: unknown): Record<string, any> {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as MetadataCarrier | undefined;
    const meta = carrier?.[Symbol.metadata];

    if (meta) {
        return meta;
    }

    return {};
}
