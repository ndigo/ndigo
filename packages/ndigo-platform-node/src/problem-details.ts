/**
 * RFC 9457 Problem Details for HTTP APIs (obsoletes RFC 7807).
 */
import { ValidationIssue } from '@ndigo/dispatcher';
import { MediaTypes } from '@ndigo/core';
import { HTTPHeaders, ResponseStatus } from '@ndigo/http';
import { ResponseEntity } from './response-entity';

/**
 * A single RFC 9457 problem-details member set. `type` and `title` are
 * optional per the RFC (omitted `type` implies `about:blank`); `status` is
 * the HTTP status; `errors` is the Ndigo extension member for per-field
 * validation issues (Phase 4A).
 *
 * @example
 * ```ts
 * const value = {} as ProblemDetails;
 * ```
 */
export interface ProblemDetails {
    /** For known framework errors, a `urn:ndigo:<slug>`. Omit for `about:blank`. */
    type?: string;
    /** A human-readable title summarizing the problem. */
    title?: string;
    /** The HTTP status code. */
    status: number;
    /** A human-readable explanation specific to this occurrence. */
    detail?: string;
    /** A URI reference identifying the specific occurrence (e.g. the request path). */
    instance?: string;
    /** Ndigo extension: structured per-field validation failures. */
    errors?: readonly ValidationIssue[];
}

/**
 * Minimal response writer accepted by {@link writeProblem} — compatible with
 * Node's `ServerResponse` and the in-memory MockHTTP sink.
 *
 * @example
 * ```ts
 * const value = {} as ProblemResponseWriter;
 * ```
 */
export interface ProblemResponseWriter {
    /** Write the status line + headers. @param status - The status code. @param headers - The headers. */
    writeHead(status: number, headers: Record<string, string | string[]>): void;
    /** Finalize the body. @param body - The body to write. */
    end(body?: unknown): void;
}

/**
 * Writes an RFC 9457 problem document to a response: `application/problem+json`
 * content type, `Cache-Control: no-store`, and `Vary: Accept` (negotiation may
 * later select a content type; error responses must not be cached).
 *
 * @param res - The response writer (ServerResponse or MockHTTP sink).
 * @param details - The problem document.
 * @param headers - Additional response headers.
 *
 * @example
 * ```ts
 * writeProblem();
 * ```
 */
export function writeProblem(
    res: ProblemResponseWriter,
    details: ProblemDetails,
    headers: Record<string, string | string[]> = {}
): void {
    const payload: Record<string, unknown> = { status: details.status };
    if (details.type) payload['type'] = details.type;
    if (details.title) payload['title'] = details.title;
    if (details.detail) payload['detail'] = details.detail;
    if (details.instance) payload['instance'] = details.instance;
    if (details.errors && details.errors.length > 0) payload['errors'] = details.errors;
    res.writeHead(details.status, {
        [HTTPHeaders.CONTENT_TYPE.name]: String(MediaTypes.APPLICATION_PROBLEM_JSON),
        [HTTPHeaders.CACHE_CONTROL.name]: 'no-store',
        [HTTPHeaders.VARY.name]: 'Accept',
        ...headers,
    });
    res.end(JSON.stringify(payload));
}

/**
 * Whether a value already IS a problem document (has an HTTP status), so the
 * response-entity renderer does not double-wrap framework-produced problems.
 *
 * @param value - The response body.
 * @returns `true` when the value is a problem document.
 *
 * @example
 * ```ts
 * isProblemDetails();
 * ```
 */
export function isProblemDetails(value: unknown): value is ProblemDetails {
    return value !== null && typeof value === 'object' && typeof (value as { status?: unknown }).status === 'number';
}

/**
 * Builds a `ProblemDetails` for a 4xx/5xx handler-returned `ResponseEntity`
 * body that was not already a problem document: a string body becomes
 * `detail`, an `{ error }` object's string value becomes `detail`, and other
 * objects are JSON-serialized (the handler's own body — nothing internal is
 * added).
 *
 * @param status - The HTTP status code.
 * @param title - The status reason phrase.
 * @param body - The original response body.
 * @param instance - The request path, when known.
 * @returns A problem document.
 *
 * @example
 * ```ts
 * toProblemDetails();
 * ```
 */
export function toProblemDetails(body: unknown, status: number, title: string, instance?: string): ProblemDetails {
    let detail: string | undefined;
    if (typeof body === 'string') {
        detail = body;
    } else if (body !== null && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
        detail = (body as { error: string }).error;
    } else if (body !== null && body !== undefined) {
        detail = JSON.stringify(body);
    }
    const details: ProblemDetails = { status, title };
    if (detail !== undefined) details.detail = detail;
    if (instance !== undefined) details.instance = instance;
    return details;
}

/**
 * Wraps a problem document in a `ResponseEntity` at the given status. Used by
 * framework error resolvers to return a problem through the resolver chain;
 * the response-entity view detects the problem body and writes
 * `application/problem+json` without double-wrapping.
 *
 * @param status - The `ResponseStatus` for the problem (e.g. `UNPROCESSABLE_ENTITY`).
 * @param details - The problem document.
 * @returns An entity carrying the problem.
 *
 * @example
 * ```ts
 * problemEntity();
 * ```
 */
export function problemEntity(status: ResponseStatus, details: ProblemDetails): ResponseEntity<ProblemDetails> {
    return new ResponseEntity(details, status);
}
