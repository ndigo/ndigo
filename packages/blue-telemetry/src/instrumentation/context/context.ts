import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { GenericApplicationContext } from '@blue/context';

export class ContextInstrumentation extends InstrumentationBase {
    constructor() {
        super('@blue/instrumentation-context', '0.0.1', {});
    }

    protected init() {
        return [];
    }

    enable() {
        this._wrap(GenericApplicationContext.prototype, 'destroy', this._patchDestroy());
    }

    disable() {
        this._unwrap(GenericApplicationContext.prototype, 'destroy');
    }

    private _patchDestroy() {
        return (original: (...args: any[]) => any) => {
            return function (this: GenericApplicationContext, ...args: any[]) {
                const tracer = trace.getTracer('@blue/telemetry');
                const span = tracer.startSpan('ApplicationContext.destroy', {
                    kind: SpanKind.CLIENT,
                    attributes: {
                        'context.name': this.name,
                        'context.id': this.id,
                    },
                });
                try {
                    const result = original.apply(this, args);
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
