/**
 */
import { describe, test, expect } from 'vitest';
import { WildcardExp } from '../src/wildcard-exp';

describe('WildcardExp', () => {
    test('it should test using wildcards', () => {
        const wce = new WildcardExp('a*b');
        expect(wce.test('abb')).toBe(true);
    });

    test('it should default to *', () => {
        const wce = new WildcardExp();
        expect(wce.test('abb')).toBe(true);
    });

    test('it should escape regex metacharacters (KRN-REV-WILD-09)', () => {
        expect(new WildcardExp('a.b').test('a.b')).toBe(true);
        expect(new WildcardExp('a.b').test('axb')).toBe(false);
        expect(new WildcardExp('a+b').test('a+b')).toBe(true);
        expect(new WildcardExp('a+b').test('aab')).toBe(false);
        expect(new WildcardExp('[x]').test('[x]')).toBe(true);
        expect(new WildcardExp('[x]').test('x')).toBe(false);
        expect(new WildcardExp('a?b').test('a?b')).toBe(true);
        expect(new WildcardExp('a?b').test('ab')).toBe(false);
    });
});
