/**
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Route } from '@ndigo/router';
import { LANGUAGE_ATTRIBUTE } from '@ndigo/router';
import type { ViewTarget } from '@ndigo/view';
import { GenericApplicationContext, InMemoryResourceLoader } from '@ndigo/context';

import { EJSView } from '../src/ejs-view';
import { EJSIncludeCycleError, EJSTemplateEngine } from '../src/ejs-template-engine';
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

describe('EJSTemplateEngine includes (DSV-EJS-1)', () => {
    let dir: string;

    beforeEach(() => {
        dir = mkdtempSync(join(tmpdir(), 'ndigo-ejs-'));
    });

    afterEach(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it('resolves a relative include next to the template when a filename is supplied', async () => {
        writeFileSync(join(dir, 'partial.ejs'), '<span><%= name %></span>');
        const engine = new EJSTemplateEngine();

        // Pre-fix the engine never received a filename, so ejs could not
        // resolve the relative path and threw "Could not find the include file".
        const html = await engine.render(
            '<div><%- await include("partial.ejs") %></div>',
            { name: 'Ada' },
            join(dir, 'page.ejs')
        );

        expect(html).toBe('<div><span>Ada</span></div>');
    });

    it('resolves an absolute include', async () => {
        const absolute = join(dir, 'absolute.ejs');
        writeFileSync(absolute, 'ABS:<%= value %>');
        const engine = new EJSTemplateEngine();

        const html = await engine.render('<%- await include(absolutePath) %>', { value: 7, absolutePath: absolute });

        expect(html).toBe('ABS:7');
    });

    // No test pins an un-awaited include. The engine compiles templates in
    // async mode (AD-39 D-4) and its `render` TSDoc documents the contract:
    // templates MUST write `<%- await include(...) %>`, because an un-awaited
    // include interpolates the pending Promise as `[object Promise]`. That is
    // a template-author error, not supported behaviour — asserting the garbage
    // string would pin a defect. The supported awaited path is covered by the
    // relative/absolute include cases above.

    it('fails with a bounded, named error on an include cycle (a↔b) (VIEW-4)', async () => {
        writeFileSync(join(dir, 'a.ejs'), 'A<%- await include("b.ejs") %>');
        writeFileSync(join(dir, 'b.ejs'), 'B<%- await include("a.ejs") %>');
        const engine = new EJSTemplateEngine();

        // Pre-fix this recursed until `RangeError: Maximum call stack size
        // exceeded` (and leaked stray rejections); the guard fails fast with a
        // named, bounded error instead.
        await expect(engine.render('<%- await include("a.ejs") %>', {}, join(dir, 'page.ejs'))).rejects.toBeInstanceOf(
            EJSIncludeCycleError
        );
    });

    it('resolves a non-cyclic nested include chain to completion (VIEW-4)', async () => {
        writeFileSync(join(dir, 'leaf.ejs'), 'LEAF');
        writeFileSync(join(dir, 'mid.ejs'), 'MID<%- await include("leaf.ejs") %>');
        const engine = new EJSTemplateEngine();

        expect(await engine.render('ROOT<%- await include("mid.ejs") %>', {}, join(dir, 'top.ejs'))).toBe(
            'ROOTMIDLEAF'
        );
    });
});

describe('EJSView', () => {
    it('renders an inline template into the target', async () => {
        const view = new EJSView('home', { template: '<p><%= name %></p>' });
        const target = new CaptureViewTarget();

        await view.render({ name: 'Ada' }, {} as Route, target);

        expect(target.last?.output).toBe('<p>Ada</p>');
    });

    it('keeps an array model accessible through the locals', async () => {
        const view = new EJSView('home', { template: '<%= locals[0] %>-<%= locals[1] %>' });
        const target = new CaptureViewTarget();

        await view.render(['Ada', 'Grace'] as unknown as Record<string, unknown>, {} as Route, target);

        expect(target.last?.output).toBe('Ada-Grace');
    });

    it('keeps a scalar model accessible through the locals', async () => {
        const view = new EJSView('home', {
            template: '<%= locals[0] %><%= locals[1] %><%= locals[2] %><%= locals[3] %><%= locals[4] %>',
        });
        const target = new CaptureViewTarget();

        await view.render('world' as unknown as Record<string, unknown>, {} as Route, target);

        expect(target.last?.output).toBe('world');
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

    it('passes its path as filename so relative includes resolve (DSV-EJS-1)', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'ndigo-ejs-view-'));
        const pagePath = join(dir, 'page.ejs');
        try {
            writeFileSync(join(dir, 'partial.ejs'), '<em><%= name %></em>');
            const loader = new InMemoryResourceLoader().set(pagePath, '<p><%- await include("partial.ejs") %></p>');
            const view = new EJSView(pagePath, { loader });
            const target = new CaptureViewTarget();

            await view.render({ name: 'Ada' }, {} as Route, target);

            expect(target.last?.output).toBe('<p><em>Ada</em></p>');
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
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

    it('resolves traversal/absolute/NUL names to not-found without reading a template', async () => {
        const loader = new InMemoryResourceLoader().set('views/home.html', '<h1>secret</h1>');
        const resolver = new EJSViewResolver({ loader, prefix: 'views/', suffix: '.html' });
        const spy = vi.spyOn(loader, 'getResource');

        for (const name of ['/../../etc/passwd', '../home', '..;x=1/..;x=1/tmp/traversed', 'nul\u0000name']) {
            // eslint-disable-next-line no-await-in-loop -- each name must resolve before the next is attempted
            expect(await resolver.resolveViewName(name, '')).toBeNull();
        }
        expect(spy).not.toHaveBeenCalled();
    });

    it('still resolves legitimate nested names', async () => {
        const loader = new InMemoryResourceLoader().set('views/admin/users.html', '<h1><%= title %></h1>');
        const resolver = new EJSViewResolver({ loader, prefix: 'views/', suffix: '.html' });
        const view = await resolver.resolveViewName('admin/users', '');
        const target = new CaptureViewTarget();

        expect(view).not.toBeNull();
        await view?.render({ title: 'Users' }, {} as Route, target);
        expect(target.last?.output).toBe('<h1>Users</h1>');
    });
});

describe('EJSView locale helpers', () => {
    const messages = {
        greeting: { en: 'Hello {name}!', fr: 'Bonjour {name} !' },
    };
    const fakeMessageSource = {
        async getMessage(key: string, params?: { values?: Record<string, unknown> }, language?: string) {
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
                "<h1><%= await t('greeting', { values: { name: 'Ada' } }) %></h1>" +
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
            template: "<p><%= await t('missing.key') %>|<%= locale %></p>",
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
