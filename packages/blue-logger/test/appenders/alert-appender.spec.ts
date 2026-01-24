import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Level } from '../../src/level';
import { AlertAppender } from '../../src/appenders/alert-appender';

describe('AlertAppender', () => {
    test('it should be a function', () => {
        expect(AlertAppender).toBeInstanceOf(Function);
    });

    test('it should make instances', () => {
        const appender = new AlertAppender('test');
        expect(appender).toBeInstanceOf(AlertAppender);
    });

    describe('instances', () => {
        const entry = {
            level: new Level('ONE', 100),
            message: ['This', 'is', 'a', 'test'] as any[],
            timestamp: new Date('1995-12-17T03:24:00').getTime(),
            category: 'appender.alert.test.unit',
        };
        let appender: AlertAppender | undefined;
        let alertSpy: ReturnType<typeof vi.spyOn> | undefined;

        beforeEach(() => {
            // Mock alert globally
            (globalThis as any).alert = vi.fn();
            alertSpy = vi.spyOn(globalThis as any, 'alert');
        });

        afterEach(() => {
            if (alertSpy) {
                alertSpy.mockRestore();
            }
            delete (globalThis as any).alert;
            appender = undefined;
        });

        test('it should append an entry', () => {
            appender = new AlertAppender();
            appender.append(entry as any);
            expect(alertSpy).toHaveBeenCalledOnce();
        });
    });
});
