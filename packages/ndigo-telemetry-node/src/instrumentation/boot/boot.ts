/**
 * OpenTelemetry instrumentation for `@ndigo/boot`.
 */
import { SpanKind } from '@opentelemetry/api';
import { Application } from '@ndigo/boot';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

export class BootInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('boot');
    }

    enable(): void {
        this._wrap(Application.prototype, 'run', this._patch({
            name: 'Application.run',
            kind: SpanKind.INTERNAL,
        }));
    }

    disable(): void {
        this._unwrap(Application.prototype, 'run');
    }
}