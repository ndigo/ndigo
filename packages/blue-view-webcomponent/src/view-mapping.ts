/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';

const VIEW_MAPPING = 'view:mapping',
    { assign } = Object,
    getConstructor = (target: any): any => (typeof target === 'function' ? target : target?.constructor),
    defineViewMapping = (value: string, target: any): void => {
        const ctor = getConstructor(target);
        if (!ctor[Symbol.metadata]) {
            ctor[Symbol.metadata] = {};
        }
        ctor[Symbol.metadata][VIEW_MAPPING] = value;
    },
    deleteViewMapping = (target: any): void => {
        const ctor = getConstructor(target);
        if (ctor[Symbol.metadata]) {
            delete ctor[Symbol.metadata][VIEW_MAPPING];
        }
    },
    getViewMapping = (target: any): string | undefined => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[VIEW_MAPPING];
    },
    hasViewMapping = (target: any): boolean => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[VIEW_MAPPING] !== undefined;
    },
    viewMapping =
        (viewName: string) =>
        <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T => {
            context.metadata[VIEW_MAPPING] = viewName;
            return target;
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
