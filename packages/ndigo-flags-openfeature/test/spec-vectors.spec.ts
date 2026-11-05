/**
 * OpenFeature specification vectors, adapted (AD-87).
 *
 * Transcribed from the spec's Appendix B scenarios (v0.9.0) for the
 * capability tags that constrain the bridge mapping — `@standard-reasons`,
 * `@object`, `@disabled-flags`. The SDK's own suite certifies the SDK; these
 * vectors certify that the **bridge** carries the standard outcomes into the
 * SPI without reinterpretation.
 *
 * Source: https://github.com/open-feature/spec/blob/main/specification/appendix-b.md
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, describe, expect, it } from 'vitest';
import { OpenFeature } from '@openfeature/server-sdk';
import { OpenFeatureFlagEvaluator } from '../src/openfeature-flag-evaluator';
import { inMemoryProvider, scriptedProvider } from './_providers';

const evaluator = new OpenFeatureFlagEvaluator();

describe('OpenFeature spec vectors (adapted)', () => {
    afterEach(async () => {
        await OpenFeature.clearProviders();
    });

    // Vector: @standard-reasons — a resolution whose reason is a standard
    // value reports that reason unchanged.
    it.each(['STATIC', 'TARGETING_MATCH', 'SPLIT', 'CACHED', 'DISABLED', 'DEFAULT', 'UNKNOWN', 'STALE', 'ERROR'])(
        'carries the standard reason %s unchanged',
        async (reason) => {
            await OpenFeature.setProviderAndWait(scriptedProvider(() => ({ value: 'v', reason })));

            const result = await evaluator.evaluate('flag', '');

            expect(result.reason).toBe(reason);
        }
    );

    // Vector: @object — object values resolve as structured data, not strings.
    it('resolves an object flag as structured data', async () => {
        const value = { nested: { deep: [1, 2, 3] }, label: 'ok' };
        await OpenFeature.setProviderAndWait(
            inMemoryProvider({
                'object-flag': { variants: { structured: value }, defaultVariant: 'structured', disabled: false },
            })
        );

        const result = await evaluator.evaluate('object-flag', {});

        expect(result.value).toEqual(value);
        expect(result.reason).toBe('STATIC');
    });

    // Vector: @disabled-flags — a disabled flag returns the default value;
    // the outcome is a successful evaluation (no error code).
    it('returns the default for a disabled flag without an error', async () => {
        await OpenFeature.setProviderAndWait(
            inMemoryProvider({
                'disabled-flag': { variants: { on: true, off: false }, defaultVariant: 'on', disabled: true },
            })
        );

        const result = await evaluator.evaluate('disabled-flag', false);

        expect(result.value).toBe(false);
        expect(result.reason).toBe('DISABLED');
        expect(result.errorCode).toBeUndefined();
    });
});
