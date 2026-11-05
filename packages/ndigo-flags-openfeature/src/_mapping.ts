/**
 * Package-internal mapping shared by the server and web evaluators: the SPI
 * reason/error vocabularies, narrowing for provider-supplied values, and the
 * `FlagEvaluation` translation. Deliberately structural — the details shape
 * is declared here instead of importing either OpenFeature SDK, so the
 * server and web entries can both flow through one mapper.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { FlagErrorCode, FlagEvaluation, FlagEvaluationReason, FlagValue } from '@ndigo/flags';

/** The reason vocabulary `@ndigo/flags` carries — everything else maps to `UNKNOWN`. */
const FLAG_REASONS: ReadonlySet<string> = new Set([
    'STATIC',
    'TARGETING_MATCH',
    'SPLIT',
    'CACHED',
    'DISABLED',
    'DEFAULT',
    'UNKNOWN',
    'STALE',
    'ERROR',
]);

/** The error-code vocabulary `@ndigo/flags` carries — everything else maps to `GENERAL`. */
const FLAG_ERROR_CODES: ReadonlySet<string> = new Set([
    'FLAG_NOT_FOUND',
    'PARSE_ERROR',
    'TYPE_MISMATCH',
    'GENERAL',
    'PROVIDER_NOT_READY',
    'PROVIDER_FATAL',
    'TARGETING_KEY_MISSING',
    'INVALID_CONTEXT',
]);

/**
 * The evaluation-details shape both OpenFeature SDKs produce
 * (`EvaluationDetails`, structurally).
 */
export interface OpenFeatureEvaluationDetails<T extends FlagValue> {
    readonly value: T | null;
    readonly reason?: string;
    readonly variant?: string;
    readonly errorCode?: string;
    readonly errorMessage?: string;
    readonly flagMetadata: Readonly<Record<string, unknown>>;
}

/**
 * Translates SDK evaluation details into the SPI's `FlagEvaluation`.
 *
 * One narrowing: OpenFeature's value model allows `null`, the SPI's does not
 * (the default value selects the type) — a null resolution surfaces as the
 * caller's default with `TYPE_MISMATCH`.
 *
 * @param details - The SDK's evaluation details.
 * @param defaultValue - The caller's default (the SPI's type selector).
 * @returns The SPI evaluation.
 */
export function toFlagEvaluation<T extends FlagValue>(
    details: OpenFeatureEvaluationDetails<T>,
    defaultValue: T
): FlagEvaluation<T> {
    if (details.value === null) {
        return {
            value: defaultValue,
            reason: 'ERROR',
            errorCode: 'TYPE_MISMATCH',
            errorMessage: 'provider resolved null; the SPI value model carries no null',
            flagMetadata: { ...details.flagMetadata },
        };
    }
    const evaluation: FlagEvaluation<T> = {
        value: details.value,
        reason: toReason(details.reason),
        flagMetadata: { ...details.flagMetadata },
    };
    if (details.variant !== undefined) {
        evaluation.variant = details.variant;
    }
    if (details.errorCode !== undefined) {
        evaluation.errorCode = toErrorCode(details.errorCode);
    }
    if (details.errorMessage !== undefined) {
        evaluation.errorMessage = details.errorMessage;
    }
    return evaluation;
}

/**
 * Narrows the SDK's open reason string to the SPI vocabulary — an
 * unrecognized (or absent) reason is `UNKNOWN` (the OpenFeature bucket for
 * "could not be determined").
 */
function toReason(reason: string | undefined): FlagEvaluationReason {
    return reason !== undefined && FLAG_REASONS.has(reason) ? (reason as FlagEvaluationReason) : 'UNKNOWN';
}

/**
 * Narrows the SDK's error code — anything outside the SPI vocabulary is
 * `GENERAL`, mirroring the SDK's own catch-all.
 */
function toErrorCode(errorCode: string): FlagErrorCode {
    return FLAG_ERROR_CODES.has(errorCode) ? (errorCode as FlagErrorCode) : 'GENERAL';
}
