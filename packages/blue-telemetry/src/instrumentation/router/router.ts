import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { HashRouter } from '@blue/router';

export class RouterInstrumentation extends InstrumentationBase {
    constructor() {
        super('@blue/instrumentation-router', '0.0.1', {});
    }

    protected init() {
        return [];
    }

    enable() {
        this._wrap((HashRouter as any).prototype, '_setRoute', this._patchSetRoute());
    }

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
