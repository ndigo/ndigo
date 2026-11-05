/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { Constructable } from '@ndigo/core';

const TAG_MAPPING = 'tag:mapping',
    { assign } = Object,
    getConstructor = (target: unknown): (Function & { [Symbol.metadata]?: Record<string, unknown> }) | undefined => {
        if (typeof target === 'function') {
            return target as Function & { [Symbol.metadata]?: Record<string, unknown> };
        }
        return (target as object | undefined)?.constructor as
            | (Function & { [Symbol.metadata]?: Record<string, unknown> })
            | undefined;
    },
    defineTagMapping = (value: string, target: unknown): void => {
        const ctor = getConstructor(target);
        if (!ctor) return;

        // Trust: ctor has Symbol.metadata from @tsmetadata/polyfill at runtime.
        // The TS Function type doesn't declare it — this cast is needed.
        const ctorWithMeta = ctor as Function & { [Symbol.metadata]: Record<string, unknown> };
        if (!ctorWithMeta[Symbol.metadata]) {
            ctorWithMeta[Symbol.metadata] = {};
        }
        ctorWithMeta[Symbol.metadata][TAG_MAPPING] = value;
    },
    deleteTagMapping = (target: unknown): void => {
        const ctor = getConstructor(target);
        if (!ctor) return;

        const metadata = ctor[Symbol.metadata];
        if (metadata) {
            delete metadata[TAG_MAPPING];
        }
    },
    getTagMapping = (target: unknown): string | undefined => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[TAG_MAPPING] as string | undefined;
    },
    hasTagMapping = (target: unknown): boolean => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[TAG_MAPPING] !== undefined;
    },
    tagMapping =
        (tagName: string) =>
        <T extends Constructable<HTMLElement>>(target: T, context: ClassDecoratorContext): T => {
            context.metadata[TAG_MAPPING] = tagName;
            customElements.define(tagName, target);
            return target;
        };

/**
 * Registers a custom element name and stores it in decorator metadata.
 *
 * The decorator also defines the element immediately so the class can be instantiated
 * through the browser's custom elements registry.
 *
 * @param tagName - The custom element tag name to associate with the class.
 * @returns A class decorator that records and registers the tag name.
 */
export const TagMapping = assign(tagMapping, {
    /**
     * Writes a tag mapping to the target's metadata.
     *
     * @param value - The tag name to store.
     * @param target - The decorated class or constructor-like target.
     */
    define: defineTagMapping,
    /**
     * Removes any stored tag mapping from the target's metadata.
     *
     * @param target - The decorated class or constructor-like target.
     */
    delete: deleteTagMapping,
    /**
     * Reads the stored tag mapping for a target.
     *
     * @param target - The decorated class or constructor-like target.
     * @returns The tag name, or `undefined` when none has been recorded.
     */
    get: getTagMapping,
    /**
     * Tests whether a target has a stored tag mapping.
     *
     * @param target - The decorated class or constructor-like target.
     * @returns `true` when a tag mapping is present.
     */
    has: hasTagMapping,
});
