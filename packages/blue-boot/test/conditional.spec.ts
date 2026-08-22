import { describe, test, expect, vi, afterEach } from 'vitest';
import {
    ConditionalOnBrowser,
    ConditionalOnNode,
    getConditionalPlatform,
    isActiveForCurrentPlatform,
} from '../src/conditional';
import { Application } from '../src/application';

describe('ConditionalOnBrowser', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores browser platform in metadata', () => {
        @ConditionalOnBrowser
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('browser');
    });

    test('isActiveForCurrentPlatform returns true when window is defined', () => {
        // jsdom always defines window; ensure it exists for this test
        const win = typeof window !== 'undefined' ? window : vi.stubGlobal('window', {});
        expect(typeof window).toBe('object');

        @ConditionalOnBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is undefined', () => {
        vi.stubGlobal('window', undefined);

        @ConditionalOnBrowser
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(false);
    });
});

describe('ConditionalOnNode', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores node platform in metadata', () => {
        @ConditionalOnNode
        class TestConfig {}

        expect(getConditionalPlatform(TestConfig)).toBe('node');
    });

    test('isActiveForCurrentPlatform returns true when window is not defined', () => {
        vi.stubGlobal('window', undefined);

        @ConditionalOnNode
        class TestConfig {}

        expect(isActiveForCurrentPlatform(TestConfig)).toBe(true);
    });

    test('isActiveForCurrentPlatform returns false when window is defined', () => {
        @ConditionalOnNode
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

        const app = new Application([]);
        const context = app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
    });

    test('skips web auto-configuration in node environment', () => {
        vi.stubGlobal('window', undefined);

        const app = new Application([]);
        const context = app.run();

        expect(context.hasValue('argumentResolvers')).toBe(false);
    });
});