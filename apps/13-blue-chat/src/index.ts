/**
 * Blue Chat — real-time room chat server.
 * @module blue-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { getEnv } from '@blue/context';
import { ManagementAutoConfiguration } from '@blue/management';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/log';
import { getErrorMessage } from '@blue/util';
import { ChatConfiguration } from './chat-configuration';

// The managed server reads `process.env.PORT` (defaulting to 3000) when no
// explicit port is passed, so surface the app's default before the context is
// built — otherwise `pnpm start` would bind 3000 while logging 3060.
process.env['PORT'] ??= '3060';
const PORT = Number(getEnv('PORT', '3060'));
const logger = getLogger('blue-chat');

async function main() {
    // Spring-style bootstrap: platform auto-config + management endpoints +
    // the app's own composition. `run()` refreshes the context; the handler
    // mapping and dispatcher auto-initialize on refresh.
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        ChatConfiguration,
    ]).run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET  http://localhost:${PORT}/                       (shell + chat-room component)`);
    logger.info(`  WS   ws://localhost:${PORT}/ws/rooms/{room}?user=x   (room: history, presence, typing)`);
    logger.info(`  WS   ws://localhost:${PORT}/stomp/chat               (STOMP broker, /topic/chat interop)`);
    logger.info(`  GET  http://localhost:${PORT}/static/*               (built client bundle)`);
    logger.info(`  GET  http://localhost:${PORT}/health                 (management)`);
    logger.info(`  GET  http://localhost:${PORT}/metrics                (management)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
