/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import type { JSONObject } from '@blue/core';
import { StandardEnvironment } from '@blue/context';
import { decode } from '@toon-format/toon';
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

    describe('TOON config files (AD-66, spec v4.1)', () => {
        test('auto format loads a .toon file when no .json exists (real decoder)', async () => {
            const env = envWithProfiles();
            const content = 'server:\n  port: 8080\n  host: localhost';
            const loader = new StandardConfigFileLoader({
                reader: files({ './config/application.toon': content }),
            });

            await loader.load(env);

            const source = env.getPropertySources().get('application');
            expect(source).toBeDefined();
            expect(source?.properties).toEqual(decode(content));
            expect(env.getProperty('server.port')).toBe(8080);
        });

        test('JSON wins the collision when both formats are present', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.json': '{"server": {"port": 8080}}',
                    './application.toon': 'server:\n  port: 9090',
                }),
            });

            await loader.load(env);

            expect(env.getProperty('server.port')).toBe(8080);
        });

        test('profile .toon files stack above the base with array-replace merge', async () => {
            const env = envWithProfiles('dev');
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.toon': 'server:\n  port: 8080\nlist[1]: a',
                    './application-dev.toon': 'server:\n  port: 9090\n  debug: true\nlist[1]: b',
                }),
            });

            await loader.load(env);

            expect(env.getProperty('server.port')).toBe(9090);
            expect(env.getProperty('server.debug')).toBe(true);
            expect(env.getProperty('list')).toEqual(['b']);
        });

        test("format: 'toon' ignores .json files", async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.json': '{"a": 1}',
                    './application.toon': 'a: 2',
                }),
                format: 'toon',
            });

            await loader.load(env);

            expect(env.getProperty('a')).toBe(2);
        });

        test("format: 'json' ignores .toon files", async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.json': '{"a": 1}',
                    './application.toon': 'a: 2',
                }),
                format: 'json',
            });

            await loader.load(env);

            expect(env.getProperty('a')).toBe(1);
        });

        test('comments, CRLF, and a BOM decode cleanly', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './config/application.toon': '\uFEFF# banner comment\r\nserver:\n  port: 8080\r\n' }),
            });

            await loader.load(env);

            expect(env.getProperty('server.port')).toBe(8080);
        });

        test('an empty .toon document decodes to an empty object (JSON.parse would throw)', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './configuration/application.toon': '' }),
                locations: ['./configuration/'],
            });

            await loader.load(env);

            const source = env.getPropertySources().get('application');
            expect(source?.properties).toEqual({});
            expect(env.getProperty('anything')).toBeUndefined();
        });

        test('__proto__ keys stay ordinary own entries and never pollute (SEC-1 parity)', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': '__proto__:\n  polluted: true' }),
            });

            await loader.load(env);

            const source = env.getPropertySources().get('application');
            expect(source).toBeDefined();
            expect(Object.getPrototypeOf(source?.properties)).toBeNull();
            expect(Object.hasOwn(source?.properties as object, '__proto__')).toBe(true);
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        test('duplicate sibling keys error in strict mode (§14.3)', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'a: 1\nb: 2\na: 3' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(/not valid TOON/);
        });

        test('malformed documents error with the file path', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './config/application.toon': 'items[2]: a,b,c' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(
                /Config file "\.\/config\/application\.toon" is not valid TOON/
            );
        });

        test('JSON documents in .toon files error with a rename hint (object)', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': '{"server": {"port": 8080}}' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(
                /starts like a JSON document[\s\S]*rename the file to \.json/
            );
        });

        test('JSON arrays in .toon files error with a rename hint (array)', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': '[1, 2]' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(/starts like a JSON document/);
        });

        test('TOON array-form roots are rejected up front', async () => {
            // `[1]: a` is valid TOON (§9 index form) but decodes to an array
            // root — invalid for config either way; the pre-parse guard
            // rejects `[`-leading documents before decode.
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': '[1]: a' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(/starts like a JSON document/);
        });

        test('scalar roots are rejected by the object-shape guard', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': '1' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(/must decode to a TOON object/);
        });

        test('required locations report the probed format pair', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({}),
                locations: ['required:./etc/'],
                format: 'toon',
            });

            await expect(loader.load(env)).rejects.toThrowError(/Required config file not found: application\.toon in/);
        });

        test('required auto format reports both probed names', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({}),
                locations: ['required:./etc/'],
            });

            await expect(loader.load(env)).rejects.toThrowError(
                /Required config file not found: application\.json \/ application\.toon in/
            );
        });

        test('BLUE_CONFIG_IMPORT accepts .toon paths', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({
                    './application.toon': 'a: 1',
                    './extra/secrets.toon': 'secret: s3cret',
                }),
                locations: ['./'],
            });
            try {
                process.env.BLUE_CONFIG_IMPORT = './extra/secrets.toon';

                await loader.load(env);

                expect(env.getProperty('secret')).toBe('s3cret');
                expect(env.getProperty('a')).toBe(1);
            } finally {
                delete process.env.BLUE_CONFIG_IMPORT;
            }
        });

        test("format: 'json' rejects a .toon import", async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './extra/secrets.toon': 'secret: s3cret' }),
                locations: ['./'],
                format: 'json',
            });
            try {
                process.env.BLUE_CONFIG_IMPORT = './extra/secrets.toon';

                await expect(loader.load(env)).rejects.toThrowError(
                    /BLUE_CONFIG_IMPORT file "\.\/extra\/secrets\.toon" is TOON but the loader's format option is 'json'/
                );
            } finally {
                delete process.env.BLUE_CONFIG_IMPORT;
            }
        });

        test("format: 'toon' rejects a .json import", async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './extra/extra.json': '{"secret": "s3cret"}' }),
                locations: ['./'],
                format: 'toon',
            });
            try {
                process.env.BLUE_CONFIG_IMPORT = './extra/extra.json';

                await expect(loader.load(env)).rejects.toThrowError(
                    /BLUE_CONFIG_IMPORT file "\.\/extra\/extra\.json" is JSON but the loader's format option is 'toon'/
                );
            } finally {
                delete process.env.BLUE_CONFIG_IMPORT;
            }
        });

        test("format: 'json' accepts a .json import", async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './extra/extra.json': '{"secret": "s3cret"}' }),
                locations: ['./'],
                format: 'json',
            });
            try {
                process.env.BLUE_CONFIG_IMPORT = './extra/extra.json';

                await loader.load(env);

                expect(env.getProperty('secret')).toBe('s3cret');
            } finally {
                delete process.env.BLUE_CONFIG_IMPORT;
            }
        });

        test('a required location accepts a present .toon file', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './etc/application.toon': 'server:\n  port: 8080' }),
                locations: ['required:./etc/'],
                format: 'toon',
            });

            await loader.load(env);

            expect(env.getProperty('server.port')).toBe(8080);
        });

        test('the decodeToon seam replaces the lazy decoder', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'ignored: content' }),
                decodeToon: () => ({ seam: true }),
            });

            await loader.load(env);

            expect(env.getProperty('seam')).toBe(true);
            expect(env.getProperty('ignored')).toBeUndefined();
        });

        test('a failing decodeToon seam reports the file path', async () => {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'x: 1' }),
                decodeToon: () => {
                    throw new Error('synthetic decoder failure');
                },
            });

            await expect(loader.load(env)).rejects.toThrowError(
                /Config file "\.\/application\.toon" is not valid TOON: synthetic decoder failure/
            );
        });
    });
});
