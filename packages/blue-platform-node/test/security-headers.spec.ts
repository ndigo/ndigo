/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, requestMapping } from '@blue/dispatcher';
import type { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { SecurityHeadersInterceptor } from '../src/security-headers-interceptor';
import type { SecurityHeadersInterceptorOptions } from '../src/security-headers-interceptor';

/**
 * Security headers over a real socket (AD-25): the default-on set, fallback
 * coverage of unmatched routes, per-header escape hatches, and the
 * WebSocket-aware CSP default.
 */

@requestMapping('/api')
class APIController {
    @getMapping('/quote')
    quote() {
        return { price: 42 };
    }
}

async function boot(options?: SecurityHeadersInterceptorOptions): Promise<{
    base: string;
    dispatcher: NodeDispatcher;
    adapter: NodeHTTPServerAdapter;
    close: () => Promise<void>;
}> {
    const context = new MetadataConfigApplicationContext('security-headers');
    context.register(NodeAutoConfiguration);
    context.setValue(APIController.name, new APIController());
    context.refresh(); // auto-initializes the handler mapping + dispatcher
    const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

    // Escape-hatch seam: replace the auto-config default instance with a
    // customized one (the documented bean-replacement posture; the array
    // entry is the default-on instance).
    if (options) {
        handlerMapping.interceptors.splice(0, 1, new SecurityHeadersInterceptor(options));
    }

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

describe('SecurityHeadersInterceptor (default-on)', () => {
    test('sets the full framework default set on a normal dispatch', async () => {
        const { base, close } = await boot();
        try {
            const res = await fetch(`${base}/api/quote`);
            expect(res.status).toBe(200);
            const headers = res.headers;
            expect(headers.get('content-security-policy')).toContain("default-src 'self'");
            expect(headers.get('content-security-policy')).toContain("connect-src 'self' ws: wss:");
            expect(headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
            expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
            expect(headers.get('x-content-type-options')).toBe('nosniff');
            expect(headers.get('referrer-policy')).toBe('no-referrer');
            expect(headers.get('cross-origin-resource-policy')).toBe('same-origin');
            expect(headers.get('cross-origin-opener-policy')).toBe('same-origin');
            expect(headers.get('origin-agent-cluster')).toBe('?1');
            expect(headers.get('x-dns-prefetch-control')).toBe('off');
            expect(headers.get('x-download-options')).toBe('noopen');
            expect(headers.get('x-permitted-cross-domain-policies')).toBe('none');
            expect(headers.get('x-xss-protection')).toBe('0');
        } finally {
            await close();
        }
    });

    test('404s short-circuited by the adapter stay exempt (documented deviation)', async () => {
        // Unmatched non-OPTIONS requests finalize in the adapter BEFORE the
        // dispatcher/interceptor chain runs — security headers cannot reach
        // them without an adapter-level seam. Acceptable: these responses
        // are fixed JSON problem documents (no HTML, no user reflection).
        // Revisit if HTML error pages ship (AD-25 D5).
        const { base, close } = await boot();
        try {
            const res = await fetch(`${base}/no/such/route`);
            expect(res.status).toBe(404);
            expect(res.headers.get('content-security-policy')).toBeNull();
        } finally {
            await close();
        }
    });

    test('contentSecurityPolicy: false escapes the CSP but keeps the rest', async () => {
        const { base, close } = await boot({ headers: { contentSecurityPolicy: false } });
        try {
            const res = await fetch(`${base}/api/quote`);
            expect(res.headers.get('content-security-policy')).toBeNull();
            expect(res.headers.get('x-content-type-options')).toBe('nosniff');
            expect(res.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
        } finally {
            await close();
        }
    });

    test('explicit directives replace the default connect-src (useDefaults opt-in)', async () => {
        const { base, close } = await boot({
            headers: {
                contentSecurityPolicy: { useDefaults: true, directives: { 'connect-src': ["'self'"] } },
            },
        });
        try {
            const res = await fetch(`${base}/api/quote`);
            const csp = res.headers.get('content-security-policy');
            expect(csp).toContain('connect-src');
            expect(csp).not.toContain('ws:');
        } finally {
            await close();
        }
    });

    test('enabled: false sends no security headers at all', async () => {
        const { base, close } = await boot({ enabled: false });
        try {
            const res = await fetch(`${base}/api/quote`);
            expect(res.headers.get('content-security-policy')).toBeNull();
            expect(res.headers.get('x-content-type-options')).toBeNull();
            expect(res.headers.get('strict-transport-security')).toBeNull();
        } finally {
            await close();
        }
    });
});