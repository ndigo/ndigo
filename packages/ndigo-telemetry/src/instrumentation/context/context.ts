/**
 * OpenTelemetry instrumentation for application contexts.
 */
import { SpanKind } from '@opentelemetry/api';
import { GenericApplicationContext } from '@ndigo/context';
import { AbstractBaseInstrumentation } from '../base';

/**
 * An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.
 *
 * This instrumentation automatically creates spans for the `destroy` method,
 * providing visibility into application context teardown processes.
 */
export class ContextInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('context');
    }

    /**
     * Patches `GenericApplicationContext#destroy` to record teardown spans.
     */
    enable(): void {
        this._wrap(
            GenericApplicationContext.prototype,
            'destroy',
            this._patchSync({
                name: 'ApplicationContext.destroy',
                // Lifecycle teardown is internal work — not a network
                // boundary (TEL-11).
                kind: SpanKind.INTERNAL,
                attributes: (ctx: unknown) => {
                    // The patched `destroy` target is always the context instance.
                    const context = ctx as GenericApplicationContext;
                    return {
                        'context.name': context.name,
                        'context.id': context.id,
                    };
                },
            })
        );
    }

    /**
     * Restores the original `destroy` method.
     */
    disable(): void {
        this._unwrap(GenericApplicationContext.prototype, 'destroy');
    }
}
