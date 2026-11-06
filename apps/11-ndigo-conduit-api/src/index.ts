/**
 * Entry point: boots the RealWorld (Conduit) API server on port 3040 (or
 * `PORT`).
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
import { ConduitConfiguration, DEFAULT_PORT } from './conduit-configuration';

const PORT = Number(getEnv('PORT', String(DEFAULT_PORT)));
const logger = getLogger('ndigo-conduit-api');

async function main() {
    // ConduitConfiguration is registered last so its `httpServer` entry wins
    // over NodeAutoConfiguration's platform default (see that module).
    const context = await new ApplicationBuilder([NodeAutoConfiguration, ConduitConfiguration]).run();
    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`RealWorld Conduit API listening on http://localhost:${PORT}/api`);
    logger.info('Available routes:');
    logger.info(`  POST   http://localhost:${PORT}/api/users`);
    logger.info(`  POST   http://localhost:${PORT}/api/users/login`);
    logger.info(`  GET    http://localhost:${PORT}/api/user                     (Authorization: Token <jwt>)`);
    logger.info(`  PUT    http://localhost:${PORT}/api/user                     (Authorization: Token <jwt>)`);
    logger.info(`  GET    http://localhost:${PORT}/api/profiles/:username`);
    logger.info(`  POST   http://localhost:${PORT}/api/profiles/:username/follow (Authorization: Token <jwt>)`);
    logger.info(`  DELETE http://localhost:${PORT}/api/profiles/:username/follow (Authorization: Token <jwt>)`);
    logger.info(`  GET    http://localhost:${PORT}/api/articles?tag=&author=&favorited=&limit=&offset=`);
    logger.info(`  GET    http://localhost:${PORT}/api/articles/feed             (Authorization: Token <jwt>)`);
    logger.info(`  POST   http://localhost:${PORT}/api/articles                 (Authorization: Token <jwt>)`);
    logger.info(`  GET    http://localhost:${PORT}/api/articles/:slug`);
    logger.info(`  PUT    http://localhost:${PORT}/api/articles/:slug            (author only)`);
    logger.info(`  DELETE http://localhost:${PORT}/api/articles/:slug            (author only)`);
    logger.info(`  POST   http://localhost:${PORT}/api/articles/:slug/favorite   (Authorization: Token <jwt>)`);
    logger.info(`  DELETE http://localhost:${PORT}/api/articles/:slug/favorite   (Authorization: Token <jwt>)`);
    logger.info(`  GET    http://localhost:${PORT}/api/articles/:slug/comments`);
    logger.info(`  POST   http://localhost:${PORT}/api/articles/:slug/comments   (Authorization: Token <jwt>)`);
    logger.info(`  DELETE http://localhost:${PORT}/api/articles/:slug/comments/:id (author only)`);
    logger.info(`  GET    http://localhost:${PORT}/api/tags`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
