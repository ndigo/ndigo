/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { StrategyInitializer } from './strategy-initializer';

export interface ViewMappingStrategy {
    viewMapping;
    initViewMapping(context: ApplicationContext): void;
}

/**
 * @interface module:dispatcher.ViewMappingStrategy
 */

export const defaultViewMapping = null;

export const AsViewMappingStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewMappingStrategy> & T =>
    class extends superclass implements ViewMappingStrategy {
        readonly viewMappingKey = 'viewMapping';

        viewMapping;

        initViewMapping(context: ApplicationContext) {
            const { viewMappingKey } = this;

            this.initStrategy(context, viewMappingKey, 'viewMapping', defaultViewMapping);

            console.log('Dispatcher::initViewMapping', this.viewMapping);
        }
    };
