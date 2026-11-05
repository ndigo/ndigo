/**
 * Ndigo Island — hybrid island demo server.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@ndigo/boot';
import { NodeAutoConfiguration, HTTP_SERVER, gracefulShutdown } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { IslandConfiguration, applyDemoSecurityHeaders } from './island-configuration';
import { MESSAGE_SOURCE, MODEL_STORE } from './context-tokens';

// The managed server reads its port from process.env.PORT, so surface the
// app's default there before any context is created.
process.env.PORT ??= '3200';
const PORT = Number(process.env['PORT']);
const logger = getLogger('ndigo-island');

async function main() {
    // DI-container bootstrap: register platform auto-config + app config, then
    // run() refreshes the context — the handler mapping + dispatcher
    // auto-initialize on refresh.
    const context = await new ApplicationBuilder([NodeAutoConfiguration, IslandConfiguration]).run();

    // SEC-C: widen the demo's CSP `connect-src` for the Web Awesome clear-icon
    // fetch (see `applyDemoSecurityHeaders`). Runs on the refreshed context,
    // before the server accepts requests.
    applyDemoSecurityHeaders(context);

    // The application message source (i18next resources) backs the shell's
    // locale helpers; negotiated per request via the Accept-Language header.
    context.setMessageSource(context.getValue(MESSAGE_SOURCE));

    // The reactive half of the demo pushes model updates to connected islands
    // over SSE until the ticker completes.
    const modelStore = context.getValue(MODEL_STORE);
    modelStore.startTicker();

    // Resolve the managed server and await its start so "listening" fires
    // once the socket is bound. It reads the port from process.env.PORT
    // (defaulted to 3200 above) and stops on close.
    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET /            (shell + server-rendered island)`);
    logger.info(`  GET /events      (SSE — server pushes model updates into the island)`);
    logger.info(`  GET /static/*    (client bundle → hydrates the island)`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
