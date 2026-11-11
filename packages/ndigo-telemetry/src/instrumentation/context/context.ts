/**
 * OpenTelemetry instrumentation for application contexts.
 */
import { SpanKind } from '@opentelemetry/api';
import { GenericApplicationContext } from '@ndigo/context';
import { AbstractBaseInstrumentation } from '../base';

/**
 * An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.
 *
 * This instrumentation automatically creates spans for the `destroy` and
 * `refresh` methods, providing visibility into application context teardown
 * and refresh processes.
 */
export class ContextInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('context');
    }

    /**
     * Patches `GenericApplicationContext#destroy` and `#refresh` to record spans.
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

        this._wrap(
            GenericApplicationContext.prototype,
            'refresh',
            this._patchSync({
                name: 'ApplicationContext.refresh',
                kind: SpanKind.INTERNAL,
                attributes: (ctx: unknown) => {
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
     * Restores the original `destroy` and `refresh` methods.
     */
    disable(): void {
        this._unwrap(GenericApplicationContext.prototype, 'destroy');
        this._unwrap(GenericApplicationContext.prototype, 'refresh');
    }
}