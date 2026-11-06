/**
 */
import { Context, ROOT_CONTEXT } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LogRecordProcessor, type ReadWriteLogRecord } from '@opentelemetry/sdk-logs';
import { describe, expect, it, vi } from 'vitest';
import { SeverityFilterLogRecordProcessor } from '../src/severity-filter-log-record-processor';

class MockLogRecordProcessor implements LogRecordProcessor {
    readonly onEmit = vi.fn();
    readonly forceFlush = vi.fn(() => Promise.resolve());
    readonly shutdown = vi.fn(() => Promise.resolve());
}

function createLogRecord(severityNumber: SeverityNumber): ReadWriteLogRecord {
    return {
        severityNumber,
    } as ReadWriteLogRecord;
}

describe('SeverityFilterLogRecordProcessor', () => {
    it('drops log records below minimum severity', () => {
        const delegate = new MockLogRecordProcessor();
        const processor = new SeverityFilterLogRecordProcessor(delegate, SeverityNumber.WARN);

        processor.onEmit(createLogRecord(SeverityNumber.INFO), ROOT_CONTEXT);
        processor.onEmit(createLogRecord(SeverityNumber.ERROR), ROOT_CONTEXT);

        expect(delegate.onEmit).toHaveBeenCalledTimes(1);
        expect(delegate.onEmit).toHaveBeenCalledWith(
            expect.objectContaining({ severityNumber: SeverityNumber.ERROR }),
            ROOT_CONTEXT
        );
    });

    it('forwards forceFlush and shutdown to delegate', async () => {
        const delegate = new MockLogRecordProcessor();
        const processor = new SeverityFilterLogRecordProcessor(delegate, SeverityNumber.DEBUG);

        await processor.forceFlush();
        await processor.shutdown();

        expect(delegate.forceFlush).toHaveBeenCalledTimes(1);
        expect(delegate.shutdown).toHaveBeenCalledTimes(1);
    });
});
