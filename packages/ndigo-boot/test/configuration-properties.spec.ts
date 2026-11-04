/**
 * @module ndigo-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import type { JSONObject } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';
import {
    ApplicationBuilder,
    configurationProperties,
    isConfigurationProperties,
    getConfigurationPropertiesPrefix,
    declaredConfigurationProperties,
    resolveConfigurationProperties,
    relaxedKeyCandidates,
} from '../src/index';
import { property, defaultValue, nestedConfig, configuration, entry, StandardEnvironment } from '@ndigo/context';

class DbConfig {
    @property('url', String as unknown as new (...args: never[]) => string)
    @defaultValue('mongodb://localhost')
    url!: string;
    @property('port', Number as unknown as new (...args: never[]) => number) @defaultValue('5432') port!: number;
    @property('pooled', Boolean as unknown as new (...args: never[]) => boolean) @defaultValue('true') pooled!: boolean;
}

@configurationProperties('server')
class ServerConfig {
    @property('port', Number as unknown as new (...args: never[]) => number) @defaultValue('8080') port!: number;
    @property('host', String as unknown as new (...args: never[]) => string) @defaultValue('localhost') host!: string;
    @nestedConfig db: DbConfig = new DbConfig();
}

@configurationProperties()
class AppConfig {
    @property('app.title', String as unknown as new (...args: never[]) => string) @defaultValue('ndigo') title!: string;
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

describe('declaredConfigurationProperties (value-free inspection seam)', () => {
    test('enumerates field-mode keys with prefix, nesting and declared types, sorted', () => {
        expect(declaredConfigurationProperties(ServerConfig)).toEqual([
            { key: 'server.db.pooled', type: 'boolean' },
            { key: 'server.db.port', type: 'number' },
            { key: 'server.db.url', type: 'string' },
            { key: 'server.host', type: 'string' },
            { key: 'server.port', type: 'number' },
        ]);
    });

    test('omits the type when the field declares none', () => {
        class UntypedConfig {
            @property('app.mode') mode: string | null = null;
        }

        expect(declaredConfigurationProperties(UntypedConfig)).toEqual([{ key: 'app.mode' }]);
    });

    test('enumerates schema-mode shape keys under the prefix with their zod types', () => {
        const schema = z.object({ name: z.string().default('x'), port: z.coerce.number() });

        @configurationProperties('server', { schema })
        class SchemaKeys {
            name!: string;
            port!: number;
        }

        expect(declaredConfigurationProperties(SchemaKeys)).toEqual([
            { key: 'server.name', type: 'string' },
            { key: 'server.port', type: 'number' },
        ]);
    });

    test('BOOT-4: maps schema-mode types from the zod kind, omitting unknown kinds', () => {
        const schema = z.object({
            s: z.string(),
            n: z.number(),
            b: z.boolean(),
            d: z.date(),
            o: z.object({}),
            a: z.array(z.string()),
            u: z.union([z.string(), z.number()]),
        });

        @configurationProperties('shapes', { schema })
        class ShapeKeys {}

        expect(declaredConfigurationProperties(ShapeKeys)).toEqual([
            { key: 'shapes.a', type: 'array' },
            { key: 'shapes.b', type: 'boolean' },
            { key: 'shapes.d', type: 'date' },
            { key: 'shapes.n', type: 'number' },
            { key: 'shapes.o', type: 'object' },
            { key: 'shapes.s', type: 'string' },
            { key: 'shapes.u' }, // union has no mapped conversion target → omitted
        ]);
    });

    test('BOOT-2: a throwing constructor still enumerates keys from metadata (nested listed by top key)', () => {
        @configurationProperties('boom')
        class ThrowingConfig {
            @property('port', Number as unknown as new (...args: never[]) => number) port!: number;
            @property('name', String as unknown as new (...args: never[]) => string) name = 'fallback';
            @nestedConfig db!: DbConfig;

            constructor() {
                throw new Error('no instance for you');
            }
        }

        expect(declaredConfigurationProperties(ThrowingConfig)).toEqual([
            { key: 'boom.db' }, // nested subtree: top-level key only (depth limit)
            { key: 'boom.name', type: 'string' },
            { key: 'boom.port', type: 'number' },
        ]);
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
        name: z.string().default('ndigo-api'),
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
        expect(instance.name).toBe('ndigo-api');
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
                return getErrorMessage(error);
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
            server: { port: '9090', host: 'ndigo.dev', db: { url: 'postgres://x' } },
        });

        const { instance } = resolveConfigurationProperties(ServerConfig, context);
        expect(instance.port).toBe(9090); // string → number
        expect(instance.host).toBe('ndigo.dev');
        expect(instance.db.url).toBe('postgres://x'); // nested binding
    });

    test('uses @defaultValue when the property is missing (converted)', async () => {
        const context = await runBoot({});

        const { instance } = resolveConfigurationProperties(ServerConfig, context);
        expect(instance.port).toBe(8080); // '8080' → number via conversion
        expect(instance.host).toBe('localhost');
        expect(instance.db.url).toBe('mongodb://localhost');
    });

    test('CF-4: converts nested @defaultValue through the same path as top-level fields', async () => {
        const context = await runBoot({});

        const { instance } = resolveConfigurationProperties(ServerConfig, context);
        // Same conversion as the top-level `port` above — the nested default
        // must not bind its raw string.
        expect(instance.db.port).toBe(5432); // '5432' → number
        expect(instance.db.pooled).toBe(true); // 'true' → boolean
    });

    test('throws fail-loud when a required property is missing', async () => {
        @configurationProperties('strict')
        class StrictConfig {
            @property('token', String as unknown as new (...args: never[]) => string) token!: string;
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
            @property('port', Number as unknown as new (...args: never[]) => number) port!: number;
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

describe('relaxed binding + untyped inference (CTX-01/CTX-10/CTX-11)', () => {
    const runBoot = async (properties: JSONObject) => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties(properties);
        return app.run();
    };

    test('CTX-01: a kebab env key binds a camelCase field (forward)', async () => {
        @configurationProperties('server', { relaxed: true })
        class RelaxedCamel {
            @property('hostName', String as unknown as new (...args: never[]) => string) hostName!: string;
        }
        const context = await runBoot({ server: { 'host-name': 'ndigo.dev' } });

        const { instance } = resolveConfigurationProperties(RelaxedCamel, context);
        expect(instance.hostName).toBe('ndigo.dev');
    });

    test('CTX-01: a camelCase env key binds a kebab field (reverse)', async () => {
        @configurationProperties('srv', { relaxed: true })
        class RelaxedKebab {
            @property('host-name', String as unknown as new (...args: never[]) => string) hostName!: string;
        }
        const context = await runBoot({ srv: { hostName: 'ndigo.dev' } });

        const { instance } = resolveConfigurationProperties(RelaxedKebab, context);
        expect(instance.hostName).toBe('ndigo.dev');
    });

    test('CTX-01: the relaxed WINNING key is converted, not the declared path', async () => {
        @configurationProperties('srv', { relaxed: true })
        class RelaxedPort {
            @property('listen-port', Number as unknown as new (...args: never[]) => number) listenPort!: number;
        }
        const context = await runBoot({ srv: { listenPort: '9090' } });

        const { instance } = resolveConfigurationProperties(RelaxedPort, context);
        expect(instance.listenPort).toBe(9090); // winning key: srv.listenPort
    });

    test('CTX-01: nested relaxed binding reads the winning key', async () => {
        class NestedDb {
            @property('userName', String as unknown as new (...args: never[]) => string) userName!: string;
        }
        @configurationProperties('db', { relaxed: true })
        class RelaxedNested {
            @nestedConfig connection: NestedDb = new NestedDb();
        }
        const context = await runBoot({ db: { connection: { 'user-name': 'app' } } });

        const { instance } = resolveConfigurationProperties(RelaxedNested, context);
        expect(instance.connection.userName).toBe('app');
    });

    test('CTX-10: a String-typed field binds a non-string property without crashing', async () => {
        @configurationProperties('svc')
        class StringTargetConfig {
            @property('port', String as unknown as new (...args: never[]) => string) port!: string;
        }
        const context = await runBoot({ svc: { port: 9090 } });

        const { instance } = resolveConfigurationProperties(StringTargetConfig, context);
        expect(instance.port).toBe('9090');
    });

    test('CTX-11: an untyped field with no initializer binds as String (inference rule)', async () => {
        @configurationProperties('untyped')
        class UntypedConfig {
            @property('port') port!: unknown;
        }
        const context = await runBoot({ untyped: { port: '9090' } });

        const { instance } = resolveConfigurationProperties(UntypedConfig, context);
        expect(instance.port).toBe('9090');
        expect(typeof instance.port).toBe('string');
    });

    test('CTX-11: a field initializer infers the conversion target for an untyped field', async () => {
        @configurationProperties('inferred')
        class InferredConfig {
            @property('port') port = 0;
        }
        const context = await runBoot({ inferred: { port: '9090' } });

        const { instance } = resolveConfigurationProperties(InferredConfig, context);
        expect(instance.port).toBe(9090);
    });
});

describe('BOOT-1 schema mode never relaxes (D-3)', () => {
    const runBoot = async (properties: JSONObject) => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties(properties);
        return app.run();
    };

    test('schema mode ignores relaxed: a kebab env key does NOT bind', async () => {
        @configurationProperties('srv', { schema: z.object({ hostName: z.string() }), relaxed: true })
        class SchemaRelaxed {
            hostName!: string;
        }
        const context = await runBoot({ srv: { 'host-name': 'ndigo.dev' } });

        expect(() => resolveConfigurationProperties(SchemaRelaxed, context)).toThrowError(
            /Cannot bind SchemaRelaxed from schema/
        );
    });

    test('field mode with relaxed:true still binds the kebab env key', async () => {
        @configurationProperties('srv', { relaxed: true })
        class FieldRelaxed {
            @property('hostName', String as unknown as new (...args: never[]) => string) hostName!: string;
        }
        const context = await runBoot({ srv: { 'host-name': 'ndigo.dev' } });

        expect(resolveConfigurationProperties(FieldRelaxed, context).instance.hostName).toBe('ndigo.dev');
    });
});

describe('BOOT-3 relaxed candidate set + origin (AD-16 D1)', () => {
    test('relaxedKeyCandidates returns the exact key plus its spelled variants', () => {
        expect(relaxedKeyCandidates('server.hostName')).toEqual([
            'server.hostName',
            'server["host-name"]',
            'server.host_name',
        ]);
        // A kebab-declared key normalizes to its camelCase spelling; the
        // kebab/snake transforms only rewrite uppercase, so no extra snake
        // variant is produced (matching the binding path's candidate set).
        expect(relaxedKeyCandidates('server.host-name')).toEqual(['server["host-name"]', 'server.hostName']);
    });

    test('the documented originOf form works (flat index); the default index retains no origins', () => {
        const environment = new StandardEnvironment([], { index: 'flat' });
        environment.getPropertySources().addLast('application', { server: { port: 8080 } });

        expect(environment.originOf('server')).toBe('application');
        expect(environment.originOf('server.port')).toBe('application'); // top-level granularity
        expect(environment.originOf('missing')).toBeNull();

        // The default prototype-chain index does not retain origins.
        expect(new StandardEnvironment([{ server: { port: 1 } }]).originOf('server')).toBeNull();
    });
});
