import { describe, test, expect } from 'vitest';
import { StackTraceErrorHandler } from '../src/error-handler';
import { newEntry } from '../src/entry';
import { Level } from '../src/level';
import type { Appender, Entry } from '../src';

class TestAppender implements Appender {
    name = 'test';

    append(entry: Entry): void {
        expect(entry.message[0]).toContain('Testing');
    }
}

describe('StackTraceErrorHandler', () => {
    test('it should handle errors', async () => {
        const appender = new TestAppender();
        const errorHandler = new StackTraceErrorHandler(appender);
        const level = new Level('TEST', 100);
        const error = new Error('Testing');
        const entry = newEntry('test', level, [error]);
        await errorHandler.handleError(entry);
    });
});
