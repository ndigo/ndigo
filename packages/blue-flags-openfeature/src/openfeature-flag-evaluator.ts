/**
 * The OpenFeature-backed evaluator (AD-87): maps the `FlagEvaluator` SPI
 * onto an `@openfeature/server-sdk` client. Vendor providers (flagd,
 * OFREP, LaunchDarkly, Unleash, …) arrive through this adapter — the SPI,
 * `@whenFeature`, and app code never change.
 *
 * Lifecycle: the OpenFeature singleton and its providers are
 * **application-owned** (`OpenFeature.setProvider` /
 * `setProviderAndWait` / `OpenFeature.close()`); this evaluator holds no
 * resources of its own and defines no `close()`.
 *
 * @module blue-flags-openfeature
 * @since 1.0.0
 * @author Jeff Rose
 */
import { OpenFeature } from '@openfeature/server-sdk';
import type {
    Client,
    EvaluationContext,
    EvaluationContextValue,
    EvaluationDetails,
    JsonValue,
} from '@openfeature/server-sdk';
import {
    validateFlagKey,
    type FlagErrorCode,
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluationReason,
    type FlagEvaluator,
    type FlagValue,
} from '@blue/flags';

/** The reason vocabulary `@blue/flags` carries — everything else maps to `UNKNOWN`. */
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

/** The error-code vocabulary `@blue/flags` carries — everything else maps to `GENERAL`. */
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
 * The SDK detail shapes the typed dispatch can produce. Our `FlagValue`
 * widens the SDK's `FlagValue` (unknown object members), so the union —
 * not the SDK's generic — is the internal plumbing type; the outer SPI
 * boundary carries the widening.
 */
type BridgeDetails =
    | EvaluationDetails<boolean>
    | EvaluationDetails<number>
    | EvaluationDetails<string>
    | EvaluationDetails<JsonValue>;

/**
 * Options for {@link OpenFeatureFlagEvaluator}.
 */
export interface OpenFeatureFlagEvaluatorOptions {
    /**
     * An explicit client (e.g. one carrying client-scoped hooks or
     * context). Defaults to the global client for {@link domain}.
     */
    client?: Client;
    /** Domain (named-client) key resolved against the global API. */
    domain?: string;
}

/**
 * The OpenFeature bridge: evaluates through an OpenFeature client and
 * returns the SPI's `FlagEvaluation` (reason/error vocabularies match, so
 * the mapping is a translation, not a reinterpretation).
 *
 * Behavior notes (AD-87):
 * - **Never throws**: the SDK's client methods must not throw and the SDK
 *   converts provider failures to `default + errorCode`; a violating hook
 *   or provider is caught here as `ERROR` + `GENERAL`.
 * - A provider that supplies no reason resolves as `UNKNOWN`.
 * - `flagMetadata` is always an object (the SDK's details carry an empty
 *   record when the provider set none).
 */
export class OpenFeatureFlagEvaluator implements FlagEvaluator {
    /** Backend identifier. */
    readonly kind = 'openfeature';
    readonly #client: Client | undefined;
    readonly #domain: string | undefined;

    /**
     * @param options - An explicit client, or a domain key resolved against
     *   the global OpenFeature API; omit both for the global default client.
     * @throws {TypeError} When both `client` and `domain` are given.
     */
    constructor(options: OpenFeatureFlagEvaluatorOptions = {}) {
        if (options.client !== undefined && options.domain !== undefined) {
            throw new TypeError('OpenFeatureFlagEvaluator: pass either "client" or "domain", not both');
        }
        this.#client = options.client;
        this.#domain = options.domain;
    }

    /**
     * Evaluates the flag through the OpenFeature client. Never rejects: any
     * escape (a hook/provider violating the SDK's no-throw contract)
     * resolves as the caller's default with `reason: 'ERROR'`.
     */
    async evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>> {
        validateFlagKey(flag, 'OpenFeatureFlagEvaluator');
        const context = toEvaluationContext(ctx);
        try {
            const details = await this.#evaluateDetails(flag, defaultValue, context);
            // The generic is carried by the defaultValue dispatch above.
            return toFlagEvaluation(details, defaultValue) as FlagEvaluation<T>;
        } catch (error) {
            return {
                value: defaultValue,
                reason: 'ERROR',
                errorCode: 'GENERAL',
                errorMessage: error instanceof Error ? error.message : String(error),
                flagMetadata: {},
            };
        }
    }

    /**
     * The typed evaluation dispatch: the default's runtime type selects the
     * SDK's method (`get{Boolean,Number,String,Object}Details`).
     */
    #evaluateDetails(
        flag: string,
        defaultValue: FlagValue,
        context: EvaluationContext | undefined
    ): Promise<BridgeDetails> {
        const client = this.#resolveClient();
        if (typeof defaultValue === 'boolean') {
            return client.getBooleanDetails(flag, defaultValue, context);
        }
        if (typeof defaultValue === 'number') {
            return client.getNumberDetails(flag, defaultValue, context);
        }
        if (typeof defaultValue === 'string') {
            return client.getStringDetails(flag, defaultValue, context);
        }
        // Our FlagValue widens the SDK's JsonValue (unknown object members) —
        // the provider owns the shape it configured; `unknown` in the cast is
        // the boundary between the two value models (AD-87).
        return client.getObjectDetails(flag, defaultValue as unknown as JsonValue, context);
    }

    /**
     * Resolves the client per evaluation: the global-API lookup is cheap,
     * and late `setProvider` calls (or domain re-registration) are observed
     * without reconstructing the evaluator.
     */
    #resolveClient(): Client {
        if (this.#client !== undefined) {
            return this.#client;
        }
        return this.#domain === undefined ? OpenFeature.getClient() : OpenFeature.getClient(this.#domain);
    }
}

/**
 * Maps the SPI context onto an OpenFeature `EvaluationContext`: the
 * targeting key plus the caller's attributes, flattened at the top level
 * (the OpenFeature shape).
 */
function toEvaluationContext(ctx: FlagEvaluationContext | undefined): EvaluationContext | undefined {
    if (ctx === undefined) {
        return undefined;
    }
    const context: EvaluationContext = {};
    if (ctx.targetingKey !== undefined) {
        context['targetingKey'] = ctx.targetingKey;
    }
    for (const [key, value] of Object.entries(ctx.attributes ?? {})) {
        // Attributes are caller-typed as unknown; the provider narrows what it reads.
        context[key] = value as EvaluationContextValue;
    }
    return Object.keys(context).length > 0 ? context : undefined;
}

/**
 * Translates SDK evaluation details into the SPI's `FlagEvaluation`.
 *
 * One narrowing: OpenFeature's value model allows `null`, the SPI's does
 * not (the default value selects the type) — a null resolution surfaces as
 * the caller's default with `TYPE_MISMATCH`.
 */
function toFlagEvaluation(details: BridgeDetails, defaultValue: FlagValue): FlagEvaluation<FlagValue> {
    if (details.value === null) {
        return {
            value: defaultValue,
            reason: 'ERROR',
            errorCode: 'TYPE_MISMATCH',
            errorMessage: 'provider resolved null; the SPI value model carries no null',
            flagMetadata: { ...details.flagMetadata },
        };
    }
    const evaluation: FlagEvaluation<FlagValue> = {
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
