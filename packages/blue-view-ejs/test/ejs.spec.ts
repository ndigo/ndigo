import { describe, expect, it } from 'vitest';
import type { Route } from '@blue/router';
import type { ViewTarget } from '@blue/view';

import { EJSView } from '../src/ejs-view';
import { EjsTemplateEngine } from '../src/ejs-template-engine';
import { InMemoryTemplateSourceProvider } from '../src/template-source-provider';
import { EJSViewResolver } from '../src/ejs-view-resolver';

interface CapturedRender {
    output: unknown;
    model: unknown;
    route: Route;
}

/**
 * A DOM-free {@link ViewTarget} that captures committed output, proving the
 * package renders to an arbitrary target without a platform (isomorphism).
 */
class CaptureViewTarget implements ViewTarget {
    last: CapturedRender | null = null;

    async prepare(_route: Route): Promise<void> {
        void _route;
    }

    async commit(output: unknown, model: unknown, route: Route): Promise<void> {
        this.last = { output, model, route };
    }

    async clear(): Promise<void> {
        this.last = null;
    }
}

describe('EjsTemplateEngine', () => {
    it('renders escaped interpolation with <%= %>', async () => {
        const engine = new EjsTemplateEngine();
        expect(await engine.render('<p><%= value %></p>', { value: '<b>&x</b>' })).toBe(
            '<p>&lt;b&gt;&amp;x&lt;/b&gt;</p>',
        );
    });

    it('renders unescaped interpolation with <%- %>', async () => {
        const engine = new EjsTemplateEngine();
        expect(await engine.render('<p><%- value %></p>', { value: '<b>raw</b>' })).toBe('<p><b>raw</b></p>');
    });

    it('supports loops and conditionals', async () => {
        const engine = new EjsTemplateEngine();
        const html = await engine.render(
            '<ul><% items.forEach(function (item) { %><li><%= item %></li><% }); %></ul>',
            { items: ['a', 'b'] },
        );
        expect(html).toBe('<ul><li>a</li><li>b</li></ul>');
    });
});

describe('EJSView', () => {
    it('renders an inline template into the target', async () => {
        const view = new EJSView('home', { template: '<p><%= name %></p>' });
        const target = new CaptureViewTarget();

        await view.render({ name: 'Ada' }, {} as Route, target);

        expect(target.last?.output).toBe('<p>Ada</p>');
    });

    it('forwards the projected model to the target commit', async () => {
        const view = new EJSView('home', { template: '<p><%= name %></p>' });
        const target = new CaptureViewTarget();

        await view.render({ name: 'Grace' }, {} as Route, target);

        expect(target.last?.model).toEqual({ name: 'Grace' });
    });

    it('loads the template source from a provider by path', async () => {
        const provider = new InMemoryTemplateSourceProvider().set('pages/home.html', '<h1><%= title %></h1>');
        const view = new EJSView('pages/home.html', { provider });
        const target = new CaptureViewTarget();

        await view.render({ title: 'Welcome' }, {} as Route, target);

        expect(target.last?.output).toBe('<h1>Welcome</h1>');
    });

    it('throws when neither a template nor a path+provider is available', async () => {
        const view = new EJSView('orphan');
        await expect(view.render({ name: 'x' }, {} as Route, new CaptureViewTarget())).rejects.toThrow(/template/i);
    });

    it('throws when no ViewTarget is supplied', async () => {
        const view = new EJSView('home', { template: '<p>hi</p>' });
        await expect(view.render({}, {} as Route, undefined)).rejects.toThrow(/ViewTarget/);
    });
});

describe('EJSViewResolver', () => {
    it('maps a logical name through prefix/suffix and renders HTML', async () => {
        const provider = new InMemoryTemplateSourceProvider().set('views/home.html', '<h1><%= title %></h1>');
        const resolver = new EJSViewResolver({ provider, prefix: 'views/', suffix: '.html' });

        const view = await resolver.resolveViewName('home', '');
        const target = new CaptureViewTarget();

        expect(view).not.toBeNull();
        if (view) {
            await view.render({ title: 'Home' }, {} as Route, target);
        }
        expect(target.last?.output).toBe('<h1>Home</h1>');
    });

    it('declares an HTML media type on resolved views', async () => {
        const resolver = new EJSViewResolver({ template: '<p></p>' });
        const view = await resolver.resolveViewName('home', '');
        expect(view?.mediaType).not.toBeNull();
    });

    it('resolves only names in an explicit allow-list', async () => {
        const resolver = new EJSViewResolver({ template: '<p></p>' });
        resolver.viewNames = ['allowed'];

        expect(await resolver.resolveViewName('denied', '')).toBeNull();

        const view = await resolver.resolveViewName('allowed', '');
        expect(view).not.toBeNull();
    });
});
