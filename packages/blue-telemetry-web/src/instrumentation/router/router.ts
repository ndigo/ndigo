import { SpanKind } from '@opentelemetry/api';
import { HashRouter } from '@blue/platform-web';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * An OpenTelemetry instrumentation for the `@blue/router` package, specifically `HashRouter`.
 *
 * This instrumentation automatically creates spans for the internal `_setRoute` method,
 * providing visibility into route change events within the application.
 */
export class RouterInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('router');
    }

    enable(): void {
        this._wrap(
            (HashRouter as any).prototype,
            '_setRoute',
            this._patchSync({
                name: 'Router.setRoute',
                kind: SpanKind.SERVER,
                attributes: (_instance: any, args: any[]) => ({
                    'router.route': args[0],
                }),
            })
        );
    }

    disable(): void {
        this._unwrap((HashRouter as any).prototype, '_setRoute');
    }
}
