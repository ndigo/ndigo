/**
 * The property-backed local flag provider (AD-82 D-3): reads flag state
 * from the environment property sources — flag `name` resolves
 * `feature.<name>` by default — and is **read-through**, so an
 * `environment.refresh()` (AD-29) makes flag changes visible immediately
 * with no cache to invalidate.
 *
 * @module blue-flags
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluator,
    type FlagValue,
    validateFlagKey,
} from './flag-evaluator';

/**
 * The property reader the provider evaluates against. The environment
 * satisfies this shape structurally (`getProperty(key)`), so the leaf
 * package never depends on `@blue/context`.
 */
export type FlagPropertyReader = {
    getProperty(key: string): unknown;
};

/**
 * Options for {@link PropertyFlagProvider}.
 */
export interface PropertyFlagProviderOptions {
    /** The property reader (typically a `ConfigurableEnvironment`). */
    getProperty: FlagPropertyReader['getProperty'];
    /**
     * Property namespace flags resolve under — default `'feature'`, so
     * flag `checkout` reads `feature.checkout`.
     */
    namespace?: string;
}

/**
 * Stable bucket for percentage rollouts: FNV-1a (32-bit) over
 * `<flag>\u0000<targetingKey>` → a value in [0, 1).
 *
 * Deterministic across processes and calls — a target is always in or
 * out of a percentage — without any shared state. The algorithm is
 * intentionally local: a vendor/flagd bridge (AD-82 D-6) brings its own
 * bucketing and its own flag configuration, so no coherence coupling
 * exists.
 */
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

export function stableBucket(flag: string, targetingKey: string): number {
    const input = `${flag}\u0000${targetingKey}`;
    let hash = FNV_OFFSET_BASIS;
    for (let index = 0; index < input.length; index++) {
        // JS bitwise ops coerce through SIGNED int32 — `hash ^ char` alone
        // would flip the 0x81… offset negative and poison every product.
        // `Math.imul` keeps the low 32 bits of the product; `>>> 0`
        // reinterprets them unsigned: the canonical FNV-1a-in-JS recipe.
        hash = Math.imul(hash ^ (input.codePointAt(index) as number), FNV_PRIME) >>> 0;
    }
    return hash / 0x100000000;
}

/**
 * Converts a raw property value to the requested flag type.
 *
 * @param value - The raw property value.
 * @param target - The requested type ('boolean' | 'number' | 'string' | 'object').
 * @returns The typed value, or the reason/errorCode when it cannot convert.
 */
function convertTo(
    value: unknown,
    defaultValue: FlagValue
): { value: FlagValue; errorCode?: 'TYPE_MISMATCH' | 'PARSE_ERROR' } {
    if (typeof defaultValue === 'boolean') {
        // Property-condition truthiness mirrors conditional.ts's
        // `propertyActive`: truthy or the literal string 'true'.
        if (
            value === true ||
            value === 'true' ||
            (value !== false &&
                value !== 'false' &&
                value !== '' &&
                value !== 0 &&
                value !== null &&
                value !== undefined &&
                Boolean(value))
        ) {
            return { value: true };
        }
        return { value: false };
    }

    if (typeof defaultValue === 'number') {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return { value };
        }
        if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
            return { value: Number(value) };
        }
        return { value: defaultValue, errorCode: 'TYPE_MISMATCH' };
    }

    if (typeof defaultValue === 'string') {
        if (typeof value === 'string') {
            return { value };
        }
        return { value: defaultValue, errorCode: 'TYPE_MISMATCH' };
    }

    // Structure: JSON-like values pass through; JSON strings parse.
    if (value !== null && typeof value === 'object') {
        return { value: value as Record<string, unknown> | unknown[] };
    }
    if (typeof value === 'string') {
        try {
            const parsed: unknown = JSON.parse(value);
            if (parsed !== null && typeof parsed === 'object') {
                return { value: parsed as Record<string, unknown> | unknown[] };
            }
        } catch {
            // fall through to PARSE_ERROR
        }
        return { value: defaultValue, errorCode: 'PARSE_ERROR' };
    }
    return { value: defaultValue, errorCode: 'TYPE_MISMATCH' };
}

/**
 * The local, zero-config flag provider: `feature.<flag>` properties drive
 * evaluations, read live on every call.
 *
 * Semantics (AD-82 D-3):
 * - missing property → `DEFAULT` with the caller's default value;
 * - boolean: truthy / `'true'` → `STATIC` true; `'false'`, `0`, `''`,
 *   `null` → `DISABLED` false;
 * - percentage rollouts: `<namespace>.rollout.<flag>` in [0, 1] gates an
 *   enabled flag per `evaluationContext.targetingKey` (`SPLIT` buckets).
 * - number/string: pass through when the type matches, else
 *   `TYPE_MISMATCH` + default;
 * - object: JSON values and JSON-parsable strings pass through, else
 *   `PARSE_ERROR` + default.
 */
export class PropertyFlagProvider implements FlagEvaluator {
    /** Backend identifier. */
    readonly kind = 'property';
    #getProperty: FlagPropertyReader['getProperty'];
    #namespace: string;

    /**
     * @param options - The reader and optional namespace.
     * @throws {TypeError} When the namespace is empty or malformed.
     */
    constructor(options: PropertyFlagProviderOptions) {
        const { getProperty, namespace = 'feature' } = options;
        if (typeof getProperty !== 'function') {
            throw new TypeError('PropertyFlagProvider: "getProperty" reader is required');
        }
        validateFlagKey(namespace, 'PropertyFlagProvider namespace');
        this.#getProperty = getProperty;
        this.#namespace = namespace;
    }

    /** The property key a flag resolves to: `<namespace>.<flag>`. */
    keyFor(flag: string): string {
        return `${this.#namespace}.${flag}`;
    }

    /**
     * Evaluates the flag against the current property state. Never
     * throws: a throwing reader resolves as `ERROR` + `${defaultValue}`.
     */
    async evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>> {
        validateFlagKey(flag, 'PropertyFlagProvider');
        const key = this.keyFor(flag);

        let value: unknown;
        try {
            value = this.#getProperty(key);
        } catch (error) {
            return {
                value: defaultValue,
                reason: 'ERROR',
                errorCode: 'GENERAL',
                errorMessage: error instanceof Error ? error.message : String(error),
            };
        }

        if (value === undefined || value === null) {
            return { value: defaultValue, reason: 'DEFAULT' };
        }

        const converted = convertTo(value, defaultValue);
        if (converted.errorCode) {
            return {
                value: converted.value as T,
                reason: 'ERROR',
                errorCode: converted.errorCode,
            };
        }

        if (typeof defaultValue === 'boolean') {
            if (converted.value === true) {
                // T is boolean on this path — rollout evaluation is
                // boolean-typed by construction.
                return (await this.#evaluateRollout(flag, ctx ?? undefined)) as FlagEvaluation<T>;
            }
            return { value: false as T, reason: 'DISABLED' };
        }
        return { value: converted.value as T, reason: 'STATIC' };
    }

    /**
     * Applies a percentage rollout to an enabled boolean flag.
     *
     * A rollout is declared per flag at `<namespace>.rollout.<flag>` as a
     * number in [0, 1] — the fraction of targeted traffic the flag enables.
     * The flag's own value stays the master switch: `feature.<flag>`
     * truthy AND inside the rollout → on; anywhere outside → off.
     *
     * Semantics:
     * - no rollout property (or an invalid one — non-number or outside
     *   [0, 1]) → the flag is `STATIC` true (no gating);
     * - `targetingKey` present → `SPLIT` by {@link stableBucket}:
     *   `bucket < rollout`;
     * - no `targetingKey` → `SPLIT` false — untargeted requests are
     *   excluded from experimental traffic (rollout 1 is the full-on
     *   exception: `true` for anyone, keyed or not).
     */
    async #evaluateRollout(flag: string, ctx: FlagEvaluationContext | undefined): Promise<FlagEvaluation<boolean>> {
        let rollout: unknown;
        try {
            rollout = this.#getProperty(`${this.#namespace}.rollout.${flag}`);
        } catch {
            return { value: true, reason: 'STATIC' };
        }
        if (!(typeof rollout === 'number') || !Number.isFinite(rollout) || rollout < 0 || rollout > 1) {
            return { value: true, reason: 'STATIC' };
        }
        const targetingKey = ctx?.targetingKey;
        if (typeof targetingKey !== 'string' || targetingKey === '') {
            return { value: rollout >= 1, reason: 'SPLIT' };
        }
        return { value: stableBucket(flag, targetingKey) < rollout, reason: 'SPLIT' };
    }
}
