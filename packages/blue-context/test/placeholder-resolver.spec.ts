import { describe, test, expect } from 'vitest';
import type { JSONObject } from '@blue/core';
import { PrototypalPropertyResolver } from '../src/property-resolver';
import { resolvePlaceholders } from '../src/placeholder-resolver';

const makeResolver = (sources: JSONObject[]) => new PrototypalPropertyResolver(sources);

describe('resolvePlaceholders', () => {
    test('should resolve a simple placeholder', () => {
        const resolver = makeResolver([{ host: 'blue.dev' }]);
        expect(resolvePlaceholders('http://${host}/api', resolver)).toBe('http://blue.dev/api');
    });

    test('should use the inline default when the key is missing', () => {
        const resolver = makeResolver([{}]);
        expect(resolvePlaceholders('${port:8080}', resolver)).toBe('8080');
    });

    test('should use the resolved value over the inline default', () => {
        const resolver = makeResolver([{ port: '9000' }]);
        expect(resolvePlaceholders('${port:8080}', resolver)).toBe('9000');
    });

    test('should preserve a default containing colons', () => {
        const resolver = makeResolver([{}]);
        expect(resolvePlaceholders('${url:https://blue.dev}', resolver)).toBe('https://blue.dev');
    });

    test('should respect an empty-string value (not treat as missing)', () => {
        const resolver = makeResolver([{ key: '' }]);
        expect(resolvePlaceholders('${key:default}', resolver)).toBe('');
    });

    test('should resolve nested placeholders', () => {
        const resolver = makeResolver([{ a: '${b}', b: 'value' }]);
        expect(resolvePlaceholders('${a}', resolver)).toBe('value');
    });

    test('should resolve nested defaults', () => {
        const resolver = makeResolver([{}]);
        expect(resolvePlaceholders('${a:${b:fallback}}', resolver)).toBe('fallback');
    });

    test('should throw on a placeholder cycle, naming the cycle', () => {
        const resolver = makeResolver([{ a: '${b}', b: '${a}' }]);
        expect(() => resolvePlaceholders('${a}', resolver)).toThrowError(/Circular placeholder reference: a → b → a/);
    });

    test('should throw on runaway non-cyclic nesting (depth cap)', () => {
        // Chain of values referencing values: level0 → level1 → … → 15 deep.
        const sources: JSONObject = {};
        for (let i = 0; i < 15; i++) sources[`level${i}`] = `$\{level${i + 1}}`;
        sources['level15'] = '0';
        const resolver = makeResolver([sources]);
        expect(() => resolvePlaceholders('${level0}', resolver)).toThrowError(/maximum depth/);
    });

    test('should pass through an unresolvable placeholder literally', () => {
        const resolver = makeResolver([{}]);
        expect(resolvePlaceholders('${missing}', resolver)).toBe('${missing}');
    });

    test('should pass through an unterminated ${ literally', () => {
        const resolver = makeResolver([{ a: 'x' }]);
        expect(resolvePlaceholders('${a', resolver)).toBe('${a');
    });

    test('should leave non-placeholder strings untouched', () => {
        const resolver = makeResolver([{}]);
        expect(resolvePlaceholders('plain value', resolver)).toBe('plain value');
    });
});
