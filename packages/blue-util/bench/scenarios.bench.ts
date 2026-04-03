/** @author opencode */

import * as R from 'ramda';
import { bench, describe } from 'vitest';

let _benchmarkSink = 0;

describe('Scenario 1: EntriesIterator dispatch', () => {
    const propIs_R =
        <T>(type: new (...args: any[]) => T) =>
        (name: string) =>
        (obj: unknown) =>
            R.is(type, (obj as any)?.[name]);

    const hasFunction_R = propIs_R(Function);
    const hasEntries_R = hasFunction_R('entries');

    const ramdaDispatch = R.cond([
        [hasEntries_R, (obj: any) => obj.entries()],
        [R.T, (obj: Record<string, unknown>) => Object.entries(obj)[Symbol.iterator]()],
    ]);

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

    bench('ramda: cond(hasEntries -> entries, default -> Object.entries iterator)', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const sample = samples[i % samples.length] as any;
            const iterator = ramdaDispatch(sample) as IterableIterator<[unknown, unknown]>;
            const next = iterator.next();
            total += next.done ? 0 : 1;
        }
        _benchmarkSink += total;
    });

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
    const parseData_R = R.cond([
        [R.is(Blob), R.identity],
        [R.is(ArrayBuffer), R.identity],
        [R.is(FormData), R.identity],
        [(x) => typeof x === 'string', R.identity],
        [R.is(URLSearchParams), R.identity],
        [R.is(ReadableStream), R.identity],
        [R.T, JSON.stringify],
    ]);

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

    bench('ramda: cond parseData (string + object common paths)', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const value = commonInputs[i % commonInputs.length];
            const parsed = parseData_R(value);
            total += typeof parsed === 'string' ? parsed.length : 1;
        }
        _benchmarkSink += total;
    });

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
    const alwaysEmptyString_R = R.always('');
    const isNull_R = R.equals(null);
    const isUndefined_R = R.equals(undefined);
    const isDefined_R = R.complement(isUndefined_R);
    const filterUndefined_R = R.filter(isDefined_R);
    const filterEmpty_R = R.filter(R.isNotEmpty);
    const joinOnSemicolon_R = R.join(';');
    const joinOnEqual_R = R.join('=');
    const encode_R = encodeURIComponent;
    const encodeValues_R = R.map(encode_R);
    const joinOnComma_R = R.join(',');
    const encodeList_R = R.pipe(filterUndefined_R, encodeValues_R, joinOnComma_R);
    const naturalComparator_R = R.comparator((a: string, b: string) => a < b);
    const naturalSort_R = R.sort(naturalComparator_R);

    const encodeParam_R = R.curryN(2, (object: Record<string, any>, key: string) =>
        R.cond([
            [isUndefined_R, alwaysEmptyString_R],
            [isNull_R, R.always(encode_R(key))],
            [Array.isArray, (list: unknown[]) => joinOnEqual_R([encode_R(key), encodeList_R(list)])],
            [R.T, (value) => joinOnEqual_R([encode_R(key), encode_R(String(value))] as [string, string])],
        ])(object[key])
    );

    const toMatrixString_R = (object: Record<string, unknown> | null | undefined) => {
        const encodeParams = R.map(encodeParam_R(object as Record<string, unknown>));
        return object
            ? R.pipe(
                  R.keys,
                  naturalSort_R,
                  encodeParams,
                  filterEmpty_R,
                  joinOnSemicolon_R
              )(object as Record<string, unknown>)
            : '';
    };

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

    bench('ramda: matrix-string encode pipeline', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += toMatrixString_R(matrixObject).length;
        }
        _benchmarkSink += total;
    });

    bench('native: matrix-string imperative encode', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += toMatrixString_N(matrixObject).length;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 4: isDense array check', () => {
    const isDense_R = (arr: unknown[]) => R.equals(R.length(R.filter(R.T, arr)), R.length(arr));

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

    bench('ramda: equals(length(filter(T, arr)), length(arr))', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isDense_R(samples[i % samples.length]) ? 1 : 0;
        }
        _benchmarkSink += total;
    });

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
    const isPositiveNumber_R = R.allPass([R.is(Number), R.complement(isNaN), isFinite, R.gte(R.__, 0)]);

    const isPositiveNumber_N = (value: unknown) =>
        typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0;

    const values = [1, 0, 42, -1, -100, NaN, Infinity, '10', null, { value: 3 }];

    bench('ramda: allPass([is(Number), complement(isNaN), isFinite, gte(__, 0)])', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isPositiveNumber_R(values[i % values.length] as any) ? 1 : 0;
        }
        _benchmarkSink += total;
    });

    bench('native: typeof/NaN/finite/range predicate', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += isPositiveNumber_N(values[i % values.length]) ? 1 : 0;
        }
        _benchmarkSink += total;
    });
});

describe('Scenario 6: Predicate-based guard', () => {
    const resolveWithDefault_R = <T>(value: T | null | undefined, fallback: T) => R.defaultTo(fallback, value);

    const resolveWithDefault_N = <T>(value: T | null | undefined, fallback: T) => value ?? fallback;

    const fallback = 'fallback';
    const inputs = [null, undefined, 0, '', false, 'actual', NaN];

    bench('ramda: defaultTo(fallback, value)', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            const value = inputs[i % inputs.length] as any;
            const resolved = resolveWithDefault_R(value, fallback as any);
            total += String(resolved).length;
        }
        _benchmarkSink += total;
    });

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
