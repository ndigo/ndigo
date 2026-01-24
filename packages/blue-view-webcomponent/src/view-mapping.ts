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
 * @function module:dispatcher.ViewMapping
 * @param {external:string} viewName
 * @returns {external:Function}
 */

/**
 * @const {external:ClassDecorator} module:dispatcher.ViewMapping(2)
 */
export const ViewMapping = assign(viewMapping, {
    /**
     * @function module:dispatcher.ViewMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: defineViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.delete
     * @param {*} target
     */
    delete: deleteViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: getViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a view mapping.
     */
    has: hasViewMapping,
});
