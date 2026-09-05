import '@tsmetadata/polyfill';

const TAG_MAPPING = 'tag:mapping',
    { assign } = Object,
    getConstructor = (target: any): any => (typeof target === 'function' ? target : target?.constructor),
    defineTagMapping = (value: string, target: any): void => {
        const ctor = getConstructor(target);
        if (!ctor[Symbol.metadata]) {
            ctor[Symbol.metadata] = {};
        }
        ctor[Symbol.metadata][TAG_MAPPING] = value;
    },
    deleteTagMapping = (target: any): void => {
        const ctor = getConstructor(target);
        if (ctor[Symbol.metadata]) {
            delete ctor[Symbol.metadata][TAG_MAPPING];
        }
    },
    getTagMapping = (target: any): string | undefined => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[TAG_MAPPING];
    },
    hasTagMapping = (target: any): boolean => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[TAG_MAPPING] !== undefined;
    },
    tagMapping =
        (tagName: string) =>
        <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T => {
            context.metadata[TAG_MAPPING] = tagName;
            customElements.define(tagName, target as CustomElementConstructor);
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
