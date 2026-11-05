/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, requestMapping, parameters, headerValue } from '@ndigo/dispatcher';
import { MediaType } from '@ndigo/core';
import { ResponseEntity } from '@ndigo/platform-node';
import { ResponseStatuses } from '@ndigo/http';
import { getMetricSnapshotProvider, renderMetricJson, renderPrometheusText } from '@ndigo/telemetry';
import { ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { Null } from '@ndigo/core';

/**
 * The wire content type for the Prometheus text exposition document
 * (the versioned media type the scraper understands).
 */
export const PROMETHEUS_TEXT_CONTENT_TYPE = 'text/plain; version=0.0.4; charset=utf-8';

/**
 * Whether an `Accept` header explicitly prefers the JSON projection (AD-77
 * D-4): the single best-acceptable entry decides, ties keep header order,
 * malformed weights fall back to `1`. A JSON media type
 * (`application/json` or any `application/*+json` suffix) selects JSON;
 * everything else — absent headers, wildcard accepts, `text/plain`,
 * browsers — selects the Prometheus text document.
 */
export function prefersJsonView(accept: string | undefined): boolean {
    let best: MediaType | undefined;
    let bestQuality = 0;

    for (const entry of MediaType.parseAccept(accept)) {
        const quality = entry.qualityFactor;
        if (quality <= 0 || quality < bestQuality) {
            continue;
        }
        if (quality > bestQuality || best === undefined) {
            best = entry;
            bestQuality = quality;
        }
    }

    return best !== undefined && best.type === 'application' && (best.subtype === 'json' || best.suffix === 'json');
}

/**
 * Serves the meter snapshot under `/metrics` (AD-77 D-4): one source of
 * truth — the process's registered `MetricSnapshotProvider` — in two wire
 * forms. An `Accept: application/json` (or `*+json`) header selects the
 * JSON projection; every other request receives the Prometheus text
 * exposition document with `Content-Type: text/plain; version=0.0.4`.
 * When no snapshot source is registered (no telemetry configured), the
 * endpoint answers the classic error document.
 *
 * @since 1.0.0
 */
@requestMapping('/metrics')
export class MetricsController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Returns the metric snapshot in the negotiated wire form.
     *
     * @param accept - The `Accept` header value (absent for socket/bare calls).
     * @returns The Prometheus text document, the JSON projection, or the
     *   no-source error document.
     */
    @getMapping('/')
    @parameters({ accept: headerValue('Accept') })
    async metrics(accept?: string) {
        const provider = getMetricSnapshotProvider();
        if (!provider) {
            return { error: 'No metric source wired' };
        }

        const snapshots = await provider.snapshot();
        if (prefersJsonView(accept)) {
            return renderMetricJson(snapshots);
        }
        return new ResponseEntity(renderPrometheusText(snapshots), ResponseStatuses.OK, {
            'Content-Type': PROMETHEUS_TEXT_CONTENT_TYPE,
        });
    }
}
