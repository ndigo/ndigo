/**
 * `conduit-article` — one article: body, author controls, and its comments.
 *
 * The body is Markdown, rendered by this app's own escaping-by-default
 * renderer (`renderMarkdown`) — the only place user text becomes markup. The
 * by-line carries the follow/favorite controls plus, when the visitor is the
 * author, the edit link and delete button (the API enforces ownership either
 * way). The comment box renders the `422` envelope under the textarea; the
 * delete control appears only on the visitor's own comments.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { avatar, create, link, textField } from '../lib/dom';
import { formatDate } from '../lib/format';
import { renderMarkdown } from '../lib/markdown';
import type { ConduitComment } from '../lib/api/conduit-types';
import { articleBody, byline } from './article-byline';
import { formErrors, navFor, notFound, tagChips, type ViewContext } from './shell';
import type { ArticleModel } from './models';

@TagMapping('conduit-article')
export default class ArticleView extends AbstractWebComponent {
    #model: ArticleModel | null = null;
    #commentDraft = '';

    set model(model: ArticleModel) {
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

        if (!model.article) {
            this.replaceChildren(
                create('div', {
                    children: [
                        navFor(model.session, 'article'),
                        notFound(
                            model.notFound
                                ? 'That article does not exist (it may have been deleted or retitled).'
                                : 'The article could not be loaded.'
                        ),
                    ],
                })
            );
            return;
        }

        const article = model.article;
        const isAuthor = model.session.user?.username === article.author.username;
        const authorControls: Node[] = isAuthor
            ? [
                  link(`#/editor/${article.slug}`, 'Edit article'),
                  create('button', {
                      className: 'danger',
                      text: 'Delete article',
                      on: { click: () => ctx.emit(ACTIONS.articleDelete, { slug: article.slug }) },
                  }),
              ]
            : [];

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, 'article'),
                    create('h1', { className: 'page-title', text: article.title }),
                    create('p', { className: 'muted', text: article.description }),
                    byline(article, ctx, { follow: true, extra: authorControls }),
                    articleBody(renderMarkdown(article.body)),
                    tagChips(article.tagList),
                    create('h2', { className: 'comments-title', text: `Comments (${model.comments.length})` }),
                    ...this.#commentSection(model, ctx),
                ],
            })
        );
    }

    /**
     * Builds the comment list, the delete controls, and the comment form.
     *
     * @param model - The page model.
     * @param ctx - The emitting context.
     * @returns The comment section's nodes.
     */
    #commentSection(model: ArticleModel, ctx: ViewContext): Node[] {
        const article = model.article;
        if (!article) {
            return [];
        }

        const nodes: Node[] = model.comments.map((comment) => this.#comment(comment, ctx, article.slug));
        if (nodes.length === 0) {
            nodes.push(create('p', { className: 'muted', text: 'No comments yet.' }));
        }

        if (!model.session.isAuthenticated) {
            nodes.push(
                create('p', {
                    className: 'muted',
                    children: [link('#/login', 'Sign in'), create('span', { text: ' to add a comment.' })],
                })
            );
            return nodes;
        }

        nodes.push(
            create('form', {
                className: 'card wide',
                on: {
                    submit: (event: Event) => {
                        event.preventDefault();
                        if (this.#commentDraft.trim().length === 0) {
                            return;
                        }
                        ctx.emit(ACTIONS.commentAdd, { slug: article.slug, body: this.#commentDraft });
                        this.#commentDraft = '';
                    },
                },
                children: [
                    formErrors(model.commentErrors, ['body']),
                    textField({
                        name: 'body',
                        label: 'Write a comment',
                        value: this.#commentDraft,
                        multiline: true,
                        errors: model.commentErrors,
                        onInput: (value) => {
                            this.#commentDraft = value;
                        },
                    }),
                    create('div', {
                        className: 'card-actions',
                        children: [
                            create('button', { className: 'primary', text: 'Post comment', attrs: { type: 'submit' } }),
                        ],
                    }),
                ],
            })
        );
        return nodes;
    }

    /**
     * Builds one comment card, with its delete control when the visitor wrote it.
     *
     * @param comment - The comment.
     * @param ctx - The emitting context.
     * @param slug - The article slug the comment belongs to.
     * @returns The comment element.
     */
    #comment(comment: ConduitComment, ctx: ViewContext, slug: string): HTMLElement {
        const canDelete = ctx.session.user?.username === comment.author.username;
        return create('div', {
            className: 'comment',
            children: [
                create('div', {
                    className: 'comment-header',
                    children: [
                        avatar(comment.author.image, comment.author.username),
                        link(`#/profile/${comment.author.username}`, comment.author.username, 'author'),
                        create('span', { text: formatDate(comment.createdAt) }),
                        create('span', { className: 'grow' }),
                        canDelete
                            ? create('button', {
                                  text: 'Delete',
                                  on: { click: () => ctx.emit(ACTIONS.commentRemove, { slug, id: comment.id }) },
                              })
                            : null,
                    ],
                }),
                create('p', { text: comment.body }),
            ],
        });
    }
}
