import { StackTraceErrorHandler } from '../src/error-handler';
import { newEntry } from '../src/entry';
import { Level } from '../src/level';

class TestAppender {
    append(entry) {
        expect(entry.message[0]).to.contain('Testing');
    }
}

describe('StackTraceErrorHandler', function () {
    test('it should handle errors', async function () {
        const appender = new TestAppender(),
            errorHandler = new StackTraceErrorHandler(appender),
            level = new Level('TEST', 100),
            error = new Error('Testing'),
            entry = newEntry('test', level, [error]);
        await errorHandler.handleError(entry);
    });
});
