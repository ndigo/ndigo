import { describe, test, expect } from 'vitest';
import type { JSONObject } from '@blue/core';
import { StandardEnvironment } from '@blue/context';
import { mergeConfig, StandardConfigFileLoader } from '../src/config-file-loader';
import type { ConfigFileReader } from '../src/config-file-loader';

describe('mergeConfig', () => {
    test('objects merge, scalars override, arrays replace', () => {
        const base: JSONObject = { server: { port: 8080, host: 'x' }, list: ['a'], title: 'base' };
        const override: JSONObject = { server: { port: 9000 }, list: ['b'], extra: 1 };

        const merged = mergeConfig(base, override);

        expect(merged).toEqual({ server: { port: 9000, host: 'x' }, list: ['b'], title: 'base', extra: 1 });
    });

    test('it should not mutate the base', () => {
        const base: JSONObject = { a: 1 };
        mergeConfig(base, { a: 2 });
        expect(base.a).toBe(1);
    });
});

describe('StandardConfigFileLoader', () => {
    const files =
        (map: Record<string, string | null>): ConfigFileReader =>
        async (path) =>
            map[path] ?? null;

    const envWithProfiles = (...profiles: string[]) => {
        const env = new StandardEnvironment();
        env.activeProfiles = profiles;
        return env;
    };

    test('should load the base file from the first present location', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader({
            reader: files({ './config/application.json': '{"a": 1}' }),
        });

        await loader.load(env);

        expect(env.getProperty('a')).toBe(1);
        expect(env.getPropertySources().get('application')).toBeDefined();
    });

    test('should fall through locations when the first is absent', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader({
            reader: files({ './application.json': '{"b": 2}' }),
        });

        await loader.load(env);

        expect(env.getProperty('b')).toBe(2);
        expect(env.getPropertySources().get('application')).toBeDefined();
    });

    test('should skip silently when no location has the file (optional default)', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader({ reader: files({}) });

        await loader.load(env);

        expect(env.getPropertySources().contains('application')).toBe(false);
    });

    test('should stack profile files above the base (later profile higher)', async () => {
        const env = envWithProfiles('dev', 'prod');
        const loader = new StandardConfigFileLoader({
            reader: files({
                './application.json': '{"server": {"port": 8080}}',
                './application-dev.json': '{"server": {"port": 9090, "debug": true}}',
                './application-prod.json': '{"server": {"port": 7070}}',
            }),
        });

        await loader.load(env);

        expect(env.getProperty('server.port')).toBe(7070);
        expect(env.getProperty('server.debug')).toBe(true);
        expect(
            env
                .getPropertySources()
                .toArray()
                .map((s) => s.name)
        ).toEqual(['application']);
    });

    test('should honor BLUE_CONFIG_LOCATION override', async () => {
        process.env.BLUE_CONFIG_LOCATION = './etc/';
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './etc/application.json': '{"c": 3}' }),
            });

            await loader.load(env);

            expect(env.getProperty('c')).toBe(3);
            expect(env.getPropertySources().get('application')).toBeDefined();
        } finally {
            delete process.env.BLUE_CONFIG_LOCATION;
        }
    });

    test('required: location throws on missing', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader({
            reader: files({}),
            locations: ['required:./etc/'],
        });

        await expect(loader.load(env)).rejects.toThrowError(/Required config file not found/);
    });

    test('optional: location never throws', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader({
            reader: files({}),
            locations: ['optional:./etc/'],
        });

        await loader.load(env);

        expect(env.getPropertySources().contains('application')).toBe(false);
    });

    test('should honor BLUE_CONFIG_IMPORT extra files', async () => {
        process.env.BLUE_CONFIG_IMPORT = 'optional:./extra/secrets.json';
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.json': '{"a": 1}',
                    './extra/secrets.json': '{"secret": "s3cret"}',
                }),
                locations: ['./'],
            });

            await loader.load(env);

            expect(env.getProperty('secret')).toBe('s3cret');
            expect(env.getProperty('a')).toBe(1);
        } finally {
            delete process.env.BLUE_CONFIG_IMPORT;
        }
    });

    test('without a reader, loading is a no-op (browser/spec path)', async () => {
        const env = envWithProfiles();
        const loader = new StandardConfigFileLoader();

        await loader.load(env);

        expect(env.getPropertySources().size).toBe(0);
    });
});
