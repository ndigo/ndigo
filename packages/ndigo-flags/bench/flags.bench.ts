// oxlint-disable no-await-in-loop -- evaluate is awaited sequentially to measure per-call cost.
/**
 * `@ndigo/flags` PropertyFlagProvider evaluate throughput.
 *
 * Evaluation is async and never-throw; rows measure the full evaluate
 * contract including the property read and conversion. A throwing reader
 * path is measured separately to pin the no-throw overhead.
 */
import { test } from 'vitest';
import { PropertyFlagProvider } from '../src/property-flag-provider';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

test('PropertyFlagProvider — evaluate boolean (true/false/default)', async ({ bench }) => {
    const props = new Map<string, unknown>([
        ['feature.on', true],
        ['feature.off', 'false'],
    ]);
    const provider = new PropertyFlagProvider({ getProperty: (k) => props.get(k) });
    const r1 = await provider.evaluate('on', false);
    const r2 = await provider.evaluate('off', false);
    const r3 = await provider.evaluate('missing', false);
    assertEquivalent('on', r1.value, true);
    assertEquivalent('off', r2.value, false);
    assertEquivalent('default', r3.value, false);
    await bench.compare(
        bench(benchName('evaluate boolean true', BATCH), async () => {
            let acc = 0;
            for (let i = 0; i < BATCH; i++) {
                const r = await provider.evaluate('on', false);
                if (r.value) acc++;
            }
            retain(acc);
        }),
        bench(benchName('evaluate boolean missing (default)', BATCH), async () => {
            let acc = 0;
            for (let i = 0; i < BATCH; i++) {
                const r = await provider.evaluate('missing', false);
                if (!r.value) acc++;
            }
            retain(acc);
        })
    );
});

test('PropertyFlagProvider — evaluate string/number/object', async ({ bench }) => {
    const props = new Map<string, unknown>([
        ['feature.name', 'hello'],
        ['feature.count', 42],
        ['feature.cfg', '{"a":1}'],
    ]);
    const provider = new PropertyFlagProvider({ getProperty: (k) => props.get(k) });
    await bench.compare(
        bench(benchName('evaluate string', BATCH), async () => {
            let acc = 0;
            for (let i = 0; i < BATCH; i++) {
                const r = await provider.evaluate('name', 'default');
                if ((r.value as unknown) === 'hello') acc++;
            }
            retain(acc);
        }),
        bench(benchName('evaluate number', BATCH), async () => {
            let acc = 0;
            for (let i = 0; i < BATCH; i++) {
                const r = await provider.evaluate('count', 0);
                if ((r.value as unknown) === 42) acc++;
            }
            retain(acc);
        })
    );
});

test('PropertyFlagProvider — rollout bucketing', async ({ bench }) => {
    const props = new Map<string, unknown>([
        ['feature.rollout.flag', 0.5],
        ['feature.flag', true],
    ]);
    const provider = new PropertyFlagProvider({ getProperty: (k) => props.get(k) });
    await bench(benchName('evaluate rollout', BATCH), async () => {
        let acc = 0;
        for (let i = 0; i < BATCH; i++) {
            const r = await provider.evaluate('flag', false, { targetingKey: `user-${i}` });
            if ((r.value as unknown) === true || (r.value as unknown) === false) acc++;
        }
        retain(acc);
    }).run();
});

test('PropertyFlagProvider — throwing reader (no-throw contract)', async ({ bench }) => {
    const provider = new PropertyFlagProvider({
        getProperty: () => {
            throw new Error('boom');
        },
    });
    const r = await provider.evaluate('flag', false);
    assertEquivalent('error reason', r.reason, 'ERROR');
    await bench(benchName('evaluate throwing reader', BATCH), async () => {
        let acc = 0;
        for (let i = 0; i < BATCH; i++) {
            const ev = await provider.evaluate('flag', false);
            if (ev.reason === 'ERROR') acc++;
        }
        retain(acc);
    }).run();
});
