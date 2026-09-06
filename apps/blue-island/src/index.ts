/**
 * Blue Island — hybrid island demo server.
 *
 * Serves a shell page containing a server-rendered Web Component island
 * (`<todo-app data-blue-island data-blue-model="…">`) plus the client bundle
 * that hydrates it. Demonstrates the hybrid topology (server controllers +
 * client-side views) through `IslandView` + `hydrateIslands()`.
 */

import 'node:process';
import { MetadataConfigApplicationContext } from '@blue/context';
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration, NodeDispatcher, HTTPServer, NodeHTTPServerAdapter } from '@blue/platform-node';
import { IslandConfiguration } from './island-configuration';

const PORT = Number(process.env['PORT'] ?? '3200');

async function main() {
    const context = new MetadataConfigApplicationContext('blue-island');
    context.register(NodeAutoConfiguration);
    context.register(IslandConfiguration);
    context.refresh();

    const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();

    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    const server = new HTTPServer(dispatcher, {
        adapter: new NodeHTTPServerAdapter(dispatcher),
        port: PORT,
    });
    await server.start();

    // eslint-disable-next-line no-console
    console.log(`[blue-island] listening on http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`  GET /            (shell + server-rendered island)`);
    // eslint-disable-next-line no-console
    console.log(`  GET /static/*    (client bundle → hydrates the island)`);
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[blue-island] failed to start:', err);
    process.exit(1);
});