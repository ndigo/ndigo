/**
 * Browser-flavored dispatcher.
 */
import { AbstractDispatcher } from '@ndigo/dispatcher';

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
    /** {@inheritDoc} */
    get [Symbol.toStringTag](): string {
        return 'BrowserDispatcher';
    }
}
