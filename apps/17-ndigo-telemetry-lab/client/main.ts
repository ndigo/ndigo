/**
 * The browser half of the telemetry lab.
 *
 * On load the client:
 *
 * 1. reads `GET /lab/config` (a plain `fetch` — the traced client is created
 *    after the telemetry providers exist),
 * 2. configures the browser OpenTelemetry providers through
 *    `configureBrowserTelemetry` — console exporters by default, or OTLP when
 *    the server handed it a collector trace URL,
 * 3. wraps the lab's routes in a `@ndigo/http` client carrying
 *    `TraceHeaderInterceptor`, so every action's **client span** is injected as
 *    W3C `traceparent` and continued by the server's SERVER span,
 * 4. subscribes to `/ws/telemetry` with `@ndigo/socket`'s `WebSocketClient` for
 *    the scheduled snapshot pushes,
 * 5. renders all of it — spans, server replies, pushes, and console lines —
 *    into the page.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ROOT_CONTEXT, SpanStatusCode, trace, type Span } from '@opentelemetry/api';
import { HTTP, TraceHeaderInterceptor } from '@ndigo/http';
import { WebSocketClient, type SocketStatus } from '@ndigo/socket';
import { configureBrowserTelemetry } from '@ndigo/telemetry-web';

/** The `/lab/config` document the server serves. */
interface LabConfig {
    serviceName: string;
    feature: string;
    socketPath: string;
    sampler: string;
    exporters: { trace: string; metric: string; log: string };
    otlpEndpoint: string | null;
    browserTraceUrl: string | null;
    tickCron: string;
    pushCron: string;
}

/** The success envelope `GET /work` / `POST /work` answer with. */
interface WorkReply {
    ok: true;
    route: string;
    payload: string;
    units: number;
    checksum: number;
    durationMs: number;
    trace: { traceId: string; spanId: string } | null;
    ticks: number;
}

/** The scheduled snapshot push — the `telemetry-tick` frame. */
interface TelemetryPush {
    event: string;
    data: {
        ticks: number;
        metrics: {
            counters: Record<string, number>;
            gauges: Record<string, number>;
            updatedAt: string;
        };
    };
}

/** How many lines each panel keeps before it starts trimming the oldest. */
const MAX_PANEL_LINES = 40;

const spansList = document.getElementById('browser-spans') as HTMLOListElement | null;
const repliesList = document.getElementById('server-replies') as HTMLOListElement | null;
const pushesList = document.getElementById('socket-pushes') as HTMLOListElement | null;
const logList = document.getElementById('lab-log') as HTMLOListElement | null;
const configLine = document.getElementById('lab-config');
const socketStatus = document.getElementById('socket-status');

/**
 * Appends one line to a panel (oldest first in the DOM, newest rendered on
 * top through the CSS column-reverse layout), trimming the tail.
 *
 * @param list - The panel list, or `null` when the page markup changed.
 * @param text - The line to render.
 * @param tone - Optional CSS class (`ok`/`warn`/`err`).
 */
function appendLine(list: HTMLOListElement | null, text: string, tone = ''): void {
    if (!list) {
        return;
    }
    const item = document.createElement('li');
    item.textContent = text;
    if (tone) {
        item.className = tone;
    }
    list.append(item);
    while (list.childElementCount > MAX_PANEL_LINES) {
        list.firstElementChild?.remove();
    }
}

/**
 * Renders a line to the console panel *and* the browser console — the console
 * exporter's output and the page's own view of it side by side.
 *
 * @param tone - CSS class for the rendered line.
 * @param message - The message.
 */
function log(tone: string, message: string): void {
    console.info(`[ndigo-telemetry-lab] ${message}`);
    appendLine(logList, message, tone);
}

/**
 * Reads the server's resolved telemetry setup.
 *
 * @returns The config document.
 */
async function loadConfig(): Promise<LabConfig> {
    const response = await fetch('/lab/config');
    if (!response.ok) {
        throw new Error(`GET /lab/config → ${response.status}`);
    }
    return (await response.json()) as LabConfig;
}

/**
 * Parses a socket frame into the lab's push envelope.
 *
 * @param message - The raw inbound frame (text or binary).
 * @returns The envelope, or `null` when the frame is not one.
 */
function parseFrame(message: unknown): TelemetryPush | null {
    try {
        const parsed: unknown = typeof message === 'string' ? JSON.parse(message) : message;
        if (parsed !== null && typeof parsed === 'object' && 'event' in parsed && 'data' in parsed) {
            return parsed as TelemetryPush;
        }
    } catch {
        // Not JSON — the caller renders the raw frame instead.
    }
    return null;
}

/** The active client span, read by the trace-header interceptor. */
let activeSpan: Span | null = null;

const tracer = trace.getTracer('ndigo-telemetry-lab-web');

/**
 * The lab's traced HTTP client. Browsers have no async-local storage, so the
 * interceptor is handed the span explicitly (`getContext`) rather than reading
 * the ambient context.
 */
const http = HTTP.create({
    headers: { accept: 'application/json' },
    interceptors: [
        new TraceHeaderInterceptor({
            getContext: () => (activeSpan ? trace.setSpan(ROOT_CONTEXT, activeSpan) : ROOT_CONTEXT),
        }),
    ],
});

/**
 * One instrumented action: a client span around a request to a work route,
 * then the server's reply — including whether the server span continued the
 * client's trace.
 *
 * @param method - `GET` or `POST`.
 * @param payload - The payload to checksum server-side.
 * @param units - The work multiplier.
 */
async function callWork(method: 'GET' | 'POST', payload: string, units: number): Promise<void> {
    const spanName = `lab.client.${method.toLowerCase()}.work`;
    const span = tracer.startSpan(spanName);
    const { traceId, spanId } = span.spanContext();
    const startedAt = performance.now();
    activeSpan = span;
    try {
        const response =
            method === 'GET'
                ? await http.get(`/work?payload=${encodeURIComponent(payload)}&units=${units}`)
                : await http.post('/work', {
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ payload, units }),
                  });
        const elapsedMs = Number((performance.now() - startedAt).toFixed(2));
        span.setAttribute('http.response.status_code', response.status);
        appendLine(
            spansList,
            `${spanName} trace=${traceId} span=${spanId} ${elapsedMs} ms → HTTP ${response.status}`,
            response.ok ? 'ok' : 'warn'
        );

        const body = (await response.json()) as WorkReply | { detail?: string };
        if ('route' in body) {
            const continued = body.trace?.traceId === traceId;
            appendLine(
                repliesList,
                `${body.route} checksum=${body.checksum} (${body.durationMs} ms, ticks=${body.ticks}) · server ${
                    body.trace ? `trace=${body.trace.traceId} span=${body.trace.spanId}` : 'no trace context'
                } · ${continued ? 'continuation ✓' : 'not continued'}`,
                continued ? 'ok' : 'warn'
            );
        } else {
            appendLine(repliesList, `HTTP ${response.status}: ${body.detail ?? 'request rejected'}`, 'err');
        }
    } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        log('err', `${method} /work failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        activeSpan = null;
        span.end();
    }
}

/**
 * Drains the socket's inbound stream, rendering each scheduled snapshot.
 *
 * @param client - The connected socket client.
 */
async function consumePushes(client: WebSocketClient): Promise<void> {
    for await (const message of client.messages) {
        const frame = parseFrame(message);
        if (!frame) {
            appendLine(pushesList, String(message).slice(0, 200), 'warn');
            continue;
        }
        const { counters } = frame.data.metrics;
        appendLine(
            pushesList,
            `${frame.event} · ticks=${frame.data.ticks} · work.units=${counters['work.units'] ?? 0} · scheduled.ticks=${
                counters['scheduled.ticks'] ?? 0
            } · socket.pushes=${counters['socket.pushes'] ?? 0}`,
            'ok'
        );
    }
}

/**
 * Connects to the lab's socket endpoint (same origin, so `'self'` covers it
 * once the CSP is widened) and starts draining pushes.
 *
 * @param socketPath - The endpoint path from `/lab/config`.
 * @returns The socket client, for the ping button.
 */
function connectSocket(socketPath: string): WebSocketClient {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const client = new WebSocketClient(`${scheme}://${location.host}${socketPath}`, {
        onStatusChange: (status: SocketStatus) => {
            if (socketStatus) {
                socketStatus.textContent = `socket: ${status}`;
            }
            log('socket', `socket ${status}`);
        },
    });
    void consumePushes(client);
    return client;
}

/**
 * Renders the server's resolved telemetry config into the page header.
 *
 * @param config - The `/lab/config` document.
 */
function renderConfigLine(config: LabConfig): void {
    if (!configLine) {
        return;
    }
    configLine.textContent = `server: sampler=${config.sampler} · export trace=${config.exporters.trace} metric=${
        config.exporters.metric
    } log=${config.exporters.log} · socket=${config.socketPath} · browser spans → ${
        config.browserTraceUrl ?? 'console'
    }`;
}

async function main(): Promise<void> {
    let config: LabConfig;
    try {
        config = await loadConfig();
    } catch (error) {
        log('err', `could not read /lab/config: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }

    configureBrowserTelemetry({
        serviceName: config.serviceName,
        useConsoleExporters: true,
        ...(config.browserTraceUrl ? { traceUrl: config.browserTraceUrl } : {}),
    });
    renderConfigLine(config);
    log('boot', `browser telemetry ready — spans export to ${config.browserTraceUrl ?? 'the console'}`);

    const socket = connectSocket(config.socketPath);

    document.getElementById('work-get')?.addEventListener('click', () => void callWork('GET', 'ndigo', 1));
    document.getElementById('work-post')?.addEventListener('click', () => void callWork('POST', 'ndigo', 2));
    document.getElementById('work-burst')?.addEventListener('click', () => {
        void (async () => {
            for (let index = 0; index < 5; index += 1) {
                // Sequential: each action is its own trace, and the panels stay readable.
                // oxlint-disable-next-line no-await-in-loop -- one trace per action, in order
                await callWork('POST', `burst-${index}`, index + 1);
            }
        })();
    });
    document.getElementById('socket-ping')?.addEventListener('click', () => {
        socket.send({ type: 'ping', at: new Date().toISOString() });
        log('socket', 'sent socket ping (counted server-side as socket.inboundMessages)');
    });

    // One traced request on load, so the console shows a complete
    // client → server continuation without the visitor clicking anything.
    void callWork('GET', 'welcome', 1);
}

void main();
