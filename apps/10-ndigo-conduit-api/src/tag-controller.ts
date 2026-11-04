/**
 * `GET /api/tags` — every tag in use.
 *
 * The spec leaves ordering open; this app answers sorted, deduplicated tags so
 * the response is stable across runs (see the README's conformance note).
 *
 * @module ndigo-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import type { ConduitStore } from './store';

/** The tags controller. */
@requestMapping('/api/tags')
export class TagController {
    readonly #store: ConduitStore;

    /**
     * Creates the controller.
     *
     * @param store - The persistence seam.
     */
    constructor(store: ConduitStore) {
        this.#store = store;
    }

    /**
     * `GET /api/tags` — the tag list.
     *
     * @returns `200 {tags}`.
     */
    @getMapping('/')
    list() {
        return { tags: this.#store.tags() };
    }
}
