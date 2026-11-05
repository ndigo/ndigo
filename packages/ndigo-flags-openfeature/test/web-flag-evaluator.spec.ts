/**
 * Web bridge spec (AD-87 Phase 2): the `FlagEvaluator` over an
 * `@openfeature/web-sdk` client — sync-snapshot evaluation wrapped in the
 * async SPI, the static-context semantics (per-call `ctx` not forwarded),
 * domains, the never-throw boundary, and hook-contract compatibility.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { InMemoryProvider, OpenFeature as WebOpenFeature } from '@openfeature/web-sdk';
import type { Client, JsonValue, Provider, ResolutionDetails } from '@openfeature/web-sdk';
import { WebOpenFeatureFlagEvaluator } from '../src/web/openfeature-web-flag-evaluator';
import { FeatureFlagTelemetryHook } from '../src/feature-flag-telemetry-hook';

/** Registers a web provider on the global web API (or a domain) and awaits readiness. */
async function useProvider(provider: Provider, domain?: string): Promise<void> {
    if (domain === undefined) {
        await WebOpenFeature.setProviderAndWait(provider);
    } else {
        await WebOpenFeature.setProviderAndWait(domain, provider);
    }
}

/** A minimal synchronous web Provider driven by a script. */
function scriptedWebProvider(
    script: (flag: string, type: 'boolean' | 'string' | 'number' | 'object') => ResolutionDetails<JsonValue>
): Provider {
    return {
        metadata: { name: 'scripted-web' },
        runsOn: 'client' as const,
        resolveBooleanEvaluation: (flag: string) => script(flag, 'boolean') as ResolutionDetails<boolean>,
        resolveNumberEvaluation: (flag: string) => script(flag, 'number') as ResolutionDetails<number>,
        resolveStringEvaluation: (flag: string) => script(flag, 'string') as ResolutionDetails<string>,
        resolveObjectEvaluation: (flag: string) => script(flag, 'object') as ResolutionDetails<JsonValue>,
    } as unknown as Provider; // The SDK's web Provider carries optional lifecycle surface this stub does not need.
}

describe('WebOpenFeatureFlagEvaluator', () => {
    afterEach(async () => {
        await WebOpenFeature.clearProviders();
        await WebOpenFeature.setContext({});
        WebOpenFeature.getClient().clearHooks();
    });

    it('identifies itself as the openfeature backend', () => {
        expect(new WebOpenFeatureFlagEvaluator().kind).toBe('openfeature');
    });

    it('evaluates boolean, string, number, and object flags through the global client', async () => {
        await useProvider(
            new InMemoryProvider({
                beta: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false },
                greeting: { variants: { hi: 'hello', bye: 'goodbye' }, defaultVariant: 'hi', disabled: false },
                limit: { variants: { small: 5, big: 50 }, defaultVariant: 'small', disabled: false },
                layout: {
                    variants: { grid: { columns: 2 }, list: { columns: 1 } },
                    defaultVariant: 'grid',
                    disabled: false,
                },
            })
        );
        const evaluator = new WebOpenFeatureFlagEvaluator();

        const beta = await evaluator.evaluate('beta', false);
        expect(beta.value).toBe(true);
        expect(beta.reason).toBe('STATIC');
        expect(beta.variant).toBe('on');
        expect(beta.flagMetadata).toEqual({});

        expect((await evaluator.evaluate('greeting', '')).value).toBe('hello');
        expect((await evaluator.evaluate('limit', 0)).value).toBe(5);
        expect((await evaluator.evaluate('layout', {})).value).toEqual({ columns: 2 });
    });

    it('returns the caller default with FLAG_NOT_FOUND for an unregistered flag', async () => {
        await useProvider(new InMemoryProvider({}));

        const result = await new WebOpenFeatureFlagEvaluator().evaluate('missing', 'fallback');

        expect(result.value).toBe('fallback');
        expect(result.errorCode).toBe('FLAG_NOT_FOUND');
    });

    it('targets from the static context only — the per-call ctx is not forwarded', async () => {
        await WebOpenFeature.setContext({ targetingKey: 'user-9' });
        await useProvider(
            new InMemoryProvider({
                targeted: {
                    variants: { on: true, off: false },
                    defaultVariant: 'off',
                    disabled: false,
                    contextEvaluator: (ctx) => (ctx['targetingKey'] === 'user-9' ? 'on' : 'off'),
                },
            })
        );
        const evaluator = new WebOpenFeatureFlagEvaluator();

        // The per-call ctx says otherwise; the provider must still see the
        // static context (web SDK semantics — documented on the class).
        const result = await evaluator.evaluate('targeted', false, { targetingKey: 'someone-else' });

        expect(result.value).toBe(true);
        expect(result.reason).toBe('TARGETING_MATCH');
    });

    it('resolves a domain (named-client) provider via the domain option', async () => {
        await useProvider(
            new InMemoryProvider({
                flag: { variants: { on: true, off: false }, defaultVariant: 'off', disabled: false },
            })
        );
        await useProvider(
            new InMemoryProvider({
                flag: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false },
            }),
            'checkout'
        );

        const global = await new WebOpenFeatureFlagEvaluator().evaluate('flag', false);
        const scoped = await new WebOpenFeatureFlagEvaluator({ domain: 'checkout' }).evaluate('flag', false);

        expect(global.value).toBe(false);
        expect(scoped.value).toBe(true);
    });

    it('rejects a constructor that combines client and domain', () => {
        const client = WebOpenFeature.getClient();

        expect(() => new WebOpenFeatureFlagEvaluator({ client, domain: 'checkout' })).toThrow(
            'pass either "client" or "domain", not both'
        );
    });

    it('rejects an invalid flag key (definition-time contract)', async () => {
        await expect(new WebOpenFeatureFlagEvaluator().evaluate('bad key!', false)).rejects.toThrow('invalid flag key');
    });

    it('never throws: a throwing client surfaces as ERROR + GENERAL with the default', async () => {
        const client = {
            getBooleanDetails: () => {
                throw new Error('client exploded');
            },
        } as unknown as Client; // Deliberate violating client — the defensive boundary is under test.

        const result = await new WebOpenFeatureFlagEvaluator({ client }).evaluate('flag', true);

        expect(result).toEqual({
            value: true,
            reason: 'ERROR',
            errorCode: 'GENERAL',
            errorMessage: 'client exploded',
            flagMetadata: {},
        });
    });

    it('carries provider reasons and metadata through the web mapping', async () => {
        await useProvider(
            scriptedWebProvider(() => ({ value: 'v', reason: 'MADE_UP', flagMetadata: { configVersion: '9' } }))
        );

        const result = await new WebOpenFeatureFlagEvaluator().evaluate('flag', '');

        expect(result.reason).toBe('UNKNOWN');
        expect(result.flagMetadata).toEqual({ configVersion: '9' });
    });

    it('the telemetry hook satisfies the web SDK hook contract', () => {
        // Compile-time proof (the hook is typed against the server SDK) plus a
        // runtime no-throw: the same instance registers on the web client.
        const client = WebOpenFeature.getClient();
        expect(() => client.addHooks(new FeatureFlagTelemetryHook())).not.toThrow();
        expect(client.getHooks()).toHaveLength(1);
    });
});
