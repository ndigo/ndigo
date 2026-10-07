/**
 * The lab runtime: a controllable flaky upstream plus one typed `@blue/service`
 * client woven with `@blue/resilience` policies.
 *
 * The client is a single object for the whole process:
 *
 * ```text
 * interceptMethods(serviceClient(UpstreamAPI, HTTP), [tracker, breaker, retry])
 * ```
 *
 * `tracker` (the lab's breaker projection) runs outermost so it sees the final
 * outcome of one chain pass, `breaker` counts one failure per pass, and `retry`
 * re-invokes the tail with backoff — the composition AD-43 D-5/D-7 prescribes.
 * @module blue-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, ContextToken } from '@blue/context';
import type { ApplicationContext } from '@blue/context';
import { HTTP } from '@blue/http';
import type { Fetch } from '@blue/http';
import { HEALTH_REGISTRY, METRIC_AGGREGATOR } from '@blue/management';
import type { HealthRegistry } from '@blue/management';
import { interceptMethods } from '@blue/proxy';
import { CircuitBreakerInterceptor, RetryInterceptor } from '@blue/resilience';
import { serviceClient } from '@blue/service';
import type { FeatureMetricAggregator } from '@blue/telemetry';
import { BreakerHealthIndicator } from './breaker-health-indicator';
import { BreakerStateTracker } from './breaker-state-tracker';
import type { BreakerEvent, BreakerObserver } from './breaker-state-tracker';
import { LabClock } from './lab-clock';
import {
    LAB_BACKOFF_LABEL,
    LAB_FAILURE_THRESHOLD,
    LAB_FEATURE,
    LAB_RESET_MS,
    LAB_RETRY_ATTEMPTS,
    LAB_SERVICE_NAME,
    UPSTREAM_ORIGIN,
} from './lab-policy';
import type {
    ConsumerCallResult,
    ConsumerPath,
    ConsumerPathStats,
    LabSnapshot,
    UpstreamMode,
    UpstreamModeInput,
    UpstreamOutcome,
} from './lab-types';
import { UpstreamSimulator } from './upstream-simulator';
import { UpstreamAPI } from './upstream-api';

/** The context token the lab registers under (`context.getValue(RESILIENCE_LAB)`). */
export const RESILIENCE_LAB = new ContextToken<ResilienceLab>('resilienceLab');

/** Every counter the lab tracks — the `/lab/state.counterers` and `/metrics` key set. */
export const LAB_COUNTERS = [
    'upstream.calls',
    'upstream.failures',
    'consumer.calls',
    'consumer.successes',
    'consumer.failures',
    'consumer.failFast',
    'consumer.upstreamAttempts',
    'consumer.direct.calls',
    'consumer.direct.successes',
    'consumer.direct.failures',
    'consumer.direct.upstreamAttempts',
    'breaker.opened',
    'breaker.probes',
    'breaker.closed',
] as const;

/** A counter name. */
export type LabCounter = (typeof LAB_COUNTERS)[number];

/**
 * @returns A counter record with every known counter at zero.
 */
function zeroCounters(): Record<LabCounter, number> {
    const counters = {} as Record<LabCounter, number>;
    for (const name of LAB_COUNTERS) {
        counters[name] = 0;
    }
    return counters;
}

/**
 * Maps the consumer's logical service origin onto this process's own loopback
 * listener, so the typed client's call is a real HTTP request to the same
 * process — a single-process lab with a genuine client/server boundary.
 *
 * @param port - The port the lab's own server listens on.
 * @returns A `fetch` implementation for the consumer's HTTP client.
 */
function loopbackFetch(port: string): Fetch {
    const loopback = `http://127.0.0.1:${port}`;
    return (input) => {
        const request = input instanceof Request ? input : new Request(String(input));
        const url = new URL(request.url);
        return globalThis.fetch(new URL(`${url.pathname}${url.search}`, loopback).href, {
            method: request.method,
            headers: request.headers,
        });
    };
}

/**
 * Owns the lab's state: the upstream simulator, the lab clock, the intercepted
 * consumer client, its counters, and the breaker projection the control plane
 * and health indicator read.
 */
export class ResilienceLab extends AsApplicationContextAware(Object) implements BreakerObserver {
    readonly applicationContext!: ApplicationContext;

    readonly #clock = new LabClock();
    readonly #simulator = new UpstreamSimulator();
    readonly #tracker: BreakerStateTracker;
    readonly #client: UpstreamAPI;
    #transport: Fetch;
    #aggregator?: FeatureMetricAggregator;
    #counters = zeroCounters();
    #lastError: Partial<Record<ConsumerPath, { name: string; message: string }>> = {};

    /**
     * @param port - The port the lab's own server listens on (the loopback
     * target of the consumer's transport).
     */
    constructor(port: string) {
        super();
        this.#tracker = new BreakerStateTracker({ now: () => this.#clock.now(), observer: this });
        this.#transport = loopbackFetch(port);
        // `serviceClient` is declared `(target: T) => T`, but a decorated class
        // is passed by its constructor while the value it hands back is the
        // *instance* — the shape every `@blue/service` consumer sees (see the
        // package README). One named cast keeps `#client` on the instance type.
        const target = UpstreamAPI as unknown as UpstreamAPI;
        this.#client = interceptMethods(
            serviceClient(
                target,
                HTTP.create({
                    baseURL: UPSTREAM_ORIGIN,
                    fetch: (input, init) => this.#transport(input, init),
                })
            ),
            [this.#tracker, new CircuitBreakerInterceptor({ now: () => this.#clock.now() }), new RetryInterceptor()]
        );
    }

    /** The intercepted client the consumer controller drives. */
    get client(): UpstreamAPI {
        return this.#client;
    }

    /** The lab's clock, shared by the breaker and the projection. */
    get clock(): LabClock {
        return this.#clock;
    }

    /**
     * Registers the breaker health indicator and captures the context.
     *
     * @param context - The application context.
     */
    override setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        context
            .getValue<HealthRegistry>(HEALTH_REGISTRY)
            .register(new BreakerHealthIndicator(() => this.#tracker.snapshots()));
    }

    /**
     * Replaces the upstream transport — tests point it at the in-process
     * dispatcher instead of the loopback listener.
     *
     * @param fetch - The transport the consumer's HTTP client uses.
     */
    setUpstreamFetch(fetch: Fetch): void {
        this.#transport = fetch;
    }

    /**
     * Applies a new upstream behaviour from the control plane.
     *
     * @param input - The raw mode fields.
     * @returns The normalized mode that took effect.
     */
    setMode(input: UpstreamModeInput): UpstreamMode {
        return this.#simulator.setMode(input);
    }

    /**
     * Serves one upstream request and counts it.
     *
     * @returns The simulated response.
     */
    async serveUpstream(): Promise<UpstreamOutcome> {
        const outcome = await this.#simulator.serve();
        this.#bump('upstream.calls');
        if (!outcome.ok) {
            this.#bump('upstream.failures');
        }
        return outcome;
    }

    /** Upstream requests served so far — the attempt counter retries inflate. */
    upstreamAttempts(): number {
        return this.#counters['upstream.calls'];
    }

    /**
     * Advances the lab clock, moving every breaker reset window.
     *
     * @param advanceMs - Milliseconds to add.
     * @returns The new offset.
     */
    advanceClock(advanceMs: number): number {
        return this.#clock.advance(advanceMs);
    }

    /**
     * Returns the lab to a known starting state: `ok` upstream, zeroed counters,
     * wall clock. The live circuit inside `CircuitBreakerInterceptor` is not
     * touched — reach its reset window and let a probe close it instead.
     *
     * @returns The state after the reset.
     */
    reset(): LabSnapshot {
        this.#simulator.setMode({ mode: 'ok' });
        this.#clock.reset();
        this.#counters = zeroCounters();
        this.#lastError = {};
        this.#syncBreakerGauges();
        return this.snapshot();
    }

    /**
     * Records one consumer path invocation.
     *
     * @param path - Which route produced the call.
     * @param result - The outcome and the upstream requests it consumed.
     * @param durationMs - Wall time the route handler spent on the call.
     */
    recordConsumerCall(path: ConsumerPath, result: ConsumerCallResult, durationMs: number): void {
        const prefix: 'consumer' | 'consumer.direct' = path === 'resilient' ? 'consumer' : 'consumer.direct';
        this.#bump(`${prefix}.calls`);
        this.#bump(`${prefix}.upstreamAttempts`, result.attempts);
        if (result.ok) {
            this.#bump(`${prefix}.successes`);
        } else {
            this.#bump(`${prefix}.failures`);
            if (result.error !== undefined) {
                this.#lastError[path] = result.error;
            }
        }
        this.#metrics().recordDuration(LAB_FEATURE, `${prefix}.durationMs`, durationMs);
    }

    /**
     * Records a breaker outcome against the lab's counters.
     *
     * @param event - The event the projection observed.
     */
    observe(event: BreakerEvent): void {
        switch (event.kind) {
            case 'open':
                this.#bump('breaker.opened');
                break;
            case 'probe':
                this.#bump('breaker.probes');
                break;
            case 'close':
                this.#bump('breaker.closed');
                break;
            case 'fail-fast':
                this.#bump('consumer.failFast');
                break;
            default:
                break;
        }
        this.#syncBreakerGauges();
    }

    /**
     * @returns The deterministic `/lab/state` document.
     */
    snapshot(): LabSnapshot {
        const upstream = this.#simulator.snapshot();
        const now = this.#clock.now();
        return {
            clock: { now, offsetMs: this.#clock.offsetMs, iso: new Date(now).toISOString() },
            upstream: {
                mode: upstream.mode,
                calls: this.#counters['upstream.calls'],
                failures: this.#counters['upstream.failures'],
                successes: this.#counters['upstream.calls'] - this.#counters['upstream.failures'],
                lastStatus: upstream.lastStatus,
                remainingFailureBudget: upstream.remainingFailureBudget,
                patternIndex: upstream.patternIndex,
            },
            consumer: { resilient: this.#consumerStats('resilient'), direct: this.#consumerStats('direct') },
            circuits: this.#tracker.snapshots(),
            config: {
                service: LAB_SERVICE_NAME,
                upstreamOrigin: UPSTREAM_ORIGIN,
                retryAttempts: LAB_RETRY_ATTEMPTS,
                retryBackoff: LAB_BACKOFF_LABEL,
                failureThreshold: LAB_FAILURE_THRESHOLD,
                resetMs: LAB_RESET_MS,
            },
            counters: { ...this.#counters },
        };
    }

    #consumerStats(path: ConsumerPath): ConsumerPathStats {
        const prefix: 'consumer' | 'consumer.direct' = path === 'resilient' ? 'consumer' : 'consumer.direct';
        return {
            calls: this.#counters[`${prefix}.calls`],
            successes: this.#counters[`${prefix}.successes`],
            failures: this.#counters[`${prefix}.failures`],
            failFast: path === 'resilient' ? this.#counters['consumer.failFast'] : 0,
            upstreamAttempts: this.#counters[`${prefix}.upstreamAttempts`],
            lastError: this.#lastError[path] ?? null,
        };
    }

    #bump(name: LabCounter, value = 1): void {
        this.#counters[name] += value;
        this.#metrics().incrementCounter(LAB_FEATURE, name, value);
    }

    #syncBreakerGauges(): void {
        const metrics = this.#metrics();
        let open = 0;
        for (const circuit of this.#tracker.snapshots()) {
            const value = circuit.state === 'closed' ? 0 : circuit.state === 'half-open' ? 1 : 2;
            metrics.setGauge(LAB_FEATURE, `breaker.state.${circuit.method}`, value);
            if (circuit.state === 'open') {
                open += 1;
            }
        }
        metrics.setGauge(LAB_FEATURE, 'breaker.open', open);
    }

    #metrics(): FeatureMetricAggregator {
        return (this.#aggregator ??= this.applicationContext.getValue<FeatureMetricAggregator>(METRIC_AGGREGATOR));
    }
}
