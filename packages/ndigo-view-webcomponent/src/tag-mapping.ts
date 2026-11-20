/**
 * `@tagMapping` decorator metadata for custom-element tags.
 *
 * The decorator declares the tag through the shared annotation primitives; the
 * imperative helpers exist so framework code can set and clear a mapping on a
 * class it did not decorate.
 */
import '@tsmetadata/polyfill';
import { annotationOf, classAnnotation, ensureSymbolMetadata, type Constructable } from '@ndigo/core';

/**
 * `@tagMapping` annotation key: the custom-element name declared for a class.
 */
const tagMappingOf = classAnnotation<string>('tag:mapping');

/**
 * Registers a custom element name and stores it in decorator metadata.
 *
 * The decorator also defines the element immediately so the class can be
 * instantiated through the browser's custom elements registry.
 *
 * @param tagName - The custom element tag name to associate with the class.
 * @returns A class decorator that records and registers the tag name.
 *
 * @example
 * ```ts
 * @TagMapping('todo-item')
 * class TodoItemElement extends HTMLElement {}
 * ```
 */
export const TagMapping = Object.assign(
    (tagName: string) =>
        <T extends Constructable<HTMLElement>>(target: T, context: ClassDecoratorContext): T => {
            // NOTE: AnnotationDecorator is a class-or-method union; the
            // decorator itself rejects the method half.
            const declareClass = tagMappingOf(tagName) as unknown as (value: T, context: ClassDecoratorContext) => void;
            declareClass(target, context);
            customElements.define(tagName, target as unknown as CustomElementConstructor);
            return target;
        },
    {
        /**
         * Writes a tag mapping to the target's metadata.
         *
         * @param value - The tag name to store.
         * @param target - The decorated class or an instance of it.
         */
        define(value: string, target: unknown): void {
            ensureSymbolMetadata(target)[tagMappingOf.key] = value;
        },

        /**
         * Removes any stored tag mapping from the target's metadata.
         *
         * @param target - The class or instance to clear.
         */
        delete(target: unknown): void {
            delete ensureSymbolMetadata(target)[tagMappingOf.key];
        },

        /**
         * Reads the stored tag mapping for a target.
         *
         * @param target - The decorated class or an instance of it.
         * @returns The tag name, or `undefined` when none has been recorded.
         */
        get(target: unknown): string | undefined {
            return annotationOf(target, tagMappingOf);
        },

        /**
         * Tests whether a target has a stored tag mapping.
         *
         * @param target - The decorated class or an instance of it.
         * @returns `true` when a tag mapping is present.
         */
        has(target: unknown): boolean {
            return annotationOf(target, tagMappingOf) !== undefined;
        },
    }
);
