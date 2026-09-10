import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { JSONObject } from '@blue/core';
import { PrototypalPropertyResolver } from '../src/property-resolver';

describe('PrototypalPropertyResolver', () => {
    const jsonData1 = { a: 1, b: 2, c: 3 },
        jsonData2 = { d: 4, e: 5, f: 6 },
        jsonData3 = { g: 7, h: 8, i: 9 },
        jsonData4 = { j: { k: 10, l: 11 } };
    let propertySources: JSONObject[];
    let propertyResolver: PrototypalPropertyResolver;

    beforeEach(() => {
        propertySources = [jsonData1, jsonData2, jsonData3, jsonData4];
        propertyResolver = new PrototypalPropertyResolver(propertySources);
    });

    afterEach(() => {
        propertySources = undefined as unknown as JSONObject[];
        propertyResolver = undefined as unknown as PrototypalPropertyResolver;
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
});
