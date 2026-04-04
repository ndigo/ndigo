/**
 * @author Jeff Rose
 */
import { IllegalStateError } from '@blue/core';
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel, Unsubscribe } from '@blue/reactive';
import { StaticModel } from '@blue/reactive';
import type { Behavior } from './behavior';

/**
 * Lifecycle phases for a Wicket component.
 */
export enum ComponentPhase {
    /** Component has been constructed but not yet initialized. */
    Created = 'CREATED',
    /** Component has been initialized (onInitialize called). */
    Initialized = 'INITIALIZED',
    /** Component has been configured (onConfigure called). */
    Configured = 'CONFIGURED',
    /** Component is currently rendering. */
    Rendering = 'RENDERING',
    /** Component has completed rendering. */
    Rendered = 'RENDERED',
    /** Component has been detached for cleanup. */
    Detached = 'DETACHED',
    /** Component has been permanently removed. */
    Removed = 'REMOVED',
}

/**
 * Abstract base class for all Wicket-style components.
 *
 * Each component has a unique string id (within its parent), an optional
 * reactive model, a list of behaviors, and lifecycle hooks that mirror
 * the Apache Wicket request cycle.
 *
 * @typeParam T - The type of the component's model object.
 */
export abstract class WicketComponent<T = unknown> {
    #id: string;
    #model: ReadableModel<T>;
    #behaviors: Behavior[] = [];
    #phase: ComponentPhase = ComponentPhase.Created;
    #parent: WicketComponent | null = null;
    #visible = true;
    #enabled = true;
    #modelSubscription: Unsubscribe | null = null;

    get [Symbol.toStringTag](): string {
        return 'WicketComponent';
    }

    /**
     * The unique identifier of this component within its parent container.
     */
    get id(): string {
        return this.#id;
    }

    /**
     * The reactive model backing this component.
     */
    get model(): ReadableModel<T> {
        return this.#model;
    }

    /**
     * Replaces the model for this component. Disposes any existing
     * model subscription before attaching the new one.
     */
    set model(model: ReadableModel<T>) {
        this.#disposeModelSubscription();
        this.#model = model;
    }

    /**
     * The current lifecycle phase of this component.
     */
    get phase(): ComponentPhase {
        return this.#phase;
    }

    /**
     * The parent component, or `null` if this is a root component.
     */
    get parent(): WicketComponent | null {
        return this.#parent;
    }

    /**
     * Sets the parent of this component. Used internally by containers.
     */
    set parent(parent: WicketComponent | null) {
        this.#parent = parent;
    }

    /**
     * Whether this component is visible. Invisible components are
     * skipped during rendering.
     */
    get visible(): boolean {
        return this.#visible;
    }

    set visible(value: boolean) {
        this.#visible = value;
    }

    /**
     * Whether this component is enabled. Disabled components render
     * but may suppress user interaction.
     */
    get enabled(): boolean {
        return this.#enabled;
    }

    set enabled(value: boolean) {
        this.#enabled = value;
    }

    /**
     * The read-only list of behaviors attached to this component.
     */
    get behaviors(): readonly Behavior[] {
        return this.#behaviors;
    }

    /**
     * Creates a new component with the given id and optional model.
     *
     * @param id - The component identifier (unique within its parent).
     * @param model - An optional reactive model. Defaults to a `StaticModel`
     *   wrapping `undefined`.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        this.#id = id;
        this.#model = model ?? new StaticModel<T>(undefined as T);
    }

    /**
     * Returns the hierarchical path of this component from the root,
     * using `:` as the separator (e.g., `page:panel:label`).
     */
    getPath(): string {
        if (!this.#parent) {
            return this.#id;
        }
        return `${this.#parent.getPath()}:${this.#id}`;
    }

    /**
     * Adds a behavior to this component. Calls `behavior.bind(this)` if defined.
     *
     * @param behavior - The behavior to attach.
     * @returns This component, for chaining.
     */
    addBehavior(behavior: Behavior): this {
        this.#behaviors.push(behavior);
        behavior.bind?.(this);
        return this;
    }

    /**
     * Removes a behavior from this component. Calls `behavior.unbind(this)` if defined.
     *
     * @param behavior - The behavior to remove.
     * @returns `true` if the behavior was found and removed.
     */
    removeBehavior(behavior: Behavior): boolean {
        const index = this.#behaviors.indexOf(behavior);
        if (index === -1) {
            return false;
        }
        this.#behaviors.splice(index, 1);
        behavior.unbind?.(this);
        return true;
    }

    // ── Lifecycle ──────────────────────────────────────────────

    /**
     * Initializes the component. Called once when the component is first
     * added to a hierarchy. Subclasses should override `onInitialize()`.
     *
     * @throws {IllegalStateError} If the component has already been initialized.
     */
    initialize(): void {
        if (this.#phase !== ComponentPhase.Created) {
            throw new IllegalStateError(`Cannot initialize component "${this.#id}": current phase is ${this.#phase}.`);
        }
        this.onInitialize();
        this.#phase = ComponentPhase.Initialized;
    }

    /**
     * Runs the configure step. Called before each render pass.
     * Subclasses should override `onConfigure()`.
     */
    configure(): void {
        this.onConfigure();
        this.#phase = ComponentPhase.Configured;
    }

    /**
     * Runs the full render lifecycle: beforeRender → render → afterRender.
     * Skips rendering if the component is not visible.
     *
     * @param dom - The DOM provider used for element creation and parsing.
     * @param container - The parent DOM element to render into.
     */
    renderComponent(dom: DOMProvider, container: Element | DocumentFragment): void {
        if (!this.#visible) {
            return;
        }

        this.#phase = ComponentPhase.Rendering;

        for (const behavior of this.#behaviors) {
            behavior.beforeRender?.(this);
        }

        this.onBeforeRender();
        this.render(dom, container);
        this.onAfterRender();

        for (const behavior of this.#behaviors) {
            behavior.afterRender?.(this);
        }

        this.#phase = ComponentPhase.Rendered;
    }

    /**
     * Detaches the component after a render cycle, releasing transient
     * resources. Subclasses should override `onDetach()`.
     */
    detach(): void {
        for (const behavior of this.#behaviors) {
            behavior.detach?.(this);
        }
        this.onDetach();
        this.#phase = ComponentPhase.Detached;
    }

    /**
     * Permanently removes this component from its parent and releases
     * all resources. After removal the component should not be reused.
     */
    remove(): void {
        this.#disposeModelSubscription();
        for (const behavior of [...this.#behaviors]) {
            this.removeBehavior(behavior);
        }
        this.onRemove();
        this.#parent = null;
        this.#phase = ComponentPhase.Removed;
    }

    // ── Lifecycle hooks (override in subclasses) ──────────────

    /** Called once when the component is first initialized. */
    protected onInitialize(): void {
        // no-op
    }

    /** Called before each render pass to configure the component. */
    protected onConfigure(): void {
        // no-op
    }

    /** Called immediately before rendering. */
    protected onBeforeRender(): void {
        // no-op
    }

    /** Called immediately after rendering. */
    protected onAfterRender(): void {
        // no-op
    }

    /** Called after the render cycle to release transient resources. */
    protected onDetach(): void {
        // no-op
    }

    /** Called when the component is permanently removed. */
    protected onRemove(): void {
        // no-op
    }

    /**
     * Renders this component into the given container.
     * Subclasses must implement this method.
     *
     * @param dom - The DOM provider.
     * @param container - The parent DOM element to render into.
     */
    protected abstract render(dom: DOMProvider, container: Element | DocumentFragment): void;

    // ── Private helpers ──────────────────────────────────────

    #disposeModelSubscription(): void {
        if (this.#modelSubscription) {
            this.#modelSubscription();
            this.#modelSubscription = null;
        }
    }
}
