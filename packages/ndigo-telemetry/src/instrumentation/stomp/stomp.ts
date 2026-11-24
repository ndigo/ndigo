/**
 * OpenTelemetry instrumentation for `@ndigo/socket` STOMP surfaces.
 */
import { SpanKind } from '@opentelemetry/api';
import { STOMPBroker, STOMPClient } from '@ndigo/socket';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `STOMPInstrumentation`.
 *
 * @example
 * ```ts
 * const instance = new STOMPInstrumentation();
 * ```
 */
export class STOMPInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "STOMPInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object STOMPInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'STOMPInstrumentation';
    }

    constructor() {
        super('stomp');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            STOMPBroker.prototype,
            'handleSocket',
            this._patch({ name: 'STOMPBroker.handleSocket', kind: SpanKind.INTERNAL })
        );
        this._wrap(
            STOMPBroker.prototype,
            'publish',
            this._patch({ name: 'STOMPBroker.publish', kind: SpanKind.INTERNAL })
        );
        this._wrap(
            STOMPBroker.prototype,
            'history',
            this._patch({ name: 'STOMPBroker.history', kind: SpanKind.INTERNAL })
        );

        this._wrap(
            STOMPClient.prototype,
            'subscribe',
            this._patchSync({ name: 'STOMPClient.subscribe', kind: SpanKind.INTERNAL })
        );
        this._wrap(STOMPClient.prototype, 'send', this._patch({ name: 'STOMPClient.send', kind: SpanKind.CLIENT }));
        this._wrap(
            STOMPClient.prototype,
            'disconnect',
            this._patchSync({ name: 'STOMPClient.disconnect', kind: SpanKind.INTERNAL })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(STOMPBroker.prototype, 'handleSocket');
        this._unwrap(STOMPBroker.prototype, 'publish');
        this._unwrap(STOMPBroker.prototype, 'history');

        this._unwrap(STOMPClient.prototype, 'subscribe');
        this._unwrap(STOMPClient.prototype, 'send');
        this._unwrap(STOMPClient.prototype, 'disconnect');
    }
}
