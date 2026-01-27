/**
 * @author Jeff Rose
 */

import 'reflect-metadata';

const VIEW_MAPPING = 'view:mapping',
    { assign } = Object,
    { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect,
    defineViewMapping = (value, target): void => defineMetadata(VIEW_MAPPING, value, target),
    deleteViewMapping = (target) => deleteMetadata(VIEW_MAPPING, target),
    getViewMapping = (target): string => getMetadata(VIEW_MAPPING, target),
    hasViewMapping = (target): boolean => hasMetadata(VIEW_MAPPING, target),
    viewMapping =
        (viewName: string): ClassDecorator =>
        (target) => {
            defineViewMapping(viewName, target);
        };

/**
 * @param {string} viewName
 * @returns {Function}
 */

/**
 */
export const ViewMapping = assign(viewMapping, {
    /**
         * @param {*} value
     * @param {*} target
     */
    define: defineViewMapping,
    /**
         * @param {*} target
     */
    delete: deleteViewMapping,
    /**
         * @param {*} target
     * @returns {string}
     */
    get: getViewMapping,
    /**
         * @param {*} target
     * @returns {boolean} Whether or not the `target` has a view mapping.
     */
    has: hasViewMapping,
});
