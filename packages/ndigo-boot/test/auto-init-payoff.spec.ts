/**
 * @module ndigo-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';
import { ApplicationBuilder } from '../src/application-builder';
import { NodeAutoConfiguration } from '@ndigo/platform-node';

describe('ApplicationBuilder + NodeAutoConfiguration payoff', () => {
    test('run() produces auto-initialized mapping, dispatcher, and httpServer entry', async () => {
        const app = new Application([NodeAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('httpServer')).toBe(true);
        expect(context.hasValue('dispatcher')).toBe(true);
        expect(context.hasValue('handlerMapping')).toBe(true);

        // The mapping is a SmartLifecycle driven by refresh: auto-started.
        const mapping = context.getValue('handlerMapping') as { isRunning: boolean };
        expect(mapping.isRunning).toBe(true);

        // The dispatcher is SmartLifecycle + auto-started with strategies.
        const dispatcher = context.getValue('dispatcher') as { isRunning: boolean; applicationContext: unknown };
        expect(dispatcher.isRunning).toBe(true);
        expect(dispatcher.applicationContext).toBeDefined();

        // The server is provisioned but must NOT auto-bind a socket on refresh.
        const server = context.getValue('httpServer') as { isAutoStartup: boolean; isRunning: boolean };
        expect(server.isAutoStartup).toBe(false);
        expect(server.isRunning).toBe(false);

        app.close();
    });

    test('builder.run() idempotently returns the same context', async () => {
        const builder = new ApplicationBuilder([NodeAutoConfiguration]);
        const first = await builder.run();
        const second = await builder.run();
        expect(second).toBe(first);
    });
});
