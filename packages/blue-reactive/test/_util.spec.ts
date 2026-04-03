import { describe, expect, it } from 'vitest';

import { getByPath, setByPath } from '../src/_util';

describe('getByPath', () => {
    it('reads values at simple and nested paths', () => {
        const value = { name: 'Alice', address: { city: 'NYC' } };

        expect(getByPath(value, 'name')).toBe('Alice');
        expect(getByPath(value, 'address.city')).toBe('NYC');
    });

    it('returns undefined for missing paths', () => {
        const value = { name: 'Alice' };

        expect(getByPath(value, 'address.city')).toBeUndefined();
    });

    it('returns undefined when the root is null or undefined', () => {
        expect(getByPath(null, 'name')).toBeUndefined();
        expect(getByPath(undefined, 'name')).toBeUndefined();
    });
});

describe('setByPath', () => {
    it('sets a simple property without mutating the original', () => {
        const value = { name: 'Alice' };
        const updated = setByPath(value, 'name', 'Bob');

        expect(updated).toEqual({ name: 'Bob' });
        expect(updated).not.toBe(value);
        expect(value).toEqual({ name: 'Alice' });
    });

    it('sets nested properties by creating intermediate objects', () => {
        const value = { name: 'Alice' };
        const updated = setByPath(value, 'address.city', 'Paris');

        expect(updated).toEqual({ name: 'Alice', address: { city: 'Paris' } });
        expect(value).toEqual({ name: 'Alice' });
    });
});
