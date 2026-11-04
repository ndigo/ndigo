/**
 * `PropertyFlagProvider` semantics (AD-82 D-3): the read-through matrix —
 * boolean/number/string/object, DEFAULT on missing, DISABLED on false,
 * TYPE_MISMATCH/PARSE_ERROR + default, never-throw on a throwing reader,
 * namespace resolution, and default-value typing.
 *
 * @module ndigo-flags
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { PropertyFlagProvider, stableBucket } from '../src/property-flag-provider';

const reader = (values: Record<string, unknown>) => ({
    getProperty: (key: string) => values[key],
});

describe('PropertyFlagProvider', () => {
    test('kind is property', () => {
        expect(new PropertyFlagProvider(reader({})).kind).toBe('property');
    });

    test('reads flags under the default feature namespace', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.pay': true }));
        expect(provider.keyFor('pay')).toBe('feature.pay');
        const result = await provider.evaluate('pay', false);
        expect(result).toEqual({ value: true, reason: 'STATIC' });
    });

    test('reads flags under a custom namespace', async () => {
        const namespaced = new PropertyFlagProvider({
            getProperty: reader({ 'app.flags.pay': true }).getProperty,
            namespace: 'app.flags',
        });
        expect(namespaced.keyFor('pay')).toBe('app.flags.pay');
        expect((await namespaced.evaluate('pay', false)).value).toBe(true);
    });

    test('invalid namespaces fail loud at construction', () => {
        expect(() => new PropertyFlagProvider({ getProperty: () => undefined, namespace: 'a b' })).toThrow(TypeError);
        expect(() => new PropertyFlagProvider({ getProperty: () => undefined, namespace: '' })).toThrow(TypeError);
        expect(() => new PropertyFlagProvider({ getProperty: undefined as never })).toThrow(TypeError);
    });

    test('boolean: truthy and "true" are STATIC true; false values are DISABLED', async () => {
        const provider = new PropertyFlagProvider(
            reader({
                'feature.a': true,
                'feature.b': 'true',
                'feature.c': 1,
                'feature.d': 'yes',
                'feature.e': false,
                'feature.f': 'false',
                'feature.g': 0,
                'feature.h': '',
            })
        );
        expect((await provider.evaluate('a', false)).value).toBe(true);
        expect((await provider.evaluate('b', false)).value).toBe(true);
        expect((await provider.evaluate('c', false)).value).toBe(true);
        expect((await provider.evaluate('d', false)).value).toBe(true);

        const off = await provider.evaluate('e', false);
        expect(off.value).toBe(false);
        expect(off.reason).toBe('DISABLED');
        expect((await provider.evaluate('f', false)).value).toBe(false);
        expect((await provider.evaluate('g', false)).value).toBe(false);
        expect((await provider.evaluate('h', false)).value).toBe(false);
    });

    test('boolean: missing property returns the default with DEFAULT reason', async () => {
        const result = await new PropertyFlagProvider(reader({})).evaluate('missing', false);
        expect(result).toEqual({ value: false, reason: 'DEFAULT' });
    });

    test('number: pass-through and numeric-string coercion; mismatch is TYPE_MISMATCH + default', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.n': 42, 'feature.s': '7', 'feature.bad': 'oops' }));
        expect((await provider.evaluate('n', 0)).value).toBe(42);
        expect((await provider.evaluate('s', 0)).value).toBe(7);

        const bad = await provider.evaluate('bad', 0);
        expect(bad.value).toBe(0);
        expect(bad.reason).toBe('ERROR');
        expect(bad.errorCode).toBe('TYPE_MISMATCH');
    });

    test('string: pass-through; non-strings are TYPE_MISMATCH + default', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.s': 'two', 'feature.n': 2 }));
        expect((await provider.evaluate('s', 'x')).value).toBe('two');
        const bad = await provider.evaluate('n', 'x');
        expect(bad.value).toBe('x');
        expect(bad.errorCode).toBe('TYPE_MISMATCH');
    });

    test('object: JSON values pass through; JSON strings parse; garbage is PARSE_ERROR + default', async () => {
        const provider = new PropertyFlagProvider(
            reader({ 'feature.o': { a: 1 }, 'feature.j': '{"b":2}', 'feature.garbage': 'not json' })
        );
        const direct = await provider.evaluate('o', {});
        expect(direct.value).toEqual({ a: 1 });
        expect(direct.reason).toBe('STATIC');
        expect((await provider.evaluate('j', {})).value).toEqual({ b: 2 });

        const bad = await provider.evaluate('garbage', {});
        expect(bad.value).toEqual({});
        expect(bad.errorCode).toBe('PARSE_ERROR');
    });

    test('a throwing reader never rejects: GENERAL error + default', async () => {
        const provider = new PropertyFlagProvider({
            getProperty: () => {
                throw new Error('boom');
            },
        });
        const result = await provider.evaluate('x', true);
        expect(result.value).toBe(true);
        expect(result.reason).toBe('ERROR');
        expect(result.errorCode).toBe('GENERAL');
        expect(result.errorMessage).toBe('boom');
    });

    test('invalid flag keys fail loud at evaluation time', async () => {
        const provider = new PropertyFlagProvider(reader({}));
        await expect(provider.evaluate('bad key', false)).rejects.toThrow(TypeError);
    });

    test('a null value is treated as missing (DEFAULT)', async () => {
        const provider = new PropertyFlagProvider(reader({ x: null }));
        const result = await provider.evaluate('x', true);
        expect(result).toEqual({ value: true, reason: 'DEFAULT' });
    });
});

describe('PropertyFlagProvider percentage rollouts (feature.rollout.<flag>)', () => {
    test('stableBucket is deterministic, in [0, 1)', () => {
        const a = stableBucket('pay', '203.0.113.7');
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThan(1);
        expect(stableBucket('pay', '203.0.113.7')).toBe(a);
        // distinct flag or key → (normally) distinct bucket
        expect(stableBucket('pay', '198.51.100.2')).not.toBe(a);
    });

    test('rollout 0 keeps everyone out; rollout 1 keeps everyone in (keyed)', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': 0 }));
        const ctx = { targetingKey: '10.0.0.1' };
        const out = await provider.evaluate('pay', false, ctx);
        expect(out.value).toBe(false);
        expect(out.reason).toBe('SPLIT');

        const full = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': 1 }));
        expect((await full.evaluate('pay', false, ctx)).value).toBe(true);
    });

    test('rollout 0.5 buckets deterministically per targeting key', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': 0.5 }));
        const key = '198.51.100.2';
        const first = await provider.evaluate('pay', false, { targetingKey: key });
        const second = await provider.evaluate('pay', false, { targetingKey: key });
        expect(first.value).toBe(second.value); // stable across calls

        // across many keys both outcomes occur (the bucket is spread)
        const results = await Promise.all(
            Array.from({ length: 64 }, (_, i) =>
                provider.evaluate<boolean>('pay', false, { targetingKey: `203.0.113.${i}` })
            )
        );
        const values = results.map((result) => result.value);
        expect(values.some((value) => value === true)).toBe(true);
        expect(values.some((value) => value === false)).toBe(true);
    });

    test('no targeting key: rollout < 1 is closed, rollout 1 is open', async () => {
        const partial = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': 0.5 }));
        const out = await partial.evaluate('pay', false);
        expect(out).toEqual({ value: false, reason: 'SPLIT' });

        const full = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': 1 }));
        expect((await full.evaluate('pay', false)).value).toBe(true);
    });

    test('invalid rollout values are ignored (flag stays STATIC true)', async () => {
        const results = await Promise.all(
            [2, -0.5, '0.5', 'half'].map(async (bad) => {
                const provider = new PropertyFlagProvider(reader({ 'feature.pay': true, 'feature.rollout.pay': bad }));
                return provider.evaluate('pay', false, { targetingKey: '10.0.0.1' });
            })
        );
        for (const result of results) {
            expect(result.value).toBe(true);
            expect(result.reason).toBe('STATIC');
        }
    });

    test('a rollout never resurrects a disabled master switch', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.pay': false, 'feature.rollout.pay': 1 }));
        const result = await provider.evaluate('pay', false, { targetingKey: '10.0.0.1' });
        expect(result).toEqual({ value: false, reason: 'DISABLED' });
    });

    test('non-boolean evaluations ignore the rollout channel', async () => {
        const provider = new PropertyFlagProvider(reader({ 'feature.x': '42', 'feature.rollout.x': 0 }));
        const result = await provider.evaluate('x', 0, { targetingKey: '10.0.0.1' });
        expect(result.value).toBe(42);
        expect(result.reason).toBe('STATIC');
    });
});
