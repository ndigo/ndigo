/**
 * Blue Hello Node — minimal HTTP server.
 * @module blue-hello-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { getEnv } from '@blue/context';
import { NodeAutoConfiguration, HTTP_SERVER, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/log';
import { getErrorMessage } from '@blue/util';
import { HelloConfiguration } from './hello-configuration';

// The managed server reads `process.env.PORT` (defaulting to 3000) when no
// explicit port is passed, so surface the app's default before the context is
// built — otherwise `pnpm start` would bind 3000 while logging 3010.
process.env['PORT'] ??= '3010';
const PORT = Number(getEnv('PORT', '3010'));
const logger = getLogger('blue-hello-node');

async function main() {
    // Spring-style bootstrap: register platform auto-config + app config, then
    // run() prepares the environment, refreshes the context, and returns it —
    // the handler mapping and dispatcher initialize themselves on refresh.
    const context = await new ApplicationBuilder([NodeAutoConfiguration, HelloConfiguration]).run();

    // Managed HTTP server: resolve it from the context and await its start so
    // "listening" fires once the socket is bound. The context stops it on close.
    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
