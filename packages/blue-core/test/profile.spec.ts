/**
 * Profile expression builder specs (AD-34 D5; re-homed with the builder —
 * AD-83). Config-gating integration for `@whenProfile` lives in
 * `@blue/context` (`test/when-profile.spec.ts`).
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Profile, ProfileTerm } from '../src/profile';

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
});
