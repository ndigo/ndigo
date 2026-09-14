/**
 * Blue Island — hybrid island demo server.
 * * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/telemetry';
import { IslandConfiguration } from './island-configuration';
import { TodoModelStore } from './todo-model-store';

// The managed server reads its port from process.env.PORT, so surface the
// app's default there before any context is created.
process.env.PORT ??= '3200';
const PORT = Number(process.env['PORT']);
const logger = getLogger('blue-island');

async function main() {
    // Spring-style bootstrap: register platform auto-config + app config, then
    // run() refreshes the context — the handler mapping + dispatcher
    // auto-initialize on refresh.
    const context = await new ApplicationBuilder([NodeAutoConfiguration, IslandConfiguration]).run();

    // The application message source (i18next resources) backs the shell's
    // locale helpers; negotiated per request via the Accept-Language header.
    context.setMessageSource(context.getValue('messageSource'));

    // The reactive half of the demo pushes model updates to connected islands
    // over SSE until the ticker completes.
    const modelStore = context.getValue<TodoModelStore>('modelStore');
    modelStore.startTicker();

    // Resolve the managed server and await its start so "listening" fires
    // once the socket is bound. It reads the port from process.env.PORT
    // (defaulted to 3200 above) and stops on close.
    const server = context.getValue<HTTPServer>('httpServer');
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET /            (shell + server-rendered island)`);
    logger.info(`  GET /events      (SSE — server pushes model updates into the island)`);
    logger.info(`  GET /static/*    (client bundle → hydrates the island)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});
