/**
 */
import {
    ApplicationContext,
    createShellContext,
    NamespaceRelayValidationStrategy,
    RelayValidationResult,
    type ContextEventGateway,
} from '@ndigo/context';
import { IllegalStateError } from '@ndigo/core';
import { BrowserDispatcher, HashRouter } from '@ndigo/platform-web';
import { PathRoute, Route, restorePartitionPrefix, RouteDefinition, RouteRegistry } from '@ndigo/router';
import { HostManager } from '@ndigo/host';
import { FeatureMetricAggregator } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';
import { DISPATCHER, ROUTER, ROUTE_REGISTRY } from './context-tokens';
import IndexController from './index-controller';
import AccountController from './account-controller';
import AuthController from './auth-controller';
import { initAuth } from './auth-store';
import { AuthRouterInterceptor } from './auth-router-interceptor';

export const TODO_ROUTE_PREFIX = '/todo';
export const ACCOUNT_ROUTE_PREFIX = '/account';
export const AUTH_ROUTE_PREFIX = '/auth';

export const toTodoShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, TODO_ROUTE_PREFIX);

export const toAccountShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, ACCOUNT_ROUTE_PREFIX);

export const toAuthShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, AUTH_ROUTE_PREFIX);

/**
 * Module-level route definitions populated during composeTodoRuntime.
 * Used by views to generate type-safe hrefs.
 */
export const routes: Record<string, RouteDefinition> = {};

export interface TodoRuntimeComposition {
    dispatcher: BrowserDispatcher;
    featureMetrics: FeatureMetricAggregator;
    host: HostManager;
    shellRouter: HashRouter;
    shellContext: ApplicationContext;
    routes: Record<string, RouteDefinition>;
}

const logger = getLogger('ndigo-todo-web:shell-composition');
const featureMetricAggregator = new FeatureMetricAggregator();

interface RelayMetrics {
    activeRelayCount: number;
    blockedRelayCount: number;
    relayedEventCount: number;
}

const resolveRelayMetrics = (gateway: ContextEventGateway): RelayMetrics => ({
    activeRelayCount: gateway.activeRelayCount,
    blockedRelayCount: gateway.blockedRelayCount,
    relayedEventCount: gateway.relayedEventCount,
});

const logRelayMetrics = (
    featureName: string,
    label: string,
    blockedRelayCount: number,
    activeRelayCount: number,
    relayedEventCount: number
): void => {
    featureMetricAggregator.setGauge(featureName, `${featureName}.activeRelayCount`, activeRelayCount);
    featureMetricAggregator.setGauge(featureName, `${featureName}.blockedRelayCount`, blockedRelayCount);
    featureMetricAggregator.setGauge(featureName, `${featureName}.relayedEventCount`, relayedEventCount);

    logger.info(label, {
        activeRelayCount,
        blockedRelayCount,
        feature: featureName,
        relayedEventCount,
    });
};

const logBlockedRelay = (result: RelayValidationResult): void => {
    featureMetricAggregator.incrementCounter('todo', 'todo.blockedRelayCount');

    logger.warn('Blocked context relay registration', {
        feature: 'todo',
        reason: result.reason ?? 'unknown',
        relayFrom: String(result.relay.from),
        relayTo: String(result.relay.to),
    });
};

const logRegisteredRelay = (result: { from: string | symbol; to: string | symbol }): void => {
    featureMetricAggregator.incrementCounter('todo', 'todo.registeredRelayCount');

    logger.info('Registered context relay', {
        feature: 'todo',
        relayFrom: String(result.from),
        relayTo: String(result.to),
    });
};

const dispatchRoute =
    (feature: string, dispatcher: BrowserDispatcher) =>
    (route: Route): void => {
        void dispatcher.dispatch(route);
        logger.info(`${feature} route handled`, { feature, path: route.path });
    };

export const composeTodoRuntime = async (todoContext: ApplicationContext): Promise<TodoRuntimeComposition> => {
    // ── Initialize auth system ───────────────────────────────────────────────
    initAuth();
    const shellContext = createShellContext({
        name: 'site-shell',
    });

    todoContext.setParent(shellContext);

    const dispatcher = new BrowserDispatcher();
    dispatcher.initStrategies(todoContext);

    // ── Host manager: one-call registration of features + route partitions ──
    const host = new HostManager(shellContext, {
        activationPolicy: 'exclusive',
        metricRecorder: featureMetricAggregator,
    });

    // The relay gateway only exists after mount; captured here so the
    // deactivation hook can report the real counters instead of zeros.
    let todoGateway: ContextEventGateway | undefined;

    host.registerFeature({
        name: 'todo',
        prefix: TODO_ROUTE_PREFIX,
        createContext: () => todoContext,
        gatewayOptions: {
            validationStrategy: new NamespaceRelayValidationStrategy({
                featureNamespace: 'todo',
            }),
            diagnosticHandler: {
                onRelayBlocked: logBlockedRelay,
                onRelayRegistered: logRegisteredRelay,
            },
        },
        relays: [
            {
                from: 'todo:stats:updated',
                to: 'site:nav:badge:update',
            },
        ],
        unmountPolicy: 'preserve',
        onRoute: (route) => {
            void dispatcher.dispatch(route);
        },
        onDeactivate: () => {
            const metrics = todoGateway
                ? resolveRelayMetrics(todoGateway)
                : { activeRelayCount: 0, blockedRelayCount: 0, relayedEventCount: 0 };

            logRelayMetrics(
                'todo',
                'Todo feature relay metrics after unmount',
                metrics.blockedRelayCount,
                metrics.activeRelayCount,
                metrics.relayedEventCount
            );
        },
    });

    host.registerFeature({
        name: 'account',
        prefix: ACCOUNT_ROUTE_PREFIX,
        data: {
            title: 'Account',
        },
        unmountPolicy: 'close',
        // The partition router strips the mount prefix before `onRoute`, so a
        // naively dispatched route reaches the shared dispatcher as `/` or
        // `/settings`. Unlike the todo feature (whose IndexController is
        // root-relative), AccountController is registered at its `/account`
        // shell path — restore the prefix so `#/account` → `/account` and
        // `#/account/settings` → `/account/settings` reach the account
        // controller instead of the todo root.
        onRoute: (route) => dispatchRoute('account', dispatcher)(new PathRoute(toAccountShellRoute(route.path))),
    });

    // ── Shell router: hash URLs → host partition navigation ──────────────────
    const shellRouter = new HashRouter((route) => {
        host.navigate(route.toString());
    });
    const authInterceptor = new AuthRouterInterceptor();

    // ── Register auth interceptor on the shell router ─────────────────────────
    shellRouter.addInterceptor(authInterceptor);

    // ── Auth feature partition ────────────────────────────────────────────────
    // One `/auth` partition for login/profile/admin/forbidden. The partition
    // router strips the mount prefix before `onRoute`, so restore it (as the
    // account feature does) to reach `AuthController`'s `/auth/...` mappings.
    host.registerFeature({
        name: 'auth',
        prefix: AUTH_ROUTE_PREFIX,
        data: {
            title: 'Authentication',
        },
        unmountPolicy: 'close',
        onRoute: (route) => dispatchRoute('auth', dispatcher)(new PathRoute(toAuthShellRoute(route.path))),
    });

    shellContext.setValue(ROUTER, shellRouter);
    shellContext.setValue(DISPATCHER, dispatcher);
    todoContext.setValue(ROUTER, shellRouter);
    todoContext.setValue(DISPATCHER, dispatcher);

    // Populate module-level routes for views. Register the app's controllers
    // on a RouteRegistry — the RouteRegistry authoring pattern: typed
    // definitions derived from @routeMapping metadata, with manual fallbacks
    // for feature partitions (which have no controller route of their own).
    const registry = (todoContext.getValue(ROUTE_REGISTRY) as RouteRegistry | undefined) ?? new RouteRegistry();
    registry.scanSources([IndexController, AccountController, AuthController], todoContext);
    if (registry) {
        routes.todoAll = new RouteDefinition('/todo', todoContext);
        routes.todoActive = new RouteDefinition('/todo/active', todoContext);
        routes.todoCompleted = new RouteDefinition('/todo/completed', todoContext);
        routes.accountOverview = registry.get('account') ?? new RouteDefinition('/account', todoContext);
        routes.accountSettings =
            registry.get('account.settings') ?? new RouteDefinition('/account/settings', todoContext);
        routes.authLogin = new RouteDefinition('/auth/login', todoContext);
        routes.authProfile = new RouteDefinition('/auth/profile', todoContext);
        routes.authAdmin = new RouteDefinition('/auth/admin', todoContext);
    }

    // Boot on the todo partition: activate it through the routing registry
    // (rather than a bare `host.mount`) so the host tracks it as the active
    // feature, and so the shell router's current route matches the active
    // partition — a later `refresh()` from the todo service's signal effect
    // would otherwise navigate the home route and deactivate the feature.
    await shellRouter.navigate(TODO_ROUTE_PREFIX);

    const mountedFeature = host.getMountedFeature('todo');

    if (!mountedFeature?.gateway) {
        throw new IllegalStateError('Todo feature relay gateway was not created');
    }

    todoGateway = mountedFeature.gateway;

    const mountedMetrics = resolveRelayMetrics(mountedFeature.gateway);

    logRelayMetrics(
        'todo',
        'Todo feature relay metrics after mount',
        mountedMetrics.blockedRelayCount,
        mountedMetrics.activeRelayCount,
        mountedMetrics.relayedEventCount
    );

    return {
        dispatcher,
        featureMetrics: featureMetricAggregator,
        host,
        shellRouter,
        shellContext,
        routes,
    };
};
