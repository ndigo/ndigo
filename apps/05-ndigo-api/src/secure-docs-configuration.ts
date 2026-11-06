/**
 * SEC-4 demo wiring: the OpenAPI docs endpoints run behind the app's
 * established Bearer-token check — the same unconditional token-presence
 * gate `ConfigSecretsController`/`NoteController` apply in-handler.
 * A metadata-driven guard (e.g. `AuthRouteGuard`) would always permit the
 * docs endpoints because the docs handlers carry no
 * `@authenticated`/`@authorized` metadata — the guard must check the
 * request itself (SEC-1 wave finding).
 */
import '@tsmetadata/polyfill';
import { denialOf, type RouteHandlerInterceptor } from '@ndigo/dispatcher';
import { getNodeRequest, OpenAPIDocsAutoConfiguration } from '@ndigo/platform-node';
import { HTTPHeaders } from '@ndigo/http';
import { lookupPrincipal } from './auth-store';

/**
 * Unconditional token-presence guard for the docs paths: only requests
 * carrying `Authorization: Bearer <token>` that resolve to a demo
 * principal (`auth-store`) pass; everything else is denied 401 before the
 * spec/UI handler runs — mirroring the `ConfigSecretsController` gate.
 */
export const docsAccessGuard: RouteHandlerInterceptor = {
    async preHandle(route) {
        // `?? {}`: no native request (in-process clients) means no headers — the
        // denial below still applies.
        const authorization = HTTPHeaders.AUTHORIZATION.get(getNodeRequest(route)?.headers ?? {});
        const header = Array.isArray(authorization) ? authorization[0] : authorization;
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(header);
        if (bearer && (await lookupPrincipal(bearer))) {
            return true;
        }
        // Return the denial: both the live node adapter and the in-process
        // MockHTTP client finalize a bare `denialOf` outcome into the same
        // RFC 9110 401 with the `WWW-Authenticate: Bearer` challenge (IN-1).
        return denialOf(401);
    },
    async postHandle() {
        // no post-processing — authentication is a pre-handler concern.
    },
    async completeHandle() {
        // no completion hook.
    },
};

/**
 * Docs auto-configuration registered with the demo's Bearer guard — the
 * SEC-4 posture: anonymous `/v3/api-docs` and `/swagger-ui/` are 401.
 *
 * Only the constructor override is kept: the `@entry` factories inherit from
 * `OpenAPIDocsAutoConfiguration` and register through the prototype chain
 * (FOLLOW-1) — no re-declaration is needed.
 */
export class SecureDocsConfiguration extends OpenAPIDocsAutoConfiguration {
    constructor() {
        super({ accessGuard: docsAccessGuard });
    }
}
