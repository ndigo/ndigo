/**
 * The browser-side OpenFeature evaluator (AD-87 Phase 2): maps the
 * `FlagEvaluator` SPI onto an `@openfeature/web-sdk` client. The web SDK
 * resolves from a provider-materialized snapshot with **synchronous**
 * evaluation, so this adapter wraps it in the SPI's async shape without
 * per-call latency surprises.
 *
 * Targeting is **static** in the web SDK: the evaluation context is set on
 * the client/API (`OpenFeature.setContext(...)`) and re-conciled by the
 * provider (`onContextChange`); the SPI's per-call `ctx` is therefore not
 * forwarded (documented, not silently dropped — the server entry is the one
 * with per-invocation context).
 *
 * Lifecycle: the web OpenFeature singleton and its provider are
 * **application-owned** (`setProviderAndWait`, `OpenFeature.close()`); this
 * evaluator holds no resources of its own. Evaluate only when the provider
 * is READY (the SDK serves defaults before that; `setProviderAndWait`
 * settles readiness at bootstrap).
 *
 * @module ndigo-flags-openfeature
 * @since 1.0.0
 * @author Jeff Rose
 */
import { OpenFeature } from '@openfeature/web-sdk';
import type { Client, JsonValue } from '@openfeature/web-sdk';
import {
    validateFlagKey,
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluator,
    type FlagValue,
} from '@ndigo/flags';
import { toFlagEvaluation, type OpenFeatureEvaluationDetails } from '../_mapping';

/**
 * Options for {@link WebOpenFeatureFlagEvaluator}.
 */
export interface WebOpenFeatureFlagEvaluatorOptions {
    /**
     * An explicit client (e.g. one carrying client-scoped hooks). Defaults
     * to the global client for {@link domain}.
     */
    client?: Client;
    /** Domain (named-client) key resolved against the global web API. */
    domain?: string;
}

/**
 * The browser OpenFeature bridge: evaluates through a web-SDK client and
 * returns the SPI's `FlagEvaluation`. The reason/error vocabularies match,
 * the mapping never throws, `flagMetadata` is always an object, and a
 * provider-resolved `null` narrows to the caller's default with
 * `TYPE_MISMATCH` — identical semantics to the server evaluator.
 *
 * The per-call `ctx` parameter is **not forwarded** (the web SDK's context
 * is static — see the module doc).
 */
export class WebOpenFeatureFlagEvaluator implements FlagEvaluator {
    /** Backend identifier. */
    readonly kind = 'openfeature';
    readonly #client: Client | undefined;
    readonly #domain: string | undefined;

    /**
     * @param options - An explicit client, or a domain key resolved against
     *   the global web OpenFeature API; omit both for the global default.
     * @throws {TypeError} When both `client` and `domain` are given.
     */
    constructor(options: WebOpenFeatureFlagEvaluatorOptions = {}) {
        if (options.client !== undefined && options.domain !== undefined) {
            throw new TypeError('WebOpenFeatureFlagEvaluator: pass either "client" or "domain", not both');
        }
        this.#client = options.client;
        this.#domain = options.domain;
    }

    /**
     * Evaluates the flag through the web client. Never rejects: any escape
     * (a hook/provider violating the SDK's no-throw contract) resolves as
     * the caller's default with `reason: 'ERROR'`.
     */
    async evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        _ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>> {
        validateFlagKey(flag, 'WebOpenFeatureFlagEvaluator');
        try {
            const details = this.#evaluateDetails(flag, defaultValue);
            // The generic is carried by the defaultValue dispatch above.
            return toFlagEvaluation<FlagValue>(details, defaultValue) as FlagEvaluation<T>;
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
     * web SDK's (synchronous) `get{Boolean,Number,String,Object}Details`.
     */
    #evaluateDetails(flag: string, defaultValue: FlagValue): OpenFeatureEvaluationDetails<FlagValue> {
        const client = this.#resolveClient();
        if (typeof defaultValue === 'boolean') {
            return client.getBooleanDetails(flag, defaultValue);
        }
        if (typeof defaultValue === 'number') {
            return client.getNumberDetails(flag, defaultValue);
        }
        if (typeof defaultValue === 'string') {
            return client.getStringDetails(flag, defaultValue);
        }
        // Our FlagValue widens the SDK's JsonValue (unknown object members) —
        // the provider owns the shape it configured; `unknown` in the cast is
        // the boundary between the two value models (AD-87).
        return client.getObjectDetails(flag, defaultValue as unknown as JsonValue);
    }

    /**
     * Resolves the client per evaluation: the global-API lookup is cheap,
     * and late `setProvider` calls (or domain registration) are observed
     * without reconstructing the evaluator.
     */
    #resolveClient(): Client {
        if (this.#client !== undefined) {
            return this.#client;
        }
        return this.#domain === undefined ? OpenFeature.getClient() : OpenFeature.getClient(this.#domain);
    }
}
