import { SpanKind } from '@opentelemetry/api';
import { GenericApplicationContext } from '@blue/context';
import { AbstractBlueInstrumentation } from '../base';

/**
 * An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.
 *
 * This instrumentation automatically creates spans for the `destroy` method,
 * providing visibility into application context teardown processes.
 */
export class ContextInstrumentation extends AbstractBlueInstrumentation {
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
                attributes: (ctx: GenericApplicationContext) => ({
                    'context.name': ctx.name,
                    'context.id': ctx.id,
                }),
            })
        );
    }

    disable(): void {
        this._unwrap(GenericApplicationContext.prototype, 'destroy');
    }
}
