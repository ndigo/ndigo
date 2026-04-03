import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { Page } from '../src/page';
import { WicketView } from '../src/wicket-view';
import { WicketViewResolver } from '../src/wicket-view-resolver';

class TestPage extends Page<string> {}

class AlternatePage extends Page<string> {}

describe('WicketViewResolver', () => {
    it('exposes Symbol.toStringTag', () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());

        expect(Object.prototype.toString.call(resolver)).toBe('[object WicketViewResolver]');
    });

    it('registers page constructors by name', () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());

        resolver.registerPage('home', TestPage);

        expect(resolver.hasPage('home')).toBe(true);
    });

    it('returns this for registerPage chaining', () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());

        const returned = resolver.registerPage('home', TestPage);

        expect(returned).toBe(resolver);
    });

    it('reports false for missing pages', () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());

        expect(resolver.hasPage('missing')).toBe(false);
    });

    it('resolves to a WicketView for registered pages', async () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());
        resolver.registerPage('home', TestPage);

        const view = await resolver.resolveViewName('home');

        expect(view).toBeInstanceOf(WicketView);
    });

    it('returns null for unregistered pages', async () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());

        expect(await resolver.resolveViewName('missing')).toBeNull();
    });

    it('caches resolved views when caching enabled', async () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());
        resolver.registerPage('home', TestPage);

        const first = await resolver.resolveViewName('home');
        const second = await resolver.resolveViewName('home');

        expect(first).toBe(second);
    });

    it('skips cache when caching is disabled', async () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());
        resolver.registerPage('home', TestPage);
        resolver.isCaching = false;

        const first = await resolver.resolveViewName('home');
        const second = await resolver.resolveViewName('home');

        expect(first).not.toBe(second);
        expect(first).toBeInstanceOf(WicketView);
        expect(second).toBeInstanceOf(WicketView);
    });

    it('supports resolving multiple registered pages', async () => {
        const resolver = new WicketViewResolver(new LinkedomDOMProvider());
        resolver.registerPage('home', TestPage).registerPage('about', AlternatePage);

        const homeView = await resolver.resolveViewName('home');
        const aboutView = await resolver.resolveViewName('about');

        expect(homeView).toBeInstanceOf(WicketView);
        expect(aboutView).toBeInstanceOf(WicketView);
        expect(homeView).not.toBe(aboutView);
    });
});
