/**
 * SEC-C — the demo widens its CSP `connect-src` so the adopted library's
 * inline-icon fetch (Web Awesome `with-clear`) is admitted.
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { IslandConfiguration, applyDemoSecurityHeaders } from '../src/island-configuration';
import { MESSAGE_SOURCE } from '../src/context-tokens';

/**
 * The reference integration keeps `with-clear`; `wa-icon` renders its clear
 * icon through `fetch('data:image/svg+xml,…')`, which the framework's default
 * `connect-src 'self'` blocks. The demo replaces the default-on
 * `SecurityHeadersInterceptor` through the documented seam; this asserts the
 * wiring applies on a real response.
 */
describe('blue-island security headers (SEC-C)', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('island-security');
        context.register(NodeAutoConfiguration);
        context.register(IslandConfiguration);
        context.refresh();
        context.setMessageSource(context.getValue(MESSAGE_SOURCE));
        applyDemoSecurityHeaders(context);

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const address = (adapter.server as Server).address();
        if (address === null || typeof address === 'string') {
            throw new Error('expected the adapter to listen on a TCP address');
        }
        base = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    test('CSP admits data: in connect-src while keeping the default set', async () => {
        const res = await fetch(`${base}/`);
        expect(res.status).toBe(200);

        const csp = res.headers.get('content-security-policy') ?? '';
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("connect-src 'self' data:");
        // Every other default header survives the seam replacement.
        expect(res.headers.get('x-content-type-options')).toBe('nosniff');
        expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    });
});
