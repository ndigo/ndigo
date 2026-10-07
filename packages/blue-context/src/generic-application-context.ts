/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject, direct, escalate } from '@blue/core';
import {
    ContentSource,
    LanguageCode,
    MessageParams,
    MessageSource,
    StaticContentSource,
    Theme,
    ThemeResolver,
    StaticThemeResolver,
} from '@blue/content';
import { AsEventEmitter, EventType } from './event-emitter';
import {
    DefaultLifecycleProcessor,
    LifecycleProcessor,
    likeEntryRegistryProcessor,
    DefaultFactory,
    Factory,
    likeCloseable,
    likeDestroyable,
    RefreshScope,
} from '@blue/factory';
import { Environment, StandardEnvironment, ConfigurableEnvironment, CONFIG_REFRESH_EVENT } from './environment';
import { AsModuleResourceLoader } from './resource';
import { ApplicationContext } from './context-interfaces';
import { defineProperty, ownKeys } from './context-shared';
import { ApplicationContextAwareProcessor } from './application-context-aware-processor';
import { resolveSchemaConfig } from './schema-config';
import type { z } from 'zod';
import { getLogger } from '@blue/log';

const logger = getLogger('blue-context:application-context');

let uuid = 0;

/**
 * Default application context implementation used throughout the package.
 */
export class GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory)) {
    #children: GenericApplicationContext[];
    #contentSource: ContentSource;
    #customThemeResolver: boolean;
    #environment: Environment | null;
    #refreshEnvironment: ConfigurableEnvironment | null = null;
    #refreshListener: (() => void) | null = null;
    #refreshFailHandler: ((error: Error) => void) | null = null;
    #id!: number;
    #isActive: boolean;
    #lifecycleProcessor: LifecycleProcessor | null;
    #messageSource: MessageSource | null;
    #name: string;
    #parent: ApplicationContext | null;
    #themeName: string;
    #themeResolver: ThemeResolver | null;

    createdTimestamp!: number;
    destroyed!: boolean;
    destroyedTimestamp?: number;

    /**
     * The lazily created environment for this context.
     */
    get environment(): Environment {
        if (!this.#environment) {
            this.#environment = this._createEnvironment();
            this.#wireRefreshScope(this.#environment as ConfigurableEnvironment);
        }
        return this.#environment;
    }

    /**
     * Schema-typed configuration read off the context environment (AD-34 D3).
     */
    typedConfig<S extends z.ZodType>(prefix: string, schema: S): z.infer<S> | undefined {
        return resolveSchemaConfig(schema, prefix, this.environment);
    }

    /**
     * The content source used to resolve theme content.
     */
    get contentSource(): ContentSource {
        return this.#contentSource;
    }

    /**
     * The direct child contexts.
     */
    get children(): readonly ApplicationContext[] {
        return this.#children;
    }

    /**
     * The stable identifier assigned at construction.
     */
    get id(): number {
        return this.#id;
    }

    /**
     * Indicates whether the context has been refreshed and not yet closed.
     */
    get isActive(): boolean {
        return this.#isActive;
    }

    /**
     * The configured context name.
     */
    get name(): string {
        return this.#name;
    }

    /**
     * The current parent context.
     */
    get parent(): ApplicationContext | null {
        return this.#parent;
    }

    /**
     * The slash-delimited hierarchy path from the root to this context.
     */
    get path(): string {
        const path: string[] = [];
        // eslint-disable-next-line no-this-alias -- cursor walks the parent chain; not a scope-escape alias
        let ctx: ApplicationContext = this;

        // eslint-disable-next-line no-unused-expressions -- guarded dispatch: include name only when present
        this.name && path.unshift(this.name);

        while (ctx.parent) {
            ctx = ctx.parent;
            path.unshift(ctx.name);
        }

        return path.join('/');
    }

    /**
     * The default theme name associated with this context.
     */
    get themeName(): string {
        return this.#themeName;
    }

    /**
     * Creates a new application context.
     *
     * @param name - The optional context name.
     * @param data - Optional initial values to register.
     */
    constructor(name?: string, data?: JSONObject) {
        super();

        this.#contentSource = new StaticContentSource();
        this.#children = [];
        this.#customThemeResolver = false;
        this.#environment = null;
        this.#isActive = false;
        this.#lifecycleProcessor = null;
        this.#messageSource = null;
        this.#name = name ?? '';
        this.#parent = null;
        this.#themeName = 'default';
        this.#themeResolver = null;

        this.setId(++uuid);

        defineProperty(this, 'createdTimestamp', {
            value: Date.now(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'root', {
            value: this,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'destroyedTimestamp', {
            value: -1,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        if (data) {
            for (const key in data) {
                this.setValue(key, data[key]);
            }
        }
    }

    /**
     * Broadcasts an event to all descendants.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     */
    broadcast(type: EventType, ...data: unknown[]): void {
        direct<ApplicationContext>(this, (targetContext) => targetContext.emit(type, ...data), true);
    }

    /**
     * Emits an event to parent contexts.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     */
    bubble(type: EventType, ...data: unknown[]): void {
        escalate<ApplicationContext>(this, (parentContext) => parentContext.emit(type, ...data), true);
    }

    /**
     * Closes the context and all descendants.
     *
     * Teardown sequence: emit `context:close`, close each child, run the
     * lifecycle processor's `onClose`, destroy managed values, detach the
     * environment refresh subscription ({@link unsubscribeRefresh}), unhook
     * from the parent, mark `destroyed`/`destroyedTimestamp`, emit
     * `context:destroy`, then remove every listener.
     *
     * Exception-safe (CTX-06): a throwing listener or teardown hook is
     * reported and swallowed so the remaining steps still run — `destroyed`
     * is always set and children/beans are still torn down. Exceptions from
     * `context:close`/`context:destroy` listeners otherwise abort teardown
     * mid-way (the emitter re-throws when no `error` listener is attached).
     */
    close(): void {
        if (this.destroyed) {
            return;
        }

        try {
            this.emit('context:close', this);
        } catch (error) {
            this.#reportTeardownError(error);
        }

        // eslint-disable-next-line unicorn/no-useless-spread -- snapshot is required: child.close() splices this.#children via removeChild during iteration
        for (const child of [...this.#children]) {
            try {
                child.close();
            } catch (error) {
                this.#reportTeardownError(error);
            }
        }

        try {
            this.#lifecycleProcessor?.onClose(this);
        } catch (error) {
            this.#reportTeardownError(error);
        }
        try {
            this._destroyValues();
        } catch (error) {
            this.#reportTeardownError(error);
        }
        // ARC-6: a closed context must not stay reachable through the
        // environment — later config:refresh events must not write into it.
        try {
            this.unsubscribeRefresh();
        } catch (error) {
            this.#reportTeardownError(error);
        }
        if (this.parent instanceof GenericApplicationContext) {
            try {
                this.parent.removeChild(this);
            } catch (error) {
                this.#reportTeardownError(error);
            }
        }

        defineProperty(this, 'destroyed', {
            value: true,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'destroyedTimestamp', {
            value: Date.now(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#isActive = false;
        try {
            this.emit('context:destroy', this);
        } catch (error) {
            this.#reportTeardownError(error);
        }

        for (const eventType of this.eventTypes()) {
            const listeners = this.listeners(eventType);
            for (const listener of listeners) {
                this.off(eventType, listener);
            }
        }
    }

    /**
     * Reports a teardown failure and swallows it so close() can continue
     * (CTX-06). Teardown is best-effort by contract: every step must run.
     *
     * @param error - The error thrown by a teardown listener or hook.
     */
    #reportTeardownError(error: unknown): void {
        logger.error(
            `[blue-context] error during teardown of "${this.#name ?? 'context'}"; teardown continues (CTX-06)`,
            error instanceof Error ? error : String(error)
        );
    }

    /**
     * Releases this context's resources.
     */
    destroy(): void {
        this.close();
    }

    /**
     * Resolves content locally and then delegates to the parent if needed.
     * Missing content resolves to the key itself, matching the content
     * layer's fallback convention.
     *
     * @param key - The content key.
     * @param language - The language identifier.
     * @returns The resolved content.
     */
    async getContent(key: string, language: string | LanguageCode): Promise<string> {
        const local = this.#contentSource ? await this.#contentSource.getContent(key, language) : undefined;

        if (local !== undefined && local !== key) {
            return local;
        }

        if (this.parent) {
            return this.parent.getContent(key, language);
        }

        return local ?? key;
    }

    /**
     * Resolves and formats a message, delegating to the registered message
     * source when present, the content source otherwise, and the parent
     * context last.
     *
     * @param key - The message key to resolve.
     * @param params - Optional formatting parameters.
     * @param language - The language to use.
     * @returns The formatted message, or the key when nothing resolves it.
     */
    async getMessage(key: string, params?: MessageParams, language?: string | LanguageCode): Promise<string> {
        let value: string | undefined;
        if (this.#messageSource) {
            value = await this.#messageSource.getMessage(key, params, language);
        }
        if (value === undefined || value === key) {
            value = await this.#contentSource.getContent(key, language ?? '');
        }
        if (value !== undefined && value !== key) {
            return value;
        }
        if (this.parent) {
            const parentValue = await this.parent.getMessage(key, params, language);
            if (parentValue !== undefined && parentValue !== key) {
                return parentValue;
            }
        }
        return key;
    }

    /**
     * Resolves a theme by name or the default theme.
     *
     * @param name - Optional theme name.
     * @returns The resolved theme.
     */
    getTheme(name?: string): Theme {
        if (!this.#themeResolver) {
            this.#themeResolver = this._createThemeResolver();
        }

        return this.#themeResolver.getTheme(name || this.#themeName);
    }

    /**
     * Returns whether the given context is a direct child.
     *
     * @param node - The application context to check for.
     * @returns `true` when the context is a child, false otherwise.
     */
    hasChild(node: ApplicationContext): boolean {
        return this.#children.includes(node as GenericApplicationContext);
    }

    /**
     * Creates and attaches a child context.
     *
     * @param name - The optional context name.
     * @param data - Optional initial child data.
     * @returns The created child application context.
     */
    newChild(name?: string, data?: JSONObject): ApplicationContext {
        const child = new GenericApplicationContext(name, data);
        child.setParent(this);
        return child;
    }

    /**
     * Initializes the context lifecycle if it is not already active.
     */
    refresh(): void {
        if (this.#isActive) {
            return;
        }

        this.emit('context:preparing', this);

        this._prepareFactory();
        this._postProcessFactory();
        this._invokeRegistryProcessors();
        this._finishFactoryInitialization();
        this._onRefresh();

        if (!this.#lifecycleProcessor) {
            this.#lifecycleProcessor = new DefaultLifecycleProcessor();
        }

        this.#lifecycleProcessor.onRefresh(this);
        this.#isActive = true;
        this.emit('context:refresh', this);
    }

    /**
     * Removes a child from the direct child list.
     *
     * @param node - The child application context to remove.
     * @returns `true` when the child was successfully removed, false otherwise.
     */
    removeChild(node: ApplicationContext): boolean {
        const index = this.#children.indexOf(node as GenericApplicationContext);

        if (index === -1) {
            return false;
        }

        this.#children.splice(index, 1);
        return true;
    }

    /**
     * Replaces the content source used by this context.
     */
    setContentSource(contentSource: ContentSource): void {
        this.#contentSource = contentSource;

        if (!this.#customThemeResolver) {
            this.#themeResolver = null;
        }
    }

    /**
     * Replaces the message source used by message lookups.
     *
     * @param messageSource - The message source to attach.
     */
    setMessageSource(messageSource: MessageSource): void {
        this.#messageSource = messageSource;
    }

    /**
     * Replaces the environment used by this context.
     */
    setEnvironment(environment: ConfigurableEnvironment): void {
        this.unsubscribeRefresh();
        this.#environment = environment;
        this.#wireRefreshScope(environment);
    }

    /**
     * Wires the registered `refresh` scope's `clear()` to the environment's
     * `config:refresh` event (AD-29 D-2): refresh-scoped beans re-create from
     * their factories when the environment refreshes. Re-subscribing on a new
     * environment detaches the previous subscription (listener identity
     * tracked).
     *
     * A fail-loud `'error'` handler is registered alongside the refresh
     * listener (ARC-1): the emitter re-dispatches listener exceptions as
     * `'error'` events, and with no handler those would vanish — a throwing
     * `@destroyable` teardown or rebind failure must reach the console, not
     * silently half-apply a refresh.
     */
    #wireRefreshScope(environment: ConfigurableEnvironment): void {
        const refreshScope = this.getScope('refresh');
        if (refreshScope instanceof RefreshScope) {
            this.#refreshListener = () => refreshScope.clear();
            this.#refreshFailHandler = (error: Error) => {
                logger.error(
                    `[blue-context] config:refresh listener failed (${this.#name ?? 'context'}): the refresh ` +
                        'may have half-applied — see the exception below.',
                    error
                );
            };
            environment.on(CONFIG_REFRESH_EVENT, this.#refreshListener);
            environment.on('error', this.#refreshFailHandler);
            this.#refreshEnvironment = environment;
        }
    }

    /**
     * Detaches the refresh listener and its fail-loud handler from the wired
     * environment (ARC-6): a closed context must not stay reachable through
     * the environment, and a later `refresh()` must not write into it.
     */
    unsubscribeRefresh(): void {
        if (this.#refreshEnvironment && this.#refreshListener) {
            this.#refreshEnvironment.off(CONFIG_REFRESH_EVENT, this.#refreshListener);
        }
        if (this.#refreshEnvironment && this.#refreshFailHandler) {
            this.#refreshEnvironment.off('error', this.#refreshFailHandler);
        }
        this.#refreshEnvironment = null;
        this.#refreshListener = null;
        this.#refreshFailHandler = null;
    }

    /**
     * Updates the identifier assigned to this context.
     */
    setId(id: number): void {
        this.#id = id;
    }

    /**
     * Updates the context name.
     */
    setName(name: string): void {
        this.#name = name;
    }

    /**
     * Reassigns the parent context and keeps the child list in sync.
     */
    setParent(parent: ApplicationContext): void {
        if (this.#parent instanceof GenericApplicationContext) {
            this.#parent.removeChild(this);
        }

        this.#parent = parent;

        if (parent instanceof GenericApplicationContext && !parent.hasChild(this)) {
            parent.#children.push(this);
        }

        // Wire the factory parent chain so getValue/hasValue walk up through context hierarchy
        super.setParent(parent as Factory);

        defineProperty(this, 'root', {
            value: this._resolveRoot(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Updates the default theme name.
     */
    setThemeName(themeName: string): void {
        this.#themeName = themeName;
    }

    /**
     * Overrides the theme resolver used by this context.
     */
    setThemeResolver(themeResolver: ThemeResolver): void {
        this.#customThemeResolver = true;
        this.#themeResolver = themeResolver;
    }

    protected _createEnvironment(): Environment {
        return new StandardEnvironment();
    }

    protected _createThemeResolver(): ThemeResolver {
        return new StaticThemeResolver(
            [
                {
                    name: this.#themeName,
                    contentSource: this.#contentSource,
                },
            ],
            this.#themeName
        );
    }

    protected _destroyValues(): void {
        const names: Set<string> = new Set();

        for (const key of ownKeys(this)) {
            if (typeof key !== 'string') {
                continue;
            }

            if (key.startsWith('$')) {
                // Constructor-registered beans (`$name` holds the constructor);
                // destroyValue resolves the instance from the scope.
                names.add(key.slice(1));
            } else if (this.hasInstance(key)) {
                // Plain-instance entries (`@entry` results and `setValue`
                // values). Only lifecycle-bearing values are torn down —
                // internal state fields and container references (`root` may
                // point at an ancestor context) never qualify.
                const value = this[key];
                if (!(value instanceof GenericApplicationContext) && (likeDestroyable(value) || likeCloseable(value))) {
                    names.add(key);
                }
            }
        }

        for (const name of names) {
            if (!name) continue;
            // CTX-06: one bean's destroy failure must not strand the rest of
            // the managed values — isolate and report each.
            try {
                this.destroyValue(name);
            } catch (error) {
                this.#reportTeardownError(error);
            }
        }
    }

    protected _finishFactoryInitialization(): void {
        for (const key of ownKeys(this)) {
            if (typeof key !== 'string' || !key.startsWith('$')) {
                continue;
            }

            const name = key.slice(1);

            // FACTORY-12: only eagerly instantiate scopes that support it —
            // hash/route scopes have no active key at refresh (getValue would
            // throw) and prototype beans would be created then discarded.
            // Singleton/refresh/custom scopes stay eager (AD-29 D-2).
            if (name && this.hasValue(name) && this.shouldEagerlyInstantiate(name)) {
                this.getValue(name);
            }
        }
    }

    protected _onRefresh(): void {}

    protected _postProcessFactory(): void {}

    protected _prepareFactory(): void {
        const hasAwareProcessor = this.processors.some(
            (processor) => processor instanceof ApplicationContextAwareProcessor
        );

        if (!hasAwareProcessor) {
            this.addProcessor(new ApplicationContextAwareProcessor(this));
        }
    }

    protected _invokeRegistryProcessors(): void {
        const { processors } = this;
        const length = processors.length;

        for (let index = 0; index < length; index++) {
            const processor = processors[index];

            if (likeEntryRegistryProcessor(processor)) {
                processor.processEntryRegistry(this);
            }
        }
    }

    private _resolveRoot(): ApplicationContext {
        // eslint-disable-next-line no-this-alias -- cursor walks the parent chain; not a scope-escape alias
        let root: ApplicationContext = this;

        while (root.parent) {
            root = root.parent;
        }

        return root;
    }
}
