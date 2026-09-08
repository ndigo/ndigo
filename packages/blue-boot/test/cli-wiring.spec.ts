import { describe, test, expect } from 'vitest';
import type { JSONObject } from '@blue/core';
import type { ConfigurableEnvironment } from '@blue/context';
import { Application } from '../src/application';

class EmptyConfiguration {}

// run() returns a context whose environment is ConfigurableEnvironment at
// runtime; the broad Environment type hides the registry accessor. Narrow for
// the source-order assertions.
const envOf = (context: { environment?: unknown }): ConfigurableEnvironment =>
    context.environment as ConfigurableEnvironment;

describe('Application CLI wiring', () => {
    test('CLI args beat builder properties (commandLine source is first)', () => {
        const app = new Application([EmptyConfiguration]);
        app.setProperties({ server: { port: 8080 } } as JSONObject);

        const context = app.run('--server.port=9000', '--debug');

        expect(envOf(context).getProperty('server.port')).toBe('9000');
        expect(envOf(context).getPropertyAs('server.port', Number)).toBe(9000);
        expect(envOf(context).getProperty('debug')).toBe(true);
        expect(envOf(context).getPropertySources().toArray()[0].name).toBe('commandLine');
    });

    test('absent args register no commandLine source', () => {
        const app = new Application([EmptyConfiguration]);
        app.setProperties({ a: 1 } as JSONObject);

        const context = app.run();

        expect(envOf(context).getPropertySources().contains('commandLine')).toBe(false);
        expect(envOf(context).getProperty('a')).toBe(1);
    });

    test('builder properties still resolve without CLI override', () => {
        const app = new Application([EmptyConfiguration]);
        app.setProperties({ server: { port: 8080 } } as JSONObject);

        const context = app.run();

        expect(envOf(context).getPropertyAs('server.port', Number)).toBe(8080);
    });
});
