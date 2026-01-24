import { stringComparator } from '../src/comparable';

describe('stringComparator', function () {
    test('it should make case-sensitive string comparisons', function () {
        expect(stringComparator.compare('a', 'b')).toBe(-1);
        expect(stringComparator.compare('a', 'a')).toBe(0);
        expect(stringComparator.compare('b', 'a')).toBe(1);
        expect(stringComparator.compare('b', 'B')).toBe(1);
    });

    test('it should make case-insensitive string comparisons', function () {
        expect(stringComparator.compareIgnoreCase('a', 'b')).toBe(-1);
        expect(stringComparator.compareIgnoreCase('a', 'a')).toBe(0);
        expect(stringComparator.compareIgnoreCase('b', 'a')).toBe(1);
        expect(stringComparator.compareIgnoreCase('b', 'B')).toBe(0);
    });
});
