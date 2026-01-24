import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Level } from '@blue/logger';
import { EventLogger } from '../src/event-logger';

describe('EventLogger', () => {
    test('it should create loggers', () => {
        const logger = new EventLogger('test');
        expect(logger).toBeInstanceOf(EventLogger);
    });

    describe('instances', () => {
        const ONE = new Level('one', 100),
            TWO = new Level('two', 200),
            THREE = new Level('three', 300);
        let logger: EventLogger;

        beforeEach(() => {
            logger = new EventLogger('test');
        });

        afterEach(() => {
            logger = undefined as any;
        });

        test('it should compare levels', () => {
            expect(logger.compare(ONE, TWO)).toBe(-1);
            expect(logger.compare(ONE, ONE)).toBe(0);
            expect(logger.compare(THREE, TWO)).toBe(1);
        });

        test('it should log entries using events', () => {
            const onLog = vi.fn(),
                onOne = vi.fn(),
                onTwo = vi.fn(),
                onThree = vi.fn();

            logger.on('log', onLog);
            logger.on('log:one', onOne);
            logger.on('log:two', onTwo);
            logger.on('log:three', onThree);

            logger.log(ONE, 'This is a one');
            logger.log(TWO, 'This is a two');
            logger.log(THREE, 'This is a three');

            expect(onLog).toHaveBeenCalledTimes(3);
            expect(onOne).toHaveBeenCalledOnce();
            expect(onTwo).toHaveBeenCalledOnce();
            expect(onThree).toHaveBeenCalledOnce();
        });
    });
});
