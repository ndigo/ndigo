import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { environment, configuration } from '@blue/context';
import { ApplicationBuilder } from '../src/index';

const schema = z.object({
    server: z.object({ port: z.coerce.number().min(1) }),
});

describe('boot environment validation (AD-17 D3)', () => {
    test('validateWith fails boot with the aggregate report when invalid', async () => {
        @configuration
        class AppConfig {}
        const app = new ApplicationBuilder([AppConfig]);
        app.properties({ server: { port: 'abc' } });
        app.validateWith(schema);

        await expect(app.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: expect.stringContaining('Environment validation failed') }),
        });
        await expect(app.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: expect.stringContaining('server.port') }),
        });
    });

    test('validateWith boots cleanly when the environment satisfies the schema', async () => {
        @configuration
        class AppConfig {}
        const app = new ApplicationBuilder([AppConfig]);
        app.properties({ server: { port: '8080' } });
        app.validateWith(schema);

        const context = await app.run();
        expect(context).toBeDefined();
    });

    test('errors list every top-level violation (aggregate)', async () => {
        @configuration
        class AppConfig {}
        const app = new ApplicationBuilder([AppConfig]);
        app.properties({ mode: 42, server: { port: 'abc' } });
        app.validateWith(
            z.object({
                mode: z.string(),
                server: z.object({ port: z.coerce.number().min(1) }),
            })
        );

        await expect(app.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: expect.stringContaining('mode') }),
        });
        await expect(app.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: expect.stringContaining('server.port') }),
        });
    });

    test('@environment on a registered source auto-validates', async () => {
        @environment(
            z.object({
                server: z.object({ port: z.coerce.number().min(1) }),
            })
        )
        @configuration
        class AppConfig {}

        const ok = new ApplicationBuilder([AppConfig]);
        ok.properties({ server: { port: '8080' } });
        expect(await ok.run()).toBeDefined();

        const bad = new ApplicationBuilder([AppConfig]);
        bad.properties({ server: { port: 0 } });
        await expect(bad.run()).rejects.toMatchObject({
            cause: expect.objectContaining({ message: expect.stringContaining('Environment validation failed') }),
        });
    });
});
