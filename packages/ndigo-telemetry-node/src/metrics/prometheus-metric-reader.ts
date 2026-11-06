/**
 * The Prometheus pull reader (AD-77 D-2): an SDK `MetricReader` whose
 * `snapshot()` projects the meter provider's current aggregated state into
 * the isomorphic {@link MetricSnapshot} model — the seam `@ndigo/management`
 * serves as Prometheus text or JSON without depending on SDK types.
 *
 * The reader is pull-only: it holds nothing between requests (`onShutdown` /
 * `onForceFlush` no-ops), and every scrape calls the inherited
 * `collect()`, which resolves the bound `MetricProducer` itself.
 *
 * Exponential histograms (data points aggregated by the SDK's exponential
 * default when no explicit bucket advice is present) do not project — the
 * exposition format, the JSON projection and the Prometheus renderer all
 * model explicit buckets. Instruments created with
 * `createLazyHistogram({ boundaries })` (the semconv duration metric) always
 * land on the explicit-bucket aggregation.
 */
import type { AttributeValue } from '@opentelemetry/api';
import {
    DataPointType,
    MetricReader,
    type CollectionResult,
    type HistogramMetricData,
    type MetricData,
} from '@opentelemetry/sdk-metrics';
import type { MetricHistogramBucket, MetricPoint, MetricSnapshot } from '@ndigo/telemetry';

/**
 * A pull metric reader for the Prometheus text exposition format.
 */
export class PrometheusMetricReader extends MetricReader {
    /** {@inheritDoc} */
    protected async onShutdown(): Promise<void> {
        // Pull-only: nothing to stop.
    }

    /** {@inheritDoc} */
    protected async onForceFlush(): Promise<void> {
        // Pull-only: a scrape already collects; nothing to flush.
    }

    /**
     * Collects the current aggregated snapshot of every tracked instrument.
     *
     * @returns The projected snapshots; an empty array when the reader is not
     *   bound to a `MeterProvider` (constructed but never configured) or is
     *   shut down — the `/metrics` endpoint degrades to its "no metric
     *   source" document instead of a 500.
     */
    async snapshot(): Promise<readonly MetricSnapshot[]> {
        let result: CollectionResult;
        try {
            result = await this.collect();
        } catch {
            return [];
        }

        const snapshots: MetricSnapshot[] = [];
        for (const scope of result.resourceMetrics.scopeMetrics) {
            for (const metric of scope.metrics) {
                const snapshot = projectMetric(metric);
                if (snapshot !== undefined) {
                    snapshots.push(snapshot);
                }
            }
        }
        return snapshots;
    }
}

function projectMetric(metric: MetricData): MetricSnapshot | undefined {
    if (metric.dataPointType === DataPointType.HISTOGRAM) {
        return {
            name: metric.descriptor.name,
            description: metric.descriptor.description,
            unit: metric.descriptor.unit,
            type: 'histogram',
            points: projectHistogramPoints(metric),
        };
    }
    if (metric.dataPointType === DataPointType.SUM || metric.dataPointType === DataPointType.GAUGE) {
        return {
            name: metric.descriptor.name,
            description: metric.descriptor.description,
            unit: metric.descriptor.unit,
            type: metric.dataPointType === DataPointType.SUM ? 'sum' : 'gauge',
            points: metric.dataPoints.map((point): MetricPoint => ({
                attributes: { ...point.attributes } as Record<string, AttributeValue>,
                value: { kind: 'scalar', value: point.value },
            })),
        };
    }
    // EXPONENTIAL_HISTOGRAM: no faithful projection (see the module docs).
    return undefined;
}

function projectHistogramPoints(metric: HistogramMetricData): MetricPoint[] {
    return metric.dataPoints.map((point): MetricPoint => {
        const buckets = point.value.buckets;
        const points: MetricHistogramBucket[] = [];

        for (let i = 0; i < buckets.counts.length; i++) {
            points.push({
                count: buckets.counts[i],
                low: i === 0 ? Number.NEGATIVE_INFINITY : buckets.boundaries[i - 1],
                high: i >= buckets.boundaries.length ? Number.POSITIVE_INFINITY : buckets.boundaries[i],
            });
        }

        return {
            attributes: { ...point.attributes } as Record<string, AttributeValue>,
            value: {
                kind: 'histogram',
                count: point.value.count,
                sum: point.value.sum,
                min: point.value.min,
                max: point.value.max,
                buckets: points,
            },
        };
    });
}
