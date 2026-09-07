/**
 * Blue Hello Node — minimal HTTP server.
 *
 * Demonstrates the Node platform foundation:
 * - `NodeAutoConfiguration` provisions the dispatcher, handler mapping, and `HTTPServer`
 * - `@getMapping` on a controller serves JSON
 *
 * @module
 */

import 'node:process';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { HelloConfiguration } from './hello-configuration';

const PORT = Number(process.env['PORT'] ?? '3000');

async function main() {
    // ── Bootstrap ──────────────────────────────────────────────────────────
    const context = new MetadataConfigApplicationContext('hello-node');
    context.register(NodeAutoConfiguration);
    context.register(HelloConfiguration);
    context.refresh();

    // ── Server ─────────────────────────────────────────────────────────────
    // NodeAutoConfiguration auto-initializes the handler mapping and the
    // dispatcher during refresh. Resolve the managed server and await its
    // start so "listening" fires once the socket is bound. The context stops
    // it on close.
    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    // eslint-disable-next-line no-console
    console.log(`[hello-node] listening on http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[hello-node] failed to start:', err);
    process.exit(1);
});
