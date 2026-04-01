import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { HashRouter } from '@blue/router';

/**
 * An OpenTelemetry instrumentation for the `@blue/router` package, specifically `HashRouter`.
 *
 * This instrumentation automatically creates spans for the internal `_setRoute` method of `HashRouter`,
 * providing visibility into route change events within the application.
 */
export class RouterInstrumentation extends InstrumentationBase {
    /**
     * Creates an instance of `RouterInstrumentation`.
     */
    constructor() {
        super('@blue/instrumentation-router', '0.0.1', {});
    }

    /**
     * Initializes the instrumentation. This method is part of the OpenTelemetry `InstrumentationBase` API.
     * @returns An array of `Instrumentation` objects.
     */
    protected init() {
        return [];
    }

    /**
     * Enables the instrumentation by patching the internal `_setRoute` method of `HashRouter`.
     */
    enable() {
        this._wrap((HashRouter as any).prototype, '_setRoute', this._patchSetRoute());
    }

    /**
     * Disables the instrumentation by unpatching the internal `_setRoute` method of `HashRouter`.
     */
    disable() {
        this._unwrap((HashRouter as any).prototype, '_setRoute');
    }

    private _patchSetRoute() {
        return (original: (newRoute: string) => boolean) => {
            return function (this: any, newRoute: string): boolean {
                const tracer = trace.getTracer('@blue/telemetry');
                const span = tracer.startSpan('Router.setRoute', {
                    kind: SpanKind.SERVER,
                    attributes: {
                        'router.route': newRoute,
                    },
                });
                try {
                    const result = original.apply(this, [newRoute]);
                    span.end();
                    return result;
                } catch (error) {
                    span.recordException(error as Error);
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    span.end();
                    throw error;
                }
            };
        };
    }
}
