/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { NodeMultipartFileMethodArgumentResolver } from '../src/multipart-file-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE, NodeRequest } from '../src/node-request';

// A minimal multipart context: only the `files` map matters to this resolver.
function makeRoute(files: Map<string, unknown[]>): Route {
    const req = { headers: {}, body: {}, cookies: {}, session: {} } as NodeRequest;
    (req as { multipart?: unknown }).multipart = { files };
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

function routeWithoutMultipart(): Route {
    const req = { headers: {}, body: {}, cookies: {}, session: {} } as NodeRequest;
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

// Simulates what `toMethodParameter` produces for a file part: the folded
// client field name (explicit override or inferred method-argument name).
function fileParam(clientField: string, required = false): MethodParameter {
    return new MethodParameter(MethodParameterType.MULTIPART_FILE, clientField, required);
}

describe('NodeMultipartFileMethodArgumentResolver', () => {
    let resolver: NodeMultipartFileMethodArgumentResolver;

    beforeEach(() => {
        resolver = new NodeMultipartFileMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('returns true for MULTIPART_FILE parameter type', () => {
            expect(resolver.supportsParameter(fileParam('avatar'))).toBe(true);
        });

        test('returns false for non-file parameter types', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.BODY, 'x'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'x'))).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('binds a single uploaded part to the lone file object', () => {
            const avatar = { name: 'avatar.png' };
            const route = makeRoute(new Map([['avatar', [avatar]]]));

            expect(resolver.resolveArgument(fileParam('avatar'), route, {})).toBe(avatar);
        });

        test('binds several uploaded parts under one field to an array', () => {
            const a = { name: 'a.png' };
            const b = { name: 'b.png' };
            const route = makeRoute(new Map([['photos', [a, b]]]));

            expect(resolver.resolveArgument(fileParam('photos'), route, {})).toEqual([a, b]);
        });

        test('reads the explicit client field name (fileValue("field"))', () => {
            const avatar = { name: 'avatar.png' };
            // parameter.name is the folded explicit field; the form sends "avatar_url".
            const route = makeRoute(new Map([['avatar_url', [avatar]]]));

            expect(resolver.resolveArgument(fileParam('avatar_url'), route, {})).toBe(avatar);
        });

        test('returns undefined for a missing part when not required', () => {
            const route = makeRoute(new Map<string, unknown[]>());

            expect(resolver.resolveArgument(fileParam('avatar'), route, {})).toBeNull();
        });

        test('throws MissingParameterError for a missing part on a required parameter', () => {
            const route = makeRoute(new Map<string, unknown[]>());

            expect(() => resolver.resolveArgument(fileParam('avatar', true), route, {})).toThrow(
                /parameter 'avatar' is missing/
            );
        });

        test('handles a request with no multipart context gracefully', () => {
            const route = routeWithoutMultipart();

            expect(resolver.resolveArgument(fileParam('avatar'), route, {})).toBeNull();
        });

        test('handles an unknown part name (no such field) gracefully', () => {
            const route = makeRoute(new Map([['other', [{ name: 'x' }]]]));

            expect(resolver.resolveArgument(fileParam('avatar'), route, {})).toBeNull();
        });
    });
});
