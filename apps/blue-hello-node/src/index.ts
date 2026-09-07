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
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration, NodeDispatcher, HTTPServer, NodeHTTPServerAdapter, gracefulShutdown } from '@blue/platform-node';
import { HelloConfiguration } from './hello-configuration';

const PORT = Number(process.env['PORT'] ?? '3000');

async function main() {
    // ── Bootstrap ──────────────────────────────────────────────────────────
    const context = new MetadataConfigApplicationContext('hello-node');
    context.register(NodeAutoConfiguration);
    context.register(HelloConfiguration);
    context.refresh();

    // ── Dispatcher + server ────────────────────────────────────────────────
    // Discover handler methods from the context (controllers registered above).
    const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();

    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    const server = new HTTPServer(dispatcher, {
        adapter: new NodeHTTPServerAdapter(dispatcher),
    });
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
