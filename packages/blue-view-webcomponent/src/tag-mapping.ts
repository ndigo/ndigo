/**
 * @author Jeff Rose
 */

import 'reflect-metadata';

const TAG_MAPPING = 'tag:mapping',
    { assign } = Object,
    { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect,
    defineTagMapping = (value, target): void => defineMetadata(TAG_MAPPING, value, target),
    deleteTagMapping = (target) => deleteMetadata(TAG_MAPPING, target),
    getTagMapping = (target): string => getMetadata(TAG_MAPPING, target),
    hasTagMapping = (target): boolean => hasMetadata(TAG_MAPPING, target),
    tagMapping =
        (tagName: string): ClassDecorator =>
        (target) => {
            defineTagMapping(tagName, target);
            customElements.define(tagName, target as unknown as CustomElementConstructor);
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
