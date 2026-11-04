/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { LanguageCode, normalizeLocale } from '../src/language-code';
import { comparableComparison, equates, type Equatable, type StringComparable } from '@ndigo/core';

describe('normalizeLocale', () => {
    test('keeps well-formed tags and canonicalizes case', () => {
        expect(normalizeLocale('fr')).toBe('fr');
        expect(normalizeLocale('fr-CH')).toBe('fr-CH');
        expect(normalizeLocale('EN-us')).toBe('en-US');
        expect(normalizeLocale('zh-Hant-TW')).toBe('zh-Hant-TW');
        expect(normalizeLocale('de-DE-u-ca-gregory')).toBe('de-DE-u-ca-gregory');
    });

    test('rejects markup-capable and malformed values', () => {
        expect(normalizeLocale('" autofocus onfocus="alert(1)')).toBeUndefined();
        expect(normalizeLocale('en"><script>alert(1)</script>')).toBeUndefined();
        expect(normalizeLocale("fr'; DROP TABLE users; --")).toBeUndefined();
        expect(normalizeLocale('en US')).toBeUndefined();
        expect(normalizeLocale('en-US-')).toBeUndefined();
        expect(normalizeLocale('under_score')).toBeUndefined();
        expect(normalizeLocale('')).toBeUndefined();
        expect(normalizeLocale(42)).toBeUndefined();
        expect(normalizeLocale(undefined)).toBeUndefined();
        expect(normalizeLocale(null)).toBeUndefined();
    });

    test('rejects overlong tags', () => {
        const longTag = `en-${'a'.repeat(62)}`;
        expect(longTag.length).toBeGreaterThan(64);
        expect(normalizeLocale(longTag)).toBeUndefined();
    });
});

describe('LanguageCode', () => {
    test('stores the canonical code', () => {
        expect(new LanguageCode('en').code).toBe('en');
        expect(new LanguageCode('en-US').code).toBe('en-US');
    });

    test('canonicalizes case and region casing', () => {
        expect(new LanguageCode('EN-us').code).toBe('en-US');
        expect(new LanguageCode('Fr-ch').code).toBe('fr-CH');
        expect(new LanguageCode('ZH-hant').code).toBe('zh-Hant');
    });

    test('rejects malformed codes', () => {
        expect(() => new LanguageCode('')).toThrow(TypeError);
        expect(() => new LanguageCode('en_US')).toThrow(TypeError);
        expect(() => new LanguageCode('en US')).toThrow(TypeError);
        expect(() => new LanguageCode('en"><script>alert(1)</script>')).toThrow(TypeError);
        expect(() => new LanguageCode('en-US-')).toThrow(TypeError);
    });

    test('for parses valid values', () => {
        expect(LanguageCode.for('en-US')?.code).toBe('en-US');
        expect(LanguageCode.for('EN-us')?.code).toBe('en-US');
    });

    test('for returns null for unusable values', () => {
        expect(LanguageCode.for('en_US')).toBeNull();
        expect(LanguageCode.for('')).toBeNull();
        expect(LanguageCode.for(42)).toBeNull();
        expect(LanguageCode.for(undefined)).toBeNull();
        expect(LanguageCode.for(null)).toBeNull();
    });

    test.each([
        ['EN-us', 'en-US', true],
        ['iw', 'he', true],
        ['en', 'en-US', false],
        ['en-US', 'en-GB', false],
        ['zh-Hans', 'zh-Hant', false],
        ['de-DE', 'de-DE-u-ca-gregory', false],
    ])('compares complete canonical tags: %s and %s', (left, right, equal) => {
        const a = new LanguageCode(left) satisfies Equatable<LanguageCode> & StringComparable<LanguageCode>;
        const b = new LanguageCode(right);
        expect(a.equals(b)).toBe(equal);
        expect(b.equals(a)).toBe(equal);
        expect(equates(a, b)).toBe(equal);
        expect(a.compareTo(b) === 0).toBe(equal);
        expect(a.compareToIgnoreCase(b) === 0).toBe(equal);
    });

    test('orders tags lexicographically rather than by preference or specificity', () => {
        const codes = ['fr', 'en-US', 'en', 'en-GB', 'de'].map((tag) => new LanguageCode(tag));
        expect(codes.sort(comparableComparison).map(String)).toEqual(['de', 'en', 'en-GB', 'en-US', 'fr']);
        expect(
            codes
                .reverse()
                .sort((a, b) => a.compareToIgnoreCase(b))
                .map(String)
        ).toEqual(['de', 'en', 'en-GB', 'en-US', 'fr']);
        const en = new LanguageCode('en');
        const fr = new LanguageCode('fr');
        expect(en.compareTo(fr)).toBeLessThan(0);
        expect(fr.compareTo(en)).toBeGreaterThan(0);
        expect(en.compareToIgnoreCase(fr)).toBeLessThan(0);
        expect(fr.compareToIgnoreCase(en)).toBeGreaterThan(0);
    });

    test('serializes to the code', () => {
        const code = new LanguageCode('fr-CH');
        expect(String(code)).toBe('fr-CH');
        expect(code.toString()).toBe('fr-CH');
        expect(code.toJSON()).toBe('fr-CH');
        expect(code[Symbol.toStringTag]).toBe('LanguageCode:fr-CH');
    });
});
