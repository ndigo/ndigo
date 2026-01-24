import { describe, test, expect } from 'vitest';
import { getIterator, likeIterable, rangeIterator, IndexedIterator } from '../src/iterable';

// Helper to convert iterator to array
const iteratorToArray = <T>(iterator: Iterator<T>): T[] => {
    const result: T[] = [];
    let item = iterator.next();
    while (!item.done) {
        result.push(item.value);
        item = iterator.next();
    }
    return result;
};

describe('getIterator', () => {
    test('it should get iterators for iterables', () => {
        const iterator = getIterator([1, 2, 3]);
        expect(iteratorToArray(iterator)).toEqual([1, 2, 3]);
    });

    test('it should get iterators for array-likes', () => {
        const iterator = getIterator({ 0: 1, 1: 2, 2: 3, length: 3 });
        expect(iterator).toBeInstanceOf(IndexedIterator);
        expect(iteratorToArray(iterator)).toEqual([1, 2, 3]);
    });

    test('it should throw an error for non-iterable values', () => {
        expect(() => getIterator({})).toThrow(Error);
    });
});

describe('likeIterable', () => {
    test('it should identify iterables', () => {
        expect(likeIterable('abc')).toBe(true);
        expect(likeIterable([1, 2, 3])).toBe(true);
    });
});

describe('rangeIterator', () => {
    test('it should iterate from 0 to end with single argument', () => {
        expect(iteratorToArray(rangeIterator(5))).toEqual([0, 1, 2, 3, 4]);
    });

    test('it should iterate from start to end with two arguments', () => {
        expect(iteratorToArray(rangeIterator(2, 5))).toEqual([2, 3, 4]);
    });

    test('it should iterate in steps with three arguments', () => {
        expect(iteratorToArray(rangeIterator(2, 7, 2))).toEqual([2, 4, 6]);
    });

    test('it should iterate backwards if the step is negative', () => {
        expect(iteratorToArray(rangeIterator(7, 2, -2))).toEqual([7, 5, 3]);
    });

    test('it should be empty if start is at least end and step is positive', () => {
        expect(iteratorToArray(rangeIterator(2, 2))).toEqual([]);
        expect(iteratorToArray(rangeIterator(3, 2))).toEqual([]);
    });

    test('it should be empty if start is at most end and step is negative', () => {
        expect(iteratorToArray(rangeIterator(2, 2, -1))).toEqual([]);
        expect(iteratorToArray(rangeIterator(2, 3, -1))).toEqual([]);
    });

    test('it should throw if step is 0', () => {
        expect(() => rangeIterator(1, 5, 0)).toThrow(/0/);
    });
});
