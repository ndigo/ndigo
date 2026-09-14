/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind } from '@opentelemetry/api';
import { GenericApplicationContext } from '@blue/context';
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

    enable(): void {
        this._wrap(
            GenericApplicationContext.prototype,
            'destroy',
            this._patchSync({
                name: 'ApplicationContext.destroy',
                kind: SpanKind.CLIENT,
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

    disable(): void {
        this._unwrap(GenericApplicationContext.prototype, 'destroy');
    }
}
