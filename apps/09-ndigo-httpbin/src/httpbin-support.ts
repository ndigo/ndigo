/**
 * Shared request-projection and response helpers for the httpbin probes.
 *
 * The echo payload mirrors httpbin's contract — `{ method, path, url, args,
 * headers, data, json, form, origin }` — built strictly from what the real
 * request carried: the matched {@link Route} (method/path/raw target), the
 * parsed query bag, the raw header record, and the parsed body. Multipart
 * file parts are summarised (`files`) with their names and byte sizes.
 */
import type { Route } from '@ndigo/router';
import { getNodeRequest, type MultipartFile } from '@ndigo/platform-node';

/** The raw request header record as the Node resolver exposes it. */
export type HeaderBag = Record<string, string | string[] | undefined>;

/** The routed query bag (`route.data`): repeated keys collapse to arrays. */
export type QueryBag = Record<string, string | string[]>;

/**
 * Reads the first value of a possibly multi-valued header.
 *
 * @param value - The header value as stored by the adapter.
 * @returns The scalar value, or `undefined` when absent.
 */
export function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

/** Reports whether a content type carries JSON (`application/json` or `+json`). */
export function isJsonContentType(contentType: string): boolean {
    return contentType.includes('application/json') || contentType.includes('+json');
}

/** Reports whether a content type is `application/x-www-form-urlencoded`. */
export function isFormContentType(contentType: string): boolean {
    return contentType.startsWith('application/x-www-form-urlencoded');
}

/**
 * Summarises the multipart file parts on the request: one entry per field with
 * the client filename and the parsed byte size, or an array for repeated parts.
 *
 * @param route - The dispatch route holding the node request.
 * @returns A field → `{ filename, size }` (or array) record; `{}` when absent.
 */
export function filesOf(route: Route): Record<string, unknown> {
    const multipart = getNodeRequest(route)?.multipart;
    if (!multipart) {
        return {};
    }
    const describe = (file: MultipartFile) => ({ filename: file.originalFilename, size: file.size });
    const files: Record<string, unknown> = {};
    for (const [field, parts] of multipart.files) {
        files[field] = parts.length === 1 ? describe(parts[0]) : parts.map(describe);
    }
    return files;
}

/**
 * Reconstructs the raw request-body text from the parsed body and the
 * declared content type: the JSON serialization for JSON bodies, the
 * re-serialized query string for form bodies, and the wildcard `'*'` entry
 * the adapter stores for any other non-empty content type.
 *
 * @param contentType - The request `Content-Type`, lower-cased and base-stripped.
 * @param body - The parsed body record.
 * @returns The raw body text, or `''` when the request carries none.
 */
function rawBodyText(contentType: string, body: unknown): string {
    if (body === null || body === undefined || typeof body !== 'object') {
        return '';
    }
    const record = body as Record<string, unknown>;
    if (isJsonContentType(contentType)) {
        return JSON.stringify(record);
    }
    if (isFormContentType(contentType)) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(record)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    params.append(key, String(item));
                }
            } else {
                params.append(key, String(value));
            }
        }
        return params.toString();
    }
    return typeof record['*'] === 'string' ? record['*'] : '';
}

/**
 * Builds the httpbin echo payload from the real request.
 *
 * @param route - The dispatch route (method, path, raw target, node request).
 * @param query - The whole query bag bound by `queryValue()`.
 * @param headers - The whole header record bound by `headerValue()`.
 * @param body - The whole parsed body bound by `bodyValue()`.
 * @returns The echo payload.
 */
export function echoPayload(route: Route, query: unknown, headers: unknown, body: unknown) {
    const headerBag = (headers ?? {}) as HeaderBag;
    const contentType = (firstValue(headerBag['content-type']) ?? '').toLowerCase();
    const host = firstValue(headerBag['host']);
    const json = isJsonContentType(contentType) ? (body ?? null) : null;
    const form =
        isFormContentType(contentType) || contentType.startsWith('multipart/form-data') ? (body ?? null) : null;
    return {
        method: route.method ?? 'GET',
        path: route.path,
        url: `http://${host ?? 'localhost'}${route.raw}`,
        args: (query ?? {}) as Record<string, unknown>,
        headers: headerBag,
        data: rawBodyText(contentType, body),
        json,
        form,
        origin: getNodeRequest(route)?.remoteAddress ?? null,
        files: filesOf(route),
    };
}
