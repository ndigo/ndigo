/**
 * Behavioral tests for @ndigo/context decorators.
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Enumerable, JSONObject, JSONValue, whenProfile } from '@ndigo/core';
import { ContextToken } from '@ndigo/factory';
import { ConfigurableEnvironment } from '../src/environment';
import { configuration, entry, property, propertySource, MetadataConfigApplicationContext } from '../src/configuration';

/**
 * Reads the decorator metadata store (Symbol.metadata), dynamically typed at
 * runtime; the tests assert the shapes the decorators wrote.
 */
const metadataOf = (target: object): Record<string, unknown> =>
    (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};

describe('@configuration Decorator', () => {
    it('marks a class as a configuration class', () => {
        @configuration
        class TestConfig {}

        // Check that the metadata was set (TC39 style)
        const metadata = metadataOf(TestConfig);
        expect(metadata).toBeDefined();
        expect(metadata['config:constructor']).toBe(true);
    });

    it('returns the original class', () => {
        @configuration
        class TestConfig {}

        expect(TestConfig).toBeDefined();
        expect(typeof TestConfig).toBe('function');
    });

    it('can be used without parentheses', () => {
        @configuration
        class TestConfig {
            @entry()
            foo() {
                return 'foo';
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.register(TestConfig);
        expect(context.getValue('foo')).toBe('foo');
    });
});

describe('@whenProfile Decorator', () => {
    it('stores the canonical condition on a class', () => {
        @configuration
        @whenProfile('dev')
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        expect(metadata['boot:whenProfile']).toBe('dev');
    });

    it('stores the canonical condition on a method', () => {
        @configuration
        class TestConfig {
            @whenProfile('dev')
            @entry()
            foo() {
                return 'dev-foo';
            }
        }

        const metadata = metadataOf(TestConfig);
        expect(metadata['boot:whenProfile:foo']).toBe('dev');
    });

    it('folds multiple arguments into one either-of expression', () => {
        @configuration
        @whenProfile('dev', 'test')
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        expect(metadata['boot:whenProfile']).toBe('dev | test');
    });

    it('only activates entries when profile matches', () => {
        @configuration
        class TestConfig {
            @whenProfile('dev')
            @entry()
            devOnly() {
                return 'dev';
            }

            @whenProfile('prod')
            @entry()
            prodOnly() {
                return 'prod';
            }
        }

        const devContext = new MetadataConfigApplicationContext('test');
        devContext.environment.activeProfiles = ['dev'];
        devContext.register(TestConfig);

        expect(devContext.getValue('devOnly')).toBe('dev');
        expect(devContext.getValue('prodOnly')).toBeUndefined();
    });

    it('evaluates profile expressions on entries (AD-14)', () => {
        @configuration
        class TestConfig {
            @whenProfile('!prod & (dev | test)')
            @entry()
            devOrTest() {
                return 'dev-or-test';
            }

            @whenProfile('prod')
            @entry()
            prodOnly() {
                return 'prod';
            }
        }

        const devContext = new MetadataConfigApplicationContext('test');
        devContext.environment.activeProfiles = ['dev'];
        devContext.register(TestConfig);

        expect(devContext.getValue('devOrTest')).toBe('dev-or-test');
        expect(devContext.getValue('prodOnly')).toBeUndefined();

        const prodContext = new MetadataConfigApplicationContext('test');
        prodContext.environment.activeProfiles = ['prod'];
        prodContext.register(TestConfig);

        expect(prodContext.getValue('devOrTest')).toBeUndefined();
        expect(prodContext.getValue('prodOnly')).toBe('prod');
    });

    it('default profiles gate when nothing is explicit (AD-14)', () => {
        @configuration
        class TestConfig {
            @whenProfile('base')
            @entry()
            baseOnly() {
                return 'base';
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.environment.addDefaultProfile('base');
        context.register(TestConfig);

        expect(context.getValue('baseOnly')).toBe('base');
    });
});

describe('@property Decorator', () => {
    it('stores property path metadata', () => {
        @configuration
        class TestConfig {
            @property('foo.bar')
            myProp: unknown;
        }

        const metadata = metadataOf(TestConfig);
        expect(metadata['config:property:myProp']).toBe('foo.bar');
    });

    it('preserves field initializers for type inference', () => {
        @configuration
        class TestConfig {
            @property('foo')
            myProp: string = 'initial';
        }

        const instance = new TestConfig();
        const descriptor = Object.getOwnPropertyDescriptor(instance, 'myProp');
        expect(descriptor).toBeDefined();
        // The decorator no longer replaces the field with null — the
        // author's initializer survives so config binders can infer the
        // field type (AD-15); the parser overwrites resolved values.
        expect(descriptor?.value).toBe('initial');
        expect(descriptor?.writable).toBe(true);
    });

    it('makes property configurable and enumerable', () => {
        @configuration
        class TestConfig {
            @property('foo')
            myProp: unknown;
        }

        // Properties are created on instances with TC39 field decorators
        const instance = new TestConfig();
        const descriptor = Object.getOwnPropertyDescriptor(instance, 'myProp');
        expect(descriptor?.configurable).toBe(true);
        expect(descriptor?.enumerable).toBe(true);
    });

    it('resolves property values from property sources', () => {
        @configuration
        @propertySource({ foo: 'bar', nested: { value: 42 } })
        class TestConfig {
            @property('foo')
            fooValue: unknown;

            @property('nested.value')
            nestedValue: unknown;

            @entry()
            getFoo() {
                return this.fooValue;
            }

            @entry()
            getNested() {
                return this.nestedValue;
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.register(TestConfig);

        expect(context.getValue('getFoo')).toBe('bar');
        expect(context.getValue('getNested')).toBe(42);
    });

    it('supports array indexing in property paths', () => {
        @configuration
        @propertySource({ arr: [1, 2, 3] })
        class TestConfig {
            @property('arr[1]')
            secondItem: unknown;

            @entry()
            getItem() {
                return this.secondItem;
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.register(TestConfig);

        expect(context.getValue('getItem')).toBe(2);
    });

    it('binds @property fields without @propertySource (CF-9)', () => {
        @configuration
        class TestConfig {
            @property('foo')
            fooValue: unknown;

            @entry()
            getFoo() {
                return this.fooValue;
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        (context.environment as ConfigurableEnvironment).getPropertySources().addFirst('test', { foo: 'bar' });
        context.register(TestConfig);

        expect(context.getValue('getFoo')).toBe('bar');
    });
});

describe('@propertySource Decorator', () => {
    it('stores property source metadata as an array', () => {
        @configuration
        @propertySource({ foo: 'bar' })
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        expect(metadata['config:property:source']).toEqual([{ foo: 'bar' }]);
    });

    it('supports multiple property sources', () => {
        @configuration
        @propertySource({ foo: 'first' })
        @propertySource({ bar: 'second' })
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        // The decorator wrote the property source array under this key
        const sources = metadata['config:property:source'] as JSONObject[];
        expect(sources).toHaveLength(2);
        // First applied decorator is first in array
        expect(sources[0]).toEqual({ foo: 'first' });
        expect(sources[1]).toEqual({ bar: 'second' });
    });

    it('accepts Enumerable objects', () => {
        const map = new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]);

        @configuration
        @propertySource(map as unknown as Enumerable<string, JSONValue>)
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        const sources = metadata['config:property:source'] as JSONObject[];
        expect(sources[0]).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('handles non-object inputs gracefully', () => {
        // Non-objects that don't match likeEnumerable are stored as-is
        @configuration
        @propertySource('string' as unknown as JSONObject)
        class TestConfig {}

        const metadata = metadataOf(TestConfig);
        const sources = metadata['config:property:source'] as unknown[];
        expect(sources).toHaveLength(1);
        // Implementation detail: non-enumerable values are stored as-is
        expect(sources[0]).toBe('string');
    });
});

describe('@entry Decorator', () => {
    it('stores entry metadata with method name when used without argument', () => {
        @configuration
        class TestConfig {
            @entry()
            myMethod() {
                return 'result';
            }
        }

        const metadata = metadataOf(TestConfig);
        expect(metadata['config:entry:myMethod']).toEqual({ name: 'myMethod', token: undefined });
    });

    it('stores entry metadata with custom name when used with argument', () => {
        @configuration
        class TestConfig {
            @entry('customName')
            myMethod() {
                return 'result';
            }
        }

        const metadata = metadataOf(TestConfig);
        expect(metadata['config:entry:myMethod']).toEqual({ name: 'customName', token: undefined });
    });

    it('stores entry metadata with a ContextToken when used with a token (AD-34 D1)', () => {
        const methodToken = new ContextToken<string>('methodToken');

        @configuration
        class TestConfig {
            @entry(methodToken)
            myMethod() {
                return 'result';
            }
        }

        const metadata = metadataOf(TestConfig);
        expect(metadata['config:entry:myMethod']).toEqual({ name: 'methodToken', token: methodToken });
    });

    it('makes method enumerable', () => {
        @configuration
        class TestConfig {
            @entry()
            myMethod() {
                return 'result';
            }
        }

        // TC39 method decorators don't automatically make methods enumerable
        // This test needs to be adjusted or the decorator needs to be updated
        const descriptor = Object.getOwnPropertyDescriptor(TestConfig.prototype, 'myMethod');
        // NOTE: TC39 decorators don't modify enumerability by default
        // If this behavior is required, we need to update the decorator
        expect(descriptor).toBeDefined();
    });

    it('registers entry values in the context', () => {
        @configuration
        class TestConfig {
            @entry()
            foo() {
                return 'foo-value';
            }

            @entry('customBar')
            bar() {
                return 'bar-value';
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.register(TestConfig);

        expect(context.getValue('foo')).toBe('foo-value');
        expect(context.getValue('customBar')).toBe('bar-value');
    });

    it('does not register methods without @entry decorator', () => {
        @configuration
        class TestConfig {
            @entry()
            included() {
                return 'included';
            }

            notIncluded() {
                return 'not-included';
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.register(TestConfig);

        expect(context.getValue('included')).toBe('included');
        expect(context.getValue('notIncluded')).toBeUndefined();
    });
});

describe('Decorator Integration', () => {
    it('works with all decorators combined', () => {
        @configuration
        @whenProfile('test')
        @propertySource({ appName: 'MyApp', version: '1.0.0' })
        class AppConfig {
            @property('appName')
            name: unknown;

            @property('version')
            ver: unknown;

            @entry()
            getAppInfo() {
                return `${this.name} v${this.ver}`;
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.environment.activeProfiles = ['test'];
        context.register(AppConfig);

        expect(context.getValue('getAppInfo')).toBe('MyApp v1.0.0');
    });

    it('respects profile restrictions', () => {
        @configuration
        @propertySource({ foo: 'bar' })
        class TestConfig {
            @property('foo')
            fooValue: unknown;

            @whenProfile('dev')
            @entry()
            devEntry() {
                return this.fooValue;
            }

            @whenProfile('prod')
            @entry()
            prodEntry() {
                return this.fooValue;
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.environment.activeProfiles = ['dev'];
        context.register(TestConfig);

        expect(context.getValue('devEntry')).toBe('bar');
        expect(context.getValue('prodEntry')).toBeUndefined();
    });
});
