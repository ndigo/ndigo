/**
 * Blue Resilience Lab — retry and circuit-breaker policies, observed.
 *
 * One process exposes a controllable flaky upstream, a typed `@blue/service`
 * client woven with `@blue/resilience` policies, a control plane that drives
 * the upstream and reports breaker state, and management endpoints that expose
 * the same numbers as health and metrics.
 * @module blue-resilience-lab
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
import { ResilienceLabConfiguration } from './lab-configuration';

// The managed server reads its port from `process.env.PORT`, and the lab bean
// (created when the configuration is registered) reads it to aim its loopback
// transport — so surface the default before any context is built.
process.env['PORT'] ??= '3080';
const PORT = Number(getEnv('PORT', '3080'));
const logger = getLogger('blue-resilience-lab');

async function main() {
    const context = await new ApplicationBuilder([
        NodeAutoConfiguration,
        ManagementAutoConfiguration,
        ResilienceLabConfiguration,
    ]).run();

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://127.0.0.1:${PORT}`);
    logger.info('upstream (behaviour set by the control plane):');
    logger.info(`  GET  http://127.0.0.1:${PORT}/upstream/data`);
    logger.info('consumer (typed @blue/service client):');
    logger.info(`  GET  http://127.0.0.1:${PORT}/consumer/data     (@retry + @circuitBreaker)`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/consumer/direct   (policies bypassed)`);
    logger.info('control plane:');
    logger.info(`  POST http://127.0.0.1:${PORT}/lab/mode    {"mode":"error"} | {"mode":"fail","count":2}`);
    logger.info(
        `                                            {"mode":"pattern","pattern":"FFS"} | {"mode":"delay","delayMs":250}`
    );
    logger.info(`  GET  http://127.0.0.1:${PORT}/lab/state`);
    logger.info(`  POST http://127.0.0.1:${PORT}/lab/clock   {"advanceMs":2000} | {"reset":true}`);
    logger.info(`  POST http://127.0.0.1:${PORT}/lab/reset`);
    logger.info('management:');
    logger.info(`  GET  http://127.0.0.1:${PORT}/health      (503 while a circuit is open)`);
    logger.info(`  GET  http://127.0.0.1:${PORT}/metrics`);
}

main().catch((err) => {
    logger.error(`failed to start: ${getErrorMessage(err)}`);
    process.exit(1);
});
