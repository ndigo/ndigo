import { describe, test, expect } from 'vitest';
import { stringComparator } from '../src/comparable';

describe('stringComparator', () => {
    test('it should make case-sensitive string comparisons', () => {
        expect(stringComparator.compare('a', 'b')).toBe(-1);
        expect(stringComparator.compare('a', 'a')).toBe(0);
        expect(stringComparator.compare('b', 'a')).toBe(1);
        expect(stringComparator.compare('b', 'B')).toBe(1);
    });

    test('it should make case-insensitive string comparisons', () => {
        expect(stringComparator.compareIgnoreCase('a', 'b')).toBe(-1);
        expect(stringComparator.compareIgnoreCase('a', 'a')).toBe(0);
        expect(stringComparator.compareIgnoreCase('b', 'a')).toBe(1);
        expect(stringComparator.compareIgnoreCase('b', 'B')).toBe(0);
    });
});
