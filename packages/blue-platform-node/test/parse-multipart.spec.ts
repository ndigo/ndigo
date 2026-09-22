/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, it, expect } from 'vitest';
import { Readable } from 'node:stream';
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
});
