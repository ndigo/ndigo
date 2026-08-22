import { describe, test, expect } from 'vitest';
import {
    ApplicationBuilder,
    ConfigurationProperties,
    isConfigurationProperties,
    getConfigurationPropertiesPrefix,
    resolveConfigurationProperties,
} from '../src/index';
import { property, configuration, entry, StandardEnvironment } from '@blue/context';

@ConfigurationProperties('server')
class ServerConfig {
    @property('port')
    port: number | null = null;

    @property('host')
    host: string | null = null;
}

@ConfigurationProperties()
class AppConfig {
    @property('app.title')
    title: string | null = null;
}

class UndecoratedConfig {
    @property('app.mode')
    mode: string | null = null;
}

describe('ConfigurationProperties decorator', () => {
    test('stores metadata on decorated class', () => {
        expect(isConfigurationProperties(ServerConfig)).toBe(true);
    });

    test('stores prefix in metadata', () => {
        expect(getConfigurationPropertiesPrefix(ServerConfig)).toBe('server');
    });

    test('stores undefined prefix when none given', () => {
        expect(getConfigurationPropertiesPrefix(AppConfig)).toBeUndefined();
    });

    test('isConfigurationProperties returns false for undecorated class', () => {
        expect(isConfigurationProperties(UndecoratedConfig)).toBe(false);
    });
});

describe('resolveConfigurationProperties', () => {
    test('resolves prefixed properties from environment', () => {
        const builder = new ApplicationBuilder([]);
        builder.properties({ server: { port: '8080', host: 'localhost' } });
        const context = builder.run();

        const { instance, isValid, bindings } = resolveConfigurationProperties(ServerConfig, context);

        expect(isValid).toBe(true);
        expect(instance.port).toBe('8080');
        expect(instance.host).toBe('localhost');
        expect(bindings['server.port']).toBe('8080');
        expect(bindings['server.host']).toBe('localhost');
    });

    test('resolves unprefixed properties from environment', () => {
        const builder = new ApplicationBuilder([]);
        builder.properties({ app: { title: 'MyApp' } });
        const context = builder.run();

        const { instance, isValid } = resolveConfigurationProperties(AppConfig, context);

        expect(isValid).toBe(true);
        expect(instance.title).toBe('MyApp');
    });

    test('returns isValid false when property is missing', () => {
        const builder = new ApplicationBuilder([]);
        const context = builder.run();

        const { instance, isValid, bindings } = resolveConfigurationProperties(ServerConfig, context);

        expect(isValid).toBe(false);
        expect(instance.port).toBeNull();
        expect(bindings['server.port']).toBeUndefined();
    });

    test('returns null and isValid false when property is missing', () => {
        class DefaultConfig {
            @property('server.port')
            port: number | null = 3000;
        }

        const builder = new ApplicationBuilder([]);
        const context = builder.run();

        const { instance, isValid } = resolveConfigurationProperties(DefaultConfig as any, context);

        expect(isValid).toBe(false);
        // @property decorator sets field to null via addInitializer,
        // overwriting the class field default
        expect(instance.port).toBeNull();
    });
});