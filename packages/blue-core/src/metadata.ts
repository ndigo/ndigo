/** @author opencode */
import '@tsmetadata/polyfill';

/**
 * Extract TC39 `Symbol.metadata` from a target.
 *
 * Handles both class constructors (`typeof target === 'function'`)
 * and instances/prototypes (`target.constructor`).
 *
 * @param target - Class constructor, prototype, or instance
 * @returns The metadata record, or an empty object if none exists
 */
export function getSymbolMetadata(target: any): Record<string, any> {
    if (typeof target === 'function' && target[Symbol.metadata]) {
        return target[Symbol.metadata];
    }

    if (target && target.constructor && target.constructor[Symbol.metadata]) {
        return target.constructor[Symbol.metadata];
    }

    return {};
}
