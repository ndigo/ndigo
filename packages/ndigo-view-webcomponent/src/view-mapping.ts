/**
 * `@viewMapping` decorator metadata for view-to-tag mappings.
 *
 * The decorator declares the mapping through the shared annotation
 * primitives; the imperative helpers exist so framework code can set and
 * clear a mapping on a class it did not decorate.
 */
import '@tsmetadata/polyfill';
import {
    annotationOf,
    classAnnotation,
    ensureSymbolMetadata,
    getSymbolMetadata,
    type Constructable,
} from '@ndigo/core';

/**
 * `@viewMapping` annotation key: the view name declared for a class.
 */
const viewMapping = classAnnotation<string>('view:mapping');

/**
 * Registers a view name in decorator metadata for later lookup.
 *
 * @param viewName - The view name to associate with the decorated class.
 * @returns A class decorator that records the view name.
 *
 * @example
 * ```ts
 * @ViewMapping('todo-list')
 * class TodoListView {}
 * ```
 */
export const ViewMapping = Object.assign(
    (viewName: string) =>
        <T extends Constructable>(target: T, context: ClassDecoratorContext): T => {
            // NOTE: AnnotationDecorator is a class-or-method union; the
            // decorator itself rejects the method half.
            const declareClass = viewMapping(viewName) as unknown as (value: T, context: ClassDecoratorContext) => void;
            declareClass(target, context);
            return target;
        },
    {
        /**
         * Writes a view mapping to the target's metadata.
         *
         * @param value - The view name to store.
         * @param target - The decorated class or an instance of it.
         */
        define(value: string, target: unknown): void {
            ensureSymbolMetadata(target)[viewMapping.key] = value;
        },

        /**
         * Removes any stored view mapping from the target's metadata.
         *
         * @param target - The class or instance to clear.
         */
        delete(target: unknown): void {
            // Read rather than ensure: deleting from a class that never
            // declared a mapping must not attach an empty metadata record.
            delete getSymbolMetadata(target)[viewMapping.key];
        },

        /**
         * Reads the stored view mapping for a target.
         *
         * @param target - The decorated class or an instance of it.
         * @returns The view name, or `undefined` when none has been recorded.
         */
        get(target: unknown): string | undefined {
            return annotationOf(target, viewMapping);
        },

        /**
         * Tests whether a target has a stored view mapping.
         *
         * @param target - The decorated class or an instance of it.
         * @returns `true` when a view mapping is present.
         */
        has(target: unknown): boolean {
            return annotationOf(target, viewMapping) !== undefined;
        },
    }
);
