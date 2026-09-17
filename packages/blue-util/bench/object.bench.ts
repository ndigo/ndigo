import { bench, describe } from 'vitest';

type UnknownRecord = Record<string, unknown>;

const propInputs: UnknownRecord[] = [
    { name: 'alpha', value: 1 },
    { id: 2, value: 2 },
    { name: 'gamma', value: 3 },
    { id: 4, value: 4 },
];
const keysInputs: UnknownRecord[] = [{ a: 1, b: 2, c: 3 }, { one: 1 }, { x: 1, y: 2 }, {}];
const pathInputs: UnknownRecord[] = [{ a: { b: { c: 1 } } }, { a: { b: {} } }, { a: {} }, {}, { a: { b: { c: 5 } } }];
const propSatisfiesInputs: UnknownRecord[] = [
    { name: 'albert' },
    { name: 'zoe' },
    { id: 'missing' },
    { name: 'amelia' },
];
const equalityPairs: Array<[unknown, unknown]> = [
    [
        { a: 1, b: [1, 2] },
        { a: 1, b: [1, 2] },
    ],
    [
        { a: 1, b: [1, 3] },
        { a: 1, b: [1, 2] },
    ],
    [42, 42],
    [42, 43],
    [{ nested: { x: { y: 'z' } } }, { nested: { x: { y: 'z' } } }],
    [{ nested: { x: { y: 'z' } } }, { nested: { x: { y: 'w' } } }],
];

const nativeNameProp = (value: UnknownRecord): unknown => value.name;
const startsWithA = (value: unknown): boolean => typeof value === 'string' && value.startsWith('a');

let _objectSink = 0;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isDeepEqual = (left: unknown, right: unknown): boolean => {
    if (Object.is(left, right)) {
        return true;
    }

    if (!isObjectRecord(left) || !isObjectRecord(right)) {
        return false;
    }

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    for (let i = 0; i < leftKeys.length; i += 1) {
        const key = leftKeys[i];

        if (!Object.hasOwn(right, key)) {
            return false;
        }

        if (!isDeepEqual(left[key], right[key])) {
            return false;
        }
    }

    return true;
};

describe('obj.name', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = propInputs[i % propInputs.length];
            const result = value.name;
            accumulator += typeof result === 'string' ? result.length : 0;
        }

        _objectSink = accumulator;
    });
});

describe('(obj) => obj.name', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = propInputs[i % propInputs.length];
            const result = nativeNameProp(value);
            accumulator += typeof result === 'string' ? result.length : 0;
        }

        _objectSink = accumulator;
    });
});

describe('Object.keys(obj)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = keysInputs[i % keysInputs.length];
            accumulator += Object.keys(value).length;
        }

        _objectSink = accumulator;
    });
});

describe('obj?.a?.b?.c', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = pathInputs[i % pathInputs.length] as {
                a?: { b?: { c?: unknown } };
            };
            const result = value?.a?.b?.c;
            accumulator += typeof result === 'number' ? result : 0;
        }

        _objectSink = accumulator;
    });
});

describe('pred(obj.name)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = propSatisfiesInputs[i % propSatisfiesInputs.length];
            accumulator += startsWithA(value.name) ? 1 : 0;
        }

        _objectSink = accumulator;
    });
});

describe('JSON.stringify(a) === JSON.stringify(b)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const [left, right] = equalityPairs[i % equalityPairs.length];
            accumulator += JSON.stringify(left) === JSON.stringify(right) ? 1 : 0;
        }

        _objectSink = accumulator;
    });
});

describe('manual deep equal', () => {
    bench('manual', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const [left, right] = equalityPairs[i % equalityPairs.length];
            accumulator += isDeepEqual(left, right) ? 1 : 0;
        }

        _objectSink = accumulator;
    });
});
