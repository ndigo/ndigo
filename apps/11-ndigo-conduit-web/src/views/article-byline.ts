/**
 * Article by-line and preview fragments.
 *
 * Both are shared by the home feed, the profile page and the article page, so
 * the follow/favorite controls behave identically everywhere. Ownership is read
 * from the session: the follow button is not rendered on your own by-line, and
 * the article page adds edit/delete only when you are the author (the API
 * enforces both regardless — the UI just does not offer what would be refused).
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ACTIONS } from '../app/conduit-events';
import { avatar, create, link } from '../lib/dom';
import { formatDate } from '../lib/format';
import type { ConduitArticleSummary, ConduitProfile } from '../lib/api/conduit-types';
import type { ViewContext } from './shell';

/** Options for {@link byline}. */
export interface BylineOptions {
    /** Whether to render the follow control (the profile header renders its own). */
    follow?: boolean;
    /** Extra controls appended after the favorite button (edit/delete, on the article page). */
    extra?: Node[];
}

/**
 * Builds the favorite toggle.
 *
 * @param article - The article the control acts on.
 * @param ctx - The emitting context.
 * @returns The button.
 */
function favoriteButton(
    article: { slug: string; favorited: boolean; favoritesCount: number },
    ctx: ViewContext
): HTMLElement {
    return create('button', {
        className: article.favorited ? 'favorite on' : 'favorite',
        text: `${article.favorited ? 'Unfavorite' : 'Favorite'} (${article.favoritesCount})`,
        on: { click: () => ctx.emit(ACTIONS.articleFavorite, { slug: article.slug, favorited: !article.favorited }) },
    });
}

/**
 * Builds the follow toggle, or `null` when the author is the visitor.
 *
 * @param author - The article's author.
 * @param ctx - The emitting context.
 * @returns The button, or `null`.
 */
export function followButton(author: ConduitProfile, ctx: ViewContext): HTMLElement | null {
    if (!ctx.session.isAuthenticated || ctx.session.user?.username === author.username) {
        return null;
    }
    return create('button', {
        className: author.following ? 'follow on' : 'follow',
        text: author.following ? 'Unfollow' : 'Follow',
        on: {
            click: () => ctx.emit(ACTIONS.authorFollow, { username: author.username, following: !author.following }),
        },
    });
}

/**
 * Builds an article's by-line: author, date, and the follow/favorite controls.
 *
 * @param article - The article (or summary) the by-line describes.
 * @param ctx - The emitting context.
 * @param options - Follow rendering and extra controls.
 * @returns The by-line element.
 */
export function byline(
    article: { slug: string; createdAt: string; favorited: boolean; favoritesCount: number; author: ConduitProfile },
    ctx: ViewContext,
    options: BylineOptions = {}
): HTMLElement {
    const follow = options.follow === false ? null : followButton(article.author, ctx);
    return create('div', {
        className: 'article-meta',
        children: [
            avatar(article.author.image, article.author.username),
            link(`#/profile/${article.author.username}`, article.author.username, 'author'),
            create('span', { text: formatDate(article.createdAt) }),
            create('span', { className: 'spacer' }),
            follow,
            favoriteButton(article, ctx),
            ...(options.extra ?? []),
        ],
    });
}

/**
 * Builds one feed entry: by-line, title link, description.
 *
 * @param article - The article summary from a list response.
 * @param ctx - The emitting context.
 * @returns The preview element.
 */
export function articlePreview(article: ConduitArticleSummary, ctx: ViewContext): HTMLElement {
    return create('article', {
        className: 'article-preview',
        children: [
            byline(article, ctx),
            create('h2', {
                children: [link(`#/article/${article.slug}`, article.title)],
            }),
            create('p', { text: article.description }),
            create('p', { className: 'muted', text: article.tagList.join(' · ') }),
        ],
    });
}

/**
 * Renders an already-sanitized article body into the page.
 *
 * The body is the one place user text becomes markup; the HTML arrives from
 * `renderMarkdown`, which escapes by default and emits only its own tags — this
 * helper deliberately does not touch the string.
 *
 * @param html - The sanitized HTML from `renderMarkdown`.
 * @returns The body element.
 */
export function articleBody(html: string): HTMLElement {
    const body = create('div', { className: 'article-text' });
    body.innerHTML = html;
    return body;
}
