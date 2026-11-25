/**
 * Internal helpers for the Node HTTP server adapter: URL building, cookie
 * parsing, header-limit enforcement, and safe error responses.
 */
import { toError } from '@ndigo/util';
import { likeClientProblem } from '@ndigo/core';
import { IncomingMessage, ServerResponse } from 'node:http';
import { HTTPHeaders, ProblemTypes, ResponseStatuses } from '@ndigo/http';
import { writeProblem } from './problem-details';
import { RequestLimitError } from './http-request-limits';
import { parseCookies } from './cookie-parser';
import type { ResolvedHTTPRequestLimits } from './http-request-limits';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-platform-node:node-http-server-adapter');

/**
 * Central safe error response: maps transport errors to deterministic
 * problem documents; everything else is a generic 500 with internal
 * details logged, never leaked to the client.
 */
export function writeErrorResponse(res: ServerResponse, error: unknown): void {
    if (res.writableEnded || res.destroyed) return;
    if (res.headersSent) {
        // The response already began streaming, so a problem document can
        // no longer be written: `writeHead` would throw
        // ERR_HTTP_HEADERS_SENT and escape as an unhandled rejection
        // (PLN-F5). A mid-stream failure is not a 500 candidate (PLN-F4) —
        // log and abort the socket so the client sees a closed connection,
        // never a hang.
        const streamMessage = toError(error).stack ?? toError(error).message;
        logger.error('dispatch failure after headers were sent; destroying response:', streamMessage);
        res.destroy();
        return;
    }
    if (likeClientProblem(error)) {
        // The error carries its own rendering contract: the exporter reads the
        // status, problem type, and detail structurally, so a duplicate package
        // copy or a serialized error still renders identically.
        writeProblem(res, {
            type: error.problemType,
            ...(error.problemStatus.text === undefined ? {} : { title: error.problemStatus.text }),
            status: error.problemStatus.code,
            detail: error.message,
        });
        return;
    }
    if (error instanceof SyntaxError) {
        writeProblem(res, {
            type: ProblemTypes.malformedBody,
            title: 'Bad Request',
            status: 400,
            detail: 'malformed_body',
        });
        return;
    }
    if (error instanceof URIError) {
        writeProblem(res, {
            type: ProblemTypes.malformedUrl,
            title: 'Bad Request',
            status: 400,
            detail: 'malformed_url',
        });
        return;
    }
    const message = toError(error).stack ?? toError(error).message;
    logger.error('dispatch failure:', message);
    writeProblem(res, {
        type: ProblemTypes.internalError,
        title: 'Internal Server Error',
        status: 500,
    });
}

/**
 * Builds the request URL, rejecting malformed `Host` headers with `400`.
 */
export function buildUrl(req: IncomingMessage): URL {
    const host = HTTPHeaders.HOST.get(req.headers);
    const url = req.url ?? '/';
    try {
        return new URL(url, `http://${host ?? 'localhost'}`);
    } catch {
        throw new RequestLimitError(
            ResponseStatuses.BAD_REQUEST,
            ProblemTypes.malformedUrl,
            `Malformed request URL: ${url}`
        );
    }
}

/**
 * Parses the request's `Cookie` header under the parser's bounds,
 * re-classifying a bound violation (`RangeError` past 50 entries or
 * 4 KiB values) as the same `431` {@link RequestLimitError} the
 * header-size check produces — never a generic 500.
 */
export function parseRequestCookies(req: IncomingMessage): Record<string, string> {
    try {
        return parseCookies(HTTPHeaders.COOKIE.get(req.headers) ?? undefined);
    } catch (error) {
        if (error instanceof RangeError) {
            throw new RequestLimitError(
                ResponseStatuses.REQUEST_HEADER_FIELDS_TOO_LARGE,
                ProblemTypes.headersTooLarge,
                'Cookie header exceeds the configured limit'
            );
        }
        throw error;
    }
}

export function assertHeaderLimits(req: IncomingMessage, limits: ResolvedHTTPRequestLimits): void {
    const rawHeaders = req.rawHeaders;
    let cookieBytes = 0;
    const rawHeadersLength = rawHeaders.length;
    for (let index = 0; index < rawHeadersLength; index += 2) {
        if (rawHeaders[index].toLowerCase() === 'cookie') {
            cookieBytes += Buffer.byteLength(rawHeaders[index + 1] ?? '', 'utf-8');
        }
    }
    if (cookieBytes > limits.maxHeaderBytes) {
        throw new RequestLimitError(
            ResponseStatuses.REQUEST_HEADER_FIELDS_TOO_LARGE,
            ProblemTypes.headersTooLarge,
            'Cookie header exceeds the configured limit'
        );
    }
}

/**
 * Streams the body with a hard byte cap enforced *inside* the loop:
 * reading stops at the limit, so a client streaming past `maxBodyBytes`
 * is cut off immediately (memory stays bounded) and gets `413` while the
 * socket is still writable. `408` when the client stalls. The stream is
 * not destroyed on overflow — a destroyed request cannot deliver the
 * `413` response to the client (verified), and the socket is simply
 * discarded once the response is flushed, so no further garbage is read.
 */
