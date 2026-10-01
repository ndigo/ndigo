/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import { argumentValueConverters } from './_resolver-util';
import { BrowserDataBindingMethodArgumentResolver } from './data-binding-argument-resolver';
import { BrowserCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { CookieLanguageResolver } from './cookie-language-resolver';
import { BrowserHistoryStateValueMethodArgumentResolver } from './history-state-argument-resolver';
import { BrowserStorageValueMethodArgumentResolver } from './browser-storage-argument-resolver';
import { RadixMetadataHandlerMapping, MethodParameterType } from '@blue/dispatcher';
import { NameViewResolver, ViewResolverComposite } from '@blue/view';
import { WebComponentViewResolver } from '@blue/view-webcomponent';
import { conditionalOnBrowser } from '@blue/core';

/**
 * Auto-configuration for browser-based applications.
 * Provisions argument resolvers and converter registries.
 */
@conditionalOnBrowser
@configuration
export class WebAutoConfiguration {
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The browser argument-value converter registry.
     */
    @entry()
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the browser argument resolvers used for request binding.
     *
     * @returns The browser argument resolvers.
     */
    @entry()
    argumentResolvers() {
        return [
            new BrowserDataBindingMethodArgumentResolver(),
            new BrowserCookieValueMethodArgumentResolver(),
            new BrowserHistoryStateValueMethodArgumentResolver(),
            new BrowserStorageValueMethodArgumentResolver(
                () => globalThis.sessionStorage,
                MethodParameterType.SESSION_STORAGE,
                'BrowserSessionStorageValueMethodArgumentResolver'
            ),
            new BrowserStorageValueMethodArgumentResolver(
                () => globalThis.localStorage,
                MethodParameterType.LOCAL_STORAGE,
                'BrowserLocalStorageValueMethodArgumentResolver'
            ),
        ];
    }

    /**
     * Provides the default handler mapping for browser-based request dispatch.
     * Can be overridden by registering a custom `configuration` with a handlerMapping entry.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry()
    handlerMapping() {
        return new RadixMetadataHandlerMapping();
    }

    /**
     * Provides the default view resolver chain: web-component descriptors
     * first, then name-registered view beans. Can be overridden by
     * registering a custom `configuration` with a viewResolver entry.
     *
     * @returns The composite view resolver.
     */
    @entry()
    viewResolver() {
        return new ViewResolverComposite([new WebComponentViewResolver(), new NameViewResolver()]);
    }

    /**
     * Resolves the request language from the persisted cookie, falling back
     * to the browser language. Can be overridden by registering a custom
     * `configuration` with a languageResolver entry.
     *
     * @returns The cookie-backed language resolver.
     */
    @entry()
    languageResolver() {
        return new CookieLanguageResolver();
    }
}
