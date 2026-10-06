/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
    CONFIG_REFRESH_EVENT,
    MetadataConfigApplicationContext,
    StandardEnvironment,
    configuration,
    defaultValue,
    entry,
    property,
    refreshScope,
} from '@blue/context';
import type { ConfigurableApplicationContext } from '@blue/context';
import { Application } from '../src/application';
import { ApplicationBuilder } from '../src/application-builder';
import { configurationProperties } from '../src/index';

// Mock window to avoid initialization errors
vi.stubGlobal('window', undefined);

@configuration
class TestConfiguration {
    @entry()
    testValue() {
        return 'test';
    }
}

describe('Application lifecycle events', () => {
    it('emits "started" event after run()', async () => {
        const app = new Application([TestConfiguration]);
        const handler = vi.fn();

        app.on('started', handler);
        const context = await app.run();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(context);
    });

    it('emits "closed" event on close()', () => {
        const app = new Application([TestConfiguration]);
        void app.run();

        const handler = vi.fn();
        app.on('closed', handler);
        app.close();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('close() marks destroyed as true', () => {
        const app = new Application([TestConfiguration]);
        void app.run();
        app.close();

        expect(app.destroyed).toBe(true);
    });
});

describe('ApplicationBuilder lifecycle integration', () => {
    it('builder.on("started") fires after run()', async () => {
        const builder = new ApplicationBuilder([TestConfiguration]);
        const handler = vi.fn();

        builder.on('started', handler);
        const context = await builder.run();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(context);
    });

    it('builder.on() is chainable before run()', async () => {
        const builder = new ApplicationBuilder([TestConfiguration]);
        const result = builder.on('started', () => {});

        expect(result).toBe(builder);
    });

    it('run-once guard returns same context on second run()', async () => {
        const builder = new ApplicationBuilder([TestConfiguration]);

        const first = await builder.run();
        const second = await builder.run();

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
    it('wraps startup failures with an inspectable cause', async () => {
        @configuration
        class ExplodingConfiguration {
            @entry()
            boom() {
                throw new TypeError('boom-on-startup');
            }
        }

        const app = new Application([ExplodingConfiguration]);
        await expect(app.run()).rejects.toThrowError(/startup failed/);
        await expect(app.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: 'boom-on-startup' }),
        });
    });
});

describe('Application.run() boot-failure cleanup (CF-6)', () => {
    it('closes the created context and detaches refresh listeners when validation fails', async () => {
        @configuration
        class BootConfig {}

        @configurationProperties('server')
        @refreshScope
        class RefreshableConfig {
            @property('port', Number) @defaultValue('8080') port!: number;
        }

        const app = new Application([BootConfig, RefreshableConfig]);
        const environment = new StandardEnvironment();
        app.setEnvironment(environment);
        // A required key that is absent from the environment fails validation
        // after the context (and both refresh listeners) already exist.
        app.setValidationSchema(z.object({ required: z.string() }));
        const closeSpy = vi.spyOn(MetadataConfigApplicationContext.prototype, 'close');

        try {
            await expect(app.run()).rejects.toMatchObject({
                cause: expect.objectContaining({ message: expect.stringContaining('Environment validation failed') }),
            });

            // The context created before the failure is closed...
            expect(closeSpy).toHaveBeenCalledTimes(1);
            const context = closeSpy.mock.contexts[0] as ConfigurableApplicationContext;
            expect(context.destroyed).toBe(true);
            // ...and neither the context's scope-clear listener nor the app's
            // rebind listener stays attached to the environment.
            expect(environment.listenerCount(CONFIG_REFRESH_EVENT)).toBe(0);
        } finally {
            closeSpy.mockRestore();
        }
    });
});
