/**
 * Resets browser application state from a response header.
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';

/**
 * Extends HTTP initialization with app-reset response handling options.
 *
 * @example
 * ```ts
 * type _Alias = AppResetInit;
 * ```
 */
export type AppResetInit = HTTPInit & {
    /**
     * The header name to check for an app reset signal.
     * @defaultValue 'Alt-Location'
     */
    appResetHeader?: string;

    /**
     * The status code that triggers an app reset.
     * @defaultValue 205
     */
    appResetCode?: number;
};

const defaults: AppResetInit = {
    appResetHeader: 'Alt-Location',
    appResetCode: 205,
};

/**
 * HTTP interceptor that reloads the page when a matching reset response is received.
 *
 * This interceptor implements the ResponseAwareHTTPInterceptor interface and
 * triggers a page reload when:
 * - The response has the configured appResetHeader header
 * - The response status matches appResetCode (default 205) or 303
 * - The hostname is not 'localhost'
 *

 *
 * @example
 * ```ts
 * const instance = new AppResetInterceptor();
 * ```
 */
export class AppResetInterceptor implements ResponseAwareHTTPInterceptor<AppResetInit> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AppResetInterceptor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AppResetInterceptor]"
     */
    get [Symbol.toStringTag](): string {
        return 'AppResetInterceptor';
    }

    #reloadCallback: () => void;

    /**
     * Creates a new app reset interceptor.
     *
     * @param reloadCallback - A callback to trigger page reload. Defaults to a no-op.
     */
    constructor(reloadCallback: () => void = () => {}) {
        this.#reloadCallback = reloadCallback;
    }

    /**
     * Reloads the current page when a matching reset response is received.
     *
     * @param response - Response returned by the HTTP request.
     * @param settings - Interceptor settings used to match the reset signal.
     * @returns A promise that resolves once post-processing completes.
     */
    async postResponse(response: Response, settings: AppResetInit): Promise<Response | void> {
        settings = Object.assign({}, defaults, settings);
        const header = settings.appResetHeader,
            statusCode = settings.appResetCode;

        // Check if the response has the app reset header and matches the status code
        if (header && response.headers.has(header) && (response.status === statusCode || response.status === 303)) {
            try {
                // Parse the URL to check hostname
                const url = new URL(response.url);
                if (url.hostname !== 'localhost') {
                    // Trigger the reload callback
                    this.#reloadCallback();
                }
            } catch (error) {
                // If we can't parse the URL, we don't reload
                // This handles cases where response.url might be invalid
            }
        }

        return response;
    }
}
