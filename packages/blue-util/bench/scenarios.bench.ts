/** @author Jeff Rose */

import { bench, describe } from 'vitest';

let _benchmarkSink = 0;

describe('Scenario 1: EntriesIterator dispatch', () => {
    const nativeDispatch = (obj: any) => {
        if (typeof obj.entries === 'function') {
            return obj.entries();
        }
        return Object.entries(obj)[Symbol.iterator]();
    };

    const samples = [
        new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]),
        { alpha: 1, beta: 2, gamma: 3 },
        [10, 20, 30, 40],
    ];

    bench('native: typeof entries dispatch', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const sample = samples[i % samples.length] as any;
            const iterator = nativeDispatch(sample) as IterableIterator<[unknown, unknown]>;
            const next = iterator.next();
            total += next.done ? 0 : 1;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 2: parseData type dispatch', () => {
    const parseData_N = (value: unknown) => {
        if (value instanceof Blob) {
            return value;
        }
        if (value instanceof ArrayBuffer) {
            return value;
        }
        if (value instanceof FormData) {
            return value;
        }
        if (typeof value === 'string') {
            return value;
        }
        if (value instanceof URLSearchParams) {
            return value;
        }
        if (value instanceof ReadableStream) {
            return value;
        }
        return JSON.stringify(value);
    };

    const commonInputs = ['{"payload":"ok"}', { id: 42, active: true, tags: ['blue', 'js'] }];

    bench('native: if/instanceof parseData (string + object common paths)', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const value = commonInputs[i % commonInputs.length];
            const parsed = parseData_N(value);
            total += typeof parsed === 'string' ? parsed.length : 1;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 3: MatrixString encode pipeline', () => {
    const toMatrixString_N = (object: Record<string, unknown> | null | undefined) => {
        if (!object) {
            return '';
        }

        const keys = Object.keys(object).sort();
        const parts: string[] = [];

        for (const key of keys) {
            const value = object[key];
            if (value === undefined) {
                continue;
            }

            if (value === null) {
                parts.push(encodeURIComponent(key));
            } else if (Array.isArray(value)) {
                const encoded = value
                    .filter((v) => v !== undefined)
                    .map((v) => encodeURIComponent(String(v)))
                    .join(',');
                parts.push(`${encodeURIComponent(key)}=${encoded}`);
            } else {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }

        return parts.join(';');
    };

    const matrixObject = {
        color: 'blue',
        size: 'large',
        tags: ['a', 'b', 'c'],
        empty: null,
        missing: undefined,
    };

    bench('native: matrix-string imperative encode', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += toMatrixString_N(matrixObject).length;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 4: isDense array check', () => {
    const isDense_N = (arr: unknown[]) => !arr.includes(undefined) && arr.length === Object.keys(arr).length;

    const isDense_N2 = (arr: unknown[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (!(i in arr)) {
                return false;
            }
        }
        return true;
    };

    const dense10 = Array.from({ length: 10 }, (_, i) => i + 1);
    const dense100 = Array.from({ length: 100 }, (_, i) => i + 1);
    const dense1000 = Array.from({ length: 1000 }, (_, i) => i + 1);
    const sparse10 = [1, , 3, 4, 5, 6, 7, 8, 9, 10] as unknown[];
    const sparse100 = new Array(100);
    sparse100[0] = 1;
    sparse100[50] = 2;
    sparse100[99] = 3;
    const sparse1000 = new Array(1000);
    sparse1000[0] = 1;
    sparse1000[500] = 2;
    sparse1000[999] = 3;

    const samples = [dense10, dense100, dense1000, sparse10, sparse100, sparse1000];

    bench('native: !includes(undefined) && length === Object.keys(arr).length', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isDense_N(samples[i % samples.length]) ? 1 : 0;
        }
        _benchmarkSink += total;
    });

    bench('native: indexed hole check loop', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isDense_N2(samples[i % samples.length]) ? 1 : 0;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 5: Predicate combinator', () => {
    const isPositiveNumber_N = (value: unknown) =>
        typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0;

    const values = [1, 0, 42, -1, -100, NaN, Infinity, '10', null, { value: 3 }];

    bench('native: typeof/NaN/finite/range predicate', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isPositiveNumber_N(values[i % values.length]) ? 1 : 0;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 6: Predicate-based guard', () => {
    const resolveWithDefault_N = <T>(value: T | null | undefined, fallback: T) => value ?? fallback;

    const fallback = 'fallback';
    const inputs = [null, undefined, 0, '', false, 'actual', NaN];

    bench('native: value ?? fallback', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const value = inputs[i % inputs.length] as any;
            const resolved = resolveWithDefault_N(value, fallback as any);
            total += String(resolved).length;
        }
        _benchmarkSink += total;
    });
});
