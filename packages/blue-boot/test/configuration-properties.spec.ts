import { describe, test, expect } from 'vitest';
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
            @entry ignored() {
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
