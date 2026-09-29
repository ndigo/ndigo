/**
 * SEC-4 demo wiring: the OpenAPI docs endpoints run behind the app's
 * established Bearer-token check — the same unconditional token-presence
 * gate `ConfigSecretsController`/`NoteController` apply in-handler.
 * A metadata-driven guard (e.g. `AuthRouteGuard`) would always permit the
 * docs endpoints because the docs handlers carry no
 * `@authenticated`/`@authorized` metadata — the guard must check the
 * request itself (SEC-1 wave finding).
 *
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { entry } from '@blue/context';
import { denialOf, type RouteHandlerInterceptor } from '@blue/dispatcher';
import {
    getNodeRequest,
    NODE_RESPONSE_ATTRIBUTE,
    OpenAPIDocsAutoConfiguration,
    ProblemTypes,
    writeProblem,
} from '@blue/platform-node';
import type { ServerResponse } from 'node:http';
import { HTTPHeaders } from '@blue/http';
import { lookupPrincipal } from './auth-store';

/**
 * Unconditional token-presence guard for the docs paths: only requests
 * carrying `Authorization: Bearer <token>` that resolve to a demo
 * principal (`auth-store`) pass; everything else is denied 401 before the
 * spec/UI handler runs — mirroring the `ConfigSecretsController` gate.
 */
export const docsAccessGuard: RouteHandlerInterceptor = {
    async preHandle(route) {
        const authorization = getNodeRequest(route)?.headers['authorization'];
        const header = Array.isArray(authorization) ? authorization[0] : authorization;
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(header);
        if (bearer && (await lookupPrincipal(bearer))) {
            return true;
        }
        // Write the denial here AND return it: in-process clients such as
        // MockHTTP never finalize bare `denialOf` outcomes (only the live
        // adapter does), while the adapter skips already-ended responses —
        // so both the mock and the wire see the same RFC 9110 401 with the
        // `WWW-Authenticate: Bearer` challenge.
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.writableEnded && !res.destroyed) {
            writeProblem(
                res,
                { type: ProblemTypes.unauthorized, title: 'Unauthorized', status: 401 },
                { 'WWW-Authenticate': 'Bearer' }
            );
        }
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
 * The entry factories are re-declared (forwarding to the base) because the
 * `@entry` initializer marks a method enumerable only on the *defining*
 * class's prototype: without re-declaration, subclass instances inherit
 * non-enumerable descriptors, the context parser's `for...in` never sees
 * the beans, and the docs mapping silently fails to register.
 */
export class SecureDocsConfiguration extends OpenAPIDocsAutoConfiguration {
    constructor() {
        super({ accessGuard: docsAccessGuard });
    }

    @entry
    docsController() {
        return super.docsController();
    }

    @entry
    swaggerUiController() {
        return super.swaggerUiController();
    }

    @entry
    handlerMappings() {
        return super.handlerMappings();
    }
}
