/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi, afterEach } from 'vitest';
import { whenBrowser, whenNode, getConditionalPlatform, isActiveForCurrentPlatform } from '@blue/core';
import { Application } from '../src/application';
import { WebAutoConfiguration } from '@blue/platform-web';
import { NodeAutoConfiguration } from '@blue/platform-node';

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
