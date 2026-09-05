// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { CORSInterceptor } from '../src/cors-interceptor';

/**
 * Server-side CORS enforcement over a real socket: preflight short-circuit,
 * allow header attachment, origin allowlisting (disallowed origins get no
 * CORS headers, so the browser blocks), credentials + wildcard rejection at
 * construction, and `Vary: Origin` for shared caches.
 */

@getMapping('/api')
class ApiController {
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
    context.setValue(ApiController.name, new ApiController());
    context.refresh();
    const handlerMapping = context.getValue<LinearMetadataHandlerMapping>('handlerMapping');
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

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
});