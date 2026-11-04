/**
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    chainComparisons,
    comparableComparison,
    compareBy,
    invertComparison,
    numberComparator,
    stringComparator,
    type Comparable,
} from '../src/comparable';

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

describe('comparison adapters', () => {
    const records = [
        { name: 'Zulu', rank: 1 },
        { name: 'Alpha', rank: 2 },
        { name: 'Beta', rank: 1 },
        { name: 'Beta again', rank: 1 },
    ];

    test('sorts records by a selected key while retaining tied input order', () => {
        const byRank = compareBy((value: (typeof records)[number]) => value.rank, numberComparator.compare);
        expect([...records].sort(byRank).map((value) => value.name)).toEqual(['Zulu', 'Beta', 'Beta again', 'Alpha']);
    });

    test('applies tie breakers in order and reverses the complete ordering', () => {
        const compare = chainComparisons(
            compareBy((value: (typeof records)[number]) => value.rank, numberComparator.compare),
            compareBy((value: (typeof records)[number]) => value.name, stringComparator.compare)
        );
        expect([...records].sort(compare).map((value) => value.name)).toEqual(['Beta', 'Beta again', 'Zulu', 'Alpha']);
        expect([...records].sort(invertComparison(compare)).map((value) => value.name)).toEqual([
            'Alpha',
            'Zulu',
            'Beta again',
            'Beta',
        ]);
    });

    test('retains input order when every comparison ties or no comparisons are provided', () => {
        const ties = chainComparisons(
            compareBy((value: (typeof records)[number]) => value.rank % 1, numberComparator.compare),
            compareBy((value: (typeof records)[number]) => value.name.length % 1, numberComparator.compare)
        );
        expect([...records].sort(ties)).toEqual(records);
        expect([...records].sort(chainComparisons())).toEqual(records);
    });

    test('sorts Comparable values by hidden state rather than their public labels', () => {
        class Ranked implements Comparable<Ranked> {
            readonly #rank: number;

            constructor(
                readonly label: string,
                rank: number
            ) {
                this.#rank = rank;
            }

            compareTo(other: Ranked): number {
                return this.#rank - other.#rank;
            }
        }
        const values = [new Ranked('Alpha', 30), new Ranked('Zulu', 10), new Ranked('Beta', 20)];
        expect(values.sort(comparableComparison).map((value) => value.label)).toEqual(['Zulu', 'Beta', 'Alpha']);
    });
});
