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
 * Registers a view name in decorator metadata for later lookup.
 *
 * @param viewName - The view name to associate with the decorated class.
 * @returns A class decorator that stores the view name in metadata.
 */
export const ViewMapping = assign(viewMapping, {
    /**
     * Writes a view mapping to the target's metadata.
     *
     * @param value - The view name to store.
     * @param target - The decorated class or constructor-like target.
     */
    define: defineViewMapping,
    /**
     * Removes any stored view mapping from the target's metadata.
     *
     * @param target - The decorated class or constructor-like target.
     */
    delete: deleteViewMapping,
    /**
     * Reads the stored view mapping for a target.
     *
     * @param target - The decorated class or constructor-like target.
     * @returns The view name, or `undefined` when none has been recorded.
     */
    get: getViewMapping,
    /**
     * Tests whether a target has a stored view mapping.
     *
     * @param target - The decorated class or constructor-like target.
     * @returns `true` when a view mapping is present.
     */
    has: hasViewMapping,
});
