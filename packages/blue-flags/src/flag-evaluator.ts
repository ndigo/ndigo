/**
 * The feature-flag backend contract (AD-82): typed, **async** (AD-39),
 * **never-throw** flag evaluation behind one `FlagEvaluator` surface.
 *
 * The SPI is deliberately provider-agnostic: a local property-backed
 * provider ships here, an OpenFeature bridge provider (accessing Split /
 * LaunchDarkly / flagd / …) is a follow-up adapter behind the same
 * contract (AD-82 D-6). Enforcement — the `@whenFeature` route gate —
 * lives in `@blue/platform-node` beside the other interceptors.
 *
 * @module blue-flags
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * A flag value: boolean, number, string, or a JSON-like structure.
 */
export type FlagValue = boolean | number | string | Record<string, unknown> | unknown[];

/**
 * Why a flag resolved the way it did — the OpenFeature reason vocabulary
 * (best-effort metadata: a provider may only supply a subset).
 */
export type FlagEvaluationReason = 'STATIC' | 'TARGETING_MATCH' | 'SPLIT' | 'DISABLED' | 'DEFAULT' | 'ERROR';

/**
 * Machine-readable error classification for abnormal evaluations
 * (OpenFeature error-code vocabulary).
 */
export type FlagErrorCode =
    | 'FLAG_NOT_FOUND'
    | 'PARSE_ERROR'
    | 'TYPE_MISMATCH'
    | 'GENERAL'
    | 'PROVIDER_NOT_READY'
    | 'PROVIDER_FATAL';

/**
 * The outcome of {@link FlagEvaluator.evaluate}.
 *
 * The `value` field is always set: abnormal execution returns the caller's
 * default with `reason: 'ERROR'` and an `errorCode` — evaluation never
 * throws (AD-82 D-2).
 */
export interface FlagEvaluation<T extends FlagValue> {
    /** The evaluated flag value (the supplied default on abnormal execution). */
    value: T;
    /** The reason the provider resolved this value. */
    reason: FlagEvaluationReason;
    /** The flag variant (provider-assigned) when available. */
    variant?: string;
    /** The classification, when the evaluation was abnormal. */
    errorCode?: FlagErrorCode;
    /** Optional human-readable detail for the error (telemetry only). */
    errorMessage?: string;
}

/**
 * The runtime context a flag evaluation may use for targeting.
 *
 * Not every provider reads this; the property-backed provider is static
 * today. The seam exists so a targeting/traffic-split provider can
 * implement percentage rollouts per subject (AD-82 D-6).
 */
export interface FlagEvaluationContext {
    /** Stable identifier for the subject (user, session, tenant, device…). */
    targetingKey?: string;
    /** Arbitrary attributes the provider may use for targeting. */
    attributes?: Record<string, unknown>;
}

/**
 * Feature-flag backend contract. Implementations MUST be safe for
 * concurrent use and MUST NOT throw from `evaluate` — a broken backend
 * degrades to the supplied default, never crashes the caller.
 */
export interface FlagEvaluator {
    /** Backend identifier e.g. `'property'`, `'openfeature'`. */
    readonly kind: string;

    /**
     * Evaluates `flag` to the type of `defaultValue`.
     *
     * @param flag - The flag key (see {@link validateFlagKey} grammar).
     * @param defaultValue - The value returned when the flag is missing,
     *   disabled, or the provider errors — the type parameter for the
     *   evaluation.
     * @param ctx - Optional targeting context.
     * @returns The evaluation; never rejects.
     */
    evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>>;

    /** Releases backend resources (optional; called on context close). */
    close?(): Promise<void>;
}

/**
 * Structural type guard for {@link FlagEvaluator} — used where a bean or
 * option is resolved by shape instead of the {@link FLAG_EVALUATOR} token.
 */
export function likeFlagEvaluator(value: unknown): value is FlagEvaluator {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as Partial<FlagEvaluator>).kind === 'string' &&
        typeof (value as Partial<FlagEvaluator>).evaluate === 'function'
    );
}

/**
 * Flag-key grammar shared by every decorator and provider: identifier
 * characters matching the config-key namespace (`feature.<flag>`), the
 * same rule the lock/job names follow.
 */
const flagKeyPattern = /^[A-Za-z0-9._:-]+$/;

/**
 * Validates a flag key — used at decoration time (fail loud at
 * definition) and by providers at evaluation time.
 *
 * @param flag - The flag key to validate.
 * @param where - Call-site label for the error message.
 * @throws {TypeError} When the key is not a non-empty identifier string.
 */
export function validateFlagKey(flag: string, where = 'feature flag'): void {
    if (typeof flag !== 'string' || flag.length === 0 || !flagKeyPattern.test(flag)) {
        throw new TypeError(`${where}: invalid flag key ${JSON.stringify(flag)} — use [A-Za-z0-9._:-] characters`);
    }
}
