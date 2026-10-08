/**
 * Schema-config binding, property keys and typedConfig specs (AD-34 D3/D4).
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { GenericApplicationContext } from '../src/context';
import { StandardEnvironment, ConfigurableEnvironment } from '../src/environment';
import { resolveSchemaConfig, parseSchemaConfig, propertyKeys } from '../src/schema-config';

const serverSchema = z.object({
    name: z.string().default('blue-api'),
    port: z.coerce.number().default(3000),
});

describe('resolveSchemaConfig (AD-34 D3)', () => {
    test('resolves shape keys under the prefix with coercion and defaults', () => {
        const env = new StandardEnvironment([{ server: { name: 'api.prod', port: '9090' } }]);

        const value = resolveSchemaConfig(serverSchema, 'server', env);
        expect(value).toEqual({ name: 'api.prod', port: 9090 });
    });

    test('omits absent keys so zod defaults apply', () => {
        const env = new StandardEnvironment([]);

        const value = resolveSchemaConfig(serverSchema, 'server', env);
        expect(value).toEqual({ name: 'blue-api', port: 3000 });
    });

    test('throws on schema violations', () => {
        const env = new StandardEnvironment([{ server: { port: 'abc' } }]);

        expect(() => resolveSchemaConfig(serverSchema, 'server', env)).toThrowError();
    });

    test('leaf mode resolves a scalar schema at the prefix path', () => {
        const env = new StandardEnvironment([{ limits: { maxAge: '3600' } }]);

        const value = resolveSchemaConfig(z.coerce.number(), 'limits.maxAge', env);
        expect(value).toBe(3600);
    });

    test('leaf mode yields undefined for an absent value', () => {
        const env = new StandardEnvironment([]);

        expect(resolveSchemaConfig(z.coerce.number(), 'limits.maxAge', env)).toBeUndefined();
    });
});

describe('parseSchemaConfig', () => {
    test('parses pre-gathered raw values', () => {
        expect(parseSchemaConfig(serverSchema, { port: '8080' })).toEqual({ name: 'blue-api', port: 8080 });
    });
});

describe('propertyKeys (AD-34 D4)', () => {
    test('materializes leaf keypaths in the same shape', () => {
        const keys = propertyKeys({ server: { name: '', port: 0 }, db: { url: '' } });

        expect(keys.server.name).toBe('server.name');
        expect(keys.server.port).toBe('server.port');
        expect(keys.db.url).toBe('db.url');
    });

    test('flattens arrays to their containing key', () => {
        const keys = propertyKeys({ cluster: { nodes: [] } });

        expect(keys.cluster.nodes).toBe('cluster.nodes');
    });
});

describe('typedConfig (AD-34 D3)', () => {
    test('environment resolves schema-typed values', () => {
        const env = new StandardEnvironment([{ server: { name: 'x', port: '4444' } }]);

        expect(env.typedConfig('server', serverSchema)).toEqual({ name: 'x', port: 4444 });
        expect(env.typedConfig('server.port', z.coerce.number())).toBe(4444);
    });

    test('context mirrors the environment read', () => {
        const context = new GenericApplicationContext('typed-config');
        (context.environment as ConfigurableEnvironment)
            .getPropertySources()
            .addLast('test', { server: { name: 'n', port: '1234' } });

        const value = context.typedConfig('server', serverSchema);
        expect(value).toEqual({ name: 'n', port: 1234 });

        context.close();
    });
});
