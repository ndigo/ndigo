/**
 * @author Jeff Rose
 */
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';

/**
 * A container representing a single row within a {@link ListView}.
 *
 * Each list item holds a reference to its position in the list
 * and a model for the specific item at that index.
 *
 * @typeParam T - The type of the individual list item's model.
 */
export class ListItem<T = unknown> extends WicketContainer<T> {
    #index: number;

    get [Symbol.toStringTag](): string {
        return 'ListItem';
    }

    /**
     * The zero-based index of this item within its parent ListView.
     */
    get index(): number {
        return this.#index;
    }

    /**
     * Creates a new list item.
     *
     * @param id - The component identifier.
     * @param index - The zero-based position in the parent list.
     * @param model - The optional model for this list item.
     */
    constructor(id: string, index: number, model?: ReadableModel<T>) {
        super(id, model);
        this.#index = index;
    }
}
