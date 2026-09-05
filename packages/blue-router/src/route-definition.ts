/**
 *
 * A type-safe route definition that can generate URLs, navigate, parse, and match routes.
 */
import { type Route } from './route';
import { PathRoute } from './path-route';
import { type Registry } from '@blue/factory';
import { ROUTER } from './context-tokens';
import type { Router } from './router';

// ── Type helpers ────────────────────────────────────────────────────────────

export type RouteParams<T extends string> = T extends `${string}{${infer P}}${infer Rest}`
    ? Record<P, string> & RouteParams<Rest>
    : {};

// ── RouteDefinition ─────────────────────────────────────────────────────────

export class RouteDefinition<TPattern extends string = string> {
    readonly pattern: TPattern;
    readonly #context: Registry;

    constructor(pattern: TPattern, context: Registry) {
        this.pattern = pattern;
        this.#context = context;
    }

    url(params: RouteParams<TPattern>): string {
        return this.#interpolate(params);
    }

    href(params?: RouteParams<TPattern>): string {
        return `#${this.#interpolate(params ?? ({} as RouteParams<TPattern>))}`;
    }

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

    parse(path: string): Route<RouteParams<TPattern>> | null {
        const route = new PathRoute(path);
        const routePath = route.path;
        const patternSegments = this.pattern.replace(/^\//, '').split('/').filter(Boolean);
        const pathSegments = routePath.replace(/^\//, '').split('/').filter(Boolean);

        if (patternSegments.length !== pathSegments.length) return null;

        for (let i = 0; i < patternSegments.length; i++) {
            const ps = patternSegments[i];
            if (ps.startsWith('{') && ps.endsWith('}')) continue;
            if (ps !== pathSegments[i]) return null;
        }

        return route as Route<RouteParams<TPattern>>;
    }

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
