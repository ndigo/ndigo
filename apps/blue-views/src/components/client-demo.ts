/**
 * @module blue-views
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ROOT_CONTEXT, trace, type Span } from '@opentelemetry/api';
import { CacheInterceptor, HTTP, TraceHeaderInterceptor } from '@blue/http';
import { RetryOnOfflineInterceptor } from '@blue/platform-web';
import { TagMapping } from '@blue/view-webcomponent';

/**
 * The client-side HTTP demo: a self-registering web component that fetches a
 * static asset through the `@blue/http` client with an interceptor chain —
 * an auth-style request stamp, the in-memory cache, and the offline-queueing
 * retry interceptor. A refresh button re-requests the same URL: the second
 * hit is served from the cache (network fetch count stays at one).
 *
 * Resolved like the shell: `@TagMapping` metadata + eager registry entry
 * (`clientDemo` → this class) in ViewsAppConfiguration.
 *
 * Render contract: the view engine drives components by assigning `model`
 * (the shell's contract — MemoryViewTarget never attaches elements, so
 * `connectedCallback` alone never fires in tests); real-DOM attach is
 * handled as a fallback through `connectedCallback`.
 */

const stampInterceptor = {
    async preRequest(request: Request): Promise<void | Request | Response> {
        request.headers.set('X-Client', 'blue-views');
    },
};

/** Narrowed read of the `items` payload field (checked, no fabricated shape). */
function itemsOf(payload: unknown): string[] {
    if (typeof payload !== 'object' || payload === null || !('items' in payload)) {
        return [];
    }
    const { items } = payload as { items: unknown };
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : [];
}

@TagMapping('blue-views-client')
export class ClientDemoComponent extends HTMLElement {
    #started = false;
    #status = 'loading…';
    #payload = '';
    #count = 0;
    #http: HTTP | null = null;
    #endpoint = '';
    #activeSpan: Span | null = null;

    /** Engine-driven entry point (also the shell's render contract). */
    set model(_model: unknown) {
        this.#start();
    }

    /** Fallback for real-DOM attach (not exercised by MemoryViewTarget). */
    connectedCallback(): void {
        this.#start();
    }

    #start(): void {
        if (this.#started) {
            return;
        }
        this.#started = true;

        // Absolute endpoint: the client wraps requests in `new Request(url)`,
        // which rejects relative URLs — same-origin URL is correct for fetch.
        this.#endpoint = new URL(
            '/data.json',
            typeof location !== 'undefined' ? location.href : 'http://localhost/'
        ).href;

        this.#http = HTTP.create({
            // No baseURL override: an absolute base is resolved from
            // location.href by default. Passing a relative base like '/'
            // makes `new URL(input, base)` throw ("Invalid URL") in Node's
            // URL parser even for absolute inputs.
            headers: { Authorization: 'Bearer demo' },
            interceptors: [
                new RetryOnOfflineInterceptor(),
                new CacheInterceptor({ defaultTtl: 60_000 }),
                // Browser→server journey: the active component span (see
                // #load) is injected as `traceparent`; blue-api's
                // HTTPServerInstrumentation continues the trace.
                new TraceHeaderInterceptor({
                    getContext: () => (this.#activeSpan ? trace.setSpan(ROOT_CONTEXT, this.#activeSpan) : ROOT_CONTEXT),
                }),
                stampInterceptor,
            ],
        });

        void this.#load();
    }

    /** Re-requests the endpoint; the cache serves the repeat hit. */
    async #load(): Promise<void> {
        this.#count += 1;
        // The journey root on the browser side: the trace header injected
        // into this request carries this span as the parent.
        const span = trace.getTracer('blue-views').startSpan('blue-views.client.fetch');
        this.#activeSpan = span;
        try {
            const http = this.#http;
            if (!http) {
                return;
            }
            const response: Response = await http.get(this.#endpoint);
            if (!response.ok) {
                throw new Error(String(response.status));
            }
            const data: unknown = await response.json();
            const items = itemsOf(data);
            this.#payload = `[client] ${items.join(', ')}`;
            this.#status = 'online';
        } catch (error) {
            if (!(error instanceof Error) || error.name !== 'AbortError') {
                this.#status = `offline or error: ${error instanceof Error ? error.message : String(error)}`;
            }
        } finally {
            this.#activeSpan = null;
            span.end();
            this._render();
        }
    }

    _render() {
        this.replaceChildren();
        const title = document.createElement('h2');
        title.textContent = 'HTTP client demo';
        this.append(title);
        const note = document.createElement('p');
        note.textContent = '[resolved by WebComponentViewResolver — fetches /data.json through @blue/http]';
        this.append(note);
        const status = document.createElement('p');
        status.textContent = `connection: ${this.#status}`;
        this.append(status);
        const payload = document.createElement('pre');
        payload.textContent = this.#payload;
        this.append(payload);
        const meta = document.createElement('p');
        meta.textContent = `requests: ${this.#count}`;
        this.append(meta);
        const refresh = document.createElement('button');
        refresh.textContent = 'Refresh';
        refresh.addEventListener('click', () => {
            void this.#load();
        });
        this.append(refresh);
    }
}
