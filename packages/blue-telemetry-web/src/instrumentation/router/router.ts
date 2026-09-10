import { SpanKind } from '@opentelemetry/api';
import { HashRouter } from '@blue/platform-web';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * The prototype slot the router instrumentation's shimmer patch needs.
 * `_setRoute` is protected on `HashRouter`, so it is not part of the
 * instance's public `keyof` — widen to the slot shape for wrapping.
 */
interface HashRouterPatchTarget {
    _setRoute(newRoute: string, syncHash?: boolean): Promise<boolean>;
}

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
            HashRouter.prototype as unknown as HashRouterPatchTarget,
            '_setRoute',
            this._patchSync({
                name: 'Router.setRoute',
                kind: SpanKind.SERVER,
                attributes: (_instance: unknown, args: unknown[]) => ({
                    'router.route': args[0],
                }),
            })
        );
    }

    disable(): void {
        this._unwrap(HashRouter.prototype as unknown as HashRouterPatchTarget, '_setRoute');
    }
}
