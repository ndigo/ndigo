/**
 * Error construction: framework error vs native Error.
 *
 * Stack capture dominates both sides; the native row is the floor. Each
 * iteration performs 1,000 constructions (`@ops=1000`).
 */
import { test } from 'vitest';
import { FrameworkError } from '../src/error';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;
const cause = new Error('cause');

test('error construction — no cause', async ({ bench }) => {
    const framework = new FrameworkError('test error');
    const native = new Error('test error');
    assertEquivalent('error name', framework.name, 'FrameworkError');
    assertEquivalent('error message', framework.message, native.message);
    await bench.compare(
        bench(benchName('FrameworkError', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(new FrameworkError('test error'));
        }),
        bench(benchName('native Error', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(new Error('test error'));
        })
    );
});

test('error construction — with cause', async ({ bench }) => {
    const framework = new FrameworkError('wrapped', { cause });
    assertEquivalent('error cause', framework.cause, cause);
    await bench.compare(
        bench(benchName('FrameworkError with cause', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(new FrameworkError('wrapped', { cause }));
        }),
        bench(benchName('native Error with cause', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(new Error('wrapped', { cause }));
        })
    );
});
