/**
 * Renders metric snapshots in the Prometheus text exposition format
 * (AD-77 D-5). The projection rules:
 * - `sum` snapshots → `* counter` lines;
 * - `gauge` snapshots → `* gauge` lines;
 * - `histogram` snapshots → a `<name>_count` counter plus a `<name>_sum`
 *   gauge per point (the exposition format has no histogram type; count+sum
 *   is the stable projection Grafana/alerting consume — mean = sum / count);
 * - OTel instrument names are emitted via {@link sanitizePrometheusName}
 *   (invalid characters become `_` — the exposition grammar is
 *   `[a-zA-Z_:][a-zA-Z0-9_:.]*`);
 * - attribute maps are emitted in sorted key order with grammar escaping
 *   (`\` → `\\`, `"` → `\"`, newline → `\n`); only scalar values
 *   (string/number/boolean) render — non-scalar attribute values are
 *   skipped, matching what the aggregation layer emits in practice.
 *
 * Deterministic output is the testable contract: the same snapshot array
 * always renders the same document.
 *
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { AttributeValue } from '@opentelemetry/api';
import { MetricSnapshot } from './metric-snapshot';

const invalidNameCharacter = /[^a-zA-Z0-9_:.]/g;

/**
 * Sanitizes an OTel instrument name to the Prometheus name grammar
 * `[a-zA-Z_:][a-zA-Z0-9_:.]*`: every invalid character becomes `_`, and a
 * leading digit gains an `_` prefix (a name may not start with a digit).
 */
export function sanitizePrometheusName(name: string): string {
    const sanitized = name.replace(invalidNameCharacter, '_');
    return sanitized.length > 0 && !/[a-zA-Z_:]/.test(sanitized[0]) ? `_${sanitized}` : sanitized;
}

function escapeString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function scalarLiteral(value: AttributeValue): string | undefined {
    if (typeof value === 'string') {
        return `"${escapeString(value)}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return undefined;
}

/**
 * Renders the attribute set as `{k="v",...}` in sorted key order. Only
 * scalar values render; empty sets render as `{}`. Keys pass through
 * {@link sanitizePrometheusName} — an attribute key outside the exposition
 * grammar would otherwise produce a malformed document (REV-004) — and a
 * sanitized collision within one set keeps the first key.
 */
export function renderPrometheusAttributes(attributes: Readonly<Record<string, AttributeValue>>): string {
    const parts: string[] = [];
    const seen = new Set<string>();
    for (const key of Object.keys(attributes as object).sort() as string[]) {
        const name = sanitizePrometheusName(key);
        if (seen.has(name)) continue;
        seen.add(name);
        const literal = scalarLiteral(attributes[key]);
        if (literal !== undefined) {
            parts.push(`${name}=${literal}`);
        }
    }
    return parts.length === 0 ? '{}' : `{${parts.join(',')}}`;
}

function dataLine(name: string, attributes: Readonly<Record<string, AttributeValue>>, value: number): string {
    return `${name}${renderPrometheusAttributes(attributes)} ${String(value)}`;
}

/**
 * Renders a snapshot array to a Prometheus text document. An empty snapshot
 * array renders an empty document.
 *
 * @param snapshots - The snapshot array to render.
 * @returns The exposition-format document (trailing newline, never a bare join).
 */
export function renderPrometheusText(snapshots: readonly MetricSnapshot[]): string {
    const lines: string[] = [];
    const seenNames = new Set<string>();

    for (const snapshot of snapshots) {
        if (snapshot.type === 'histogram') {
            const countName = sanitizePrometheusName(`${snapshot.name}_count`);
            const sumName = sanitizePrometheusName(`${snapshot.name}_sum`);
            // REV-004: two instruments whose names differ only in
            // non-grammar characters sanitize to the same exposition name —
            // the document would carry duplicate metric names (scrapers
            // reject/overwrite). First wins; the JSON view keeps both.
            if (seenNames.has(countName) || seenNames.has(sumName)) {
                continue;
            }
            seenNames.add(countName);
            seenNames.add(sumName);
            lines.push(`# TYPE ${countName} counter`);
            if (snapshot.description.length > 0) {
                lines.push(`# HELP ${countName} ${snapshot.description.replace(/\n/g, ' ')}`);
            }
            for (const point of snapshot.points) {
                if (point.value.kind !== 'histogram') {
                    continue;
                }
                lines.push(dataLine(countName, point.attributes, point.value.count));
            }
            lines.push(`# TYPE ${sumName} gauge`);
            for (const point of snapshot.points) {
                if (point.value.kind !== 'histogram' || point.value.sum === undefined) {
                    continue;
                }
                lines.push(dataLine(sumName, point.attributes, point.value.sum));
            }
            continue;
        }

        const type = snapshot.type === 'gauge' ? 'gauge' : 'counter';
        const name = sanitizePrometheusName(snapshot.name);
        if (seenNames.has(name)) {
            continue;
        }
        seenNames.add(name);
        lines.push(`# TYPE ${name} ${type}`);
        if (snapshot.description.length > 0) {
            lines.push(`# HELP ${name} ${snapshot.description.replace(/\n/g, ' ')}`);
        }
        for (const point of snapshot.points) {
            if (point.value.kind !== 'scalar') {
                continue;
            }
            lines.push(dataLine(name, point.attributes, point.value.value));
        }
    }

    return lines.length === 0 ? '' : `${lines.join('\n')}\n`;
}
