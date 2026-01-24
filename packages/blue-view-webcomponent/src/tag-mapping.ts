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
 * @function module:dispatcher.TagMapping
 * @param {external:string} tagName
 * @returns {external:Function}
 */

/**
 * @const {external:ClassDecorator} module:dispatcher.TagMapping(2)
 */
export const TagMapping = assign(tagMapping, {
    /**
     * @function module:dispatcher.TagMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: defineTagMapping,
    /**
     * @function module:dispatcher.TagMapping.delete
     * @param {*} target
     */
    delete: deleteTagMapping,
    /**
     * @function module:dispatcher.TagMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: getTagMapping,
    /**
     * @function module:dispatcher.TagMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a tag mapping.
     */
    has: hasTagMapping,
});
