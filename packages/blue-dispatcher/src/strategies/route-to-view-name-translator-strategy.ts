/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { DefaultRouteToViewNameTranslator, RouteToViewNameTranslator } from '../route-to-view-name-translator';
import { Route } from '@blue/router';
import { StrategyInitializer } from './strategy-initializer';

export interface RouteToViewNameTranslatorStrategy {
    routeToViewNameTranslator: RouteToViewNameTranslator;
    initRouteToViewNameTranslator(context: ApplicationContext): void;
    getDefaultViewName(route: Route): string;
}

/**
 */

const ROUTE_TO_VIEW_NAME_TRANSLATOR = 'routeToViewNameTranslator',
    defaultRouteToViewNameTranslator: RouteToViewNameTranslator = new DefaultRouteToViewNameTranslator();

export const AsRouteToViewNameTranslatorStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteToViewNameTranslatorStrategy> & T =>
    class extends superclass implements RouteToViewNameTranslatorStrategy {
        readonly routeToViewNameTranslatorKey: string;

        routeToViewNameTranslator!: RouteToViewNameTranslator;

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.routeToViewNameTranslatorKey = ROUTE_TO_VIEW_NAME_TRANSLATOR;
            this.addStrategy(ROUTE_TO_VIEW_NAME_TRANSLATOR);
        }

        initRouteToViewNameTranslator(context: ApplicationContext) {
            const { routeToViewNameTranslatorKey } = this;

            this.initStrategy(
                context,
                routeToViewNameTranslatorKey,
                ROUTE_TO_VIEW_NAME_TRANSLATOR,
                defaultRouteToViewNameTranslator
            );
        }

        /**
         * Translate the supplied route into a default view name.
         * @param {module:router.Route} route The current route
         * @returns {string} The view name or `null` if no default found.
         */
        getDefaultViewName(route: Route): string {
            return this.routeToViewNameTranslator ? this.routeToViewNameTranslator.getViewName(route) : '';
        }
    };
