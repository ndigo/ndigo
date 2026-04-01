/**
 * @author Jeff Rose
 */

import { configuration, entry } from '@blue/context';
import {
    argumentValueConverters,
    BrowserBindMethodArgumentResolver,
    BrowserCookieValueMethodArgumentResolver,
    BrowserModelValueMethodArgumentResolver,
    BrowserSessionValueMethodArgumentResolver,
    BrowserStateValueMethodArgumentResolver,
} from '@blue/platform-web';

/**
 * Auto-configuration for browser-based applications.
 * Provisions argument resolvers and converter registries.
 */
@configuration
export class WebAutoConfiguration {
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The browser argument-value converter registry.
     */
    @entry
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the browser argument resolvers used for request binding.
     *
     * @returns The browser argument resolvers.
     */
    @entry
    argumentResolvers() {
        const registry = argumentValueConverters;
        const options = { strictNamedLookup: true };

        return [
            new BrowserBindMethodArgumentResolver(undefined, registry, options),
            new BrowserCookieValueMethodArgumentResolver(undefined, registry, options),
            new BrowserModelValueMethodArgumentResolver(undefined, registry, options),
            new BrowserStateValueMethodArgumentResolver(undefined, registry, options),
            new BrowserSessionValueMethodArgumentResolver(undefined, registry, options),
        ];
    }
}
