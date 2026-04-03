/**
 * @author Jeff Rose
 */
import { IllegalStateError } from '@blue/core';
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { ComponentPhase, WicketComponent } from './component';
import type { CompiledTemplate } from './template-compiler';
import { TemplateCompiler } from './template-compiler';

/**
 * A component that can contain child components and owns an HTML template.
 *
 * Children are stored in insertion-order via a `Map<string, WicketComponent>`.
 * During rendering, the container compiles its template, resolves `data-w-id`
 * binding slots, and delegates to each child's `renderComponent()`.
 *
 * @typeParam T - The type of the container's model object.
 */
export class WicketContainer<T = unknown> extends WicketComponent<T> {
    #children: Map<string, WicketComponent> = new Map();
    #template: string | null = null;

    get [Symbol.toStringTag](): string {
        return 'WicketContainer';
    }

    /**
     * The HTML template string for this container. Subclasses may set
     * this via the `static template` property, `static templatePath`,
     * or by direct assignment.
     */
    get template(): string | null {
        return this.#template;
    }

    set template(value: string | null) {
        this.#template = value;
    }

    /**
     * The read-only map of child components keyed by id.
     */
    get children(): ReadonlyMap<string, WicketComponent> {
        return this.#children;
    }

    /**
     * Creates a new container with the given id and optional model.
     *
     * @param id - The component identifier.
     * @param model - An optional reactive model.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    /**
     * Adds a child component to this container.
     *
     * @param child - The component to add.
     * @returns This container, for chaining.
     * @throws {IllegalStateError} If a child with the same id already exists.
     */
    addChild(child: WicketComponent): this {
        if (this.#children.has(child.id)) {
            throw new IllegalStateError(`Container "${this.id}" already has a child with id "${child.id}".`);
        }
        child.parent = this;
        this.#children.set(child.id, child);

        // If the container is already initialized, initialize the child immediately
        if (this.phase !== ComponentPhase.Created) {
            child.initialize();
        }

        return this;
    }

    /**
     * Removes a child component from this container.
     *
     * @param childOrId - The child component or its id.
     * @returns The removed component, or `null` if not found.
     */
    removeChild(childOrId: WicketComponent | string): WicketComponent | null {
        const id = typeof childOrId === 'string' ? childOrId : childOrId.id;
        const child = this.#children.get(id) ?? null;
        if (child) {
            this.#children.delete(id);
            child.remove();
        }
        return child;
    }

    /**
     * Returns the child component with the given id, or `null`.
     *
     * @param id - The child component id.
     */
    getChild(id: string): WicketComponent | null {
        return this.#children.get(id) ?? null;
    }

    /**
     * Recursively searches this container and its descendants for
     * a component matching the given path (colon-separated ids).
     *
     * @param path - A colon-separated path relative to this container
     *   (e.g., `'panel:label'`).
     * @returns The matching component, or `null`.
     */
    findChild(path: string): WicketComponent | null {
        const segments = path.split(':');
        let current: WicketComponent | null = this;

        for (const segment of segments) {
            if (!(current instanceof WicketContainer)) {
                return null;
            }
            current = current.getChild(segment);
            if (!current) {
                return null;
            }
        }

        return current;
    }

    /**
     * Initializes this container and all of its children.
     */
    initialize(): void {
        super.initialize();
        for (const child of this.#children.values()) {
            child.initialize();
        }
    }

    /**
     * Configures this container and all of its children.
     */
    configure(): void {
        super.configure();
        for (const child of this.#children.values()) {
            child.configure();
        }
    }

    /**
     * Detaches this container and all of its children.
     */
    detach(): void {
        for (const child of this.#children.values()) {
            child.detach();
        }
        super.detach();
    }

    /**
     * Removes this container and all of its children permanently.
     */
    remove(): void {
        for (const child of [...this.#children.values()]) {
            this.removeChild(child);
        }
        super.remove();
    }

    /**
     * Renders this container by compiling its template and rendering
     * children into their corresponding `data-w-id` slots.
     *
     * @param dom - The DOM provider.
     * @param container - The parent DOM element to render into.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        if (!this.#template) {
            // No template — render children directly into the container
            for (const child of this.#children.values()) {
                child.renderComponent(dom, container);
            }
            return;
        }

        const compiler = new TemplateCompiler(dom);
        const compiled: CompiledTemplate = compiler.compile(this.#template);

        // Render each child into its binding slot
        for (const child of this.#children.values()) {
            const slot = compiled.slots.get(child.id);
            if (slot) {
                child.renderComponent(dom, slot.element);
            }
        }

        container.appendChild(compiled.root);
    }
}
