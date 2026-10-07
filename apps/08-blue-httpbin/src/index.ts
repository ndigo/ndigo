/**
 * Blue HTTPBin — an HTTP semantics playground (echo, redirects, cookies, auth,
 * compression) built on `@blue/platform-node`.
 * @module blue-httpbin
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { getEnv } from '@blue/context';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/log';
import { getErrorMessage } from '@blue/util';
import { HTTPBinConfiguration } from './httpbin-configuration';

// The managed server reads `process.env.PORT` (defaulting to 3000) when no
// explicit port is passed, so surface the app's default before the context is
// built — otherwise `pnpm start` would bind 3000 while logging 3020.
process.env['PORT'] ??= '3020';
const PORT = Number(getEnv('PORT', '3020'));
const logger = getLogger('blue-httpbin');

async function main() {
    const context = await new ApplicationBuilder([NodeAutoConfiguration, HTTPBinConfiguration]).run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://127.0.0.1:${PORT}`);
    logger.info('Available routes:');
    logger.info(`  GET  http://127.0.0.1:${PORT}/get`);
    logger.info(`  POST http://127.0.0.1:${PORT}/post`);
    logger.info(`  *    http://127.0.0.1:${PORT}/anything` + ' (+ /anything/{rest})');
    logger.info(`  GET  http://127.0.0.1:${PORT}/headers`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/ip`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/status/{code}`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/redirect/{n}` + ' (+ /relative-redirect/{n}, /redirect-to?url=)');
    logger.info(`  GET  http://127.0.0.1:${PORT}/response-headers?X-Test=1`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/cookies` + ' (+ /cookies/set?k=v, /cookies/delete?k=)');
    logger.info(`  GET  http://127.0.0.1:${PORT}/basic-auth/{user}/{passwd}` + ' (+ /bearer)');
    logger.info(`  GET  http://127.0.0.1:${PORT}/delay/{n}` + ' (+ /bytes/{n}, /stream/{n})');
    logger.info(`  GET  http://127.0.0.1:${PORT}/gzip` + ' (+ /deflate)');
    logger.info(`  GET  http://127.0.0.1:${PORT}/uuid` + ' (+ /json, /html, /xml, /robots.txt)');
    logger.info(`  GET  http://127.0.0.1:${PORT}/matrix/{id};color={color}`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/limit   (3/min per client, 429 + Retry-After)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
