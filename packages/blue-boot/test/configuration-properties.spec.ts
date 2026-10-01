/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import type { JSONObject } from '@blue/core';
import {
    ApplicationBuilder,
    configurationProperties,
    isConfigurationProperties,
    getConfigurationPropertiesPrefix,
    resolveConfigurationProperties,
} from '../src/index';
import { property, defaultValue, nested, configuration, entry } from '@blue/context';

class DbConfig {
    @property('url', String) @defaultValue('mongodb://localhost') url!: string;
}

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
    @property('host', String) @defaultValue('localhost') host!: string;
    @nested db: DbConfig = new DbConfig();
}

@configurationProperties()
class AppConfig {
    @property('app.title', String) @defaultValue('blue') title!: string;
}

class UndecoratedConfig {
    @property('app.mode') mode: string | null = null;
}

describe('configurationProperties decorator (AD-15)', () => {
    test('stores metadata on decorated class', () => {
        expect(isConfigurationProperties(ServerConfig)).toBe(true);
        expect(isConfigurationProperties(UndecoratedConfig)).toBe(false);
    });

    test('stores prefix in metadata', () => {
        expect(getConfigurationPropertiesPrefix(ServerConfig)).toBe('server');
        expect(getConfigurationPropertiesPrefix(AppConfig)).toBeUndefined();
    });

    test('isConfigurationProperties returns false for undecorated class', () => {
        expect(isConfigurationProperties(UndecoratedConfig)).toBe(false);
    });
});

describe('resolveConfigurationProperties schema mode (AD-34 D3)', () => {
    const runBoot = async (properties: JSONObject) => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties(properties);
        return app.run();
    };

    const serverSchema = z.object({
        name: z.string().default('blue-api'),
        port: z.coerce.number().default(3000),
    });

    test('binds shape keys with coercion and zod defaults', async () => {
        @configurationProperties('server', { schema: serverSchema })
        class SchemaServerConfig {
            name!: string;
            port!: number;
        }
        const context = await runBoot({ server: { name: 'api.prod', port: '9090' } });

        const { instance } = resolveConfigurationProperties(SchemaServerConfig, context);
        expect(instance.name).toBe('api.prod');
        expect(instance.port).toBe(9090); // '9090' → number via z.coerce
    });

    test('fills zod z.default() values when the property is missing', async () => {
        @configurationProperties('server', { schema: serverSchema })
        class SchemaServerConfig {
            name!: string;
            port!: number;
        }
        const context = await runBoot({});

        const { instance } = resolveConfigurationProperties(SchemaServerConfig, context);
        expect(instance.name).toBe('blue-api');
        expect(instance.port).toBe(3000);
    });

    test('throws fail-loud when a required key is missing', async () => {
        @configurationProperties('strict', {
            schema: z.object({ token: z.string() }),
        })
        class SchemaStrictConfig {
            token!: string;
        }
        const context = await runBoot({});

        expect(() => resolveConfigurationProperties(SchemaStrictConfig, context)).toThrowError(
            /Cannot bind SchemaStrictConfig from schema/
        );
    });

    test('throws fail-loud when a coerced value violates the schema', async () => {
        @configurationProperties('server', { schema: serverSchema })
        class SchemaServerConfig {
            name!: string;
            port!: number;
        }
        const context = await runBoot({ server: { port: 'not-a-number' } });

        expect(() => resolveConfigurationProperties(SchemaServerConfig, context)).toThrowError(
            /Cannot bind SchemaServerConfig from schema/
        );
    });

    test('SEC-5: bind failure message redacts raw values, exposing key names only', async () => {
        @configurationProperties('server', { schema: serverSchema })
        class SchemaServerConfig {
            name!: string;
            port!: number;
        }
        const context = await runBoot({
            server: { port: { cipher: 'ENC(SECRET-TOKEN-7f3a)' } },
        });

        const capture = (): string => {
            try {
                resolveConfigurationProperties(SchemaServerConfig, context);
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
            return '';
        };
        const message = capture();

        expect(message).toMatch(/Cannot bind SchemaServerConfig from schema keys \(port\)/);
        expect(message).not.toContain('SECRET-TOKEN-7f3a');
        expect(message).not.toContain('ENC(');
        expect(message).not.toContain('cipher');
    });
});

describe('resolveConfigurationProperties v2', () => {
    const runBoot = async (properties: JSONObject) => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties(properties);
        return app.run();
    };

    test('binds converted values via the environment', async () => {
        const context = await runBoot({
            server: { port: '9090', host: 'blue.dev', db: { url: 'postgres://x' } },
        });

        const { instance } = resolveConfigurationProperties(ServerConfig, context);
        expect(instance.port).toBe(9090); // string → number
        expect(instance.host).toBe('blue.dev');
        expect(instance.db.url).toBe('postgres://x'); // nested binding
    });

    test('uses @defaultValue when the property is missing (converted)', async () => {
        const context = await runBoot({});

        const { instance } = resolveConfigurationProperties(ServerConfig, context);
        expect(instance.port).toBe(8080); // '8080' → number via conversion
        expect(instance.host).toBe('localhost');
        expect(instance.db.url).toBe('mongodb://localhost');
    });

    test('throws fail-loud when a required property is missing', async () => {
        @configurationProperties('strict')
        class StrictConfig {
            @property('token', String) token!: string;
        }
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties({});
        const context = await app.run();

        expect(() => resolveConfigurationProperties(StrictConfig, context)).toThrowError(
            /Missing required property "strict\.token"/
        );
    });

    test('throws fail-loud on conversion failure, naming field/value/type', async () => {
        @configurationProperties('server')
        class PortConfig {
            @property('port', Number) port!: number;
        }
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties({ server: { port: 'abc' } });
        const context = await app.run();

        expect(() => resolveConfigurationProperties(PortConfig, context)).toThrowError(/PortConfig\.port/);
    });
});

describe('@configurationProperties auto-registration (AD-15 D1)', () => {
    test('registers a bound singleton under the camelCase class name', async () => {
        @configuration
        class AppConfigWithProps {
            @entry() ignored() {
                return 'ignored';
            }
        }
        const app = new ApplicationBuilder([AppConfigWithProps, ServerConfig]);
        app.properties({ server: { port: '9090' } });

        const context = await app.run();
        const registered = context.getValue('serverConfig');

        expect(registered).toBeDefined();
        expect((registered as ServerConfig).port).toBe(9090);
    });
});
