/**
 */
import { describe, test, expect } from 'vitest';
import { HTTPHeader } from '../src/http-header';
import * as HTTPHeaders from '../src/http-headers';
import { AuthorizationHeader } from '../src/authorization-header';
import { ContentTypeHeader, contentTypeBase, multipartBoundary } from '../src/content-type-header';
import { SetCookieHeader } from '../src/set-cookie-header';

describe('HTTPHeader', () => {
    const pragma = new HTTPHeader('Pragma');

    test('it should create instances', () => {
        expect(pragma).toHaveProperty('name', 'Pragma');
        expect(pragma.toString()).toBe('Pragma');
        expect(String(pragma)).toBe('Pragma');
        expect(pragma.toJSON()).toBe('Pragma');

        // The runtime guards a missing header collection (delete/get/has
        // no-op, set throws); declare the optional form the spec exercises.
        const bareHeader = pragma as unknown as {
            delete(): void;
            get(): string | null;
            set(): void;
            has(): boolean;
        };
        bareHeader.delete();
        bareHeader.get();
        expect(() => bareHeader.set()).toThrow(TypeError);
        expect(bareHeader.has()).toBe(false);

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

    test('it should fold case when reading lowercase records (DSG-5)', () => {
        const headers: Record<string, string> = { 'content-type': 'text/plain' };
        const contentType = new HTTPHeader('Content-Type');

        expect(contentType.get(headers)).toBe('text/plain');
        expect(contentType.has(headers)).toBe(true);
    });

    test('it should prefer the exact-case key over the folded lookup', () => {
        const headers: Record<string, string> = { 'Content-Type': 'exact', 'content-type': 'folded' };

        expect(new HTTPHeader('Content-Type').get(headers)).toBe('exact');
    });

    test('it should return null for lowercase records missing the header', () => {
        const headers: Record<string, string> = { 'x-other': 'present' };

        expect(new HTTPHeader('Content-Type').get(headers)).toBeNull();
        expect(new HTTPHeader('Content-Type').has(headers)).toBe(false);
    });

    test('it should fold case when reading header tuples (DSG-5)', () => {
        const headers: Array<[string, string]> = [['content-type', 'text/html']];

        expect(new HTTPHeader('Content-Type').get(headers)).toBe('text/html');
        expect(new HTTPHeader('Content-Type').has(headers)).toBe(true);
    });

    test('it should fold case when writing to lowercased records (COR-4)', () => {
        const headers: Record<string, string> = { 'content-type': 'text/plain' };
        const contentType = new HTTPHeader('Content-Type');

        // A canonical set() must overwrite the folded key, not add a second one.
        contentType.set(headers, 'application/json');
        expect(headers).toEqual({ 'content-type': 'application/json' });
        expect(Object.keys(headers)).toHaveLength(1);
        expect(contentType.get(headers)).toBe('application/json');

        // A canonical delete() must remove the lowercased entry
        // (SET_COOKIE.delete(req.headers) on a Node server record).
        contentType.delete(headers);
        expect(contentType.has(headers)).toBe(false);
        expect(headers).toEqual({});

        const setCookieHeaders: Record<string, string> = { 'set-cookie': 'a=1' };
        HTTPHeaders.SET_COOKIE.delete(setCookieHeaders);
        expect(setCookieHeaders).toEqual({});
    });

    test('it should fold case when writing to header tuples (COR-4)', () => {
        const headers: Array<[string, string]> = [['content-type', 'text/html']];
        const contentType = new HTTPHeader('Content-Type');

        contentType.set(headers, 'application/json');
        expect(headers).toEqual([['content-type', 'application/json']]);

        contentType.delete(headers);
        expect(contentType.has(headers)).toBe(false);
    });

    test('it should treat array-valued records as present (COR-4)', () => {
        const headers: Record<string, string> = { 'set-cookie': 'ignored' };
        (headers as Record<string, unknown>)['set-cookie'] = ['a=1', 'b=2'];
        const setCookie = new HTTPHeader('Set-Cookie');

        expect(setCookie.has(headers)).toBe(true);
        expect(setCookie.get(headers)).toBe('a=1, b=2');
        expect(setCookie.getJoined(headers)).toBe('a=1, b=2');
        expect(setCookie.getJoined(headers, '; ')).toBe('a=1; b=2');

        // A single-value record still reads as-is.
        const pragma = new HTTPHeader('Pragma');
        expect(pragma.get({ pragma: 'no-cache' })).toBe('no-cache');
        expect(pragma.has({ pragma: 'no-cache' })).toBe(true);
        expect(pragma.get({ other: 'x' })).toBeNull();
        expect(pragma.has({ other: 'x' })).toBe(false);
    });
});

describe('HTTPHeader.getJoined', () => {
    const accept = new HTTPHeader('Accept');

    test('returns the value as-is for plain strings', () => {
        expect(accept.getJoined({ accept: 'text/html' })).toBe('text/html');
    });

    test('joins array values (Node server records) with the separator', () => {
        const headers: Record<string, string> = { accept: 'text/html' };
        (headers as Record<string, unknown>).accept = ['text/html', 'application/json'];
        expect(accept.getJoined(headers)).toBe('text/html, application/json');
        expect(accept.getJoined(headers, ',')).toBe('text/html,application/json');
    });

    test('folds case on records and returns null when missing', () => {
        expect(accept.getJoined({ Accept: 'x' })).toBe('x');
        expect(accept.getJoined({ other: 'x' })).toBeNull();
        expect(accept.getJoined(undefined as unknown as HeadersInit)).toBeNull();
    });
});

describe('AuthorizationHeader', () => {
    const authorization = new AuthorizationHeader('Authorization');

    test('extracts the bearer credential, scheme case-insensitive and trimmed', () => {
        expect(authorization.bearerToken('Bearer abc.def')).toBe('abc.def');
        expect(authorization.bearerToken('bearer  abc.def ')).toBe('abc.def');
    });

    test('is undefined for absent, malformed or non-bearer values', () => {
        expect(authorization.bearerToken(undefined)).toBeUndefined();
        expect(authorization.bearerToken(null)).toBeUndefined();
        expect(authorization.bearerToken('')).toBeUndefined();
        expect(authorization.bearerToken('Bearer')).toBeUndefined();
        expect(authorization.bearerToken('Basic abc')).toBeUndefined();
    });

    test('stays a plain HTTPHeader name', () => {
        expect(authorization.name).toBe('Authorization');
        expect(String(authorization)).toBe('Authorization');
    });
});

describe('ContentTypeHeader', () => {
    const contentType = new ContentTypeHeader('Content-Type');

    test('baseValue strips parameters and folds case', () => {
        expect(contentType.baseValue('text/html; charset=utf-8')).toBe('text/html');
        expect(contentType.baseValue('  Multipart/Form-Data; BOUNDARY=x ')).toBe('multipart/form-data');
        expect(contentType.baseValue(undefined)).toBeNull();
        expect(contentType.baseValue('')).toBeNull();
    });

    test('boundary matches only multipart/form-data with case-insensitive parameter names', () => {
        expect(contentType.boundary('multipart/form-data; boundary=abc')).toBe('abc');
        expect(contentType.boundary('multipart/form-data; BOUNDARY="x y"')).toBe('x y');
        expect(contentType.boundary('multipart/form-data; charset=utf-8')).toBeNull();
        expect(contentType.boundary('text/plain; boundary=abc')).toBeNull();
        expect(contentType.boundary(null)).toBeNull();
    });

    test('the free functions are the primitives the constant uses', () => {
        expect(contentTypeBase('application/json')).toBe('application/json');
        expect(multipartBoundary('multipart/form-data; boundary=z')).toBe('z');
    });
});

describe('SetCookieHeader', () => {
    const setCookie = new SetCookieHeader('Set-Cookie');

    test('buildValue formats name=value plus attributes', () => {
        expect(setCookie.buildValue('ndigo-session', 'tok', ['HttpOnly', 'SameSite=Lax', 'Path=/'])).toBe(
            'ndigo-session=tok; HttpOnly; SameSite=Lax; Path=/'
        );
        expect(setCookie.buildValue('a', 'b')).toBe('a=b');
    });
});
