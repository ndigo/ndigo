// @vitest-environment jsdom
import { resolve, sep } from 'node:path';
import { describe, test, expect } from 'vitest';
import { LANGUAGE_ATTRIBUTE, type Route } from '@ndigo/router';
import { EJSViewResolver } from '@ndigo/view-ejs';
import { FileSystemResourceLoader } from '@ndigo/platform-node';
import { hydrateIslands } from '@ndigo/view-webcomponent';
import type { ProducerView } from '@ndigo/view';
import { IslandController } from '../src/island-controller';
import { TodoModelStore } from '../src/todo-model-store';
import { installFormAssociatedShims } from './jsdom-form-associated-shim';
// Side-effect import: registers the demo's `todo-app` custom element
// (`@TagMapping`) and runs the demo's own `hydrateIslands()` bootstrap.
import '../client/main';

// jsdom lacks the form-participation half of `ElementInternals` (AD-71's
// adopted controls construct against it); install the no-op shim before the
// island renders.
installFormAssociatedShims();

const viewsDir = resolve('views');

/**
 * SSR → hydration contract end-to-end (DSV-WEBCOMP-1): the server-rendered
 * `data-ndigo-model` attribute MUST hydrate through the framework parser into
 * the demo island. When the server URI-encoded the model while hydration
 * parsed plain JSON, the model came back `null`, the island's `.model` setter
 * assigned `null`, and `render()` threw — the island never hydrated.
 */

describe('ndigo-island SSR → hydration', () => {
    test('the server-rendered todo island hydrates with its model (no throw)', async () => {
        // Drive the real server pipeline (controller → EJS shell → resolver →
        // root-confined loader) rather than a hand-built fixture.
        const store = new TodoModelStore({
            items: [
                { text: 'Server-rendered island', done: true },
                { text: 'Hydrated on the client', done: false },
            ],
            filter: 'all',
        });
        const route = { attributes: { [LANGUAGE_ATTRIBUTE]: 'en-US' } } as unknown as Route;
        const modelAndView = new IslandController(store).index(route);
        const resolver = new EJSViewResolver({
            loader: new FileSystemResourceLoader(viewsDir),
            prefix: viewsDir + sep,
            suffix: '.ejs',
        });

        const view = (await resolver.resolveViewName('shell', 'en-US')) as unknown as ProducerView | null;
        if (!view) {
            throw new Error('expected the shell view to resolve');
        }
        const { body } = await view.renderTo(modelAndView.model, route);
        const bodyText = body as string;

        // The island now carries a declarative shadow root, so the marker has
        // child markup (the browser would lift it into a real shadow root).
        const markup = /<todo-app[^>]*>[\s\S]*?<\/todo-app>/.exec(bodyText)?.[0] ?? '';
        expect(markup).toContain('data-ndigo-model=');
        // DSD first paint: the negotiated locale rides along, and the island
        // carries a declarative shadow root with the server-rendered fallback.
        expect(markup).toContain('data-ndigo-locale="en-US"');
        expect(markup).toContain('<template shadowrootmode="open">');
        expect(markup).toContain('Server-rendered island');

        // Embedding the raw SSR markup lets the DOM parser decode the
        // attribute entities exactly once, as a browser does before hydration.
        document.body.innerHTML = markup;

        const hydrated = hydrateIslands(document);
        expect(hydrated).toBe(1);

        // The real demo island rendered from the parsed model — proof the
        // model was non-null (its setter/render path throws on `null`). It
        // renders into its shadow root (jsdom does not parse DSD, so hydrate
        // replaced the marker and the first render attached a fresh root).
        const live = document.querySelector('todo-app');
        expect(live?.shadowRoot?.textContent).toContain('[hydrated on client] 2 item(s), filter: all');

        // AD-71 reference integration: the adopted library's form-associated
        // controls render into the same root. jsdom cannot exercise FACE form
        // data, so the live-browser check covers the submission path.
        const shadow = live?.shadowRoot;
        expect(shadow?.querySelector('form')).toBeTruthy();
        expect(shadow?.querySelector('wa-input')?.getAttribute('name')).toBe('text');
        expect(shadow?.querySelector('wa-button')?.getAttribute('type')).toBe('submit');

        // Release the island's SSE subscription/reconnect loop (WC-F) so the
        // test leaves no pending timers behind.
        live?.remove();
    });
});
