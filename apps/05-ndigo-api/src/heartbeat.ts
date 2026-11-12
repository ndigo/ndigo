/**
 * Scheduled demo task (AD-20): a heartbeat that pings every 30 seconds,
 * registered as a context entry so the scheduler's auto-discovery picks it
 * up at refresh. The ping counter is observable in tests.
 */
import { scheduled } from '@ndigo/scheduler';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-api:heartbeat');

/**
 * The application heartbeat — the scheduling demo gate (AD-20 D2/D4):
 * zero-wiring `@scheduled` on a registered entry.
 */
export class Heartbeat {
    /**
     * Ping count, observable for tests and health checks.
     */
    pings = 0;

    /**
     * One ping per run — logged and counted.
     */
    @scheduled('*/30 * * * * *')
    ping() {
        this.pings += 1;
        logger.info(`heartbeat #${this.pings}`);
    }
}
