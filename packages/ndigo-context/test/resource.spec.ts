/**
 */
import { describe, test, expect } from 'vitest';
import { Null } from '@ndigo/core';
import {
    URLResource,
    UnresolvedResource,
    DefaultResourceLoader,
    AsResourceLoaderAware,
    likeResource,
    likeResourceLoader,
    likeResourceLoaderAware,
    type ResourceLoader,
} from '../src/resource';

describe('URLResource', () => {
    test('it should construct from an absolute URL', () => {
        const resource = new URLResource('https://example.com/module.mjs', { default: 123 });

        expect(resource.exists).toBe(true);
        expect(resource.url.href).toBe('https://example.com/module.mjs');
        expect(resource.value).toEqual({ default: 123 });
    });

    test('it should append .js when no extension is present', () => {
        const resource = new URLResource('https://example.com/feature/module', 'value');

        expect(resource.url.href).toBe('https://example.com/feature/module.js');
    });

    test('it should resolve relative URLs against location', () => {
        const globalLocation = globalThis as { location?: Location };
        const previous = globalLocation.location;

        if (!previous) {
            Reflect.defineProperty(globalThis, 'location', {
                value: new URL('https://example.test/app/'),
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }

        const resource = new URLResource('./mod/sample', 1);
        const location = globalLocation.location ?? new URL('https://example.test/app/');
        const expected = new URL('./mod/sample.js', location.href);

        expect(resource.url.href).toBe(expected.href);

        if (!previous) {
            Reflect.deleteProperty(globalThis, 'location');
        }
    });
});

describe('UnresolvedResource', () => {
    test('it should represent a failed resource resolution', () => {
        const error = new Error('missing resource');
        const resource = new UnresolvedResource('/missing', error);

        expect(resource.exists).toBe(false);
        expect(resource.value).toBe(error);
    });
});

describe('DefaultResourceLoader', () => {
    test('it should implement getResource', () => {
        const loader = new DefaultResourceLoader();

        expect(typeof loader.getResource).toBe('function');
        expect(likeResourceLoader(loader)).toBe(true);
    });

    test('it should throw unresolved resource for missing modules', async () => {
        const loader = new DefaultResourceLoader();

        await expect(loader.getResource('__definitely_missing_ndigo_module__')).rejects.toBeInstanceOf(
            UnresolvedResource
        );
    });
});

describe('AsResourceLoaderAware', () => {
    test('it should provide setResourceLoader and set a non-enumerable loader', () => {
        class TestAware extends AsResourceLoaderAware(Null) {}

        const instance = new TestAware();
        const loader = new DefaultResourceLoader();

        instance.setResourceLoader(loader);

        expect((instance as unknown as { loader: ResourceLoader }).loader).toBe(loader);
        expect(Object.keys(instance)).not.toContain('loader');
        expect(likeResourceLoaderAware(instance)).toBe(true);
    });
});

describe('resource predicates', () => {
    test('it should identify resource-like values', () => {
        expect(likeResource(new URLResource('https://example.com/a.js', 1))).toBe(true);
        expect(likeResource({ exists: true })).toBe(true);
        expect(likeResource({})).toBe(false);
    });

    test('it should identify resource loader-like values', () => {
        expect(likeResourceLoader(new DefaultResourceLoader())).toBe(true);
        expect(likeResourceLoader({ getResource: () => Promise.resolve(null) })).toBe(true);
        expect(likeResourceLoader({})).toBe(false);
    });

    test('it should identify resource loader aware-like values', () => {
        expect(likeResourceLoaderAware({ setResourceLoader: () => null })).toBe(true);
        expect(likeResourceLoaderAware({ setResourceLoader: true })).toBe(false);
        expect(likeResourceLoaderAware(null)).toBe(false);
    });
});
