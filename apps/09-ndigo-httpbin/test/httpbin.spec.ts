// @vitest-environment node
import { deflateSync, gunzipSync, inflateSync, gzipSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { HTTPBinConfiguration } from '../src/httpbin-configuration';

/** Echo payload shape asserted field by field, not by whole-object equality. */
interface EchoPayload {
    method: string;
    path: string;
    url: string;
    args: Record<string, unknown>;
    headers: Record<string, string | string[]>;
    data: string;
    json: unknown;
    form: unknown;
    origin: string | null;
    files: Record<string, { filename: string; size: number }>;
}

const BOUNDARY = '----NdigoHttpbinTestBoundary';

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

describe('ndigo-httpbin', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootApp([HTTPBinConfiguration]);
        http = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    test('POST /anything echoes method, path, url, args and a JSON body', async () => {
        const res = await http.post('/anything').query({ a: '1', b: 'two' }).body({ hello: 'world' }).exec();

        expect(res.response.status).toBe(200);
        const payload = res.json() as EchoPayload;
        expect(payload.method).toBe('POST');
        expect(payload.path).toBe('/anything');
        expect(payload.url).toContain('/anything?a=1&b=two');
        expect(payload.args).toEqual({ a: '1', b: 'two' });
        expect(payload.headers['content-type']).toContain('application/json');
        expect(payload.json).toEqual({ hello: 'world' });
        expect(payload.form).toBeNull();
        expect(typeof payload.origin).toBe('string');
    });

    test('GET /anything/{*rest} matches any sub-path and echoes it', async () => {
        const res = await http.get('/anything/deep/sub/path').exec();

        expect(res.response.status).toBe(200);
        const payload = res.json() as EchoPayload;
        expect(payload.method).toBe('GET');
        expect(payload.path).toBe('/anything/deep/sub/path');
    });

    test('POST /post binds an urlencoded form body', async () => {
        const res = await http
            .post('/post')
            .rawBody('name=ada&lang=en')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .exec();

        expect(res.response.status).toBe(200);
        const payload = res.json() as EchoPayload;
        expect(payload.form).toEqual({ name: 'ada', lang: 'en' });
        expect(payload.data).toBe('name=ada&lang=en');
    });

    test('POST /post reports multipart file names and sizes', async () => {
        const content = 'Hello, multipart world!';
        const body = multipartBody([
            { name: 'file', filename: 'hello.txt', contentType: 'text/plain', value: content },
            { name: 'note', value: 'from the test' },
        ]);

        const res = await http
            .post('/post')
            .rawBody(body)
            .headers({ 'content-type': `multipart/form-data; boundary=${BOUNDARY}` })
            .exec();

        expect(res.response.status).toBe(200);
        const payload = res.json() as EchoPayload;
        expect(payload.files.file).toEqual({ filename: 'hello.txt', size: Buffer.byteLength(content) });
        expect(payload.form).toMatchObject({ note: 'from the test' });
    });

    test('GET /get echoes the query and headers', async () => {
        const res = await http.get('/get').query({ q: 'search' }).headers({ 'x-test': 'hello' }).exec();

        expect(res.response.status).toBe(200);
        const payload = res.json() as EchoPayload;
        expect(payload.args).toEqual({ q: 'search' });
        expect(payload.headers['x-test']).toBe('hello');
    });

    test('GET /ip echoes the client origin', async () => {
        const res = await http.get('/ip').remoteAddress('198.51.100.5').exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ origin: '198.51.100.5' });
    });

    test('GET /status/{code} returns the requested status', async () => {
        const res = await http.get('/status/418').exec();
        expect(res.response.status).toBe(418);

        const ok = await http.get('/status/200').exec();
        expect(ok.response.status).toBe(200);

        const bad = await http.get('/status/9999').exec();
        expect(bad.response.status).toBe(400);
    });

    test('GET /status/ defaults to 200', async () => {
        const res = await http.get('/status/').exec();
        expect(res.response.status).toBe(200);
    });

    test('GET /redirect/{n} chains 302s down to /get', async () => {
        const first = await http.get('/redirect/2').exec();
        expect(first.response.status).toBe(302);
        expect(first.response.headers['location']).toBe('/redirect/1');

        const second = await http.get('/redirect/1').exec();
        expect(second.response.status).toBe(302);
        expect(second.response.headers['location']).toBe('/get');
    });

    test('GET /redirect-to and /relative-redirect emit 302 + Location', async () => {
        const to = await http.get('/redirect-to').query({ url: '/get' }).exec();
        expect(to.response.status).toBe(302);
        expect(to.response.headers['location']).toBe('/get');

        const relative = await http.get('/relative-redirect/1').exec();
        expect(relative.response.status).toBe(302);
        expect(relative.response.headers['location']).toBe('/get');
    });

    test('GET /response-headers sets the query pairs as headers and echoes them', async () => {
        const res = await http.get('/response-headers').query({ 'X-Test': 'hello', 'X-Count': '2' }).exec();

        expect(res.response.status).toBe(200);
        expect(res.response.headers['x-test']).toBe('hello');
        expect(res.response.headers['x-count']).toBe('2');
        expect(res.json()).toEqual({ 'X-Test': 'hello', 'X-Count': '2' });
    });

    test('cookies round-trip through set, read and delete', async () => {
        const set = await http.get('/cookies/set').query({ foo: 'bar' }).exec();
        expect(set.response.status).toBe(302);
        expect(set.response.headers['location']).toBe('/cookies');
        expect(String(set.response.headers['set-cookie'])).toContain('foo=bar');

        const read = await http.get('/cookies').cookies({ foo: 'bar' }).exec();
        expect(read.json()).toEqual({ cookies: { foo: 'bar' } });

        const del = await http.get('/cookies/delete').query({ foo: '' }).exec();
        expect(del.response.status).toBe(302);
        expect(String(del.response.headers['set-cookie'])).toContain('Max-Age=0');
    });

    test('GET /basic-auth rejects wrong credentials and accepts right ones', async () => {
        const denied = await http.get('/basic-auth/me/secret').exec();
        expect(denied.response.status).toBe(401);
        expect(String(denied.response.headers['www-authenticate'])).toContain('Basic');

        const authorization = `Basic ${Buffer.from('me:secret').toString('base64')}`;
        const granted = await http.get('/basic-auth/me/secret').headers({ authorization }).exec();
        expect(granted.response.status).toBe(200);
        expect(granted.json()).toEqual({ authenticated: true, user: 'me' });
    });

    test('GET /bearer requires a bearer token', async () => {
        const denied = await http.get('/bearer').exec();
        expect(denied.response.status).toBe(401);
        expect(String(denied.response.headers['www-authenticate'])).toContain('Bearer');

        const granted = await http.get('/bearer').headers({ authorization: 'Bearer abc.def' }).exec();
        expect(granted.json()).toEqual({ authenticated: true, token: 'abc.def' });
    });

    test('GET /bytes/{n} returns n deterministic bytes', async () => {
        const res = await http.get('/bytes/16').exec();

        expect(res.response.status).toBe(200);
        expect(String(res.response.headers['content-type'])).toContain('application/octet-stream');
        const first = res.response.body as Buffer;
        expect(Buffer.isBuffer(first)).toBe(true);
        expect(first.length).toBe(16);

        const again = await http.get('/bytes/16').exec();
        expect(Buffer.compare(first, again.response.body as Buffer)).toBe(0);
    });

    test('GET /stream/{n} returns n JSON lines', async () => {
        const res = await http.get('/stream/3').exec();

        expect(res.response.status).toBe(200);
        const lines = res.text().trim().split('\n');
        expect(lines).toHaveLength(3);
        expect(JSON.parse(lines[0])).toMatchObject({ id: 0 });
    });

    test('GET /gzip negotiates a compressed body', async () => {
        const plain = await http.get('/gzip').exec();
        expect(plain.response.headers['content-encoding']).toBeUndefined();
        expect(plain.json()).toMatchObject({ encoding: 'gzip' });

        const res = await http.get('/gzip').headers({ 'accept-encoding': 'gzip' }).exec();
        expect(res.response.headers['content-encoding']).toBe('gzip');
        const decoded = JSON.parse(gunzipSync(res.response.body as Buffer).toString('utf-8'));
        expect(decoded).toMatchObject({ encoding: 'gzip' });
    });

    test('GET /deflate negotiates a compressed body', async () => {
        const res = await http.get('/deflate').headers({ 'accept-encoding': 'deflate' }).exec();

        expect(res.response.headers['content-encoding']).toBe('deflate');
        const decoded = JSON.parse(inflateSync(res.response.body as Buffer).toString('utf-8'));
        expect(decoded).toMatchObject({ encoding: 'deflate' });
    });

    test('GET /uuid, /json, /html, /xml and /robots.txt serve their content', async () => {
        const uuid = await http.get('/uuid').exec();
        const uuidPayload = uuid.json() as { uuid: string };
        expect(uuidPayload.uuid).toMatch(/^[0-9a-f-]{36}$/);

        expect((await http.get('/json').exec()).json()).toMatchObject({ slideshow: { title: 'Sample Slide Show' } });

        const html = await http.get('/html').exec();
        expect(String(html.response.headers['content-type'])).toContain('text/html');
        expect(html.text()).toContain('<html');

        const xml = await http.get('/xml').exec();
        expect(String(xml.response.headers['content-type'])).toContain('application/xml');
        expect(xml.text()).toContain('<slideshow');

        const robots = await http.get('/robots.txt').exec();
        expect(String(robots.response.headers['content-type'])).toContain('text/plain');
        expect(robots.text()).toContain('User-agent');
    });

    test('matrix parameters bind and a plain path falls back', async () => {
        const withMatrix = await http.get('/matrix/42;color=red').exec();
        expect(withMatrix.response.status).toBe(200);
        expect(withMatrix.json()).toEqual({ id: '42', color: 'red' });

        const plain = await http.get('/matrix/42').exec();
        expect(plain.json()).toEqual({ id: '42', color: null });
    });

    test('GET /limit enforces 3 requests per client and denies with 429 + Retry-After', async () => {
        const peer = '203.0.113.7';
        for (let i = 0; i < 3; i++) {
            // eslint-disable-next-line no-await-in-loop -- the requests are the rate-window stimulus; they must be sequential.
            const ok = await http.get('/limit').remoteAddress(peer).exec();
            expect(ok.response.status).toBe(200);
        }
        const denied = await http.get('/limit').remoteAddress(peer).exec();
        expect(denied.response.status).toBe(429);
        expect(denied.response.headers['retry-after']).toBeDefined();

        // A different client keeps its own budget.
        const other = await http.get('/limit').remoteAddress('203.0.113.8').exec();
        expect(other.response.status).toBe(200);
    });

    test('an unmatched path is a problem+json 404 and a wrong method is 405', async () => {
        const missing = await http.get('/nope').exec();
        expect(missing.response.status).toBe(404);
        expect(missing.json()).toMatchObject({ status: 404 });

        const wrongMethod = await http.post('/get').exec();
        expect(wrongMethod.response.status).toBe(405);
        expect(String(wrongMethod.response.headers['allow'])).toContain('GET');
    });

    test('the gzip/deflate helpers round-trip (self-check)', () => {
        const payload = Buffer.from('ndigo-httpbin');
        expect(gunzipSync(gzipSync(payload)).toString('utf-8')).toBe('ndigo-httpbin');
        expect(inflateSync(deflateSync(payload)).toString('utf-8')).toBe('ndigo-httpbin');
    });
});
