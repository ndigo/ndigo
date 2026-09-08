import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/telemetry';
import { NodeAppConfiguration } from './node-app-configuration';
import { initAuth } from './auth-store';

const PORT = Number(process.env['PORT'] ?? '3000');
const logger = getLogger('blue-api');

async function main() {
    initAuth();

    // Spring-style bootstrap: register platform auto-config + app config, then
    // run() refreshes the context. The handler mapping + dispatcher
    // auto-initialize on refresh; the managed server reads process.env.PORT
    // (default 3000) and stops when the context closes.
    const context = new ApplicationBuilder([NodeAutoConfiguration, NodeAppConfiguration]).run();

    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info('Available routes:');
    logger.info(`  GET  http://localhost:${PORT}/api/hello?name=Alice`);
    logger.info(`  GET  http://localhost:${PORT}/api/greet/Alice`);
    logger.info(`  POST http://localhost:${PORT}/api/echo   (JSON body)`);
    logger.info(`  GET  http://localhost:${PORT}/api/products/42;color=red`);
    logger.info(`  GET  http://localhost:${PORT}/api/products/42   (no matrix)`);
    logger.info(`  POST http://localhost:${PORT}/auth/login  ({"username":"admin","password":"demo"})`);
    logger.info(`  GET  http://localhost:${PORT}/notes  (Authorization: Bearer <token>)`);
    logger.info(`  GET  http://localhost:${PORT}/static/    (serves ./public)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});