/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    ApplicationContext,
    createShellContext,
    NamespaceRelayValidationStrategy,
    RelayValidationResult,
} from '@blue/context';
import { IllegalStateError } from '@blue/core';
import { BrowserDispatcher, HashRouter } from '@blue/platform-web';
import { Route, restorePartitionPrefix, RouteDefinition, RouteRegistry } from '@blue/router';
import { HostManager } from '@blue/host';
import { FeatureMetricAggregator, getLogger } from '@blue/telemetry';
import { DISPATCHER, ROUTER, ROUTE_REGISTRY } from './context-tokens';
import IndexController from './index-controller';
import AccountController from './account-controller';
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

const logger = getLogger('blue-todo:shell-composition');
const featureMetricAggregator = new FeatureMetricAggregator();

interface RelayMetrics {
    activeRelayCount: number;
    blockedRelayCount: number;
    relayedEventCount: number;
}

const resolveRelayMetrics = (gateway: {
    blockedRelays: readonly unknown[];
    relays: readonly unknown[];
}): RelayMetrics => {
    const counter = gateway as { relayedEventCount?: number };

    return {
        activeRelayCount: gateway.relays.length,
        blockedRelayCount: gateway.blockedRelays.length,
        relayedEventCount: counter.relayedEventCount ?? 0,
    };
};

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

export const composeTodoRuntime = (todoContext: ApplicationContext): TodoRuntimeComposition => {
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
            logRelayMetrics('todo', 'Todo feature relay metrics after unmount', 0, 0, 0);
        },
    });

    host.registerFeature({
        name: 'account',
        prefix: ACCOUNT_ROUTE_PREFIX,
        data: {
            title: 'Account',
        },
        unmountPolicy: 'close',
        onRoute: dispatchRoute('account', dispatcher),
    });

    const mountedFeature = host.mount('todo');

    if (!mountedFeature.gateway) {
        throw new IllegalStateError('Todo feature relay gateway was not created');
    }

    const mountedMetrics = resolveRelayMetrics(mountedFeature.gateway);

    logRelayMetrics(
        'todo',
        'Todo feature relay metrics after mount',
        mountedMetrics.blockedRelayCount,
        mountedMetrics.activeRelayCount,
        mountedMetrics.relayedEventCount
    );

    // ── Shell router: hash URLs → host partition navigation ──────────────────
    const shellRouter = new HashRouter((route) => {
        host.navigate(route.toString());
    });
    const authInterceptor = new AuthRouterInterceptor();

    // ── Register auth interceptor on the shell router ─────────────────────────
    shellRouter.addInterceptor(authInterceptor);

    // ── Auth-related features ─────────────────────────────────────────────────
    host.registerFeature({
        name: 'login',
        prefix: '/auth/login',
        data: {
            title: 'Login',
        },
        unmountPolicy: 'close',
        onRoute: dispatchRoute('login', dispatcher),
    });

    host.registerFeature({
        name: 'profile',
        prefix: '/auth/profile',
        data: {
            title: 'Profile',
        },
        unmountPolicy: 'close',
        onRoute: dispatchRoute('profile', dispatcher),
    });

    host.registerFeature({
        name: 'admin',
        prefix: '/auth/admin',
        data: {
            title: 'Admin Panel',
        },
        unmountPolicy: 'close',
        onRoute: dispatchRoute('admin', dispatcher),
    });

    host.registerFeature({
        name: 'forbidden',
        prefix: '/auth/forbidden',
        data: {
            title: 'Forbidden',
        },
        unmountPolicy: 'close',
        onRoute: dispatchRoute('forbidden', dispatcher),
    });

    shellContext.setValue(ROUTER, shellRouter);
    shellContext.setValue(DISPATCHER, dispatcher);
    todoContext.setValue(ROUTER, shellRouter);
    todoContext.setValue(DISPATCHER, dispatcher);

    // Populate module-level routes for views. `@blue/boot`'s Application
    // auto-registers a scanned RouteRegistry ('routeRegistry'); without boot
    // (Vite dev) scan the app controllers directly — the RouteRegistry
    // authoring pattern: typed definitions derived from @routeMapping
    // metadata, with manual fallbacks for feature partitions (which have no
    // controller route of their own).
    const registry = (todoContext.getValue(ROUTE_REGISTRY) as RouteRegistry | undefined) ?? new RouteRegistry();
    registry.scanSources([IndexController, AccountController], todoContext);
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

    return {
        dispatcher,
        featureMetrics: featureMetricAggregator,
        host,
        shellRouter,
        shellContext,
        routes,
    };
};
