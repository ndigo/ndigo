/**
 * The JSON projection of metric snapshots (AD-77 D-4): the same
 * {@link MetricSnapshot} array the Prometheus renderer consumes, as a
 * deterministic JSON document. One source of truth, two wire forms.
 */
import type { AttributeValue } from '@opentelemetry/api';
import { compareBy, stringComparator } from '@ndigo/core';

import { MetricHistogramBucket, MetricSnapshot } from './metric-snapshot';

/**
 * The JSON form of one aggregated point.
 */
export interface MetricJSONPoint {
    /** The point's attribute set. */
    readonly attributes: Record<string, AttributeValue>;
    /** The aggregated value — present for `sum`/`gauge` snapshots. */
    readonly value?: number;
    /** The histogram statistics — present for `histogram` snapshots. */
    readonly histogram?: {
        readonly count: number;
        readonly sum?: number;
        readonly min?: number;
        readonly max?: number;
        readonly buckets: readonly MetricHistogramBucket[];
    };
}

/**
 * The JSON form of one snapshot.
 */
export interface MetricJSONEntry {
    /** The metric type. */
    readonly type: 'sum' | 'gauge' | 'histogram';
    /** The metric unit. */
    readonly unit: string;
    /** Optional metric description. */
    readonly description?: string;
    /** The aggregated points. */
    readonly points: readonly MetricJSONPoint[];
}

/**
 * The complete JSON projection: `{ metrics: { <name>: MetricJSONEntry } }`.
 */
export interface MetricJSONView {
    /** Snapshots keyed by metric name. */
    readonly metrics: Readonly<Record<string, MetricJSONEntry>>;
}

/**
 * Projects a snapshot array into the JSON view, ordered by snapshot name.
 *
 * @param snapshots - The snapshot array to project.
 * @returns The view document.
 */
export function renderMetricJson(snapshots: readonly MetricSnapshot[]): MetricJSONView {
    const metrics: Record<string, MetricJSONEntry> = {};

    for (const snapshot of [...snapshots].sort(compareBy((item) => item.name, stringComparator.compare))) {
        const points: MetricJSONPoint[] = [];

        for (const point of snapshot.points) {
            if (point.value.kind === 'scalar') {
                points.push({ attributes: point.attributes, value: point.value.value });
                continue;
            }
            points.push({
                attributes: point.attributes,
                histogram: {
                    count: point.value.count,
                    ...(point.value.sum === undefined ? {} : { sum: point.value.sum }),
                    ...(point.value.min === undefined ? {} : { min: point.value.min }),
                    ...(point.value.max === undefined ? {} : { max: point.value.max }),
                    buckets: point.value.buckets,
                },
            });
        }

        metrics[snapshot.name] = {
            type: snapshot.type,
            unit: snapshot.unit,
            ...(snapshot.description.length === 0 ? {} : { description: snapshot.description }),
            points,
        };
    }

    return { metrics };
}
