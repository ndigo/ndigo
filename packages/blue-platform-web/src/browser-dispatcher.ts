/**
 * Browser-flavored dispatcher.
 *
 * The platform-independent dispatch pipeline lives in
 * `@blue/dispatcher`'s {@link AbstractDispatcher} (DOM-free). This subclass is
 * the browser identity: it exists so browser applications can construct a
 * dispatcher by its platform name, and the `viewTarget` it renders into is
 * a DOM-backed target resolved from the application context.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractDispatcher } from '@blue/dispatcher';

/**
 * Browser application dispatcher.
 *
 * @example
 * ```ts
 * const dispatcher = new BrowserDispatcher();
 * dispatcher.initStrategies(context);
 * dispatcher.applicationContext = context;
 * ```
 */
export class BrowserDispatcher extends AbstractDispatcher {
    /** @inheritdoc */
    get [Symbol.toStringTag](): string {
        return 'BrowserDispatcher';
    }
}