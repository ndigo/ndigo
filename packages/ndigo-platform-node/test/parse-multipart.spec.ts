/**
 */

import { describe, it, expect, vi } from 'vitest';
import { Readable, PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import { mkdtempSync, readdirSync, existsSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseMultipart, type MultipartLimits } from '../src/parse-multipart';

/** Wrap a raw multipart body in an IncomingMessage with the matching Content-Type. */
function req(body: Buffer, boundary = '----ndigoTest'): IncomingMessage {
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
    boundary = '----ndigoTest'
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
        expect(Buffer.from(await (part as NonNullable<typeof part>).bytes()).toString()).toBe('file-contents');
    });

    it('streams a large part to a temp file above the threshold and cleans it up', async () => {
        const workDir = mkdtempSync(join(tmpdir(), 'ndigo-multipart-test-'));
        const big = 'z'.repeat(20_000);
        const ctx = await parseMultipart(req(body([{ name: 'blob', value: big, filename: 'blob.bin' }])), {
            limits: { fileThreshold: 1024, maxFileSize: 1_000_000, maxRequestSize: 1_000_000 },
            tmpDir: workDir,
        });

        const part = ctx.files.get('blob')?.[0];
        expect(part?.size).toBe(big.length);
        expect((await part?.bytes())?.length).toBe(big.length);
        // The spilled temp file survives to the caller (not deleted pre-read), then is removed on cleanup.
        const tempFiles = readdirSync(workDir);
        expect(tempFiles).toHaveLength(1);
        // HG-8: temp names use @ndigo/util's crypto randomHex(8) — 16 hex chars, never the client filename.
        expect(tempFiles[0]).toMatch(/^ndigo-upload-[0-9a-f]{16}$/);
        await ctx.cleanup();
        expect(readdirSync(workDir)).toHaveLength(0);
    });

    it('forces a small part to disk when fileThreshold is 0 (PL-2)', async () => {
        const workDir = mkdtempSync(join(tmpdir(), 'ndigo-multipart-test-'));
        const ctx = await parseMultipart(req(body([{ name: 'tiny', value: 'hello world', filename: 'tiny.txt' }])), {
            limits: { fileThreshold: 0, maxFileSize: 1_000_000, maxRequestSize: 1_000_000 },
            tmpDir: workDir,
        });

        const part = ctx.files.get('tiny')?.[0];
        expect(part?.size).toBe('hello world'.length);
        expect(Buffer.from((await part?.bytes()) as Uint8Array).toString()).toBe('hello world');
        // An 11-byte part spills to a temp file despite being far below the default threshold.
        expect(readdirSync(workDir)).toHaveLength(1);
        await ctx.cleanup();
        expect(readdirSync(workDir)).toHaveLength(0);
    });

    it('rejects negative and non-finite limits with a descriptive RangeError (PL-2)', async () => {
        const cases: Array<[Partial<MultipartLimits>, string]> = [
            [{ fileThreshold: -1 }, 'MultipartLimits.fileThreshold must be a non-negative finite number, received -1'],
            [
                { fileThreshold: Number.NaN },
                'MultipartLimits.fileThreshold must be a non-negative finite number, received NaN',
            ],
            [
                { maxFileSize: Number.POSITIVE_INFINITY },
                'MultipartLimits.maxFileSize must be a non-negative finite number, received Infinity',
            ],
            [
                { maxRequestSize: -1 },
                'MultipartLimits.maxRequestSize must be a non-negative finite number, received -1',
            ],
        ];
        await Promise.all(
            cases.map(async ([limits, message]) => {
                await expect(parseMultipart(req(body([])), { limits })).rejects.toThrow(message);
            })
        );
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
        const workDir = mkdtempSync(join(tmpdir(), 'ndigo-multipart-test-'));
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
            'content-type': 'multipart/form-data; BOUNDARY=----ndigoTest',
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
            'content-type': 'multipart/form-data; boundary=----ndigoTest',
            'content-length': String(many.length + 10_000),
        });
        await expectLimit(parseMultipart(r, { limits: { maxRequestSize: 1_000 } }), 413, 'request_too_large');
        expect(consumed).toBe(0);
    });

    it('stops streaming at the request cap without draining to EOF (SEC-5)', async () => {
        const source = new PassThrough();
        const r = reqStream(source, {
            'content-type': 'multipart/form-data; boundary=----ndigoTest',
        });
        const promise = parseMultipart(r, { limits: { maxRequestSize: 1_000, fileThreshold: 64 } });
        source.end(body([{ name: 'a', value: 'y'.repeat(4_000), filename: 'a.txt' }]));
        await expectLimit(promise, 413, 'request_too_large');
    });

    it('a text field named __proto__ is an ordinary key on the null-prototype fields record (SEC-1)', async () => {
        const ctx = await parseMultipart(req(body([{ name: '__proto__', value: 'x' }])), {});
        expect(Object.getPrototypeOf(ctx.fields)).toBeNull();
        expect(Object.hasOwn(ctx.fields, '__proto__')).toBe(true);
        expect(ctx.fields['__proto__']).toBe('x');
    });

    it('counts every request byte exactly once — 0.75×cap uploads succeed, over-cap ones fail (COR-15)', async () => {
        const cap = 100_000;
        const workDir = mkdtempSync(join(tmpdir(), 'ndigo-multipart-test-'));
        // An all-file upload at 0.75×cap: the old double-counting gate + file
        // chunks summed ~1.5×cap and rejected mid-stream. With one counter
        // every body byte is seen exactly once.
        const fits = body([{ name: 'blob', value: 'f'.repeat(Math.floor(cap * 0.75)), filename: 'f.bin' }]);
        const ok = await parseMultipart(req(fits), {
            limits: { maxRequestSize: cap, maxFileSize: 1_000_000, fileThreshold: 64 },
            tmpDir: workDir,
        });
        expect(ok.files.get('blob')).toHaveLength(1);
        await ok.cleanup();

        const overflow = body([{ name: 'blob', value: 'f'.repeat(cap + 100), filename: 'f.bin' }]);
        await expectLimit(
            parseMultipart(req(overflow), {
                limits: { maxRequestSize: cap, maxFileSize: 1_000_000, fileThreshold: 64 },
                tmpDir: workDir,
            }),
            413,
            'request_too_large'
        );
    });

    it('cleans up temp spill files when the client aborts mid-upload (COR-16)', async () => {
        const workDir = mkdtempSync(join(tmpdir(), 'ndigo-multipart-test-'));
        const source = new PassThrough();
        const r = reqStream(source, { 'content-type': 'multipart/form-data; boundary=----ndigoTest' });
        const promise = parseMultipart(r, {
            limits: { fileThreshold: 1024, maxFileSize: 1_000_000, maxRequestSize: 1_000_000 },
            tmpDir: workDir,
        });

        // Start a file part (delimiter = `--` + boundary → 6 dashes) and spill it
        // over the 1 KiB threshold.
        source.write(
            Buffer.from('------ndigoTest\r\nContent-Disposition: form-data; name="blob"; filename="b.bin"\r\n\r\n')
        );
        source.write(Buffer.from('y'.repeat(20_000)));
        await vi.waitFor(() => expect(readdirSync(workDir)).toHaveLength(1));
        const spilled = join(workDir, readdirSync(workDir)[0]);

        // The client aborts before the closing boundary ever arrives.
        r.emit('aborted');

        await expectLimit(promise, 400, 'request_aborted');
        // The parser settles and its 'close' handler unlinks the temp file
        // (the rejection lands as soon as the abort fires; the async busboy
        // 'close' cleanup completes right behind it).
        await vi.waitFor(() => expect(readdirSync(workDir)).toHaveLength(0));
        // …and the spill WriteStream's fd is released (POSIX).
        const openFdsFor = (path: string): string[] => {
            try {
                return readdirSync('/proc/self/fd')
                    .map((fd) => readlinkSync(join('/proc/self/fd', fd)))
                    .filter((target) => target.startsWith(path));
            } catch {
                return []; // non-Linux: skip the fd half of the assertion
            }
        };
        expect(openFdsFor(spilled)).toEqual([]);
    });
});
