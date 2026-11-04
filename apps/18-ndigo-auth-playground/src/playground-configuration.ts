/**
 * The playground's composition root: every controller, the EJS view resolver
 * for the shell, the static controller for the built client bundle, and the
 * socket identity source.
 *
 * Registered after `NodeAutoConfiguration`, so it contributes beans without
 * replacing platform defaults (the handler mapping, the error-resolver chain and
 * the rate limiter stay the platform's — the app *splices* its session
 * restoration and authorization guard onto that mapping, see
 * {@link applyAuthPipeline}).
 *
 * The dependencies come from {@link runtime}, published by `createRuntime()`
 * before the context refreshes.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileURLToPath } from 'node:url';
import { configuration, entry } from '@ndigo/context';
import type { SocketRequestSources } from '@ndigo/dispatcher';
import { HTTPHeaders } from '@ndigo/http';
import { FileSystemResourceLoader, SOCKET_REQUEST_AUTHENTICATOR, StaticController } from '@ndigo/platform-node';
import type { SocketRequestAuthenticator } from '@ndigo/platform-node';
import { EJSViewResolver } from '@ndigo/view-ejs';
import { AUTH_SCHEME_ORDER, type AuthStack } from './auth-stack';
import type { PlaygroundConfig } from './config';
import { JwtController } from './jwt-controller';
import { OidcController } from './oidc-controller';
import { PageController } from './page-controller';
import { RolesController } from './roles-controller';
import { RolesSocketController } from './roles-socket-controller';
import { runtime } from './runtime';
import { SessionController } from './session-controller';

/** Absolute path of the `views/` directory (EJS templates). */
const VIEWS = fileURLToPath(new URL('../views/', import.meta.url));

/** Absolute path of the built client bundle (`vite build` output). */
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/**
 * Reads the machine credential off a WebSocket upgrade: `?token=` (the only
 * channel a browser `WebSocket` can use) or `Authorization: Bearer …` for
 * non-browser clients.
 *
 * @param sources - The upgrade request sources.
 * @returns The presented token, or `null` when the handshake carries none.
 */
function upgradeToken(sources: SocketRequestSources): string | null {
    const fromQuery = sources.query['token'];
    const value = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
    if (typeof value === 'string' && value !== '') {
        return value;
    }
    // Repeated upgrade headers arrive as arrays; the first `Authorization`
    // line is the one whose scheme `bearerToken` checks.
    const authorization = sources.headers?.['authorization'];
    return (
        HTTPHeaders.AUTHORIZATION.bearerToken(Array.isArray(authorization) ? authorization[0] : authorization) ?? null
    );
}

/**
 * The playground's beans: one stack (published runtime) behind six controllers,
 * the view resolver and the static bundle.
 */
@configuration
export class PlaygroundConfiguration {
    readonly #runtime = runtime();
    readonly #config: PlaygroundConfig = this.#runtime.config;
    readonly #stack: AuthStack = this.#runtime.stack;

    /**
     * `GET /` — the shell.
     *
     * @returns The page controller.
     */
    @entry()
    pageController() {
        return new PageController();
    }

    /**
     * Mode 1 — credentials + opaque session cookie.
     *
     * @returns The session controller.
     */
    @entry()
    sessionController() {
        return new SessionController(this.#stack, this.#config);
    }

    /**
     * Mode 2 — JWT access + refresh tokens.
     *
     * @returns The JWT controller.
     */
    @entry()
    jwtController() {
        return new JwtController(this.#stack, this.#config);
    }

    /**
     * Mode 3 (HTTP) — the role matrix.
     *
     * @returns The roles controller.
     */
    @entry()
    rolesController() {
        return new RolesController();
    }

    /**
     * Mode 3 (socket) — the admin-only socket endpoint.
     *
     * @returns The socket controller.
     */
    @entry()
    rolesSocketController() {
        return new RolesSocketController();
    }

    /**
     * Mode 6 — OIDC authorization code + PKCE.
     *
     * @returns The OIDC controller.
     */
    @entry()
    oidcController() {
        return new OidcController(this.#stack, this.#config);
    }

    /**
     * Resolves view names to EJS templates in `views/`, through the framework
     * `ResourceLoader` seam (source → engine → producer).
     *
     * @returns The view resolver.
     */
    @entry()
    viewResolver() {
        return new EJSViewResolver({ loader: new FileSystemResourceLoader(), prefix: VIEWS, suffix: '.ejs' });
    }

    /**
     * Serves the built client bundle from `dist/` under `/static/…`.
     *
     * @returns The static controller.
     */
    @entry()
    staticController() {
        return new StaticController(DIST);
    }

    /**
     * Socket identity source (SEC-3): the HTTP server resolves this bean and
     * hands its `authenticate` to the adapter's upgrade hook.
     *
     * The handshake credential (`?token=` or a Bearer header) is validated
     * through `AuthServer.validateAny` with the playground's explicit scheme
     * order, so **both** an opaque session id and a JWT access token open a
     * socket. The returned bag carries `principal` — the identity
     * `@authenticated`/`@authorized` socket handlers are checked against at
     * dispatch — plus `user`, which is what makes a `/user/*` broker scope real.
     *
     * No credential ⇒ anonymous `{}`: public socket endpoints stay public,
     * while `@authenticated` endpoints fail closed with `1008`. A
     * presented-but-unknown token is a failed authentication, not anonymity, so
     * `authenticate` returns `null` and the upgrade is refused with `1008`.
     *
     * @returns The socket request authenticator.
     */
    @entry(SOCKET_REQUEST_AUTHENTICATOR)
    socketRequestAuthenticator(): SocketRequestAuthenticator {
        const stack = this.#stack;
        return {
            authenticate(sources: SocketRequestSources) {
                const token = upgradeToken(sources);
                if (token === null) {
                    return {};
                }
                return stack.server
                    .validateAny(token, [...AUTH_SCHEME_ORDER])
                    .then((principal) => (principal === null ? null : { principal, user: principal.id }));
            },
        };
    }
}
