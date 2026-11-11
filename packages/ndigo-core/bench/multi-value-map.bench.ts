/**
 * MultiValueMap throughput against a raw `Map<K, V[]>` baseline.
 *
 * Fixtures are built in `beforeEach` (outside the timed body). Each measured
 * iteration performs 1,000 logical operations; the runner normalizes the
 * `@ops=1000` suffix to `ns/op`.
 */
import { test } from 'vitest';
import { MultiValueMap } from '../src/multi-value-map';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const KEYS = Array.from({ length: 10 }, (_, index) => `key-${index}`);
const VALUES = Array.from({ length: 100 }, (_, index) => index);
const retain = sink;
const MultiValueMapClass = MultiValueMap;

let multi = new MultiValueMapClass<string, number>();
let raw = new Map<string, number[]>();

function reset(): void {
    multi = new MultiValueMapClass<string, number>();
    raw = new Map<string, number[]>();
}

function resetPrefilled(): void {
    reset();
    for (const value of VALUES) {
        const key = KEYS[value % KEYS.length];
        multi.add(key, value);
        const values = raw.get(key) ?? [];
        values.push(value);
        raw.set(key, values);
    }
}

test('add — 1,000 inserts across 10 keys', async ({ bench }) => {
    await bench.compare(
        bench(benchName('MultiValueMap.add', BATCH), { beforeEach: reset }, () => {
            for (let i = 0; i < BATCH; i++) multi.add(KEYS[i % KEYS.length], i);
            retain(multi.size);
        }),
        bench(benchName('raw Map add', BATCH), { beforeEach: reset }, () => {
            for (let i = 0; i < BATCH; i++) {
                const key = KEYS[i % KEYS.length];
                const values = raw.get(key) ?? [];
                values.push(i);
                raw.set(key, values);
            }
            retain(raw.size);
        })
    );
});

test('get — 1,000 reads on a pre-filled map', async ({ bench }) => {
    resetPrefilled();
    assertEquivalent('MultiValueMap.get', multi.get(KEYS[3]), raw.get(KEYS[3]));
    await bench.compare(
        bench(benchName('MultiValueMap.get', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(multi.get(KEYS[i % KEYS.length]));
        }),
        bench(benchName('raw Map.get', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(raw.get(KEYS[i % KEYS.length]));
        })
    );
});

test('remove — 1,000 delete operations on a fresh pre-fill', async ({ bench }) => {
    await bench.compare(
        bench(benchName('MultiValueMap.remove', BATCH), { beforeEach: resetPrefilled }, () => {
            for (let i = 0; i < BATCH; i++) {
                const key = KEYS[i % KEYS.length];
                retain(multi.remove(key, i % 10));
            }
            retain(multi.size);
        }),
        bench(benchName('raw Map remove (indexOf + splice)', BATCH), { beforeEach: resetPrefilled }, () => {
            for (let i = 0; i < BATCH; i++) {
                const key = KEYS[i % KEYS.length];
                const values = raw.get(key);
                if (values) {
                    const index = values.indexOf(i % 10);
                    if (index !== -1) values.splice(index, 1);
                }
            }
            retain(raw.size);
        })
    );
});
