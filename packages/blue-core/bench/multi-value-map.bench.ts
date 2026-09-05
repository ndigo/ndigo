/**
 *
 * Benchmark suite for MultiValueMap.
 * Compares against a raw Map<K,V[]> baseline.
 *
 * Scenarios:
 *   1. add – insert throughput
 *   2. get – read throughput (pre-filled)
 *   3. remove – delete single value throughput
 */
import { bench, describe } from 'vitest';
import { MultiValueMap } from '../src/multi-value-map';

const keys = Array.from({ length: 10 }, (_, i) => `key-${i}`);
let _sink: any = 0;

// Pre-fill for scenarios 2 and 3
const prefillValues = Array.from({ length: 100 }, (_, i) => i);
const prefillMap = new Map<string, number[]>();
for (let i = 0; i < 100; i++) {
    const key = keys[i % 10];
    if (!prefillMap.has(key)) {
        prefillMap.set(key, []);
    }
    prefillMap.get(key)!.push(i);
}

describe('add – insert 1000 values across 10 keys', () => {
    bench('MultiValueMap.add', () => {
        const mvm = new MultiValueMap<string, number>();
        for (let i = 0; i < 1000; i++) {
            mvm.add(keys[i % 10], i);
        }
        _sink = mvm.size;
    });

    bench('raw Map (get ?? [] + push + set)', () => {
        const rawMap = new Map<string, number[]>();
        for (let i = 0; i < 1000; i++) {
            const vals = rawMap.get(keys[i % 10]) ?? [];
            vals.push(i);
            rawMap.set(keys[i % 10], vals);
        }
        _sink = rawMap.size;
    });
});

describe('get – read 1000 times across 10 keys (pre-filled)', () => {
    bench('MultiValueMap.get', () => {
        const mvm = new MultiValueMap<string, number>();
        for (const val of prefillValues) {
            mvm.add(keys[val % 10], val);
        }
        for (let i = 0; i < 1000; i++) {
            _sink = mvm.get(keys[i % 10]);
        }
    });

    bench('raw Map.get', () => {
        const rawMap = new Map<string, number[]>();
        for (const val of prefillValues) {
            const vals = rawMap.get(keys[val % 10]) ?? [];
            vals.push(val);
            rawMap.set(keys[val % 10], vals);
        }
        for (let i = 0; i < 1000; i++) {
            _sink = rawMap.get(keys[i % 10]);
        }
    });
});

describe('remove – delete single value (1000 ops, re-adding)', () => {
    bench('MultiValueMap.remove', () => {
        const mvm = new MultiValueMap<string, number>();
        for (let i = 0; i < 1000; i++) {
            mvm.add(keys[i % 10], i);
            mvm.remove(keys[i % 10], i);
        }
        _sink = mvm.size;
    });

    bench('raw Map (indexOf + splice)', () => {
        const rawMap = new Map<string, number[]>();
        for (let i = 0; i < 1000; i++) {
            const vals = rawMap.get(keys[i % 10]) ?? [];
            vals.push(i);
            rawMap.set(keys[i % 10], vals);
            const idx = vals.indexOf(i);
            if (idx !== -1) vals.splice(idx, 1);
        }
        _sink = rawMap.size;
    });
});
