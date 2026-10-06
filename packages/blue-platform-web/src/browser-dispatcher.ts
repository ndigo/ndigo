/**
 * Browser-flavored dispatcher.
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
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
