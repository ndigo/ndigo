/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { ContextToken } from '@blue/factory';
import { MetadataConfigApplicationContext, configuration, entry } from '../src/configuration';
import testContext from './testContext';

describe('Configuration', () => {
    test('it should register values', () => {
        const bar = testContext.getValue('bar'),
            foo = testContext.getValue('foo'),
            qux = testContext.getValue('qux'),
            baz = testContext.getValue('baz'),
            fuu = testContext.getValue('fuu');

        expect(foo).toBe(12);
        expect(bar).not.toBeUndefined();
        expect(baz).toBe(12);
        expect(qux).toBeUndefined();
        expect(fuu).toBe(78);
    });
});

describe('MetadataConfigApplicationContext', () => {
    test('it should ignore non-configurations', () => {
        class FakeConfig {
            foo() {
                return 'foo';
            }
        }

        const context = new MetadataConfigApplicationContext();
        context.register(FakeConfig);

        expect(context.getValue('foo')).toBeUndefined();
    });

    test('it should register token-declared entries (AD-34 D1)', () => {
        const tokenEntry = new ContextToken<number>('tokenEntry');

        @configuration
        class TokenConfiguration {
            @entry(tokenEntry)
            tokenEntry() {
                return 42;
            }

            @entry('plainEntry')
            namedEntry() {
                return 'named';
            }
        }

        const context = new MetadataConfigApplicationContext();
        context.register(TokenConfiguration);

        // Token lookup resolves; the string description stays an alias.
        expect(context.getValue(tokenEntry)).toBe(42);
        expect(context.getValue<number>('tokenEntry')).toBe(42);
        expect(context.hasValue(tokenEntry)).toBe(true);
        expect(context.getValue<string>('plainEntry')).toBe('named');
    });

    test('it should keep the string @entry name authoritative when no token is declared', () => {
        @configuration
        class NamedConfiguration {
            @entry('custom:name')
            method() {
                return 'registered';
            }
        }

        const context = new MetadataConfigApplicationContext();
        context.register(NamedConfiguration);

        expect(context.getValue<string>('custom:name')).toBe('registered');
        expect(context.getValue<string>('method')).toBeUndefined();
    });

    test('FOLLOW-1: a bare subclass of a @configuration registers @entry factories declared only on the base', () => {
        @configuration
        class BaseOnlyConfiguration {
            @entry
            alpha() {
                return 'alpha-bean';
            }

            @entry('beta')
            betaEntry() {
                return 21;
            }
        }

        class BareSubConfiguration extends BaseOnlyConfiguration {}

        const context = new MetadataConfigApplicationContext();
        context.register(BareSubConfiguration);

        // Both base-declared beans register on the subclass instance.
        expect(context.getValue<string>('alpha')).toBe('alpha-bean');
        expect(context.getValue<number>('beta')).toBe(21);
    });

    test('FOLLOW-1: subclass-declared @entry factories still register, alongside the inherited base ones, once each', () => {
        let baseCalls = 0;
        let subCalls = 0;

        @configuration
        class OutlineConfiguration {
            @entry
            outline() {
                baseCalls += 1;
                return 'outline-bean';
            }
        }

        class WorkingConfiguration extends OutlineConfiguration {
            @entry
            works() {
                subCalls += 1;
                return 'works-bean';
            }
        }

        const context = new MetadataConfigApplicationContext();
        context.register(WorkingConfiguration);

        // Subclass-declared and inherited base entries both resolve...
        expect(context.getValue<string>('outline')).toBe('outline-bean');
        expect(context.getValue<string>('works')).toBe('works-bean');

        // ...and each factory runs exactly once (no double registration from
        // the prototype-chain enumerability walk).
        expect(baseCalls).toBe(1);
        expect(subCalls).toBe(1);
    });
});
