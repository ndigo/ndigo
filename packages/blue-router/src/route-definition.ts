/**
 * @author Jeff Rose
 *
 * A type-safe route definition that can generate URLs, navigate, parse, and match routes.
 */
import { type Route } from './route';
import { PathRoute } from './path-route';
import { type Registry } from '@blue/factory';
import { ROUTER } from './context-tokens';
import type { Router } from './router';

// ── Type helpers ────────────────────────────────────────────────────────────

export type RouteParams<T extends string> =
    T extends `${string}{${infer P}}${infer Rest}`
        ? Record<P, string> & RouteParams<Rest>
        : {};

// ── RouteDefinition ─────────────────────────────────────────────────────────

export class RouteDefinition<TPattern extends string = string> {
    /** The raw route pattern, e.g. "/users/{id}" */
    readonly pattern: TPattern;

    readonly #context: Registry;

    constructor(pattern: TPattern, context: Registry) {
        this.pattern = pattern;
        this.#context = context;
    }

    /**
     * Generate a URL string from path parameters.
     */
    url(params: RouteParams<TPattern>): string {
        return this.#interpolate(params);
    }

    /**
     * Generate a full hash-anchored href for browser navigation.
     */
    href(params: RouteParams<TPattern>): string {
        return `#${this.#interpolate(params)}`;
    }

    /**
     * Navigate the router to this route.
     */
    navigate(params: RouteParams<TPattern>): void {
        const router = this.#context.getValue<Router | undefined>(ROUTER) as Router | undefined;
        if (!router) {
            throw new Error(
                `RouteRegistry: Cannot navigate to "${this.pattern}" — no Router registered in the application context.`
            );
        }
        const path = this.#interpolate(params);
        if (router.navigate) {
            router.navigate(path);
        }
    }

    /**
     * Parse a raw URL path and extract typed parameters.
     * Returns null if the path does not match this route's pattern.
     */
    parse(path: string): Route<RouteParams<TPattern>> | null {
        const route = new PathRoute(path);
        const routePath = route.path;

        // Count segments in the pattern (after removing leading slash)
        const patternSegments = this.pattern.replace(/^\//, '').split('/').filter(Boolean);
        const pathSegments = routePath.replace(/^\//, '').split('/').filter(Boolean);

        if (patternSegments.length !== pathSegments.length) return null;

        // Check that static segments match exactly
        for (let i = 0; i < patternSegments.length; i++) {
            const ps = patternSegments[i];
            if (ps.startsWith('{') && ps.endsWith('}')) continue;
            if (ps !== pathSegments[i]) return null;
        }

        return route as Route<RouteParams<TPattern>>;
    }

    /**
     * Check whether a URL path matches this route's pattern.
     */
    matches(path: string): boolean {
        return this.parse(path) !== null;
    }

    /**
     * Replace path parameters in the pattern with actual values.
     */
    #interpolate(params: RouteParams<TPattern>): string {
        let url: string = this.pattern;
        for (const [key, value] of Object.entries(params ?? {})) {
            url = url.replace(`{${key}}`, String(value));
        }
        return url;
    }
}
