import {
    ApplicationContext,
    FeatureContextMountManager,
    NamespaceRelayValidationStrategy,
    createShellContext,
    type RelayValidationResult,
} from '@blue/context';
import { IllegalStateError } from '@blue/core';
import { BrowserDispatcher } from '@blue/dispatcher';
import { FeatureRoutingRegistry, Route, SiteRouter, restorePartitionPrefix } from '@blue/router';
import { HashRouter } from '@blue/platform-web';
import { FeatureMetricAggregator, getLogger } from '@blue/telemetry';
import { DISPATCHER, ROUTER } from './context-tokens';
import { authClient, initAuth } from './auth-store';
import { AuthRouterInterceptor } from './auth-router-interceptor';
import { ClientAuthGuard } from '@blue/auth-client';

export const TODO_ROUTE_PREFIX = '/todo';
export const ACCOUNT_ROUTE_PREFIX = '/account';
export const AUTH_ROUTE_PREFIX = '/auth';

export const toTodoShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, TODO_ROUTE_PREFIX);

export const toAccountShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, ACCOUNT_ROUTE_PREFIX);

export const toAuthShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, AUTH_ROUTE_PREFIX);

export const createTodoSiteRouter = (callback: (route: Route) => void): SiteRouter => {
    const router = new SiteRouter();
    router.mount(TODO_ROUTE_PREFIX, callback);
    return router;
};

export interface TodoRuntimeComposition {
    dispatcher: BrowserDispatcher;
    featureMetrics: FeatureMetricAggregator;
    featureMountManager: FeatureContextMountManager;
    featureRoutingRegistry: FeatureRoutingRegistry;
    shellRouter: HashRouter;
    shellContext: ApplicationContext;
    siteRouter: SiteRouter;
}

const logger = getLogger('blue-demo:shell-composition');
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

export const composeTodoRuntime = (todoContext: ApplicationContext): TodoRuntimeComposition => {
    // ── Initialize auth system ───────────────────────────────────────────────
    initAuth();
    const shellContext = createShellContext({
        name: 'site-shell',
    });

    todoContext.setParent(shellContext);

    const dispatcher = new BrowserDispatcher();
    dispatcher.initStrategies(todoContext);

    const featureMountManager = new FeatureContextMountManager(shellContext, {
        metricRecorder: featureMetricAggregator,
    });
    const featureRoutingRegistry = new FeatureRoutingRegistry(undefined, {
        activationPolicy: 'exclusive',
        metricRecorder: featureMetricAggregator,
    });

    featureMountManager.registerFeature({
        name: 'todo',
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
    });

    featureMountManager.registerFeature({
        name: 'account',
        data: {
            title: 'Account',
        },
        unmountPolicy: 'close',
    });

    const mountedFeature = featureMountManager.mount('todo');

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

    featureRoutingRegistry.registerFeature({
        name: 'todo',
        prefix: TODO_ROUTE_PREFIX,
        onActivate: () => {
            featureMountManager.mount('todo');
        },
        onDeactivate: () => {
            featureMountManager.unmount('todo');
            logRelayMetrics('todo', 'Todo feature relay metrics after unmount', 0, 0, 0);
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
        },
    });

    featureRoutingRegistry.registerFeature({
        name: 'account',
        prefix: ACCOUNT_ROUTE_PREFIX,
        onActivate: () => {
            featureMountManager.mount('account');
        },
        onDeactivate: () => {
            featureMountManager.unmount('account');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Account feature route handled', {
                feature: 'account',
                path: route.path,
            });
        },
    });

    
    const siteRouter = featureRoutingRegistry.siteRouter;

    const shellRouter = new HashRouter((route) => {
        featureRoutingRegistry.navigate(route.toString());
    });

    // ── Register auth interceptor on the shell router ─────────────────────────
    const authGuard = new ClientAuthGuard(authClient, '/auth/login', '/auth/forbidden');
    const authInterceptor = new AuthRouterInterceptor(authGuard);
    shellRouter.addInterceptor(authInterceptor);

    // ── Register auth-related features ────────────────────────────────────────
    featureMountManager.registerFeature({
        name: 'login',
        data: {
            title: 'Login',
        },
        unmountPolicy: 'close',
    });

    featureRoutingRegistry.registerFeature({
        name: 'login',
        prefix: '/auth/login',
        onActivate: () => {
            featureMountManager.mount('login');
        },
        onDeactivate: () => {
            featureMountManager.unmount('login');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Login route handled', {
                feature: 'login',
                path: route.path,
            });
        },
    });

    featureMountManager.registerFeature({
        name: 'profile',
        data: {
            title: 'Profile',
        },
        unmountPolicy: 'close',
    });

    featureRoutingRegistry.registerFeature({
        name: 'profile',
        prefix: '/auth/profile',
        onActivate: () => {
            featureMountManager.mount('profile');
        },
        onDeactivate: () => {
            featureMountManager.unmount('profile');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Profile route handled', {
                feature: 'profile',
                path: route.path,
            });
        },
    });

    featureMountManager.registerFeature({
        name: 'admin',
        data: {
            title: 'Admin Panel',
        },
        unmountPolicy: 'close',
    });

    featureRoutingRegistry.registerFeature({
        name: 'admin',
        prefix: '/auth/admin',
        onActivate: () => {
            featureMountManager.mount('admin');
        },
        onDeactivate: () => {
            featureMountManager.unmount('admin');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Admin route handled', {
                feature: 'admin',
                path: route.path,
            });
        },
    });

    featureMountManager.registerFeature({
        name: 'forbidden',
        data: {
            title: 'Forbidden',
        },
        unmountPolicy: 'close',
    });

    featureRoutingRegistry.registerFeature({
        name: 'forbidden',
        prefix: '/auth/forbidden',
        onActivate: () => {
            featureMountManager.mount('forbidden');
        },
        onDeactivate: () => {
            featureMountManager.unmount('forbidden');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Forbidden route handled', {
                feature: 'forbidden',
                path: route.path,
            });
        },
    });

    shellContext.setValue(ROUTER, shellRouter);
    shellContext.setValue(DISPATCHER, dispatcher);
    todoContext.setValue(ROUTER, shellRouter);
    todoContext.setValue(DISPATCHER, dispatcher);

    return {
        dispatcher,
        featureMetrics: featureMetricAggregator,
        featureMountManager,
        featureRoutingRegistry,
        shellRouter,
        shellContext,
        siteRouter,
    };
};
