/**
 * OpenTelemetry instrumentation for `@ndigo/auth-client`.
 */
import { SpanKind } from '@opentelemetry/api';
import { AuthClient, OIDCAdapter } from '@ndigo/auth-client';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `AuthClientInstrumentation`.
 *
 * @example
 * ```ts
 * const instrumentation = new AuthClientInstrumentation();
 * instrumentation.enable();
 * // ... later
 * instrumentation.disable();
 * ```
 */
export class AuthClientInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AuthClientInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AuthClientInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'AuthClientInstrumentation';
    }

    constructor() {
        super('auth-client');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            OIDCAdapter.prototype,
            'createAuthorizationRequest',
            this._patch({ name: 'OIDCAdapter.createAuthorizationRequest', kind: SpanKind.CLIENT })
        );
        this._wrap(
            OIDCAdapter.prototype,
            'exchangeCodeForTokens',
            this._patch({ name: 'OIDCAdapter.exchangeCodeForTokens', kind: SpanKind.CLIENT })
        );
        this._wrap(
            OIDCAdapter.prototype,
            'validate',
            this._patch({ name: 'OIDCAdapter.validate', kind: SpanKind.CLIENT })
        );
        this._wrap(
            OIDCAdapter.prototype,
            'authenticate',
            this._patch({ name: 'OIDCAdapter.authenticate', kind: SpanKind.CLIENT })
        );
        this._wrap(
            OIDCAdapter.prototype,
            'getEndSessionUrl',
            this._patch({ name: 'OIDCAdapter.getEndSessionUrl', kind: SpanKind.CLIENT })
        );
        this._wrap(
            OIDCAdapter.prototype,
            'refresh',
            this._patch({ name: 'OIDCAdapter.refresh', kind: SpanKind.CLIENT })
        );
        this._wrap(OIDCAdapter.prototype, 'logout', this._patch({ name: 'OIDCAdapter.logout', kind: SpanKind.CLIENT }));

        this._wrap(
            AuthClient.prototype,
            'authenticate',
            this._patch({ name: 'AuthClient.authenticate', kind: SpanKind.INTERNAL })
        );
        this._wrap(
            AuthClient.prototype,
            'refresh',
            this._patch({ name: 'AuthClient.refresh', kind: SpanKind.INTERNAL })
        );
        this._wrap(AuthClient.prototype, 'logout', this._patch({ name: 'AuthClient.logout', kind: SpanKind.INTERNAL }));
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(OIDCAdapter.prototype, 'createAuthorizationRequest');
        this._unwrap(OIDCAdapter.prototype, 'exchangeCodeForTokens');
        this._unwrap(OIDCAdapter.prototype, 'validate');
        this._unwrap(OIDCAdapter.prototype, 'authenticate');
        this._unwrap(OIDCAdapter.prototype, 'getEndSessionUrl');
        this._unwrap(OIDCAdapter.prototype, 'refresh');
        this._unwrap(OIDCAdapter.prototype, 'logout');

        this._unwrap(AuthClient.prototype, 'authenticate');
        this._unwrap(AuthClient.prototype, 'refresh');
        this._unwrap(AuthClient.prototype, 'logout');
    }
}
