import 'node:process';
import { MetadataConfigApplicationContext } from '@blue/context';
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration, NodeDispatcher, HTTPServer, NodeHTTPServerAdapter } from '@blue/platform-node';
import { NodeAppConfiguration } from './node-app-configuration';
import { initAuth } from './auth-store';

const PORT = Number(process.env['PORT'] ?? '3000');

async function main() {
    // ── Bootstrap ──────────────────────────────────────────────────────────
    initAuth();

    const context = new MetadataConfigApplicationContext('demo-node');
    context.register(NodeAutoConfiguration);
    context.register(NodeAppConfiguration);
    context.refresh();

    // Discover handler methods from registered controllers.
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
    console.log(`[blue-api] listening on http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('Available routes:');
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/api/hello?name=Alice`);
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/api/greet/Alice`);
    // eslint-disable-next-line no-console
    console.log(`  POST http://localhost:${PORT}/api/echo   (JSON body)`);
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/api/products/42;color=red`);
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/api/products/42   (no matrix)`);
    // eslint-disable-next-line no-console
    console.log(`  POST http://localhost:${PORT}/auth/login  ({"username":"admin","password":"demo"})`);
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/notes  (Authorization: Bearer <token>)`);
    // eslint-disable-next-line no-console
    console.log(`  GET  http://localhost:${PORT}/static/    (serves ./public)`);
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[blue-api] failed to start:', err);
    process.exit(1);
});
