/**
 * `/api/articles` — the collection, the followed-authors feed, single-article
 * CRUD and the favorite sub-resource.
 *
 * Filtering/paging is bound through `validatedQuery`, so a malformed
 * `limit`/`offset` never reaches a handler (it answers the RealWorld `422`
 * envelope). Ownership is checked in-handler: only the author may update or
 * delete, and a non-author gets `403` — distinct from the `404` an unknown
 * slug produces.
 *
 * @module ndigo-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    deleteMapping,
    getMapping,
    headerValue,
    parameters,
    pathVariable,
    postMapping,
    putMapping,
    requestMapping,
    validatedBody,
    validatedQuery,
} from '@ndigo/dispatcher';
import { ResponseEntity } from '@ndigo/platform-node';
import { optionalUser, requireUser, type ConduitAuth } from './auth';
import { forbidden, notFound } from './errors';
import { toArticleSummary, uniqueSlug } from './presenter';
import {
    articleFilterSchema,
    feedFilterSchema,
    newArticleSchema,
    updateArticleSchema,
    type ArticleFilter,
    type FeedFilter,
    type NewArticleBody,
    type UpdateArticleBody,
} from './schemas';
import type { ArticlePatch, ConduitStore } from './store';
import { articleViews } from './views';

/** The articles controller. */
@requestMapping('/api/articles')
export class ArticleController {
    readonly #store: ConduitStore;
    readonly #auth: ConduitAuth;

    /**
     * Creates the controller.
     *
     * @param store - The persistence seam.
     * @param auth - The JWT component.
     */
    constructor(store: ConduitStore, auth: ConduitAuth) {
        this.#store = store;
        this.#auth = auth;
    }

    /**
     * `GET /api/articles/feed` — articles by the accounts the caller follows.
     *
     * @param filter - The validated `limit`/`offset` window.
     * @param token - The `Authorization` header value.
     * @returns `200 {articles, articlesCount}` or `401`.
     */
    @getMapping('/feed')
    @parameters({ filter: validatedQuery(feedFilterSchema), token: headerValue('authorization') })
    async feed(filter: FeedFilter, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const page = this.#store.feed(caller.user.id, filter);
        return {
            articles: articleViews(this.#store, page.items, caller.user).map(toArticleSummary),
            articlesCount: page.count,
        };
    }

    /**
     * `GET /api/articles` — the global, filterable list.
     *
     * @param filter - The validated tag/author/favorited filters and paging.
     * @param token - The `Authorization` header value.
     * @returns `200 {articles, articlesCount}` or `401`.
     */
    @getMapping('/')
    @parameters({ filter: validatedQuery(articleFilterSchema), token: headerValue('authorization') })
    async list(filter: ArticleFilter, token: string | undefined) {
        const caller = await optionalUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const page = this.#store.listArticles(
            { tag: filter.tag, author: filter.author, favorited: filter.favorited },
            filter
        );
        return {
            articles: articleViews(this.#store, page.items, caller.user).map(toArticleSummary),
            articlesCount: page.count,
        };
    }

    /**
     * `POST /api/articles` — publishes an article under a unique slug.
     *
     * @param body - The validated `{article}` payload.
     * @param token - The `Authorization` header value.
     * @returns `201 {article}` or `401`.
     */
    @postMapping('/')
    @parameters({ body: validatedBody(newArticleSchema), token: headerValue('authorization') })
    async create(body: NewArticleBody, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const { title, description, body: text, tagList } = body.article;
        const article = this.#store.createArticle({
            slug: uniqueSlug(title, (candidate) => this.#store.slugTaken(candidate)),
            title,
            description,
            body: text,
            tagList: tagList ?? [],
            authorId: caller.user.id,
        });
        return ResponseEntity.created({ article: articleViews(this.#store, [article], caller.user)[0] });
    }

    /**
     * `GET /api/articles/:slug` — one article.
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @returns `200 {article}`, `401`, or `404`.
     */
    @getMapping('/:slug')
    @parameters({ slug: pathVariable('slug'), token: headerValue('authorization') })
    async single(slug: string, token: string | undefined) {
        const caller = await optionalUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        return { article: articleViews(this.#store, [article], caller.user)[0] };
    }

    /**
     * `PUT /api/articles/:slug` — author-only update. A changed title
     * re-derives the slug (still unique), so links follow the title.
     *
     * @param slug - The article slug.
     * @param body - The validated `{article}` patch.
     * @param token - The `Authorization` header value.
     * @returns `200 {article}`, `401`, `403`, or `404`.
     */
    @putMapping('/:slug')
    @parameters({
        slug: pathVariable('slug'),
        body: validatedBody(updateArticleSchema),
        token: headerValue('authorization'),
    })
    async update(slug: string, body: UpdateArticleBody, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        if (article.authorId !== caller.user.id) {
            return forbidden('article');
        }
        const { title, description, body: text, tagList } = body.article;
        const patch: ArticlePatch = { description, body: text, tagList };
        if (title !== undefined) {
            patch.title = title;
            // This article owns its current slug: excluding it keeps an
            // unchanged title from colliding with itself.
            patch.slug = uniqueSlug(
                title,
                (candidate) => candidate !== article.slug && this.#store.slugTaken(candidate)
            );
        }
        const updated = this.#store.updateArticle(article, patch);
        return { article: articleViews(this.#store, [updated], caller.user)[0] };
    }

    /**
     * `DELETE /api/articles/:slug` — author-only delete, cascading to the
     * article's comments and favorites.
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @returns `204`, `401`, `403`, or `404`.
     */
    @deleteMapping('/:slug')
    @parameters({ slug: pathVariable('slug'), token: headerValue('authorization') })
    async remove(slug: string, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        if (article.authorId !== caller.user.id) {
            return forbidden('article');
        }
        this.#store.deleteArticle(article);
        return ResponseEntity.noContent();
    }

    /**
     * `POST /api/articles/:slug/favorite` — favorites (idempotent).
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @returns `200 {article}`, `401`, or `404`.
     */
    @postMapping('/:slug/favorite')
    @parameters({ slug: pathVariable('slug'), token: headerValue('authorization') })
    async favorite(slug: string, token: string | undefined) {
        return this.changeFavorite(slug, token, true);
    }

    /**
     * `DELETE /api/articles/:slug/favorite` — unfavorites (idempotent).
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @returns `200 {article}`, `401`, or `404`.
     */
    @deleteMapping('/:slug/favorite')
    @parameters({ slug: pathVariable('slug'), token: headerValue('authorization') })
    async unfavorite(slug: string, token: string | undefined) {
        return this.changeFavorite(slug, token, false);
    }

    /**
     * Shared favorite/unfavorite body: resolve the caller, find the article,
     * apply the idempotent edge, answer with the article as the caller now
     * sees it.
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @param favorited - Whether the edge should exist after the call.
     * @returns `200 {article}`, `401`, or `404`.
     */
    private async changeFavorite(slug: string, token: string | undefined, favorited: boolean) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        if (favorited) {
            this.#store.favorite(caller.user.id, article.id);
        } else {
            this.#store.unfavorite(caller.user.id, article.id);
        }
        return { article: articleViews(this.#store, [article], caller.user)[0] };
    }
}
