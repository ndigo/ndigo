/**
 * The feature-flag backend contract (AD-82): typed, **async** (AD-39),
 * **never-throw** flag evaluation behind one `FlagEvaluator` surface.
 *
 * The SPI is deliberately provider-agnostic: a local property-backed
 * provider ships here, and the OpenFeature bridge
 * (`@ndigo/flags-openfeature`, AD-87) implements the same contract over an
 * `@openfeature/server-sdk` client (accessing flagd / OFREP /
 * LaunchDarkly / … providers). Enforcement — the `@whenFeature` route gate
 * — lives in `@ndigo/platform-node` beside the other interceptors.
 */
import { like } from '@ndigo/util/types';

/**
 * A flag value: boolean, number, string, or a JSON-like structure.
 */
export type FlagValue = boolean | number | string | Record<string, unknown> | unknown[];

/**
 * Why a flag resolved the way it did — the OpenFeature reason vocabulary
 * (best-effort metadata: a provider may only supply a subset, and an
 * unrecognized provider reason surfaces as `UNKNOWN`). `DISABLED` is a
 * *successful* evaluation — the flag is off, the value is the caller's
 * default, and there is no `errorCode`.
 */
export type FlagEvaluationReason =
    | 'STATIC'
    | 'TARGETING_MATCH'
    | 'SPLIT'
    | 'CACHED'
    | 'DISABLED'
    | 'DEFAULT'
    | 'UNKNOWN'
    | 'STALE'
    | 'ERROR';

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
    | 'PROVIDER_FATAL'
    | 'TARGETING_KEY_MISSING'
    | 'INVALID_CONTEXT';

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
    /**
     * The reason the provider resolved this value — `UNKNOWN` when the
     * provider supplied none (or an unrecognized one).
     */
    reason: FlagEvaluationReason;
    /** The flag variant (provider-assigned) when available. */
    variant?: string;
    /** The classification, when the evaluation was abnormal. */
    errorCode?: FlagErrorCode;
    /** Optional human-readable detail for the error (telemetry only). */
    errorMessage?: string;
    /**
     * Provider-supplied metadata for this evaluation (OpenFeature
     * `flagMetadata`): stable identifiers, config version, bucket info, ….
     * The bridge always supplies an object (possibly empty).
     */
    flagMetadata?: Record<string, unknown>;
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
 * Structural type guard for {@link FlagEvaluator} — used where an entry or
 * option is resolved by shape instead of the {@link "context-tokens".FLAG_EVALUATOR | FLAG_EVALUATOR} token.
 *
 * @param value - The value to inspect.
 * @returns `true` when the value has a string `kind` and an `evaluate` method.
 */
export function likeFlagEvaluator(value: unknown): value is FlagEvaluator {
    return like({ kind: String, evaluate: Function })(value);
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
 * @throws When the key is not a non-empty identifier string.
 */
export function validateFlagKey(flag: string, where = 'feature flag'): void {
    if (typeof flag !== 'string' || flag.length === 0 || !flagKeyPattern.test(flag)) {
        throw new TypeError(`${where}: invalid flag key ${JSON.stringify(flag)} — use [A-Za-z0-9._:-] characters`);
    }
}
