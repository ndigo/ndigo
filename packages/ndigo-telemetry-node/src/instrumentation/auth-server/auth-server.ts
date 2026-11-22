/**
 * OpenTelemetry instrumentation for `@ndigo/auth-server`.
 */
import { SpanKind } from '@opentelemetry/api';
import { AuthRouteGuard, CredentialsAuthAdapter, JWTAdapter } from '@ndigo/auth-server';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `AuthServerInstrumentation`.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *     instrumentations: [new AuthServerInstrumentation()],
 * });
 * ```
 */
export class AuthServerInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AuthServerInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AuthServerInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'AuthServerInstrumentation';
    }

    constructor() {
        super('auth-server');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            JWTAdapter.prototype,
            'validate',
            this._patch({
                name: 'JWTAdapter.validate',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            JWTAdapter.prototype,
            'issueTokens',
            this._patch({
                name: 'JWTAdapter.issueTokens',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            JWTAdapter.prototype,
            'refresh',
            this._patch({
                name: 'JWTAdapter.refresh',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            CredentialsAuthAdapter.prototype,
            'authenticate',
            this._patch({
                name: 'CredentialsAuthAdapter.authenticate',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            CredentialsAuthAdapter.prototype,
            'validate',
            this._patch({
                name: 'CredentialsAuthAdapter.validate',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            CredentialsAuthAdapter.prototype,
            'refresh',
            this._patch({
                name: 'CredentialsAuthAdapter.refresh',
                kind: SpanKind.INTERNAL,
            })
        );
        this._wrap(
            AuthRouteGuard.prototype,
            'preHandle',
            this._patch({
                name: 'AuthRouteGuard.preHandle',
                kind: SpanKind.INTERNAL,
            })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(JWTAdapter.prototype, 'validate');
        this._unwrap(JWTAdapter.prototype, 'issueTokens');
        this._unwrap(JWTAdapter.prototype, 'refresh');
        this._unwrap(CredentialsAuthAdapter.prototype, 'authenticate');
        this._unwrap(CredentialsAuthAdapter.prototype, 'validate');
        this._unwrap(CredentialsAuthAdapter.prototype, 'refresh');
        this._unwrap(AuthRouteGuard.prototype, 'preHandle');
    }
}
