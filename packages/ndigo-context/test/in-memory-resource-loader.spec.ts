/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { InMemoryResourceLoader, UnresolvedResource } from '../src/resource';

describe('InMemoryResourceLoader', () => {
    it('returns the registered value with exists=true', async () => {
        const loader = new InMemoryResourceLoader().set('home.html', '<h1>hi</h1>');
        const resource = await loader.getResource('home.html');
        expect(resource.exists).toBe(true);
        expect(resource.value).toBe('<h1>hi</h1>');
    });

    it('returns an unresolved resource for an unregistered location', async () => {
        const loader = new InMemoryResourceLoader();
        const resource = await loader.getResource('missing.html');
        expect(resource).toBeInstanceOf(UnresolvedResource);
        expect(resource.exists).toBe(false);
    });

    it('set() returns this for chaining', () => {
        const loader = new InMemoryResourceLoader();
        expect(loader.set('a.html', '<a/>')).toBe(loader);
    });
});
