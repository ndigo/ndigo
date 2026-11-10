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
    #resolver: NodeResolver | undefined;
    #stop: (() => void) | undefined;

    /** The A2UI messages to render (an array, a single message, or a wrapper). */
    set messages(value: ProcessableMessagePayload) {
        this.#messages = value;
        if (this.isConnected) this.#apply();
    }

    get messages(): ProcessableMessagePayload | undefined {
        return this.#messages;
    }

    protected onConnect(): void {
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
            const surface = [...processor.model.surfacesMap.values()][0];
            if (surface === undefined) {
                processor.dispose();
                this.#fail('the A2UI messages did not create a surface');
                return;
            }
            const resolver = new NodeResolver(surface);
            this.#processor = processor;
            this.#resolver = resolver;
            this.#stop = effect(() => {
                const root = getValue(resolver.rootNode);
                this.replaceChildren(
                    root === undefined ? this.ownerDocument.createTextNode('') : this.#renderNode(root)
                );
            });
        } catch (error) {
            this.#fail(error instanceof Error ? error.message : String(error));
        }
    }

    #teardown(): void {
        this.#stop?.();
        this.#stop = undefined;
        this.#resolver?.dispose();
        this.#resolver = undefined;
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
            const attribute = camelToKebab(key);
            element.setAttribute(attribute, String(value));
            if (attribute in element) {
                (element as unknown as Record<string, unknown>)[key] = value;
            }
        }
        return element;
    }

    #fail(message: string): void {
        this.setAttribute('data-error', message);
        this.emit('a2ui-error', { message });
    }
}

function camelToKebab(value: string): string {
    return value.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function actionEvent(key: string): string {
    if (key === 'action') return 'click';
    return key.startsWith('on') ? key.slice(2).toLowerCase() : key;
}

defineElement('nd-a2ui-surface', NdA2uiSurface);
