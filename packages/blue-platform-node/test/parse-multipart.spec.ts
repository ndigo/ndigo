/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, it, expect } from 'vitest';
import { Readable, PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import { mkdtempSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseMultipart } from '../src/parse-multipart';

/** Wrap a raw multipart body in an IncomingMessage with the matching Content-Type. */
function req(body: Buffer, boundary = '----blueTest'): IncomingMessage {
    const r = Readable.from([body]) as unknown as IncomingMessage;
    (r as unknown as { headers: Record<string, string> }).headers = {
        'content-type': `multipart/form-data; boundary=${boundary}`,
    };
    return r;
}

/** Wrap a raw multipart body in a controllable stream with the matching Content-Type. */
function reqStream(stream: NodeJS.ReadableStream, headers: Record<string, string>): IncomingMessage {
    const r = stream as unknown as IncomingMessage;
    (r as unknown as { headers: Record<string, string> }).headers = headers;
    return r;
}

/** Build a multipart body from named parts. A part with `filename` is a file part; otherwise a text field. */
function body(
    parts: Array<{ name: string; value?: string; filename?: string; contentType?: string }>,
    boundary = '----blueTest'
): Buffer {
    const chunks: string[] = [];
    for (const p of parts) {
        chunks.push(
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="${p.name}"${p.filename ? `; filename="${p.filename}"` : ''}\r\n`
        );
        if (p.contentType) chunks.push(`Content-Type: ${p.contentType}\r\n`);
        chunks.push('\r\n', p.value ?? '', '\r\n');
    }
    chunks.push(`--${boundary}--\r\n`);
    return Buffer.from(chunks.join(''));
}

/** Assert a parse promise rejects with a RequestLimitError carrying the given status + code. */
async function expectLimit(p: Promise<unknown>, statusCode: number, code: string): Promise<void> {
    await expect(p).rejects.toMatchObject({ statusCode, code });
}

describe('parseMultipart', () => {
    it('parses text fields and buffers a small file part in memory', async () => {
        const ctx = await parseMultipart(
            req(
                body([
                    { name: 'greeting', value: 'hi' },
                    { name: 'avatar', value: 'file-contents', filename: 'a.txt', contentType: 'text/plain' },
                ])
            ),
            {}
        );

        expect(ctx.fields).toEqual({ greeting: 'hi' });
        const avatar = ctx.files.get('avatar');
        expect(avatar?.length).toBe(1);
        const part = avatar?.[0];
        expect(part?.name).toBe('avatar');
        expect(part?.originalFilename).toBe('a.txt');
        expect(part?.size).toBe('file-contents'.length);
        expect(part?.isEmpty()).toBe(false);
        expect(Buffer.from(await part?.bytes()).toString()).toBe('file-contents');
    });

    it('streams a large part to a temp file above the threshold and cleans it up', async () => {
        const workDir = mkdtempSync(join(tmpdir(), 'blue-multipart-test-'));
        const big = 'z'.repeat(20_000);
        const ctx = await parseMultipart(req(body([{ name: 'blob', value: big, filename: 'blob.bin' }])), {
            limits: { fileThreshold: 1024, maxFileSize: 1_000_000, maxRequestSize: 1_000_000 },
            tmpDir: workDir,
        });

        const part = ctx.files.get('blob')?.[0];
        expect(part?.size).toBe(big.length);
        expect((await part?.bytes())?.length).toBe(big.length);
        // The spilled temp file survives to the caller (not deleted pre-read), then is removed on cleanup.
        expect(readdirSync(workDir)).toHaveLength(1);
        await ctx.cleanup();
        expect(readdirSync(workDir)).toHaveLength(0);
    });

    it('rejects a per-file overflow with 413 file_too_large', async () => {
        const big = 'x'.repeat(5_000);
        await expectLimit(
            parseMultipart(req(body([{ name: 'huge', value: big, filename: 'big.txt' }])), {
                limits: { maxFileSize: 1024 },
            }),
            413,
            'file_too_large'
        );
    });

    it('rejects a total request overflow with 413 request_too_large', async () => {
        const many = body([
            { name: 'a', value: 'y'.repeat(4_000), filename: 'a.txt' },
            { name: 'b', value: 'z'.repeat(4_000), filename: 'b.txt' },
        ]);
        await expectLimit(
            parseMultipart(req(many), { limits: { maxRequestSize: 5_000, maxFileSize: 1_000_000 } }),
            413,
            'request_too_large'
        );
    });

    it('rejects a non-multipart body with 400 missing_boundary', async () => {
        const r = Readable.from([Buffer.from('not multipart')]) as unknown as IncomingMessage;
        (r as unknown as { headers: Record<string, string> }).headers = { 'content-type': 'text/plain' };
        await expectLimit(parseMultipart(r), 400, 'missing_boundary');
    });

    it('never stores a filename that could escape the upload directory', async () => {
        // busboy strips path components to a basename; our guarantee is that the
        // stored originalFilename carries no separator and is never '.' / '..'.
        const results = await Promise.all(
            ['../../etc/passwd', '/abs/x.txt', 'a\\b.txt', '..', '.'].map(async (clientName) => {
                const ctx = await parseMultipart(req(body([{ name: 'f', value: 'v', filename: clientName }])), {});
                return ctx.files.get('f')?.[0]?.originalFilename ?? '';
            })
        );
        for (const stored of results) {
            expect(stored).not.toMatch(/[\\/]/);
            expect(['.', '..']).not.toContain(stored);
        }
    });

    it('does not touch the filesystem for a traversal filename', async () => {
        // Temp files are always named with a random suffix, never the client name.
        const workDir = mkdtempSync(join(tmpdir(), 'blue-multipart-test-'));
        const ctx = await parseMultipart(
            req(body([{ name: 'evil', value: 'pwned', filename: '../../../../../../etc/passwd' }])),
            { tmpDir: workDir }
        );
        expect(existsSync(join(workDir, 'etc'))).toBe(false);
        expect(existsSync(join(workDir, 'passwd'))).toBe(false);
        await ctx.cleanup();
    });

    it('accepts a boundary parameter name in any case (RFC 2045 §5.1)', async () => {
        const payload = body([{ name: 'greeting', value: 'hi' }]);
        const r = Readable.from([payload]) as unknown as IncomingMessage;
        (r as unknown as { headers: Record<string, string> }).headers = {
            'content-type': 'multipart/form-data; BOUNDARY=----blueTest',
        };
        const ctx = await parseMultipart(r, {});
        expect(ctx.fields).toEqual({ greeting: 'hi' });
    });

    it('rejects with 413 too_many_files when the files limit is exceeded', async () => {
        const many = body([
            { name: 'a', value: 'x', filename: 'a.txt' },
            { name: 'b', value: 'x', filename: 'b.txt' },
        ]);
        await expectLimit(
            parseMultipart(req(many), { limits: { maxFiles: 1, maxRequestSize: 1_000_000 } }),
            413,
            'too_many_files'
        );
    });

    it('rejects with 413 too_many_fields when the fields limit is exceeded', async () => {
        const many = body([
            { name: 'a', value: '1' },
            { name: 'b', value: '2' },
        ]);
        await expectLimit(parseMultipart(req(many), { limits: { maxFields: 1 } }), 413, 'too_many_fields');
    });

    it('rejects with 413 too_many_parts when the parts limit is exceeded', async () => {
        const many = body([
            { name: 'a', value: '1' },
            { name: 'b', value: '2' },
            { name: 'c', value: '3' },
        ]);
        await expectLimit(parseMultipart(req(many), { limits: { maxParts: 2 } }), 413, 'too_many_parts');
    });

    it('rejects a malformed boundary body with 400 malformed_multipart', async () => {
        // The declared boundary parses, but the payload is broken.
        const garbage = Buffer.from('--declared\\r\\nnot a real part\\r\\n--declared--\\r\\n');
        const r = Readable.from([garbage]) as unknown as IncomingMessage;
        (r as unknown as { headers: Record<string, string> }).headers = {
            'content-type': 'multipart/form-data; boundary=declared',
        };
        await expectLimit(parseMultipart(r, {}), 400, 'malformed_multipart');
    });

    it('rejects an over-cap text field with 413 field_too_large (SEC-9)', async () => {
        const many = body([{ name: 'meta', value: 'y'.repeat(64) }]);
        await expectLimit(parseMultipart(req(many), { limits: { maxFieldSize: 16 } }), 413, 'field_too_large');
    });

    it('rejects on Content-Length over the cap before consuming the body (SEC-5)', async () => {
        const many = body([{ name: 'a', value: 'y'.repeat(2_000), filename: 'a.txt' }]);
        const source = Readable.from([many]);
        let consumed = 0;
        source.on('data', () => {
            consumed += 1;
        });
        const r = reqStream(source, {
            'content-type': 'multipart/form-data; boundary=----blueTest',
            'content-length': String(many.length + 10_000),
        });
        await expectLimit(parseMultipart(r, { limits: { maxRequestSize: 1_000 } }), 413, 'request_too_large');
        expect(consumed).toBe(0);
    });

    it('stops streaming at the request cap without draining to EOF (SEC-5)', async () => {
        const source = new PassThrough();
        const r = reqStream(source, {
            'content-type': 'multipart/form-data; boundary=----blueTest',
        });
        const promise = parseMultipart(r, { limits: { maxRequestSize: 1_000, fileThreshold: 64 } });
        source.end(body([{ name: 'a', value: 'y'.repeat(4_000), filename: 'a.txt' }]));
        await expectLimit(promise, 413, 'request_too_large');
    });
});
