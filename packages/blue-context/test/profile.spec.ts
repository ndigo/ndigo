/**
 * Profile expression builder specs (AD-34 D5).
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Profile, ProfileTerm } from '../src/profile';
import { StandardEnvironment } from '../src/environment';
import { configuration, entry, profile, MetadataConfigApplicationContext } from '../src/configuration';

describe('Profile builder (AD-34 D5)', () => {
    test('composes simple gates to canonical strings', () => {
        expect(String(Profile.and('dev', 'ci'))).toBe('dev & ci');
        expect(String(Profile.or('dev', 'ci'))).toBe('dev | ci');
        expect(String(Profile.not('dev'))).toBe('!dev');
    });

    test('terms are strings when passed around', () => {
        const term = Profile.not('ci');
        expect(`${term}`).toBe('!ci');
        expect(String(term)).toBe('!ci');
        expect(term).toBeInstanceOf(ProfileTerm);
    });

    test('parenthesizes loose compounds under tighter operators', () => {
        expect(String(Profile.and(Profile.or('dev', 'ci'), 'ops'))).toBe('(dev | ci) & ops');
        expect(String(Profile.and('dev', Profile.not('ci')))).toBe('dev & !ci');
        expect(String(Profile.not(Profile.and('dev', 'ci')))).toBe('!(dev & ci)');
        expect(String(Profile.and('a | b', 'c'))).toBe('(a | b) & c');
    });

    test('keeps tight compounds unwrapped under looser operators', () => {
        expect(String(Profile.or(Profile.and('a', 'b'), 'c'))).toBe('a & b | c');
    });

    test('validates raw strings through the existing grammar', () => {
        expect(() => Profile.and('dev &', 'ci')).toThrowError();
        expect(() => Profile.or('(dev', 'ci')).toThrowError();
        expect(Profile.parse('dev & !ci')).toBe('dev & !ci');
        expect(() => Profile.and()).toThrowError();
    });

    test('composed terms evaluate identically to their strings', () => {
        const env = new StandardEnvironment();
        env.addActiveProfile('dev');

        expect(env.acceptsProfiles('dev & !ci')).toBe(true);
        expect(env.acceptsProfiles(Profile.and('dev', Profile.not('ci')))).toBe(true);
        expect(env.acceptsProfiles(Profile.and(Profile.or('dev', 'ci'), 'ops'))).toBe(false);
    });
});

describe('@profile with composed terms (AD-34 D5)', () => {
    test('registers the canonical string metadata', () => {
        const term = Profile.and('test', Profile.not('ci'));

        @configuration
        class TermConfiguration {
            @profile(String(term))
            @entry('termEntry')
            value() {
                return 1;
            }

            @profile(term)
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
});
