// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { bootWebApp, installSynchronousAnimationFrames } from '@ndigo/test';
import type { BrowserTestApp } from '@ndigo/test';
import type { Route } from '@ndigo/router';
import { ViewsAppConfiguration } from '../src/views-app-configuration';
import { ViewsTargetingConfiguration } from '../src/views-targeting-configuration';

// The view engine attaches rendered elements on a requestAnimationFrame tick,
// which never fires in jsdom — fire it synchronously so dispatches complete.
installSynchronousAnimationFrames();

const region = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

/**
 * The centralized half of the demo: controllers return names, and
 * `ViewsTargetingConfiguration` decides which region each name lands in.
 *
 * `bootWebApp` registers a `MemoryViewTarget` as the fallback, so a route that
 * matches no targeter renders into memory — exactly the dispatcher's
 * fallback order. These tests assert the regions instead, proving the chain
 * took precedence.
 */
describe('ndigo-views centralized targeting demo', () => {
    let app: BrowserTestApp;

    /**
     * Dispatches like `MockWebClient` does, without its memory-target
     * assertion: here the chain is expected to place output in the DOM, so the
     * fallback target legitimately stays empty.
     */
    const dispatch = (path: string): Promise<void> =>
        app.dispatcher.dispatch({
            length: 0,
            id: crypto.randomUUID(),
            path,
            raw: path,
            data: {},
            params: null,
            attributes: {},
        } as unknown as Route);

    beforeEach(async () => {
        document.body.innerHTML = '<div id="app"></div><aside id="sidebar"></aside><footer id="site-footer"></footer>';
        app = await bootWebApp([ViewsAppConfiguration, ViewsTargetingConfiguration]);
    });

    afterEach(() => {
        app.close();
    });

    it('renders the shell into the app region', async () => {
        await dispatch('/');

        const output = region('app').querySelector('ndigo-views-shell');
        expect(output).not.toBeNull();
        expect(region('app').textContent).toContain('Ndigo Views');
    });

    it('renders the footer into the named footer region', async () => {
        await dispatch('/widget');

        expect(region('site-footer').textContent).toContain('NameViewResolver');
        // The controller did not change: it returns the name `footer`.
        expect(app.viewTarget.lastRender).toBeNull();
    });

    it('renders the report into the route-selected sidebar', async () => {
        await dispatch('/report');

        expect(region('sidebar').textContent).toContain('Report');
        expect(region('app').textContent).not.toContain('Report');
    });

    it('leaves previously rendered regions in place across dispatches', async () => {
        await dispatch('/');
        await dispatch('/widget');

        // Two independent regions, two dispatches: the shell persists while
        // the footer fills its own region.
        expect(region('app').textContent).toContain('Ndigo Views');
        expect(region('site-footer').textContent).toContain('Built with Ndigo');
    });

    it('falls back to the registered target when no targeter matches', async () => {
        await dispatch('/client');

        // `clientDemo` has no targeter, so it renders into the fallback
        // `MemoryViewTarget` — the same order an unconfigured app uses.
        expect(app.viewTarget.lastRender?.output).toBeInstanceOf(HTMLElement);
        expect(region('site-footer').textContent).toBe('');
    });
});
