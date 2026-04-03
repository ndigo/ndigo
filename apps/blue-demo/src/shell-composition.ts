import {
    ApplicationContext,
    FeatureContextMountManager,
    NamespaceRelayValidationStrategy,
    createShellContext,
    type RelayValidationResult,
} from '@blue/context';
import { IllegalStateError } from '@blue/core';
import { BrowserDispatcher } from '@blue/dispatcher';
import { FeatureRoutingRegistry, HashRouter, Route, SiteRouter, restorePartitionPrefix } from '@blue/router';
import { FeatureMetricAggregator, getLogger } from '@blue/telemetry';
import { DISPATCHER, ROUTER } from './context-tokens';

export const TODO_ROUTE_PREFIX = '/todo';
export const ACCOUNT_ROUTE_PREFIX = '/account';
export const NOTES_ROUTE_PREFIX = '/notes';

export const toTodoShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, TODO_ROUTE_PREFIX);

export const toAccountShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, ACCOUNT_ROUTE_PREFIX);

export const toNotesShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, NOTES_ROUTE_PREFIX);

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

    featureMountManager.registerFeature({
        name: 'notes',
        data: {
            title: 'Notes',
        },
        unmountPolicy: 'close',
    });

    featureRoutingRegistry.registerFeature({
        name: 'notes',
        prefix: NOTES_ROUTE_PREFIX,
        onActivate: () => {
            featureMountManager.mount('notes');
        },
        onDeactivate: () => {
            featureMountManager.unmount('notes');
        },
        onRoute: (route) => {
            dispatcher.dispatch(route);
            logger.info('Notes feature route handled', {
                feature: 'notes',
                path: route.path,
            });
        },
    });

    const siteRouter = featureRoutingRegistry.siteRouter;

    const shellRouter = new HashRouter((route) => {
        featureRoutingRegistry.navigate(route.toString());
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
