/**
 * @author Jeff Rose
 */

import { createNull } from './null.js';

const blue = createNull();

// Safely assign to the global scope across Node.js, browser, and benchmark environments.
const _global = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : undefined;

if (_global) {
    Reflect.defineProperty(_global, 'blue', {
        value: blue,
        configurable: true,
        enumerable: true,
        writable: false,
    });
}

export default blue;
