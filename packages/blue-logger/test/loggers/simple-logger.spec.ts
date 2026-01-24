import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Level } from '../../src/level';
import { SimpleLogger } from '../../src/loggers/simple-logger';
import type { Appender } from '../../src/appenders';

class SpyAppender implements Appender {
    name = 'spy';
    append = vi.fn();
}

describe('SimpleLogger', () => {
    test('it should create loggers', () => {
        const logger = new SimpleLogger('test');
        expect(logger).toBeInstanceOf(SimpleLogger);
    });

    describe('instances', () => {
        const ONE = new Level('one', 100);
        const TWO = new Level('two', 200);
        const THREE = new Level('three', 300);
        let appender: SpyAppender | undefined;
        let logger: SimpleLogger | undefined;

        beforeEach(() => {
            appender = new SpyAppender();
            logger = new SimpleLogger('test', [appender]);
        });

        afterEach(() => {
            appender = logger = undefined;
        });

        test('it should compare levels', () => {
            expect(logger!.compare(ONE, TWO)).toBe(-1);
            expect(logger!.compare(ONE, ONE)).toBe(0);
            expect(logger!.compare(THREE, TWO)).toBe(1);
        });

        test('it should manage appenders', () => {
            const appender2 = new SpyAppender();
            const appender3 = new SpyAppender();
            expect(logger!.appenders.length).toBe(1);
            logger!.addAppender(appender2);
            expect(logger!.appenders.length).toBe(2);
            logger!.removeAppender(appender2);
            expect(logger!.appenders.length).toBe(1);
            logger!.removeAppender(appender3);
            expect(logger!.appenders.length).toBe(1);
            logger!.clearAppenders();
            expect(logger!.appenders.length).toBe(0);
        });

        test('it should log entries using appenders', () => {
            logger!.log(ONE, 'This is a one');
            logger!.log(TWO, 'This is a two');
            logger!.log(THREE, 'This is a three');

            expect(appender!.append).toHaveBeenCalledTimes(3);

            const firstEntry = appender!.append.mock.calls[0][0];
            const secondEntry = appender!.append.mock.calls[1][0];
            const thirdEntry = appender!.append.mock.calls[2][0];

            expect(firstEntry.level.name).toBe('one');
            expect(secondEntry.level.name).toBe('two');
            expect(thirdEntry.level.name).toBe('three');
        });
    });
});
