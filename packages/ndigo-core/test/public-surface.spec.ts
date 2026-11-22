/**
 */
import { describe, it, expect } from 'vitest';
import {
    likeComparable,
    likeComparator,
    likeSerializable,
    likeConstructable,
    likePropertyValues,
    matchAny,
    matchNot,
    matchAll,
    WildcardConverter,
    SpecificityComparator,
    naturalComparison,
    MutablePropertyValues,
    MediaType,
    parseMediaType,
    Comparable,
} from '../src/index';

describe('public surface: guards and combinators', () => {
    it('likeComparable identifies Comparable values', () => {
        const comparable: Comparable<string> = { compareTo: (v: string) => 0 };
        expect(likeComparable(comparable)).toBe(true);
        expect(likeComparable({})).toBe(false);
        expect(likeComparable(null)).toBe(false);
    });

    it('likeComparator identifies Comparator values', () => {
        expect(likeComparator({ compare: (a: unknown, b: unknown) => 0 })).toBe(true);
        expect(likeComparator({})).toBe(false);
    });

    it('likeSerializable accepts JSON values and toJSON/toString providers', () => {
        expect(likeSerializable(42)).toBe(true);
        expect(likeSerializable('x')).toBe(true);
        expect(likeSerializable({ toJSON: () => 'x' })).toBe(true);
        expect(likeSerializable({ toString: () => 'x' })).toBe(true);
        expect(likeSerializable(undefined)).toBe(false);
    });

    it('likeConstructable identifies constructors', () => {
        class Foo {}
        expect(likeConstructable(Foo)).toBe(true);
        expect(likeConstructable(() => {})).toBe(false);
        expect(likeConstructable(42)).toBe(false);
    });

    it('likePropertyValues identifies PropertyValues collections', () => {
        const values = new MutablePropertyValues();
        expect(likePropertyValues(values)).toBe(true);
        expect(likePropertyValues({})).toBe(false);
    });

    it('matchAny matches when at least one matcher matches', () => {
        const a = { matches: (v: number) => v > 0 };
        const b = { matches: (v: number) => v < 0 };
        const any = matchAny(a, b);
        expect(any.matches(5)).toBe(true);
        expect(any.matches(-3)).toBe(true);
        expect(any.matches(0)).toBe(false);
    });

    it('matchNot inverts a matcher', () => {
        const m = { matches: (v: number) => v > 0 };
        const not = matchNot(m);
        expect(not.matches(5)).toBe(false);
        expect(not.matches(-1)).toBe(true);
    });

    it('matchAll matches when every matcher matches', () => {
        const a = { matches: (v: number) => v > 0 };
        const b = { matches: (v: number) => v < 10 };
        const all = matchAll(a, b);
        expect(all.matches(5)).toBe(true);
        expect(all.matches(15)).toBe(false);
    });

    it('WildcardConverter converts wildcard patterns to regex sources', () => {
        const converter = new WildcardConverter();
        expect(converter.convert('foo*bar')).toBe('^foo.*?bar$');
        expect(converter.convert('*')).toBe('^.*?$');
    });

    it('SpecificityComparator orders media types by specificity', () => {
        const comparator = new SpecificityComparator<MediaType>();
        const a = parseMediaType('text/plain');
        const b = parseMediaType('*/*');
        // more specific (text/plain) sorts before wildcard (*/*)
        expect(comparator.compare(a, b)).toBeLessThanOrEqual(0);
    });

    it('naturalComparison orders by the less-than operator', () => {
        expect(naturalComparison(1, 2)).toBeLessThan(0);
        expect(naturalComparison(2, 1)).toBeGreaterThan(0);
        expect(naturalComparison(3, 3)).toBe(0);
    });
});
