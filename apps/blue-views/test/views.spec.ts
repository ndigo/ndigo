// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { describe, expect, it } from 'vitest';
import { bootBrowserApp, BrowserMockClient } from '@blue/test';
import { ViewsAppConfiguration } from '../src/views-app-configuration';

/**
 * Three resolvers, three view locations, one composite chain (view
 * resolution strategy):
 *
 *  1. `/`        → 'shell'  → component module → WebComponentViewResolver
 *                              (eager registry + @TagMapping metadata + viewNames filter)
 *  2. `/widget`  → 'footer' → context bean     → NameViewResolver
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

describe('blue-views composite resolver demo', () => {
    it('resolves a component-module view by name', async () => {
        const app = await bootBrowserApp([ViewsAppConfiguration]);
        const mvc = new BrowserMockClient(app);

        await mvc.dispatch('/');
        const output = app.viewTarget.lastRender?.output;
        expect(output).toBeInstanceOf(HTMLElement);
        // jsdom upper-cases custom-element tag names.
        expect((output as HTMLElement).tagName.toLowerCase()).toBe('blue-views-shell');
        expect((output as HTMLElement).textContent).toContain('Blue Views');

        app.close();
    });

    it('resolves a context-bean view by name', async () => {
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
});
