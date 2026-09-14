/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { TagMapping } from '../src/tag-mapping';
import { WebComponentView } from '../src/view';
import { WebComponentViewResolver } from '../src/web-component-view-resolver';

@TagMapping('todo-app')
class TodoApp extends HTMLElement {}

class PlainElement extends HTMLElement {}

describe('WebComponentViewResolver', () => {
    it('resolves a name to a WebComponentView with the name as tag (zero-config)', async () => {
        const resolver = new WebComponentViewResolver();

        const view = await resolver.resolveViewName('todo-app');

        expect(view).toBeInstanceOf(WebComponentView);
        expect((view as WebComponentView).tagName).toBe('todo-app');
    });

    it('maps a logical name to the component tag via registry + TagMapping metadata', async () => {
        const resolver = new WebComponentViewResolver({ registry: { todo: TodoApp } });

        const view = await resolver.resolveViewName('todo');
        expect(view).toBeInstanceOf(WebComponentView);
        expect((view as WebComponentView).tagName).toBe('todo-app');
    });

    it('falls back to the view name when a registry class has no TagMapping', async () => {
        const resolver = new WebComponentViewResolver({ registry: { plain: PlainElement } });

        const view = await resolver.resolveViewName('plain');
        expect((view as WebComponentView).tagName).toBe('plain');
    });

    it('lazy-imports a module-path entry and derives the tag from metadata', async () => {
        // Resolved relative to the resolver module (src/) → the package test fixture.
        const resolver = new WebComponentViewResolver({ registry: { sample: '../test/fixtures/sample-component.ts' } });

        const view = await resolver.resolveViewName('sample');

        expect(view).toBeInstanceOf(WebComponentView);
        expect((view as WebComponentView).tagName).toBe('sample-tag');

        // The import side effect ran: the element is registered in the browser.
        expect(customElements.get('sample-tag')).not.toBeUndefined();
    });

    it('caches resolved views (same instance on repeat resolution)', async () => {
        const resolver = new WebComponentViewResolver({ registry: { todo: TodoApp } });

        const first = await resolver.resolveViewName('todo');
        const second = await resolver.resolveViewName('todo');

        expect(first).toBe(second);
    });

    it('filters names and returns null for unsupported ones (chain fall-through)', async () => {
        const resolver = new WebComponentViewResolver({ viewNames: [/^todo/] });

        expect(await resolver.resolveViewName('todo-app')).toBeInstanceOf(WebComponentView);
        expect(await resolver.resolveViewName('other-app')).toBeNull();
    });

    it('supports string viewNames exact matches', async () => {
        const resolver = new WebComponentViewResolver({ viewNames: ['todo-app'] });

        expect(await resolver.resolveViewName('todo-app')).toBeInstanceOf(WebComponentView);
        expect(await resolver.resolveViewName('account-app')).toBeNull();
    });
});
