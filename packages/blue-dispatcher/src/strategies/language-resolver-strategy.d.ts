/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { LanguageResolver } from '../language-resolver';
import { StrategyInitializer } from './strategy-initializer';
export interface LanguageResolverStrategy {
    languageResolver: LanguageResolver;
    initLanguageResolver(context: ApplicationContext): void;
}
export declare const AsLanguageResolverStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<LanguageResolverStrategy> & T;
//# sourceMappingURL=language-resolver-strategy.d.ts.map