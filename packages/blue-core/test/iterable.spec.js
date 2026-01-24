const { expect, use } = require('chai');
const chai_iterator = require('chai-iterator');
import { getIterator, likeIterable, rangeIterator, IndexedIterator } from '../src/iterable';

use(chai_iterator);

describe('getIterator', function () {
    test('it should get iterators for iterables', function () {
        expect(getIterator([1, 2, 3])).to.iterate.over([1, 2, 3]);
    });

    test('it should get iterators for array-likes', function () {
        const iterator = getIterator({ 0: 1, 1: 2, 2: 3, length: 3 });
        expect(iterator).toBeInstanceOf(IndexedIterator);
        expect(iterator).to.iterate.over([1, 2, 3]);
    });

    test('it should throw an error for non-iterable values', function () {
        expect(() => getIterator({})).toThrow(Error);
    });
});

describe('likeIterable', function () {
    test('it should identify iterables', function () {
        expect(likeIterable('abc')).toBe(true);
        expect(likeIterable([1, 2, 3])).toBe(true);
    });
});

describe('rangeIterator', function () {
    test('it should iterate from 0 to end with single argument', function () {
        expect(rangeIterator(5)).to.iterate.over([0, 1, 2, 3, 4]);
    });

    test('it should iterate from start to end with two arguments', function () {
        expect(rangeIterator(2, 5)).to.iterate.over([2, 3, 4]);
    });

    test('it should iterate in steps with three arguments', function () {
        expect(rangeIterator(2, 7, 2)).to.iterate.over([2, 4, 6]);
    });

    test('it should iterate backwards if the step is negative', function () {
        expect(rangeIterator(7, 2, -2)).to.iterate.over([7, 5, 3]);
    });

    test('it should be empty if start is at least end and step is positive', function () {
        expect(rangeIterator(2, 2)).to.iterate.over([]);
        expect(rangeIterator(3, 2)).to.iterate.over([]);
    });

    test('it should be empty if start is at most end and step is negative', function () {
        expect(rangeIterator(2, 2, -1)).to.iterate.over([]);
        expect(rangeIterator(2, 3, -1)).to.iterate.over([]);
    });

    test('it should throw if step is 0', function () {
        expect(() => rangeIterator(1, 5, 0)).toThrow(/0/);
    });
});
