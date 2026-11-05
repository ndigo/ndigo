/**
 * The lab's composition root: one {@link LabMetrics} tally, one
 * {@link WorkService}, one {@link LabTicker} and one
 * {@link TelemetrySocketController}, shared by every route — so the page, the
 * scheduled task, the socket push, and `GET /metrics` all report the same
 * numbers.
 *
 * {@link applyLabSecurityHeaders} is the documented seam for widening the
 * framework's default CSP (`connect-src 'self'`): the page opens a WebSocket
 * on the same origin, and in collector mode it must also reach the OTLP
 * endpoint. Call it on the refreshed context, before the server accepts
 * requests (guides 06/10).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, type ApplicationContext } from '@ndigo/context';
import { HANDLER_MAPPING } from '@ndigo/dispatcher';
import { SecurityHeadersInterceptor, StaticController } from '@ndigo/platform-node';
import { fileURLToPath } from 'node:url';
import { LabController } from './lab-controller';
import { LabMetrics } from './lab-metrics';
import { LabTicker } from './lab-ticker';
import { TelemetrySocketController } from './telemetry-socket-controller';
import type { ResolvedLabTelemetry } from './telemetry-config';
import { WorkController } from './work-controller';
import { WorkService } from './work-service';

/**
 * Collects the origins the page must be allowed to reach: the OTLP endpoint
 * (when set) and the browser-facing trace URL. Malformed values are ignored —
 * `configureTelemetry` is the component that fails loud on those.
 *
 * @param telemetry - The resolved telemetry setup.
 * @returns The extra `connect-src` sources.
 */
function collectorOrigins(telemetry: ResolvedLabTelemetry): string[] {
    const origins: string[] = [];
    for (const candidate of [telemetry.otlpEndpoint, telemetry.browserTraceUrl]) {
        if (!candidate) {
            continue;
        }
        try {
            origins.push(new URL(candidate).origin);
        } catch {
            // Not a URL — the exporter resolvers report this properly.
        }
    }
    return origins;
}

/**
 * Widens the demo's CSP `connect-src` so the page's WebSocket (and, in
 * collector mode, its OTLP export) is admitted while every other default
 * header survives (`useDefaults: true`).
 *
 * @param context - The refreshed application context to harden.
 * @param telemetry - The resolved telemetry setup (collector origins).
 */
export function applyLabSecurityHeaders(context: ApplicationContext, telemetry: ResolvedLabTelemetry): void {
    const mapping = context.getValue(HANDLER_MAPPING);
    mapping.interceptors.splice(
        0,
        1,
        new SecurityHeadersInterceptor({
            headers: {
                contentSecurityPolicy: {
                    useDefaults: true,
                    directives: { 'connect-src': ["'self'", 'ws:', 'wss:', ...collectorOrigins(telemetry)] },
                },
            },
        })
    );
}

/**
 * Wires the lab runtime, its controllers, and the static client-bundle server.
 */
@configuration
export class TelemetryLabConfiguration {
    readonly #metrics = new LabMetrics();
    readonly #work = new WorkService(this.#metrics);
    readonly #ticker = new LabTicker(this.#metrics, this.#work);
    readonly #socketController = new TelemetrySocketController(this.#metrics, this.#ticker);

    /**
     * The shared counter surface. Registered so the scheduler/aware machinery
     * sees the same instance the routes use.
     */
    @entry()
    labMetrics() {
        return this.#metrics;
    }

    /** The instrumented work service (`lab.work.compute` spans). */
    @entry()
    workService() {
        return this.#work;
    }

    /**
     * The `@scheduled` ticker. Registered as an instance (never as the class):
     * `ScheduleRegistry` needs the task owner to call the method on.
     */
    @entry()
    labTicker() {
        return this.#ticker;
    }

    /** `GET /work`, `POST /work`. */
    @entry()
    workController() {
        return new WorkController(this.#metrics, this.#work, this.#ticker);
    }

    /** `GET /`, `GET /lab/config`, `GET /lab/state`. */
    @entry()
    labController() {
        return new LabController(this.#metrics, this.#ticker);
    }

    /** `WS /ws/telemetry` plus the periodic snapshot push. */
    @entry()
    telemetrySocketController() {
        return this.#socketController;
    }

    /**
     * Serves the Vite-built client bundle (`dist/`) under `/static/` —
     * resolved from this file so the server works regardless of the process
     * working directory. A missing bundle answers 404 without breaking boot
     * (`pnpm build:client` produces it; `pnpm start:full` does both).
     */
    @entry()
    staticController() {
        return new StaticController(fileURLToPath(new URL('../dist/', import.meta.url)));
    }
}
