/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { ThemeResolver } from '../theme-resolver';
import { StrategyInitializer } from './strategy-initializer';
export interface ThemeResolverStrategy {
    themeResolver: ThemeResolver;
    initThemeResolver(context: ApplicationContext): void;
}
export declare const AsThemeResolverStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<ThemeResolverStrategy> & T;
//# sourceMappingURL=theme-resolver-strategy.d.ts.map