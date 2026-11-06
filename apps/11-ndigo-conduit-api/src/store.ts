/**
 * The Conduit persistence seam.
 *
 * Every handler talks to {@link ConduitStore} — never to the entity manager
 * directly — so the domain operations (register, publish, favorite, follow,
 * comment, filter) are the swap point: moving to a SQL/Drizzle-backed
 * `EntityManager` or a different backend means re-implementing this one
 * class against the same method surface.
 *
 * The default backend is `@ndigo/orm`'s in-memory manager, so the app needs
 * no external infrastructure.
 */
import { InMemoryDataSource, InMemoryEntityManager, type EntityManager } from '@ndigo/orm';
import { Article, Comment, Favorite, Follow, User } from './entities';

/** The article-list filter contract (query parameters, already validated). */
export interface ArticleQuery {
    /** Only articles carrying this tag. */
    tag?: string;
    /** Only articles written by this username. */
    author?: string;
    /** Only articles favorited by this username. */
    favorited?: string;
}

/** A total count plus one page of rows. */
export interface Page<T> {
    /** The rows in this page. */
    items: T[];
    /** The total number of rows matching the query (before paging). */
    count: number;
}

/** Paging window applied after filtering. */
export interface Window {
    limit: number;
    offset: number;
}

/** The attribute patch accepted by {@link ConduitStore.updateArticle}. */
export interface ArticlePatch {
    slug?: string;
    title?: string;
    description?: string;
    body?: string;
    tagList?: string[];
}

/** The attribute patch accepted by {@link ConduitStore.updateUser}. */
export interface UserPatch {
    username?: string;
    email?: string;
    passwordHash?: string;
    bio?: string | null;
    image?: string | null;
}

/**
 * Builds the default in-memory `EntityManager` (data source initialised).
 *
 * @returns A ready in-memory entity manager.
 */
export function createInMemoryManager(): EntityManager {
    const dataSource = new InMemoryDataSource();
    dataSource.init();
    return new InMemoryEntityManager(dataSource);
}

/** Newest first: creation time descending, primary key descending on ties. */
function byNewest(left: Article, right: Article): number {
    if (left.createdAt === right.createdAt) {
        return right.id - left.id;
    }
    return left.createdAt < right.createdAt ? 1 : -1;
}

/** Domain operations over the Conduit entities. */
export class ConduitStore {
    readonly #manager: EntityManager;

    /**
     * Creates the store.
     *
     * @param manager - The entity manager to persist through (defaults to the
     *   in-memory manager, so the app boots with zero infrastructure).
     */
    constructor(manager: EntityManager = createInMemoryManager()) {
        this.#manager = manager;
    }

    // ---------------------------------------------------------------- users

    /**
     * Persists a new account row.
     *
     * @param input - The account's credential and profile fields.
     * @returns The persisted account (with its generated id).
     */
    createUser(input: { username: string; email: string; passwordHash: string }): User {
        const user = Object.assign(new User(), {
            username: input.username,
            email: input.email,
            passwordHash: input.passwordHash,
            bio: null,
            image: null,
        });
        this.#manager.persist(user);
        return user;
    }

    /**
     * Finds an account by primary key.
     *
     * @param id - The account id.
     * @returns The account, or `undefined`.
     */
    findUserById(id: number): User | undefined {
        return this.#manager.find(User, id);
    }

    /**
     * Finds an account by username (case-sensitive, per the spec's unique constraint).
     *
     * @param username - The username to match.
     * @returns The account, or `undefined`.
     */
    findUserByUsername(username: string): User | undefined {
        return this.#manager.findAll(User).find((user) => user.username === username);
    }

    /**
     * Finds an account by email.
     *
     * @param email - The email to match.
     * @returns The account, or `undefined`.
     */
    findUserByEmail(email: string): User | undefined {
        return this.#manager.findAll(User).find((user) => user.email === email);
    }

    /**
     * Applies an attribute patch to an account and persists it.
     *
     * @param user - The account to update.
     * @param patch - The fields to change (absent fields are left alone).
     * @returns The updated account.
     */
    updateUser(user: User, patch: UserPatch): User {
        for (const [key, value] of Object.entries(patch)) {
            if (value !== undefined) {
                Object.assign(user, { [key]: value });
            }
        }
        this.#manager.persist(user);
        return user;
    }

    // ------------------------------------------------------------- articles

    /**
     * Persists a new article row.
     *
     * @param input - The article's attributes and author.
     * @returns The persisted article (with its generated id).
     */
    createArticle(input: {
        slug: string;
        title: string;
        description: string;
        body: string;
        tagList: string[];
        authorId: number;
    }): Article {
        const article = Object.assign(new Article(), input);
        this.#manager.persist(article);
        return article;
    }

    /**
     * Finds an article by slug.
     *
     * @param slug - The article slug.
     * @returns The article, or `undefined`.
     */
    findArticleBySlug(slug: string): Article | undefined {
        return this.#manager.findAll(Article).find((article) => article.slug === slug);
    }

    /**
     * Finds an article by primary key.
     *
     * @param id - The article id.
     * @returns The article, or `undefined`.
     */
    findArticleById(id: number): Article | undefined {
        return this.#manager.find(Article, id);
    }

    /**
     * Whether a slug is already taken.
     *
     * @param slug - The candidate slug.
     * @returns `true` when an article already owns the slug.
     */
    slugTaken(slug: string): boolean {
        return this.findArticleBySlug(slug) !== undefined;
    }

    /**
     * Applies an attribute patch to an article and persists it (`updatedAt`
     * advances through the entity's `@preUpdate` hook).
     *
     * @param article - The article to update.
     * @param patch - The fields to change (absent fields are left alone).
     * @returns The updated article.
     */
    updateArticle(article: Article, patch: ArticlePatch): Article {
        for (const [key, value] of Object.entries(patch)) {
            if (value !== undefined) {
                Object.assign(article, { [key]: value });
            }
        }
        this.#manager.persist(article);
        return article;
    }

    /**
     * Deletes an article and cascades to its comments and favorites.
     *
     * @param article - The article to delete.
     */
    deleteArticle(article: Article): void {
        for (const favorite of this.#manager.findAll(Favorite)) {
            if (favorite.articleId === article.id) {
                this.#manager.remove(favorite);
            }
        }
        for (const comment of this.#manager.findAll(Comment)) {
            if (comment.articleId === article.id) {
                this.#manager.remove(comment);
            }
        }
        this.#manager.remove(article);
    }

    /**
     * Lists articles matching the tag/author/favorited filters, newest first.
     *
     * An unknown `author`/`favorited` username matches nothing (only real
     * accounts can own or favorite an article), which is the spec's behavior.
     *
     * @param query - The optional tag/author/favorited filter.
     * @param window - The limit/offset paging window.
     * @returns One page plus the total match count.
     */
    listArticles(query: ArticleQuery, window: Window): Page<Article> {
        let articles = this.#manager.findAll(Article);

        if (query.author !== undefined) {
            const author = this.findUserByUsername(query.author);
            articles = author ? articles.filter((article) => article.authorId === author.id) : [];
        }
        if (query.favorited !== undefined) {
            const reader = this.findUserByUsername(query.favorited);
            const favorited = reader ? this.favoritedArticleIds(reader.id) : new Set<number>();
            articles = articles.filter((article) => favorited.has(article.id));
        }
        if (query.tag !== undefined) {
            const tag = query.tag;
            articles = articles.filter((article) => article.tagList.includes(tag));
        }

        articles = [...articles].sort(byNewest);
        return { items: articles.slice(window.offset, window.offset + window.limit), count: articles.length };
    }

    /**
     * Lists articles written by the accounts `userId` follows, newest first.
     *
     * @param userId - The reader whose follow graph is the feed.
     * @param window - The limit/offset paging window.
     * @returns One page plus the total match count.
     */
    feed(userId: number, window: Window): Page<Article> {
        const followed = this.followedIds(userId);
        const articles = this.#manager
            .findAll(Article)
            .filter((article) => followed.has(article.authorId))
            .sort(byNewest);
        return { items: articles.slice(window.offset, window.offset + window.limit), count: articles.length };
    }

    // ------------------------------------------------------------ favorites

    /**
     * Favorites an article on behalf of an account. Idempotent: a second call
     * is a no-op, so the response's `favoritesCount` cannot drift.
     *
     * @param userId - The reader favorite-ing.
     * @param articleId - The favorited article.
     */
    favorite(userId: number, articleId: number): void {
        if (this.isFavorited(userId, articleId)) {
            return;
        }
        this.#manager.persist(Object.assign(new Favorite(), { userId, articleId }));
    }

    /**
     * Removes a favorite. Idempotent, mirroring {@link ConduitStore.favorite}.
     *
     * @param userId - The reader un-favorite-ing.
     * @param articleId - The article to un-favorite.
     */
    unfavorite(userId: number, articleId: number): void {
        const favorite = this.#manager
            .findAll(Favorite)
            .find((row) => row.userId === userId && row.articleId === articleId);
        if (favorite) {
            this.#manager.remove(favorite);
        }
    }

    /**
     * Whether an account has favorited an article.
     *
     * @param userId - The reader.
     * @param articleId - The article.
     * @returns `true` when the favorite row exists.
     */
    isFavorited(userId: number, articleId: number): boolean {
        return this.#manager.findAll(Favorite).some((row) => row.userId === userId && row.articleId === articleId);
    }

    /**
     * The article ids an account has favorited (one scan, for list rendering).
     *
     * @param userId - The reader.
     * @returns The favorited article ids.
     */
    favoritedArticleIds(userId: number): Set<number> {
        return new Set(
            this.#manager
                .findAll(Favorite)
                .filter((row) => row.userId === userId)
                .map((row) => row.articleId)
        );
    }

    /**
     * Favorites-per-article counts in one scan — the list serializer's
     * `favoritesCount` source.
     *
     * @returns A map of article id to favorite count.
     */
    favoriteCounts(): Map<number, number> {
        const counts = new Map<number, number>();
        for (const row of this.#manager.findAll(Favorite)) {
            counts.set(row.articleId, (counts.get(row.articleId) ?? 0) + 1);
        }
        return counts;
    }

    // -------------------------------------------------------------- follows

    /**
     * Follows an account. Idempotent.
     *
     * @param followerId - The account doing the following.
     * @param followingId - The account being followed.
     */
    follow(followerId: number, followingId: number): void {
        if (this.isFollowing(followerId, followingId)) {
            return;
        }
        this.#manager.persist(Object.assign(new Follow(), { followerId, followingId }));
    }

    /**
     * Unfollows an account. Idempotent.
     *
     * @param followerId - The account doing the unfollowing.
     * @param followingId - The account being unfollowed.
     */
    unfollow(followerId: number, followingId: number): void {
        const follow = this.#manager
            .findAll(Follow)
            .find((row) => row.followerId === followerId && row.followingId === followingId);
        if (follow) {
            this.#manager.remove(follow);
        }
    }

    /**
     * Whether `followerId` follows `followingId`.
     *
     * @param followerId - The follower.
     * @param followingId - The followee.
     * @returns `true` when the follow row exists.
     */
    isFollowing(followerId: number, followingId: number): boolean {
        return this.#manager
            .findAll(Follow)
            .some((row) => row.followerId === followerId && row.followingId === followingId);
    }

    /**
     * The account ids `followerId` follows (one scan, for the feed and for
     * profile rendering).
     *
     * @param followerId - The follower.
     * @returns The followed account ids.
     */
    followedIds(followerId: number): Set<number> {
        return new Set(
            this.#manager
                .findAll(Follow)
                .filter((row) => row.followerId === followerId)
                .map((row) => row.followingId)
        );
    }

    // ------------------------------------------------------------- comments

    /**
     * Persists a new comment.
     *
     * @param input - The comment body and its article/author.
     * @returns The persisted comment.
     */
    createComment(input: { body: string; articleId: number; authorId: number }): Comment {
        const comment = Object.assign(new Comment(), input);
        this.#manager.persist(comment);
        return comment;
    }

    /**
     * Finds a comment by primary key.
     *
     * @param id - The comment id.
     * @returns The comment, or `undefined`.
     */
    findComment(id: number): Comment | undefined {
        return this.#manager.find(Comment, id);
    }

    /**
     * Lists an article's comments, oldest first.
     *
     * @param articleId - The commented article.
     * @returns The comments.
     */
    commentsFor(articleId: number): Comment[] {
        return this.#manager
            .findAll(Comment)
            .filter((comment) => comment.articleId === articleId)
            .sort((left, right) =>
                left.createdAt === right.createdAt ? left.id - right.id : left.createdAt < right.createdAt ? -1 : 1
            );
    }

    /**
     * Deletes a comment.
     *
     * @param comment - The comment to delete.
     */
    deleteComment(comment: Comment): void {
        this.#manager.remove(comment);
    }

    // ----------------------------------------------------------------- tags

    /**
     * Every tag in use, deduplicated and sorted — deterministic output the
     * spec leaves open (the reference implementations return insertion order).
     *
     * @returns The sorted tag list.
     */
    tags(): string[] {
        const tags = new Set<string>();
        for (const article of this.#manager.findAll(Article)) {
            for (const tag of article.tagList) {
                tags.add(tag);
            }
        }
        return [...tags].sort();
    }
}
