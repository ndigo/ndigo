/**
 * `/api/articles/:slug/comments` — list, create and delete an article's
 * comments.
 *
 * Reading is optional-auth (the spec's "Auth is optional"); creating and
 * deleting require a caller. Deleting is author-only and scoped to the named
 * article: a comment id that belongs to a *different* article is a `404`, not
 * a `403` — the resource named by the URL does not exist.
 *
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
    requestMapping,
    validatedBody,
} from '@ndigo/dispatcher';
import { ResponseEntity } from '@ndigo/platform-node';
import { optionalUser, requireUser, type ConduitAuth } from './auth';
import { forbidden, notFound } from './errors';
import { newCommentSchema, type NewCommentBody } from './schemas';
import type { ConduitStore } from './store';
import { commentViews } from './views';

/** The comments controller. */
@requestMapping('/api/articles')
export class CommentController {
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
     * `GET /api/articles/:slug/comments` — the article's comments, oldest first.
     *
     * @param slug - The article slug.
     * @param token - The `Authorization` header value.
     * @returns `200 {comments}`, `401`, or `404`.
     */
    @getMapping('/:slug/comments')
    @parameters({ slug: pathVariable('slug'), token: headerValue('authorization') })
    async list(slug: string, token: string | undefined) {
        const caller = await optionalUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        return { comments: commentViews(this.#store, this.#store.commentsFor(article.id), caller.user) };
    }

    /**
     * `POST /api/articles/:slug/comments` — comments on an article.
     *
     * @param slug - The article slug.
     * @param body - The validated `{comment}` payload.
     * @param token - The `Authorization` header value.
     * @returns `201 {comment}`, `401`, or `404`.
     */
    @postMapping('/:slug/comments')
    @parameters({
        slug: pathVariable('slug'),
        body: validatedBody(newCommentSchema),
        token: headerValue('authorization'),
    })
    async create(slug: string, body: NewCommentBody, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        const comment = this.#store.createComment({
            body: body.comment.body,
            articleId: article.id,
            authorId: caller.user.id,
        });
        return ResponseEntity.created({ comment: commentViews(this.#store, [comment], caller.user)[0] });
    }

    /**
     * `DELETE /api/articles/:slug/comments/:id` — author-only delete.
     *
     * @param slug - The article slug.
     * @param id - The comment id from the path.
     * @param token - The `Authorization` header value.
     * @returns `204`, `401`, `403`, or `404`.
     */
    @deleteMapping('/:slug/comments/:id')
    @parameters({ slug: pathVariable('slug'), id: pathVariable('id'), token: headerValue('authorization') })
    async remove(slug: string, id: string, token: string | undefined) {
        const caller = await requireUser(this.#store, this.#auth, token);
        if (!caller.ok) {
            return caller.response;
        }
        const article = this.#store.findArticleBySlug(slug);
        if (!article) {
            return notFound('article');
        }
        const commentId = Number(id);
        const comment = Number.isInteger(commentId) ? this.#store.findComment(commentId) : undefined;
        if (!comment || comment.articleId !== article.id) {
            return notFound('comment');
        }
        if (comment.authorId !== caller.user.id) {
            return forbidden('comment');
        }
        this.#store.deleteComment(comment);
        return ResponseEntity.noContent();
    }
}
