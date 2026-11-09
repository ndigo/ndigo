# Guide 29 — Signals & Islands

`@ndigo/signals` is the local reactive-state layer: `signal`, `computed`, and
`effect` re-exported from `@preact/signals-core`, a decorator API for classes
and web components, and bridges that turn async streams and emitter events
into signals. Islands use it for the reactive half of partial hydration — the
server renders a web component with a serialized model, the client hydrates
it, and server push (SSE) flows through `streamToSignal` into signals that
re-render the element.

The architecture map for the island model itself lives in
[Micro Frontends](../architecture/micro-frontends.md); this guide is the
how-to.

**Audience:** Browser application developers · **Prerequisites:** Guide 02 · **Reference app:** `apps/07-ndigo-island`, `apps/08-ndigo-views`

## What you'll learn

- Use `signal`, `computed`, `effect`, and batching.
- Apply the `@reactive` decorators to classes and elements.
- Bridge streams and emitter events into signals.
- Render an `IslandView` and hydrate it.
- Push live updates over SSE into signals.

## 1. When to reach for signals

Signals are for **local, synchronous, derived state** within one component or
service — a value that other code reads and reacts to immediately. They are
not an event bus: cross-component asynchronous notifications stay on the
`@ndigo/context` event emitter, and server→client pushes stay on SSE. The full
paradigm table lives in
[ARCHITECTURE.md § Paradigm Selection Rules](../../ARCHITECTURE.md#paradigm-selection-rules).

## 2. Core primitives

```ts
import { signal, computed, effect, batch, untracked } from '@ndigo/signals';

const count = signal(0);
const doubled = computed(() => count.value * 2); // memoized, lazy

const stop = effect(() => {
    console.log('count', count.value, 'doubled', doubled.value);
});

count.value += 1; // the effect runs
batch(() => {
    count.value = 10;
    count.value += 1;
}); // one effect pass for both writes
untracked(() => count.value); // read without subscribing

stop(); // dispose the effect
```

Reads and writes go through `.value`; `effect` returns its disposer; `computed`
re-evaluates only when its dependencies change.

## 3. Decorator API — `@ndigo/signals/decorators`

For classes and web components, the `decorators` subpath exports decorator
versions of the same names. Import from the right entry — the root exports the
primitives, the subpath exports the decorators:

```ts
import { AbstractWebComponent } from '@ndigo/view-webcomponent';
import { signal, computed, effect, reactive } from '@ndigo/signals/decorators';

@reactive // activates the members below (this class only)
class SignalsCounter extends AbstractWebComponent {
    @signal count = 0;

    @computed get doubled() {
        return this.count * 2;
    }

    @effect updateDisplay() {
        this.render(); // runs on every dependency change
    }

    render() {
        // …
    }
}
```

- `@reactive` is a class decorator that activates the `@signal` fields,
  `@computed` getters, and `@effect` methods declared on that class.
- Decorators are **not inherited**: a subclass declaring reactive members
  needs its own `@reactive`; otherwise the pending metadata never activates and
  `getSignal()` throws instead of leaving silently inert fields.
- `getSignal(instance, field)` returns the backing `Signal` when one is needed
  outside the field accessors.
- When the class defines `destroy()`/`dispose()`, activation wraps them to
  dispose the effects and drop the signal maps.

The runnable demo is `apps/03-ndigo-todo-web`'s `signals-counter-view.ts`.

## 4. Bridging streams and events

```ts
import { eventsToSignal, signal, signalToEvents, streamToSignal } from '@ndigo/signals';

// Async iterable → signal; the returned function cancels and closes the source.
const numbers = signal(0);
const stop = streamToSignal(service.numbers(), numbers);

// Emitter-shaped source (on/off — e.g. the @ndigo/context Emitter) → signal.
const status = signal<'up' | 'down'>('down');
const off = eventsToSignal(context, 'service:status', status, (payload) => payload.status);

// Signal changes → emitter-shaped sink (emit).
const detach = signalToEvents(numbers, context, 'counter:changed', {
    transform: (n) => ({ count: n }),
});
```

All three return a teardown function. `streamToSignal` writes each yielded
value into the target and collapses to the latest — signals hold state, not
histories; a consumption error is logged and closes the stream.
`signalToEvents` does not emit the current value on subscribe unless
`emitInitial: true`.

## 5. Islands — server and client

An island is a server-rendered custom element carrying a serialized model; the
client upgrades the marker and keeps it in sync. The integration contract is
the **name ↔ tag ↔ zod schema triple**.

### Server: the marker

```ts
import { ModelAndView } from '@ndigo/dispatcher';
import { IslandView } from '@ndigo/view';

return new ModelAndView(new IslandView('todo-app'), { items, filter: 'all' });
```

`IslandView` renders inert markup —
`<todo-app data-ndigo-island data-ndigo-locale="…" data-ndigo-model="…">` — with
the model JSON HTML-escaped into the attribute and the negotiated locale riding
along; nothing on the server imports the client component. Resolve view names
to markers with `IslandViewResolver`; its optional `viewNames` filter
(strings/regexes) keeps the resolver from claiming every view name in the
chain.

### Client: hydration

```ts
import { AbstractWebComponent, hydrateIslands, TagMapping } from '@ndigo/view-webcomponent';

@TagMapping('todo-app') // customElements.define at module import
class TodoIsland extends AbstractWebComponent {
    set model(value: TodoModel) {
        this.#model = value;
        this.render();
    }

    render() {
        // …
    }
}

hydrateIslands(); // upgrades every [data-ndigo-island] marker; returns the count
```

`hydrateIslands(root = document)` finds the markers, constructs the element for
each tag — which must already be defined; a tag with no registered component is
left as inert markup — restores the locale and `.model`, and replaces the
server markup, after which `connectedCallback`/`render` run. The demo app is
`apps/07-ndigo-island` (EJS shell + hydrated island + SSE).

### Reactive islands: SSE → signal → render

The server pushes model updates as Server-Sent Events; the client consumes the
typed stream and writes it into a signal that an `effect` renders from:

```ts
// Server: a per-connection, imperative view.
import { ServerSentEventView } from '@ndigo/platform-node';

@getMapping('/events')
events(): ServerSentEventView {
    return new ServerSentEventView(pushUpdates()); // async generator of events
}
```

```ts
// Client: the endpoint as a typed service stream (`@ndigo/service`).
import { getCall, service, serviceClient } from '@ndigo/service';
import { signal, streamToSignal, effect } from '@ndigo/signals';
import { HTTP } from '@ndigo/http';

@service('ndigo-island', { baseUrl: '' })
class IslandPushAPI {
    @getCall('/events', { stream: true, responseSchema: ModelUpdateSchema })
    modelUpdates(): AsyncIterable<{ model: TodoModel }> {
        return undefined as unknown;
    }
}

class IslandElement {
    connectedCallback(): void {
        super.connectedCallback();
        const modelSignal = signal({ model: this.#model });
        effect(() => {
            const next = modelSignal.value.model;
            if (next !== this.#model) {
                this.#model = next;
                this.render();
            }
        });
        streamToSignal(serviceClient(IslandPushAPI, new HTTP()).modelUpdates(), modelSignal);
    }
}
```

Each SSE event is validated by the response schema before it reaches the
signal, so the island renders only well-formed models.

## See also

- [Guide 16 — Typed Service Clients & SSE](16-typed-service-clients-and-sse.md) — the stream the signal consumes
- Decisions: [AD-09](../decisions/2026-09-05_AD09_SERVER_PUSH.md) (SSE server
  push), [AD-65](../decisions/2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md)
  (view resolution).
- Architecture: [Micro Frontends](../architecture/micro-frontends.md) — the
  host/island map, shared dependencies, event isolation.
- Packages: `@ndigo/signals`, `@ndigo/view` (`IslandView`),
  `@ndigo/view-webcomponent` (`hydrateIslands`, `@TagMapping`),
  `@ndigo/service` (`stream: true`), `@ndigo/platform-node`
  (`ServerSentEventView`).
