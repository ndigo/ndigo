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
    @entry
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

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
