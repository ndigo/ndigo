/** @author opencode */

import { bench, describe } from 'vitest';

const numberInputs = [10, 1, 0, -1, -10, 42, -42];
const sortInputs = [
    'item-20',
    'item-3',
    'item-100',
    'item-1',
    'item-11',
    'item-2',
    'item-9',
    'item-8',
    'item-50',
    'item-4',
    'item-6',
    'item-7',
    'item-5',
    'item-10',
    'item-12',
    'item-13',
    'item-14',
    'item-15',
    'item-16',
    'item-17',
    'item-18',
    'item-19',
    'item-21',
    'item-22',
    'item-23',
    'item-24',
    'item-25',
    'item-26',
    'item-27',
    'item-28',
    'item-29',
    'item-30',
    'item-31',
    'item-32',
    'item-33',
    'item-34',
    'item-35',
    'item-36',
    'item-37',
    'item-38',
    'item-39',
    'item-40',
    'item-41',
    'item-42',
    'item-43',
    'item-44',
    'item-45',
    'item-46',
    'item-47',
    'item-48',
    'item-49',
    'item-51',
    'item-52',
    'item-53',
    'item-54',
    'item-55',
    'item-56',
    'item-57',
    'item-58',
    'item-59',
    'item-60',
    'item-61',
    'item-62',
    'item-63',
    'item-64',
    'item-65',
    'item-66',
    'item-67',
    'item-68',
    'item-69',
    'item-70',
    'item-71',
    'item-72',
    'item-73',
    'item-74',
    'item-75',
    'item-76',
    'item-77',
    'item-78',
    'item-79',
    'item-80',
    'item-81',
    'item-82',
    'item-83',
    'item-84',
    'item-85',
    'item-86',
    'item-87',
    'item-88',
    'item-89',
    'item-90',
    'item-91',
    'item-92',
    'item-93',
    'item-94',
    'item-95',
    'item-96',
    'item-97',
    'item-98',
    'item-99',
];
const defaultInputs: Array<string | number | null | undefined> = ['value', '', 0, null, undefined, 'blue'];
const primitiveEqualityPairs: Array<[unknown, unknown]> = [
    [1, 1],
    [1, 2],
    ['a', 'a'],
    ['a', 'b'],
    [true, true],
    [true, false],
    [null, null],
    [undefined, undefined],
];

const nativeComparator = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

let _relationSink = 0;

describe('x > 0', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = numberInputs[i % numberInputs.length];
            accumulator += value > 0 ? 1 : 0;
        }

        _relationSink = accumulator;
    });
});

describe('x >= 0', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = numberInputs[i % numberInputs.length];
            accumulator += value >= 0 ? 1 : 0;
        }

        _relationSink = accumulator;
    });
});

describe('x < 0', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = numberInputs[i % numberInputs.length];
            accumulator += value < 0 ? 1 : 0;
        }

        _relationSink = accumulator;
    });
});

describe('ternary comparator vs R.comparator((a, b) => a < b)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const sorted = [...sortInputs].sort(nativeComparator);
            accumulator += sorted[0].length + sorted[sorted.length - 1].length;
        }

        _relationSink = accumulator;
    });
});

describe('value ?? fallback vs R.defaultTo(fallback, value)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = defaultInputs[i % defaultInputs.length];
            const result = value ?? 'fallback';
            accumulator += String(result).length;
        }

        _relationSink = accumulator;
    });
});

describe('=== vs R.equals(a, b) for primitives', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const [left, right] = primitiveEqualityPairs[i % primitiveEqualityPairs.length];
            accumulator += left === right ? 1 : 0;
        }

        _relationSink = accumulator;
    });
});
