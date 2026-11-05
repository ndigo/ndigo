/**
 * Ndigo Todo-Backend — the Todo-Backend spec implementation as a Node server.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { applyHttpInterceptors } from './interceptors';
import { TodoBackendConfiguration } from './todobackend-configuration';

// The managed server reads its port from `process.env.PORT`, so surface this
// app's default there before any context is created.
process.env['PORT'] ??= '3030';
const PORT = Number(getEnv('PORT', '3030'));
const logger = getLogger('ndigo-todobackend');

async function main() {
    // DI-container bootstrap: platform auto-config (handler mapping, HTTP
    // server, argument resolvers) plus the app's composition root.
    const context = await new ApplicationBuilder([NodeAutoConfiguration, TodoBackendConfiguration]).run();

    // The spec runner is a browser client on another origin, and writes are
    // JSON-only: cross-origin access and the media-type gate are wired after
    // refresh (framework gap — see `interceptors.ts`).
    applyHttpInterceptors(context);

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET    http://localhost:${PORT}/todos           (list)`);
    logger.info(`  POST   http://localhost:${PORT}/todos           {"title":"walk the dog"}`);
    logger.info(`  GET    http://localhost:${PORT}/todos/1         (one todo)`);
    logger.info(`  PUT    http://localhost:${PORT}/todos/1         {"title":"…","order":1,"completed":false}`);
    logger.info(`  PATCH  http://localhost:${PORT}/todos/1         {"completed":true}`);
    logger.info(`  DELETE http://localhost:${PORT}/todos/1`);
    logger.info(`  DELETE http://localhost:${PORT}/todos           (collection reset)`);
    logger.info(`  spec runner: https://www.todobackend.com/specs/index.html  →  http://localhost:${PORT}/todos`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
