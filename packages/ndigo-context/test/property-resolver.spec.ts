/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { JSONObject } from '@ndigo/core';
import { MutablePropertySources } from '../src/property-sources';
import { PrototypalPropertyResolver } from '../src/property-resolver';

describe('PrototypalPropertyResolver', () => {
    const jsonData1 = { a: 1, b: 2, c: 3 },
        jsonData2 = { d: 4, e: 5, f: 6 },
        jsonData3 = { g: 7, h: 8, i: 9 },
        jsonData4 = { j: { k: 10, l: 11 } };
    let propertyResolver: PrototypalPropertyResolver;

    beforeEach(() => {
        const sources = new MutablePropertySources();
        sources.addLast('source:0', jsonData1).addLast('source:1', jsonData2);
        sources.addLast('source:2', jsonData3).addLast('source:3', jsonData4);
        propertyResolver = PrototypalPropertyResolver.create(sources);
    });

    test('it should check whether properties exist', () => {
        expect(propertyResolver.hasProperty('c')).toBe(true);
        expect(propertyResolver.hasProperty('j.k')).toBe(true);
        expect(propertyResolver.hasProperty('z')).toBe(false);
    });

    test('it should get properties', () => {
        expect(propertyResolver.getProperty('c')).toBe(3);
        expect(propertyResolver.getProperty('j.k')).toBe(10);
        expect(propertyResolver.getProperty('z')).toBeUndefined();
    });

    test('it should get properties w/ default values', () => {
        expect(propertyResolver.getProperty('e', 10)).toBe(5);
        expect(propertyResolver.getProperty('j.l', 10)).toBe(11);
        expect(propertyResolver.getProperty('z', 10)).toBe(10);
    });

    test('it should get required properties', () => {
        expect(propertyResolver.getRequiredProperty('h')).toBe(8);
        expect(propertyResolver.getRequiredProperty('j.l')).toBe(11);
        expect(() => propertyResolver.getRequiredProperty('z')).toThrow(Error);
    });

    test('CTX-10: a non-string value converts to a String target without crashing', () => {
        // `a` is the number 1. The registry's only (String, String) converter
        // is the UUID converter, so the old path threw `value.trim is not a
        // function`; String targets are pass-through (`String(value)`).
        expect(propertyResolver.getPropertyAs('a', String)).toBe('1');
        expect(propertyResolver.getRequiredPropertyAs('a', String)).toBe('1');
        // An already-string value is untouched.
        expect(propertyResolver.getPropertyAs('c', String)).toBe('3');
    });
});
