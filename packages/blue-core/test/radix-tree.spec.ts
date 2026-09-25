/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
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

    describe('greedy segments (D-1: `{*name}` capture + `**` non-capturing)', () => {
        test('{*name} captures the multi-segment remainder', () => {
            tree.insert('/static/{*file}', 'handler');
            const result = tree.lookup('/static/a/b/c.png');
            expect(result).not.toBeNull();
            expect(result?.value).toBe('handler');
            expect(result?.params).toEqual({ file: 'a/b/c.png' });
            expect(result?.pattern).toBe('/static/{*file}');
        });

        test('{*name} captures a single segment too', () => {
            tree.insert('/static/{*file}', 'handler');
            const result = tree.lookup('/static/logo.png');
            expect(result?.params).toEqual({ file: 'logo.png' });
        });

        test('{*name} captures an empty remainder at the segment boundary', () => {
            tree.insert('/static/{*file}', 'handler');
            expect(tree.lookup('/static')?.params).toEqual({ file: '' });
        });

        test('{*name} strips trailing slashes from the capture', () => {
            tree.insert('/static/{*file}', 'handler');
            expect(tree.lookup('/static/a/b/')?.params).toEqual({ file: 'a/b' });
        });

        test('a bare ** matches the remainder without capturing', () => {
            tree.insert('/**', 'spa-handler');
            const result = tree.lookup('/some/client/route');
            expect(result).not.toBeNull();
            expect(result?.value).toBe('spa-handler');
            expect(result?.params).toBeNull();
        });

        test('a root ** also matches the root path (zero segments)', () => {
            tree.insert('/**', 'spa-handler');
            expect(tree.lookup('/')?.value).toBe('spa-handler');
        });

        test('static beats greedy at the same level; greedy backtracks for the rest', () => {
            tree.insert('/users/list', 'static-handler');
            tree.insert('/users/{*rest}', 'greedy-handler');

            let result = tree.lookup('/users/list');
            expect(result?.value).toBe('static-handler');

            result = tree.lookup('/users/list/items');
            expect(result).not.toBeNull();
            expect(result?.value).toBe('greedy-handler');
            expect(result?.params).toEqual({ rest: 'list/items' });
        });

        test('param beats greedy for one segment; greedy still gets deeper paths', () => {
            tree.insert('/files/:name', 'param-handler');
            tree.insert('/files/{*rest}', 'greedy-handler');

            let result = tree.lookup('/files/report.pdf');
            expect(result?.value).toBe('param-handler');
            expect(result?.params).toEqual({ name: 'report.pdf' });

            result = tree.lookup('/files/a/b');
            expect(result?.value).toBe('greedy-handler');
            expect(result?.params).toEqual({ rest: 'a/b' });
        });

        test('the deepest greedy candidate wins on backtrack', () => {
            tree.insert('/a/{*r1}', 'outer');
            tree.insert('/a/b/{*r2}', 'inner');

            expect(tree.lookup('/a/x')?.params).toEqual({ r1: 'x' });
            expect(tree.lookup('/a/b/x/y')?.params).toEqual({ r2: 'x/y' });
        });

        test('backtracking restores pre-greedy params (id captured above the fallback)', () => {
            tree.insert('/x/:id/{*rest}', 'handler');

            const result = tree.lookup('/x/5/y/z');
            expect(result?.value).toBe('handler');
            expect(result?.params).toEqual({ id: '5', rest: 'y/z' });
        });

        test('a greedy segment must be the last segment of its pattern', () => {
            expect(() => tree.insert('/a/{*x}/b', 'bad')).toThrow(/must be the last segment/);
        });

        test('greedy routes count in toJSON and delete cleanly', () => {
            tree.insert('/**', 'spa');
            tree.insert('/static/{*file}', 'static');
            expect(tree.toJSON()).toHaveProperty('size', 2);

            expect(tree.delete('/static/{*file}')).toBe(true);
            expect(tree.lookup('/static/a/b')).toBeNull();
            expect(tree.lookup('/any/thing')).not.toBeNull();
        });
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

    describe('_splitPath edge cases', () => {
        test('path without leading slash is treated same as with slash', () => {
            tree.insert('/users', 'handler');
            const result = tree.lookup('users'); // no leading slash
            expect(result).not.toBeNull();
            expect(result?.value).toBe('handler');
        });

        test('trailing slash is ignored (empty segment filtered)', () => {
            tree.insert('/users', 'handler');
            const result = tree.lookup('/users/'); // trailing slash
            // The optimized _splitPath ignores empty trailing segments
            expect(result).not.toBeNull();
            expect(result?.value).toBe('handler');
        });

        test('double slashes are treated as single separator', () => {
            tree.insert('/api/users', 'handler');
            const result = tree.lookup('/api//users');
            // empty segment between double slashes is filtered
            expect(result).not.toBeNull();
            expect(result?.value).toBe('handler');
        });
    });

    describe('root path', () => {
        test('insert and lookup root pattern "/"', () => {
            tree.insert('/', 'root-handler');
            const result = tree.lookup('/');
            expect(result).not.toBeNull();
            expect(result?.value).toBe('root-handler');
            expect(result?.params).toBeNull();
            expect(result?.pattern).toBe('/');
        });

        test('root pattern does not match non-root paths', () => {
            tree.insert('/', 'root-handler');
            const result = tree.lookup('/users');
            expect(result).toBeNull();
        });
    });

    describe('delete edge cases', () => {
        test('delete non-existent pattern returns false', () => {
            const deleted = tree.delete('/never/inserted');
            expect(deleted).toBe(false);
        });

        test('delete root pattern', () => {
            tree.insert('/', 'root-handler');
            const deleted = tree.delete('/');
            expect(deleted).toBe(true);
            expect(tree.lookup('/')).toBeNull();
        });

        test('deleting a route does not affect sibling routes', () => {
            tree.insert('/users', 'users-handler');
            tree.insert('/posts', 'posts-handler');
            tree.delete('/users');
            expect(tree.lookup('/users')).toBeNull();
            expect(tree.lookup('/posts')).not.toBeNull();
            expect(tree.lookup('/posts')?.value).toBe('posts-handler');
        });
    });

    describe('toJSON', () => {
        test('returns size 0 for empty tree', () => {
            expect(tree.toJSON()).toHaveProperty('size', 0);
        });

        test('counts only terminal nodes with values', () => {
            tree.insert('/users', 'a');
            tree.insert('/users/:id', 'b');
            tree.insert('/api/*', 'c');
            expect(tree.toJSON()).toHaveProperty('size', 3);
        });

        test('toString tag is correct', () => {
            expect(Object.prototype.toString.call(tree)).toBe('[object RadixTree]');
        });
    });
});
