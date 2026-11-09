/**
 * Default security headers for the island shell.
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { IslandConfiguration } from '../src/island-configuration';
import { MESSAGE_SOURCE } from '../src/context-tokens';

/**
 * The demo relies on the framework's default header set: no `data:` in
 * `connect-src`, because the registry-installed controls fetch no icons.
 */
describe('ndigo-island security headers', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('island-security');
        context.register(NodeAutoConfiguration);
        context.register(IslandConfiguration);
        context.refresh();
        context.setMessageSource(context.getValue(MESSAGE_SOURCE));

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

    test('serves the default CSP without the removed data: allowance', async () => {
        const res = await fetch(`${base}/`);
        expect(res.status).toBe(200);

        const csp = res.headers.get('content-security-policy') ?? '';
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("connect-src 'self'");
        expect(csp).not.toMatch(/connect-src[^;]*data:/);
        expect(res.headers.get('x-content-type-options')).toBe('nosniff');
        expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    });
});
