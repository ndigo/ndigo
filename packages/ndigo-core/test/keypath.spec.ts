/**
 */
import { describe, it, expect } from 'vitest';
import { getPath, setPath } from '../src/keypath';
import { KeypathConverter } from '../src/keypath-converter';

describe('getPath', () => {
    it('reads a nested value', () => {
        const obj = { a: { b: { c: 42 } } };
        expect(getPath(['a', 'b', 'c'], obj)).toBe(42);
    });

    it('reads an array index', () => {
        const obj = { items: ['x', 'y', 'z'] };
        expect(getPath(['items', 0], obj)).toBe('x');
        expect(getPath(['items', 2], obj)).toBe('z');
    });

    it('returns undefined for a missing path', () => {
        const obj = { a: { b: 1 } };
        expect(getPath(['a', 'missing'], obj)).toBeUndefined();
        expect(getPath(['nope'], obj)).toBeUndefined();
    });

    it('returns undefined when the walk leaves the object graph', () => {
        const obj = { a: 5 };
        expect(getPath(['a', 'b'], obj)).toBeUndefined();
    });

    it('returns the root for an empty token list', () => {
        const obj = { a: 1 };
        expect(getPath([], obj)).toBe(obj);
    });

    it('works with KeypathConverter output', () => {
        const converter = new KeypathConverter();
        const obj = { items: [{ title: 'first' }] };
        const tokens = converter.convert('items[0].title');
        expect(tokens).not.toBeNull();
        expect(getPath(tokens as ['items', number, 'title'], obj)).toBe('first');
    });
});

describe('setPath', () => {
    it('sets a nested value on a plain object (immutable)', () => {
        const obj = { a: { b: 1 } };
        const next = setPath(['a', 'b'], 2, obj);
        expect(next).toEqual({ a: { b: 2 } });
        expect(next).not.toBe(obj);
        expect(obj).toEqual({ a: { b: 1 } }); // original untouched
    });

    it('creates intermediate objects', () => {
        const obj = {};
        const next = setPath(['a', 'b', 'c'], 7, obj) as { a: { b: { c: number } } };
        expect(next).toEqual({ a: { b: { c: 7 } } });
    });

    it('creates an array when the next token is numeric', () => {
        const obj = {};
        const next = setPath(['items', 0, 'title'], 'first', obj);
        expect(next).toEqual({ items: [{ title: 'first' }] });
    });

    it('sets an array index', () => {
        const obj = { items: ['a', 'b'] };
        const next = setPath(['items', 1], 'B', obj);
        expect(next).toEqual({ items: ['a', 'B'] });
    });

    it('preserves a class instance prototype (mutates in place)', () => {
        class Form {
            email = '';
            address = { street: '' };
        }
        const instance = new Form();
        const result = setPath(['email'], 'a@b.c', instance);
        expect(result).toBe(instance);
        expect(instance.email).toBe('a@b.c');
        expect(instance).toBeInstanceOf(Form);
    });

    it('returns the value for an empty token list', () => {
        const obj = { a: 1 };
        expect(setPath([], 99, obj)).toBe(99);
    });

    it('spreads a null-prototype root into a plain object (existing setPath semantics)', () => {
        const obj = Object.create(null) as Record<string, unknown>;
        obj.a = 1;
        const next = setPath(['a'], 2, obj) as Record<string, unknown>;
        expect(next.a).toBe(2);
        // Spread semantics flatten the null prototype to Object.prototype.
        expect(Object.getPrototypeOf(next)).toBe(Object.prototype);
        expect(obj.a).toBe(1);
    });

    it('round-trips with getPath', () => {
        const obj = {};
        const next = setPath(['x', 'y'], 'v', obj);
        expect(getPath(['x', 'y'], next)).toBe('v');
    });
});
