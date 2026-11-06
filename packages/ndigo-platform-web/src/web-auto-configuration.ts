/**
 */
import { configuration, entry } from '@ndigo/context';
import { argumentValueConverters, RadixMetadataHandlerMapping } from '@ndigo/dispatcher';
import { CookieLanguageResolver } from './cookie-language-resolver';
import { createBrowserArgumentResolvers } from './configure-argument-resolvers';
import { NameViewResolver, ViewResolverComposite } from '@ndigo/view';
import type { ViewResolver, View } from '@ndigo/view';
import { whenBrowser } from '@ndigo/core';

/**
 * Lazily instantiates the web-component view resolver on first resolution.
 *
 * `@ndigo/view-webcomponent` declares custom-element base classes that extend
 * `HTMLElement` at module load, so a static import would make the whole
 * `@ndigo/platform-web` barrel unimportable outside a DOM (PWB-REV-001). The
 * resolver is only exercised while resolving a view — a browser-only path —
 * so the import is deferred until then. The dynamic specifier is required
 * because the module cannot be evaluated on a non-DOM platform.
 */
class LazyWebComponentViewResolver implements ViewResolver {
    #delegate: ViewResolver | undefined;

    async resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null> {
        if (!this.#delegate) {
            const { WebComponentViewResolver } = await import('@ndigo/view-webcomponent');
            this.#delegate = new WebComponentViewResolver();
        }

        return this.#delegate.resolveViewName(name, language, request);
    }
}

/**
 * Auto-configuration for browser-based applications.
 * Provisions argument resolvers and converter registries.
 */
@whenBrowser
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
        return createBrowserArgumentResolvers();
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
        return new ViewResolverComposite([new LazyWebComponentViewResolver(), new NameViewResolver()]);
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
