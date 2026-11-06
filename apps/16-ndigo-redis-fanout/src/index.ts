/**
 * Ndigo Redis Fanout — two nodes, one cache, one board.
 *
 * One process, one backend: with `NDIGO_REDIS_URL` set the cache values are
 * shared and the board's messages cross nodes over Redis pub/sub; without it
 * the same code serves from memory and the board reaches this node's sockets
 * only. Nothing in the controllers branches on the mode — only the backend
 * composition does.
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { BOARD_PATH } from './board-message';
import { FANOUT_BACKEND } from './fanout-backend';
import { RedisFanoutConfiguration } from './redis-fanout-configuration';

// The managed server reads its port from process.env.PORT at construction, and
// the backend derives its instance id from the same value — surface the app
// default before any context is created.
process.env['PORT'] ??= '3160';
const PORT = Number(getEnv('PORT', '3160'));
const logger = getLogger('ndigo-redis-fanout');

async function main() {
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        RedisFanoutConfiguration,
    ]).run();

    const backend = context.getValue(FANOUT_BACKEND);
    try {
        // Connect before serving: a configured-but-unreachable Redis must fail
        // startup, never serve a silent single-node downgrade.
        await backend.connect();
        const server = context.getValue(HTTP_SERVER);
        await server.start();
        // Close producers and serving first, then the subscriptions, the
        // transport, the publisher, and the cache — in that order (README).
        gracefulShutdown(context, { resources: [server, ...backend.teardownResources()] });
    } catch (error) {
        await backend.close().catch(() => undefined);
        context.close();
        throw error;
    }

    logger.info(`listening on http://127.0.0.1:${PORT}`);
    logger.info(`instance ${backend.instanceId}, backend ${backend.mode} (namespace ${backend.namespace})`);
    if (backend.mode === 'redis') {
        logger.info('fan-out is live: messages and cache entries are shared with every node on this namespace');
    } else {
        logger.info('no NDIGO_REDIS_URL: single-node mode — cache and board are local to this process');
    }
    logger.info('available routes:');
    logger.info(`  GET  http://127.0.0.1:${PORT}/health      (backend status; boot probe)`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/cache/demo  (shared value + hit counter; ?value= seeds it)`);
    logger.info(`  POST http://127.0.0.1:${PORT}/board       ({"text":"..."} — no socket needed)`);
    logger.info(`  WS   ws://127.0.0.1:${PORT}${BOARD_PATH}   (broadcast board)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
