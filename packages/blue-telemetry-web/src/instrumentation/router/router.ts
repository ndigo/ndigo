/**
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
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
            this._patch({
                name: 'Router.setRoute',
                // In-app navigation is internal router work, not a network
                // boundary (TEL-11).
                kind: SpanKind.INTERNAL,
                attributes: (_instance: unknown, args: unknown[]) => ({
                    'router.route': args[0],
                }),
                // `_setRoute` is async: the span must end when the navigation
                // promise settles (OP-3), not when it is returned, and a
                // rejection must be recorded. The router swallows navigation
                // failures — interceptor rejection or a thrown handler resolve
                // `false` — so flag that outcome as an error as well.
                onEnd: (span, outcome) => {
                    if (outcome.ok && outcome.value === false) {
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'navigation rejected' });
                    }
                },
            })
        );
    }

    disable(): void {
        this._unwrap(HashRouter.prototype as unknown as HashRouterPatchTarget, '_setRoute');
    }
}
