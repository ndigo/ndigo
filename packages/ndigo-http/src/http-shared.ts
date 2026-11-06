/**
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import type { WildcardExp } from '@ndigo/core';
import type { HTTPInit } from './http-types';
import { is } from '@ndigo/util/types';

/**
 * Shared \`Object\` helpers used to clone and freeze request settings.
 */
/**
 * Clones request settings and locks them before fetch executes.
 */
export const { assign, freeze } = Object,
    { defineProperty } = Reflect,
    defaults: HTTPInit = {
        cache: 'default',
        credentials: 'same-origin',
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
    },
    patternCache = new Map<string, WildcardExp>(),
    isRequest = is(Request) as (value: unknown) => value is Request;

/**
 * Rebuilds a response with a replacement body (and/or headers) while
 * preserving the transport metadata the `Response` constructor resets —
 * `url`, `redirected`, and `type` — and dropping the now-stale
 * `Content-Length` (HTT-REV-011).
 *
 * @param source - The response being rebuilt.
 * @param body - The replacement body.
 * @param headers - Replacement headers; defaults to the source's headers.
 * @returns The rebuilt response with its metadata re-attached.
 */
export function rebuildResponse(source: Response, body: BodyInit | null, headers?: Headers): Response {
    const rebuiltHeaders = new Headers(headers ?? source.headers);
    // The body is replaced/re-serialized, so any prior length is stale.
    rebuiltHeaders.delete('content-length');

    const rebuilt = new Response(body, {
        status: source.status,
        statusText: source.statusText,
        headers: rebuiltHeaders,
    });

    defineProperty(rebuilt, 'url', { value: source.url, configurable: true, enumerable: true });
    defineProperty(rebuilt, 'redirected', { value: source.redirected, configurable: true, enumerable: true });
    defineProperty(rebuilt, 'type', { value: source.type, configurable: true, enumerable: true });

    return rebuilt;
}
