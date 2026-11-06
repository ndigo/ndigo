/**
 * Ndigo Kanban — collaborative board server.
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { getEnv } from '@ndigo/context';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { KanbanConfiguration } from './kanban-configuration';

// The managed server reads its port from `process.env.PORT` (defaulting to
// 3000), so surface this app's reserved port before any context is built —
// otherwise `PORT` only decorates the log lines below.
process.env['PORT'] ??= '3070';
const PORT = Number(getEnv('PORT', '3070'));
const logger = getLogger('ndigo-kanban');

async function main() {
    // DI-container bootstrap: platform auto-config + management endpoints +
    // the app's own composition. `run()` refreshes the context; the handler
    // mapping and dispatcher auto-initialize on refresh.
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        KanbanConfiguration,
    ]).run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET    http://localhost:${PORT}/                     (shell + kanban-board component)`);
    logger.info(`  GET    http://localhost:${PORT}/api/boards/demo      (full board snapshot)`);
    logger.info(`  POST   http://localhost:${PORT}/api/boards/demo/cards`);
    logger.info(`  POST   http://localhost:${PORT}/api/columns/:columnId/cards`);
    logger.info(`  PATCH  http://localhost:${PORT}/api/cards/:cardId    (requires the current version)`);
    logger.info(`  DELETE http://localhost:${PORT}/api/cards/:cardId`);
    logger.info(`  WS     ws://localhost:${PORT}/ws/board/demo          (snapshot, then card events)`);
    logger.info(`  GET    http://localhost:${PORT}/static/*             (built client bundle)`);
    logger.info(`  GET    http://localhost:${PORT}/health               (management)`);
    logger.info(`  GET    http://localhost:${PORT}/metrics              (management)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
