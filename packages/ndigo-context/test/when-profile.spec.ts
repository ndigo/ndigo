/**
 * `@whenProfile` configuration gating specs — the unified profile condition
 * (AD-83): class and method gates evaluated through the environment's
 * `acceptsProfiles`, composed `Profile` terms, and variadic either-of.
 */
import { describe, test, expect } from 'vitest';
import { Profile, whenProfile } from '@ndigo/core';
import { StandardEnvironment } from '../src/environment';
import { configuration, entry, MetadataConfigApplicationContext } from '../src/configuration';

describe('environment.acceptsProfiles with composed terms (AD-34 D5)', () => {
    test('terms evaluate identically to their strings', () => {
        const env = new StandardEnvironment();
        env.addActiveProfile('dev');

        expect(env.acceptsProfiles('dev & !ci')).toBe(true);
        expect(env.acceptsProfiles(Profile.and('dev', Profile.not('ci')))).toBe(true);
        expect(env.acceptsProfiles(Profile.and(Profile.or('dev', 'ci'), 'ops'))).toBe(false);
    });
});

describe('@whenProfile config gating (AD-83)', () => {
    test('gates class registration on the active profile', () => {
        @configuration
        @whenProfile('prod')
        class ProdOnlyConfiguration {
            @entry()
            prodValue() {
                return 'prod-value';
            }
        }

        const devContext = new MetadataConfigApplicationContext('class-profiles-dev');
        devContext.environment.activeProfiles = ['dev'];
        devContext.register(ProdOnlyConfiguration);
        expect(devContext.getValue('prodValue')).toBeUndefined();

        const prodContext = new MetadataConfigApplicationContext('class-profiles-prod');
        prodContext.environment.activeProfiles = ['prod'];
        prodContext.register(ProdOnlyConfiguration);
        expect(prodContext.getValue('prodValue')).toBe('prod-value');
    });

    test('gates entry methods with composed terms', () => {
        const term = Profile.and('test', Profile.not('ci'));

        @configuration
        class TermConfiguration {
            @whenProfile(String(term))
            @entry('termEntry')
            value() {
                return 1;
            }

            @whenProfile(term)
            @entry('directTermEntry')
            other() {
                return 2;
            }
        }

        const context = new MetadataConfigApplicationContext('term-profiles');
        context.environment.addActiveProfile('test');
        context.register(TermConfiguration);

        expect(context.getValue<number>('termEntry')).toBe(1);
        expect(context.getValue<number>('directTermEntry')).toBe(2);
    });

    test('variadic arguments fold to either-of on entry methods', () => {
        @configuration
        class EitherOfConfiguration {
            @whenProfile('dev', 'test')
            @entry('eitherOf')
            eitherOf() {
                return 'either-of';
            }
        }

        const testContext = new MetadataConfigApplicationContext('either-of-test');
        testContext.environment.addActiveProfile('test');
        testContext.register(EitherOfConfiguration);
        expect(testContext.getValue('eitherOf')).toBe('either-of');

        const qaContext = new MetadataConfigApplicationContext('either-of-qa');
        qaContext.environment.addActiveProfile('qa');
        qaContext.register(EitherOfConfiguration);
        expect(qaContext.getValue('eitherOf')).toBeUndefined();
    });
});
