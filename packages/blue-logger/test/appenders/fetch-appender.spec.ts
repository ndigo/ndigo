import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { Level } from '../../src/level';
import { FetchAppender } from '../../src/appenders/fetch-appender';

describe('FetchAppender', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        // Mock window.setTimeout for browser-specific code
        if (typeof window === 'undefined') {
            (globalThis as any).window = {
                setTimeout: globalThis.setTimeout.bind(globalThis),
                clearTimeout: globalThis.clearTimeout.bind(globalThis),
            };
        }
    });

    afterEach(() => {
        server.resetHandlers();
        // Clean up window mock
        if ((globalThis as any).window && !(typeof window !== 'undefined')) {
            delete (globalThis as any).window;
        }
    });

    afterAll(() => server.close());

    test('it should make instances', () => {
        const appender = new FetchAppender('http://localhost/log/100');
        expect(appender).toBeInstanceOf(FetchAppender);
    });

    describe('instances', () => {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'layout.pattern.test.unit',
        };
        let appender: FetchAppender | undefined;

        afterEach(() => {
            appender = undefined;
        });

        test('it should append an entry', async () => {
            appender = new FetchAppender('http://localhost/log/100');
            appender.append(entry as any);
            const response = await appender.appending;
            expect(response.status).toBe(200);
            const result = await response.text();
            expect(result).toBe('OK');
        });

        test('it should time out', async () => {
            appender = new FetchAppender('http://localhost/log/100', { timeout: 50 });
            appender.append(entry as any);
            await expect(appender.appending).rejects.toThrow(/Appender timed out/);
        });
    });
});
