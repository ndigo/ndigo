/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

import base64PDF from './dummy.pdf';
import base64GIF from './pixel.gif';
import base64JPG from './pixel.jpg';
import base64PNG from './pixel.png';

export const lastModified = new Date(2020, 0, 1, 0, 0, 0, 0).toUTCString().replace(', ', ',');

export const eTag = '33a64df551425fcc55e4d42a148795d9f25f89d4';

const handlers = [
    http.get('http://localhost/contentType', async ({ request }) => {
        const contentType = request.headers.get('Content-Type') || 'text/plain';
        switch (contentType) {
            case 'application/json':
            case 'text/json':
                return HttpResponse.json({ foo: 123 });
            case 'text/html':
                return HttpResponse.text('<div id="foo">123</div>', {
                    headers: { 'Content-Type': 'text/html' },
                });
            default:
                return HttpResponse.text('foo=123');
        }
    }),
    http.get('http://localhost/responseClass/:code', async ({ params }) => {
        const code = Number(params.code);
        return HttpResponse.text(null, { status: code });
    }),
    http.get('http://localhost/responseType/:type/:subtype', async ({ params }) => {
        const { type, subtype } = params;
        const mediaType = `${type}/${subtype}`;
        let data: string;
        let buffer: ArrayBuffer;
        let length: string;

        switch (mediaType) {
            case 'application/pdf':
                buffer = await (await fetch(base64PDF)).arrayBuffer();
                length = buffer.byteLength.toString();
                return HttpResponse.arrayBuffer(buffer, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                }) as unknown as HttpResponse<string>;
            case 'image/gif':
                buffer = await (await fetch(base64GIF)).arrayBuffer();
                length = buffer.byteLength.toString();
                return HttpResponse.arrayBuffer(buffer, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                }) as unknown as HttpResponse<string>;
            case 'image/jpg':
                buffer = await (await fetch(base64JPG)).arrayBuffer();
                length = buffer.byteLength.toString();
                return HttpResponse.arrayBuffer(buffer, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                }) as unknown as HttpResponse<string>;
            case 'image/png':
                buffer = await (await fetch(base64PNG)).arrayBuffer();
                length = buffer.byteLength.toString();
                return HttpResponse.arrayBuffer(buffer, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                }) as unknown as HttpResponse<string>;
            case 'text/html':
                data = '<div id="foo">123</div>';
                length = data.length.toString();
                return HttpResponse.text(data, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                });
            case 'text/xml':
                data = '<div id="foo">123</div>';
                length = data.length.toString();
                return HttpResponse.text(data, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                });
            case 'text/foo':
                data = 'foo=123';
                length = data.length.toString();
                return HttpResponse.text(data, {
                    headers: {
                        'Content-Length': length,
                        'Content-Type': mediaType,
                    },
                });
            default:
                return HttpResponse.text('', {
                    headers: {
                        'Content-Length': '0',
                        'Content-Type': mediaType,
                    },
                });
        }
    }),
    http.get('http://localhost/ifModified', () =>
        HttpResponse.json(
            { foo: 123 },
            {
                headers: {
                    'Last-Modified': lastModified,
                    ETag: eTag,
                },
            }
        )
    ),
    http.get('http://localhost/notOK', () => HttpResponse.text('foo=123', { status: 404 })),
    http.get('http://localhost/request', () => HttpResponse.text('foo=123')),
    http.get('http://localhost/timeout/:duration', async ({ params }) => {
        const duration = Number(params.duration);
        await delay(duration);
        return HttpResponse.text(null);
    }),
    http.get('http://localhost/dataParameter', async () => HttpResponse.text(null)),
    http.post('http://localhost/dataParameter', async () => HttpResponse.text(null)),
    http.get('http://localhost/api/v1/users', async () => HttpResponse.text('users-v1')),
    http.get('http://localhost/api/users', async () => HttpResponse.text('users')),
    http.get('http://other.com/request', async () => HttpResponse.text('other-request')),
    http.get('http://localhost:3000/request', async () => HttpResponse.text('request-3000')),
    // Retry interceptor test handlers
    http.get('http://localhost/retry/success-after-1', () => {
        return HttpResponse.text('success');
    }),
    http.get('http://localhost/retry/always-fails', () => {
        return HttpResponse.text('failed', { status: 503 });
    }),
    http.get('http://localhost/retry/fail-404', () => {
        return HttpResponse.text('failed', { status: 404 });
    }),
    // AppReset interceptor test handlers
    http.get('http://localhost/app-reset/normal', () => {
        return HttpResponse.text('normal');
    }),
    http.get('http://localhost/app-reset/205', () => {
        return HttpResponse.text('reset', {
            status: 205,
            headers: { 'Alt-Location': '/reset' },
        });
    }),
];

export const server = setupServer(...handlers);
