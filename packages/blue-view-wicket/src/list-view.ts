/**
 * @author Jeff Rose
 */
import type { ReadableModel } from '@blue/reactive';
import { StaticModel } from '@blue/reactive';
import { WicketContainer } from './container';
import { ListItem } from './list-item';

/**
 * A repeater component that generates child {@link ListItem} components
 * from an array model.
 *
 * For each element in the array model, the ListView creates a `ListItem`,
 * calls {@link populateItem} to let the subclass add child components,
 * and then renders the items sequentially.
 *
 * @typeParam T - The element type of the list.
 */
export abstract class ListView<T = unknown> extends WicketContainer<T[]> {
    get [Symbol.toStringTag](): string {
        return 'ListView';
    }

    /**
     * Creates a new list view.
     *
     * @param id - The component identifier.
     * @param model - The optional array model to repeat.
     */
    constructor(id: string, model?: ReadableModel<T[]>) {
        super(id, model);
    }

    /**
     * Called for each item to let the subclass populate the item
     * container with child components (e.g., Labels, Links).
     *
     * @param item - The ListItem to populate.
     */
    protected abstract populateItem(item: ListItem<T>): void;

    /**
     * Rebuilds list item children from the current model value
     * before each render pass.
     */
    protected onBeforeRender(): void {
        for (const childId of [...this.children.keys()]) {
            this.removeChild(childId);
        }

        const items = this.model.get() ?? [];
        for (let index = 0; index < items.length; index++) {
            const itemModel = new StaticModel<T>(items[index]);
            const item = new ListItem<T>(String(index), index, itemModel);
            this.addChild(item);
            this.populateItem(item);
        }
    }
}
