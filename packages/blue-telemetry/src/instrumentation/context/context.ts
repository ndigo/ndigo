import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { GenericApplicationContext } from '@blue/context';

/**
 * An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.
 *
 * This instrumentation automatically creates spans for the `destroy` method of `GenericApplicationContext`,
 * providing visibility into application context teardown processes.
 */
export class ContextInstrumentation extends InstrumentationBase {
    /**
     * Creates an instance of `ContextInstrumentation`.
     */
    constructor() {
        super('@blue/instrumentation-context', '0.0.1', {});
    }

    /**
     * Initializes the instrumentation. This method is part of the OpenTelemetry `InstrumentationBase` API.
     * @returns An array of `Instrumentation` objects.
     */
    protected init() {
        return [];
    }

    /**
     * Enables the instrumentation by patching the `destroy` method of `GenericApplicationContext`.
     */
    enable() {
        this._wrap(GenericApplicationContext.prototype, 'destroy', this._patchDestroy());
    }

    /**
     * Disables the instrumentation by unpatching the `destroy` method of `GenericApplicationContext`.
     */
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
