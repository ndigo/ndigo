/**
 * Scheduled demo task: a heartbeat that pings every 30 seconds,
 * registered as a context entry so the scheduler's auto-discovery picks it
 * up at refresh. The ping counter is observable in tests.
 */
import '@tsmetadata/polyfill';
import { AsLoggerAware, type LoggerAware } from '@ndigo/context';
import { scheduled } from '@ndigo/scheduler';

/**
 * The application heartbeat — the scheduling demo gate:
 * zero-wiring `@scheduled` on a registered entry.
 *
 * Uses the context-injected logger (`LoggerAware`) so its output follows the
 * application's logging configuration and carries the active span's trace
 * context. A module-level `getLogger(...)` would also work here; the injected
 * form is preferred for managed components.
 */
export class Heartbeat extends AsLoggerAware(Object) implements LoggerAware {
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
        this.logger?.info(`heartbeat #${this.pings}`);
    }
}
