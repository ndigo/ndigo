/**
 * The typed consumer contract: a `@ndigo/service` client whose `data()` method
 * carries the `@retry` + `@circuitBreaker` policies and whose `direct()` method
 * deliberately carries none, so the lab can contrast policy-driven and raw
 * calls against the same upstream.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getCall, service } from '@ndigo/service';
import { circuitBreaker, retry } from '@ndigo/resilience';
import { z } from 'zod';
import {
    LAB_BACKOFF,
    LAB_FAILURE_THRESHOLD,
    LAB_RESET_MS,
    LAB_RETRY_ATTEMPTS,
    LAB_SERVICE_NAME,
    UPSTREAM_ORIGIN,
} from './lab-policy';

/**
 * The response schema the client validates. A failing upstream answers with an
 * `{ error, … }` body, which this schema rejects — so the failure surfaces as
 * the service layer's `IllegalStateError` (AD-43 D-8: `HTTP.request` never
 * throws transport failures, the schema-validating client is the real throw).
 */
export const UpstreamPayload = z.object({
    /** Constant success marker. */
    value: z.string(),
    /** ISO timestamp the upstream produced the value. */
    servedAt: z.string(),
    /** The upstream behaviour that served this call. */
    mode: z.string(),
});

/** The validated upstream payload. */
export type UpstreamPayload = z.infer<typeof UpstreamPayload>;

/**
 * The upstream API as the consumer sees it.
 *
 * `baseUrl` is the service's *logical* origin: the lab's transport maps it onto
 * the loopback listener in a running process, and onto the in-process
 * dispatcher in tests (`ResilienceLab.setUpstreamFetch`). The methods are
 * metadata-only — `serviceClient` provides the implementations.
 */
@service(LAB_SERVICE_NAME, { baseUrl: UPSTREAM_ORIGIN })
export class UpstreamAPI {
    /**
     * `GET /upstream/data` through retry + circuit breaker: three attempts with
     * exponential backoff, and a circuit that opens after three consecutive
     * failing chain passes.
     */
    @retry({ attempts: LAB_RETRY_ATTEMPTS, backoff: LAB_BACKOFF })
    @circuitBreaker({ failureThreshold: LAB_FAILURE_THRESHOLD, resetMs: LAB_RESET_MS })
    @getCall('/upstream/data', { responseSchema: UpstreamPayload })
    data(): Promise<UpstreamPayload> {
        throw new TypeError('UpstreamAPI.data is metadata-only — call it through serviceClient().');
    }

    /**
     * The identical call with no policy annotations: the weave leaves it as a
     * target-bound pass-through, so `/consumer/direct` shows the untreated
     * upstream behaviour even while the circuit is open.
     */
    @getCall('/upstream/data', { responseSchema: UpstreamPayload })
    direct(): Promise<UpstreamPayload> {
        throw new TypeError('UpstreamAPI.direct is metadata-only — call it through serviceClient().');
    }
}
