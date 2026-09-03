/**
 * @author Jeff Rose
 */

import { describe, it, expect } from 'vitest';
import { RouteDefinition } from '../src/route-definition';

describe('RouteDefinition', () => {
    describe('url()', () => {
        it('generates URL for parameterized route', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            expect(def.url({ id: '123' })).toBe('/users/123');
        });

        it('generates URL for route with multiple params', () => {
            const def = new RouteDefinition('/users/{id}/posts/{postId}', {} as never);
            expect(def.url({ id: '123', postId: '456' })).toBe('/users/123/posts/456');
        });

        it('generates URL for root route', () => {
            const def = new RouteDefinition('/', {} as never);
            expect(def.url({} as never)).toBe('/');
        });

        it('generates URL for static route', () => {
            const def = new RouteDefinition('/users', {} as never);
            expect(def.url({} as never)).toBe('/users');
        });
    });

    describe('href()', () => {
        it('generates hash-anchored href', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            expect(def.href({ id: '123' })).toBe('#/users/123');
        });

        it('generates href for root', () => {
            const def = new RouteDefinition('/', {} as never);
            expect(def.href({} as never)).toBe('#/');
        });
    });

    describe('parse()', () => {
        it('parses a matching path', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            const result = def.parse('/users/123');
            expect(result).not.toBeNull();
            expect(result!.path).toBe('users/123');
        });

        it('returns null for non-matching path', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            const result = def.parse('/posts/123');
            expect(result).toBeNull();
        });

        it('parses a static path', () => {
            const def = new RouteDefinition('/users', {} as never);
            const result = def.parse('/users');
            expect(result).not.toBeNull();
            expect(result!.path).toBe('users');
        });
    });

    describe('matches()', () => {
        it('returns true for matching path', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            expect(def.matches('/users/123')).toBe(true);
        });

        it('returns false for non-matching path', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            expect(def.matches('/posts/123')).toBe(false);
        });
    });

    describe('pattern', () => {
        it('stores the raw pattern', () => {
            const def = new RouteDefinition('/users/{id}', {} as never);
            expect(def.pattern).toBe('/users/{id}');
        });
    });
});