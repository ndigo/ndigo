/**
 * The lab's read-back and page routes:
 *
 * - `GET /` — the shell that boots the built client bundle.
 * - `GET /lab/config` — the resolved telemetry setup (sampler + exporter
 *   targets), which the page displays and uses to aim its own OTLP export.
 * - `GET /lab/state` — the counters/gauges the lab has observed, plus the
 *   scheduled-task and socket wiring.
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { HTTPHeaders, ResponseStatuses } from '@ndigo/http';
import { ResponseEntity } from '@ndigo/platform-node';
import { LAB_FEATURE, type LabMetrics, type LabMetricsSnapshot } from './lab-metrics';
import { LAB_PAGE_HTML } from './lab-page';
import { TICK_CRON, type LabTicker } from './lab-ticker';
import { PUSH_CRON, TELEMETRY_ROOM } from './telemetry-socket-controller';
import { resolveLabTelemetry } from './telemetry-config';

/** The browser bundle's OTel `service.name` — what the collector will show. */
export const WEB_SERVICE_NAME = 'ndigo-telemetry-lab-web';

/** The socket endpoint the page subscribes to. */
export const SOCKET_PATH = '/ws/telemetry';

/**
 * The lab state the page and the tests read back.
 */
export interface LabState {
    readonly service: string;
    readonly feature: string;
    readonly scheduled: { readonly ticks: number; readonly cron: string; readonly span: string };
    readonly sockets: { readonly room: string; readonly path: string; readonly pushCron: string };
    readonly metrics: LabMetricsSnapshot;
}

/**
 * Serves the page and the lab's own read-back endpoints.
 */
@requestMapping('/')
export class LabController {
    readonly #metrics: LabMetrics;
    readonly #ticker: LabTicker;

    /**
     * @param metrics - The lab's counter surface.
     * @param ticker - The scheduled ticker (its run count is part of state).
     */
    constructor(metrics: LabMetrics, ticker: LabTicker) {
        this.#metrics = metrics;
        this.#ticker = ticker;
    }

    /**
     * `GET /` — the lab page (the built client bundle does the rendering).
     *
     * @returns The HTML document.
     */
    @getMapping('/')
    index(): ResponseEntity<string> {
        // `ResponseEntityView` writes a string body raw only when the
        // content-type is set (and is not JSON) — hence the canonical
        // `Content-Type` key, not a lower-cased one that would be shadowed by
        // the view's JSON default.
        return new ResponseEntity(LAB_PAGE_HTML, ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'text/html; charset=utf-8',
        });
    }

    /**
     * `GET /lab/config` — what `configureTelemetry` was handed at boot, in
     * words, plus the client-facing knobs (socket path, browser trace URL).
     *
     * @returns The resolved telemetry setup.
     */
    @getMapping('/lab/config')
    config() {
        const telemetry = resolveLabTelemetry();
        return {
            serviceName: WEB_SERVICE_NAME,
            feature: LAB_FEATURE,
            socketPath: SOCKET_PATH,
            sampler: telemetry.sampler,
            exporters: telemetry.exporters,
            otlpEndpoint: telemetry.otlpEndpoint ?? null,
            browserTraceUrl: telemetry.browserTraceUrl ?? null,
            tickCron: TICK_CRON,
            pushCron: PUSH_CRON,
        };
    }

    /**
     * `GET /lab/state` — counters/gauges observed so far, the tick count, and
     * the scheduled/socket wiring.
     *
     * @returns The state document.
     */
    @getMapping('/lab/state')
    state(): LabState {
        return {
            service: '@ndigo/telemetry-lab',
            feature: LAB_FEATURE,
            scheduled: { ticks: this.#ticker.ticks, cron: TICK_CRON, span: 'lab.ticker.tick' },
            sockets: { room: TELEMETRY_ROOM, path: SOCKET_PATH, pushCron: PUSH_CRON },
            metrics: this.#metrics.snapshot(),
        };
    }
}
