/**
 * A type-safe route definition that can generate URLs, navigate, parse, and match routes.
 */
import { type Route } from './route';
import { PathRoute } from './path-route';
import { type Registry } from '@ndigo/factory';
import { ROUTER } from './context-tokens';
import type { Router } from './router';
import type { Matchable } from '@ndigo/core';

// ── Type helpers ────────────────────────────────────────────────────────────

/**
 * The parameter object a route pattern requires, derived from its `{name}`
 * placeholders: each placeholder becomes a required `string` field, and a
 * pattern without placeholders needs no arguments.
 */
export type RouteParams<T extends string> = T extends `${string}{${infer P}}${infer Rest}`
    ? Record<P, string> & RouteParams<Rest>
    : {};

// ── RouteDefinition ─────────────────────────────────────────────────────────

/**
 * A route pattern bound to its registry: `url()` interpolates parameters into
 * an absolute path, `href()` into a fragment link, and both reject a missing or
 * unknown parameter instead of emitting a broken URL.
 */
export class RouteDefinition<TPattern extends string = string> implements Matchable<string> {
    /** The route pattern this definition is bound to. */
    readonly pattern: TPattern;
    readonly #context: Registry;

    constructor(pattern: TPattern, context: Registry) {
        this.pattern = pattern;
        this.#context = context;
    }

    /**
     * Interpolates parameters into an absolute path.
     *
     * @param params - The path parameters.
     * @returns The absolute path.
     */
    url(params: RouteParams<TPattern>): string {
        return this.#interpolate(params);
    }

    /**
     * Interpolates parameters into a fragment link.
     *
     * @param params - The path parameters.
     * @returns The fragment href.
     */
    href(params?: RouteParams<TPattern>): string {
        return `#${this.#interpolate(params ?? ({} as RouteParams<TPattern>))}`;
    }

    /**
     * Navigates the registered router to the interpolated path.
     *
     * @param params - The path parameters.
     * @returns Nothing; navigation is fire-and-forget.
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
            void router.navigate(path);
        }
    }

    /**
     * Parses a path against this definition.
     *
     * @param path - The path to parse.
     * @returns The bound route, or `null` when it does not match.
     */
    parse(path: string): Route<RouteParams<TPattern>> | null {
        const route = new PathRoute(path);

        // `resolveParams` performs the match and binds the extracted parameters
        // onto the route (`:id` and `{id}` syntaxes) — without it, a parsed
        // route carried `params: null` (PWB-REV-016).
        if (route.resolveParams(this.pattern) === null) {
            return null;
        }

        return route as Route<RouteParams<TPattern>>;
    }

    /**
     * Whether a path matches this definition.
     *
     * @param path - The path to test.
     * @returns Whether the path matches.
     */
    matches(path: string): boolean {
        return this.parse(path) !== null;
    }

    #interpolate(params: RouteParams<TPattern>): string {
        let url: string = this.pattern;
        for (const [key, value] of Object.entries(params ?? {})) {
            url = url.replace(`{${key}}`, String(value));
        }
        return url;
    }
}
