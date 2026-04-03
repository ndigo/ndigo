/**
 * @author Jeff Rose
 */
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';

/**
 * A reusable container component with its own markup template.
 *
 * Panels are the primary unit of composition in Wicket-style
 * applications. Each panel manages its own template and child
 * components, and can be nested within pages or other panels.
 *
 * @typeParam T - The type of the panel's model object.
 */
export class Panel<T = unknown> extends WicketContainer<T> {
    get [Symbol.toStringTag](): string {
        return 'Panel';
    }

    /**
     * Creates a new panel with the given id and optional model.
     *
     * @param id - The page identifier.
     * @param model - An optional reactive model.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }
}
