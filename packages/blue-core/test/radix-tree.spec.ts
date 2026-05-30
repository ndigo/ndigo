import { describe, test, expect } from 'vitest';
import { RadixTree } from '../src/radix-tree';

describe('RadixTree', () => {
    let tree: RadixTree<string>;

    beforeEach(() => {
        tree = new RadixTree();
    });

    test('static route hit', () => {
        tree.insert('/users', 'handler-users');
        const result = tree.lookup('/users');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('handler-users');
        expect(result?.params).toBeNull();
        expect(result?.pattern).toBe('/users');
    });

    test('static route miss', () => {
        tree.insert('/users', 'handler-users');
        const result = tree.lookup('/nope');
        expect(result).toBeNull();
    });

    test('intermediate path miss (no value on intermediate node)', () => {
        tree.insert('/users/list', 'handler');
        const result = tree.lookup('/users');
        expect(result).toBeNull();
    });

    test('param route extracts named params', () => {
        tree.insert('/users/:id', 'handler');
        const result = tree.lookup('/users/42');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('handler');
        expect(result?.params).toEqual({ id: '42' });
        expect(result?.pattern).toBe('/users/:id');
    });

    test('param route with {param} syntax extracts named params', () => {
        tree.insert('/users/{id}', 'handler');
        const result = tree.lookup('/users/99');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('handler');
        expect(result?.params).toEqual({ id: '99' });
        expect(result?.pattern).toBe('/users/{id}');
    });

    test('wildcard route matches any single segment, params is null', () => {
        tree.insert('/api/*', 'handler');
        const result = tree.lookup('/api/anything');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('handler');
        expect(result?.params).toBeNull();
        expect(result?.pattern).toBe('/api/*');
    });

    test('static beats param (priority)', () => {
        tree.insert('/users/:id', 'param-handler');
        tree.insert('/users/list', 'static-handler');
        
        let result = tree.lookup('/users/list');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('static-handler');
        
        result = tree.lookup('/users/42');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('param-handler');
        expect(result?.params).toEqual({ id: '42' });
    });

    test('param beats wildcard (priority)', () => {
        tree.insert('/files/*', 'wildcard-handler');
        tree.insert('/files/:name', 'param-handler');
        
        const result = tree.lookup('/files/report.pdf');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('param-handler');
        expect(result?.params).toEqual({ name: 'report.pdf' });
    });

    test('deep nested route with multiple params', () => {
        tree.insert('/api/v1/users/:id/profile', 'handler');
        const result = tree.lookup('/api/v1/users/42/profile');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('handler');
        expect(result?.params).toEqual({ id: '42' });
        expect(result?.pattern).toBe('/api/v1/users/:id/profile');
    });

    test('multiple routes in same tree do not interfere', () => {
        tree.insert('/users', 'a');
        tree.insert('/users/:id', 'b');
        tree.insert('/api/*', 'c');
        
        let result = tree.lookup('/users');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('a');
        
        result = tree.lookup('/users/5');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('b');
        expect(result?.params).toEqual({ id: '5' });
        
        result = tree.lookup('/api/v2');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('c');
        
        result = tree.lookup('/other');
        expect(result).toBeNull();
    });

    test('delete removes a route', () => {
        tree.insert('/users', 'handler');
        let result = tree.lookup('/users');
        expect(result).not.toBeNull();
        
        const deleted = tree.delete('/users');
        expect(deleted).toBe(true);
        
        result = tree.lookup('/users');
        expect(result).toBeNull();
    });

    test('second insert on same pattern replaces value', () => {
        tree.insert('/users', 'first');
        tree.insert('/users', 'second');
        
        const result = tree.lookup('/users');
        expect(result).not.toBeNull();
        expect(result?.value).toBe('second');
    });
});