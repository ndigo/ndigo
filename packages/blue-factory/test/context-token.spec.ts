/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { ContextToken, isContextToken } from '../src/context-tokens';

describe('ContextToken', () => {
    test('it should set description', () => {
        const token = new ContextToken<number>('foo');
        expect(token.description).toBe('foo');
    });

    test('it should format toString', () => {
        const token = new ContextToken<number>('foo');
        expect(token.toString()).toBe('ContextToken(foo)');
    });

    test('it should type-check using isContextToken', () => {
        const token = new ContextToken<number>('foo');
        expect(isContextToken(token)).toBe(true);
        expect(isContextToken({ description: 'foo' })).toBe(false);
        expect(isContextToken('foo')).toBe(false);
        expect(isContextToken(null)).toBe(false);
    });
});
