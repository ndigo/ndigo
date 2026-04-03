/**
 * Wicket panel for rendering a list of notes.
 *
 * @author Jeff Rose
 */

import { StaticModel } from '@blue/reactive';
import type { ReadableModel } from '@blue/reactive';
import { Panel, Label, ListView, ListItem } from '@blue/view-wicket';
import type { NoteItem } from './notes-service';

class NoteListView extends ListView<NoteItem> {
    /**
     * Populates a list item with note title, body, and pinned indicator labels.
     *
     * @param item - The list item to populate.
     */
    protected populateItem(item: ListItem<NoteItem>): void {
        const note = item.model.get();

        item.addChild(new Label('title', new StaticModel(note.title)));
        item.addChild(new Label('body', new StaticModel(note.body)));
        item.addChild(new Label('pinned', new StaticModel(note.pinned ? '📌' : '')));
    }
}

/**
 * Panel that renders notes using a {@link ListView}.
 */
export default class NotesListPanel extends Panel<NoteItem[]> {
    /**
     * Creates a notes list panel.
     *
     * @param id - The component identifier.
     * @param model - The optional notes model.
     */
    constructor(id: string, model?: ReadableModel<NoteItem[]>) {
        super(id, model);
        this.template = '<div class="notes-list"><ul data-w-id="notesList"></ul></div>';
    }

    /**
     * Initializes the panel with its list view child component.
     */
    protected onInitialize(): void {
        const noteListView = new NoteListView('notesList', this.model);
        this.addChild(noteListView);
    }
}
