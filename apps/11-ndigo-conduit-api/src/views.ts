/**
 * View assembly: composes the store's favorite/follow indexes with the DTO
 * builders, so a page of articles costs three scans regardless of page size
 * and every endpoint serializes through one code path.
 */
import { IllegalStateError } from '@ndigo/core';
import type { Article, Comment, User } from './entities';
import { toArticle, toComment, type ArticleDTO, type CommentDTO } from './presenter';
import type { ConduitStore } from './store';

/**
 * Projects articles for one viewer (or anonymously), resolving authors and the
 * view-relative `favorited`/`favoritesCount`/`following` members.
 *
 * @param store - The persistence seam.
 * @param articles - The rows to project.
 * @param viewer - The requesting account, or `null` when anonymous.
 * @returns The article payloads.
 * @throws {IllegalStateError} When an article's author account is missing —
 *   accounts are never deleted, so this is a broken invariant, not a 404.
 */
export function articleViews(store: ConduitStore, articles: Article[], viewer: User | null): ArticleDTO[] {
    const counts = store.favoriteCounts();
    const followed = viewer ? store.followedIds(viewer.id) : new Set<number>();
    const favorited = viewer ? store.favoritedArticleIds(viewer.id) : new Set<number>();
    return articles.map((article) => {
        const author = store.findUserById(article.authorId);
        if (!author) {
            throw new IllegalStateError(`article "${article.slug}" has no author account`);
        }
        return toArticle(article, author, {
            following: followed.has(author.id),
            favorited: favorited.has(article.id),
            favoritesCount: counts.get(article.id) ?? 0,
        });
    });
}

/**
 * Projects comments for one viewer (or anonymously).
 *
 * @param store - The persistence seam.
 * @param comments - The rows to project.
 * @param viewer - The requesting account, or `null` when anonymous.
 * @returns The comment payloads.
 * @throws {IllegalStateError} When a comment's author account is missing.
 */
export function commentViews(store: ConduitStore, comments: Comment[], viewer: User | null): CommentDTO[] {
    const followed = viewer ? store.followedIds(viewer.id) : new Set<number>();
    return comments.map((comment) => {
        const author = store.findUserById(comment.authorId);
        if (!author) {
            throw new IllegalStateError(`comment ${comment.id} has no author account`);
        }
        return toComment(comment, author, followed.has(author.id));
    });
}
