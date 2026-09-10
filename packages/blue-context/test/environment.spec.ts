import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
    MockEnvironment,
    StandardEnvironment,
    likeEnvironment,
    likeEnvironmentAware,
    likeEnvironmentSource,
} from '../src/environment';
import { Null } from '@blue/core';
import { AsEnvironmentAware } from '../src/environment';

describe('StandardEnvironment', () => {
    const jsonData1 = { a: 1, b: 2, c: 3 };
    let env: StandardEnvironment;

    beforeEach(() => {
        env = new StandardEnvironment();
        env.activeProfiles = ['foo', 'bar'];
        env.propertySources = [jsonData1];
    });

    afterEach(() => {
        env = undefined as unknown as StandardEnvironment;
    });

    test('it should track active profiles', () => {
        expect(env.activeProfiles).toContain('foo');
        expect(env.activeProfiles).toContain('bar');
        expect(env.activeProfiles).toHaveLength(2);

        expect(env.activeProfiles).not.toContain('qux');
        env.addActiveProfile('qux');
        expect(env.activeProfiles).toContain('qux');
        expect(env.activeProfiles).toHaveLength(3);

        env.activeProfiles = ['baz'];
        expect(env.activeProfiles).toContain('baz');
        expect(env.activeProfiles).not.toContain('foo');
        expect(env.activeProfiles).not.toContain('bar');
        expect(env.activeProfiles).not.toContain('qux');
        expect(env.activeProfiles).toHaveLength(1);
    });

    test('it should track default profiles', () => {
        expect(env.defaultProfiles).toHaveLength(0);

        env.addDefaultProfile('base');
        env.addDefaultProfile('base');

        expect(env.defaultProfiles).toContain('base');
        expect(env.defaultProfiles).toHaveLength(1);

        env.defaultProfiles = ['browser', 'app'];

        expect(env.defaultProfiles).toContain('browser');
        expect(env.defaultProfiles).toContain('app');
        expect(env.defaultProfiles).toHaveLength(2);
    });

    test('it should expose profile state in Symbol.toStringTag', () => {
        expect(Object.prototype.toString.call(env)).toBe('[object Environment:foo,bar]');
    });

    test('it should delegate property resolution methods', () => {
        expect(env.hasProperty('a')).toBe(true);
        expect(env.hasProperty('none')).toBe(false);

        expect(env.getProperty('b')).toBe(2);
        expect(env.getProperty('none', 42)).toBe(42);

        expect(env.getRequiredProperty('c')).toBe(3);
        expect(() => env.getRequiredProperty('none')).toThrow('Required property "none" missing');
    });

    test('it should merge property sources and profiles', () => {
        const incoming = new StandardEnvironment([{ d: 4 }]);
        incoming.activeProfiles = ['bar', 'baz'];
        incoming.defaultProfiles = ['base', 'browser'];

        env.defaultProfiles = ['base'];
        env.merge(incoming);

        expect(env.propertySources).toHaveLength(2);
        expect(env.getProperty('a')).toBe(1);
        expect(env.getProperty('d')).toBe(4);
        expect(env.activeProfiles).toEqual(expect.arrayContaining(['foo', 'bar', 'baz']));
        expect(env.defaultProfiles).toEqual(expect.arrayContaining(['base', 'browser']));
        expect(env.defaultProfiles.filter((profile) => profile === 'base')).toHaveLength(1);
    });

    test('it should not change state when merging an empty environment', () => {
        env.defaultProfiles = ['base'];
        const snapshot = {
            activeProfiles: [...env.activeProfiles],
            defaultProfiles: [...env.defaultProfiles],
            propertySourcesLength: env.propertySources.length,
        };

        env.merge(new StandardEnvironment());

        expect(env.activeProfiles).toEqual(snapshot.activeProfiles);
        expect(env.defaultProfiles).toEqual(snapshot.defaultProfiles);
        expect(env.propertySources).toHaveLength(snapshot.propertySourcesLength);
    });
});

describe('Environment predicates and mixins', () => {
    test('it should identify environment-like values', () => {
        const env = new StandardEnvironment();

        expect(likeEnvironment(env)).toBe(true);
        expect(likeEnvironment({})).toBe(false);
        expect(likeEnvironment(null)).toBe(false);
    });

    test('it should identify environment-aware values', () => {
        class TestAware extends AsEnvironmentAware(Null) {}

        const aware = new TestAware();
        aware.setEnvironment(new StandardEnvironment());

        expect(likeEnvironmentAware(aware)).toBe(true);
        expect(likeEnvironmentAware({})).toBe(false);
    });

    test('it should identify environment sources', () => {
        const source = {
            environment: new StandardEnvironment(),
        };

        expect(likeEnvironmentSource(source)).toBe(true);
        expect(likeEnvironmentSource({ environment: {} })).toBe(false);
        expect(likeEnvironmentSource(undefined)).toBe(false);
    });
});

describe('MockEnvironment', () => {
    test('it should behave like a concrete environment', () => {
        const mock = new MockEnvironment([{ value: 9 }]);

        mock.addActiveProfile('test');
        mock.addDefaultProfile('base');

        expect(mock.getProperty('value')).toBe(9);
        expect(mock.activeProfiles).toContain('test');
        expect(mock.defaultProfiles).toContain('base');
        expect(likeEnvironment(mock)).toBe(true);
    });
});
