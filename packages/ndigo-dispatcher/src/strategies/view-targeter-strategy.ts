/**
 * View-targeter strategy.
 */

import { ApplicationContext, likeApplicationContextAware } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { ViewTargeter } from '@ndigo/view';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for view targeting: exposes the ordered
 * `viewTargeters` that choose where a rendered view is committed, and an
 * initializer that installs them from the application context.
 */
export interface ViewTargeterStrategy {
    /** The ordered view targeters. */
    viewTargeters: ViewTargeter[];
    /**
     * Installs the view-targeter chain.
     *
     * @param context - The application context.
     */
    initViewTargeters(context: ApplicationContext): void;
}

const VIEW_TARGETER = 'viewTargeter',
    VIEW_TARGETERS = `${VIEW_TARGETER}s`,
    /**
     * No default targeter: the registered `VIEW_TARGET` is already the
     * platform's destination, so a default chain entry would have to move
     * existing renders to justify itself. Node overrides this with its
     * behavior-preserving response targeter.
     */
    defaultViewTargeters: ViewTargeter[] = [];

/**
 * Mixin that installs the view-targeter chain, falling back to the registered
 * view target when the application configures none.
 */
export const AsViewTargeterStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewTargeterStrategy> & T =>
    class extends superclass implements ViewTargeterStrategy {
        readonly viewTargeterKey: string;
        readonly viewTargeterCollectionKey: string;

        viewTargeters!: ViewTargeter[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.viewTargeterKey = VIEW_TARGETER;
            this.viewTargeterCollectionKey = VIEW_TARGETERS;
            this.addStrategy(VIEW_TARGETERS);
        }

        initViewTargeters(context: ApplicationContext) {
            const { viewTargeterKey, viewTargeterCollectionKey } = this;

            this.initCollectionStrategy(
                context,
                viewTargeterCollectionKey,
                viewTargeterKey,
                VIEW_TARGETERS,
                defaultViewTargeters
            );

            // Targeters that own stateful destinations (DOM targets holding
            // event listeners) need the context before their first render.
            // Propagating here covers hand-assembled dispatchers too, not only
            // the platform presets.
            const targeters = this.viewTargeters ?? [];
            const length = targeters.length;
            for (let index = 0; index < length; index++) {
                const targeter = targeters[index];
                if (likeApplicationContextAware(targeter)) {
                    targeter.setApplicationContext(context);
                }
            }
        }
    };
