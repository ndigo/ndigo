import { describe, it, expect, vi } from 'vitest';
import { configuration, entry } from '@blue/context';
import { Application } from '../src/application';
import { ApplicationBuilder } from '../src/application-builder';

// Mock window to avoid initialization errors
vi.stubGlobal('window', undefined);

@configuration
class TestConfiguration {
    @entry
    testValue() {
        return 'test';
    }
}

describe('Application lifecycle events', () => {
    it('emits "started" event after run()', () => {
        const app = new Application([TestConfiguration]);
        const handler = vi.fn();

        app.on('started', handler);
        const context = app.run();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(context);
    });

    it('emits "closed" event on close()', () => {
        const app = new Application([TestConfiguration]);
        app.run();

        const handler = vi.fn();
        app.on('closed', handler);
        app.close();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('close() marks destroyed as true', () => {
        const app = new Application([TestConfiguration]);
        app.run();
        app.close();

        expect(app.destroyed).toBe(true);
    });
});

describe('ApplicationBuilder lifecycle integration', () => {
    it('builder.on("started") fires after run()', () => {
        const builder = new ApplicationBuilder([TestConfiguration]);
        const handler = vi.fn();

        builder.on('started', handler);
        const context = builder.run();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(context);
    });

    it('builder.on() is chainable before run()', () => {
        const builder = new ApplicationBuilder([TestConfiguration]);
        const result = builder.on('started', () => {});

        expect(result).toBe(builder);
    });

    it('run-once guard returns same context on second run()', () => {
        const builder = new ApplicationBuilder([TestConfiguration]);

        const first = builder.run();
        const second = builder.run();

        expect(first).toBe(second);
    });
});

describe('Application.close() safety', () => {
    it('close() before run() does not throw', () => {
        const app = new Application([TestConfiguration]);

        expect(() => app.close()).not.toThrow();
    });
});

describe('Application.run() failure cause preservation', () => {
    it('wraps startup failures with an inspectable cause', () => {
        @configuration
        class ExplodingConfiguration {
            @entry
            boom() {
                throw new TypeError('boom-on-startup');
            }
        }

        const app = new Application([ExplodingConfiguration]);
        try {
            app.run();
            expect.unreachable('run() must throw');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            const e = error as Error & { cause?: unknown };
            expect(e.message).toContain('startup failed');
            expect((e.cause as Error | undefined)?.message).toBe('boom-on-startup');
        }
    });
});
