/**
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { initAuth } from '../src/auth-store';

/**
 * End-to-end multipart upload (AD-26 Wave 4): a real `multipart/form-data`
 * body is streamed through the harness into the pipeline, parsed by busboy,
 * bound to `@file() file: MultipartFile`, and persisted — the response echoes
 * back the reported byte size and client-supplied filename.
 */

const BOUNDARY = '----NdigoUploadTestBoundary';

/** Build a `multipart/form-data` body from named parts (RFC 7578). */
function multipartBody(parts: Array<{ name: string; filename?: string; contentType?: string; value: string }>): Buffer {
    const chunks: string[] = [];
    for (const part of parts) {
        let disposition = `Content-Disposition: form-data; name="${part.name}"`;
        if (part.filename) {
            disposition += `; filename="${part.filename}"`;
        }
        chunks.push(`--${BOUNDARY}`);
        chunks.push(disposition);
        if (part.contentType) {
            chunks.push(`Content-Type: ${part.contentType}`);
        }
        chunks.push('');
        chunks.push(part.value);
    }
    chunks.push(`--${BOUNDARY}--`);
    return Buffer.from(chunks.join('\r\n') + '\r\n', 'utf-8');
}

describe('ndigo-api multipart upload (AD-26)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        initAuth();
        const app = bootApp([ManagementAutoConfiguration, NodeAppConfiguration]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('POST /api/upload round-trips a file: bytes parse to the reported size and name', async () => {
        const content = 'Hello, multipart world!'; // 24 bytes
        const body = multipartBody([
            { name: 'file', filename: 'hello.txt', contentType: 'text/plain', value: content },
        ]);

        const res = await mockHTTP
            .post('/api/upload')
            .rawBody(body)
            .headers({ 'content-type': `multipart/form-data; boundary=${BOUNDARY}` })
            .exec();

        expect(res.response.status).toBe(200);
        // size is the exact byte count busboy parsed — proves the bytes flowed
        // through the real parser, not a mock; name is the inferred client field.
        expect(res.json()).toEqual({ size: Buffer.byteLength(content), name: 'hello.txt', meta: null });
    });

    test('POST /api/upload binds a JSON part to the DTO and the file part to MultipartFile', async () => {
        const content = 'meta round trip';
        const body = multipartBody([
            {
                name: 'meta',
                contentType: 'application/json',
                value: JSON.stringify({ label: 'ndigo-demo', tags: ['a', 'b'] }),
            },
            { name: 'file', filename: 'meta.txt', contentType: 'text/plain', value: content },
        ]);

        const res = await mockHTTP
            .post('/api/upload')
            .rawBody(body)
            .headers({ 'content-type': `multipart/form-data; boundary=${BOUNDARY}` })
            .exec();

        expect(res.response.status).toBe(200);
        // The JSON part bound into the requestPart() DTO; the file part into
        // MultipartFile — Spring @RequestPart parity, end to end.
        expect(res.json()).toEqual({
            size: Buffer.byteLength(content),
            name: 'meta.txt',
            meta: { label: 'ndigo-demo', tags: ['a', 'b'] },
        });
    });

    test('POST /api/upload rejects an empty file part with 400', async () => {
        const body = multipartBody([{ name: 'file', filename: 'empty.txt', contentType: 'text/plain', value: '' }]);

        const res = await mockHTTP
            .post('/api/upload')
            .rawBody(body)
            .headers({ 'content-type': `multipart/form-data; boundary=${BOUNDARY}` })
            .exec();

        expect(res.response.status).toBe(400);
    });
});
