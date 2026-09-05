import { describe, it, expect } from 'vitest';
import { RouteRegistry, deriveKey, getRouteMapping, getRouteMappingMethodKeys } from '../src/route-registry';
import { RouteDefinition } from '../src/route-definition';

describe('deriveKey', () => {
    it('derives "index" for root path', () => {
        expect(deriveKey('/')).toBe('index');
        expect(deriveKey('')).toBe('index');
    });

    it('derives path segment as key', () => {
        expect(deriveKey('/users')).toBe('users');
        expect(deriveKey('/account')).toBe('account');
        expect(deriveKey('/settings')).toBe('settings');
    });

    it('derives "by{Param}" for parameterized paths', () => {
        expect(deriveKey('/{id}')).toBe('byId');
        expect(deriveKey('/{name}')).toBe('byName');
        expect(deriveKey('/{userId}')).toBe('byUserId');
    });

    it('uses explicit name when provided', () => {
        expect(deriveKey('/admin/users', 'userManagement')).toBe('userManagement');
        expect(deriveKey('/{id}', 'userProfile')).toBe('userProfile');
    });
});

describe('RouteRegistry', () => {
    it('creates an empty registry', () => {
        const registry = new RouteRegistry();
        expect(registry.keys().next().done).toBe(true);
    });

    it('registers a route definition', () => {
        const registry = new RouteRegistry();
        registry.scanSources([], {} as any);
        // No source classes with @routeMapping — just verify it doesn't throw
        expect(registry.keys().next().done).toBe(true);
    });

    it('derives route definitions from @routeMapping metadata', () => {
        // Simulate the Symbol.metadata that @routeMapping would produce
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/{id}')
            handle() {}
        }

        const registry = new RouteRegistry();
        registry.scanSources([UsersController], {} as any);

        const def = registry.get('users.byId');
        expect(def).toBeDefined();
        expect(def!.pattern).toBe('/users/{id}');
    });

    it('handles root-level class routes', () => {
        @routeMapping('/')
        class IndexController {
            @routeMapping('/index')
            handle() {}
        }

        const registry = new RouteRegistry();
        registry.scanSources([IndexController], {} as any);

        const def = registry.get('index');
        expect(def).toBeDefined();
        expect(def!.pattern).toBe('/index');
    });
});

// ── Test helpers ─────────────────────────────────────────────────────────────

/**
 * Minimal @routeMapping decorator for testing.
 * Mirrors the behavior of the real decorator.
 */
function routeMapping(route: string | { value: string; name?: string }) {
    const conf = typeof route === 'string' ? { value: route } : route;
    return function (target: any, context: ClassDecoratorContext | ClassMethodDecoratorContext): any {
        if (context.kind === 'class') {
            context.metadata['route:mapping'] = conf;
            return target;
        } else if (context.kind === 'method') {
            context.metadata[`route:mapping:${String(context.name)}`] = conf;
        }
    };
}
