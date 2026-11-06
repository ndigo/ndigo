/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { GenericApplicationContext, type ApplicationContext } from '@ndigo/context';
import { getJobHandlerMetadata, jobHandler } from '../src/job-handler';
import { JobHandlerRegistry } from '../src/job-handler-registry';

class EmailWorker {
    sent: string[] = [];

    @jobHandler('email.send', { maxAttempts: 5, timeoutMs: 250 })
    send(payload: unknown) {
        if (payload !== null && typeof payload === 'object' && 'to' in payload && typeof payload.to === 'string') {
            this.sent.push(payload.to);
        }
    }
}

class OtherWorker {
    @jobHandler('other.work')
    work() {
        /* no-op */
    }
}

class DuplicateWorker {
    @jobHandler('email.send')
    alsoSend() {
        /* duplicate type on purpose */
    }
}

describe('@jobHandler', () => {
    test('records type and options under the metadata prefix', () => {
        const metadata = getJobHandlerMetadata(EmailWorker, 'send');

        expect(metadata).toEqual({ type: 'email.send', maxAttempts: 5, timeoutMs: 250 });
    });

    test('is absent for undecorated methods', () => {
        expect(getJobHandlerMetadata(EmailWorker, 'toString')).toBeUndefined();
    });

    test('validates its arguments', () => {
        expect(() => jobHandler('')).toThrow(/non-empty string/);
        expect(() => jobHandler('ok', { maxAttempts: 0 })).toThrow(/maxAttempts/);
        expect(() => jobHandler('ok', { timeoutMs: 1.5 })).toThrow(/timeoutMs/);
    });
});

describe('JobHandlerRegistry', () => {
    let context: GenericApplicationContext;
    let registry: JobHandlerRegistry;

    beforeEach(() => {
        context = new GenericApplicationContext('jobs');
        registry = new JobHandlerRegistry();
    });

    test('start without a bound context fails loudly', () => {
        expect(() => registry.start()).toThrow(/no application context/);
    });

    test('start scans beans, binds owners, and exposes handlers', async () => {
        const worker = new EmailWorker();
        context.setValue('emailWorker', worker);
        registry.setApplicationContext(context);

        registry.start();

        const handler = registry.get('email.send');
        expect(handler?.name).toBe('emailWorker.send');
        expect(handler?.maxAttempts).toBe(5);
        if (handler === undefined) {
            throw new Error('expected the scanned email.send handler');
        }
        await handler.run(
            { to: 'a@b.c' },
            { jobId: 'j1', type: 'email.send', attempt: 1, signal: new AbortController().signal }
        );
        expect(worker.sent).toEqual(['a@b.c']);
        expect(registry.handlers).toHaveLength(1);
    });

    test('duplicate job types fail loud at scan time', () => {
        context.setValue('emailWorker', new EmailWorker());
        context.setValue('duplicateWorker', new DuplicateWorker());
        registry.setApplicationContext(context);

        expect(() => registry.start()).toThrow(/duplicate handler for job type 'email.send'/);
    });

    test('@jobHandler methods on a scannable class value fail loud', () => {
        // Test double: this container classifies `setValue` classes as
        // constructors and instantiates them on getValue, so a scannable
        // class value can only come from an alternate registry/harness —
        // the defensive branch this pins.
        const stubContext = {
            workerClass: EmailWorker,
            getValue: (name: string) => (name === 'workerClass' ? EmailWorker : undefined),
        };
        registry.setApplicationContext(stubContext as unknown as ApplicationContext);

        expect(() => registry.start()).toThrow(/registered as a class, not an instance/);
    });

    test('programmatic registration and duplicate detection', async () => {
        const calls: string[] = [];
        registry.register('manual.work', (payload) => {
            calls.push(String(payload));
        });

        const manual = registry.get('manual.work');
        if (manual === undefined) {
            throw new Error('expected the registered manual.work handler');
        }
        await manual.run('one', {
            jobId: 'j1',
            type: 'manual.work',
            attempt: 1,
            signal: new AbortController().signal,
        });
        expect(calls).toEqual(['one']);
        expect(() => registry.register('manual.work', () => undefined)).toThrow(/duplicate handler/);
    });

    test('start is idempotent; stop clears; destroy blocks restart', () => {
        context.setValue('emailWorker', new EmailWorker());
        registry.setApplicationContext(context);
        registry.start();
        registry.start();

        expect(registry.handlers).toHaveLength(1);
        registry.stop();
        expect(registry.handlers).toHaveLength(0);
        registry.start();
        expect(registry.handlers).toHaveLength(1);
    });

    test('a destroyed registry cannot restart', async () => {
        await registry.destroy();

        expect(() => registry.start()).toThrow(/destroyed/);
    });

    test('two distinct types coexist', () => {
        context.setValue('emailWorker', new EmailWorker());
        context.setValue('otherWorker', new OtherWorker());
        registry.setApplicationContext(context);
        registry.start();

        expect(registry.handlers.map((handler) => handler.type).sort()).toEqual(['email.send', 'other.work']);
    });
});
