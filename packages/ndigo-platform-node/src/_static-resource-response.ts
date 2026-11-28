/**
 * Response writers for static resources: problems, in-memory payloads,
 * streamed files, and the 304/range/full-representation decision.
 */
import { createReadStream } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { Route } from '@ndigo/router';
import { CONTENT_LENGTH, CONTENT_RANGE, RANGE } from '@ndigo/http';
import { waitForDrainOrClose, type RepresentationContext } from './_static-resource-http.js';
import { isNotModified, parseSingleRange, ifRangeMatches } from './_static-resource-http.js';
import { writeProblem } from './problem-details.js';

/**
 * Writes a response with the given status and headers, plus an optional
 * in-memory body.
 *
 * @param res - The response to write.
 * @param status - The HTTP status.
 * @param headers - The response headers.
 * @param body - The in-memory body, when one exists.
 */
export function sendResponse(
    res: ServerResponse,
    status: number,
    headers: Record<string, string>,
    body: Buffer | string | undefined
): void {
    if (body instanceof Buffer) {
        res.writeHead(status, headers);
        res.end(body);
    } else if (typeof body === 'string' && body !== '') {
        res.writeHead(status, headers);
        res.end(body);
    } else {
        res.writeHead(status, headers);
        res.end();
    }
}

/**
 * Streams a resolved file with a stat-derived `Content-Length`, or a seeked
 * byte range. HEAD never opens the file — same headers, no body.
 * Backpressure is honored; a stream failure after the headers were sent
 * (file vanished/chmod'ed between stat and open) aborts the response.
 *
 * @param res - The response to write.
 * @param status - The HTTP status.
 * @param headers - The response headers.
 * @param path - The file to stream.
 * @param range - The byte range to read, when partial.
 * @param isHead - Whether this is a HEAD request (no body).
 */
export async function sendFile(
    res: ServerResponse,
    status: number,
    headers: Record<string, string>,
    path: string,
    range: { start: number; end: number } | undefined,
    isHead: boolean
): Promise<void> {
    if (isHead) {
        sendResponse(res, status, headers, undefined);
        return;
    }
    res.writeHead(status, headers);
    const stream = createReadStream(path, range);
    try {
        for await (const chunk of stream) {
            if (res.destroyed) {
                return;
            }
            if (!res.write(chunk)) {
                // The client is saturated — wait for it to drain, or for
                // it to abort (PLN-F2), before pushing the next chunk.
                const drained = await waitForDrainOrClose(res);
                if (!drained || res.destroyed) {
                    return;
                }
            }
        }
        res.end();
    } catch (error) {
        void error;
        res.destroy();
    } finally {
        // Always release the fd: the loop can exit early on abort, and the
        // response destroy path must never keep the read stream open.
        stream.destroy();
    }
}

/**
 * Writes a problem+json document scoped to the route.
 *
 * @param res - The response to write.
 * @param route - The current route (supplies the instance path).
 * @param status - The HTTP status.
 * @param title - The problem title.
 * @param type - The problem type URI.
 */
export function sendRouteProblem(res: ServerResponse, route: Route, status: number, title: string, type: string): void {
    writeProblem(res, { type, title, status, instance: route.path });
}

/**
 * Sends a 304, a byte range, a streamed file, or a generated payload.
 *
 * @param context - The resolved representation and request metadata.
 */
export async function sendRepresentation(context: RepresentationContext): Promise<void> {
    const { res, result, successHeaders, headers, method } = context;
    const fileBacked = result.etag !== undefined;

    // Conditional GET — answered from stat metadata only, the file is
    // never opened for a 304.
    if (result.etag && isNotModified(headers, result)) {
        sendResponse(res, 304, successHeaders, undefined);
        return;
    }

    const rangeHeader = RANGE.get(headers);
    // A stale If-Range validator cancels the range entirely (full
    // 200), per RFC 7233 §3.2.
    if (fileBacked && rangeHeader !== null && ifRangeMatches(headers, result) !== false) {
        const range = parseSingleRange(rangeHeader, result.size ?? 0);
        if (range === 'unsatisfiable') {
            sendResponse(
                res,
                416,
                { ...successHeaders, [CONTENT_RANGE.name]: `bytes */${result.size ?? 0}` },
                undefined
            );
            return;
        }
        if (range !== null && result.path !== undefined) {
            // Seeked stream over exactly the requested bytes.
            successHeaders[CONTENT_RANGE.name] = `bytes ${range.start}-${range.end}/${result.size ?? 0}`;
            const length = range.end - range.start + 1;
            await sendFile(
                res,
                206,
                { ...successHeaders, [CONTENT_LENGTH.name]: String(length) },
                result.path,
                { start: range.start, end: range.end },
                method === 'HEAD'
            );
            return;
        }
    }

    if (fileBacked && result.path !== undefined) {
        // Full representation: stat-derived Content-Length, streamed body.
        await sendFile(
            res,
            200,
            { ...successHeaders, [CONTENT_LENGTH.name]: String(result.size ?? 0) },
            result.path,
            undefined,
            method === 'HEAD'
        );
        return;
    }

    // Generated payload (directory listing): in-memory by construction.
    sendResponse(
        res,
        200,
        { ...successHeaders, [CONTENT_LENGTH.name]: String(result.data?.length ?? 0) },
        method === 'HEAD' ? undefined : result.data
    );
}
