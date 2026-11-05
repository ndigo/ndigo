/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createNull } from './null.js';

const ndigo = createNull();

// Safely assign to the global scope across Node.js, browser, and benchmark environments.
const _global = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    return undefined;
})();

if (_global) {
    Reflect.defineProperty(_global, 'ndigo', {
        value: ndigo,
        configurable: true,
        enumerable: true,
        writable: false,
    });
}

export default ndigo;
