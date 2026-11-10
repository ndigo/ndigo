/**
 * `<nd-a2ui-surface>` — renders A2UI 1.0 messages with the ndigo-ui elements
 * the application installed.
 *
 * Protocol handling (message validation, surface/data models, node resolution)
 * comes from `@a2ui/web_core`. This element owns only the DOM projection: the
 * component allowlist (the generated map, filtered to elements the app
 * actually defines) and the props/children/actions mapping onto custom
 * elements. Unknown types report `nd-a2ui-error` instead of rendering.
 */
import {
    Catalog,
    effect,
    getValue,
    isComponentNode,
    MessageProcessor,
    NodeResolver,
    SpecVersion,
} from '@a2ui/web_core';
import type {
    Catalog as CatalogType,
    ComponentApi,
    ComponentNode,
    FunctionImplementation,
    ProcessableMessagePayload,
} from '@a2ui/web_core';
import { defineElement, NdElement } from '@/lib/base-element';
import { COMPONENT_ELEMENTS } from './component-map';

type A2uiNode = ComponentNode;

const CATALOG_ID = 'ndigo-ui';

/**
 * The A2UI surface element.
 */
export class NdA2uiSurface extends NdElement {
    #messages: ProcessableMessagePayload | undefined;
    #processor: MessageProcessor | undefined;
    #resolvers: NodeResolver[] = [];
    #stop: Array<() => void> = [];

    /** The A2UI messages to render (an array, a single message, or a wrapper). */
    set messages(value: ProcessableMessagePayload) {
        this.#messages = value;
        if (this.isConnected) this.#apply();
    }

    get messages(): ProcessableMessagePayload | undefined {
        return this.#messages;
    }

    protected onConnect(): void {
        if (this.getAttribute('role') === null) this.setAttribute('role', 'region');
        if (this.getAttribute('aria-live') === null) this.setAttribute('aria-live', 'polite');
        if (this.#messages !== undefined) this.#apply();
    }

    protected onDisconnect(): void {
        this.#teardown();
    }

    #apply(): void {
        this.#teardown();
        const catalog = this.#catalog();
        if (catalog === undefined) {
            this.#fail('no installed ndigo-ui components define an A2UI element');
            return;
        }
        try {
            const processor = new MessageProcessor([catalog], undefined, { version: SpecVersion.V1_0 });
            processor.processMessages(this.#messages as ProcessableMessagePayload);
            const surfaces = [...processor.model.surfacesMap.values()];
            if (surfaces.length === 0) {
                processor.dispose();
                this.#fail('the A2UI messages did not create a surface');
                return;
            }
            for (const surface of surfaces) {
                const resolver = new NodeResolver(surface);
                this.#resolvers.push(resolver);
                const section = this.ownerDocument.createElement('div');
                section.setAttribute('data-a2ui-surface-id', surface.id);
                section.setAttribute('tabindex', '-1');
                section.setAttribute('role', 'region');
                section.setAttribute('aria-live', 'polite');
                const stop = effect(() => {
                    const root = getValue(resolver.rootNode);
                    const activeElement = this.ownerDocument.activeElement;
                    section.replaceChildren(
                        root === undefined ? this.ownerDocument.createTextNode('') : this.#renderNode(root)
                    );
                    if (activeElement instanceof HTMLElement && activeElement.id.length > 0) {
                        const focused = section.querySelector<HTMLElement>(`[data-a2ui-id="${activeElement.id}"]`);
                        focused?.focus();
                    }
                });
                this.#stop.push(stop);
                this.append(section);
            }
            this.#processor = processor;
        } catch (error) {
            this.#fail(error instanceof Error ? error.message : String(error));
        }
    }

    #teardown(): void {
        for (const stop of this.#stop) {
            try {
                stop();
            } catch {
                // An effect can be disposed again — harmless.
            }
        }
        this.#stop = [];
        for (const resolver of this.#resolvers) {
            try {
                resolver.dispose();
            } catch {
                // A resolver can be disposed again — harmless.
            }
        }
        this.#resolvers = [];
        this.#processor?.dispose();
        this.#processor = undefined;
    }

    #catalog(): CatalogType<ComponentApi, FunctionImplementation> | undefined {
        const components: Record<string, unknown> = {};
        for (const [name, tag] of Object.entries(COMPONENT_ELEMENTS)) {
            if (customElements.get(tag) === undefined) continue;
            components[name] = {
                type: 'object',
                description: `${name} — rendered as <${tag}>.`,
                properties: {
                    component: { const: name },
                    id: { type: 'string' },
                },
                required: ['component', 'id'],
                additionalProperties: true,
            };
        }
        if (Object.keys(components).length === 0) return undefined;
        // `fromJson` types its function entries as `FunctionApi`; this catalog
        // defines components only, so the executable-function view is exact.
        return Catalog.fromJson(
            {
                catalogId: CATALOG_ID,
                protocolVersion: '1.0',
                components,
                $defs: {
                    anyComponent: {
                        oneOf: Object.keys(components).map((name) => ({ $ref: `#/components/${name}` })),
                        discriminator: { propertyName: 'component' },
                    },
                },
            },
            SpecVersion.V1_0
        ) as unknown as CatalogType<ComponentApi, FunctionImplementation>;
    }

    #renderNode(node: A2uiNode): Node {
        const tag = COMPONENT_ELEMENTS[node.type];
        if (tag === undefined || customElements.get(tag) === undefined) {
            this.#fail(`unknown or uninstalled A2UI component '${node.type}'`);
            return this.ownerDocument.createComment(`unknown component ${node.type}`);
        }
        const element = this.ownerDocument.createElement(tag);
        element.setAttribute('data-a2ui-id', node.componentId);
        for (const [key, value] of Object.entries(getValue(node.props))) {
            if (key === 'component' || key === 'id' || key === 'catalogId') continue;
            if (isComponentNode(value)) {
                element.append(this.#renderNode(value as A2uiNode));
                continue;
            }
            if (Array.isArray(value) && value.length > 0 && value.every((item) => isComponentNode(item))) {
                for (const child of value) element.append(this.#renderNode(child as A2uiNode));
                continue;
            }
            if (typeof value === 'function') {
                const action = value as () => void | Promise<void>;
                element.addEventListener(actionEvent(key), () => {
                    void action();
                });
                continue;
            }
            if (value === undefined || value === null || typeof value === 'object') continue;
            if (isSafeA2uiPropKey(key) === false) continue;
            const attribute = camelToKebab(key);
            if (!isSafeAttribute(attribute, value)) continue;
            element.setAttribute(attribute, String(value));
        }
        return element;
    }

    #fail(message: string): void {
        this.setAttribute('data-error', message);
        this.emit('a2ui-error', { message });
    }
}

const URL_ATTRIBUTES: Record<string, true> = {
    href: true,
    src: true,
    action: true,
    formaction: true,
    poster: true,
    'xlink:href': true,
};

const BLOCKED_ATTRIBUTES: Record<string, true> = {
    style: true,
    srcdoc: true,
};

function isSafeA2uiPropKey(key: string): boolean {
    const normalized = key.toLowerCase();
    return (
        normalized !== '__proto__' &&
        normalized !== 'constructor' &&
        normalized !== 'prototype' &&
        !key.startsWith('on')
    );
}

function isSafeAttribute(attribute: string, value: unknown): boolean {
    if (!/^[a-z][a-z0-9-]*$/u.test(attribute)) return false;
    if (attribute.startsWith('on-')) return false;
    if (BLOCKED_ATTRIBUTES[attribute]) return false;
    if (URL_ATTRIBUTES[attribute]) {
        if (typeof value !== 'string') return false;
        try {
            const parsed = new URL(value, 'https://ndigo.invalid');
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    }
    return true;
}

function camelToKebab(value: string): string {
    return value.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function actionEvent(key: string): string {
    if (key === 'action') return 'click';
    return key.startsWith('on') ? key.slice(2).toLowerCase() : key;
}

defineElement('nd-a2ui-surface', NdA2uiSurface);
