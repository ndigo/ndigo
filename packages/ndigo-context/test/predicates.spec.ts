/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    GenericApplicationContext,
    AsApplicationContextAware,
    likeApplicationContext,
    likeApplicationContextAware,
} from '../src/context';
import { Emitter, likeApplicationEventEmitterAware, likeEventEmitter, type EventEmitter } from '../src/event-emitter';
import {
    AsEnvironmentAware,
    StandardEnvironment,
    likeEnvironment,
    likeEnvironmentAware,
    likeEnvironmentSource,
} from '../src/environment';
import { PrototypalPropertyResolver, likePropertyResolver } from '../src/property-resolver';
import { MutablePropertySources } from '../src/property-sources';
import {
    DefaultResourceLoader,
    Resource,
    likeResource,
    likeResourceLoader,
    likeResourceLoaderAware,
} from '../src/resource';
import { Null } from '@ndigo/core';

const awareFlag = Symbol.for('@@aware');

describe('context predicates', () => {
    test('it should detect application context values', () => {
        const context = new GenericApplicationContext('predicates');

        expect(likeApplicationContext(context)).toBe(true);
        expect(likeApplicationContext({})).toBe(false);
        expect(likeApplicationContext(null)).toBe(false);

        context.destroy();
    });

    test('it should detect application context aware values', () => {
        class AwareContext extends AsApplicationContextAware(Null) {}

        expect(likeApplicationContextAware(new AwareContext())).toBe(true);
        expect(likeApplicationContextAware({ setApplicationContext: () => null, [awareFlag]: true })).toBe(true);
        expect(likeApplicationContextAware({ setApplicationContext: () => null })).toBe(true);
        expect(likeApplicationContextAware(null)).toBe(false);
    });
});

describe('event-emitter predicates', () => {
    test('it should detect event emitter values', () => {
        const emitter = new Emitter();

        expect(likeEventEmitter(emitter)).toBe(true);
        expect(likeEventEmitter({ emit: () => true })).toBe(false);

        emitter.destroy();
    });

    test('it should detect application event emitter aware values', () => {
        const aware = {
            isAware: true,
            [awareFlag]: true,
            setApplicationEventEmitter: (_eventEmitter: EventEmitter) => null,
        };

        expect(likeApplicationEventEmitterAware(aware)).toBe(true);
        expect(likeApplicationEventEmitterAware({ setApplicationEventEmitter: () => null, [awareFlag]: true })).toBe(
            true
        );
        expect(likeApplicationEventEmitterAware({ setApplicationEventEmitter: () => null })).toBe(true);
        expect(likeApplicationEventEmitterAware(null)).toBe(false);
    });
});

describe('environment predicates', () => {
    test('it should detect environment values', () => {
        const env = new StandardEnvironment();

        expect(likeEnvironment(env)).toBe(true);
        expect(likeEnvironment({ activeProfiles: [], defaultProfiles: [] })).toBe(false);
    });

    test('it should detect environment aware values', () => {
        class AwareEnvironment extends AsEnvironmentAware(Null) {}

        expect(likeEnvironmentAware(new AwareEnvironment())).toBe(true);
        expect(likeEnvironmentAware({ setEnvironment: () => null, [awareFlag]: true })).toBe(true);
        expect(likeEnvironmentAware({ isAware: true })).toBe(false);
    });

    test('it should detect environment source values', () => {
        expect(likeEnvironmentSource({ environment: new StandardEnvironment() })).toBe(true);
        expect(likeEnvironmentSource({ environment: {} })).toBe(false);
        expect(likeEnvironmentSource(undefined)).toBe(false);
    });
});

describe('property resolver predicate', () => {
    test('it should detect property resolvers', () => {
        const resolver = PrototypalPropertyResolver.create(new MutablePropertySources().addLast('test', {}));
        expect(likePropertyResolver(resolver)).toBe(true);
        expect(likePropertyResolver({ getProperty: () => null })).toBe(false);
    });
});

describe('resource predicates', () => {
    test('it should detect resource values', () => {
        const resource: Resource = {
            exists: true,
            value: 123,
        };

        expect(likeResource(resource)).toBe(true);
        expect(likeResource({ value: 1 })).toBe(false);
    });

    test('it should detect resource loaders', () => {
        expect(likeResourceLoader(new DefaultResourceLoader())).toBe(true);
        expect(likeResourceLoader({ getResource: true })).toBe(false);
    });

    test('it should detect resource loader aware values', () => {
        expect(likeResourceLoaderAware({ setResourceLoader: () => null })).toBe(true);
        expect(likeResourceLoaderAware({ setResourceLoader: 1 })).toBe(false);
    });
});
