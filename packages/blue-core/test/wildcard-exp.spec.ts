/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import WildcardExp from '../src/wildcard-exp';

describe('WildcardExp', () => {
    test('it should test using wildcards', () => {
        const wce = new WildcardExp('a*b');
        expect(wce.test('abb')).toBe(true);
    });

    test('it should default to *', () => {
        const wce = new WildcardExp();
        expect(wce.test('abb')).toBe(true);
    });
});
