// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, expect, it, vi } from 'vitest';
import { bootBrowserApp, BrowserMockClient, installSynchronousAnimationFrames } from '@ndigo/test';
import type { ConfigurableApplicationContext } from '@ndigo/context';
import { StaticContentSource, StaticThemeResolver } from '@ndigo/content';
import { propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { ViewsAppConfiguration } from '../src/views-app-configuration';

// The view engine attaches rendered elements on a requestAnimationFrame tick,
// which never fires in jsdom — fire it synchronously so dispatches complete.
installSynchronousAnimationFrames();

/**
 * Three resolvers, three view locations, one composite chain (view
 * resolution strategy):
 *
 *  1. `/`        → 'shell'  → component module → WebComponentViewResolver
 *                              (eager registry + @TagMapping metadata + viewNames filter)
 *  2. `/widget`  → 'footer' → context entry     → NameViewResolver
 *  3. `/report`  → 'report' → module on disk   → ReportViewResolver (path import)
 *  4. `/nope`    → 'nope'   → no resolver      → chain fall-through → NoViewFound
 *
 * All controller returns are NAMES; no view is constructed in a controller.
 */

/** The rendered output as comparable text (element innerHTML/string). */
function renderText(output: unknown): string {
    if (typeof output === 'string') {
        return output;
    }
    return (output as HTMLElement).innerHTML ?? String(output);
}

describe('ndigo-views composite resolver demo', () => {
    it('resolves a component-module view by name', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/');
        const output = app.viewTarget.lastRender?.output;
        expect(output).toBeInstanceOf(HTMLElement);
        // jsdom upper-cases custom-element tag names.
        expect((output as HTMLElement).tagName.toLowerCase()).toBe('ndigo-views-shell');
        expect((output as HTMLElement).textContent).toContain('Ndigo Views');

        app.close();
    });

    it('resolves a context-entry view by name', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/widget');
        expect(renderText(app.viewTarget.lastRender?.output)).toContain('NameViewResolver');

        app.close();
    });

    it('resolves a module-on-disk view by name (lazy import)', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/report');
        expect(renderText(app.viewTarget.lastRender?.output)).toContain('Report');

        app.close();
    });

    it('falls through the chain and errors for an unsupported name', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await expect(mvc.dispatch('/nope')).rejects.toThrow();

        app.close();
    });

    it('localizes the context-entry view through the ContentSource', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/widget/de');
        expect(renderText(app.viewTarget.lastRender?.output)).toContain('Gebaut mit Ndigo');

        await mvc.dispatch('/widget/fr');
        expect(renderText(app.viewTarget.lastRender?.output)).toContain('Construit avec Ndigo');

        app.close();
    });

    it('resolves themes through the context theme machinery', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const themeContent = new StaticContentSource();
        const ctx = app.context as ConfigurableApplicationContext;
        ctx.setThemeName('night');
        ctx.setThemeResolver(new StaticThemeResolver([{ name: 'night', contentSource: themeContent }]));

        expect(app.context.getTheme('night').name).toBe('night');
        expect(app.context.getTheme('night').contentSource).toBe(themeContent);
        expect(app.context.getTheme().name).toBe('night');

        app.close();
    });

    it('fetches through the HTTP client with the interceptor chain applied', async () => {
        trace.setGlobalTracerProvider(new BasicTracerProvider());
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());
        const body = new Response(JSON.stringify({ items: ['alpha', 'beta'] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
        // The cache keys on response.url; native/mock Responses carry '' —
        // shadow a URL so the cache stores the entry (real fetch sets it).
        Object.defineProperty(body, 'url', { value: `${location.href}data.json`, configurable: true });
        const fetchMock = vi.fn().mockResolvedValue(body);
        vi.stubGlobal('fetch', fetchMock);

        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/client');
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        const output = app.viewTarget.lastRender?.output;
        const request = fetchMock.mock.calls[0]?.[0] as Request;
        expect(request.headers.get('X-Client')).toBe('ndigo-views');
        expect(request.headers.get('Authorization')).toBe('Bearer demo');
        // Browser→server journey: the component span is carried to the
        // server as a W3C traceparent (server continuation is covered by
        // ndigo-telemetry-node's continuation spec).
        expect(request.headers.get('traceparent')).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
        await vi.waitFor(() => expect(renderText(app.viewTarget.lastRender?.output)).toContain('alpha, beta'));
        expect(renderText(output)).toContain('online');

        // Credentialed requests bypass the HTTP cache by design (SEC-8:
        // cross-user cache hits) — the refresh re-fetches rather than
        // replaying the stored entry for a Bearer-token request.
        const refresh = output instanceof HTMLElement ? (output.querySelector('button') as HTMLButtonElement) : null;
        expect(refresh).not.toBeNull();
        refresh?.click();
        await vi.waitFor(() => expect(renderText(app.viewTarget.lastRender?.output)).toContain('requests: 2'));
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(renderText(app.viewTarget.lastRender?.output)).toContain('alpha, beta');

        vi.unstubAllGlobals();
        app.close();
    });

    it('queues the request while offline and replays it when online', async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ items: ['alpha'] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/client');
        expect(fetchMock).not.toHaveBeenCalled();

        // Back online: the retry timer replays the queued request.
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
        vi.advanceTimersByTime(3100);
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        await vi.waitFor(() => expect(renderText(app.viewTarget.lastRender?.output)).toContain('online'));

        vi.unstubAllGlobals();
        vi.useRealTimers();
        app.close();
    });
});
