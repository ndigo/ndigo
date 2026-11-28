/**
 * File-part collection for the multipart parser: buffering, spill-to-disk,
 * and abort handling.
 */
import type { Readable } from 'node:stream';
import { createWriteStream } from 'node:fs';
import type { WriteStream } from 'node:fs';
import { join } from 'node:path';
import { randomHex } from '@ndigo/util';
import { ProblemTypes, ResponseStatuses } from '@ndigo/http';
import { RequestLimitError } from './http-request-limits.js';
import { NodeMultipartContext, NodeMultipartFile, type Backing, type MultipartFile } from './multipart-file.js';
import type { ResolvedMultipartLimits } from './_multipart-limits.js';

/**
 * Consume one file part, buffering it in memory until it exceeds the spill
 * threshold, then streaming the remainder to a temp file. Resolves with the
 * finished {@link MultipartFile}; the parser discards it if an abort fired.
 */
export function collectFile(
    context: NodeMultipartContext,
    name: string,
    tmpDir: string,
    stream: Readable & { truncated?: boolean },
    info: { filename: string; mimeType: string },
    limits: ResolvedMultipartLimits,
    onData: () => void,
    onOverLimit: () => void
): Promise<MultipartFile> {
    return new Promise<MultipartFile>((resolve, reject) => {
        let mode: 'buffer' | 'temp' = 'buffer';
        const chunks: Buffer[] = [];
        let size = 0;
        let ws: WriteStream | null = null;
        let tempPath: string | null = null;
        let settled = false;
        let ended = false;

        const done = (backing: Backing): void => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(new NodeMultipartFile(name, info.filename, info.mimeType, backing));
        };
        // A part stream destroyed mid-upload (client abort, parser
        // teardown, overflow) never emits 'end' — release the spill target's
        // file descriptor immediately so it cannot leak.
        const closeSpill = (): void => {
            if (ws) {
                ws.destroy();
                ws = null;
            }
        };

        stream.on('data', (chunk: Buffer) => {
            size += chunk.length;
            onData();
            if (stream.truncated || size > limits.maxFileSize) {
                // Over the per-file cap: abort, keep draining, stop storing.
                onOverLimit();
                return;
            }
            if (mode === 'buffer') {
                chunks.push(chunk);
                // PL-2: a threshold of 0 means "force disk for every part" —
                // `size > 0` spills on the first byte.
                if (size > limits.fileThreshold) {
                    tempPath = join(tmpDir, `ndigo-upload-${randomHex(8)}`);
                    context.trackTemp(tempPath);
                    ws = createWriteStream(tempPath);
                    for (const buffered of chunks) {
                        ws.write(buffered);
                    }
                    chunks.length = 0;
                    mode = 'temp';
                }
            } else if (ws) {
                ws.write(chunk);
            }
        });
        stream.on('end', () => {
            ended = true;
            if (mode === 'buffer') {
                done({ kind: 'buffer', data: Buffer.concat(chunks) });
            } else if (ws) {
                ws.once('finish', () => done({ kind: 'temp', path: tempPath as string, size }));
                ws.end();
            } else {
                done({ kind: 'temp', path: tempPath as string, size });
            }
        });
        stream.on('error', (error) => {
            closeSpill();
            if (!settled) {
                reject(error);
            }
        });
        stream.on('close', () => {
            if (settled || ended) {
                // 'end' already ran — normal completion (the temp file's
                // async 'finish' may still be landing); nothing to abort.
                return;
            }
            // Destroyed before 'end' (abort/teardown): settle the part as an
            // abort so the pending bookkeeping clears; the parser-level
            // cleanup unlinks the temp file.
            closeSpill();
            reject(
                new RequestLimitError(
                    ResponseStatuses.BAD_REQUEST,
                    ProblemTypes.requestAborted,
                    'Request aborted before completion'
                )
            );
        });
    });
}
