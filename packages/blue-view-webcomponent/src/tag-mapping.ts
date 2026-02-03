/**
 * @author Jeff Rose
 */

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
            customElements.define(tagName, target as unknown as CustomElementConstructor);
            return target;
        };

/**
 * @param {string} tagName
 * @returns {Function}
 */

/**
 */
export const TagMapping = assign(tagMapping, {
    /**
     * @param {*} value
     * @param {*} target
     */
    define: defineTagMapping,
    /**
     * @param {*} target
     */
    delete: deleteTagMapping,
    /**
     * @param {*} target
     * @returns {string}
     */
    get: getTagMapping,
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` has a tag mapping.
     */
    has: hasTagMapping,
});
