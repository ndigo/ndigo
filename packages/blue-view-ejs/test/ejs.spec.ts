/**
 * @module blue-view-ejs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it, vi } from 'vitest';
import type { Route } from '@blue/router';
import { LANGUAGE_ATTRIBUTE } from '@blue/router';
import type { ViewTarget } from '@blue/view';
import { GenericApplicationContext, InMemoryResourceLoader } from '@blue/context';

import { EJSView } from '../src/ejs-view';
import { EJSTemplateEngine } from '../src/ejs-template-engine';
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

describe('EJSTemplateEngine', () => {
    it('renders escaped interpolation with <%= %>', async () => {
        const engine = new EJSTemplateEngine();
        expect(await engine.render('<p><%= value %></p>', { value: '<b>&x</b>' })).toBe(
            '<p>&lt;b&gt;&amp;x&lt;/b&gt;</p>'
        );
    });

    it('renders unescaped interpolation with <%- %>', async () => {
        const engine = new EJSTemplateEngine();
        expect(await engine.render('<p><%- value %></p>', { value: '<b>raw</b>' })).toBe('<p><b>raw</b></p>');
    });

    it('supports loops and conditionals', async () => {
        const engine = new EJSTemplateEngine();
        const html = await engine.render(
            '<ul><% items.forEach(function (item) { %><li><%= item %></li><% }); %></ul>',
            { items: ['a', 'b'] }
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

    it('loads the template source from a resource loader by path', async () => {
        const loader = new InMemoryResourceLoader().set('pages/home.html', '<h1><%= title %></h1>');
        const view = new EJSView('pages/home.html', { loader });
        const target = new CaptureViewTarget();

        await view.render({ title: 'Welcome' }, {} as Route, target);

        expect(target.last?.output).toBe('<h1>Welcome</h1>');
    });

    it('loads the template source once and reuses it across renders', async () => {
        const loader = new InMemoryResourceLoader().set('pages/home.html', '<h1><%= title %></h1>');
        const view = new EJSView('pages/home.html', { loader });
        const target = new CaptureViewTarget();
        const spy = vi.spyOn(loader, 'getResource');

        await view.render({ title: 'A' }, {} as Route, target);
        await view.render({ title: 'B' }, {} as Route, target);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(target.last?.output).toBe('<h1>B</h1>');
    });

    it('keeps rendering the initially loaded source for the view lifetime', async () => {
        const loader = new InMemoryResourceLoader().set('pages/home.html', '<h1><%= title %></h1>');
        const view = new EJSView('pages/home.html', { loader });
        const target = new CaptureViewTarget();

        await view.render({ title: 'A' }, {} as Route, target);
        loader.set('pages/home.html', '<h2>changed</h2>');
        await view.render({ title: 'B' }, {} as Route, target);

        expect(target.last?.output).toBe('<h1>B</h1>');
    });

    it('throws when neither a template nor a path+loader is available', async () => {
        const view = new EJSView('orphan');
        await expect(view.render({ name: 'x' }, {} as Route, new CaptureViewTarget())).rejects.toThrow(/template/i);
    });

    it('throws when no ViewTarget is supplied', async () => {
        const view = new EJSView('home', { template: '<p>hi</p>' });
        await expect(view.render({}, {} as Route, undefined)).rejects.toThrow(/ViewTarget/);
    });

    it('produces a whole-page HTML document in document mode', async () => {
        const loader = new InMemoryResourceLoader().set('pages/home.html', '<h1><%= title %></h1>');
        const view = new EJSView('pages/home.html', { loader });

        const result = await view.renderTo({ title: 'Page' }, {} as Route);

        expect(result.body).toBe('<h1>Page</h1>');
        expect(String(result.mediaType)).toMatch(/^text\/html/);
    });
});

describe('EJSViewResolver', () => {
    it('maps a logical name through prefix/suffix and renders HTML', async () => {
        const loader = new InMemoryResourceLoader().set('views/home.html', '<h1><%= title %></h1>');
        const resolver = new EJSViewResolver({ loader, prefix: 'views/', suffix: '.html' });

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

describe('EJSView locale helpers', () => {
    const messages = {
        greeting: { en: 'Hello {name}!', fr: 'Bonjour {name} !' },
    };
    const fakeMessageSource = {
        getMessage(key: string, params?: { values?: Record<string, unknown> }, language?: string) {
            const template = messages[key as keyof typeof messages]?.[(language ?? 'en') as 'en' | 'fr'];
            if (!template) return key;
            const value = params?.values?.name ?? '';
            return template.replace('{name}', String(value));
        },
    };

    it('injects t, formatDate, and locale helpers into the template locals', async () => {
        const context = new GenericApplicationContext('test');
        context.setMessageSource(fakeMessageSource);

        const view = new EJSView('home', {
            template:
                "<h1><%= t('greeting', { values: { name: 'Ada' } }) %></h1>" +
                "<time><%= formatDate(when, { timeZone: 'UTC', dateStyle: 'medium' }) %></time>" +
                '<span><%= locale %></span>',
        });
        view.setApplicationContext(context);
        const target = new CaptureViewTarget();

        await view.render(
            { when: new Date('2026-09-13T12:00:00Z') },
            { attributes: { [LANGUAGE_ATTRIBUTE]: 'fr' } } as unknown as Route,
            target
        );

        const output = target.last?.output as string;
        expect(output).toContain('<h1>Bonjour Ada !</h1>');
        expect(output).toContain('<time>13 sept. 2026</time>');
        expect(output).toContain('<span>fr</span>');
    });

test('falls back to the key and en-US without a negotiated language', async () => {
        const context = new GenericApplicationContext('test');
        context.setMessageSource(fakeMessageSource);

        const view = new EJSView('home', {
            template: "<p><%= t('missing.key') %>|<%= locale %></p>",
        });
        view.setApplicationContext(context);
        const target = new CaptureViewTarget();

        await view.render({}, {} as Route, target);

        expect(target.last?.output).toBe('<p>missing.key|en-US</p>');
    });

    it('falls back to en-US for hostile locale attributes instead of throwing in Intl', async () => {
        const context = new GenericApplicationContext('test');
        context.setMessageSource(fakeMessageSource);

        const view = new EJSView('home', {
            template: "<p><%= locale %>|<%= formatDate(when, { timeZone: 'UTC', dateStyle: 'medium' }) %></p>",
        });
        view.setApplicationContext(context);
        const target = new CaptureViewTarget();

        await view.render(
            { when: new Date('2026-09-13T12:00:00Z') },
            { attributes: { [LANGUAGE_ATTRIBUTE]: '" autofocus onfocus="alert(1)' } } as unknown as Route,
            target
        );

        expect(target.last?.output).toBe('<p>en-US|Sep 13, 2026</p>');
    });

    it('formats numbers and lists in the request locale', async () => {
        const context = new GenericApplicationContext('test');
        context.setMessageSource(fakeMessageSource);

        const view = new EJSView('home', {
            template: "<%= formatNumber(1234.5) %>|<%= formatRelativeTime(-2, 'day') %>|<%= formatList(['a', 'b']) %>",
        });
        view.setApplicationContext(context);
        const target = new CaptureViewTarget();

        await view.render({}, { attributes: { [LANGUAGE_ATTRIBUTE]: 'de' } } as unknown as Route, target);

        const output = target.last?.output as string;
        expect(output).toContain('1.234,5');
        expect(output).toContain('Tagen');
        expect(output).toContain('und');
    });
});
