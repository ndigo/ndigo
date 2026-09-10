import '@tsmetadata/polyfill';
import { Constructable } from '@blue/core';

const VIEW_MAPPING = 'view:mapping',
    { assign } = Object,
    getConstructor = (target: unknown): (Function & { [Symbol.metadata]?: Record<string, unknown> }) | undefined => {
        if (typeof target === 'function') {
            return target as Function & { [Symbol.metadata]?: Record<string, unknown> };
        }
        return (target as object | undefined)?.constructor as
            | (Function & { [Symbol.metadata]?: Record<string, unknown> })
            | undefined;
    },
    defineViewMapping = (value: string, target: unknown): void => {
        const ctor = getConstructor(target);
        if (!ctor) return;

        // Trust: ctor has Symbol.metadata from @tsmetadata/polyfill at runtime.
        // The TS Function type doesn't declare it — this cast is needed.
        const ctorWithMeta = ctor as Function & { [Symbol.metadata]: Record<string, unknown> };
        if (!ctorWithMeta[Symbol.metadata]) {
            ctorWithMeta[Symbol.metadata] = {};
        }
        ctorWithMeta[Symbol.metadata][VIEW_MAPPING] = value;
    },
    deleteViewMapping = (target: unknown): void => {
        const ctor = getConstructor(target);
        if (!ctor) return;

        const metadata = ctor[Symbol.metadata];
        if (metadata) {
            delete metadata[VIEW_MAPPING];
        }
    },
    getViewMapping = (target: unknown): string | undefined => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[VIEW_MAPPING] as string | undefined;
    },
    hasViewMapping = (target: unknown): boolean => {
        const ctor = getConstructor(target);
        return ctor?.[Symbol.metadata]?.[VIEW_MAPPING] !== undefined;
    },
    viewMapping =
        (viewName: string) =>
        <T extends Constructable>(target: T, context: ClassDecoratorContext): T => {
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
