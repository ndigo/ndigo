/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { whenBrowser, whenNode, getConditionalPlatform, isActiveForCurrentPlatform } from '@blue/core';
import { Application } from '../src/application';
import { ApplicationBuilder, configurationProperties } from '../src/index';
import { property, defaultValue, configuration, environment, refreshScope } from '@blue/context';
import type { ConfigurableEnvironment } from '@blue/context';
import { WebAutoConfiguration } from '@blue/platform-web';
import { NodeAutoConfiguration } from '@blue/platform-node';
import type { RouteRegistry } from '@blue/router';

describe('whenBrowser', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores browser platform in metadata', () => {
        @whenBrowser
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('browser');
    });

    test('isActiveForCurrentPlatform returns true when window is defined', () => {
        // jsdom always defines window; ensure it exists for this test
        const win = typeof window !== 'undefined' ? window : vi.stubGlobal('window', {});
        expect(typeof window).toBe('object');

        @whenBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is undefined', () => {
        vi.stubGlobal('window', undefined);

        @whenBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(false);
    });
});

describe('whenNode', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores node platform in metadata', () => {
        @whenNode
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('node');
    });

    test('isActiveForCurrentPlatform returns true when window is not defined', () => {
        vi.stubGlobal('window', undefined);

        @whenNode
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is defined', () => {
        @whenNode
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(false);
    });
});

describe('Unconstrained configuration', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('getConditionalPlatform returns undefined', () => {
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBeUndefined();
    });

    test('isActiveForCurrentPlatform returns true regardless of platform', () => {
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);

        vi.stubGlobal('window', {});
        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });
});

describe('Application integration', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('runs web auto-configuration in browser environment', async () => {
        vi.stubGlobal('window', {});

        const app = new Application([WebAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('registers node resolvers from an explicit node source', async () => {
        vi.stubGlobal('window', undefined);

        // Platform-neutral boot: node auto-config comes in as a source.
        const app = new Application([NodeAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<object[]>('argumentResolvers');
        expect(resolvers.some((r) => r.constructor.name.includes('Node'))).toBe(true);
    });
});

describe('Application integration — conditional gate coverage (CF-1)', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('skips binding for an inactive @whenBrowser @configurationProperties source on Node', async () => {
        vi.stubGlobal('window', undefined);

        // Probe (CF-1): before the fix the ungated auto-registration loop
        // bound this class and boot threw `Missing required property
        // "browseronly.token"`.
        @whenBrowser
        @configurationProperties('browseronly')
        class BrowserOnlyConfig {
            @property('token', String as unknown as new (...args: never[]) => string) token!: string;
        }

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, BrowserOnlyConfig]);
        const context = await app.run();

        expect(context.hasValue('browserOnlyConfig')).toBe(false);
    });

    test('still binds an active @whenNode @configurationProperties source (control)', async () => {
        vi.stubGlobal('window', undefined);

        @whenNode
        @configurationProperties('nodeonly')
        class NodeOnlyConfig {
            @property('token', String as unknown as new (...args: never[]) => string) token!: string;
        }

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, NodeOnlyConfig]);
        app.properties({ nodeonly: { token: 'node-token' } });
        const context = await app.run();

        expect(context.getValue<NodeOnlyConfig>('nodeOnlyConfig').token).toBe('node-token');
    });

    test('skips @environment schema collection for an inactive @whenBrowser source', async () => {
        vi.stubGlobal('window', undefined);

        @whenBrowser
        @environment(z.object({ browseronly: z.object({ token: z.string() }) }))
        @configuration
        class BrowserSchemaConfig {}

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, BrowserSchemaConfig]);
        const context = await app.run();

        // Before the fix the ungated schema loop validated the browser-only
        // schema on Node and boot failed with `Environment validation failed`.
        expect(context).toBeDefined();
    });

    test('does not rebind an inactive @refreshScope source on environment refresh', async () => {
        vi.stubGlobal('window', undefined);

        @whenBrowser
        @refreshScope
        @configurationProperties('browser-refresh')
        class BrowserRefreshConfig {
            @property('token', String as unknown as new (...args: never[]) => string)
            @defaultValue('unset')
            token!: string;
        }

        @whenNode
        @refreshScope
        @configurationProperties('node-refresh')
        class NodeRefreshConfig {
            @property('token', String as unknown as new (...args: never[]) => string)
            @defaultValue('node-default')
            token!: string;
        }

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, BrowserRefreshConfig, NodeRefreshConfig]);
        const context = await app.run();
        const env = context.environment as ConfigurableEnvironment;

        expect(context.hasValue('browserRefreshConfig')).toBe(false);
        const before = context.getValue<NodeRefreshConfig>('nodeRefreshConfig');

        env.refresh();

        // The inactive class was excluded from the refresh-scoped rebind list;
        // the active one rebound to a fresh instance.
        expect(context.hasValue('browserRefreshConfig')).toBe(false);
        const after = context.getValue<NodeRefreshConfig>('nodeRefreshConfig');
        expect(after).not.toBe(before);
    });

    test('CTX-08: route scanning skips inactive (condition-gated) sources', async () => {
        vi.stubGlobal('window', undefined);

        @whenBrowser
        @routeMapping('/browser-only')
        class BrowserRouteConfig {}

        @whenNode
        @routeMapping('/node-only')
        class NodeRouteConfig {}

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, BrowserRouteConfig, NodeRouteConfig]);
        const context = await app.run();

        const routes = context.getValue<RouteRegistry>('routeRegistry');
        const patterns = [...routes.entries()].map(([, definition]) => definition.pattern);

        // Only the active source's route is registered; before the fix
        // `scanSources(this.sources, ...)` also scanned the browser-only source.
        expect(patterns).toContain('/node-only');
        expect(patterns).not.toContain('/browser-only');
    });
});

/**
 * Minimal `@routeMapping` decorator mirroring `@blue/dispatcher`, emitting the
 * metadata {@link RouteRegistry#scanSources} reads.
 */
function routeMapping(route: string | { value: string; name?: string }) {
    const conf = typeof route === 'string' ? { value: route } : route;
    return function <T extends Function>(
        target: T,
        context: ClassDecoratorContext | ClassMethodDecoratorContext
    ): T | void {
        if (context.kind === 'class') {
            context.metadata['route:mapping'] = conf;
            return target;
        }
        if (context.kind === 'method') {
            context.metadata[`route:mapping:${String(context.name)}`] = conf;
        }
    };
}
