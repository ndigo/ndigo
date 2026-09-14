/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { HTTPHeader } from '../src/http-header';

describe('HTTPHeader', () => {
    const pragma = new HTTPHeader('Pragma');

    test('it should create instances', () => {
        expect(pragma).toHaveProperty('name', 'Pragma');
        expect(pragma.toString()).toBe('Pragma');
        expect(String(pragma)).toBe('Pragma');
        expect(pragma.toJSON()).toBe('Pragma');

        pragma.delete();
        pragma.get();
        expect(() => pragma.set()).toThrow(TypeError);
        expect(pragma.has()).toBe(false);

        expect(Object.prototype.toString.call(pragma)).toBe('[object HTTPHeader:Pragma]');
    });

    test('it should work with headers', () => {
        const headers = new Headers();

        expect(pragma.has(headers)).toBe(false);

        pragma.set(headers, 'no-cache');

        expect(pragma.has(headers)).toBe(true);
        expect(headers.has('Pragma')).toBe(true);
        expect(headers.get('Pragma')).toBe('no-cache');
        expect(pragma.get(headers)).toBe('no-cache');

        pragma.delete(headers);

        expect(pragma.has(headers)).toBe(false);
        expect(headers.has('Pragma')).toBe(false);
    });

    test('it should work with matrices', () => {
        const headers: Array<[string, string]> = [];

        expect(pragma.has(headers)).toBe(false);
        expect(pragma.get(headers)).toBeNull();

        pragma.set(headers, 'no-cache');

        expect(pragma.has(headers)).toBe(true);
        expect(pragma.get(headers)).toBe('no-cache');

        pragma.set(headers, 'yes-cache');

        expect(pragma.has(headers)).toBe(true);
        expect(pragma.get(headers)).toBe('yes-cache');

        pragma.delete(headers);

        expect(pragma.has(headers)).toBe(false);
    });

    test('it should work with records', () => {
        const headers: Record<string, string> = {};

        expect(pragma.has(headers)).toBe(false);

        pragma.set(headers, 'no-cache');

        expect(pragma.has(headers)).toBe(true);
        expect(pragma.get(headers)).toBe('no-cache');

        pragma.delete(headers);

        expect(pragma.has(headers)).toBe(false);
    });
});
