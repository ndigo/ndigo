/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContentSource, ThemeResolver } from '@blue/content';
import { JSONObject } from '@blue/core';
import { ConfigurableEnvironment } from './environment';
import { ApplicationContext, GenericApplicationContext } from './context';
import { ContextEventGateway, ContextEventGatewayOptions, ContextEventRelay } from './event-gateway';

/**
 * Options for creating a shell context.
 */
export interface ShellContextOptions {
    /**
     * Optional shell context name.
     */
    name?: string;
    /**
     * Initial values to populate the context with.
     */
    data?: JSONObject;
    /**
     * Overrides the shell content source.
     */
    contentSource?: ContentSource;
    /**
     * Overrides the shell environment.
     */
    environment?: ConfigurableEnvironment;
    /**
     * Sets the default theme name.
     */
    themeName?: string;
    /**
     * Overrides the shell theme resolver.
     */
    themeResolver?: ThemeResolver;
}

/**
 * Options for creating a feature context and its optional relay gateway.
 */
export interface FeatureContextOptions {
    /**
     * Creates the feature context instead of using `parent.newChild`.
     */
    createContext?: (parent: ApplicationContext) => ApplicationContext;
    /**
     * The feature context name.
     */
    name: string;
    /**
     * Initial values for the feature context.
     */
    data?: JSONObject;
    /**
     * Relay gateway validation options.
     */
    gatewayOptions?: ContextEventGatewayOptions;
    /**
     * Optional relay target context.
     */
    relayTarget?: ApplicationContext;
    /**
     * Event relays to attach to the feature context.
     */
    relays?: ContextEventRelay[];
}

/**
 * Result of mounting a feature context.
 */
export interface FeatureContextComposition {
    /**
     * The mounted feature context.
     */
    context: ApplicationContext;
    /**
     * Optional relay gateway attached to the feature.
     */
    gateway?: ContextEventGateway;
}

/**
 * Controls whether a feature context is closed or preserved during unmount.
 */
export type FeatureUnmountPolicy = 'close' | 'preserve';

/**
 * Create a shell/root context with optional infrastructure overrides.
 *
 * @param {module:context.ShellContextOptions} options Optional shell context options.
 * @returns {module:context.GenericApplicationContext} A configured shell context.
 */
export const createShellContext = (options: ShellContextOptions = {}): GenericApplicationContext => {
    const { contentSource, data, environment, name = 'shell', themeName, themeResolver } = options;
    const context = new GenericApplicationContext(name, data);

    // eslint-disable-next-line no-unused-expressions -- guarded dispatch: skip wiring when no override was provided
    contentSource && context.setContentSource(contentSource);
    // eslint-disable-next-line no-unused-expressions -- guarded dispatch: skip wiring when no override was provided
    environment && context.setEnvironment(environment);
    // eslint-disable-next-line no-unused-expressions -- guarded dispatch: skip wiring when no override was provided
    themeName && context.setThemeName(themeName);
    // eslint-disable-next-line no-unused-expressions -- guarded dispatch: skip wiring when no override was provided
    themeResolver && context.setThemeResolver(themeResolver);

    return context;
};

/**
 * Create a feature context as a child of `parent`, optionally wiring an allowlisted relay gateway.
 *
 * @param {module:context.ApplicationContext} parent The shell or owning parent context.
 * @param {module:context.FeatureContextOptions} options Feature context options.
 * @returns {module:context.FeatureContextComposition} The composed feature context and optional gateway.
 */
export const createFeatureContext = (
    parent: ApplicationContext,
    options: FeatureContextOptions
): FeatureContextComposition => {
    const { createContext, data, gatewayOptions, name, relayTarget = parent, relays = [] } = options;
    const context = createContext ? createContext(parent) : parent.newChild(name, data);

    if (context.parent !== parent) {
        context.setParent(parent);
    }

    if (!relays.length) {
        return { context };
    }

    return {
        context,
        gateway: new ContextEventGateway(context, relayTarget, relays, gatewayOptions),
    };
};

/**
 * Unmount a feature context by disconnecting relay gateway and optionally closing the context.
 *
 * @param {module:context.FeatureContextComposition} feature Feature context composition.
 * @param {module:context.FeatureUnmountPolicy} policy Unmount policy: preserve context or close it.
 */
export const unmountFeatureContext = (
    feature: FeatureContextComposition,
    policy: FeatureUnmountPolicy = 'preserve'
): void => {
    feature.gateway?.destroy();

    if (policy === 'close' && typeof feature.context.close === 'function') {
        feature.context.close();
    }
};

/**
 * Walk from `context` up to root (inclusive), invoking `visitor` for each node.
 *
 * @param {module:context.ApplicationContext} context The starting context.
 * @param {Function} visitor A callback invoked for each visited context.
 */
export const traverseToRoot = (context: ApplicationContext, visitor: (context: ApplicationContext) => void): void => {
    let node: ApplicationContext = context;

    visitor(node);

    while (node.parent) {
        node = node.parent;
        visitor(node);
    }
};

/**
 * Walk a subtree depth-first from `context` (inclusive), invoking `visitor` for each node.
 *
 * @param {module:context.ApplicationContext} context The subtree root.
 * @param {Function} visitor A callback invoked for each visited context.
 */
export const traverseSubtree = (context: ApplicationContext, visitor: (context: ApplicationContext) => void): void => {
    visitor(context);

    for (const child of context.children) {
        traverseSubtree(child, visitor);
    }
};

/**
 * Find the first ancestor (excluding self) that matches `predicate`.
 *
 * @param {module:context.ApplicationContext} context The starting context.
 * @param {Function} predicate Matching predicate.
 * @returns {(module:context.ApplicationContext|undefined)} The first matching ancestor, if found.
 */
export const findAncestor = (
    context: ApplicationContext,
    predicate: (context: ApplicationContext) => boolean
): ApplicationContext | undefined => {
    let node = context.parent;

    while (node) {
        if (predicate(node)) {
            return node;
        }

        node = node.parent;
    }

    return undefined;
};

/**
 * Find descendants (excluding root `context`) that match `predicate`.
 *
 * @param {module:context.ApplicationContext} context The subtree root.
 * @param {Function} predicate Matching predicate.
 * @returns {module:context.ApplicationContext[]} Matching descendants.
 */
export const findDescendants = (
    context: ApplicationContext,
    predicate: (context: ApplicationContext) => boolean
): ApplicationContext[] => {
    const descendants: ApplicationContext[] = [];

    traverseSubtree(context, (node) => {
        if (node !== context && predicate(node)) {
            descendants.push(node);
        }
    });

    return descendants;
};
