/**
 * `hn-list` — the feed page: nav tabs, the connection banner, and the story
 * list with skeleton rows, incremental rendering, and an error/retry state.
 *
 * The component owns no state: `model.service` carries the live signals, and a
 * single `effect` re-renders it whenever the feed or connectivity changes. That
 * is what makes hydration, a stale→fresh revalidation, and "load more" all
 * appear in place.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { effect } from '@blue/signals';
import { AbstractWebComponent, TagMapping } from '@blue/view-webcomponent';
import type { HnFeedState } from '../services/hn-service';
import type { HnService } from '../services/hn-service';
import type { ListModel } from './models';
import { connectionBanner, el, errorState, failedRow, page, skeletonList, skeletonRow, storyRow } from './chrome';

@TagMapping('hn-list')
export default class HnListView extends AbstractWebComponent {
    #model: ListModel | null = null;
    #stop: (() => void) | null = null;
    #observer: IntersectionObserver | null = null;

    set model(model: ListModel) {
        this.#model = model;
        this.#stop?.();
        this.#stop = effect(() => {
            void model.service.feed.value;
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
        this.#observer?.disconnect();
        this.#observer = null;
    }

    render(): void {
        const model = this.#model;
        if (!model) {
            return;
        }
        const state = model.service.feed.value;
        const banner = connectionBanner({
            connection: model.service.connection.value,
            source: state.source,
            storedAt: state.staleAt,
        });
        const body = el('main', 'hn-main');
        body.append(el('h1', 'page-title', `${model.label} stories`));

        if (state.status === 'idle' || state.status === 'loading') {
            body.append(skeletonList());
        } else if (state.status === 'error') {
            body.append(errorState(state.error, () => model.service.retryFeed(model.feed)));
        } else {
            body.append(this.#storyList(state, model.service));
        }

        this.replaceChildren(page(model.feed, banner, body));
        this.#observeSentinel();
    }

    /** Builds the hydrated/skeleton story list plus its load-more footer. */
    #storyList(state: HnFeedState, service: HnService): HTMLElement {
        const list = el('ol', 'story-list');
        const limit = Math.min(state.visible, state.ids.length);
        for (let index = 0; index < limit; index += 1) {
            const item = state.items[index];
            if (item === undefined) {
                list.append(skeletonRow());
            } else if (item === null) {
                list.append(failedRow(index + 1));
            } else {
                list.append(storyRow(item, index + 1));
            }
        }

        const footer = el('div', 'list-footer');
        const remaining = Math.max(0, state.ids.length - limit);
        if (remaining > 0) {
            footer.append(el('span', undefined, `${state.ids.length} ids loaded · showing ${limit}`));
            const more = el('button', undefined, `Load ${Math.min(remaining, 20)} more`);
            more.addEventListener('click', () => service.growVisible());
            footer.append(more);
        } else {
            footer.append(el('span', undefined, `${state.ids.length} ids loaded · end of list`));
        }

        const wrapper = el('div');
        wrapper.append(list, footer, el('div', 'load-sentinel'));
        return wrapper;
    }

    /** Observes the sentinel so scrolling grows the render window (real DOM). */
    #observeSentinel(): void {
        if (typeof IntersectionObserver === 'undefined') {
            return;
        }
        const sentinel = this.querySelector('.load-sentinel');
        if (!(sentinel instanceof HTMLElement)) {
            return;
        }
        this.#observer?.disconnect();
        this.#observer ??= new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    this.#model?.service.growVisible();
                }
            },
            { rootMargin: '240px' }
        );
        this.#observer.observe(sentinel);
    }
}
