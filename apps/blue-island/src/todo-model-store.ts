/**
 * The island demo's server-side todo model (AD-9).
 *
 * The server owns source-of-truth state; each update is queued to all
 * `subscribe()` callers and the current snapshot is available via `get()`.
 * The stream ends when `stop()` cancels the ticker — the demo pushes three
 * updates (one per second), proving server push into the hydrated island.
 */

export type TodoItem = { text: string; done: boolean };
export type TodoModel = { items: TodoItem[]; filter: string };

const tickerTexts = [
    'Model update pushed from the server (1)',
    'Model update pushed from the server (2)',
    'Model update pushed from the server (3)',
];

/**
 * Source-of-truth model store for the demo: a snapshot plus a push channel.
 */
export class TodoModelStore {
    readonly #subscribers = new Set<() => Promise<void>>();
    #model: TodoModel;
    #ticker: ReturnType<typeof setInterval> | null = null;
    #tickIndex = 0;

    constructor(initial: TodoModel) {
        this.#model = structuredClone(initial);
    }

    /**
     * The current model snapshot.
     */
    get(): TodoModel {
        return structuredClone(this.#model);
    }

    /**
     * Apply a mutation to the model and notify subscribers.
     *
     * @param mutate - The mutation, applied to the live model.
     */
    update(mutate: (model: TodoModel) => void): void {
        mutate(this.#model);
        for (const notify of this.#subscribers) {
            void notify();
        }
    }

    /**
     * Register a subscriber notified after every model update.
     *
     * @param notify - The subscriber; may safely queue or push the update.
     * @returns An unsubscribe function removing the subscriber.
     */
    subscribe(notify: () => Promise<void>): () => void {
        this.#subscribers.add(notify);
        return () => {
            this.#subscribers.delete(notify);
        };
    }

    /**
     * Start the demo ticker: one model update per second, three total.
     */
    startTicker(): void {
        if (this.#ticker !== null) {
            return;
        }
        this.#ticker = setInterval(() => {
            if (this.#tickIndex >= tickerTexts.length) {
                this.stopTicker();
                return;
            }
            const text = tickerTexts[this.#tickIndex++];
            this.update((model) => {
                model.items.push({ text, done: false });
            });
        }, 1000);
    }

    /**
     * Stop the ticker; pending pushes stop reaching subscribers.
     */
    stopTicker(): void {
        if (this.#ticker !== null) {
            clearInterval(this.#ticker);
            this.#ticker = null;
        }
    }
}
