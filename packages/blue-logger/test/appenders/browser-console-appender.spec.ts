import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Level } from '../../src/level';
import { BrowserConsoleAppender } from '../../src/appenders/browser-console-appender';

describe('BrowserConsoleAppender', () => {
    const ONE = new Level('one', 100);
    const TWO = new Level('two', 200);
    const THREE = new Level('three', 300);
    const FOUR = new Level('four', 400);

    test('it should be a function', () => {
        expect(BrowserConsoleAppender).toBeInstanceOf(Function);
    });

    test('it should make instances', () => {
        const appender = new BrowserConsoleAppender('test', {
            one: 'debug',
            two: 'info',
            three: 'warn',
            four: 'error',
        });
        expect(appender).toBeInstanceOf(BrowserConsoleAppender);
    });

    describe('instances', () => {
        const entryOne = {
            level: ONE,
            message: ['This', 'is', 'a', 'one'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'appender.browserconsole.test.unit',
        };
        const entryTwo = {
            level: TWO,
            message: ['This', 'is', 'a', 'two'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'appender.browserconsole.test.unit',
        };
        const entryThree = {
            level: THREE,
            message: ['This', 'is', 'a', 'three'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'appender.browserconsole.test.unit',
        };
        const entryFour = {
            level: FOUR,
            message: ['This', 'is', 'a', 'four'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'appender.browserconsole.test.unit',
        };
        let appender: BrowserConsoleAppender | undefined;
        let debugSpy: any;
        let infoSpy: any;
        let warnSpy: any;
        let errorSpy: any;
        let logSpy: any;

        beforeEach(() => {
            debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
            infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
            warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            appender = new BrowserConsoleAppender({
                one: 'debug',
                two: 'info',
                three: 'warn',
                four: 'error',
            });
        });

        afterEach(() => {
            debugSpy.mockRestore();
            infoSpy.mockRestore();
            warnSpy.mockRestore();
            errorSpy.mockRestore();
            logSpy.mockRestore();
            appender = undefined;
        });

        test('it should append an entry', () => {
            appender!.append(entryOne as any);
            appender!.append(entryTwo as any);
            appender!.append(entryThree as any);
            appender!.append(entryFour as any);
            expect(debugSpy).toHaveBeenCalled();
            expect(infoSpy).toHaveBeenCalled();
            expect(warnSpy).toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalled();
        });
    });
});
