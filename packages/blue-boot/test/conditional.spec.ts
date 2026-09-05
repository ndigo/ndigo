import { describe, test, expect, vi, afterEach } from 'vitest';
import {
    conditionalOnBrowser,
    conditionalOnNode,
    getConditionalPlatform,
    isActiveForCurrentPlatform,
} from '@blue/core';
import { Application } from '../src/application';
import { WebAutoConfiguration } from '@blue/platform-web';
import { NodeAutoConfiguration } from '@blue/platform-node';

describe('conditionalOnBrowser', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores browser platform in metadata', () => {
        @conditionalOnBrowser
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('browser');
    });

    test('isActiveForCurrentPlatform returns true when window is defined', () => {
        // jsdom always defines window; ensure it exists for this test
        const win = typeof window !== 'undefined' ? window : vi.stubGlobal('window', {});
        expect(typeof window).toBe('object');

        @conditionalOnBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is undefined', () => {
        vi.stubGlobal('window', undefined);

        @conditionalOnBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(false);
    });
});

describe('conditionalOnNode', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores node platform in metadata', () => {
        @conditionalOnNode
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('node');
    });

    test('isActiveForCurrentPlatform returns true when window is not defined', () => {
        vi.stubGlobal('window', undefined);

        @conditionalOnNode
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is defined', () => {
        @conditionalOnNode
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

    test('runs web auto-configuration in browser environment', () => {
        vi.stubGlobal('window', {});

        const app = new Application([WebAutoConfiguration]);
        const context = app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('registers node resolvers from an explicit node source', () => {
        vi.stubGlobal('window', undefined);

        // Platform-neutral boot: node auto-config comes in as a source.
        const app = new Application([NodeAutoConfiguration]);
        const context = app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<object[]>('argumentResolvers');
        expect(resolvers.some((r) => r.constructor.name.includes('Node'))).toBe(true);
    });
});