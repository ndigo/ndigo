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
import { LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { NameViewResolver } from '@blue/view';
import { WebComponentViewEngine } from '@blue/view-webcomponent';

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
        return [
            new BrowserBindMethodArgumentResolver(),
            new BrowserCookieValueMethodArgumentResolver(),
            new BrowserModelValueMethodArgumentResolver(),
            new BrowserStateValueMethodArgumentResolver(),
            new BrowserSessionValueMethodArgumentResolver(),
        ];
    }

    /**
     * Provides the default handler mapping for browser-based request dispatch.
     * Can be overridden by registering a custom @configuration with a handlerMapping entry.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry
    handlerMapping() {
        return new LinearMetadataHandlerMapping();
    }

    /**
     * Provides the default view resolver that matches views by name.
     * Can be overridden by registering a custom @configuration with a viewResolver entry.
     *
     * @returns The default name-based view resolver.
     */
    @entry
    viewResolver() {
        return new NameViewResolver();
    }

    /**
     * Provides the default Web Component view engine.
     * Can be overridden by registering a custom @configuration with a webComponentViewEngine entry.
     *
     * @returns The default Web Component view engine.
     */
    @entry
    webComponentViewEngine() {
        return new WebComponentViewEngine();
    }
}
