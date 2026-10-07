/**
 * @module blue-hello
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { HANDLER_MAPPING } from '@blue/dispatcher';
import { WebAutoConfiguration, BrowserDispatcher } from '@blue/platform-web';
import { PathRoute } from '@blue/router';
// Side effect: registers the `hello-app` custom element.
import '../src/hello-app-view';
import HelloController from '../src/hello-controller';

interface CapturedRender {
    output: unknown;
    model: unknown;
}

/**
 * Minimal in-process view target (mirrors @blue/test's MemoryViewTarget) so
 * this app's smoke test does not depend on linking the test harness package.
 */
class CaptureTarget {
    #lastRender: CapturedRender | null = null;

    get lastRender(): CapturedRender | null {
        return this.#lastRender;
    }

    async prepare(): Promise<void> {
        // no-op
    }

    async commit(output: unknown, model: unknown): Promise<void> {
        this.#lastRender = { output, model };
    }

    async clear(): Promise<void> {
        this.#lastRender = null;
    }
}

/**
 * Smoke test (APP-N10): the browser entry app boots through the real
 * `WebAutoConfiguration` path and dispatches the root route through the
 * framework pipeline (handler mapping → controller → WebComponentView).
 *
 * Booted manually (not via `@blue/test`) because blue-hello loads its own
 * `vite.config.ts`, so the workspace alias table from the root vitest config
 * does not apply to this suite.
 */
describe('blue-hello smoke', () => {
    let context: MetadataConfigApplicationContext;
    let target: CaptureTarget;
    let dispatcher: BrowserDispatcher;

    beforeAll(async () => {
        target = new CaptureTarget();
        context = new MetadataConfigApplicationContext('hello');
        context.setValue('viewTarget', target);
        context.register(WebAutoConfiguration);
        context.setValue(HelloController.name, new HelloController());
        context.refresh();

        // Same post-refresh wiring the app entry performs (index.ts).
        const handlerMapping = context.getValue(HANDLER_MAPPING);
        handlerMapping.setApplicationContext(context);
        handlerMapping.init();

        dispatcher = new BrowserDispatcher();
        dispatcher.initStrategies(context);
        dispatcher.applicationContext = context;

        // AbstractWebComponent renders via requestAnimationFrame, which never
        // fires in jsdom — fire it synchronously (same as other app specs).
        vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        });
    });

    afterAll(() => {
        context.close();
    });

    test('GET / renders the hello view with the default message', async () => {
        await dispatcher.dispatch(new PathRoute('/'));

        const render = target.lastRender;
        expect(render).not.toBeNull();
        expect(render?.model).toEqual({ message: 'Hello, World!' });
        // The view engine's output is a DOM element (WebComponentView output);
        // narrow through the well-known DOM shape instead of a raw cast.
        const output = render?.output;
        const tagName = output && typeof output === 'object' && 'tagName' in output ? String(output.tagName) : null;
        expect(tagName).toBe('HELLO-APP');
    });
});
