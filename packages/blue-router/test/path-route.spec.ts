/**
 * @module blue-router
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import type { Matchable } from '@blue/core';
import { PathRoute } from '../src/path-route';
import { Route } from '../src/route';

describe('PathRoute', () => {
    test('it should satisfy the Matchable<string> contract', () => {
        const route = new PathRoute('/users/123');
        const matchable: Matchable<string> = route;
        expect(typeof matchable.matches).toBe('function');
        expect(matchable.matches('/users/:id')).toBe(true);
        expect(matchable.matches('/posts/:id')).toBe(false);
    });

    test('it should parse route strings', () => {
        const routeString = '/foo;a=1;b=2/bar;c=3;d=4/baz';
        const route = new PathRoute(routeString);
        const segment1 = route[0];
        const segment2 = route[1];
        const segment3 = route[2];

        expect(segment1).toHaveProperty('name');
        expect(segment1.name).toBe('foo');
        expect(segment1).toHaveProperty('data');
        expect(segment1.data).toHaveProperty('a');
        expect(segment1.data?.a).toBe('1');
        expect(segment1.data).toHaveProperty('b');
        expect(segment1.data?.b).toBe('2');

        expect(segment2).toHaveProperty('name');
        expect(segment2.name).toBe('bar');
        expect(segment2).toHaveProperty('data');
        expect(segment2.data).toHaveProperty('c');
        expect(segment2.data?.c).toBe('3');
        expect(segment2.data).toHaveProperty('d');
        expect(segment2.data?.d).toBe('4');

        expect(segment3).toHaveProperty('name');
        expect(segment3.name).toBe('baz');
        expect(segment3.data).toBe(null);

        expect(route).toHaveProperty('data');
        expect(route.data).toBe(null);

        expect(route.id).toBeTypeOf('number');
        expect(route.length).toBe(3);

        expect(route.toString()).toBe(routeString);
    });

    test('it should parse query strings', () => {
        const routeString = '/foo/bar?a=1&b=2&c=3';
        const route = new PathRoute(routeString);

        expect(route).toHaveProperty('data');
        expect(route.data).toHaveProperty('a');
        expect(route.data?.a).toBe('1');
        expect(route.data).toHaveProperty('b');
        expect(route.data?.b).toBe('2');
        expect(route.data).toHaveProperty('c');
        expect(route.data?.c).toBe('3');

        expect(route.toString()).toBe(routeString);
    });

    test('it should remove your unnecessary semicolons', () => {
        const route = new PathRoute('/foo;a=1;b=2/bar;c=3;d=4/baz;?e=5&f=6&g=7');
        expect(route.toString()).toBe('/foo;a=1;b=2/bar;c=3;d=4/baz?e=5&f=6&g=7');
    });

    test('it should ignore trailing slashes', () => {
        const route = new PathRoute('/foo/bar/');
        expect(route.toString()).toBe('/foo/bar');
    });

    test('it should ignore double slashes', () => {
        const route = new PathRoute('/foo//bar');
        expect(route.toString()).toBe('/foo/bar');
    });

    test('it should assume a leading slash', () => {
        const route = new PathRoute('foo/bar');
        expect(route.toString()).toBe('/foo/bar');
    });

    test('it should resolve path params using colon syntax', () => {
        const route = new PathRoute('/users/42/orders/abc');
        const params = route.resolveParams('/users/:userId/orders/:orderId');

        expect(params?.userId).toBe('42');
        expect(params?.orderId).toBe('abc');
        expect(route.params).toEqual(params);
        expect(route.matches('/users/:userId/orders/:orderId')).toBe(true);
    });

    test('it should resolve path params using brace syntax', () => {
        const route = new PathRoute('/products/123/reviews/9');
        const params = route.resolveParams('/products/{productId}/reviews/{reviewId}');

        expect(params?.productId).toBe('123');
        expect(params?.reviewId).toBe('9');
    });

    test('it should return null for non-matching path patterns', () => {
        const route = new PathRoute('/users/42');

        expect(route.resolveParams('/accounts/:id')).toBe(null);
        expect(route.matches('/accounts/:id')).toBe(false);
    });

    test('it should expose path without matrix parameters', () => {
        const route = new PathRoute('/foo;a=1/bar;b=2');

        expect(route.path).toBe('foo/bar');
    });

    test('it should serialize route and segment to json', () => {
        const route = new PathRoute('/users;active=true/42?sort=asc');
        // toJSON() returns a generic JSONValue; the serialized shape is fully known here.
        const json = route.toJSON() as unknown as {
            id: number;
            length: number;
            data: { sort: string };
            [segment: number]: { name: string; data: { active: string } };
        };

        expect(json.id).toBeTypeOf('number');
        expect(json.length).toBe(2);
        expect(json.data.sort).toBe('asc');
        expect(json[0].name).toBe('users');
        expect(json[0].data.active).toBe('true');
    });

    test('it should keep raw input route', () => {
        const route = new PathRoute('users/42?x=1');
        expect(route.raw).toBe('users/42?x=1');
    });

    test('it should support typed route params generics', () => {
        type UserRouteParams = { userId: string; orderId: string };
        const route = new PathRoute('/users/42/orders/77');
        const params = route.resolveParams('/users/:userId/orders/:orderId');

        const typedRoute = route as unknown as Route<UserRouteParams>;

        expect(params?.userId).toBe('42');
        expect(typedRoute.params?.orderId).toBe('77');
    });
});
