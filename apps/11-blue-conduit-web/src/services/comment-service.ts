/**
 * An article's comments: the list on the article page, plus add and delete.
 *
 * Comments are keyed by article slug like the article itself, and every write
 * re-renders through `router.refresh()` (AD-53 D-3). Unlike favoriting there is
 * no optimistic path: a comment's identity (id, createdAt, author) comes from
 * the server, so showing a provisional one would mean inventing data — the
 * list reloads instead, which for a single-user comment box is one round trip.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import { Null } from '@blue/core';
import { ROUTER } from '@blue/router';
import { signal, type Signal } from '@blue/signals';
import { ConduitApiError, type ConduitApi, type ConduitComment, type ConduitErrors } from '../lib/api/conduit-types';
import { FormErrorState } from './form-errors';

/**
 * The comment service.
 */
export class CommentService extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    readonly #api: ConduitApi;
    readonly #comments: Signal<ConduitComment[]>;
    readonly #errors: FormErrorState;

    /** The slug the cached list belongs to, or `null` when nothing is loaded. */
    #loadedSlug: string | null = null;

    /**
     * Creates the service.
     *
     * @param api - The Conduit API port.
     */
    constructor(api: ConduitApi) {
        super();
        this.#api = api;
        this.#comments = signal([]);
        this.#errors = new FormErrorState();
    }

    /** The cached comments, oldest first (the API's order). */
    get comments(): ConduitComment[] {
        return this.#comments.value;
    }

    /**
     * The envelope the comment box failed with, when it produced one.
     *
     * @returns The envelope, or `null`.
     */
    commentErrors(): ConduitErrors | null {
        return this.#errors.for('comment');
    }

    /**
     * Loads the comments for an article, once per slug.
     *
     * @param slug - The article slug.
     */
    async ensure(slug: string): Promise<void> {
        if (slug === this.#loadedSlug) {
            return;
        }
        await this.reload(slug);
    }

    /**
     * Loads the comments for an article unconditionally.
     *
     * @param slug - The article slug.
     */
    async reload(slug: string): Promise<void> {
        try {
            this.#comments.value = await this.#api.listComments(slug);
        } catch {
            this.#comments.value = [];
        }
        this.#loadedSlug = slug;
    }

    /**
     * Adds a comment and reloads the list. A rejection — including the `422` an
     * empty body produces — records the envelope for the comment box.
     *
     * @param slug - The article slug.
     * @param body - The comment text.
     * @returns The envelope on failure, `null` on success.
     */
    async add(slug: string, body: string): Promise<ConduitErrors | null> {
        this.#errors.clear();
        try {
            await this.#api.addComment(slug, body);
            await this.reload(slug);
            this.#refresh();
            return null;
        } catch (error) {
            const errors = ConduitApiError.from(error)?.errors ?? { body: ['The comment could not be added.'] };
            this.#errors.set('comment', errors);
            this.#refresh();
            return errors;
        }
    }

    /**
     * Deletes a comment and reloads the list. The API refuses a delete by
     * anyone but the comment's author, so the outcome is re-read rather than
     * assumed.
     *
     * @param slug - The article slug.
     * @param id - The comment id.
     */
    async remove(slug: string, id: number): Promise<void> {
        try {
            await this.#api.deleteComment(slug, id);
        } catch {
            // Refused: fall through to the reload, which shows the comment still there.
        }
        await this.reload(slug);
        this.#refresh();
    }

    /** Re-renders the current route from the mutated state. */
    #refresh(): void {
        this.applicationContext?.getValue(ROUTER)?.refresh();
    }
}
