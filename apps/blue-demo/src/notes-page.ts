/**
 * Wicket page that serves as the root component for the Notes feature.
 *
 * @author Jeff Rose
 */

import { StaticModel } from '@blue/reactive';
import type { ReadableModel } from '@blue/reactive';
import { Page, Label, AttributeModifier } from '@blue/view-wicket';
import NotesListPanel from './notes-list-panel';
import NotesFormPanel from './notes-form-panel';
import type { NoteItem } from './notes-service';

interface NotesPageModel {
    items: NoteItem[];
    todoRoute: string;
}

/**
 * Root page component for the Notes feature.
 */
export default class NotesPage extends Page<NotesPageModel> {
    /**
     * Creates a notes page.
     *
     * @param id - The component identifier.
     * @param model - The optional page model.
     */
    constructor(id: string, model?: ReadableModel<NotesPageModel>) {
        super(id, model);
        this.template = [
            '<section class="notesapp">',
            '<header class="header"><h1 data-w-id="title">Notes</h1></header>',
            '<div data-w-id="formPanel"></div>',
            '<div data-w-id="listPanel"></div>',
            '<footer class="footer">',
            '<span data-w-id="noteCount"></span>',
            '<a data-w-id="todoLink">Back to Todos</a>',
            '</footer>',
            '</section>',
        ].join('');
    }

    /**
     * Initializes the page with notes form, list, and footer components.
     */
    protected onInitialize(): void {
        const data = this.model.get();
        const items = data?.items ?? [];
        const todoRoute = data?.todoRoute ?? '#/todo/';

        this.addChild(new Label('title', new StaticModel('My Notes')));
        this.addChild(new NotesFormPanel('formPanel'));
        this.addChild(new NotesListPanel('listPanel', new StaticModel(items)));
        this.addChild(new Label('noteCount', new StaticModel(items.length === 1 ? '1 note' : items.length + ' notes')));

        const todoLabel = new Label('todoLink', new StaticModel('Back to Todos'));
        todoLabel.addBehavior(new AttributeModifier('href', new StaticModel(todoRoute)));
        this.addChild(todoLabel);
    }
}
