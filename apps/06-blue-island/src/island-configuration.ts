/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, type ApplicationContext } from '@blue/context';
import { fileURLToPath } from 'node:url';
import { I18nextMessageSource } from '@blue/content-i18next';
import { HANDLER_MAPPING } from '@blue/dispatcher';
import { SecurityHeadersInterceptor, StaticController, FileSystemResourceLoader } from '@blue/platform-node';
import { EJSViewResolver } from '@blue/view-ejs';
import { MESSAGE_SOURCE, MODEL_STORE } from './context-tokens';
import { IslandController } from './island-controller';
import { TodoModelStore } from './todo-model-store';

/**
 * SEC-C — widen the demo's CSP `connect-src` to admit `data:` URIs.
 *
 * The AD-71 reference integration keeps `with-clear` on the Web Awesome input;
 * the library's `wa-icon` renders its system clear icon through
 * `fetch('data:image/svg+xml,…')`, which the framework's default
 * `connect-src 'self'` blocks (two console errors and a missing clear
 * affordance). The documented seam is replacing the default-on
 * {@link SecurityHeadersInterceptor} instance in the handler mapping's
 * interceptor chain with one carrying explicit directives — the same seam a
 * cross-host WebSocket uses to add `wss://<host>`. Every response keeps the
 * full default header set (`useDefaults: true`) plus `data:` in `connect-src`.
 *
 * `img-src` needs no widening: the icon SVG is fetched as text and injected
 * inline, so no URL is loaded as an image.
 *
 * Call after the context has refreshed (the handler mapping bean exists then).
 *
 * @param context - The refreshed application context to harden.
 */
export function applyDemoSecurityHeaders(context: ApplicationContext): void {
    const mapping = context.getValue(HANDLER_MAPPING);
    mapping.interceptors.splice(
        0,
        1,
        new SecurityHeadersInterceptor({
            headers: {
                contentSecurityPolicy: {
                    useDefaults: true,
                    directives: { 'connect-src': ["'self'", 'data:'] },
                },
            },
        })
    );
}

/**
 * Blue Island configuration: the server-rendered island controller plus the
 * static client-bundle server (reuses the shared `StaticResourceResolver`).
 */
@configuration
export class IslandConfiguration {
    // The composition root: one store instance shared by the shell (initial
    // snapshot) and the SSE push endpoint.
    readonly #modelStore = new TodoModelStore({
        items: [
            { text: 'Server-rendered island', done: true },
            { text: 'Hydrated on the client', done: false },
        ],
        filter: 'all',
    });

    // One message source for the whole app; the shell renders its keys
    // through the EJS locale helpers.
    readonly #messages = new I18nextMessageSource({
        resources: {
            en: {
                translation: {
                    'app.title': 'Blue Island',
                    'app.intro':
                        'Rendered by the <strong>server</strong>; the component below is a Web Component island hydrated on the <strong>client</strong>. Model updates are pushed from the server over SSE (AD-09).',
                    'app.today': 'Today is {{date}}',
                    'app.mode.switched': 'Server language: {{language}}',
                },
            },
            fr: {
                translation: {
                    'app.title': 'Blue Island',
                    'app.intro':
                        'Rendu par le <strong>serveur</strong>; le composant ci-dessous est une île Web Component hydratée côté <strong>client</strong>. Les mises à jour du modèle sont poussées par le serveur via SSE (AD-09).',
                    'app.today': "Aujourd'hui, nous sommes le {{date}}",
                    'app.mode.switched': 'Langue du serveur : {{language}}',
                },
            },
        },
        language: 'en',
        fallbackLanguage: 'en',
    });

    @entry()
    islandController() {
        return new IslandController(this.#modelStore);
    }

    @entry()
    staticController() {
        // Serve the Vite-built client bundle (dist/) — resolved from this file
        // so the server works regardless of the process working directory.
        return new StaticController(fileURLToPath(new URL('../dist/', import.meta.url)));
    }

    @entry(MODEL_STORE)
    modelStore() {
        return this.#modelStore;
    }

    /**
     * The application message source (registered on the context by the
     * bootstrap, which calls `context.setMessageSource`).
     */
    @entry(MESSAGE_SOURCE)
    messageSource() {
        return this.#messages;
    }

    /**
     * Resolves view names to EJS templates in the app's views/ directory —
     * whole-page document rendering (servlet/JSP-style). Reads templates
     * through the framework `ResourceLoader` seam, so this demo exercises
     * the full source → engine → producer pipeline.
     */
    @entry()
    viewResolver() {
        return new EJSViewResolver({
            loader: new FileSystemResourceLoader(),
            prefix: fileURLToPath(new URL('../views/', import.meta.url)),
            suffix: '.ejs',
        });
    }
}
