/**
 * Blue Hello Node — minimal HTTP server.
 *
 * Demonstrates the Node platform foundation:
 * - `NodeAutoConfiguration` provisions the dispatcher, handler mapping, and `HTTPServer`
 * - `@getMapping` on a controller serves JSON
 * - Spring-style bootstrap: `ApplicationBuilder.run()` registers + refreshes the
 *   context; the handler mapping + dispatcher auto-initialize on refresh
 *
 * @module
 */

import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/telemetry';
import { HelloConfiguration } from './hello-configuration';

const PORT = Number(process.env['PORT'] ?? '3000');
const logger = getLogger('blue-hello-node');

async function main() {
    // Spring-style bootstrap: register platform auto-config + app config, then
    // run() prepares the environment, refreshes the context, and returns it —
    // the handler mapping and dispatcher initialize themselves on refresh.
    const context = new ApplicationBuilder([NodeAutoConfiguration, HelloConfiguration]).run();

    // Managed HTTP server: resolve it from the context and await its start so
    // "listening" fires once the socket is bound. The context stops it on close.
    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});