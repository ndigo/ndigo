/**
 * OpenTelemetry instrumentation for `@ndigo/socket` STOMP surfaces.
 */
import { SpanKind } from '@opentelemetry/api';
import { StompBroker, StompClient } from '@ndigo/socket';
import { AbstractBaseInstrumentation } from '../base';

export class StompInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('stomp');
    }

    enable(): void {
        this._wrap(StompBroker.prototype, 'handleSocket', this._patch({ name: 'StompBroker.handleSocket', kind: SpanKind.INTERNAL }));
        this._wrap(StompBroker.prototype, 'publish', this._patch({ name: 'StompBroker.publish', kind: SpanKind.INTERNAL }));
        this._wrap(StompBroker.prototype, 'history', this._patch({ name: 'StompBroker.history', kind: SpanKind.INTERNAL }));

        this._wrap(StompClient.prototype, 'subscribe', this._patchSync({ name: 'StompClient.subscribe', kind: SpanKind.INTERNAL }));
        this._wrap(StompClient.prototype, 'send', this._patch({ name: 'StompClient.send', kind: SpanKind.CLIENT }));
        this._wrap(StompClient.prototype, 'disconnect', this._patchSync({ name: 'StompClient.disconnect', kind: SpanKind.INTERNAL }));
    }

    disable(): void {
        this._unwrap(StompBroker.prototype, 'handleSocket');
        this._unwrap(StompBroker.prototype, 'publish');
        this._unwrap(StompBroker.prototype, 'history');

        this._unwrap(StompClient.prototype, 'subscribe');
        this._unwrap(StompClient.prototype, 'send');
        this._unwrap(StompClient.prototype, 'disconnect');
    }
}