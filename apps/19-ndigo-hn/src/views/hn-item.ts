/**
 * `hn-item` — one story/job and its bounded comment tree (`#/item/:id`).
 *
 * Like the list view it holds no state of its own: it subscribes to the item
 * and connectivity signals, so a deep link that renders from a persisted
 * snapshot and then revalidates over the network updates in place.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { effect } from '@ndigo/signals';
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import type { HnItem } from '../hn-types';
import { COMMENT_MAX_DEPTH, type HnItemState } from '../services/hn-service';
import type { ItemModel } from './models';
import {
    commentTree,
    connectionBanner,
    depthNote,
    el,
    errorState,
    formatItemAge,
    page,
    skeletonList,
    storyDomain,
    textParagraphs,
} from './chrome';

@TagMapping('hn-item')
export default class HnItemView extends AbstractWebComponent {
    #model: ItemModel | null = null;
    #stop: (() => void) | null = null;

    set model(model: ItemModel) {
        this.#model = model;
        this.#stop?.();
        this.#stop = effect(() => {
            void model.service.item.value;
            void model.service.connection.value;
            this.render();
        });
    }

    protected override handleConnect(): void {
        this.render();
    }

    protected override handleDisconnect(): void {
        this.#stop?.();
        this.#stop = null;
    }

    render(): void {
        const model = this.#model;
        if (!model) {
            return;
        }
        const state = model.service.item.value;
        const banner = connectionBanner({
            connection: model.service.connection.value,
            source: state.source,
            storedAt: state.staleAt,
        });
        const body = el('main', 'hn-main');
        body.append(this.#content(state, model));
        this.replaceChildren(page(null, banner, body));
    }

    /** Chooses the item body for the current load status. */
    #content(state: HnItemState, model: ItemModel): HTMLElement {
        if (state.status === 'loading' || state.status === 'idle') {
            return skeletonList();
        }
        if (state.status === 'error') {
            return errorState(state.error, () => model.service.retryItem(model.id));
        }
        const item = state.item;
        if (item === null) {
            return el('p', 'muted', `Item ${model.id} was not found (it may be deleted).`);
        }
        return this.#item(item, state);
    }

    /** Renders the item header, body, and comment tree. */
    #item(item: HnItem, state: HnItemState): HTMLElement {
        const wrapper = el('div', 'hn-item');

        const title = el('a', undefined, item.title ?? `Item ${item.id}`);
        const href = item.url ?? `#/item/${item.id}`;
        title.setAttribute('href', href);
        if (item.url) {
            title.setAttribute('rel', 'noopener noreferrer');
            title.setAttribute('target', '_blank');
        }
        const heading = el('h1');
        heading.append(title);
        const header = el('div', 'item-header');
        header.append(heading);
        wrapper.append(header);

        const domain = storyDomain(item.url);
        const meta = el('div', 'story-meta');
        meta.textContent = `${item.score ?? 0} points by ${item.by ?? 'unknown'} · ${formatItemAge(item.time)}${
            domain ? ` · ${domain}` : ''
        } · ${item.descendants ?? item.kids?.length ?? 0} comments`;
        wrapper.append(meta);

        if (item.text) {
            const text = el('div', 'item-text');
            text.append(...textParagraphs(item.text, 'item-paragraph'));
            wrapper.append(text);
        }

        wrapper.append(el('h2', 'comments-title', 'Comments'));
        if (state.commentsStatus === 'loading') {
            wrapper.append(el('p', 'muted', 'Loading comments…'));
        } else if (state.commentsStatus === 'error') {
            wrapper.append(el('p', 'error-state', state.commentsError ?? 'Could not load comments.'));
        } else if (state.comments.length === 0) {
            wrapper.append(el('p', 'muted', 'No comments yet.'));
        } else {
            wrapper.append(commentTree(state.comments), depthNote(COMMENT_MAX_DEPTH));
        }

        return wrapper;
    }
}
