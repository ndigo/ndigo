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
});
