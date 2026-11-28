/**
 * Streaming `multipart/form-data` parser for {@link NodeHTTPServerAdapter}.
 *
 * Wraps busboy (the zero-dependency streaming primitive that multer and
 * \@fastify/multipart build on). Parts below {@link MultipartLimits.fileThreshold}
 * are held in memory; larger parts spill to a temp file so peak memory stays
 * bounded regardless of upload size. Size limits reject with `413` through the
 * same {@link RequestLimitError} the body-limit path uses, so uploads fail
 * identically to an over-large JSON body. An over-cap `Content-Length` rejects
 * before any body byte is read; chunked uploads are capped by a counting gate
 * that stops the flow instead of draining to EOF. Rejected or post-abort
 * parts are drained with a real consumer so busboy always reaches `close`.
 */
import busboy from 'busboy';
import { PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import { tmpdir } from 'node:os';
import { HTTPHeaders, ProblemTypes, ResponseStatuses } from '@ndigo/http';
import { RequestLimitError } from './http-request-limits.js';
import { NodeMultipartContext } from './multipart-file.js';
import { contentLengthOf, extractBoundary, resolveMultipartLimits, sanitizeFilename } from './_multipart-limits.js';
import { collectFile } from './_multipart-file-collector.js';
import type { MultipartParseOptions } from './parse-multipart-types.js';

export * from './parse-multipart-types.js';

/**
 * Parse a `multipart/form-data` request body into fields + file parts.
 *
 * Streams the incoming request directly through busboy — it never buffers the
 * whole body first, so an oversized upload cannot exhaust memory. Rejects with
 * a `413` {@link RequestLimitError} when any configured limit is exceeded, and
 * with a `400` when the body is not valid multipart.
 *
 * @param req - The incoming request.
 * @param options - Parsing limits and temp directory.
 * @returns The parsed multipart context.
 *
 * @example
 * ```ts
 * parseMultipart();
 * ```
 */
export async function parseMultipart(
    req: IncomingMessage,
    options: MultipartParseOptions = {}
): Promise<NodeMultipartContext> {
    if (!extractBoundary(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? undefined)) {
        throw new RequestLimitError(
            ResponseStatuses.BAD_REQUEST,
            ProblemTypes.missingBoundary,
            'Request is not a valid multipart/form-data body'
        );
    }

    const limits = resolveMultipartLimits(options.limits);
    const tmpDir = options.tmpDir ?? tmpdir();
    const context = new NodeMultipartContext();

    // When the client declares its size up front and it exceeds the
    // cap, reject before reading a byte — no body consumption, no
    // `100-continue` data transfer, no temp files.
    const declaredLength = contentLengthOf(req);
    if (declaredLength !== null && declaredLength > limits.maxRequestSize) {
        throw new RequestLimitError(
            ResponseStatuses.PAYLOAD_TOO_LARGE,
            ProblemTypes.requestTooLarge,
            'Total multipart request exceeds the maximum allowed size'
        );
    }

    let totalBytes = 0;
    let aborted: RequestLimitError | null = null;
    const flagAbort = (problemType: string, message: string): void => {
        if (!aborted) {
            aborted = new RequestLimitError(ResponseStatuses.PAYLOAD_TOO_LARGE, problemType, message);
        }
    };

    const bb = busboy({
        headers: req.headers,
        limits: {
            fileSize: limits.maxFileSize,
            files: limits.maxFiles,
            fields: limits.maxFields,
            fieldSize: limits.maxFieldSize,
            parts: limits.maxParts,
        },
    });

    let resolveParse: (context: NodeMultipartContext) => void = () => undefined;
    let rejectParse: (error: Error) => void = () => undefined;
    const settle = new Promise<NodeMultipartContext>((resolvePromise, rejectPromise) => {
        resolveParse = resolvePromise;
        rejectParse = rejectPromise;
    });
    let settled = false;
    const settleError = (error: Error): void => {
        if (settled) {
            return;
        }
        settled = true;
        rejectParse(error);
    };
    const settleOk = (value: NodeMultipartContext): void => {
        if (settled) {
            return;
        }
        settled = true;
        resolveParse(value);
    };

    // A counting gate between the request stream and busboy. Without
    // a `Content-Length` (chunked uploads) the declared size is unknown, so
    // the cap must stop the flow while streaming — crossing it destroys the
    // gate stream with the same `RequestLimitError` busboy's own error path
    // already surfaces, rejecting 413 promptly instead of draining to EOF.
    const gate = new PassThrough();
    // The cap-error propagates to busboy directly (destroying the gate alone
    // would strand the piped parser without an error signal and it would
    // never emit 'close'); busboy's 'error' path settles the promise.
    gate.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > limits.maxRequestSize) {
            flagAbort(ProblemTypes.requestTooLarge, 'Total multipart request exceeds the maximum allowed size');
            gate.destroy();
            bb.destroy(
                new RequestLimitError(
                    ResponseStatuses.PAYLOAD_TOO_LARGE,
                    ProblemTypes.requestTooLarge,
                    'Total multipart request exceeds the maximum allowed size'
                )
            );
        }
    });

    const pending: Promise<void>[] = [];

    bb.on('field', (name, value, info) => {
        if (aborted) {
            return;
        }
        // The counting gate above already saw every body byte — field
        // values must NOT be added again (that would double count and reject
        // uploads at ~half the configured cap). Only re-check the totals.
        if (info.valueTruncated) {
            // Busboy truncated this field at the field-size limit —
            // bind nothing; the abort rejects with 413 field_too_large.
            flagAbort(ProblemTypes.fieldTooLarge, 'A text field exceeds the maximum allowed size');
            return;
        }
        if (totalBytes > limits.maxRequestSize) {
            flagAbort(ProblemTypes.requestTooLarge, 'Total multipart request exceeds the maximum allowed size');
            return;
        }
        context.setField(name, value);
    });

    bb.on('file', (_name, stream, info) => {
        const safeName = sanitizeFilename(info.filename);
        if (safeName === null || aborted) {
            // Reject traversal / absolute / separator filenames before any
            // filesystem touch; still drain rejected or post-abort parts with
            // a real consumer so busboy reaches 'close' promptly.
            stream
                .on('data', () => undefined)
                .on('end', () => undefined)
                .on('error', () => undefined);
            return;
        }
        pending.push(
            collectFile(
                context,
                _name,
                tmpDir,
                stream,
                { ...info, filename: safeName },
                limits,
                () => {
                    // The counting gate is the single byte counter;
                    // this only re-checks the accumulated total (adding here
                    // would double-count file chunks against the cap).
                    if (totalBytes > limits.maxRequestSize) {
                        flagAbort(
                            ProblemTypes.requestTooLarge,
                            'Total multipart request exceeds the maximum allowed size'
                        );
                    }
                },
                () => flagAbort(ProblemTypes.fileTooLarge, 'A file part exceeds the maximum allowed size')
            ).then(
                (part) => context.addFile(_name, part),
                () => {}
            )
        );
    });

    bb.on('filesLimit', () => flagAbort(ProblemTypes.tooManyFiles, 'Too many file parts were uploaded'));
    bb.on('fieldsLimit', () => flagAbort(ProblemTypes.tooManyFields, 'Too many text fields were uploaded'));
    bb.on('partsLimit', () => flagAbort(ProblemTypes.tooManyParts, 'Too many parts were uploaded'));
    bb.on('error', (error) => {
        // A parse error (e.g. a malformed boundary) is a client mistake, not
        // an overload. The streaming gate's own cap error passes through with
        // its 413 status; everything else is a malformed body.
        if (error instanceof RequestLimitError) {
            settleError(error);
            return;
        }
        settleError(
            new RequestLimitError(
                ResponseStatuses.BAD_REQUEST,
                ProblemTypes.malformedMultipart,
                `Failed to parse multipart body: ${(error as Error).message}`
            )
        );
    });

    bb.once('close', async () => {
        // Register every part before resolving so a caller that awaits the
        // parser sees the complete field + file map.
        await Promise.all(pending);
        if (settled) {
            // Abort-settled (client abort, socket loss; COR-16): the error is
            // already recorded — discard temp parts so nothing leaks on disk.
            await context.cleanup();
            return;
        }
        if (aborted) {
            // Overflowed upload: discard temp parts so nothing leaks on disk.
            await context.cleanup();
            settleError(aborted);
            return;
        }
        // Hand off readable parts to the caller. Temp files survive until the
        // request dispatch completes; the framework request lifecycle then
        // calls cleanup() — the parser's own abort path above is the
        // only other release.
        settleOk(context);
    });

    req.pipe(gate).pipe(bb);

    // Mirror #readBody's abort wiring. A client abort mid-upload must
    // settle the parser and destroy the gate/busboy pipeline so busboy's
    // 'close' handler above runs the temp cleanup — otherwise `parseMultipart`
    // would hang forever with spilled `ndigo-upload-*` files and open fds
    // behind it.
    const onAbort = (): void => {
        settleError(
            new RequestLimitError(
                ResponseStatuses.BAD_REQUEST,
                ProblemTypes.requestAborted,
                'Request aborted before completion'
            )
        );
        gate.destroy();
        bb.destroy();
    };
    req.once('aborted', onAbort);
    req.once('close', () => {
        if (!settled && req.errored) {
            onAbort();
        }
    });

    return settle;
}
