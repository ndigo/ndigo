import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { LanguageResolver, NavigatorLanguageResolver } from '../language-resolver';
import { StrategyInitializer } from './strategy-initializer';

export interface LanguageResolverStrategy {
    languageResolver: LanguageResolver;
    initLanguageResolver(context: ApplicationContext): void;
}

/**
 */

const LANGUAGE_RESOLVER = 'languageResolver',
    defaultLanguageResolver: LanguageResolver = new NavigatorLanguageResolver('en-US');

export const AsLanguageResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<LanguageResolverStrategy> & T =>
    class extends superclass implements LanguageResolverStrategy {
        readonly languageResolverKey: string;

        languageResolver!: LanguageResolver;

        constructor(...args: any[]) {
            super(...args);
            this.languageResolverKey = LANGUAGE_RESOLVER;
            this.addStrategy(LANGUAGE_RESOLVER);
        }

        initLanguageResolver(context: ApplicationContext) {
            const { languageResolverKey } = this;

            this.initStrategy(context, languageResolverKey, LANGUAGE_RESOLVER, defaultLanguageResolver);
        }
    };
