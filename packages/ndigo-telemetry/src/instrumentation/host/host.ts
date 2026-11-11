/**
 * OpenTelemetry instrumentation for `@ndigo/host`.
 */
import { SpanKind } from '@opentelemetry/api';
import { HostManager } from '@ndigo/host';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `HostInstrumentation`.
 */
export class HostInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('host');
    }

    enable(): void {
        this._wrap(HostManager.prototype, 'registerFeature', this._patchSync({ name: 'HostManager.registerFeature', kind: SpanKind.INTERNAL }));
        this._wrap(HostManager.prototype, 'unregister', this._patchSync({ name: 'HostManager.unregister', kind: SpanKind.INTERNAL }));
    }

    disable(): void {
        this._unwrap(HostManager.prototype, 'registerFeature');
        this._unwrap(HostManager.prototype, 'unregister');
    }
}