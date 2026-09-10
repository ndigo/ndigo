import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { StrategyInitializer } from './strategy-initializer';

export interface ViewMappingStrategy {
    viewMapping: unknown;
    initViewMapping(context: ApplicationContext): void;
}

/**
 */

export const defaultViewMapping = null;

export const AsViewMappingStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewMappingStrategy> & T =>
    class extends superclass implements ViewMappingStrategy {
        readonly viewMappingKey = 'viewMapping';

        viewMapping!: unknown;

        initViewMapping(context: ApplicationContext) {
            const { viewMappingKey } = this;

            this.initStrategy(context, viewMappingKey, 'viewMapping', defaultViewMapping);
        }
    };
