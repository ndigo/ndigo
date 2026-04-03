/**
 * In-memory CRUD service for note items.
 *
 * @author Jeff Rose
 */

/**
 * Represents a note item.
 */
export interface NoteItem {
    id: string;
    title: string;
    body: string;
    pinned: boolean;
}

/**
 * Provides in-memory CRUD operations for notes.
 */
export default class NotesService {
    #items: NoteItem[];
    #nextId: number;

    /**
     * Creates a notes service with optional initial items.
     *
     * @param initialItems Initial notes to seed the service.
     */
    constructor(initialItems: NoteItem[] = []) {
        this.#items = [...initialItems];
        this.#nextId = initialItems.length + 1;
    }

    /**
     * Returns the built-in tag for `Object.prototype.toString`.
     */
    get [Symbol.toStringTag](): string {
        return 'NotesService';
    }

    /**
     * Returns all notes.
     */
    get items(): readonly NoteItem[] {
        return this.#items;
    }

    /**
     * Returns the total number of notes.
     */
    get count(): number {
        return this.#items.length;
    }

    /**
     * Adds a new note.
     *
     * @param title The note title.
     * @param body The note body.
     * @param pinned Whether the note is pinned.
     * @returns The created note item.
     */
    addNote(title: string, body: string, pinned: boolean = false): NoteItem {
        const item: NoteItem = {
            id: String(this.#nextId++),
            title,
            body,
            pinned,
        };

        this.#items.push(item);
        return item;
    }

    /**
     * Removes a note by id.
     *
     * @param id The note id.
     * @returns `true` when removed; otherwise `false`.
     */
    removeNote(id: string): boolean {
        const index = this.#items.findIndex((item) => item.id === id);

        if (index === -1) {
            return false;
        }

        this.#items.splice(index, 1);
        return true;
    }

    /**
     * Gets a note by id.
     *
     * @param id The note id.
     * @returns The matching note, or `null` when missing.
     */
    getNote(id: string): NoteItem | null {
        return this.#items.find((item) => item.id === id) ?? null;
    }
}
