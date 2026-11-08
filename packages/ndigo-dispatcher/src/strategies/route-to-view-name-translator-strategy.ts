/**
 * Route-to-view-name translator strategy.
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { DefaultRouteToViewNameTranslator, RouteToViewNameTranslator } from '../route-to-view-name-translator';
import { Route } from '@ndigo/router';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for view-name translation: exposes the translator
 * that derives a view name from a route when a handler returns none, and an
 * initializer that installs it from the application context.
 */
export interface RouteToViewNameTranslatorStrategy {
    /** The translator that derives a view name from a route. */
    routeToViewNameTranslator: RouteToViewNameTranslator;
    /**
     * Installs the view-name translator.
     *
     * @param context - The application context.
     */
    initRouteToViewNameTranslator(context: ApplicationContext): void;
    /**
     * Derives the default view name for a route.
     *
     * @param route - The route to translate.
     * @returns The default view name.
     */
    getDefaultViewName(route: Route): string;
}

const ROUTE_TO_VIEW_NAME_TRANSLATOR = 'routeToViewNameTranslator',
    defaultRouteToViewNameTranslator: RouteToViewNameTranslator = new DefaultRouteToViewNameTranslator();

/**
 * Mixin that installs the route-to-view-name translator, defaulting to
 * `DefaultRouteToViewNameTranslator` when the application configures none.
 */
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
         * @param route - The current route
         * @returns The view name or `null` if no default found.
         */
        getDefaultViewName(route: Route): string {
            return this.routeToViewNameTranslator ? this.routeToViewNameTranslator.getViewName(route) : '';
        }
    };
