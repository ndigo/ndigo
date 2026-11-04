/**
 * `AbstractBaseInstrumentation` enable/disable latch regression spec (OP-6).
 *
 * The platform `InstrumentationBase` runs the subclass's `enable()` from its
 * constructor, and the SDK's `registerInstrumentations` enables it again. A
 * browser-shaped `_wrap` (plain `shimmer.wrap`) would nest a second wrapper
 * and a single `disable()` would leave the inner one live — so the shared
 * base must latch each enable/disable cycle.
 *
 * @module ndigo-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it, afterEach, vi } from 'vitest';
import { SpanKind, trace } from '@opentelemetry/api';
import type { Span, SpanStatus, Tracer } from '@opentelemetry/api';
import { AbstractBaseInstrumentation } from '../src/instrumentation/base';
import type { SpanConfig } from '../src/instrumentation/base';

/**
 * Builds an isolated target class plus an instrumentation whose
 * `enable`/`disable` record into `events` — the calls made to the subclass
 * hooks are the latch observable (`_wrap` itself self-heals on the Node
 * platform, so wrapper layers alone would hide a double enable).
 *
 * @returns The event log, target class, and instrumentation class.
 */
function harness() {
    const events: string[] = [];

    class Target {
        greet(): string {
            return 'hello';
        }
    }

    class TestInstrumentation extends AbstractBaseInstrumentation {
        constructor() {
            super('test-latch');
        }

        enable(): void {
            events.push('enable');
            this._wrap(Target.prototype, 'greet', (original) => {
                return function (this: unknown): string {
                    events.push('wrapped');
                    return original.apply(this);
                };
            });
        }

        disable(): void {
            events.push('disable');
            this._unwrap(Target.prototype, 'greet');
        }
    }

    return { events, Target, Instrumentation: TestInstrumentation };
}

describe('AbstractBaseInstrumentation enable latch', () => {
    it('patches once although the constructor and enable() both enable', () => {
        const { events, Target, Instrumentation } = harness();
        const instrumentation = new Instrumentation();
        const target = new Target();

        // `InstrumentationBase`'s constructor has already enabled the
        // instrumentation exactly once.
        expect(events).toEqual(['enable']);

        // SDK re-registration — must be a no-op, not a second patch.
        instrumentation.enable();
        expect(events).toEqual(['enable']);

        expect(target.greet()).toBe('hello');
        expect(events).toEqual(['enable', 'wrapped']);
    });

    it('disable() unwinds fully and is idempotent; enable() re-arms', () => {
        const { events, Target, Instrumentation } = harness();
        const instrumentation = new Instrumentation();
        const target = new Target();

        instrumentation.enable(); // latched: already enabled
        instrumentation.disable();
        expect(events).toEqual(['enable', 'disable']);
        expect(target.greet()).toBe('hello'); // unwrapped — no 'wrapped' event

        instrumentation.disable(); // latched: already disabled
        expect(events).toEqual(['enable', 'disable']);

        instrumentation.enable(); // re-arm after a disable cycle
        expect(events).toEqual(['enable', 'disable', 'enable']);
        expect(target.greet()).toBe('hello');
        expect(events).toEqual(['enable', 'disable', 'enable', 'wrapped']);
    });
});

/**
 * Observable state of a fake span, for asserting that a span still ends even
 * when a `SpanConfig` callback throws.
 */
interface SpanRecord {
    ended: number;
    exceptions: unknown[];
    statuses: SpanStatus[];
}

/**
 * Creates a fake span that records `end`/`recordException`/`setStatus` calls.
 *
 * @returns The span and its recorded state.
 */
function recordingSpan(): { span: Span; record: SpanRecord } {
    const record: SpanRecord = { ended: 0, exceptions: [], statuses: [] };
    const span = {
        end: () => {
            record.ended += 1;
        },
        recordException: (error: unknown) => {
            record.exceptions.push(error);
        },
        setStatus: (status: SpanStatus) => {
            record.statuses.push(status);
        },
    } as unknown as Span;
    return { span, record };
}

/**
 * Installs a fake global tracer that hands out one recording span and captures
 * the options passed to `startSpan`.
 *
 * @returns The recorded span state plus the captured start options.
 */
function installFakeTracer(): { record: SpanRecord; started: { attributes?: unknown }[] } {
    const { span, record } = recordingSpan();
    const started: { attributes?: unknown }[] = [];
    const tracer = {
        startSpan: (_name: string, options?: { attributes?: unknown }) => {
            started.push(options ?? {});
            return span;
        },
        startActiveSpan: (_name: string, _options: unknown, callback: (activeSpan: Span) => unknown) => callback(span),
    } as unknown as Tracer;
    vi.spyOn(trace, 'getTracer').mockReturnValue(tracer);
    return { record, started };
}

/** Exposes the protected `_patch`/`_patchSync` factories for direct testing. */
class PatchHarness extends AbstractBaseInstrumentation {
    constructor() {
        super('test-patch');
    }

    enable(): void {}

    disable(): void {}

    asyncPatch(
        config: SpanConfig,
        original: (this: unknown, ...args: unknown[]) => Promise<unknown>
    ): (this: unknown, ...args: unknown[]) => Promise<unknown> {
        return this._patch(config)(original);
    }

    syncPatch(
        config: SpanConfig,
        original: (this: unknown, ...args: unknown[]) => unknown
    ): (this: unknown, ...args: unknown[]) => unknown {
        return this._patchSync(config)(original);
    }
}

describe('AbstractBaseInstrumentation span callback safety (TEL-B1/TEL-10)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const throwingAttributes = (): SpanConfig => ({
        name: 'op',
        kind: SpanKind.INTERNAL,
        attributes: () => {
            throw new Error('attrs boom');
        },
    });

    it('a throwing attributes callback does not break the wrapped async method', async () => {
        const { record, started } = installFakeTracer();
        const patched = new PatchHarness().asyncPatch(throwingAttributes(), async () => 'ok');

        await expect(patched()).resolves.toBe('ok');
        expect(record.ended).toBe(1);
        expect(started[0]?.attributes).toBeUndefined();
    });

    it('a throwing attributes callback does not break the wrapped sync method', () => {
        const { record, started } = installFakeTracer();
        const patched = new PatchHarness().syncPatch(throwingAttributes(), () => 42);

        expect(patched()).toBe(42);
        expect(record.ended).toBe(1);
        expect(started[0]?.attributes).toBeUndefined();
    });

    const throwingOnEnd = (): SpanConfig => ({
        name: 'op',
        kind: SpanKind.INTERNAL,
        onEnd: () => {
            throw new Error('onEnd boom');
        },
    });

    it('a throwing onEnd still ends the async span and preserves the result', async () => {
        const { record } = installFakeTracer();
        const patched = new PatchHarness().asyncPatch(throwingOnEnd(), async () => 'ok');

        await expect(patched()).resolves.toBe('ok');
        expect(record.ended).toBe(1);
    });

    it('a throwing onEnd still ends the async span and propagates the method error', async () => {
        const { record } = installFakeTracer();
        const failure = new Error('method boom');
        const patched = new PatchHarness().asyncPatch(throwingOnEnd(), async () => {
            throw failure;
        });

        await expect(patched()).rejects.toBe(failure);
        expect(record.ended).toBe(1);
        expect(record.exceptions).toContain(failure);
    });

    it('implements onEnd for the sync path', () => {
        const { record } = installFakeTracer();
        const outcomes: unknown[] = [];
        const config: SpanConfig = {
            name: 'op',
            kind: SpanKind.INTERNAL,
            onEnd: (_span, outcome) => {
                outcomes.push(outcome);
            },
        };
        const patched = new PatchHarness().syncPatch(config, () => 'value');

        expect(patched()).toBe('value');
        expect(outcomes).toEqual([{ ok: true, value: 'value' }]);
        expect(record.ended).toBe(1);
    });

    it('a throwing onEnd still ends the sync span and propagates the method error', () => {
        const { record } = installFakeTracer();
        const failure = new Error('method boom');
        const patched = new PatchHarness().syncPatch(throwingOnEnd(), () => {
            throw failure;
        });

        expect(() => patched()).toThrow(failure);
        expect(record.ended).toBe(1);
        expect(record.exceptions).toContain(failure);
    });
});
