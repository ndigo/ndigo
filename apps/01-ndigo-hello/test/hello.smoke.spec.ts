/**
 * Smoke test (APP-N10): the browser entry app boots through the real
 * `WebAutoConfiguration` path and dispatches the root route through the
 * framework pipeline (handler mapping → controller → WebComponentView),
 * driven by the shared `@ndigo/test` browser harness (`bootWebApp` +
 * `BrowserMockClient`; guide 36 §3).
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootWebApp, BrowserMockClient, installSynchronousAnimationFrames } from '@ndigo/test';
// Side effect: registers the `hello-app` custom element.
import '../src/hello-app-view';
import HelloController from '../src/hello-controller';

describe('ndigo-hello smoke', () => {
    let browser: BrowserMockClient;
    let close: () => void;

    beforeAll(async () => {
        // AbstractWebComponent renders via requestAnimationFrame, which never
        // fires in jsdom — fire it synchronously (same as the other app specs).
        installSynchronousAnimationFrames();
        const app = await bootWebApp([HelloController]);
        browser = new BrowserMockClient(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET / renders the hello view with the default message', async () => {
        const render = await browser.dispatch('/');

        expect(render.model).toEqual({ message: 'Hello, World!' });
        // The view engine's output is a DOM element (WebComponentView output);
        // narrow through the well-known DOM shape instead of a raw cast.
        const output = render.output;
        const tagName = output && typeof output === 'object' && 'tagName' in output ? String(output.tagName) : null;
        expect(tagName).toBe('HELLO-APP');
    });
});
