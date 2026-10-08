/**
 * The metric snapshot model — the SDK-free seam between the OpenTelemetry
 * meter provider and the management HTTP surface (AD-77 D-3).
 *
 * `@blue/telemetry` stays isomorphic: it carries neither the SDK reader
 * (`@blue/telemetry-node` implements {@link MetricSnapshotProvider} over
 * `MetricReader.collect()`) nor the HTTP surface (`@blue/management` reads
 * the registry per request).
 *
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { AttributeValue } from '@opentelemetry/api';

/**
 * One aggregated histogram bucket: `count` occurrences in `[low, high)`.
 */
export interface MetricHistogramBucket {
    readonly count: number;
    readonly low: number;
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
    readonly attributes: Record<string, AttributeValue>;
    readonly value: MetricPointValue;
}

/**
 * The aggregated shape of one metric instrument at one collection. The
 * `type` mirrors the OTel aggregation kind (`sum` — counters and
 * up-down-counters; `gauge`; `histogram`).
 */
export interface MetricSnapshot {
    readonly name: string;
    readonly description: string;
    readonly unit: string;
    readonly type: 'sum' | 'gauge' | 'histogram';
    readonly points: readonly MetricPoint[];
}

/**
 * A source of metric snapshots. Implemented by the SDK-backed reader in
 * `@blue/telemetry-node`; read by the management `/metrics` controller.
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

let current: MetricSnapshotProvider | undefined;

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
 * Clears the registered metric snapshot source.
 */
export function unregisterMetricSnapshotProvider(): void {
    current = undefined;
}

/**
 * Returns the registered metric snapshot source, or `undefined` when none is
 * registered (no telemetry configured — the `/metrics` endpoint answers its
 * "no metric source" document).
 */
export function getMetricSnapshotProvider(): MetricSnapshotProvider | undefined {
    return current;
}
