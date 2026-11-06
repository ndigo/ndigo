/**
 * Bridge spec (AD-87): the `FlagEvaluator` mapping over an OpenFeature
 * client — typed dispatch, reason/error translation, context flattening,
 * domain clients, and the never-throw boundary.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { OpenFeature } from '@openfeature/server-sdk';
import type { Client, ErrorCode, Provider, ResolutionReason } from '@openfeature/server-sdk';
import { OpenFeatureFlagEvaluator } from '../src/openfeature-flag-evaluator';
import { inMemoryProvider, scriptedProvider } from './_providers';

/** Registers a provider on the global API (or a domain) and awaits readiness. */
async function useProvider(provider: Provider, domain?: string): Promise<void> {
    if (domain === undefined) {
        await OpenFeature.setProviderAndWait(provider);
    } else {
        await OpenFeature.setProviderAndWait(domain, provider);
    }
}

describe('OpenFeatureFlagEvaluator', () => {
    afterEach(async () => {
        await OpenFeature.clearProviders();
    });

    it('identifies itself as the openfeature backend', () => {
        expect(new OpenFeatureFlagEvaluator().kind).toBe('openfeature');
    });

    it('evaluates boolean, string, number, and object flags through the global client', async () => {
        await useProvider(
            inMemoryProvider({
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
        const evaluator = new OpenFeatureFlagEvaluator();

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
        await useProvider(inMemoryProvider({}));
        const evaluator = new OpenFeatureFlagEvaluator();

        const result = await evaluator.evaluate('missing', 'fallback');

        expect(result.value).toBe('fallback');
        expect(result.errorCode).toBe('FLAG_NOT_FOUND');
    });

    it.each(['STATIC', 'TARGETING_MATCH', 'SPLIT', 'CACHED', 'DISABLED', 'DEFAULT', 'STALE'] as const)(
        'maps the standard reason %s pass-through',
        async (reason) => {
            await useProvider(scriptedProvider(() => ({ value: true, reason: reason as ResolutionReason })));

            expect((await new OpenFeatureFlagEvaluator().evaluate('flag', false)).reason).toBe(reason);
        }
    );

    it('maps an unrecognized provider reason to UNKNOWN', async () => {
        await useProvider(scriptedProvider(() => ({ value: true, reason: 'MADE_UP' as ResolutionReason })));

        expect((await new OpenFeatureFlagEvaluator().evaluate('flag', false)).reason).toBe('UNKNOWN');
    });

    it('maps an absent provider reason to UNKNOWN', async () => {
        await useProvider(scriptedProvider(() => ({ value: true })));

        expect((await new OpenFeatureFlagEvaluator().evaluate('flag', false)).reason).toBe('UNKNOWN');
    });

    it('maps error codes pass-through and unrecognized codes to GENERAL', async () => {
        const evaluator = new OpenFeatureFlagEvaluator();

        await useProvider(scriptedProvider(() => ({ value: 0, errorCode: 'TYPE_MISMATCH' as ErrorCode })));
        expect((await evaluator.evaluate('flag', 0)).errorCode).toBe('TYPE_MISMATCH');

        await useProvider(scriptedProvider(() => ({ value: 0, errorCode: 'NOT_A_CODE' as ErrorCode })));
        expect((await evaluator.evaluate('flag', 0)).errorCode).toBe('GENERAL');
    });

    it('passes provider flagMetadata through as an object', async () => {
        await useProvider(scriptedProvider(() => ({ value: 'x', flagMetadata: { configVersion: '7', bucket: 3 } })));

        const result = await new OpenFeatureFlagEvaluator().evaluate('flag', '');

        expect(result.flagMetadata).toEqual({ configVersion: '7', bucket: 3 });
    });

    it('forwards targetingKey and attributes (flattened) to the provider', async () => {
        await useProvider(
            inMemoryProvider({
                targeted: {
                    variants: { a: 'a', b: 'b' },
                    defaultVariant: 'a',
                    disabled: false,
                    // Reads both the targeting key and a flattened attribute.
                    contextEvaluator: (ctx) =>
                        String(ctx['targetingKey']).startsWith('t-') && ctx['plan'] === 'pro' ? 'b' : 'a',
                },
            })
        );
        const evaluator = new OpenFeatureFlagEvaluator();

        const matched = await evaluator.evaluate('targeted', '', {
            targetingKey: 't-1',
            attributes: { plan: 'pro' },
        });
        expect(matched.value).toBe('b');
        expect(matched.reason).toBe('TARGETING_MATCH');

        const unmatched = await evaluator.evaluate('targeted', '', {
            targetingKey: 'other',
            attributes: { plan: 'pro' },
        });
        expect(unmatched.value).toBe('a');
    });

    it('resolves a domain (named-client) provider via the domain option', async () => {
        await useProvider(
            inMemoryProvider({ flag: { variants: { on: true, off: false }, defaultVariant: 'off', disabled: false } })
        );
        await useProvider(
            inMemoryProvider({ flag: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false } }),
            'checkout'
        );

        const global = await new OpenFeatureFlagEvaluator().evaluate('flag', false);
        const scoped = await new OpenFeatureFlagEvaluator({ domain: 'checkout' }).evaluate('flag', false);

        expect(global.value).toBe(false);
        expect(scoped.value).toBe(true);
    });

    it('evaluates through an explicitly supplied client', async () => {
        await useProvider(
            inMemoryProvider({ flag: { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false } })
        );
        const client = OpenFeature.getClient();

        const result = await new OpenFeatureFlagEvaluator({ client }).evaluate('flag', false);

        expect(result.value).toBe(true);
    });

    it('rejects a constructor that combines client and domain', () => {
        const client = OpenFeature.getClient();

        expect(() => new OpenFeatureFlagEvaluator({ client, domain: 'checkout' })).toThrow(
            'pass either "client" or "domain", not both'
        );
    });

    it('rejects an invalid flag key (definition-time contract)', async () => {
        await expect(new OpenFeatureFlagEvaluator().evaluate('bad key!', false)).rejects.toThrow('invalid flag key');
    });

    it('never throws: a throwing client surfaces as ERROR + GENERAL with the default', async () => {
        const client = {
            getBooleanDetails: () => {
                throw new Error('client exploded');
            },
        } as unknown as Client; // Deliberate violating client — the defensive boundary is under test.

        const result = await new OpenFeatureFlagEvaluator({ client }).evaluate('flag', true);

        expect(result).toEqual({
            value: true,
            reason: 'ERROR',
            errorCode: 'GENERAL',
            errorMessage: 'client exploded',
            flagMetadata: {},
        });
    });

    it('narrows a provider-resolved null to the caller default with TYPE_MISMATCH', async () => {
        await useProvider(scriptedProvider(() => ({ value: null })));

        const result = await new OpenFeatureFlagEvaluator().evaluate('flag', 'fallback');

        expect(result.value).toBe('fallback');
        expect(result.errorCode).toBe('TYPE_MISMATCH');
    });

    it('never throws: a throwing provider degrades to the default with an error classification', async () => {
        await useProvider(
            scriptedProvider(() => {
                throw new Error('provider exploded');
            })
        );

        const result = await new OpenFeatureFlagEvaluator().evaluate('flag', 42);

        expect(result.value).toBe(42);
        expect(result.reason).toBe('ERROR');
        expect(result.errorCode).toBeDefined();
    });
});
