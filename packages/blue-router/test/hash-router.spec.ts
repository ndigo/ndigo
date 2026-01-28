import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import HashRouter from '../src/hash-router';

describe('HashRouter', () => {
    let router: HashRouter | undefined;

    beforeEach(() => {
        if (typeof location !== 'undefined') {
            location.hash = '';
        }
    });

    afterEach(() => {
        router && router.destroy();
    });

    test('it should create a HashRouter instance', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router).toBeDefined();
        expect(router.destroyed).toBe(false);
        expect(router.route).toBeDefined();
    });

    test('it should have initial route', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        // Router should be initialized with current location hash or '/'
        expect(typeof router.route).toBe('string');
    });

    test('it should cleanup on destroy', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router.destroyed).toBe(false);

        router.destroy();

        expect(router.destroyed).toBe(true);

        // Calling destroy again should be safe
        router.destroy();
        expect(router.destroyed).toBe(true);
    });

    test('it should have a history', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router.history).toBeDefined();
        expect(router.history.length).toBeGreaterThan(0);
    });
});
