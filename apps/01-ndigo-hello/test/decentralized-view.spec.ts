/**
 * Decentralized placement: the handler owns the view instance AND the
 * destination, so the dispatcher's resolver and targeter chains are pure
 * overhead it never has to pay.
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { configuration, entry } from '@ndigo/context';
import { bootWebApp, MockWebClient, installSynchronousAnimationFrames } from '@ndigo/test';
import type { BrowserTestApp } from '@ndigo/test';
import type { ViewResolver } from '@ndigo/view';
// Side effect: registers the `hello-app` custom element.
import '../src/hello-app-view';
import HelloController from '../src/hello-controller';

/**
 * A resolver that fails loudly. If anything tried to resolve a view name for
 * the root route, this would surface as a routing error instead of a silent
 * fallback — which is exactly the point of the assertion below.
 */
const resolveViewName = vi.fn<ViewResolver['resolveViewName']>(async () => {
    throw new Error('the resolver must not run for a realized view');
});

@configuration
class ResolverSpyConfiguration {
    @entry()
    viewResolver(): ViewResolver {
        return { resolveViewName };
    }
}

describe('ndigo-hello decentralized placement', () => {
    let app: BrowserTestApp;
    let browser: MockWebClient;

    beforeAll(async () => {
        installSynchronousAnimationFrames();
        app = await bootWebApp([HelloController, ResolverSpyConfiguration]);
        browser = new MockWebClient(app);
    });

    afterAll(() => {
        app.close();
    });

    test('the installed resolver is the spy, so the assertion below is not vacuous', () => {
        expect(app.context.getValue('viewResolver')).toEqual({ resolveViewName });
    });

    test('a handler-built view renders without consulting the resolver chain', async () => {
        resolveViewName.mockClear();

        const render = await browser.dispatch('/');

        expect(resolveViewName).not.toHaveBeenCalled();
        expect(render.model).toEqual({ message: 'Hello, World!' });
    });
});
