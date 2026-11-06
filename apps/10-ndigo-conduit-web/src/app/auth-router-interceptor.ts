/**
 * The router-level auth guard: the routes that require a session.
 *
 * `/settings` and `/editor` (including `/editor/:slug`) are the RealWorld
 * surfaces that only make sense for an authenticated visitor, and the guard
 * refuses the navigation before the dispatcher can render a model for them.
 *
 * The redirect is emitted from `afterCompletion`, not `preHandle`: the router's
 * own rollback (`restore`) runs between the two, so a hash written from
 * `preHandle` would be clobbered by the rollback restoring the old route.
 * Writing it afterwards lets the router's `hashchange` listener commit the
 * login navigation as a normal route change.
 */
import type { Route, RouterInterceptor } from '@ndigo/router';

/** Path prefixes that require an authenticated session. */
export const AUTH_REQUIRED_PREFIXES = ['/settings', '/editor'] as const;

/** Where a refused navigation is sent. */
export const LOGIN_PATH = '/login';

/**
 * Adds a leading slash and drops a trailing one so `PathRoute`'s normalized
 * path (`editor/foo`) and the absolute prefix table agree.
 *
 * @param path - The route path as it reached the interceptor.
 * @returns The absolute path.
 */
export function absolutePath(path: string): string {
    const absolute = path.startsWith('/') ? path : `/${path}`;
    return absolute.length > 1 && absolute.endsWith('/') ? absolute.slice(0, -1) : absolute;
}

/**
 * Whether a path (or any path below it) requires a session.
 *
 * @param path - The absolute route path.
 * @returns `true` when the guard applies.
 */
export function requiresAuth(path: string): boolean {
    return AUTH_REQUIRED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Refuses unauthenticated navigations to the guarded routes.
 */
export class AuthRouterInterceptor implements RouterInterceptor {
    readonly #isAuthenticated: () => boolean;
    readonly #loginPath: string;
    #redirectPath: string | null = null;

    /**
     * Creates the guard.
     *
     * @param isAuthenticated - Reads the session state (a predicate, so the
     *   interceptor never holds a stale snapshot).
     * @param loginPath - Where a refused navigation is sent.
     */
    constructor(isAuthenticated: () => boolean, loginPath: string = LOGIN_PATH) {
        this.#isAuthenticated = isAuthenticated;
        this.#loginPath = loginPath;
    }

    /** @inheritdoc */
    async preHandle(route: Route): Promise<boolean> {
        this.#redirectPath = null;
        if (!requiresAuth(absolutePath(route.path)) || this.#isAuthenticated()) {
            return true;
        }
        this.#redirectPath = this.#loginPath;
        return false;
    }

    /** @inheritdoc */
    async postHandle(_route: Route): Promise<void> {
        // no-op: nothing to do once a navigation is allowed.
    }

    /** @inheritdoc */
    async afterCompletion(_route: Route): Promise<void> {
        const redirectPath = this.#redirectPath;
        this.#redirectPath = null;
        if (redirectPath) {
            globalThis.location.hash = `#${redirectPath}`;
        }
    }
}
