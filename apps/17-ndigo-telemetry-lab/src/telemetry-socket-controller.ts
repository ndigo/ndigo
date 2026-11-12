/**
 * The socket half of the lab: `/ws/telemetry` accepts connections into the
 * `telemetry` room, and a second `@scheduled` task pushes the current metric
 * snapshot into that room every few seconds — the scheduler → registry →
 * live-client path (AD-21 D4, guides 15).
 *
 * Inbound frames are counted (a client can send anything; the payload is not
 * interpreted) so the two-way nature of the session is observable in
 * `/metrics` rather than silent.
 */
import '@tsmetadata/polyfill';
import { $aware } from '@ndigo/factory';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import {
    parameters,
    requestMapping,
    socketMapping,
    socketSessionValue,
    type SocketSession,
    type SocketSessionRegistry,
} from '@ndigo/dispatcher';
import { SOCKET_SESSION_REGISTRY } from '@ndigo/platform-node';
import { scheduled } from '@ndigo/scheduler';
import { counted } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';
import type { LabMetrics } from './lab-metrics';
import type { LabTicker } from './lab-ticker';

const logger = getLogger('ndigo-telemetry-lab:socket');

/** The room every `/ws/telemetry` connection joins, and the push targets. */
export const TELEMETRY_ROOM = 'telemetry';

/** How often the snapshot is pushed into the room (every 3 seconds). */
export const PUSH_CRON = '*/3 * * * * *';

/**
 * Serves the socket endpoint and pushes metric snapshots to it.
 */
@requestMapping('/ws')
export class TelemetrySocketController implements ApplicationContextAware {
    #context: ApplicationContext | null = null;
    readonly #metrics: LabMetrics;
    readonly #ticker: LabTicker;

    /**
     * @param metrics - The lab's counter surface (the pushed snapshot).
     * @param ticker - The ticker, whose run count is part of the snapshot.
     */
    constructor(metrics: LabMetrics, ticker: LabTicker) {
        this.#metrics = metrics;
        this.#ticker = ticker;
    }

    /**
     * Marks the value as `Aware` for the factory's aware injection, so
     * `setApplicationContext` runs when this entry is registered.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * Injects the owning application context.
     *
     * @param context - The application context that owns this controller.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Lazy registry resolution: the registry entry is owned by
     * `NodeAutoConfiguration`, so entry creation order never matters.
     *
     * @returns The socket session registry, or `null` when unavailable
     *   (e.g. a unit-instantiated controller).
     */
    #registry(): SocketSessionRegistry | null {
        if (!this.#context?.hasValue?.(SOCKET_SESSION_REGISTRY)) {
            return null;
        }
        return this.#context.getValue(SOCKET_SESSION_REGISTRY);
    }

    /**
     * The endpoint: every client joins the room, and each inbound frame is
     * counted. Broadcast-style handler — outbound traffic goes through the
     * registry, so the method consumes `session.messages` without yielding.
     */
    @socketMapping('/telemetry')
    @parameters({ session: socketSessionValue('session') })
    async telemetry(session: SocketSession) {
        session.join(TELEMETRY_ROOM);
        // Sessions carry no framework id; the running connection count is the
        // identity the logs use, and `path` names the endpoint.
        const connection = this.#metrics.increment('socket.connections');
        logger.info(`client #${connection} joined ${TELEMETRY_ROOM} (${session.path})`);
        try {
            for await (const message of session.messages) {
                this.#metrics.increment('socket.inboundMessages');
                logger.info(`inbound frame: ${String(message).slice(0, 80)}`);
            }
        } finally {
            this.#metrics.increment('socket.disconnections');
            logger.info(`client #${connection} left ${TELEMETRY_ROOM} (${session.path})`);
        }
    }

    /**
     * The periodic push — the scheduler → registry fan-out path, carrying the
     * same numbers `GET /metrics` serves.
     */
    @scheduled(PUSH_CRON)
    @counted('telemetry-lab.socket.pushes')
    async pushSnapshot() {
        const registry = this.#registry();
        if (!registry) {
            return;
        }
        const push = { ticks: this.#ticker.ticks, metrics: this.#metrics.snapshot() };
        this.#metrics.increment('socket.pushes');
        await registry.broadcastTo(TELEMETRY_ROOM, { event: 'telemetry-tick', data: push });
    }
}
