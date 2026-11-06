/**
 * `conduit-home` — the home feed: your feed / global feed / tag tabs, the
 * popular-tags sidebar, the article list, and pagination.
 *
 * All feed *state* (which tab, which tag, which page, the loaded articles)
 * lives in `ArticleService`; this component only renders the model and emits
 * the intents, so switching a tab is a service call that re-renders through the
 * route — not local view state.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { create } from '../lib/dom';
import { articleList, navFor, pagination, tagSidebar, type ViewContext } from './shell';
import type { HomeModel } from './models';

@TagMapping('conduit-home')
export default class HomeView extends AbstractWebComponent {
    #model: HomeModel | null = null;

    set model(model: HomeModel) {
        this.#model = model;
        this.render();
    }

    protected override handleConnect(): void {
        this.render();
    }

    render(): void {
        const model = this.#model;
        if (!model) {
            return;
        }

        const ctx: ViewContext = { session: model.session, emit: (type, detail) => void this.emit(type, detail) };
        const body = create('div', {
            children: [
                create('h1', { className: 'page-title', text: 'Conduit' }),
                this.#tabs(model, ctx),
                ...(model.error === null ? [] : [create('p', { className: 'form-error', text: model.error })]),
                articleList(model.articles, ctx),
                pagination(model.page, model.pageCount, ctx),
            ],
        });

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, 'home'),
                    create('div', { className: 'layout', children: [body, tagSidebar(model.tags, model.tag, ctx)] }),
                ],
            })
        );
    }

    /**
     * Builds the feed tab strip: your feed (signed in only), the global feed,
     * and — when a tag filters the feed — a `#tag` tab.
     *
     * @param model - The page model.
     * @param ctx - The emitting context.
     * @returns The tab strip.
     */
    #tabs(model: HomeModel, ctx: ViewContext): HTMLElement {
        const tab = (label: string, selected: boolean, onClick: () => void): HTMLElement =>
            create('li', {
                children: [
                    create('button', {
                        className: selected ? 'selected' : undefined,
                        text: label,
                        on: { click: onClick },
                    }),
                ],
            });

        const items: Node[] = [];
        if (model.session.isAuthenticated) {
            items.push(tab('Your Feed', model.tab === 'feed', () => ctx.emit(ACTIONS.feedTab, { tab: 'feed' })));
        }
        items.push(
            tab('Global Feed', model.tab === 'global' && model.tag === null, () =>
                ctx.emit(ACTIONS.feedTab, { tab: 'global' })
            )
        );
        if (model.tag !== null) {
            items.push(tab(`#${model.tag}`, true, () => ctx.emit(ACTIONS.feedTag, { tag: null })));
        }

        return create('ul', { className: 'feed-toggle', children: items });
    }
}
