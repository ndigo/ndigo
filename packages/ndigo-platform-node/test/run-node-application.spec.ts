/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HTTP_SERVER } from '../src/context-tokens';
import { runNodeApplication } from '../src/run-node-application';
import type { NodeApplication, RunNodeApplicationOptions } from '../src/run-node-application';

class EmptyConfiguration {}

describe('runNodeApplication', () => {
    let apps: NodeApplication[] = [];
    let savedPort: string | undefined;

    beforeEach(() => {
        // `PORT` would win over the requested port (the documented
        // precedence); pin it away so the preset options decide.
        savedPort = process.env.PORT;
        delete process.env.PORT;
        apps = [];
    });

    afterEach(async () => {
        await Promise.all(apps.map((app) => app.close()));
        if (savedPort === undefined) {
            delete process.env.PORT;
        } else {
            process.env.PORT = savedPort;
        }
    });

    async function boot(options: Partial<RunNodeApplicationOptions> = {}): Promise<NodeApplication> {
        const app = await runNodeApplication([EmptyConfiguration], { shutdown: false, port: 0, ...options });
        apps.push(app);
        return app;
    }

    test('port: 0 boots and reports the kernel-assigned port', async () => {
        const app = await boot();

        expect(app.server.isRunning).toBe(true);
        expect(app.port).toBeGreaterThan(0);
        expect(app.server.port).toBe(app.port);
    });

    test('beforeStart runs after refresh and before the socket binds', async () => {
        let serverRunningDuringHook: boolean | undefined;
        let dispatcherReadyDuringHook: boolean | undefined;

        const app = await boot({
            beforeStart: (context) => {
                serverRunningDuringHook = context.getValue(HTTP_SERVER).isRunning;
                dispatcherReadyDuringHook = context.hasValue('dispatcher');
            },
        });

        expect(serverRunningDuringHook).toBe(false);
        expect(dispatcherReadyDuringHook).toBe(true);
        expect(app.server.isRunning).toBe(true);
    });

    test('configureBuilder extends the builder before run()', async () => {
        const app = await boot({
            configureBuilder: (builder) => {
                builder.defaults({ 'made.by': 'hook' });
            },
        });

        expect(app.context.environment.getProperty('made.by')).toBe('hook');
    });

    test('extra resources close after the server and before the context', async () => {
        let serverStoppedWhenResourceClosed: boolean | undefined;
        let contextAliveWhenResourceClosed: boolean | undefined;

        const app = await boot({
            resources: [
                {
                    close: () => {
                        serverStoppedWhenResourceClosed = !app.server.isRunning;
                        contextAliveWhenResourceClosed = app.context.isActive;
                    },
                },
            ],
        });

        await app.close();

        expect(serverStoppedWhenResourceClosed).toBe(true);
        expect(contextAliveWhenResourceClosed).toBe(true);
    });

    test('close() is idempotent', async () => {
        const app = await boot();

        await app.close();
        await app.close();

        expect(app.server.isRunning).toBe(false);
    });

    test('platform: false leaves HTTP_SERVER unregistered and fails loud', async () => {
        await expect(runNodeApplication([EmptyConfiguration], { platform: false, shutdown: false })).rejects.toThrow(
            /no HTTP_SERVER/
        );
    });

    test('shutdown wiring is installed by default and removed by close()', async () => {
        const baseline = process.listenerCount('SIGINT');

        const app = await runNodeApplication([EmptyConfiguration], { port: 0 });
        apps.push(app);
        expect(process.listenerCount('SIGINT')).toBe(baseline + 1);

        await app.close();
        expect(process.listenerCount('SIGINT')).toBe(baseline);
    });

    test('shutdown: false leaves the signal listeners untouched', async () => {
        const baseline = process.listenerCount('SIGTERM');

        await boot();

        expect(process.listenerCount('SIGTERM')).toBe(baseline);
    });

    test('loads ./config/application.json through the default reader', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'ndigo-run-node-'));
        const savedLocation = process.env.NDIGO_CONFIG_LOCATION;
        process.env.NDIGO_CONFIG_LOCATION = dir;
        try {
            await writeFile(join(dir, 'application.json'), '{"probe":{"value":"from-file"}}', 'utf8');

            const app = await boot();

            expect(app.context.environment.getProperty('probe.value')).toBe('from-file');
        } finally {
            if (savedLocation === undefined) {
                delete process.env.NDIGO_CONFIG_LOCATION;
            } else {
                process.env.NDIGO_CONFIG_LOCATION = savedLocation;
            }
            await rm(dir, { recursive: true, force: true });
        }
    });

    test('configFiles: false skips file loading', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'ndigo-run-node-'));
        const savedLocation = process.env.NDIGO_CONFIG_LOCATION;
        process.env.NDIGO_CONFIG_LOCATION = dir;
        try {
            await writeFile(join(dir, 'application.json'), '{"probe":{"value":"from-file"}}', 'utf8');

            const app = await boot({ configFiles: false });

            expect(app.context.environment.getProperty('probe.value') ?? null).toBeNull();
        } finally {
            if (savedLocation === undefined) {
                delete process.env.NDIGO_CONFIG_LOCATION;
            } else {
                process.env.NDIGO_CONFIG_LOCATION = savedLocation;
            }
            await rm(dir, { recursive: true, force: true });
        }
    });
});
