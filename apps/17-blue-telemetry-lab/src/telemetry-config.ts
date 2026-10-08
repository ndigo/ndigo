/**
 * The lab's telemetry wiring resolved from the environment (AD-32, guide 10).
 *
 * Two things are deliberately separate:
 *
 * - {@link resolveLabTelemetry} is **pure**: it reports the exporter/sampler
 *   choice the process should configure. `src/index.ts` hands the result to
 *   `configureTelemetry` (which registers the OTel global providers once per
 *   process), and `GET /lab/config` serves the same description to the page —
 *   so the browser can see exactly what the server booted with.
 * - The description is safe to compute in tests, where registering global
 *   providers would leak across a worker; nothing here touches the OTel API.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getEnv } from '@blue/context';
import { DispatcherInstrumentation } from '@blue/telemetry';
import {
    HTTPServerInstrumentation,
    WebSocketServerInstrumentation,
    type SamplerSpec,
    type TelemetryConfig,
} from '@blue/telemetry-node';

/** The value `BLUE_TELEMETRY_SAMPLER=off` resolves to. */
export const SAMPLER_OFF = 'off';

/** The value `BLUE_TELEMETRY_SAMPLER=always` (the default) resolves to. */
export const SAMPLER_ALWAYS = 'always';

/** The value `BLUE_TELEMETRY_METRIC_EXPORTER=prometheus` resolves to. */
export const METRIC_EXPORTER_PROMETHEUS = 'prometheus';

/**
 * The lab's resolved telemetry setup — what was configured, in words.
 */
export interface ResolvedLabTelemetry {
    /** The config handed to `configureTelemetry` at boot. */
    readonly config: TelemetryConfig;
    /** Human-readable sampler description (`always`, `off`, `ratio 0.25`). */
    readonly sampler: string;
    /** Per-signal export target description (`console` or the OTLP endpoint). */
    readonly exporters: { readonly trace: string; readonly metric: string; readonly log: string };
    /** The OTLP/HTTP base endpoint, when one is configured. */
    readonly otlpEndpoint: string | undefined;
    /** The collector trace URL handed to the browser, when configured. */
    readonly browserTraceUrl: string | undefined;
}

/**
 * Parses `BLUE_TELEMETRY_SAMPLER`: `always` (default), `off`, or a ratio in
 * `[0, 1]` (e.g. `0.25`). Fails loud on anything else — a typo must not
 * silently mean "always" in an environment where sampling is a cost control.
 *
 * @param raw - The raw environment value.
 * @returns The sampler spec for `configureTelemetry`.
 */
export function parseSamplerSpec(raw: string | undefined): SamplerSpec {
    const value = raw?.trim();
    if (value === undefined || value === '' || value === SAMPLER_ALWAYS) {
        return SAMPLER_ALWAYS;
    }
    if (value === SAMPLER_OFF) {
        return SAMPLER_OFF;
    }
    const ratio = Number(value);
    if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
        throw new RangeError(
            `BLUE_TELEMETRY_SAMPLER must be 'always', 'off', or a ratio in [0, 1] — got '${String(raw)}'`
        );
    }
    return { ratio };
}

/**
 * Describes a sampler spec the way `/lab/config` reports it.
 *
 * @param spec - The sampler spec.
 * @returns The human-readable description.
 */
export function describeSampler(spec: SamplerSpec): string {
    if (spec === SAMPLER_ALWAYS) {
        return 'always (100% of root spans)';
    }
    if (spec === SAMPLER_OFF) {
        return 'off (root spans dropped; children follow the caller)';
    }
    if (typeof spec === 'object' && 'ratio' in spec) {
        return `ratio ${spec.ratio} (kept per root span; children follow the root decision)`;
    }
    return 'custom OpenTelemetry sampler';
}

/**
 * Reads the lab's telemetry environment and resolves the boot configuration.
 *
 * - `OTEL_EXPORTER_OTLP_ENDPOINT` — when set, traces, metrics, and logs are
 *   exported there (`<endpoint>/v1/{traces,metrics,logs}`); otherwise the
 *   console exporters are used.
 * - `BLUE_TELEMETRY_METRIC_EXPORTER=prometheus` — override for the metric
 *   signal only (wins over the OTLP endpoint, AD-77): the pull reader backs
 *   `/metrics` in the Prometheus text exposition format (and its JSON
 *   projection) — `curl localhost:<port>/metrics` is the scrape contract.
 * - `BLUE_TELEMETRY_SAMPLER` — `always` (default), `off`, or a `[0, 1]` ratio.
 * - `BLUE_TELEMETRY_BROWSER_TRACE_URL` — the collector trace URL handed to the
 *   page (browsers need a reachable URL, which is rarely the in-cluster one).
 *
 * @returns The resolved setup (config + description).
 */
export function resolveLabTelemetry(): ResolvedLabTelemetry {
    const otlpEndpoint = getEnv('OTEL_EXPORTER_OTLP_ENDPOINT');
    const samplerSpec = parseSamplerSpec(getEnv('BLUE_TELEMETRY_SAMPLER'));
    const target = otlpEndpoint ?? 'console';
    const browserTraceUrl = getEnv('BLUE_TELEMETRY_BROWSER_TRACE_URL');
    const usePrometheusMetrics = getEnv('BLUE_TELEMETRY_METRIC_EXPORTER')?.trim() === METRIC_EXPORTER_PROMETHEUS;

    return {
        config: {
            sampler: samplerSpec,
            instrumentations: [
                new HTTPServerInstrumentation(),
                new WebSocketServerInstrumentation(),
                new DispatcherInstrumentation(),
            ],
            traceExporter: otlpEndpoint ? { url: `${otlpEndpoint}/v1/traces` } : 'console',
            metricExporter: usePrometheusMetrics
                ? METRIC_EXPORTER_PROMETHEUS
                : otlpEndpoint
                  ? { url: `${otlpEndpoint}/v1/metrics` }
                  : 'console',
            logExporter: otlpEndpoint ? { url: `${otlpEndpoint}/v1/logs` } : 'console',
        },
        sampler: describeSampler(samplerSpec),
        exporters: {
            trace: target,
            metric: usePrometheusMetrics ? 'prometheus (pull)' : target,
            log: target,
        },
        otlpEndpoint,
        browserTraceUrl,
    };
}
