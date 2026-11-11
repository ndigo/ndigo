/**
 * `@ndigo/log` dispatch overhead.
 *
 * The enabled write path is deliberately NOT measured here: `ConsoleLogger`
 * writes synchronously to the console, so a write row is dominated by the
 * sink, not the logger. These rows pin the per-call overhead that runs even
 * when logging is off — the `isEnabled` gate and method dispatch.
 */
import { test } from 'vitest';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ConsoleLogger } from '../src/logger/console-logger';
import type { Exception } from '@opentelemetry/api';
import type { Logger, LogAttributes } from '../src/logger/logger';
import { benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

/** A logger that captures the dispatch cost with no external write. */
class NoopLogger implements Logger {
    threshold = SeverityNumber.DEBUG;
    setThreshold(): void {}
    isEnabled(_severityNumber?: SeverityNumber): boolean {
        return false;
    }
    debug(_message?: string, _attributes?: LogAttributes): void {}
    info(_message?: string, _attributes?: LogAttributes): void {}
    warn(_message?: string, _attributes?: LogAttributes): void {}
    error(_message?: string, _error?: Exception, _attributes?: LogAttributes): void {}
}

test('log — disabled info dispatch', async ({ bench }) => {
    const noop = new NoopLogger();
    // ERROR threshold: info() hits the gate and returns before any write.
    const gated = new ConsoleLogger('bench', SeverityNumber.ERROR);
    await bench.compare(
        bench(benchName('noop info()', BATCH), () => {
            for (let i = 0; i < BATCH; i++) noop.info('message');
            retain(1);
        }),
        bench(benchName('ConsoleLogger disabled info()', BATCH), () => {
            for (let i = 0; i < BATCH; i++) gated.info('message');
            retain(1);
        })
    );
});

test('log — isEnabled gate', async ({ bench }) => {
    const noop = new NoopLogger();
    const gated = new ConsoleLogger('bench', SeverityNumber.ERROR);
    let acc = 0;
    await bench.compare(
        bench(benchName('noop isEnabled', BATCH), () => {
            for (let i = 0; i < BATCH; i++) if (noop.isEnabled(SeverityNumber.INFO)) acc++;
            retain(acc);
        }),
        bench(benchName('ConsoleLogger isEnabled debug (disabled)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) if (gated.isEnabled(SeverityNumber.DEBUG)) acc++;
            retain(acc);
        })
    );
});
