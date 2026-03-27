import { describe, expect, test } from 'vitest';
import { ContextToken, likeContextToken } from '../src/context-token';

describe('ContextToken', () => {
    test('it should set description', () => {
        const token = new ContextToken<number>('foo');
        expect(token.description).toBe('foo');
    });

    test('it should format toString', () => {
        const token = new ContextToken<number>('foo');
        expect(token.toString()).toBe('ContextToken(foo)');
    });

    test('it should duck-type using likeContextToken', () => {
        const token = new ContextToken<number>('foo');
        expect(likeContextToken(token)).toBe(true);
        expect(likeContextToken({ description: 'foo' })).toBe(false);
        expect(likeContextToken('foo')).toBe(false);
        expect(likeContextToken(null)).toBe(false);
    });
});
