/**
 * The popular-tags sidebar (`GET /api/tags`).
 *
 * Tags change only when someone publishes, so the list is fetched once per page
 * load and cached in a signal — a route refresh (every favorite, every follow)
 * must not turn into another request for the same sidebar.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { signal, type Signal } from '@ndigo/signals';
import type { ConduitApi } from '../lib/api/conduit-types';

/**
 * The tag service.
 */
export class TagService {
    readonly #api: ConduitApi;
    readonly #tags: Signal<string[]>;

    /** Whether a successful fetch has already populated the signal. */
    #loaded = false;

    /**
     * Creates the service.
     *
     * @param api - The Conduit API port.
     */
    constructor(api: ConduitApi) {
        this.#api = api;
        this.#tags = signal([]);
    }

    /** The cached popular tags. */
    get tags(): string[] {
        return this.#tags.value;
    }

    /**
     * Fetches the tags once per page load.
     *
     * A failed fetch leaves the sidebar empty rather than failing the route —
     * the tags are decoration next to the feed, not a reason to withhold it.
     */
    async ensure(): Promise<void> {
        if (this.#loaded) {
            return;
        }
        this.#loaded = true;
        await this.reload();
    }

    /** Fetches the tags again (used after publishing, which can add one). */
    async reload(): Promise<void> {
        try {
            this.#tags.value = await this.#api.listTags();
        } catch {
            this.#tags.value = [];
        }
    }
}
