import 'node:process';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
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

    // NodeAutoConfiguration auto-initializes the handler mapping and the
    // dispatcher during refresh. Resolve the managed server and await its
    // start so "listening" fires once the socket is bound. It reads the port
    // from process.env.PORT (default 3000) and stops when the context closes.
    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

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
