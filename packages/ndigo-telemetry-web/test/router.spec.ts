/**
 * `RouterInstrumentation` specs (OP-3): `HashRouter._setRoute` is async, so
 * the span must stay open until the navigation promise settles, record
 * rejections, and flag the router's swallowed failure outcome (`false`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HashRouter } from '@ndigo/platform-web';
import { RouterInstrumentation } from '../src/instrumentation/router/router';

/**
 * `_setRoute` is protected on `HashRouter`; widen to the slot shape so the
 * spec can stub it without constructing a router.
 */
interface HashRouterInternals {
    _setRoute(newRoute: string, syncHash?: boolean): Promise<boolean>;
}

type SetRoute = HashRouterInternals['_setRoute'];

// Indirection: the instrumentation wraps the prototype when it is constructed
// (`InstrumentationBase` runs `enable()` from the constructor), so the stub
// must be installed first and each test steers behavior through `impl` —
// re-stubbing after construction would bypass the wrapper.
let impl: SetRoute = () => Promise.resolve(true);

const proto = HashRouter.prototype as unknown as HashRouterInternals;
const originalSetRoute = proto._setRoute;
proto._setRoute = function (this: unknown, ...args: Parameters<SetRoute>): Promise<boolean> {
    return impl.apply(this, args);
};

const exporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
trace.setGlobalTracerProvider(provider);

// Production wiring order: built before any provider is registered.
const instrumentation = new RouterInstrumentation();

/**
 * The finished `Router.setRoute` spans recorded so far.
 *
 * @returns Finished router navigation spans.
 */
function routerSpans() {
    return exporter.getFinishedSpans().filter((span) => span.name === 'Router.setRoute');
}

describe('RouterInstrumentation (OP-3)', () => {
    beforeEach(() => {
        exporter.reset();
    });

    afterAll(() => {
        instrumentation.disable();
        proto._setRoute = originalSetRoute;
        trace.disable();
    });

    test('keeps the span open until the navigation promise settles (one span per navigation)', async () => {
        const { promise, resolve } = Promise.withResolvers<boolean>();
        impl = () => promise;

        const navigation = proto._setRoute('/deferred');
        const { promise: tick, resolve: tickResolve } = Promise.withResolvers<void>();
        setTimeout(tickResolve, 10);
        await tick;
        // The navigation promise is still pending: the span must not have ended.
        expect(routerSpans()).toHaveLength(0);

        resolve(true);
        await expect(navigation).resolves.toBe(true);

        const spans = routerSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0].attributes['router.route']).toBe('/deferred');
        expect(spans[0].status.code).not.toBe(SpanStatusCode.ERROR);

        // The span covers the async work: it ended only after the deferred
        // promise settled, at least one timer tick after it started.
        const [startSeconds, startNanos] = spans[0].startTime;
        const [endSeconds, endNanos] = spans[0].endTime;
        expect((endSeconds - startSeconds) * 1e9 + (endNanos - startNanos)).toBeGreaterThanOrEqual(5_000_000);
    });

    test('records a rejected navigation as an error span', async () => {
        impl = () => Promise.reject(new Error('navigation failed'));

        await expect(proto._setRoute('/rejected')).rejects.toThrow('navigation failed');

        const spans = routerSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0].status.code).toBe(SpanStatusCode.ERROR);
        expect(spans[0].events.some((event) => event.name === 'exception')).toBe(true);
    });

    test('flags a swallowed navigation failure (resolved false) as an error span', async () => {
        impl = () => Promise.resolve(false);

        await expect(proto._setRoute('/denied')).resolves.toBe(false);

        const spans = routerSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0].status.code).toBe(SpanStatusCode.ERROR);
        expect(spans[0].status.message).toBe('navigation rejected');
    });
});
