import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import * as dispatcher from '@blue/dispatcher';
import { Route } from '@blue/router';

/**
 * An OpenTelemetry instrumentation for the `@blue/dispatcher` package.
 *
 * This instrumentation automatically creates spans for the `dispatch` method of `BrowserDispatcher`,
 * providing visibility into route dispatching processes.
 */
export class DispatcherInstrumentation extends InstrumentationBase {
    /**
     * Creates an instance of `DispatcherInstrumentation`.
     */
    constructor() {
        super('@blue/instrumentation-dispatcher', '0.0.1', {});
    }

    /**
     * Initializes the instrumentation. This method is part of the OpenTelemetry `InstrumentationBase` API.
     * @returns An array of `Instrumentation` objects.
     */
    protected init() {
        return [];
    }

    /**
     * Enables the instrumentation by patching the `dispatch` method of `BrowserDispatcher`.
     */
    enable() {
        this._wrap((dispatcher as any).BrowserDispatcher.prototype, 'dispatch', this._patchDispatch());
    }

    /**
     * Disables the instrumentation by unpatching the `dispatch` method of `BrowserDispatcher`.
     */
    disable() {
        this._unwrap((dispatcher as any).BrowserDispatcher.prototype, 'dispatch');
    }

    private _patchDispatch() {
        return (original: (route: Route) => Promise<void>) => {
            return function (this: any, route: Route): Promise<void> {
                const tracer = trace.getTracer('@blue/telemetry');
                return tracer.startActiveSpan(
                    'Dispatcher.dispatch',
                    {
                        kind: SpanKind.SERVER,
                        attributes: {
                            'route.path': route.path,
                        },
                    },
                    (span) => {
                        return original
                            .apply(this, [route])
                            .then((result) => {
                                span.end();
                                return result;
                            })
                            .catch((error: Error) => {
                                span.recordException(error as Error);
                                span.setStatus({ code: SpanStatusCode.ERROR });
                                span.end();
                                throw error;
                            });
                    }
                );
            };
        };
    }
}
