/**
 * Wicket panel containing a note creation form.
 *
 * @author Jeff Rose
 */

import { MutableModel, StaticModel } from '@blue/reactive';
import type { ReadableModel } from '@blue/reactive';
import { Panel, Form, TextField, TextArea, CheckBox, Button, FeedbackPanel } from '@blue/view-wicket';

class NoteForm extends Form {
    /**
     * Creates a form for note creation.
     *
     * @param id - The component identifier.
     */
    constructor(id: string) {
        super(id);
    }

    /**
     * Handles successful submission.
     */
    protected onSubmit(): void {
        // no-op
    }

    /**
     * Handles validation errors.
     */
    protected onError(): void {
        // no-op
    }
}

/**
 * Panel that renders and manages a form for creating a new note.
 */
export default class NotesFormPanel extends Panel {
    #titleModel: MutableModel<string> = new MutableModel('');
    #bodyModel: MutableModel<string> = new MutableModel('');
    #pinnedModel: MutableModel<boolean> = new MutableModel(false);

    /**
     * Creates a note form panel.
     *
     * @param id - The component identifier.
     * @param model - The optional panel model.
     */
    constructor(id: string, model?: ReadableModel<unknown>) {
        super(id, model);
        this.template =
            '<div class="notes-form"><form data-w-id="noteForm"><div data-w-id="feedback"></div><div class="form-group"><label for="titleInput">Title</label><input data-w-id="titleInput" /></div><div class="form-group"><label for="bodyInput">Body</label><textarea data-w-id="bodyInput"></textarea></div><div class="form-group"><input data-w-id="pinnedInput" /> <label for="pinnedInput">Pin this note</label></div><button data-w-id="saveButton">Save</button></form></div>';
    }

    /**
     * Returns the current note title value.
     */
    get titleValue(): string {
        return this.#titleModel.get();
    }

    /**
     * Returns the current note body value.
     */
    get bodyValue(): string {
        return this.#bodyModel.get();
    }

    /**
     * Returns whether the note is currently pinned.
     */
    get pinnedValue(): boolean {
        return this.#pinnedModel.get();
    }

    /**
     * Returns the note form child component.
     */
    get form(): Form {
        return this.children.get('noteForm') as Form;
    }

    /**
     * Resets all note form fields to their initial values.
     */
    resetForm(): void {
        this.#titleModel.set('');
        this.#bodyModel.set('');
        this.#pinnedModel.set(false);
    }

    /**
     * Initializes the panel with a form and note input components.
     */
    protected onInitialize(): void {
        const form = new NoteForm('noteForm');
        const titleInput = new TextField('titleInput', this.#titleModel);
        titleInput.required = true;

        form.addChild(new FeedbackPanel('feedback'));
        form.addChild(titleInput);
        form.addChild(new TextArea('bodyInput', this.#bodyModel));
        form.addChild(new CheckBox('pinnedInput', this.#pinnedModel));
        form.addChild(new Button('saveButton', new StaticModel('Save Note')));

        this.addChild(form);
    }
}
