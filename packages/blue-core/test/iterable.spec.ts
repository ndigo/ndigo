/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { likeIterable } from '../src/iterable';

describe('likeIterable', () => {
    test('it should identify iterables', () => {
        expect(likeIterable('abc')).toBe(true);
        expect(likeIterable([1, 2, 3])).toBe(true);
    });
});
