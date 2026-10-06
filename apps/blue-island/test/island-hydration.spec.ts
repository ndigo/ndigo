/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { resolve, sep } from 'node:path';
import { describe, test, expect } from 'vitest';
import type { Route } from '@blue/router';
import { EJSViewResolver } from '@blue/view-ejs';
import { FileSystemResourceLoader } from '@blue/platform-node';
import { hydrateIslands } from '@blue/view-webcomponent';
import { IslandController } from '../src/island-controller';
import { TodoModelStore } from '../src/todo-model-store';
// Side-effect import: registers the demo's `todo-app` custom element
// (`@TagMapping`) and runs the demo's own `hydrateIslands()` bootstrap.
import '../client/main';

const viewsDir = resolve('views');

/**
 * SSR → hydration contract end-to-end (DSV-WEBCOMP-1): the server-rendered
 * `data-blue-model` attribute MUST hydrate through the framework parser into
 * the demo island. When the server URI-encoded the model while hydration
 * parsed plain JSON, the model came back `null`, the island's `.model` setter
 * assigned `null`, and `render()` threw — the island never hydrated.
 */

describe('blue-island SSR → hydration', () => {
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
        const modelAndView = new IslandController(store).index();
        const resolver = new EJSViewResolver({
            loader: new FileSystemResourceLoader(viewsDir),
            prefix: viewsDir + sep,
            suffix: '.ejs',
        });

        const view = await resolver.resolveViewName('shell', 'en-US');
        if (!view) {
            throw new Error('expected the shell view to resolve');
        }
        const { body } = await view.renderTo(modelAndView.model, { attributes: {} } as Route);

        const markup = /<todo-app[^>]*><\/todo-app>/.exec(body)?.[0] ?? '';
        expect(markup).toContain('data-blue-model=');

        // Embedding the raw SSR markup lets the DOM parser decode the
        // attribute entities exactly once, as a browser does before hydration.
        document.body.innerHTML = markup;

        const hydrated = hydrateIslands(document);
        expect(hydrated).toBe(1);

        // The real demo island rendered from the parsed model — proof the
        // model was non-null (its setter/render path throws on `null`).
        const live = document.querySelector('todo-app');
        expect(live?.textContent).toContain('[hydrated on client] 2 item(s), filter: all');
    });
});
