/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
// AD-71 reference integration — Web Awesome, imported per component (no
// wrappers): importing a component registers its element (the intended side
// effect); the theme CSS carries the design-token contract; the fr
// translation localizes the library's own chrome whenever the document is
// served with lang="fr".
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import '@awesome.me/webawesome/dist/translations/fr.js';
import { AbstractWebComponent, hydrateIslands, TagMapping } from '@blue/view-webcomponent';
import { service, getCall, serviceClient } from '@blue/service';
import { HTTP } from '@blue/http';
import { signal, streamToSignal, effect } from '@blue/signals';
import { z } from 'zod';

/**
 * `todo-app` — the island's client half.
 *
 * The server renders this element with `data-blue-model="…"`;
 * `hydrateIslands()` constructs it, restores `.model` from the serialized
 * snapshot, and an `effect` re-renders on every signal change. The server
 * pushes model updates over SSE (AD-09): the typed service stream below
 * validates each event (AD-07) and feeds it into the local `@blue/signals`
 * state, which re-renders the island.
 *
 * The add-item form is the AD-71 reference integration: Web Awesome
 * form-associated controls submit standard name/value pairs, so the POST body
 * is ordinary `application/x-www-form-urlencoded` and the server binds it
 * through the existing `dataBinderValue` + Zod path (guide 09/02).
 */

export type TodoItem = { text: string; done: boolean };
export type TodoModel = { items: TodoItem[]; filter: string };

const TodoItemSchema = z.object({ text: z.string(), done: z.boolean() });
const TodoModelSchema = z.object({ items: z.array(TodoItemSchema), filter: z.string() });
const ModelUpdateSchema = z.object({ model: TodoModelSchema });

/**
 * The server's push endpoints as a typed service client — the SSE stream is
 * one call (`stream: true`, AD-09), normalized through the same service layer
 * as any REST call.
 */
@service('blue-island', { baseUrl: '' })
class IslandPushAPI {
    @getCall('/events', { stream: true, responseSchema: ModelUpdateSchema })
    modelUpdates(): AsyncIterable<{ model: TodoModel }> {
        return undefined as unknown as AsyncIterable<{ model: TodoModel }>;
    }
}

/** First reconnect delay; each failed attempt doubles up to the max (WC-G). */
const SSE_INITIAL_BACKOFF_MS = 1000;

/** Ceiling for the reconnect backoff, so retries stay frequent but bounded. */
const SSE_MAX_BACKOFF_MS = 30_000;

/**
 * The island's SSE connection states, surfaced in its status line so a server
 * restart or network drop is visible instead of silently stale (WC-G).
 */
type ConnectionState = 'connecting' | 'live' | 'reconnecting';

/**
 * Per-connect SSE session state (WC-G): the reconnect loop waits out its
 * backoff on `wake`, so disconnecting can cancel the wait immediately instead
 * of leaving a timer to fire after the component is gone. A fresh session per
 * connect keeps a disposed loop from observing the next one's state.
 */
type StreamSession = { cancelled: boolean; wake: (() => void) | undefined };

/** The island's own strings, keyed by the negotiated locale's language. */
const ISLAND_LABELS = {
    en: {
        inputLabel: 'Add an item',
        inputPlaceholder: 'What needs doing?',
        addButton: 'Add',
        idle: '[form] Web Awesome controls — submit posts standard form data.',
        accepted: (text: string) => `[form] accepted "${text}" — model update pushed over SSE`,
        rejected: (detail: string) => `[form] submit failed (${detail})`,
        connection: {
            connecting: '[SSE] connecting…',
            live: '[SSE] listening for server model updates…',
            reconnecting: '[SSE] connection lost — reconnecting…',
        },
    },
    fr: {
        inputLabel: 'Ajouter un élément',
        inputPlaceholder: 'Que faut-il faire ?',
        addButton: 'Ajouter',
        idle: '[form] composants Web Awesome — l’envoi utilise les données de formulaire standard.',
        accepted: (text: string) => `[form] « ${text} » accepté — mise à jour poussée via SSE`,
        rejected: (detail: string) => `[form] échec de l’envoi (${detail})`,
        connection: {
            connecting: '[SSE] connexion…',
            live: '[SSE] écoute des mises à jour du serveur…',
            reconnecting: '[SSE] connexion perdue — reconnexion…',
        },
    },
} as const;

type IslandLabels = (typeof ISLAND_LABELS)[keyof typeof ISLAND_LABELS];

/** Picks the label set for a negotiated locale (`fr`, `fr-FR`, …). */
function labelsFor(locale: string): IslandLabels {
    return locale.toLowerCase().startsWith('fr') ? ISLAND_LABELS.fr : ISLAND_LABELS.en;
}

@TagMapping('todo-app')
class TodoIsland extends AbstractWebComponent {
    #model: TodoModel = { items: [], filter: 'all' };
    #locale = 'en';
    readonly #http = new HTTP();
    #list: HTMLUListElement | undefined;
    #hint: HTMLParagraphElement | undefined;
    #live: HTMLParagraphElement | undefined;

    // WC-F: the connect-time subscription/render resources are owned by the
    // component and released on disconnect, so a DOM move (disconnect →
    // reconnect) never stacks a second effect or SSE subscription.
    #stopEffect: (() => void) | undefined;
    #stopStream: (() => void) | undefined;
    #streamSession: StreamSession | undefined;

    // WC-G: the last connection state, kept so a shell rebuilt after a
    // reconnect still reflects the live status.
    #connectionState: ConnectionState = 'connecting';

    set model(model: TodoModel) {
        this.#model = model;
        this.render();
    }

    get model(): TodoModel {
        return this.#model;
    }

    /**
     * The negotiated locale, assigned by `hydrateIslands` from the island
     * marker before the model (guide 04 propagates the server's choice).
     */
    set locale(locale: string) {
        this.#locale = locale;
    }

    get locale(): string {
        return this.#locale;
    }

    /**
     * Lifecycle hook (WC-F): wire the reactive render path and the SSE
     * subscription, keeping both disposers so {@link handleDisconnect} can
     * release them. Runs on every (re)connect, so it must create exactly one
     * of each.
     */
    protected handleConnect(): void {
        // Subscribe to server pushes: each validated SSE `model` event
        // replaces the local reactive state; the effect below re-renders.
        const modelSignal = signal<{ model: TodoModel }>({ model: this.#model });
        this.#stopEffect = effect(() => {
            const next = modelSignal.value.model;
            if (next !== this.#model) {
                this.#model = next;
                this.render();
            }
        });
        // serviceClient's generic binds to the constructor it receives, so the
        // proxy is typed as the instance shape explicitly (runtime returns one).
        const api = serviceClient(IslandPushAPI, this.#http) as unknown as IslandPushAPI;
        // A per-connect session lets disconnect cancel an in-flight backoff
        // wait before closing the stream (see {@link handleDisconnect}).
        this.#streamSession = { cancelled: false, wake: undefined };
        this.#stopStream = streamToSignal(this.#reconnectingStream(api, this.#streamSession), modelSignal);
    }

    /**
     * Releases the connect-time resources (WC-F). Without this the old effect
     * and SSE subscription would keep running after a DOM move, stacking a
     * second render path and a second stream on the next connect.
     */
    protected handleDisconnect(): void {
        // Wake an in-flight backoff wait so the reconnect loop stops now, then
        // release the effect and the stream's stop handle.
        if (this.#streamSession) {
            this.#streamSession.cancelled = true;
            this.#streamSession.wake?.();
            this.#streamSession.wake = undefined;
            this.#streamSession = undefined;
        }
        this.#stopStream?.();
        this.#stopEffect?.();
        this.#stopStream = undefined;
        this.#stopEffect = undefined;
    }

    /**
     * Resubscribing SSE source (WC-G): follows the server's model stream, and
     * when it ends or errors — a server restart, a dropped connection — waits a
     * bounded, exponentially growing backoff and resubscribes, updating the
     * visible connection state around each attempt. The returned stop handle
     * (from `streamToSignal`) disposes the whole loop.
     *
     * @param api - The typed push service client to resubscribe.
     * @param session - The connect's cancellation state; see {@link StreamSession}.
     * @returns The event stream, resubscribed across disconnections.
     */
    async *#reconnectingStream(api: IslandPushAPI, session: StreamSession): AsyncIterable<{ model: TodoModel }> {
        let delay = SSE_INITIAL_BACKOFF_MS;
        while (!session.cancelled) {
            this.#setConnectionState('connecting');
            try {
                // oxlint-disable-next-line no-await-in-loop -- consuming the push stream is inherently sequential
                for await (const update of api.modelUpdates()) {
                    // A delivered event proves the stream is open again.
                    delay = SSE_INITIAL_BACKOFF_MS;
                    this.#setConnectionState('live');
                    yield update;
                }
                this.#setConnectionState('reconnecting');
            } catch {
                // Transport failure (server down/restart): retry below. The
                // error is expected during backoff and is not user-facing.
                this.#setConnectionState('reconnecting');
            }
            if (session.cancelled) {
                return;
            }
            const backoff = Promise.withResolvers<void>();
            session.wake = backoff.resolve;
            const timer = setTimeout(backoff.resolve, delay);
            // oxlint-disable-next-line no-await-in-loop -- the loop exists to serialize reconnect attempts
            await backoff.promise;
            clearTimeout(timer);
            session.wake = undefined;
            delay = Math.min(delay * 2, SSE_MAX_BACKOFF_MS);
        }
    }

    /** Records and, once the shell exists, displays the SSE connection state. */
    #setConnectionState(state: ConnectionState): void {
        this.#connectionState = state;
        if (this.#live) {
            this.#live.textContent = labelsFor(this.#locale).connection[state];
        }
    }

    render(): void {
        // Render into the shadow root (adopting the server's declarative
        // shadow root when present) — light-DOM children would be masked by a
        // parsed DSD root, since the fallback markup has no `<slot>`.
        const root = this.ensureShadowRoot();
        if (this.#list?.getRootNode() !== root) {
            this.#buildShell(root);
        }
        if (!this.#list || !this.#hint) {
            return;
        }
        // Model-derived views update on every SSE push; the form (and the
        // user's in-progress input) is built once and never re-created.
        this.#list.replaceChildren(
            ...this.#model.items.map((item) => {
                const li = document.createElement('li');
                li.textContent = `${item.done ? '✅' : '⬜'} ${item.text}`;
                return li;
            })
        );
        this.#hint.textContent = `[hydrated on client] ${this.#model.items.length} item(s), filter: ${this.#model.filter}`;
    }

    /**
     * Builds the model-independent parts: the item list host, the status
     * lines, and the add-item form (AD-71 reference integration — the Web
     * Awesome controls are used directly; attributes and events are the API).
     */
    #buildShell(root: ShadowRoot): void {
        const labels = labelsFor(this.#locale);
        const style = document.createElement('style');
        style.textContent = [
            '.add-item { display: flex; gap: 0.5rem; align-items: flex-end; margin-top: 0.75rem; }',
            '.add-item wa-input { flex: 1; }',
            '.add-item-status { color: #666; font-size: 0.85rem; }',
        ].join('\n');
        const list = document.createElement('ul');
        const hint = document.createElement('p');
        hint.style.fontSize = '0.85rem';
        hint.style.color = '#666';
        const live = document.createElement('p');
        live.style.fontSize = '0.85rem';
        live.style.color = '#1a7f4b'; // ≥4.5:1 on white (axe WCAG AA)
        live.textContent = labels.connection[this.#connectionState];
        const form = document.createElement('form');
        form.className = 'add-item';
        const input = document.createElement('wa-input') as HTMLElement & { value: string };
        input.setAttribute('name', 'text');
        input.setAttribute('label', labels.inputLabel);
        input.setAttribute('placeholder', labels.inputPlaceholder);
        input.setAttribute('with-clear', '');
        input.setAttribute('required', '');
        const submit = document.createElement('wa-button');
        submit.setAttribute('type', 'submit');
        // `accent` is the loud fill (driven by --wa-color-brand-fill-loud),
        // so the shell's token override is visibly exercised (AD-71 D-4).
        submit.setAttribute('appearance', 'accent');
        submit.setAttribute('variant', 'brand');
        submit.textContent = labels.addButton;
        form.append(input, submit);
        const status = document.createElement('p');
        status.className = 'add-item-status';
        status.setAttribute('role', 'status');
        status.textContent = labels.idle;
        form.addEventListener('submit', (event) => {
            this.#submitItem(event, form, input, status);
        });
        root.replaceChildren(style, list, hint, live, form, status);
        this.#list = list;
        this.#hint = hint;
        this.#live = live;
    }

    /**
     * Standard form submission (AD-71 D-4): the form-associated custom
     * controls contribute name/value pairs to `FormData` exactly like native
     * controls — no hidden inputs, no component-specific extraction.
     */
    #submitItem(
        event: Event,
        form: HTMLFormElement,
        input: HTMLElement & { value: string },
        status: HTMLParagraphElement
    ): void {
        event.preventDefault();
        const formData = new FormData(form);
        const text = String(formData.get('text') ?? '').trim();
        if (text === '') {
            return;
        }
        const body = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            body.set(key, String(value));
        }
        void this.#postItem(body, input, status);
    }

    /** Posts the form body to the server and reports the outcome. */
    async #postItem(
        body: URLSearchParams,
        input: HTMLElement & { value: string },
        status: HTMLParagraphElement
    ): Promise<void> {
        const labels = labelsFor(this.#locale);
        try {
            const response = await this.#http.post('/items', {
                headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
                body,
            });
            if (!response.ok) {
                status.textContent = labels.rejected(`HTTP ${response.status}`);
                return;
            }
            input.value = '';
            status.textContent = labels.accepted(body.get('text') ?? '');
        } catch {
            status.textContent = labels.rejected('network error');
        }
    }
}

// The class is registered via @TagMapping side-effect.
void TodoIsland;

// Upgrade any server-rendered islands on the page.
hydrateIslands();
