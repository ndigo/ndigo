import { JSONObject, direct, escalate } from '@blue/core';
import { ContentSource, StaticContentSource, Theme, ThemeResolver, StaticThemeResolver } from '@blue/content';
import { AsEventEmitter, EventType } from './event-emitter';
import {
    DefaultLifecycleProcessor,
    LifecycleProcessor,
    likeEntryRegistryProcessor,
    DefaultFactory,
    Factory,
} from '@blue/factory';
import { Environment, StandardEnvironment, ConfigurableEnvironment } from './environment';
import { AsModuleResourceLoader } from './resource';
import { ApplicationContext } from './context-interfaces';
import { defineProperty, ownKeys } from './context-shared';
import { ApplicationContextAwareProcessor } from './application-context-aware-processor';

let uuid = 0;

/**
 * Default application context implementation used throughout the package.
 */
export class GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory)) {
    #children: GenericApplicationContext[];
    #contentSource: ContentSource;
    #customThemeResolver: boolean;
    #environment: Environment | null;
    #id!: number;
    #isActive: boolean;
    #lifecycleProcessor: LifecycleProcessor | null;
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
        }
        return this.#environment;
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
    broadcast(type: EventType, ...data: any[]): void {
        direct<ApplicationContext>(
            this as unknown as ApplicationContext,
            (targetContext) => targetContext.emit(type, ...data),
            true
        );
    }

    /**
     * Emits an event to parent contexts.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     */
    bubble(type: EventType, ...data: any[]): void {
        escalate<ApplicationContext>(this, (parentContext) => parentContext.emit(type, ...data), true);
    }

    /**
     * Closes the context and all descendants.
     */
    close(): void {
        if (this.destroyed) {
            return;
        }

        this.emit('context:close', this);

        // eslint-disable-next-line unicorn/no-useless-spread -- snapshot is required: child.close() splices this.#children via removeChild during iteration
        for (const child of [...this.#children]) {
            child.close();
        }

        this.#lifecycleProcessor?.onClose(this);
        this._destroyValues();

        if (this.parent instanceof GenericApplicationContext) {
            this.parent.removeChild(this);
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
        this.emit('context:destroy', this);

        for (const eventType of this.eventTypes()) {
            const listeners = this.listeners(eventType);
            for (const listener of listeners) {
                this.off(eventType, listener);
            }
        }
    }

    /**
     * Releases this context's resources.
     */
    destroy(): void {
        this.close();
    }

    /**
     * Resolves content locally and then delegates to the parent if needed.
     *
     * @param key - The content key.
     * @param language - The language identifier.
     * @returns The resolved content.
     */
    getContent(key: string, language: string): string {
        const value = this.#contentSource?.getContent(key, language);

        if (value !== key || !this.parent) {
            return value;
        }

        return this.parent.getContent(key, language);
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
     * Replaces the environment used by this context.
     */
    setEnvironment(environment: ConfigurableEnvironment): void {
        this.#environment = environment;
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
        const constructorKeys: string[] = [];

        for (const key of ownKeys(this)) {
            if (typeof key !== 'string') {
                continue;
            }

            if (key.startsWith('$')) {
                constructorKeys.push(key.slice(1));
            }
        }

        for (const key of constructorKeys) {
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: destroy only truthy keys
            key && this.destroyValue(key);
        }
    }

    protected _finishFactoryInitialization(): void {
        for (const key of ownKeys(this)) {
            if (typeof key !== 'string' || !key.startsWith('$')) {
                continue;
            }

            const name = key.slice(1);

            if (name && this.hasValue(name)) {
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
