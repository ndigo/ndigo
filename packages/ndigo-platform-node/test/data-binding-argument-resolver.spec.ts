/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
    MethodParameter,
    MethodParameterType,
    MissingParameterError,
    dataBinderValue,
    validatedBy,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { NodeDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE, NodeRequest } from '../src/node-request';

// Route helper with NodeRequest in attributes:
function makeRoute(req?: Partial<NodeRequest>): Route {
    return {
        data: {},
        params: {},
        path: '/',
        raw: '/',
        id: 'test',
        length: 0,
        attributes: req
            ? { [NODE_REQUEST_ATTRIBUTE]: { headers: {}, body: {}, cookies: {}, session: {}, ...req } }
            : {},
    };
}

const bodyParam = (convert?: (value: unknown) => unknown, prefix: string | null = null) =>
    new MethodParameter(MethodParameterType.data('body'), 'body', false, null, undefined, prefix, convert);

describe('NodeDataBindingMethodArgumentResolver', () => {
    let resolver: NodeDataBindingMethodArgumentResolver;
    beforeEach(() => {
        resolver = new NodeDataBindingMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('supports the node bindable-source allow-list (body + cookie)', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data('body'), 'body'))).toBe(
                true
            );
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data('cookie'), 'cookie'))).toBe(
                true
            );
        });

        test('rejects browser-only and non-data sources', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.data('query'), 'query'))).toBe(
                false
            );
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'q'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.BODY, 'b'))).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('binds flat urlencoded form fields into a nested object', () => {
            const route = makeRoute({
                body: { email: 'a@b.co', age: '42', 'address.street': 'Main St', 'address.city': 'York' },
            });

            const value = resolver.resolveArgument(bodyParam(), route, {});
            expect(value).toEqual({ email: 'a@b.co', age: '42', address: { street: 'Main St', city: 'York' } });
            expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
        });

        test('binds repeated keys (already folded to arrays by parseBody) through unchanged', () => {
            const route = makeRoute({ body: { tags: ['a', 'b', 'a'], name: 'Jeff' } });

            const value = resolver.resolveArgument(bodyParam(), route, {});
            expect(value).toEqual({ tags: ['a', 'b', 'a'], name: 'Jeff' });
        });

        test('nests bracket keypaths like address[0].street via parseKeypath', () => {
            const route = makeRoute({ body: { 'address[0].street': 'Main St', 'address[0].city': 'York' } });

            const value = resolver.resolveArgument(bodyParam(), route, {});
            expect(value).toEqual({ address: [{ street: 'Main St', city: 'York' }] });
        });

        test('filters by prefix before binding', () => {
            const route = makeRoute({
                body: { 'user.name': 'Jeff', 'user.age': '30', 'other.field': 'ignored' },
            });

            const value = resolver.resolveArgument(bodyParam(undefined, 'user.'), route, {});
            expect(value).toEqual({ name: 'Jeff', age: '30' });
        });

        test('binds cookies as a whole source', () => {
            const route = makeRoute({ cookies: { SESSIONID: 'abc', theme: 'dark' } });
            const param = new MethodParameter(MethodParameterType.data('cookie'), 'cookie');

            expect(resolver.resolveArgument(param, route, {})).toEqual({ SESSIONID: 'abc', theme: 'dark' });
        });

        test('an empty-but-present body binds to an empty object (model-attribute binding parity)', () => {
            const route = makeRoute({ body: {} });

            expect(resolver.resolveArgument(bodyParam(), route, {})).toEqual({});
        });

        test('a missing whole source falls back to the default value', () => {
            const route = makeRoute({ body: undefined });
            const withDefault = new MethodParameter(MethodParameterType.data('body'), 'body', false, 'fallback');

            expect(resolver.resolveArgument(withDefault, route, {})).toBe('fallback');
        });

        test('a required parameter with an absent source throws MissingParameterError', () => {
            // No NodeRequest attached at all.
            const noRequest = { data: {}, params: null, path: '/', raw: '/', id: 't', length: 0, attributes: {} };
            const param = new MethodParameter(
                MethodParameterType.data('body'),
                'body',
                true,
                null,
                undefined,
                null,
                undefined,
                undefined
            );

            expect(() => resolver.resolveArgument(param, noRequest as unknown as Route, {})).toThrow(
                MissingParameterError
            );
            expect(() => resolver.resolveArgument(param, noRequest as unknown as Route, {})).toThrow(
                /Required data-body:value parameter 'body' is missing/
            );

            // Request present but no body.
            const noBody = makeRoute({ body: undefined });
            expect(() => resolver.resolveArgument(param, noBody, {})).toThrow(MissingParameterError);
        });

        test('coerces String fields through the Zod schema (z.coerce.number())', () => {
            const schema = z.object({ email: z.string().email(), age: z.coerce.number() });
            const convert = validatedBy(schema, dataBinderValue('body')).convert;
            const route = makeRoute({ body: { email: 'a@b.co', age: '25' } });

            const value = resolver.resolveArgument(bodyParam(convert), route, {}) as { email: string; age: number };
            expect(value.age).toBe(25);
            expect(typeof value.age).toBe('number');
            expect(value.email).toBe('a@b.co');
        });

        test('strips unknown keys from the bound object by default (zod ^4.5.4 unknownKeys: strip)', () => {
            const schema = z.object({ email: z.string(), age: z.coerce.number() });
            const convert = validatedBy(schema, dataBinderValue('body')).convert;
            const route = makeRoute({ body: { email: 'a@b.co', age: '25', hacker: 'x' } });

            const value = resolver.resolveArgument(bodyParam(convert), route, {}) as Record<string, unknown>;
            expect(value).toEqual({ email: 'a@b.co', age: 25 });
            expect('hacker' in value).toBe(false);
        });

        test('a target constructor yields a real instanceof DTO with unknown keys stripped', () => {
            class ProfileForm {
                email = '';
                age = 0;
                address = { street: '', city: '' };
            }
            const schema = z.object({
                email: z.string().email(),
                age: z.coerce.number(),
                address: z.object({ street: z.string(), city: z.string() }),
            });
            const convert = validatedBy(schema, dataBinderValue('body')).convert;
            const param = new MethodParameter(
                MethodParameterType.data('body'),
                'body',
                false,
                null,
                undefined,
                null,
                convert,
                undefined,
                ProfileForm
            );
            const route = makeRoute({
                body: {
                    email: 'a@b.co',
                    age: '25',
                    'address.street': 'Main St',
                    'address.city': 'York',
                    hacker: 'x',
                },
            });

            const value = resolver.resolveArgument(param, route, {});
            expect(value).toBeInstanceOf(ProfileForm);
            expect(value).toEqual({ email: 'a@b.co', age: 25, address: { street: 'Main St', city: 'York' } });
            expect('hacker' in (value as object)).toBe(false);
        });

        test('a target with no Zod schema binds true wire values into the instance', () => {
            class RawForm {
                name: string | null = null;
                age: string | null = null;
            }
            const param = new MethodParameter(
                MethodParameterType.data('body'),
                'body',
                false,
                null,
                undefined,
                null,
                undefined,
                undefined,
                RawForm
            );
            const route = makeRoute({ body: { name: 'Jeff', age: '30' } });

            const value = resolver.resolveArgument(param, route, {});
            expect(value).toBeInstanceOf(RawForm);
            expect(value).toEqual({ name: 'Jeff', age: '30' });
        });
    });
});
