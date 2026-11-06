/**
 */
import { describe, expect, it } from 'vitest';
import { IslandView, IslandViewResolver } from '../src/index';

describe('IslandViewResolver', () => {
    it('resolves a name to an IslandView with the name as tag', async () => {
        const resolver = new IslandViewResolver();

        const view = await resolver.resolveViewName('todo-app');

        expect(view).toBeInstanceOf(IslandView);
        expect((view as IslandView).tagName).toBe('todo-app');
    });

    it('caches resolved views (same instance on repeat resolution)', async () => {
        const resolver = new IslandViewResolver();

        const first = await resolver.resolveViewName('todo-app');
        const second = await resolver.resolveViewName('todo-app');

        expect(first).toBe(second);
    });

    it('filters names and returns null for unsupported ones (chain fall-through)', async () => {
        const resolver = new IslandViewResolver({ viewNames: [/^todo/] });

        expect(await resolver.resolveViewName('todo-app')).toBeInstanceOf(IslandView);
        expect(await resolver.resolveViewName('report')).toBeNull();
    });

    it('default resolver claims only valid custom-element names (DSV-WEBCOMP-2)', async () => {
        const resolver = new IslandViewResolver();

        expect(await resolver.resolveViewName('todo-app')).toBeInstanceOf(IslandView);
        // Pre-fix the default had no filter and resolved every name — plain
        // views (and route-derived names) would have been claimed as islands.
        expect(await resolver.resolveViewName('user')).toBeNull();
        expect(await resolver.resolveViewName('error/framework')).toBeNull();
        expect(await resolver.resolveViewName('Todo-App')).toBeNull();
    });

    it('falls through for reserved custom-element names instead of throwing (VIEW-1)', async () => {
        const resolver = new IslandViewResolver();

        // Pre-fix the raw `customElementNamePattern` admitted these, so
        // `_loadView` called `new IslandView(name)` and threw a FrameworkError
        // instead of the resolver chain falling through.
        for (const name of ['font-face', 'annotation-xml', 'missing-glyph', 'color-profile']) {
            // eslint-disable-next-line no-await-in-loop -- sequential fall-through assertion per name
            await expect(resolver.resolveViewName(name)).resolves.toBeNull();
        }
    });

    it('falls through for traversal names and still resolves valid tags (VIEW-1)', async () => {
        const resolver = new IslandViewResolver();

        // eslint-disable-next-line @ndigo/no-unsafe-view-name-literal -- traversal probe must reach the resolver
        expect(await resolver.resolveViewName('../x')).toBeNull();
        expect(await resolver.resolveViewName('todo-app')).toBeInstanceOf(IslandView);
    });
});
