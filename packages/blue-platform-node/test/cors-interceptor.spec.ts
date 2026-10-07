/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { ServerResponse } from 'node:http';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, RadixMetadataHandlerMapping, requestMapping, type ModelAndView } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { CORSInterceptor } from '../src/cors-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from '../src/node-request';

/**
 * Server-side CORS enforcement over a real socket: preflight short-circuit,
 * allow header attachment, origin allowlisting (disallowed origins get no
 * CORS headers, so the browser blocks), credentials + wildcard rejection at
 * construction, and `Vary: Origin` for shared caches.
 */

@requestMapping('/api')
class APIController {
    @getMapping('/quote')
    quote() {
        return { price: 42 };
    }
}

const DISALLOWED_ORIGIN = 'https://attacker.example';

async function boot(options: ConstructorParameters<typeof CORSInterceptor>[0]): Promise<{
    base: string;
    dispatcher: NodeDispatcher;
    adapter: NodeHTTPServerAdapter;
    close: () => Promise<void>;
}> {
    const context = new MetadataConfigApplicationContext('cors');
    context.register(NodeAutoConfiguration);
    context.setValue(APIController.name, new APIController());
    context.refresh(); // auto-initializes the handler mapping + dispatcher
    const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

    // Attach the CORS interceptor to every dispatch (the documented wiring:
    // push onto the handler mapping's interceptor list).
    handlerMapping.interceptors.push(new CORSInterceptor(options));

    const adapter = new NodeHTTPServerAdapter(dispatcher);
    await adapter.listen(0, '127.0.0.1');
    const base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
    return {
        base,
        dispatcher,
        adapter,
        close: () => adapter.close(),
    };
}

describe('CORSInterceptor (server side)', () => {
    test('rejects wildcard origins combined with credentials at construction', () => {
        expect(() => new CORSInterceptor({ allowedOrigins: ['*'], allowCredentials: true })).toThrow(TypeError);
    });

    test('echoes the allow-origin and Vary for an allowed origin', async () => {
        const { base, close } = await boot({ allowedOrigins: ['https://app.example.com'] });
        try {
            const res = await fetch(`${base}/api/quote`, { headers: { Origin: 'https://app.example.com' } });
            expect(res.status).toBe(200);
            expect(res.headers.get('access-control-allow-origin')).toBe('https://app.example.com');
            expect(res.headers.get('vary')).toBe('Origin');
        } finally {
            await close();
        }
    });

    test('returns a wildcard allow-origin when allowed and no credentials', async () => {
        const { base, close } = await boot({ allowedOrigins: ['*'] });
        try {
            const res = await fetch(`${base}/api/quote`, { headers: { Origin: 'https://any.example.com' } });
            expect(res.headers.get('access-control-allow-origin')).toBe('*');
            expect(res.headers.get('access-control-allow-credentials')).toBeNull();
        } finally {
            await close();
        }
    });

    test('disallowed origin receives no CORS headers (browser enforces block)', async () => {
        const { base, close } = await boot({ allowedOrigins: ['https://app.example.com'] });
        try {
            const res = await fetch(`${base}/api/quote`, { headers: { Origin: DISALLOWED_ORIGIN } });
            expect(res.status).toBe(200); // server processes the request
            expect(res.headers.get('access-control-allow-origin')).toBeNull();
        } finally {
            await close();
        }
    });

    test('same-origin request (no Origin header) is unaffected', async () => {
        const { base, close } = await boot({ allowedOrigins: [] });
        try {
            const res = await fetch(`${base}/api/quote`);
            expect(res.status).toBe(200);
            expect(res.headers.get('access-control-allow-origin')).toBeNull();
        } finally {
            await close();
        }
    });

    test('preflight OPTIONS short-circuits with 204 and allow headers', async () => {
        const { base, close } = await boot({
            allowedOrigins: ['https://app.example.com'],
            allowedMethods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'X-Custom'],
            maxAgeSeconds: 600,
        });
        try {
            const res = await fetch(`${base}/api/quote`, {
                method: 'OPTIONS',
                headers: {
                    Origin: 'https://app.example.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'content-type',
                },
            });
            expect(res.status).toBe(204);
            expect(res.headers.get('access-control-allow-methods')).toBe('GET, POST');
            expect(res.headers.get('access-control-allow-headers')).toBe('Content-Type, X-Custom');
            expect(res.headers.get('access-control-max-age')).toBe('600');
            expect(res.headers.get('access-control-allow-origin')).toBe('https://app.example.com');
        } finally {
            await close();
        }
    });

    test('credentials mode attaches allow-credentials: true', async () => {
        const { base, close } = await boot({
            allowedOrigins: ['https://app.example.com'],
            allowCredentials: true,
        });
        try {
            const res = await fetch(`${base}/api/quote`, {
                headers: { Origin: 'https://app.example.com' },
            });
            expect(res.headers.get('access-control-allow-origin')).toBe('https://app.example.com');
            expect(res.headers.get('access-control-allow-credentials')).toBe('true');
        } finally {
            await close();
        }
    });

    test('extends an existing Vary header instead of overwriting it (PLN-F8)', async () => {
        const headers = new Map<string, string | string[]>();
        const res = {
            headersSent: false,
            getHeader: (name: string) => headers.get(name.toLowerCase()),
            setHeader: (name: string, value: string | string[]) => {
                headers.set(name.toLowerCase(), value);
            },
        } as unknown as ServerResponse;
        const route = {
            method: 'GET',
            path: '/api/quote',
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: { headers: { origin: 'https://app.example.com' } },
                [NODE_RESPONSE_ATTRIBUTE]: res,
            },
        } as unknown as Route;

        const interceptor = new CORSInterceptor({ allowedOrigins: ['https://app.example.com'] });
        await interceptor.preHandle(route, undefined);
        expect(headers.get('vary')).toBe('Origin');

        // A later stage (static variants, compression) keys the response on
        // Accept-Encoding; CORS must append its token, not clobber it.
        headers.set('vary', 'Accept-Encoding');
        await interceptor.postHandle(route, undefined, {} as ModelAndView);
        expect(headers.get('vary')).toBe('Accept-Encoding, Origin');

        // Re-running the hook must not duplicate the token.
        await interceptor.postHandle(route, undefined, {} as ModelAndView);
        expect(headers.get('vary')).toBe('Accept-Encoding, Origin');
    });
});
