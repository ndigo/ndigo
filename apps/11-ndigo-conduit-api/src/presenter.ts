/**
 * Wire DTOs for the Conduit API — the exact RealWorld payload shapes.
 *
 * Entities never reach the wire: every handler serializes through these
 * builders, which project the entity columns onto the spec's members
 * (`favorited`, `favoritesCount`, `following` are view-relative and are
 * supplied by the caller from the store's indexes).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Article, Comment, User } from './entities';

/** A profile as it appears in article/comment authors and `/api/profiles/:username`. */
export interface ProfileDTO {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

/** The authenticated account payload (`{user: …}`). */
export interface UserDTO {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
}

/** An article as it appears in list and single-article responses. */
export interface ArticleDTO {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: ProfileDTO;
}

/**
 * An article as it appears in **list** responses. The spec's
 * `MultipleArticlesResponse` items carry no `body` — only the single-article
 * response does — and the official collection asserts its absence.
 */
export type ArticleSummaryDTO = Omit<ArticleDTO, 'body'>;

/** A comment as it appears in comment responses. */
export interface CommentDTO {
    id: number;
    createdAt: string;
    updatedAt: string;
    body: string;
    author: ProfileDTO;
}

/**
 * Derives a RealWorld slug from a title: lowercase, non-alphanumerics
 * collapsed to single hyphens, leading/trailing hyphens dropped.
 *
 * @param title - The article title.
 * @returns The slug, or `article` when the title holds no slug-able characters.
 */
export function slugify(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug.length > 0 ? slug : 'article';
}

/**
 * Resolves a unique slug for a title: the plain slug when free, otherwise the
 * first free `-<n>` suffix. Uniqueness is per-article, so two authors can
 * publish the same title.
 *
 * @param title - The article title.
 * @param isTaken - Predicate over candidate slugs.
 * @returns A slug no article currently owns.
 */
export function uniqueSlug(title: string, isTaken: (slug: string) => boolean): string {
    const base = slugify(title);
    if (!isTaken(base)) {
        return base;
    }
    let suffix = 1;
    while (isTaken(`${base}-${suffix}`)) {
        suffix += 1;
    }
    return `${base}-${suffix}`;
}

/**
 * Projects an account onto a profile.
 *
 * @param user - The account.
 * @param following - Whether the viewer follows this account.
 * @returns The profile payload.
 */
export function toProfile(user: User, following: boolean): ProfileDTO {
    return { username: user.username, bio: user.bio, image: user.image, following };
}

/**
 * Projects an account onto the authenticated `{user}` payload.
 *
 * @param user - The account.
 * @param token - The JWT to hand back to the client.
 * @returns The user payload.
 */
export function toUser(user: User, token: string): UserDTO {
    return { email: user.email, token, username: user.username, bio: user.bio, image: user.image };
}

/**
 * Projects an article onto the wire shape.
 *
 * @param article - The article row.
 * @param author - The article's author account.
 * @param view - The view-relative members (viewer's favorite, count, follow).
 * @returns The article payload.
 */
export function toArticle(
    article: Article,
    author: User,
    view: { following: boolean; favorited: boolean; favoritesCount: number }
): ArticleDTO {
    return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: view.favorited,
        favoritesCount: view.favoritesCount,
        author: toProfile(author, view.following),
    };
}

/**
 * Projects a full article onto the list-item shape, dropping the `body` the
 * list schema does not carry.
 *
 * @param article - The full article payload.
 * @returns The list-item payload.
 */
export function toArticleSummary(article: ArticleDTO): ArticleSummaryDTO {
    const { body: _body, ...summary } = article;
    return summary;
}

/**
 * Projects a comment onto the wire shape.
 *
 * @param comment - The comment row.
 * @param author - The comment's author account.
 * @param following - Whether the viewer follows the author.
 * @returns The comment payload.
 */
export function toComment(comment: Comment, author: User, following: boolean): CommentDTO {
    return {
        id: comment.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body,
        author: toProfile(author, following),
    };
}
