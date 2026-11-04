/**
 * `@ndigo/test` `MockHTTP` integration lane for the resilience lab: the real
 * application context boots, the consumer's typed client is driven through its
 * own in-process transport, and every assertion is read off the control plane
 * rather than measured with timers.
 *
 * Response bodies are parsed with Zod at this boundary (the control plane is
 * the wire contract), so an unexpected document shape fails loudly instead of
 * slipping through a cast.
 *
 * The one non-obvious piece of wiring lives in {@link inProcessFetch}: the lab
 * runs as a single process, so the consumer's HTTP client is pointed at the
 * in-process dispatcher instead of a socket. `ResilienceLab.setUpstreamFetch`
 * is the public seam for exactly that — the same seam the running app fills
 * with its loopback transport.
 * @module ndigo-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import type { Fetch } from '@ndigo/http';
import { ManagementAutoConfiguration, METRIC_AGGREGATOR } from '@ndigo/management';
import { bootApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import {
    FeatureMetricAggregator,
    MetricSnapshot,
    MetricSnapshotProvider,
    registerMetricSnapshotProvider,
    unregisterMetricSnapshotProvider,
} from '@ndigo/telemetry';
import { LAB_FAILURE_THRESHOLD, LAB_RESET_MS, LAB_RETRY_ATTEMPTS } from '../src/lab-policy';
import { ResilienceLabConfiguration } from '../src/lab-configuration';
import { RESILIENCE_LAB } from '../src/resilience-lab';
import type { ResilienceLab } from '../src/resilience-lab';

/** The success envelope both consumer routes answer with. */
const Envelope = z.object({
    ok: z.literal(true),
    path: z.enum(['resilient', 'direct']),
    policy: z.string(),
    upstreamAttempts: z.number(),
    data: z.object({ value: z.string(), servedAt: z.string(), mode: z.string() }),
});

/** The RFC 9457 members every failing route answers with. */
const problemMembers = {
    status: z.number(),
    type: z.string().optional(),
    title: z.string(),
    detail: z.string(),
};

/** A failing consumer call: the success envelope's fields as extension members. */
const ConsumerProblem = z.object({
    ...problemMembers,
    ok: z.literal(false),
    path: z.enum(['resilient', 'direct']),
    policy: z.string(),
    failFast: z.boolean(),
    upstreamAttempts: z.number(),
    error: z.object({ name: z.string(), message: z.string() }),
});

/** A failing upstream call. */
const UpstreamProblem = z.object({
    ...problemMembers,
    error: z.literal('upstream_failure'),
    mode: z.string(),
    upstreamStatus: z.number(),
});

/** A rejected control-plane request. */
const ControlProblem = z.object({ ...problemMembers, error: z.string() });

/** The `/health` document, reduced to the parts this lane asserts on. */
const Health = z.object({
    status: z.string(),
    components: z.record(z.string(), z.object({ status: z.string() })),
});

/**
 * The `/metrics` document (AD-77 D-4): the meter-derived JSON projection.
 */
const MetricPoint = z.object({
    attributes: z.record(z.string(), z.unknown()),
    value: z.number().optional(),
});
const Metrics = z.object({
    metrics: z.record(
        z.string(),
        z.object({
            type: z.enum(['sum', 'gauge', 'histogram']),
            unit: z.string(),
            points: z.array(MetricPoint),
        })
    ),
});

/** One projected circuit in `/lab/state`. */
const Circuit = z.object({
    method: z.string(),
    state: z.enum(['closed', 'open', 'half-open']),
    failures: z.number(),
    openedAt: z.number(),
    remainingMs: z.number(),
    openCount: z.number(),
    probeCount: z.number(),
});

/** One consumer path's counters in `/lab/state`. */
const PathStats = z.object({
    calls: z.number(),
    successes: z.number(),
    failures: z.number(),
    failFast: z.number(),
    upstreamAttempts: z.number(),
    lastError: z.object({ name: z.string(), message: z.string() }).nullable(),
});

/** The full `/lab/state` document. */
const State = z.object({
    clock: z.object({ now: z.number(), offsetMs: z.number(), iso: z.string() }),
    upstream: z.object({
        mode: z.object({
            mode: z.enum(['ok', 'error', 'fail', 'pattern', 'delay']),
            status: z.number(),
            count: z.number(),
            pattern: z.string(),
            delayMs: z.number(),
        }),
        calls: z.number(),
        failures: z.number(),
        successes: z.number(),
        lastStatus: z.number().nullable(),
        remainingFailureBudget: z.number(),
        patternIndex: z.number(),
    }),
    consumer: z.object({ resilient: PathStats, direct: PathStats }),
    circuits: z.array(Circuit),
    config: z.object({
        service: z.string(),
        upstreamOrigin: z.string(),
        retryAttempts: z.number(),
        retryBackoff: z.string(),
        failureThreshold: z.number(),
        resetMs: z.number(),
    }),
    counters: z.record(z.string(), z.number()),
});

/** A parsed control-plane document. */
type StateDocument = z.infer<typeof State>;

/** A parsed circuit projection. */
type CircuitDocument = z.infer<typeof Circuit>;

/**
 * Builds the consumer's upstream transport on the in-process dispatcher: the
 * typed client's request runs the full pipeline (controllers, interceptors,
 * argument resolvers) with no socket and no port.
 *
 * @param app - The booted test application.
 * @returns A `fetch` implementation for the consumer's HTTP client.
 */
function inProcessFetch(app: NdigoTestApp): Fetch {
    const mock = new MockHTTP(app);
    return async (input) => {
        const request = input instanceof Request ? input : new Request(String(input));
        const url = new URL(request.url);
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        const result = await mock.request({
            method: request.method,
            path: url.pathname,
            query: Object.fromEntries(url.searchParams),
            headers,
        });

        const responseHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(result.response.headers)) {
            responseHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
        }
        return new Response(result.text() || null, {
            status: result.response.status,
            headers: responseHeaders,
        });
    };
}

describe('ndigo-resilience-lab', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;
    let lab: ResilienceLab;

    beforeEach(() => {
        app = bootApp([ManagementAutoConfiguration, ResilienceLabConfiguration]);
        http = new MockHTTP(app);
        lab = app.context.getValue(RESILIENCE_LAB);
        lab.setUpstreamFetch(inProcessFetch(app));

        // The lab records through the feature aggregator; `/metrics` now
        // serves the meter snapshot (AD-77 D-3/4), so the spec registers a
        // provider that projects that same aggregator — the documented
        // migration path for feature views — and scrapes the JSON view.
        registerMetricSnapshotProvider(
            aggregatorSnapshotProvider(app.context.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR))
        );
    });

    afterEach(() => {
        unregisterMetricSnapshotProvider();
        app.close();
    });

    /**
     * Projects a `FeatureMetricAggregator` into the meter snapshot model —
     * the spec-side bridge between the lab's aggregator records and the
     * meter-derived `/metrics` endpoint (AD-77).
     */
    function aggregatorSnapshotProvider(aggregator: FeatureMetricAggregator): MetricSnapshotProvider {
        return {
            async snapshot(): Promise<readonly MetricSnapshot[]> {
                const snapshots: MetricSnapshot[] = [];
                for (const feature of aggregator.featureNames) {
                    const metrics = aggregator.getFeatureMetrics(feature);
                    if (!metrics) {
                        continue;
                    }
                    for (const [name, value] of metrics.counters) {
                        snapshots.push({
                            name,
                            description: `Feature counter '${name}' (${feature}, aggregator projection)`,
                            unit: '',
                            type: 'sum',
                            points: [{ attributes: { feature }, value: { kind: 'scalar', value } }],
                        });
                    }
                    for (const [name, value] of metrics.gauges) {
                        snapshots.push({
                            name,
                            description: `Feature gauge '${name}' (${feature}, aggregator projection)`,
                            unit: '',
                            type: 'gauge',
                            points: [{ attributes: { feature }, value: { kind: 'scalar', value } }],
                        });
                    }
                }
                return snapshots;
            },
        };
    }

    /** The validated `/lab/state` document. */
    async function state(): Promise<StateDocument> {
        const res = await http.get('/lab/state').exec();
        expect(res.response.status).toBe(200);
        return State.parse(res.json());
    }

    /** Applies an upstream mode and fails the test if the control plane refused it. */
    async function setMode(body: Record<string, unknown>): Promise<void> {
        const res = await http.post('/lab/mode').body(body).exec();
        expect(res.response.status).toBe(200);
    }

    /** Moves the lab clock, which moves every breaker reset window. */
    async function advanceClock(advanceMs: number): Promise<void> {
        const res = await http.post('/lab/clock').body({ advanceMs }).exec();
        expect(res.response.status).toBe(200);
    }

    /** The projected circuit for the advised `data()` method. */
    function circuitOf(snapshot: StateDocument): CircuitDocument {
        const circuit = snapshot.circuits.find((candidate) => candidate.method === 'data');
        if (circuit === undefined) {
            throw new Error("no circuit projection for the client's data() method");
        }
        return circuit;
    }

    /** Drives `LAB_FAILURE_THRESHOLD` failing chain passes to open the circuit. */
    async function openCircuit(): Promise<void> {
        await setMode({ mode: 'error' });
        for (let attempt = 0; attempt < LAB_FAILURE_THRESHOLD; attempt += 1) {
            // The passes must be sequential: the breaker counts one failure per
            // *completed* chain pass.
            // eslint-disable-next-line no-await-in-loop -- sequential on purpose
            const res = await http.get('/consumer/data').exec();
            expect(res.response.status).toBe(502);
        }
        expect(circuitOf(await state()).state).toBe('open');
    }

    test('boots healthy with the breaker indicator registered', async () => {
        const res = await http.get('/health').exec();

        expect(res.response.status).toBe(200);
        const body = Health.parse(res.json());
        expect(body.status).toBe('UP');
        expect(body.components['circuit-breakers']?.status).toBe('UP');
    });

    test('the upstream serves whatever the control plane set', async () => {
        const ok = await http.get('/upstream/data').exec();
        expect(ok.response.status).toBe(200);
        expect(z.object({ value: z.string() }).parse(ok.json()).value).toBe('upstream-ok');

        await setMode({ mode: 'error', status: 500 });
        const failed = await http.get('/upstream/data').exec();
        expect(failed.response.status).toBe(500);
        const problem = UpstreamProblem.parse(failed.json());
        expect(problem.error).toBe('upstream_failure');
        expect(problem.mode).toBe('error');
        expect(problem.upstreamStatus).toBe(500);

        const snapshot = await state();
        expect(snapshot.upstream.calls).toBe(2);
        expect(snapshot.upstream.failures).toBe(1);
        expect(snapshot.upstream.lastStatus).toBe(500);
    });

    test('retry absorbs two transient failures and the control plane counts the attempts', async () => {
        await setMode({ mode: 'fail', count: 2 });

        const res = await http.get('/consumer/data').exec();

        expect(res.response.status).toBe(200);
        const body = Envelope.parse(res.json());
        expect(body.policy).toBe('retry+circuitBreaker');
        expect(body.upstreamAttempts).toBe(LAB_RETRY_ATTEMPTS);
        expect(body.data.mode).toBe('fail');

        const snapshot = await state();
        expect(snapshot.upstream.calls).toBe(LAB_RETRY_ATTEMPTS);
        expect(snapshot.upstream.failures).toBe(2);
        expect(snapshot.consumer.resilient.calls).toBe(1);
        expect(snapshot.consumer.resilient.successes).toBe(1);
        expect(snapshot.consumer.resilient.failures).toBe(0);
        expect(circuitOf(snapshot).state).toBe('closed');
    });

    test('retry exhaustion surfaces the error and counts every attempt', async () => {
        await setMode({ mode: 'error' });

        const res = await http.get('/consumer/data').exec();

        expect(res.response.status).toBe(502);
        const problem = ConsumerProblem.parse(res.json());
        expect(problem.title).toBe('Bad Gateway');
        expect(problem.failFast).toBe(false);
        expect(problem.upstreamAttempts).toBe(LAB_RETRY_ATTEMPTS);
        expect(problem.error.name).toBe('IllegalStateError');
        expect(problem.error.message).toContain('response validation failed');

        const snapshot = await state();
        expect(snapshot.upstream.calls).toBe(LAB_RETRY_ATTEMPTS);
        expect(snapshot.consumer.resilient.failures).toBe(1);
        expect(snapshot.consumer.resilient.lastError?.name).toBe('IllegalStateError');
        expect(circuitOf(snapshot).state).toBe('closed');
    });

    test('the breaker opens at the failure threshold and then fails fast', async () => {
        await openCircuit();

        const attemptsBefore = (await state()).upstream.calls;
        const res = await http.get('/consumer/data').exec();

        expect(res.response.status).toBe(503);
        const problem = ConsumerProblem.parse(res.json());
        expect(problem.title).toBe('Service Unavailable');
        expect(problem.type).toBe('urn:ndigo:service-unavailable');
        expect(problem.failFast).toBe(true);
        expect(problem.upstreamAttempts).toBe(0);
        expect(problem.error.name).toBe('CircuitOpenError');

        const snapshot = await state();
        expect(snapshot.upstream.calls).toBe(attemptsBefore);
        expect(snapshot.consumer.resilient.failFast).toBe(1);
        expect(snapshot.counters['breaker.opened']).toBe(1);
        expect(circuitOf(snapshot).remainingMs).toBeGreaterThan(0);

        const metrics = await http.get('/metrics').headers({ accept: 'application/json' }).exec();
        const gauge = Metrics.parse(metrics.json()).metrics['breaker.state.data'];
        expect(gauge?.type).toBe('gauge');
        expect(gauge?.points[0].value).toBe(2);

        const health = await http.get('/health').exec();
        expect(health.response.status).toBe(503);
        expect(Health.parse(health.json()).components['circuit-breakers']?.status).toBe('DOWN');
    });

    test('the breaker keeps failing fast until the reset window has elapsed', async () => {
        await openCircuit();
        await advanceClock(LAB_RESET_MS / 2);

        const res = await http.get('/consumer/data').exec();

        expect(res.response.status).toBe(503);
        expect(ConsumerProblem.parse(res.json()).failFast).toBe(true);
        expect(circuitOf(await state()).state).toBe('open');
    });

    test('one probe after the reset window closes the circuit', async () => {
        await openCircuit();
        await setMode({ mode: 'ok' });
        await advanceClock(LAB_RESET_MS);

        const probe = await http.get('/consumer/data').exec();

        expect(probe.response.status).toBe(200);
        expect(Envelope.parse(probe.json()).upstreamAttempts).toBe(1);

        const snapshot = await state();
        const circuit = circuitOf(snapshot);
        expect(circuit.state).toBe('closed');
        expect(circuit.probeCount).toBe(1);
        expect(circuit.openCount).toBe(1);
        expect(snapshot.counters['breaker.closed']).toBe(1);

        const health = await http.get('/health').exec();
        expect(health.response.status).toBe(200);
    });

    test('a failed probe re-opens the circuit with a fresh window', async () => {
        await openCircuit();
        await advanceClock(LAB_RESET_MS);

        const probe = await http.get('/consumer/data').exec();

        expect(probe.response.status).toBe(502);
        expect(ConsumerProblem.parse(probe.json()).upstreamAttempts).toBe(LAB_RETRY_ATTEMPTS);

        const circuit = circuitOf(await state());
        expect(circuit.state).toBe('open');
        expect(circuit.openCount).toBe(2);
        expect(circuit.probeCount).toBe(1);
        expect(circuit.remainingMs).toBeGreaterThan(0);
    });

    test('the direct route bypasses the policies entirely', async () => {
        await openCircuit();

        const advised = await http.get('/consumer/data').exec();
        expect(advised.response.status).toBe(503);
        expect(ConsumerProblem.parse(advised.json()).failFast).toBe(true);

        const direct = await http.get('/consumer/direct').exec();
        expect(direct.response.status).toBe(502);
        const directProblem = ConsumerProblem.parse(direct.json());
        expect(directProblem.policy).toBe('none');
        expect(directProblem.upstreamAttempts).toBe(1);
        expect(directProblem.failFast).toBe(false);

        await setMode({ mode: 'ok' });
        const recovered = await http.get('/consumer/direct').exec();
        expect(recovered.response.status).toBe(200);

        const snapshot = await state();
        expect(snapshot.consumer.direct.calls).toBe(2);
        expect(snapshot.consumer.direct.successes).toBe(1);
        expect(snapshot.consumer.direct.failures).toBe(1);
        expect(snapshot.consumer.direct.failFast).toBe(0);
        // A successful direct call is invisible to the breaker: it stays open.
        expect(circuitOf(snapshot).state).toBe('open');
    });

    test('pattern mode drives deterministic per-call attempt counts', async () => {
        await setMode({ mode: 'pattern', pattern: 'FFFFS' });

        const failed = await http.get('/consumer/data').exec();
        expect(failed.response.status).toBe(502);
        expect(ConsumerProblem.parse(failed.json()).upstreamAttempts).toBe(LAB_RETRY_ATTEMPTS);

        const recovered = await http.get('/consumer/data').exec();
        expect(recovered.response.status).toBe(200);
        expect(Envelope.parse(recovered.json()).upstreamAttempts).toBe(2);

        const snapshot = await state();
        expect(snapshot.upstream.calls).toBe(5);
        expect(snapshot.upstream.mode.pattern).toBe('FFFFS');
        expect(snapshot.upstream.patternIndex).toBe(5);
    });

    test('metrics expose the same counters the control plane reports', async () => {
        await setMode({ mode: 'fail', count: 1 });
        await http.get('/consumer/data').exec();

        const res = await http.get('/metrics').headers({ accept: 'application/json' }).exec();

        expect(res.response.status).toBe(200);
        const metrics = Metrics.parse(res.json()).metrics;
        expect(metrics['upstream.calls']?.type).toBe('sum');
        expect(metrics['upstream.calls']?.points[0].value).toBe(2);
        expect(metrics['consumer.calls']?.points[0].value).toBe(1);
        expect(metrics['consumer.successes']?.points[0].value).toBe(1);
        // Closed circuit → the gauge the breaker projection publishes.
        expect(metrics['breaker.state.data']).toMatchObject({ type: 'gauge', points: [{ value: 0 }] });

        const snapshot = await state();
        expect(snapshot.counters['upstream.calls']).toBe(metrics['upstream.calls']?.points[0].value);
    });

    test('the control plane rejects invalid settings', async () => {
        const badMode = await http.post('/lab/mode').body({ mode: 'nope' }).exec();
        expect(badMode.response.status).toBe(400);
        expect(ControlProblem.parse(badMode.json()).error).toBe('invalid_mode');

        const badCount = await http.post('/lab/mode').body({ mode: 'fail', count: -1 }).exec();
        expect(badCount.response.status).toBe(400);

        const badPattern = await http.post('/lab/mode').body({ mode: 'pattern', pattern: 'FSX' }).exec();
        expect(badPattern.response.status).toBe(400);

        const badClock = await http.post('/lab/clock').body({ advanceMs: -5 }).exec();
        expect(badClock.response.status).toBe(400);
        expect(ControlProblem.parse(badClock.json()).error).toBe('invalid_clock');
    });

    test('POST /lab/reset returns the lab to a known starting state', async () => {
        await setMode({ mode: 'error' });
        await http.get('/consumer/data').exec();
        expect((await state()).upstream.calls).toBe(LAB_RETRY_ATTEMPTS);

        const res = await http.post('/lab/reset').exec();

        expect(res.response.status).toBe(200);
        const snapshot = State.parse(res.json());
        expect(snapshot.upstream.mode.mode).toBe('ok');
        expect(snapshot.upstream.calls).toBe(0);
        expect(snapshot.clock.offsetMs).toBe(0);
        expect(circuitOf(snapshot).state).toBe('closed');

        const after = await http.get('/consumer/data').exec();
        expect(after.response.status).toBe(200);
    });
});
