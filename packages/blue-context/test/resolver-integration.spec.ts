/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import type { JSONObject } from '@blue/core';
import { MutablePropertySources } from '../src/property-sources';
import { PrototypalPropertyResolver } from '../src/property-resolver';

describe('typed lookup (getPropertyAs / getRequiredPropertyAs)', () => {
    test('should convert string to number', () => {
        const resolver = new PrototypalPropertyResolver([{ port: '8080' }]);
        expect(resolver.getPropertyAs('port', Number)).toBe(8080);
    });

    test('should convert string to boolean', () => {
        const resolver = new PrototypalPropertyResolver([{ debug: 'true', off: 'false' }]);
        expect(resolver.getPropertyAs('debug', Boolean)).toBe(true);
        expect(resolver.getPropertyAs('off', Boolean)).toBe(false);
    });

    test('should convert string to Date', () => {
        const resolver = new PrototypalPropertyResolver([{ when: '2026-09-08' }]);
        expect(resolver.getPropertyAs('when', Date)).toEqual(new Date('2026-09-08'));
    });

    test('should identity-pass already-typed values', () => {
        const resolver = new PrototypalPropertyResolver([{ port: 8080, debug: true }]);
        expect(resolver.getPropertyAs('port', Number)).toBe(8080);
        expect(resolver.getPropertyAs('debug', Boolean)).toBe(true);
    });

    test('should return the default when missing (no conversion attempted)', () => {
        const resolver = new PrototypalPropertyResolver([{ a: 1 }]);
        expect(resolver.getPropertyAs('missing', Number, 42)).toBe(42);
        expect(resolver.getPropertyAs('missing', Number)).toBeUndefined();
    });

    test('should throw IllegalStateError on conversion failure, naming key/value/type', () => {
        const resolver = new PrototypalPropertyResolver([{ port: 'abc' }]);
        expect(() => resolver.getRequiredPropertyAs('port', Number)).toThrowError(/could not be converted/);
    });

    test('should reject NaN from NumberConverter', () => {
        const resolver = new PrototypalPropertyResolver([{ port: 'abc' }]);
        expect(() => resolver.getPropertyAs('port', Number)).toThrowError(/NaN/);
    });

    test('getRequiredPropertyAs should throw on missing', () => {
        const resolver = new PrototypalPropertyResolver([{ a: 1 }]);
        expect(() => resolver.getRequiredPropertyAs('missing', Number)).toThrowError(
            /Required property "missing" missing/
        );
    });

    test('should compose placeholders with typed lookup', () => {
        const resolver = new PrototypalPropertyResolver([{ base: '8080', port: '${base}' }]);
        expect(resolver.getPropertyAs('port', Number)).toBe(8080);
    });
});

describe('placeholder integration through resolver', () => {
    test('getProperty resolves placeholders; getRequiredProperty distinguishes unresolved', () => {
        const resolver = new PrototypalPropertyResolver([
            { host: 'blue.dev', url: 'http://${host}/api', broken: '${missing}' },
        ]);
        expect(resolver.getProperty('url')).toBe('http://blue.dev/api');
        expect(resolver.getProperty('broken')).toBe('${missing}');
        expect(() => resolver.getRequiredProperty('broken')).toThrowError(/could not be resolved/);
    });

    test('hasProperty answers raw presence, not placeholder resolution', () => {
        const resolver = new PrototypalPropertyResolver([{ a: '${missing}' }]);
        expect(resolver.hasProperty('a')).toBe(true);
    });

    test('placeholder cache invalidates on registry replace', () => {
        const registry = new MutablePropertySources();
        registry.addLast('user', { a: 'one', ref: '${a}' });
        const resolver = PrototypalPropertyResolver.create(registry);

        expect(resolver.getProperty('ref')).toBe('one');

        registry.replace('user', { a: 'two', ref: '${a}' });

        expect(resolver.getProperty('ref')).toBe('two');
    });
});
