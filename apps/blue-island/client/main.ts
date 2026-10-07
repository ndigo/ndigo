/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
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

@TagMapping('todo-app')
class TodoIsland extends AbstractWebComponent {
    #model: TodoModel = { items: [], filter: 'all' };

    set model(model: TodoModel) {
        this.#model = model;
        this.render();
    }

    get model(): TodoModel {
        return this.#model;
    }

    connectedCallback(): void {
        super.connectedCallback();
        // Subscribe to server pushes: each validated SSE `model` event
        // replaces the local reactive state; the effect below re-renders.
        const modelSignal = signal<{ model: TodoModel }>({ model: this.#model });
        effect(() => {
            const next = modelSignal.value.model;
            if (next !== this.#model) {
                this.#model = next;
                this.render();
            }
        });
        // serviceClient's generic binds to the constructor it receives, so the
        // proxy is typed as the instance shape explicitly (runtime returns one).
        const api = serviceClient(IslandPushAPI, new HTTP()) as unknown as IslandPushAPI;
        streamToSignal(api.modelUpdates(), modelSignal);
    }

    render(): void {
        // Render into the shadow root (adopting the server's declarative
        // shadow root when present) — light-DOM children would be masked by a
        // parsed DSD root, since the fallback markup has no `<slot>`.
        const root = this.ensureShadowRoot();
        root.replaceChildren();
        const list = document.createElement('ul');
        for (const item of this.#model.items) {
            const li = document.createElement('li');
            li.textContent = `${item.done ? '✅' : '⬜'} ${item.text}`;
            list.append(li);
        }
        root.append(list);
        const hint = document.createElement('p');
        hint.style.fontSize = '0.85rem';
        hint.style.color = '#666';
        hint.textContent = `[hydrated on client] ${this.#model.items.length} item(s), filter: ${this.#model.filter}`;
        root.append(hint);
        const live = document.createElement('p');
        live.style.fontSize = '0.85rem';
        live.style.color = '#2a6';
        live.textContent = '[SSE] listening for server model updates…';
        root.append(live);
    }
}

// The class is registered via @TagMapping side-effect.
void TodoIsland;

// Upgrade any server-rendered islands on the page.
hydrateIslands();
