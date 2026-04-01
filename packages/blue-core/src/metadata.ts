/** @author opencode */
import '@tsmetadata/polyfill';

/**
 * Reads the TC39 `Symbol.metadata` record for a class or instance.
 *
 * The lookup supports both constructors and values created from them so callers can inspect metadata without
 * caring which form they received.
 *
 * @param target - Class constructor, prototype, or instance.
 * @returns The metadata record, or an empty object when no metadata is present.
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
