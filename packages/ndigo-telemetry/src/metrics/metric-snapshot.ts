/**
 * The metric snapshot model — the SDK-free seam between the OpenTelemetry
 * meter provider and the management HTTP surface (AD-77 D-3).
 *
 * `@ndigo/telemetry` stays isomorphic: it carries neither the SDK reader
 * (`@ndigo/telemetry-node` implements {@link MetricSnapshotProvider} over
 * `MetricReader.collect()`) nor the HTTP surface (`@ndigo/management` reads
 * the registry per request).
 */
import type { AttributeValue } from '@opentelemetry/api';

/**
 * One aggregated histogram bucket: `count` occurrences in `[low, high)`.
 */
export interface MetricHistogramBucket {
    /** Bucket occurrence count. */
    readonly count: number;
    /** Inclusive lower bound. */
    readonly low: number;
    /** Exclusive upper bound. */
    readonly high: number;
}

/**
 * The aggregated value of one metric point.
 */
export type MetricPointValue =
    | { readonly kind: 'scalar'; readonly value: number }
    | {
          readonly kind: 'histogram';
          readonly count: number;
          readonly sum: number | undefined;
          readonly min: number | undefined;
          readonly max: number | undefined;
          readonly buckets: readonly MetricHistogramBucket[];
      };

/**
 * One aggregated point: the attribute set plus the aggregated value.
 */
export interface MetricPoint {
    /** The point's attribute set. */
    readonly attributes: Record<string, AttributeValue>;
    /** The aggregated value. */
    readonly value: MetricPointValue;
}

/**
 * The aggregated shape of one metric instrument at one collection. The
 * `type` mirrors the OTel aggregation kind (`sum` — counters and
 * up-down-counters; `gauge`; `histogram`).
 */
export interface MetricSnapshot {
    /** The metric name. */
    readonly name: string;
    /** The metric description. */
    readonly description: string;
    /** The metric unit. */
    readonly unit: string;
    /** The aggregation kind. */
    readonly type: 'sum' | 'gauge' | 'histogram';
    /** The aggregated points. */
    readonly points: readonly MetricPoint[];
}

/**
 * A source of metric snapshots. Implemented by the SDK-backed reader in
 * `@ndigo/telemetry-node`; read by the management `/metrics` controller.
 */
export interface MetricSnapshotProvider {
    /** Collects the current aggregated snapshot of every tracked instrument. */
    snapshot(): Promise<readonly MetricSnapshot[]>;
}

// Single-slot registry (AD-77 D-3), mirroring OTel's global-provider pattern:
// `configureTelemetry` registers the SDK reader after `sdk.start()`, and the
// `/metrics` controller reads it per request — zero wiring between the two
// auto-configurations, the same story `FeatureMetricAggregator` had via
// context tokens.
//
// A *fallback* slot (REV-003) sits underneath the current slot: the
// management auto-configuration installs its feature aggregator there, so
// `/metrics` serves feature counters even when no telemetry pipeline (pull
// reader) is configured. A registered current provider (e.g. the
// telemetry reader) always wins over the fallback; unregistering the
// current slot falls back instead of returning `undefined`.

let current: MetricSnapshotProvider | undefined;
let fallback: MetricSnapshotProvider | undefined;

/**
 * Registers the process's metric snapshot source, replacing any previous
 * registration (hot reload, tests).
 *
 * @param provider - The provider to register (e.g. a bound `PrometheusMetricReader`).
 */
export function registerMetricSnapshotProvider(provider: MetricSnapshotProvider): void {
    current = provider;
}

/**
 * Clears the registered metric snapshot source — the fallback slot (when
 * set) now answers.
 */
export function unregisterMetricSnapshotProvider(): void {
    current = undefined;
}

/**
 * Sets or clears the fallback metric snapshot source (REV-003): the
 * aggregator-backed provider `ManagementAutoConfiguration` installs as the
 * no-telemetry default. `undefined` clears.
 *
 * @param provider - The fallback provider, or `undefined` to clear.
 */
export function setFallbackMetricSnapshotProvider(provider: MetricSnapshotProvider | undefined): void {
    fallback = provider;
}

/**
 * Returns the metric snapshot source: the registered current provider when
 * present, else the fallback, else `undefined` (no telemetry configured and
 * no auto-configuration — the `/metrics` endpoint answers its "no metric
 * source" document).
 *
 * @returns The active snapshot provider, or `undefined`.
 */
export function getMetricSnapshotProvider(): MetricSnapshotProvider | undefined {
    return current ?? fallback;
}
