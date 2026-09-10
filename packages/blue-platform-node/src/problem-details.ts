/**
 * RFC 9457 Problem Details for HTTP APIs (obsoletes RFC 7807).
 *
 * Every 4xx/5xx response from the Node platform's HTTP pipeline is an
 * `application/problem+json` document (AD-10):
 *
 * ```json
 * {
 *   "type": "urn:blue:validation-failed",
 *   "title": "Validation Failed",
 *   "status": 422,
 *   "detail": "title: Too small: expected string to have >=1 characters",
 *   "instance": "/drizzle/notes",
 *   "errors": [{ "path": ["title"], "message": "…", "code": "too_small" }]
 * }
 * ```
 *
 * `type` is a `urn:blue:<slug>` — a **placeholder scheme**. Real HTTPS
 * problem-type URIs must be registered before the first public release
 * (tracked in AD-10); no external consumers exist to notify (development
 * mode). `errors` is a Blue extension member carrying the structured
 * per-field validation failures (Phase 4A).
 *
 * @module
 * @since 1.0.0
 */

import { ValidationIssue } from '@blue/dispatcher';
import { ResponseStatus } from '@blue/http';
import { ResponseEntity } from './response-entity';

/**
 * A single RFC 9457 problem-details member set. `type` and `title` are
 * optional per the RFC (omitted `type` implies `about:blank`); `status` is
 * the HTTP status; `errors` is the Blue extension member for per-field
 * validation issues (Phase 4A).
 */
export interface ProblemDetails {
    /** For known framework errors, a `urn:blue:<slug>`. Omit for `about:blank`. */
    type?: string;
    /** A human-readable title summarizing the problem. */
    title?: string;
    /** The HTTP status code. */
    status: number;
    /** A human-readable explanation specific to this occurrence. */
    detail?: string;
    /** A URI reference identifying the specific occurrence (e.g. the request path). */
    instance?: string;
    /** Blue extension: structured per-field validation failures. */
    errors?: readonly ValidationIssue[];
}

/**
 * Blue problem-type URIs (placeholder `urn:` scheme — see module docs).
 * Slugs use `-` separators; underscore-bearing transport codes keep their
 * code shape where they exist.
 */
export const ProblemTypes = {
    bindingFailed: 'urn:blue:binding-failed',
    validationFailed: 'urn:blue:validation-failed',
    unauthorized: 'urn:blue:unauthorized',
    forbidden: 'urn:blue:forbidden',
    notFound: 'urn:blue:not-found',
    methodNotAllowed: 'urn:blue:method-not-allowed',
    notAcceptable: 'urn:blue:not-acceptable',
    payloadTooLarge: 'urn:blue:payload-too-large',
    unsupportedMediaType: 'urn:blue:unsupported-media-type',
    malformedBody: 'urn:blue:malformed-body',
    malformedUrl: 'urn:blue:malformed-url',
    requestAborted: 'urn:blue:request-aborted',
    rateLimited: 'urn:blue:rate-limited',
    serviceUnavailable: 'urn:blue:service-unavailable',
    internalError: 'urn:blue:internal-error',
} as const;

/**
 * Minimal response writer accepted by {@link writeProblem} — compatible with
 * Node's `ServerResponse` and the in-memory MockHTTP sink.
 */
export interface ProblemResponseWriter {
    /** Write the status line + headers. */
    writeHead(status: number, headers: Record<string, string | string[]>): void;
    /** Finalize the body. */
    end(body?: unknown): void;
}

/**
 * Writes an RFC 9457 problem document to a response: `application/problem+json`
 * content type, `Cache-Control: no-store`, and `Vary: Accept` (negotiation may
 * later select a content type; error responses must not be cached).
 *
 * @param res - The response writer (ServerResponse or MockHTTP sink).
 * @param details - The problem document.
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
        'Content-Type': 'application/problem+json',
        'Cache-Control': 'no-store',
        Vary: 'Accept',
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
 */
export function problemEntity(status: ResponseStatus, details: ProblemDetails): ResponseEntity<ProblemDetails> {
    return new ResponseEntity(details, status);
}
