/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
    MethodParameter,
    MethodParameterType,
    MissingParameterError,
    validatedBy,
    dataBinderValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { NodeRequestPartMethodArgumentResolver } from '../src/request-part-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE, NodeRequest } from '../src/node-request';

// A minimal multipart context: only the `fields` record matters to this resolver.
function makeRoute(fields: Record<string, string | string[]>): Route {
    const req = { headers: {}, body: {}, cookies: {}, session: {} } as NodeRequest;
    (req as { multipart?: unknown }).multipart = { fields, files: new Map() };
    return {
        data: {},
        params: {},
        path: '/',
        raw: '/',
        id: 'test',
        length: 0,
        attributes: { [NODE_REQUEST_ATTRIBUTE]: req },
    };
}

// Simulates what `toMethodParameter` produces for a part: the folded client
// part name (explicit override or inferred method-argument name).
function partParam(name: string, convert?: (value: unknown) => unknown, target?: new () => object): MethodParameter {
    return new MethodParameter(
        MethodParameterType.REQUEST_PART,
        name,
        false,
        null,
        undefined,
        null,
        convert,
        name,
        target
    );
}

describe('NodeRequestPartMethodArgumentResolver', () => {
    let resolver: NodeRequestPartMethodArgumentResolver;

    beforeEach(() => {
        resolver = new NodeRequestPartMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('returns true for REQUEST_PART parameter type', () => {
            expect(resolver.supportsParameter(partParam('meta'))).toBe(true);
        });

        test('returns false for other parameter types', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.BODY, 'x'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'x'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.MULTIPART_FILE, 'x'))).toBe(
                false
            );
        });
    });

    describe('resolveArgument', () => {
        test('parses a JSON part into a plain object', () => {
            const route = makeRoute({ meta: JSON.stringify({ label: 'demo', tags: ['a', 'b'] }) });

            const value = resolver.resolveArgument(partParam('meta'), route, {});
            expect(value).toEqual({ label: 'demo', tags: ['a', 'b'] });
        });

        test('falls back to the raw string for a non-JSON text part', () => {
            const route = makeRoute({ bio: 'hello world' });

            const value = resolver.resolveArgument(partParam('bio'), route, {});
            expect(value).toBe('hello world');
        });

        test('parses repeated parts per element into an array (AD-26 collapse)', () => {
            const route = makeRoute({ tags: ['"a"', 'plain', '3'] });

            const value = resolver.resolveArgument(partParam('tags'), route, {});
            expect(value).toEqual(['a', 'plain', 3]);
        });

        test('binds a JSON part into a real target instance', () => {
            class MetaDTO {
                label: string | null = null;
                tags: string[] = [];
            }
            const route = makeRoute({ meta: JSON.stringify({ label: 'demo', tags: ['x'] }) });

            const value = resolver.resolveArgument(partParam('meta', undefined, MetaDTO), route, {});
            expect(value).toBeInstanceOf(MetaDTO);
            expect(value).toEqual({ label: 'demo', tags: ['x'] });
        });

        test('validates and coerces a target part through the Zod hook, stripping unknowns', () => {
            class MetaDTO {
                label: string | null = null;
                count: number | null = null;
            }
            const schema = z.object({ label: z.string(), count: z.coerce.number() });
            const convert = validatedBy(schema, dataBinderValue('body')).convert;
            const route = makeRoute({ meta: JSON.stringify({ label: 'demo', count: '5', hack: 'x' }) });

            const value = resolver.resolveArgument(partParam('meta', convert, MetaDTO), route, {});
            expect(value).toBeInstanceOf(MetaDTO);
            expect(value).toEqual({ label: 'demo', count: 5 });
        });

        test('resolves nil for a missing part (no throw without required)', () => {
            const route = makeRoute({});

            expect(resolver.resolveArgument(partParam('meta'), route, {})).toBeNull();
        });

        test('a missing part on a required parameter throws MissingParameterError', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.REQUEST_PART, 'meta', true);

            expect(() => resolver.resolveArgument(param, route, {})).toThrow(MissingParameterError);
        });
    });
});
