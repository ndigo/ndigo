/**
 * OpenTelemetry instrumentation for `@ndigo/cluster`.
 */
import { SpanKind } from '@opentelemetry/api';
import { ClusterRunner } from '@ndigo/cluster';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `ClusterInstrumentation`.
 */
export class ClusterInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('cluster');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(ClusterRunner.prototype, 'run', this._patch({ name: 'ClusterRunner.run', kind: SpanKind.INTERNAL }));
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(ClusterRunner.prototype, 'run');
    }
}
