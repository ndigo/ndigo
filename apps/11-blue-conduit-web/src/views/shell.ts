/**
 * Shared view fragments: the nav, pagination, tag lists, article lists, and the
 * form-level error rendering.
 *
 * These are plain builders rather than components because they are composed
 * *inside* a page component's render pass: the page owns the model and its
 * `emit`, and passes both down through {@link ViewContext}. Nothing here
 * touches the container or fetches anything.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ACTIONS } from '../app/conduit-events';
import { create, link } from '../lib/dom';
import type { ConduitArticleSummary, ConduitErrors } from '../lib/api/conduit-types';
import type { ConduitSessionModel } from '../services';
import type { ConduitNavElement, NavSection } from './conduit-nav';
import './conduit-nav';
import { articlePreview } from './article-byline';

/** What every page passes down to the shared fragments. */
export interface ViewContext {
    session: ConduitSessionModel;
    emit: (type: string, detail?: unknown) => void;
}

/**
 * Builds the header for a page.
 *
 * @param session - The session slice of the model.
 * @param active - The nav entry to mark current.
 * @returns The `conduit-nav` element with its model already applied.
 */
export function navFor(session: ConduitSessionModel, active: NavSection): ConduitNavElement {
    const nav = document.createElement('conduit-nav') as ConduitNavElement;
    nav.model = { session, active };
    return nav;
}

/**
 * A muted line of text (empty-state and hint copy).
 *
 * @param text - The message.
 * @returns The paragraph element.
 */
export function muted(text: string): HTMLElement {
    return create('p', { className: 'muted', text });
}

/**
 * The form-level messages of an envelope — the keys that are *not* rendered
 * under a specific field (`credentials`, `body`, `token`, and anything the API
 * adds later). Field-scoped keys are dropped so their message is not shown
 * twice.
 *
 * @param errors - The RealWorld envelope, if any.
 * @param fieldKeys - The keys already rendered under a field.
 * @returns The list element, or `null` when nothing is left.
 */
export function formErrors(errors: ConduitErrors | null, fieldKeys: readonly string[]): HTMLElement | null {
    if (!errors) {
        return null;
    }
    const messages = Object.entries(errors)
        .filter(([key]) => !fieldKeys.includes(key))
        .flatMap(([key, values]) => values.map((value) => `${key} ${value}`));
    if (messages.length === 0) {
        return null;
    }
    return create('ul', { className: 'errors', children: messages.map((message) => create('li', { text: message })) });
}

/**
 * Builds the numbered pagination control.
 *
 * @param page - The current 1-based page.
 * @param pageCount - The number of pages.
 * @param ctx - The emitting context.
 * @param action - The action to emit with the selected page.
 * @returns The pagination element, or `null` for a single page.
 */
export function pagination(
    page: number,
    pageCount: number,
    ctx: ViewContext,
    action: string = ACTIONS.feedPage
): HTMLElement | null {
    if (pageCount <= 1) {
        return null;
    }
    const items: Node[] = [];
    for (let index = 1; index <= pageCount; index += 1) {
        items.push(
            create('li', {
                children: [
                    create('button', {
                        className: index === page ? 'selected' : undefined,
                        text: String(index),
                        on: { click: () => ctx.emit(action, { page: index }) },
                    }),
                ],
            })
        );
    }
    return create('ul', { className: 'pagination', children: items });
}

/**
 * Builds the popular-tags sidebar, marking the selected tag.
 *
 * @param tags - The popular tags.
 * @param selected - The tag currently filtering the feed.
 * @param ctx - The emitting context.
 * @returns The sidebar element (or a hint when no tags exist yet).
 */
export function tagSidebar(tags: string[], selected: string | null, ctx: ViewContext): HTMLElement {
    const items: Node[] = tags.map((tag) =>
        create('li', {
            children: [
                create('button', {
                    className: tag === selected ? 'selected' : undefined,
                    text: tag,
                    on: { click: () => ctx.emit(ACTIONS.feedTag, { tag: tag === selected ? null : tag }) },
                }),
            ],
        })
    );
    return create('aside', {
        className: 'sidebar',
        children: [
            create('h3', { text: 'Popular tags' }),
            ...(items.length > 0
                ? [create('ul', { className: 'tag-list', children: items })]
                : [muted('No tags yet.')]),
        ],
    });
}

/**
 * Renders the read-only tag chips of an article.
 *
 * @param tags - The article's tags.
 * @returns The chip list.
 */
export function tagChips(tags: string[]): HTMLElement {
    return create('ul', {
        className: 'tag-list',
        children: tags.map((tag) =>
            create('li', {
                children: [create('button', { className: 'static', text: tag, attrs: { disabled: true } })],
            })
        ),
    });
}

/**
 * Renders a list of article previews.
 *
 * @param articles - The page's articles.
 * @param ctx - The emitting context.
 * @returns The list wrapper, or a muted empty-state line.
 */
export function articleList(articles: ConduitArticleSummary[], ctx: ViewContext): HTMLElement {
    if (articles.length === 0) {
        return muted('No articles are here… yet.');
    }
    return create('div', {
        className: 'article-list',
        children: articles.map((article) => articlePreview(article, ctx)),
    });
}

/**
 * The banner RealWorld shows on an article page: title, by-line, body, tags.
 *
 * @param title - The article title.
 * @param byline - The rendered by-line.
 * @param body - The rendered (already sanitized) body.
 * @param tags - The article's tags.
 * @returns The banner element.
 */
export function articleBanner(title: string, byline: Node, body: Node, tags: string[]): HTMLElement {
    return create('div', {
        className: 'article-body',
        children: [create('h1', { className: 'page-title', text: title }), byline, body, tagChips(tags)],
    });
}

/**
 * A call-to-action pair for a not-found page.
 *
 * @param message - The message to show.
 * @returns The block with a link home.
 */
export function notFound(message: string): HTMLElement {
    return create('div', {
        className: 'card',
        children: [create('p', { className: 'form-error', text: message }), link('#/', 'Back to the home feed')],
    });
}
