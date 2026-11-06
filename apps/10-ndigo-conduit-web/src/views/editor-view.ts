/**
 * `conduit-editor` — publishing a new article (`#/editor`) and editing an
 * existing one (`#/editor/:slug`), including delete for the author.
 *
 * The draft is seeded once from the article the route loaded and then owned by
 * the view, so a rejected save (`422` with field-keyed messages) re-renders with
 * the envelope under the offending fields and the text still in place. Tags are
 * entered as a comma-separated list and split with the editor's own rules
 * (`parseTags`: trimmed, de-duplicated, empties dropped) before they reach the
 * API.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { create, textField } from '../lib/dom';
import { parseTags } from '../lib/format';
import { formErrors, navFor, notFound, type ViewContext } from './shell';
import type { EditorModel } from './models';

/** The envelope keys this form renders under an input. */
const FIELD_KEYS = ['title', 'description', 'body', 'tagList'] as const;

/** The editor form's draft fields. */
type DraftKey = (typeof FIELD_KEYS)[number];

@TagMapping('conduit-editor')
export default class EditorView extends AbstractWebComponent {
    #model: EditorModel | null = null;
    #seededSlug: string | null | undefined;
    #draft = { title: '', description: '', body: '', tagList: '' };

    set model(model: EditorModel) {
        // Re-seed when the edited article changes (new draft, or a different
        // slug), never on a plain re-render of the same one.
        if (this.#seededSlug !== model.slug) {
            this.#seededSlug = model.slug;
            this.#draft = {
                title: model.article?.title ?? '',
                description: model.article?.description ?? '',
                body: model.article?.body ?? '',
                tagList: model.article?.tagList.join(', ') ?? '',
            };
        }
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
        if (model.notFound) {
            this.replaceChildren(navFor(model.session, 'editor'), notFound('That article does not exist.'));
            return;
        }

        const ctx: ViewContext = { session: model.session, emit: (type, detail) => void this.emit(type, detail) };
        const bind = (key: DraftKey) => (value: string) => {
            this.#draft[key] = value;
        };

        const form = create('form', {
            on: {
                submit: (event: Event) => {
                    event.preventDefault();
                    ctx.emit(ACTIONS.articleSave, {
                        slug: model.slug,
                        title: this.#draft.title,
                        description: this.#draft.description,
                        body: this.#draft.body,
                        tagList: parseTags(this.#draft.tagList),
                    });
                },
            },
            children: [
                formErrors(model.errors, FIELD_KEYS),
                textField({
                    name: 'title',
                    label: 'Title',
                    value: this.#draft.title,
                    errors: model.errors,
                    onInput: bind('title'),
                }),
                textField({
                    name: 'description',
                    label: 'What is this article about?',
                    value: this.#draft.description,
                    errors: model.errors,
                    onInput: bind('description'),
                }),
                textField({
                    name: 'body',
                    label: 'Write your article (Markdown)',
                    value: this.#draft.body,
                    multiline: true,
                    errors: model.errors,
                    onInput: bind('body'),
                }),
                textField({
                    name: 'tagList',
                    label: 'Tags (comma separated)',
                    value: this.#draft.tagList,
                    errors: model.errors,
                    onInput: bind('tagList'),
                }),
                create('div', {
                    className: 'card-actions',
                    children: [
                        ...(model.slug === null
                            ? []
                            : [
                                  create('button', {
                                      className: 'danger',
                                      text: 'Delete article',
                                      on: { click: () => ctx.emit(ACTIONS.articleDelete, { slug: model.slug }) },
                                  }),
                              ]),
                        create('button', {
                            className: 'primary',
                            text: model.slug === null ? 'Publish article' : 'Update article',
                            attrs: { type: 'submit' },
                        }),
                    ],
                }),
            ],
        });

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, 'editor'),
                    create('div', {
                        className: 'card wide',
                        children: [
                            create('h1', {
                                className: 'page-title',
                                text: model.slug === null ? 'New article' : 'Edit article',
                            }),
                            form,
                        ],
                    }),
                ],
            })
        );
    }
}
